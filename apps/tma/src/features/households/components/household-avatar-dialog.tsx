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
    <div aria-modal='true' className='tma-dialog' role='dialog'>
      <button
        aria-label='Đóng xem trước avatar'
        className='tma-dialog__backdrop'
        type='button'
        onClick={handleDismiss}
      />

      <div className='tma-dialog__surface'>
        <div className='tma-dialog__header'>
          <div>
            <p className='tma-section-label'>Xem trước avatar</p>
            <h2 className='tma-dialog__title'>Áp dụng ảnh cho household</h2>
            <p className='tma-dialog__copy'>
              Ảnh sẽ được cắt vuông và cập nhật ngay sau khi bạn xác nhận.
            </p>
          </div>
        </div>

        {previewUrl ? (
          <img
            alt='Xem trước avatar household'
            className='tma-dialog__preview'
            src={previewUrl}
          />
        ) : null}

        <div className='tma-dialog__actions'>
          <button
            className='tma-action-button tma-action-button--ghost'
            disabled={isUploading}
            type='button'
            onClick={handleDismiss}>
            Hủy
          </button>

          <button
            className='tma-action-button tma-action-button--primary'
            disabled={isUploading}
            type='button'
            onClick={() => void onApply()}>
            {isUploading ? 'Đang tải ảnh...' : 'Áp dụng avatar'}
          </button>
        </div>
      </div>
    </div>
  )
}
