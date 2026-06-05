import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { TmaPageShell } from '@/components/shared/tma-page-shell'
import {
  Button,
  Card,
  CardDescription,
  CardTitle,
  Eyebrow,
  Field,
  FieldLabel,
  Input,
} from '@/components/ui'
import { getHouseholdDetailPath, TMA_PATHS } from '@/lib/constants/routes'

import { useCreateHouseholdMutation, useUpdateHouseholdMutation } from '../api'
import { HouseholdAvatarSection } from '../components/household-avatar-section'

type HouseholdPageFeedback = {
  message: string
  tone: 'error' | 'success'
}

export const CreateHouseholdPage = () => {
  const navigate = useNavigate()
  const createHouseholdMutation = useCreateHouseholdMutation()
  const updateHouseholdMutation = useUpdateHouseholdMutation()
  const [draftName, setDraftName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<HouseholdPageFeedback | null>(null)
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
        await updateHouseholdMutation.mutateAsync({
          householdId: created.id,
          payload: { avatarUrl },
        })
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
    <TmaPageShell title='Tạo household'>
      <Card className='grid gap-2 p-5'>
        <Eyebrow>Thiết lập mới</Eyebrow>
        <strong className='text-2xl font-extrabold text-tma-text-strong'>
          Tạo household
        </strong>
        <CardDescription>
          Đặt tên rõ ràng và chuẩn bị avatar ngay từ đầu để household mới dễ
          nhận diện trong TMA.
        </CardDescription>
      </Card>

      {feedback ? (
        <Card
          className={
            feedback.tone === 'error'
              ? 'mt-3 border-[#d93838]/20 bg-[#ffeded]/90'
              : 'mt-3 border-tma-positive/20 bg-tma-positive/10'
          }>
          <CardDescription
            className={
              feedback.tone === 'error' ? 'text-[#d93838]' : 'text-[#2f9b44]'
            }>
            {feedback.message}
          </CardDescription>
        </Card>
      ) : null}

      <Card className='mt-3 grid gap-3'>
        <HouseholdAvatarSection
          canEdit
          avatarUrl={avatarUrl}
          description='Chọn ảnh đại diện trước để household mới có giao diện hoàn chỉnh ngay sau khi tạo.'
          helperText='Chọn file, xem trước, áp dụng để upload trước, rồi create page sẽ gắn avatar này vào household vừa tạo.'
          householdName={normalizedName || 'Household mới'}
          isBusy={isBusy}
          summaryText='Avatar này sẽ được áp dụng cho household mới sau khi bạn hoàn tất bước tạo.'
          title='Avatar household'
          onAvatarUploaded={handleAvatarUploaded}
        />
      </Card>

      <section className='mt-6'>
        <div className='mb-3'>
          <Eyebrow>Thông tin chính</Eyebrow>
          <CardTitle>Tên household</CardTitle>
        </div>

        <Card>
          <form className='grid gap-3.5' onSubmit={handleCreateHousehold}>
            <Field>
              <FieldLabel>Tên household</FieldLabel>
              <Input
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
            </Field>

            <CardDescription>
              Bạn sẽ trở thành quản trị viên đầu tiên của household này sau khi
              tạo thành công.
            </CardDescription>

            <div className='flex flex-wrap justify-end gap-2.5'>
              <Button
                disabled={isBusy}
                type='button'
                variant='ghost'
                onClick={() => navigate(TMA_PATHS.households)}>
                Hủy
              </Button>

              <Button disabled={isBusy} type='submit' variant='secondary'>
                {isBusy ? 'Đang tạo...' : 'Tạo household'}
              </Button>
            </div>
          </form>
        </Card>
      </section>
    </TmaPageShell>
  )
}
