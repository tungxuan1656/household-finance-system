import { zodResolver } from '@hookform/resolvers/zod'
import { CameraIcon } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { ApiClientError } from '@/api/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  useCurrentUserProfileQuery,
  useUpdateCurrentUserProfileMutation,
} from '@/hooks/api/use-profile'
import { uploadProfileAvatar } from '@/lib/firebase/storage'
import {
  type UpdateProfileFormValues,
  updateProfileSchema,
} from '@/lib/forms/profile.schema'
import { t } from '@/lib/i18n'
import {
  isAvatarImageFile,
  prepareSquareAvatarImage,
} from '@/lib/images/avatar-image'

const MAX_AVATAR_SIZE_BYTES = 8 * 1024 * 1024

const getAvatarFallback = (
  displayName: string | null,
  email: string | null,
) => {
  const source = displayName?.trim() || email?.trim() || 'U'

  return source.slice(0, 2).toUpperCase()
}

export const ProfileSettingsPage = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false)
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null)

  const profileQuery = useCurrentUserProfileQuery()
  const updateProfileMutation = useUpdateCurrentUserProfileMutation()

  const form = useForm<UpdateProfileFormValues>({
    defaultValues: {
      displayName: '',
    },
    resolver: zodResolver(updateProfileSchema),
  })

  useEffect(() => {
    if (!profileQuery.data) {
      return
    }

    form.reset({
      displayName: profileQuery.data.displayName ?? '',
    })
  }, [form, profileQuery.data])

  const currentAvatarSrc = useMemo(() => {
    if (avatarDialogOpen && avatarPreviewUrl) {
      return avatarPreviewUrl
    }

    return profileQuery.data?.avatarUrl ?? undefined
  }, [avatarDialogOpen, avatarPreviewUrl, profileQuery.data?.avatarUrl])

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
    if (!avatarFile || !profileQuery.data?.id) {
      return
    }

    try {
      setAvatarError(null)

      const preparedAvatar = await prepareSquareAvatarImage({
        file: avatarFile,
      })

      const avatarUrl = await uploadProfileAvatar({
        file: preparedAvatar.blob,
        userId: profileQuery.data.id,
      })

      await updateProfileMutation.mutateAsync({
        avatarUrl,
      })

      clearAvatarCandidate()
    } catch (error) {
      const message =
        error instanceof ApiClientError
          ? error.message
          : t('app.settings.profile.errors.avatarUploadFailed')

      setAvatarError(message)
    }
  }

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      form.clearErrors('root')

      await updateProfileMutation.mutateAsync({
        displayName: values.displayName.trim(),
      })
    } catch (error) {
      const message =
        error instanceof ApiClientError
          ? error.message
          : t('app.settings.profile.errors.saveFailed')

      form.setError('root', {
        message,
      })
    }
  })

  if (profileQuery.isLoading && !profileQuery.data) {
    return <p>{t('app.settings.profile.loading')}</p>
  }

  if (profileQuery.isError || !profileQuery.data) {
    return (
      <div className='flex flex-col gap-3'>
        <p>{t('app.settings.profile.errors.loadFailed')}</p>
        <Button variant='outline' onClick={() => void profileQuery.refetch()}>
          {t('app.settings.profile.actions.retry')}
        </Button>
      </div>
    )
  }

  const isSubmitting =
    form.formState.isSubmitting ||
    updateProfileMutation.isPending ||
    profileQuery.isFetching

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{t('app.settings.profile.title')}</CardTitle>
        </CardHeader>
        <CardContent className='flex flex-col gap-6'>
          <div className='flex flex-col gap-3'>
            <Avatar size='lg'>
              <AvatarImage src={currentAvatarSrc} />
              <AvatarFallback>
                {getAvatarFallback(
                  profileQuery.data.displayName,
                  profileQuery.data.email,
                )}
              </AvatarFallback>
            </Avatar>

            <div className='flex gap-2'>
              <Button
                type='button'
                variant='outline'
                onClick={() => fileInputRef.current?.click()}>
                <CameraIcon data-icon='inline-start' />
                {t('app.settings.profile.actions.changeAvatar')}
              </Button>
            </div>

            {avatarError ? <FieldError>{avatarError}</FieldError> : null}
            <input
              ref={fileInputRef}
              accept='image/*'
              className='hidden'
              type='file'
              onChange={handleAvatarFileChange}
            />
          </div>

          <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
            <FieldGroup>
              <Controller
                control={form.control}
                name='displayName'
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    orientation='horizontal'>
                    <FieldLabel htmlFor='profile-display-name'>
                      {t('app.settings.profile.fields.displayName.label')}
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        {...field}
                        aria-invalid={fieldState.invalid}
                        id='profile-display-name'
                        placeholder={t(
                          'app.settings.profile.fields.displayName.placeholder',
                        )}
                      />
                      <FieldDescription>
                        {t(
                          'app.settings.profile.fields.displayName.description',
                        )}
                      </FieldDescription>
                      <FieldError errors={[fieldState.error]} />
                    </FieldContent>
                  </Field>
                )}
              />
            </FieldGroup>

            {form.formState.errors.root?.message ? (
              <FieldError>{form.formState.errors.root.message}</FieldError>
            ) : null}

            <div className='flex gap-2'>
              <Button disabled={isSubmitting} type='submit'>
                {isSubmitting
                  ? t('app.settings.profile.actions.saving')
                  : t('app.settings.profile.actions.save')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Dialog open={avatarDialogOpen} onOpenChange={setAvatarDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('app.settings.profile.crop.title')}</DialogTitle>
            <DialogDescription>
              {t('app.settings.profile.crop.description')}
            </DialogDescription>
          </DialogHeader>

          {avatarPreviewUrl ? (
            <img
              alt={t('app.settings.profile.crop.previewAlt')}
              className='aspect-square w-full rounded-lg object-cover'
              src={avatarPreviewUrl}
            />
          ) : null}

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={clearAvatarCandidate}>
              {t('common.actions.cancel')}
            </Button>
            <Button
              disabled={updateProfileMutation.isPending}
              type='button'
              onClick={() => void handleAvatarUpload()}>
              {updateProfileMutation.isPending
                ? t('app.settings.profile.actions.uploadingAvatar')
                : t('app.settings.profile.actions.applyAvatar')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
