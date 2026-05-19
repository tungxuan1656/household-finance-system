'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  type PasswordChangeFormValues,
  passwordChangeSchema,
} from '@/features/settings/lib/forms/profile.schema'
import { changeCurrentUserPassword } from '@/lib/auth/session-service'
import { t } from '@/lib/i18n/t'

type Props = {
  isBusy: boolean
}

export const ProfilePasswordCard = ({ isBusy }: Props) => {
  const form = useForm<PasswordChangeFormValues>({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
    },
    resolver: zodResolver(passwordChangeSchema),
  })

  const handleSubmit = async (values: PasswordChangeFormValues) => {
    try {
      form.clearErrors('root')

      await changeCurrentUserPassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      })

      form.reset()
      toast.success(t('app.settings.profile.security.success'))
    } catch {
      form.setError('root', {
        message: t('app.settings.profile.security.errors.updateFailed'),
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('app.settings.profile.security.title')}</CardTitle>
        <CardDescription>
          {t('app.settings.profile.security.description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className='flex flex-col gap-4'
          onSubmit={form.handleSubmit(handleSubmit)}>
          <FieldGroup>
            <Controller
              control={form.control}
              name='currentPassword'
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='profile-current-password'>
                    {t(
                      'app.settings.profile.security.fields.currentPassword.label',
                    )}
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      autoComplete='current-password'
                      id='profile-current-password'
                      placeholder={t(
                        'app.settings.profile.security.fields.currentPassword.placeholder',
                      )}
                      size={'sm'}
                      type='password'
                    />
                    <FieldError errors={[fieldState.error]} />
                  </FieldContent>
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name='newPassword'
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='profile-new-password'>
                    {t(
                      'app.settings.profile.security.fields.newPassword.label',
                    )}
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      autoComplete='new-password'
                      id='profile-new-password'
                      placeholder={t(
                        'app.settings.profile.security.fields.newPassword.placeholder',
                      )}
                      size={'sm'}
                      type='password'
                    />
                    <FieldError errors={[fieldState.error]} />
                  </FieldContent>
                </Field>
              )}
            />
          </FieldGroup>

          {form.formState.errors.root?.message ? (
            <FieldError>{form.formState.errors.root.message}</FieldError>
          ) : null}

          <div className='flex justify-end gap-2'>
            <Button
              disabled={isBusy || form.formState.isSubmitting}
              size='sm'
              type='submit'>
              {form.formState.isSubmitting
                ? t('app.settings.profile.security.actions.saving')
                : t('app.settings.profile.security.actions.save')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
