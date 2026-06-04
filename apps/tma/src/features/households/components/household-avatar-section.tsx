import { type ChangeEvent, useMemo, useRef, useState } from 'react'

import { CameraIcon } from '@/components/shared/tma-icons'
import { ApiClientError } from '@/lib/api/client'
import {
  isAvatarImageFile,
  prepareSquareAvatarImage,
} from '@/lib/media/avatar-image'
import { uploadMediaViaCloudinary } from '@/lib/media/cloudinary-upload'
import { impact } from '@/lib/telegram/haptics'

import {
  getHouseholdAvatarFallback,
  MAX_AVATAR_SIZE_BYTES,
} from '../presentation'
import { HouseholdAvatarDialog } from './household-avatar-dialog'

type HouseholdAvatarSectionProps = {
  avatarUrl: string | null
  householdName: string
  helperText: string
  isAdmin: boolean
  isBusy: boolean
  memberSummary: string
  roleLabel: string
  onAvatarUploaded: (avatarUrl: string) => Promise<void>
}

export const HouseholdAvatarSection = ({
  avatarUrl,
  helperText,
  householdName,
  isAdmin,
  isBusy,
  memberSummary,
  onAvatarUploaded,
  roleLabel,
}: HouseholdAvatarSectionProps) => {
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
      setAvatarError('Chọn ảnh hợp lệ dạng JPEG, PNG, WEBP hoặc HEIC.')

      return
    }

    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      setAvatarError('Ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 8MB.')

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
          : 'Không thể tải ảnh đại diện lên. Vui lòng thử lại.',
      )
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  return (
    <>
      <div>
        <h2>Cài đặt ảnh đại diện household</h2>
        <p>
          Dùng avatar để mọi người nhận ra household nhanh hơn trong home và
          danh sách household.
        </p>
      </div>

      <div className='tma-avatar-setup-card__preview'>
        <div className='tma-household-avatar tma-household-avatar--xl'>
          {currentAvatarSrc ? (
            <img
              alt={householdName}
              className='tma-avatar-image'
              src={currentAvatarSrc}
            />
          ) : (
            <span>{getHouseholdAvatarFallback(householdName)}</span>
          )}
        </div>

        <div className='tma-avatar-setup-card__copy'>
          <strong>{householdName}</strong>
          <p>
            {memberSummary} • {roleLabel}
          </p>
        </div>
      </div>

      {isAdmin ? (
        <div className='tma-avatar-setup-card__actions'>
          <button
            className='tma-chip-button'
            disabled={isBusy || isUploadingAvatar}
            type='button'
            onClick={() => {
              impact('light')
              fileInputRef.current?.click()
            }}>
            <CameraIcon height='14' width='14' />
            <span>{avatarUrl ? 'Đổi ảnh' : 'Thêm ảnh'}</span>
          </button>

          <input
            ref={fileInputRef}
            accept='image/*'
            className='tma-hidden-input'
            disabled={isBusy || isUploadingAvatar}
            type='file'
            onChange={handleAvatarFileChange}
          />
        </div>
      ) : (
        <p className='tma-avatar-setup-card__help'>
          Chỉ quản trị viên mới có thể chỉnh tên và avatar của household.
        </p>
      )}

      <p className='tma-avatar-setup-card__help'>{helperText}</p>
      {avatarError ? <p className='tma-field-error'>{avatarError}</p> : null}

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
