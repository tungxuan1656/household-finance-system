import { useTranslation } from 'react-i18next'

import { TmaHapticButton } from '@/components/shared/tma-haptic-button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

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
  const { t } = useTranslation()
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
        aria-label={t('households.avatarDialog.closePreview')}
        className='absolute inset-0 bg-foreground/30'
        type='button'
        onClick={handleDismiss}
      />

      <Card className='relative z-10 w-[min(100%,360px)]'>
        <CardHeader>
          <CardDescription>
            {t('households.avatarDialog.previewEyebrow')}
          </CardDescription>
          <CardTitle>{t('households.avatarDialog.applyTitle')}</CardTitle>
          <CardDescription>
            {t('households.avatarDialog.applyDesc')}
          </CardDescription>
        </CardHeader>

        {previewUrl ? (
          <CardContent>
            <img
              alt={t('households.avatarDialog.previewAlt')}
              className='aspect-square w-full object-cover'
              src={previewUrl}
            />
          </CardContent>
        ) : null}

        <CardContent className='flex justify-end gap-2.5'>
          <TmaHapticButton
            aria-busy={isUploading}
            disabled={isUploading}
            variant='ghost'
            onClick={handleDismiss}>
            {t('common.cancel')}
          </TmaHapticButton>

          <TmaHapticButton
            aria-busy={isUploading}
            disabled={isUploading}
            variant='secondary'
            onClick={() => void onApply()}>
            {isUploading
              ? t('households.avatarDialog.uploading')
              : t('households.avatarDialog.applyAction')}
          </TmaHapticButton>
        </CardContent>
      </Card>
    </div>
  )
}
