'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { ApiClientError } from '@/api/client'
import { FieldInputController } from '@/components/shared/form'
import { Button } from '@/components/ui/button'
import { FieldError, FieldGroup } from '@/components/ui/field'
import {
  type UpdateProfileFormValues,
  updateProfileSchema,
} from '@/lib/forms/profile.schema'
import { t } from '@/lib/i18n/t'

type ProfileDisplayNameFormProps = {
  defaultDisplayName: string | null
  isSubmitting: boolean
  onSubmit: (displayName: string) => Promise<void>
}

export const ProfileDisplayNameForm = ({
  defaultDisplayName,
  isSubmitting,
  onSubmit,
}: ProfileDisplayNameFormProps) => {
  const form = useForm<UpdateProfileFormValues>({
    defaultValues: {
      displayName: '',
    },
    resolver: zodResolver(updateProfileSchema),
  })

  useEffect(() => {
    form.reset({
      displayName: defaultDisplayName ?? '',
    })
  }, [defaultDisplayName, form])

  return (
    <form
      className='flex flex-col gap-4'
      onSubmit={form.handleSubmit(async (values) => {
        try {
          form.clearErrors('root')
          await onSubmit(values.displayName.trim())
        } catch (error) {
          const message =
            error instanceof ApiClientError
              ? error.message
              : t('app.settings.profile.errors.saveFailed')

          form.setError('root', {
            message,
          })
        }
      })}>
      <FieldGroup>
        <FieldInputController
          control={form.control}
          description={t('app.settings.profile.fields.displayName.description')}
          id='profile-display-name'
          label={t('app.settings.profile.fields.displayName.label')}
          name='displayName'
          placeholder={t('app.settings.profile.fields.displayName.placeholder')}
        />
      </FieldGroup>

      {form.formState.errors.root?.message ? (
        <FieldError>{form.formState.errors.root.message}</FieldError>
      ) : null}

      <div className='flex gap-2'>
        <Button className='min-h-11' disabled={isSubmitting} type='submit'>
          {isSubmitting
            ? t('app.settings.profile.actions.saving')
            : t('app.settings.profile.actions.save')}
        </Button>
      </div>
    </form>
  )
}
