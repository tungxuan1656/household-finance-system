import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'

import { TmaPageShell } from '@/components/shared/tma-page-shell'
import {
  Avatar,
  Button,
  Card,
  CardDescription,
  CardTitle,
  DataState,
  Field,
  FieldLabel,
  Input,
  Section,
  SectionHeader,
} from '@/components/ui'
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
  const isHouseholdMissing =
    !householdQuery.isLoading && !householdQuery.isError && !household

  useEffect(() => {
    if (household) setDraftName(household.name)
  }, [household])

  const memberSummary = useMemo(
    () => formatMemberCountLabel(members.length),
    [members.length],
  )

  const handleAvatarUploaded = async (avatarUrl: string) => {
    if (!id) return

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

    if (!id || !household || !isAdmin) return

    const normalizedName = draftName.trim()
    if (!normalizedName) {
      setFeedback({
        message: 'Tên household không được để trống.',
        tone: 'error',
      })

      return
    }

    try {
      if (normalizedName === household.name) {
        setFeedback({
          message: 'Không có thay đổi mới để lưu.',
          tone: 'success',
        })

        return
      }

      await updateHouseholdMutation.mutateAsync({
        householdId: id,
        payload: { name: normalizedName },
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
        <Card>
          <CardTitle>Household không hợp lệ</CardTitle>
          <CardDescription>
            Đường dẫn hiện tại thiếu mã household để tải chi tiết.
          </CardDescription>
        </Card>
      </TmaPageShell>
    )
  }

  return (
    <TmaPageShell title='Chi tiết gia đình'>
      {feedback ? (
        <Card
          className={
            feedback.tone === 'error'
              ? 'mb-3 border-[#d93838]/20 bg-[#ffeded]/90'
              : 'mb-3 border-tma-positive/20 bg-tma-positive/10'
          }>
          <CardDescription
            className={
              feedback.tone === 'error' ? 'text-[#d93838]' : 'text-[#2f9b44]'
            }>
            {feedback.message}
          </CardDescription>
        </Card>
      ) : null}

      <DataState
        emptyDescription='Household này không còn tồn tại hoặc bạn không có quyền truy cập.'
        emptyTitle='Không tìm thấy household'
        errorDescription='Household này có thể không còn truy cập được, hoặc phiên đăng nhập hiện tại đã hết hạn.'
        errorTitle='Không tải được household'
        isEmpty={isHouseholdMissing}
        isError={householdQuery.isError && !household}
        isLoading={householdQuery.isLoading && !household}
        loadingDescription='Dữ liệu thành viên và chi tiêu sẽ hiện ngay sau khi đồng bộ xong.'
        loadingTitle='Đang tải chi tiết household'
        retryAction={householdQuery.refetch}>
        {household ? (
          <>
            <HouseholdOverviewSection householdId={id} />

            <Card className='mt-3 grid gap-3'>
              <HouseholdAvatarSection
                avatarUrl={household.avatarUrl}
                canEdit={isAdmin}
                helperText='Hỗ trợ ảnh vuông JPEG hoặc PNG, tối đa 8MB. Hệ thống sẽ tự căn giữa ảnh trước khi lưu.'
                householdName={household.name}
                isBusy={isBusy}
                readOnlyMessage='Chỉ quản trị viên mới có thể chỉnh tên và avatar của household.'
                summaryText={`${memberSummary} · ${getHouseholdRoleLabel(household.role)}`}
                title='Cài đặt household'
                onAvatarUploaded={handleAvatarUploaded}
              />

              <form className='grid gap-3.5' onSubmit={handleSave}>
                <Field>
                  <FieldLabel>Tên household</FieldLabel>
                  <Input
                    disabled={!isAdmin || isBusy}
                    placeholder='Nhập tên household'
                    type='text'
                    value={draftName}
                    onChange={(event) => {
                      setDraftName(event.target.value)
                      setFeedback(null)
                    }}
                  />
                </Field>

                {isAdmin ? (
                  <div className='flex justify-end'>
                    <Button disabled={isBusy} type='submit' variant='secondary'>
                      {isBusy ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </Button>
                  </div>
                ) : null}
              </form>
            </Card>

            <HomeRecentExpensesSection
              householdId={id}
              showHouseholdLabel={false}
              title='Chi tiêu gần đây'
            />

            <Section>
              <SectionHeader title='Thành viên' />
              <DataState
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
                <Card className='grid gap-3'>
                  {members.map((member) => (
                    <article
                      key={member.userId}
                      className='flex items-center gap-3'>
                      <Avatar
                        alt={member.name}
                        fallback={getHouseholdAvatarFallback(member.name)}
                        size='sm'
                        src={member.avatarUrl}
                      />
                      <div className='min-w-0 flex-1'>
                        <h3
                          className={
                            member.role === 'admin'
                              ? 'm-0 font-semibold text-[#d3a10c]'
                              : 'm-0 font-semibold text-tma-text-strong'
                          }>
                          {member.name || user?.displayName || 'Thành viên'}
                        </h3>
                        <CardDescription>
                          {getHouseholdRoleLabel(member.role)}
                        </CardDescription>
                      </div>
                    </article>
                  ))}
                </Card>
              </DataState>
            </Section>
          </>
        ) : null}
      </DataState>
    </TmaPageShell>
  )
}
