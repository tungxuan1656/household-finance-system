'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { AuthPanel } from '@/features/auth/components/auth-panel'
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
      router.replace(PATHS.ACCOUNT)
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
        <div className='flex flex-wrap items-center justify-center gap-1.5'>
          <span>{t('auth.signUp.footer.prompt')}</span>
          <Button asChild variant='link'>
            <Link href={PATHS.SIGN_IN}>{t('auth.signUp.footer.link')}</Link>
          </Button>
        </div>
      }
      isSubmitting={form.formState.isSubmitting}
      title={t('auth.signUp.title')}
      onSubmit={handleSubmit}>
      {form.formState.errors.root?.message ? (
        <FieldError errors={[form.formState.errors.root]} />
      ) : null}

      <Controller
        control={form.control}
        name='name'
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor='full-name'>
              {t('auth.signUp.fields.fullName.label')}
            </FieldLabel>
            <Input
              {...field}
              aria-invalid={fieldState.invalid}
              autoComplete='name'
              className='h-10'
              id='full-name'
              placeholder={t('auth.signUp.fields.fullName.placeholder')}
            />
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />

      <Controller
        control={form.control}
        name='email'
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor='sign-up-email'>
              {t('auth.signUp.fields.email.label')}
            </FieldLabel>
            <Input
              {...field}
              aria-invalid={fieldState.invalid}
              autoComplete='email'
              className='h-10'
              id='sign-up-email'
              placeholder={t('auth.signUp.fields.email.placeholder')}
              type='email'
            />
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />

      <Controller
        control={form.control}
        name='password'
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor='sign-up-password'>
              {t('auth.signUp.fields.password.label')}
            </FieldLabel>
            <Input
              {...field}
              aria-invalid={fieldState.invalid}
              autoComplete='new-password'
              className='h-10'
              id='sign-up-password'
              placeholder={t('auth.signUp.fields.password.placeholder')}
              type='password'
            />
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />
    </AuthPanel>
  )
}
