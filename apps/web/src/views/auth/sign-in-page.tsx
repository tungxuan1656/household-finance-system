'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { AuthField } from '@/components/auth/auth-field'
import { AuthPanel } from '@/components/auth/auth-panel'
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
        <p className='flex items-center justify-center gap-1.5'>
          <span className='opacity-70'>{t('auth.signIn.footer.prompt')}</span>
          <Link
            className='font-semibold text-primary transition-colors hover:text-primary/80'
            href={PATHS.SIGN_UP}>
            {t('auth.signIn.footer.link')}
          </Link>
        </p>
      }
      isSubmitting={form.formState.isSubmitting}
      title={t('auth.signIn.title')}
      onSubmit={handleSubmit}>
      {form.formState.errors.root?.message ? (
        <p className='text-sm text-destructive'>
          {form.formState.errors.root.message}
        </p>
      ) : null}
      <Controller
        control={form.control}
        name='email'
        render={({ field, fieldState }) => (
          <AuthField
            errors={[fieldState.error]}
            id='email'
            invalid={fieldState.invalid}
            label={t('auth.signIn.fields.email.label')}>
            <Input
              {...field}
              aria-invalid={fieldState.invalid}
              autoComplete='email'
              className='h-10 rounded-xl border-white/20 bg-background/50 py-2 transition-all placeholder:text-muted-foreground/50 focus-visible:border-primary/50 focus-visible:ring-4 focus-visible:ring-primary/10 dark:border-white/10 dark:bg-white/5 dark:focus-visible:border-white/50 dark:focus-visible:ring-white/10'
              id='email'
              placeholder={t('auth.signIn.fields.email.placeholder')}
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
            id='password'
            invalid={fieldState.invalid}
            label={t('auth.signIn.fields.password.label')}>
            <Input
              {...field}
              aria-invalid={fieldState.invalid}
              autoComplete='current-password'
              className='h-10 rounded-xl border-white/20 bg-background/50 py-2 transition-all placeholder:text-muted-foreground/50 focus-visible:border-primary/50 focus-visible:ring-4 focus-visible:ring-primary/10 dark:border-white/10 dark:bg-white/5 dark:focus-visible:border-white/50 dark:focus-visible:ring-white/10'
              id='password'
              placeholder={t('auth.signIn.fields.password.placeholder')}
              type='password'
            />
          </AuthField>
        )}
      />
    </AuthPanel>
  )
}
