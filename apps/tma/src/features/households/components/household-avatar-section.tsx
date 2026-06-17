import { type ChangeEvent, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { CameraIcon } from '@/components/shared/tma-icons'
import {
  Avatar,
  Button,
  CardDescription,
  CardTitle,
  FieldError,
} from '@/components/ui'
import { ApiClientError } from '@/lib/api/client'
import {
  isAvatarImageFile,
  prepareSquareAvatarImage,
} from '@/lib/media/avatar-image'
import { uploadMediaViaCloudinary } from '@/lib/media/cloudinary-upload'
import { MAX_AVATAR_SIZE_BYTES } from '@/lib/media/constants'
import { impact } from '@/lib/telegram/haptics'

import { getHouseholdAvatarFallback } from '../presentation'
import { HouseholdAvatarDialog } from './household-avatar-dialog'

type HouseholdAvatarSectionProps = {
  avatarUrl: string | null
  canEdit: boolean
  description?: string
  helperText: string
  isBusy: boolean
  readOnlyMessage?: string
  summaryText?: string
  title?: string
  householdName: string
  onAvatarUploaded: (avatarUrl: string) => Promise<void>
}

export const HouseholdAvatarSection = ({
  avatarUrl,
  canEdit,
  description,
  helperText,
  householdName,
  isBusy,
  onAvatarUploaded,
  readOnlyMessage: externalReadOnlyMessage,
  summaryText,
  title: externalTitle,
}: HouseholdAvatarSectionProps) => {
  const { t } = useTranslation()
  const readOnlyMessage =
    externalReadOnlyMessage ?? t('households.avatarSection.readOnly')
  const title = externalTitle ?? t('households.avatarSection.title')
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false)
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const currentAvatarSrc = useMemo(
    () =>
      avatarDialogOpen && avatarPreviewUrl
        ? avatarPreviewUrl
        : (avatarUrl ?? undefined),
    [avatarDialogOpen, avatarPreviewUrl, avatarUrl],
  )

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

  const handleAvatarFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0]

    if (!file) {
      return
    }

    if (!isAvatarImageFile(file)) {
      setAvatarError(t('households.avatarSection.invalidFormat'))

      return
    }

    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      setAvatarError(t('households.avatarSection.tooLarge'))

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
          feature: 'household-avatar',
          mimeType: preparedAvatar.blob.type,
          resourceType: 'image',
          sizeBytes: preparedAvatar.blob.size,
        },
      })

      await onAvatarUploaded(uploadedAsset.secureUrl)
      clearAvatarCandidate()
    } catch (error) {
      setAvatarError(
        error instanceof ApiClientError
          ? error.message
          : t('households.avatarSection.uploadError'),
      )
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const displayName =
    householdName.trim() || t('households.createPage.newHousehold')

  return (
    <>
      <div>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </div>

      <div className='flex items-center gap-3.5'>
        <Avatar
          alt={displayName}
          fallback={getHouseholdAvatarFallback(displayName)}
          size='xl'
          src={currentAvatarSrc}
        />

        <div className='grid gap-1.5'>
          <strong className='text-base font-semibold text-tma-text-strong'>
            {displayName}
          </strong>
          {summaryText ? (
            <CardDescription>{summaryText}</CardDescription>
          ) : null}
        </div>
      </div>

      {canEdit ? (
        <div className='flex flex-wrap gap-2.5'>
          <Button
            disabled={isBusy || isUploadingAvatar}
            type='button'
            variant='outline'
            onClick={() => {
              impact('light')
              fileInputRef.current?.click()
            }}>
            <CameraIcon height='14' width='14' />
            <span>
              {avatarUrl
                ? t('households.avatarSection.changeImage')
                : t('households.avatarSection.addImage')}
            </span>
          </Button>

          <input
            ref={fileInputRef}
            accept='image/*'
            className='hidden'
            disabled={isBusy || isUploadingAvatar}
            type='file'
            onChange={handleAvatarFileChange}
          />
        </div>
      ) : (
        <CardDescription>{readOnlyMessage}</CardDescription>
      )}

      <CardDescription>{helperText}</CardDescription>
      {avatarError ? <FieldError>{avatarError}</FieldError> : null}

      <HouseholdAvatarDialog
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
