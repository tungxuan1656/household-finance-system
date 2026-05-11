'use client'

import { CameraIcon } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'

import { ApiClientError } from '@/api/client'
import { ProfileAvatarDialog } from '@/components/profile/profile-avatar-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { FieldError } from '@/components/ui/field'
import { t } from '@/lib/i18n/t'
import {
  isAvatarImageFile,
  prepareSquareAvatarImage,
} from '@/lib/images/avatar-image'
import { uploadMediaViaCloudinary } from '@/lib/media/cloudinary-upload'

const MAX_AVATAR_SIZE_BYTES = 8 * 1024 * 1024

const getAvatarFallback = (
  displayName: string | null,
  email: string | null,
) => {
  const source = displayName?.trim() || email?.trim() || 'U'

  return source.slice(0, 2).toUpperCase()
}

type ProfileAvatarSectionProps = {
  avatarUrl: string | null
  displayName: string | null
  email: string | null
  isBusy: boolean
  onAvatarUploaded: (avatarUrl: string) => Promise<void>
}

export const ProfileAvatarSection = ({
  avatarUrl,
  displayName,
  email,
  isBusy,
  onAvatarUploaded,
}: ProfileAvatarSectionProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false)
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)

  const currentAvatarSrc = useMemo(() => {
    if (avatarDialogOpen && avatarPreviewUrl) {
      return avatarPreviewUrl
    }

    return avatarUrl ?? undefined
  }, [avatarDialogOpen, avatarPreviewUrl, avatarUrl])

  const clearAvatarCandidate = () => {
    if (avatarPreviewUrl) {
      URL.revokeObjectURL(avatarPreviewUrl)
    }

    setAvatarDialogOpen(false)
    setAvatarError(null)
    setAvatarFile(null)
    setAvatarPreviewUrl(null)

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleAvatarFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.currentTarget.files?.[0]

    if (!file) {
      return
    }

    if (!isAvatarImageFile(file)) {
      setAvatarError(t('app.settings.profile.errors.avatarInvalidType'))

      return
    }

    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      setAvatarError(t('app.settings.profile.errors.avatarTooLarge'))

      return
    }

    if (avatarPreviewUrl) {
      URL.revokeObjectURL(avatarPreviewUrl)
    }

    setAvatarError(null)
    setAvatarFile(file)
    setAvatarPreviewUrl(URL.createObjectURL(file))
    setAvatarDialogOpen(true)
  }

  const handleAvatarUpload = async () => {
    if (!avatarFile) {
      return
    }

    try {
      setAvatarError(null)
      setIsUploadingAvatar(true)

      const preparedAvatar = await prepareSquareAvatarImage({
        file: avatarFile,
      })

      const uploadedAsset = await uploadMediaViaCloudinary({
        file: preparedAvatar.blob,
        signatureRequest: {
          feature: 'profile-avatar',
          mimeType: preparedAvatar.blob.type,
          resourceType: 'image',
          sizeBytes: preparedAvatar.blob.size,
        },
      })

      await onAvatarUploaded(uploadedAsset.secureUrl)
      clearAvatarCandidate()
    } catch (error) {
      const message =
        error instanceof ApiClientError
          ? error.message
          : t('app.settings.profile.errors.avatarUploadFailed')

      setAvatarError(message)
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  return (
    <>
      <div className='flex flex-col items-center gap-4 text-center'>
        <Avatar className='size-24!' size='lg'>
          <AvatarImage src={currentAvatarSrc} />
          <AvatarFallback className='text-2xl'>
            {getAvatarFallback(displayName, email)}
          </AvatarFallback>
        </Avatar>

        <div className='flex flex-col items-center gap-3'>
          <Button
            className='min-h-11'
            disabled={isBusy || isUploadingAvatar}
            type='button'
            variant='outline'
            onClick={() => fileInputRef.current?.click()}>
            <CameraIcon data-icon='inline-start' />
            {t('app.settings.profile.actions.changeAvatar')}
          </Button>
          <p className='text-sm text-muted-foreground'>
            {t('app.settings.profile.avatarHelpText')}
          </p>
          {avatarError ? <FieldError>{avatarError}</FieldError> : null}
          <input
            ref={fileInputRef}
            accept='image/*'
            className='hidden'
            disabled={isBusy || isUploadingAvatar}
            type='file'
            onChange={handleAvatarFileChange}
          />
        </div>
      </div>

      <ProfileAvatarDialog
        isUploading={isUploadingAvatar}
        open={avatarDialogOpen}
        previewUrl={avatarPreviewUrl}
        onApply={handleAvatarUpload}
        onCancel={clearAvatarCandidate}
        onOpenChange={setAvatarDialogOpen}
      />
    </>
  )
}
