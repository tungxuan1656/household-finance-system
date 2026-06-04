import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { TmaPageShell } from '@/components/shared/tma-page-shell'
import { getHouseholdDetailPath, TMA_PATHS } from '@/lib/constants/routes'

import { useCreateHouseholdMutation, useUpdateHouseholdMutation } from '../api'
import { HouseholdAvatarSection } from '../components/household-avatar-section'

export const CreateHouseholdPage = () => {
  const navigate = useNavigate()
  const createHouseholdMutation = useCreateHouseholdMutation()
  const updateHouseholdMutation = useUpdateHouseholdMutation()
  const [draftName, setDraftName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{
    message: string
    tone: 'error' | 'success'
  } | null>(null)

  const isBusy =
    createHouseholdMutation.isPending || updateHouseholdMutation.isPending
  const normalizedName = draftName.trim()

  const handleAvatarUploaded = async (uploadedAvatarUrl: string) => {
    setAvatarUrl(uploadedAvatarUrl)

    setFeedback({
      message: 'Ảnh đã sẵn sàng. Household mới sẽ dùng avatar này sau khi tạo.',
      tone: 'success',
    })
  }

  const handleCreateHousehold = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!normalizedName) {
      setFeedback({
        message: 'Tên household không được để trống.',
        tone: 'error',
      })

      return
    }

    if (normalizedName.length > 120) {
      setFeedback({
        message: 'Tên household tối đa 120 ký tự.',
        tone: 'error',
      })

      return
    }

    try {
      const created = await createHouseholdMutation.mutateAsync({
        name: normalizedName,
      })

      if (avatarUrl) {
        try {
          await updateHouseholdMutation.mutateAsync({
            householdId: created.id,
            payload: { avatarUrl },
          })
        } catch (error) {
          setFeedback({
            message:
              error instanceof Error
                ? `Đã tạo household nhưng chưa áp dụng được avatar: ${error.message}`
                : 'Đã tạo household nhưng chưa áp dụng được avatar.',
            tone: 'error',
          })

          navigate(getHouseholdDetailPath(created.id))

          return
        }
      }

      navigate(getHouseholdDetailPath(created.id))
    } catch (error) {
      setFeedback({
        message:
          error instanceof Error
            ? error.message
            : 'Không thể tạo household lúc này.',
        tone: 'error',
      })
    }
  }

  return (
    <TmaPageShell
      showBackButton
      backTo={TMA_PATHS.households}
      title='Tạo household'>
      <section className='tma-hero-card tma-household-hub-card'>
        <div>
          <p className='tma-section-label'>Thiết lập mới</p>
          <strong>Tạo household</strong>
          <p>
            Đặt tên rõ ràng và chuẩn bị avatar ngay từ đầu để household mới dễ
            nhận diện trong TMA.
          </p>
        </div>
      </section>

      {feedback ? (
        <section
          className={`tma-feedback-banner tma-feedback-banner--${feedback.tone}`}>
          <p>{feedback.message}</p>
        </section>
      ) : null}

      <section className='tma-list-card tma-avatar-setup-card'>
        <HouseholdAvatarSection
          canEdit
          avatarUrl={avatarUrl}
          description='Chọn ảnh đại diện trước để household mới có giao diện hoàn chỉnh ngay sau khi tạo.'
          helperText='Flow avatar dùng cùng pattern với web profile-avatar: chọn file, xem trước, áp dụng để upload trước, rồi create page sẽ gắn avatar này vào household vừa tạo.'
          householdName={normalizedName || 'Household mới'}
          isBusy={isBusy}
          summaryText='Avatar này sẽ được áp dụng cho household mới sau khi bạn hoàn tất bước tạo.'
          title='Avatar household'
          onAvatarUploaded={handleAvatarUploaded}
        />
      </section>

      <section className='tma-section'>
        <div className='tma-section__header'>
          <div>
            <p className='tma-section-label'>Thông tin chính</p>
            <h2 className='tma-section__title'>Tên household</h2>
          </div>
        </div>

        <section className='tma-list-card tma-household-form-card'>
          <form className='tma-household-form' onSubmit={handleCreateHousehold}>
            <label className='tma-field-block'>
              <span>Tên household</span>
              <input
                className='tma-text-input'
                disabled={isBusy}
                maxLength={120}
                placeholder='Ví dụ: Nhà Phùng Thịnh'
                type='text'
                value={draftName}
                onChange={(event) => {
                  setDraftName(event.target.value)
                  setFeedback(null)
                }}
              />
            </label>

            <p className='tma-household-form__note'>
              Bạn sẽ trở thành quản trị viên đầu tiên của household này sau khi
              tạo thành công.
            </p>

            <div className='tma-action-row'>
              <button
                className='tma-action-button tma-action-button--ghost'
                disabled={isBusy}
                type='button'
                onClick={() => navigate(TMA_PATHS.households)}>
                Hủy
              </button>

              <button
                className='tma-action-button tma-action-button--primary'
                disabled={isBusy}
                type='submit'>
                {isBusy ? 'Đang tạo...' : 'Tạo household'}
              </button>
            </div>
          </form>
        </section>
      </section>
    </TmaPageShell>
  )
}
