import {
  Button,
  Card,
  CardDescription,
  CardTitle,
  Eyebrow,
} from '@/components/ui'

type HouseholdAvatarDialogProps = {
  isUploading: boolean
  open: boolean
  previewUrl: string | null
  onApply: () => Promise<void>
  onOpenChange: (open: boolean) => void
  onCancel: () => void
}

export const HouseholdAvatarDialog = ({
  isUploading,
  onApply,
  onCancel,
  onOpenChange,
  open,
  previewUrl,
}: HouseholdAvatarDialogProps) => {
  if (!open) {
    return null
  }

  const handleDismiss = () => {
    if (isUploading) {
      return
    }

    onOpenChange(false)
    onCancel()
  }

  return (
    <div
      aria-modal='true'
      className='fixed inset-0 z-40 flex items-center justify-center p-4 pt-[calc(24px+var(--tma-safe-top))] pb-[calc(24px+var(--tma-safe-bottom))]'
      role='dialog'>
      <button
        aria-label='Đóng xem trước avatar'
        className='absolute inset-0 bg-tma-text-strong/30'
        type='button'
        onClick={handleDismiss}
      />

      <Card className='relative z-10 grid w-[min(100%,360px)] gap-4 bg-white/95 shadow-[0_24px_48px_rgba(17,24,39,0.18)]'>
        <div>
          <Eyebrow>Xem trước avatar</Eyebrow>
          <CardTitle>Áp dụng ảnh cho household</CardTitle>
          <CardDescription>
            Ảnh sẽ được cắt vuông và cập nhật ngay sau khi bạn xác nhận.
          </CardDescription>
        </div>

        {previewUrl ? (
          <img
            alt='Xem trước avatar household'
            className='aspect-square w-full rounded-3xl bg-black/[0.04] object-cover'
            src={previewUrl}
          />
        ) : null}

        <div className='flex justify-end gap-2.5'>
          <Button
            disabled={isUploading}
            variant='ghost'
            onClick={handleDismiss}>
            Hủy
          </Button>

          <Button
            disabled={isUploading}
            variant='secondary'
            onClick={() => void onApply()}>
            {isUploading ? 'Đang tải ảnh...' : 'Áp dụng avatar'}
          </Button>
        </div>
      </Card>
    </div>
  )
}
