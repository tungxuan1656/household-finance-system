'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { AuthPanel } from '@/components/auth/auth-panel'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { signInWithEmailPassword } from '@/lib/auth/session-service'
import { PATHS } from '@/lib/constants/paths'
import { t } from '@/lib/i18n/t'

const signInSchema = z.object({
  email: z.string().trim().email(t('auth.signIn.errors.invalidForm')),
  password: z.string().trim().min(8, t('auth.signIn.errors.invalidForm')),
})

type SignInFormValues = z.infer<typeof signInSchema>

export const SignInPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const form = useForm<SignInFormValues>({
    defaultValues: {
      email: '',
      password: '',
    },
    resolver: zodResolver(signInSchema),
  })

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      await signInWithEmailPassword(values)

      form.clearErrors('root')

      const returnTo = searchParams.get('returnTo')
      if (returnTo && returnTo.startsWith('/')) {
        router.replace(returnTo)

        return
      }

      router.replace(PATHS.APP_ROOT)
    } catch {
      form.setError('root', {
        message: t('auth.session.errors.signInFailed'),
      })
    }
  })

  return (
    <AuthPanel
      actionLabel={t('common.actions.signIn')}
      description={t('auth.signIn.description')}
      footer={
        <div className='flex items-center justify-center gap-1.5'>
          <span>{t('auth.signIn.footer.prompt')}</span>
          <Button asChild variant='link'>
            <Link href={PATHS.SIGN_UP}>{t('auth.signIn.footer.link')}</Link>
          </Button>
        </div>
      }
      isSubmitting={form.formState.isSubmitting}
      title={t('auth.signIn.title')}
      onSubmit={handleSubmit}>
      {form.formState.errors.root?.message ? (
        <FieldError errors={[form.formState.errors.root]} />
      ) : null}

      <Controller
        control={form.control}
        name='email'
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor='email'>
              {t('auth.signIn.fields.email.label')}
            </FieldLabel>
            <Input
              {...field}
              aria-invalid={fieldState.invalid}
              autoComplete='email'
              className='h-10'
              id='email'
              placeholder={t('auth.signIn.fields.email.placeholder')}
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
            <FieldLabel htmlFor='password'>
              {t('auth.signIn.fields.password.label')}
            </FieldLabel>
            <Input
              {...field}
              aria-invalid={fieldState.invalid}
              autoComplete='current-password'
              className='h-10'
              id='password'
              placeholder={t('auth.signIn.fields.password.placeholder')}
              type='password'
            />
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />
    </AuthPanel>
  )
}
