import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'

import { TmaDataState } from '@/components/shared/tma-data-state'
import { TmaPageShell } from '@/components/shared/tma-page-shell'
import { useAuth } from '@/features/auth/auth-provider'
import { HomeRecentExpensesSection } from '@/features/home/components/home-recent-expenses-section'

import {
  useHouseholdDetailQuery,
  useHouseholdMembersQuery,
  useUpdateHouseholdMutation,
} from '../api'
import { HouseholdAvatarSection } from '../components/household-avatar-section'
import { HouseholdOverviewSection } from '../components/household-overview-section'
import {
  formatMemberCountLabel,
  getHouseholdAvatarFallback,
  getHouseholdRoleLabel,
} from '../presentation'

type HouseholdPageFeedback = {
  message: string
  tone: 'error' | 'success'
}

export const HouseholdDetailPage = () => {
  const { user } = useAuth()
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const householdQuery = useHouseholdDetailQuery(id)
  const membersQuery = useHouseholdMembersQuery(id)
  const updateHouseholdMutation = useUpdateHouseholdMutation()
  const [draftName, setDraftName] = useState('')
  const [feedback, setFeedback] = useState<HouseholdPageFeedback | null>(
    () =>
      (location.state as { feedback?: HouseholdPageFeedback } | null)
        ?.feedback ?? null,
  )

  const household = householdQuery.data
  const members = membersQuery.data?.items ?? []
  const isAdmin = household?.role === 'admin'
  const isBusy = updateHouseholdMutation.isPending

  useEffect(() => {
    if (!household) {
      return
    }

    setDraftName(household.name)
  }, [household])

  const memberSummary = useMemo(
    () => formatMemberCountLabel(members.length),
    [members.length],
  )

  const handleAvatarUploaded = async (avatarUrl: string) => {
    if (!id) {
      return
    }

    await updateHouseholdMutation.mutateAsync({
      householdId: id,
      payload: { avatarUrl },
    })

    setFeedback({
      message: 'Đã cập nhật ảnh household thành công.',
      tone: 'success',
    })
  }

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!id || !household || !isAdmin) {
      return
    }

    const payload: {
      avatarUrl?: string | null
      name?: string
    } = {}
    const normalizedName = draftName.trim()

    if (!normalizedName) {
      setFeedback({
        message: 'Tên household không được để trống.',
        tone: 'error',
      })

      return
    }

    if (normalizedName !== household.name) {
      payload.name = normalizedName
    }

    try {
      if (Object.keys(payload).length === 0) {
        setFeedback({
          message: 'Không có thay đổi mới để lưu.',
          tone: 'success',
        })

        return
      }

      await updateHouseholdMutation.mutateAsync({
        householdId: id,
        payload,
      })

      setFeedback({
        message: 'Đã cập nhật household thành công.',
        tone: 'success',
      })
    } catch (error) {
      setFeedback({
        message:
          error instanceof Error
            ? error.message
            : 'Không thể cập nhật household lúc này.',
        tone: 'error',
      })
    }
  }

  if (!id) {
    return (
      <TmaPageShell title='Chi tiết gia đình'>
        <div className='tma-empty-card'>
          <h2>Household không hợp lệ</h2>
          <p>Đường dẫn hiện tại thiếu mã household để tải chi tiết.</p>
        </div>
      </TmaPageShell>
    )
  }

  return (
    <TmaPageShell title='Chi tiết gia đình'>
      {feedback ? (
        <section
          className={`tma-feedback-banner tma-feedback-banner--${feedback.tone}`}>
          <p>{feedback.message}</p>
        </section>
      ) : null}

      <TmaDataState
        errorDescription='Household này có thể không còn truy cập được, hoặc phiên đăng nhập hiện tại đã hết hạn.'
        errorTitle='Không tải được household'
        isError={householdQuery.isError && !household}
        isLoading={householdQuery.isLoading && !household}
        loadingDescription='Dữ liệu thành viên và chi tiêu sẽ hiện ngay sau khi đồng bộ xong.'
        loadingTitle='Đang tải chi tiết household'
        retryAction={householdQuery.refetch}>
        <HouseholdOverviewSection householdId={id} />

        <section className='tma-list-card tma-avatar-setup-card'>
          <HouseholdAvatarSection
            avatarUrl={household!.avatarUrl}
            canEdit={isAdmin}
            helperText='Hỗ trợ ảnh vuông JPEG hoặc PNG, tối đa 8MB. Hệ thống sẽ tự căn giữa ảnh trước khi lưu.'
            householdName={household!.name}
            isBusy={isBusy}
            readOnlyMessage='Chỉ quản trị viên mới có thể chỉnh tên và avatar của household.'
            summaryText={`${memberSummary} • ${getHouseholdRoleLabel(household!.role)}`}
            title='Cài đặt household'
            onAvatarUploaded={handleAvatarUploaded}
          />

          <form className='tma-household-form' onSubmit={handleSave}>
            <label className='tma-field-block'>
              <span>Tên household</span>
              <input
                className='tma-text-input'
                disabled={!isAdmin || isBusy}
                placeholder='Nhập tên household'
                type='text'
                value={draftName}
                onChange={(event) => {
                  setDraftName(event.target.value)
                  setFeedback(null)
                }}
              />
            </label>

            {isAdmin ? (
              <div className='tma-action-row'>
                <button
                  className='tma-action-button tma-action-button--primary'
                  disabled={isBusy}
                  type='submit'>
                  {isBusy ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            ) : (
              <p className='tma-household-form__note'>
                Bạn có thể xem thông tin household và chi tiêu gần đây, nhưng
                chỉ quản trị viên mới được chỉnh sửa.
              </p>
            )}
          </form>
        </section>

        <div className='tma-section' />

        <HomeRecentExpensesSection
          householdId={id}
          showHouseholdLabel={false}
          title='Chi tiêu gần đây'
        />

        <section className='tma-section'>
          <div className='tma-section__header'>
            <div>
              <p className='tma-section-label'>Thành viên</p>
              <h2 className='tma-section__title'>Danh sách hiện tại</h2>
            </div>
          </div>

          <TmaDataState
            emptyDescription='Household này hiện chưa có thành viên nào khả dụng để hiển thị.'
            emptyTitle='Chưa có thành viên'
            errorDescription='Thử mở lại trang hoặc kiểm tra quyền truy cập household.'
            errorTitle='Không tải được thành viên'
            isEmpty={
              !membersQuery.isLoading &&
              !membersQuery.isError &&
              members.length === 0
            }
            isError={membersQuery.isError && members.length === 0}
            isLoading={membersQuery.isLoading && members.length === 0}
            loadingDescription='Danh sách thành viên sẽ hiện khi truy vấn hoàn tất.'
            loadingTitle='Đang tải thành viên'
            retryAction={membersQuery.refetch}>
            <div className='tma-list-card'>
              {members.map((member) => (
                <article key={member.userId} className='tma-member-row'>
                  <div className='tma-household-avatar tma-household-avatar--sm'>
                    {member.avatarUrl ? (
                      <img
                        alt={member.name}
                        className='tma-avatar-image'
                        src={member.avatarUrl}
                      />
                    ) : (
                      <span>{getHouseholdAvatarFallback(member.name)}</span>
                    )}
                  </div>

                  <div className='tma-member-row__body'>
                    <div className='tma-member-row__title'>
                      <h3
                        className={
                          member.role === 'admin'
                            ? 'tma-member-row__name--admin'
                            : undefined
                        }>
                        {member.name || user?.displayName || 'Thành viên'}
                      </h3>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </TmaDataState>
        </section>
      </TmaDataState>
    </TmaPageShell>
  )
}
