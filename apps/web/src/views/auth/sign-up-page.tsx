'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { AuthField } from '@/components/auth/auth-field'
import { AuthPanel } from '@/components/auth/auth-panel'
import { Input } from '@/components/ui/input'
import { signUpWithEmailPassword } from '@/lib/auth/session-service'
import { PATHS } from '@/lib/constants/paths'
import { t } from '@/lib/i18n/t'

const signUpSchema = z.object({
  email: z.string().trim().email(t('auth.signUp.errors.invalidForm')),
  name: z.string().trim().min(1, t('auth.signUp.errors.invalidForm')),
  password: z.string().trim().min(8, t('auth.signUp.errors.invalidForm')),
})

type SignUpFormValues = z.infer<typeof signUpSchema>

export const SignUpPage = () => {
  const router = useRouter()
  const form = useForm<SignUpFormValues>({
    defaultValues: {
      email: '',
      name: '',
      password: '',
    },
    resolver: zodResolver(signUpSchema),
  })

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      await signUpWithEmailPassword(values)

      form.clearErrors('root')
      router.replace(PATHS.ONBOARDING)
    } catch {
      form.setError('root', {
        message: t('auth.session.errors.signUpFailed'),
      })
    }
  })

  return (
    <AuthPanel
      actionLabel={t('common.actions.createAccount')}
      description={t('auth.signUp.description')}
      footer={
        <p>
          {t('auth.signUp.footer.prompt')}{' '}
          <Link
            className='font-medium text-primary underline-offset-4 hover:underline'
            href={PATHS.SIGN_IN}>
            {t('auth.signUp.footer.link')}
          </Link>
        </p>
      }
      isSubmitting={form.formState.isSubmitting}
      title={t('auth.signUp.title')}
      onSubmit={handleSubmit}>
      {form.formState.errors.root?.message ? (
        <p className='text-sm text-destructive'>
          {form.formState.errors.root.message}
        </p>
      ) : null}

      <Controller
        control={form.control}
        name='name'
        render={({ field, fieldState }) => (
          <AuthField
            errors={[fieldState.error]}
            id='full-name'
            invalid={fieldState.invalid}
            label={t('auth.signUp.fields.fullName.label')}>
            <Input
              {...field}
              aria-invalid={fieldState.invalid}
              autoComplete='name'
              id='full-name'
              placeholder={t('auth.signUp.fields.fullName.placeholder')}
            />
          </AuthField>
        )}
      />

      <Controller
        control={form.control}
        name='email'
        render={({ field, fieldState }) => (
          <AuthField
            errors={[fieldState.error]}
            id='sign-up-email'
            invalid={fieldState.invalid}
            label={t('auth.signUp.fields.email.label')}>
            <Input
              {...field}
              aria-invalid={fieldState.invalid}
              autoComplete='email'
              id='sign-up-email'
              placeholder={t('auth.signUp.fields.email.placeholder')}
              type='email'
            />
          </AuthField>
        )}
      />

      <Controller
        control={form.control}
        name='password'
        render={({ field, fieldState }) => (
          <AuthField
            errors={[fieldState.error]}
            id='sign-up-password'
            invalid={fieldState.invalid}
            label={t('auth.signUp.fields.password.label')}>
            <Input
              {...field}
              aria-invalid={fieldState.invalid}
              autoComplete='new-password'
              id='sign-up-password'
              placeholder={t('auth.signUp.fields.password.placeholder')}
              type='password'
            />
          </AuthField>
        )}
      />
    </AuthPanel>
  )
}
