import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'

import { AuthField } from '@/components/auth/auth-field'
import { AuthPanel } from '@/components/auth/auth-panel'
import { Input } from '@/components/ui/input'
import { signInWithEmailPassword } from '@/lib/auth/session-service'
import { t } from '@/lib/i18n'

const signInSchema = z.object({
  email: z.string().trim().email(t('auth.signIn.errors.invalidForm')),
  password: z.string().trim().min(8, t('auth.signIn.errors.invalidForm')),
})

type SignInFormValues = z.infer<typeof signInSchema>

export const SignInPage = () => {
  const navigate = useNavigate()
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
      navigate('/', { replace: true })
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
        <p>
          {t('auth.signIn.footer.prompt')}{' '}
          <Link
            className='font-medium text-primary underline-offset-4 hover:underline'
            to='/sign-up'>
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
