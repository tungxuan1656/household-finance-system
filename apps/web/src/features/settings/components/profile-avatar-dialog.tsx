import Image from 'next/image'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { t } from '@/lib/i18n/t'

type ProfileAvatarDialogProps = {
  isUploading: boolean
  open: boolean
  previewUrl: string | null
  onApply: () => Promise<void>
  onOpenChange: (open: boolean) => void
  onCancel: () => void
}

export const ProfileAvatarDialog = ({
  isUploading,
  onApply,
  onCancel,
  onOpenChange,
  open,
  previewUrl,
}: ProfileAvatarDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{t('app.settings.profile.crop.title')}</DialogTitle>
        <DialogDescription>
          {t('app.settings.profile.crop.description')}
        </DialogDescription>
      </DialogHeader>
      {previewUrl ? (
        <Image
          unoptimized
          alt={t('app.settings.profile.crop.previewAlt')}
          className='aspect-square w-full rounded-lg object-cover'
          height={512}
          src={previewUrl}
          width={512}
        />
      ) : null}
      <DialogFooter>
        <Button
          className='min-h-11'
          type='button'
          variant='outline'
          onClick={onCancel}>
          {t('common.actions.cancel')}
        </Button>
        <Button
          className='min-h-11'
          disabled={isUploading}
          type='button'
          onClick={() => void onApply()}>
          {isUploading
            ? t('app.settings.profile.actions.uploadingAvatar')
            : t('app.settings.profile.actions.applyAvatar')}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
)
