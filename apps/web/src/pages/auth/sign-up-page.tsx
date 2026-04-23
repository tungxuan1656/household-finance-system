import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { AuthField } from '@/components/auth/auth-field'
import { AuthPanel } from '@/components/auth/auth-panel'
import { Input } from '@/components/ui/input'
import { resolveAuthRedirect } from '@/lib/auth/redirect'
import { signUpWithEmailPassword } from '@/lib/auth/session-service'
import { t } from '@/lib/i18n'
import { useAuthStore } from '@/stores/auth.store'

export const SignUpPage = () => {
  const navigate = useNavigate()

  const bootstrapComplete = useAuthStore.use.bootstrapComplete()
  const isAuthenticated = useAuthStore.use.isAuthenticated()
  const postAuthRedirect = useAuthStore.use.postAuthRedirect()
  const returnTo = useAuthStore.use.returnTo()

  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!bootstrapComplete || !isAuthenticated) {
      return
    }

    navigate(
      resolveAuthRedirect({
        fallback: '/app/onboarding',
        postAuthRedirect,
        returnTo,
      }),
      {
        replace: true,
      },
    )
  }, [bootstrapComplete, isAuthenticated, navigate, postAuthRedirect, returnTo])

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (
    event,
  ) => {
    event.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)
    const name = String(formData.get('fullName') ?? '').trim()
    const email = String(formData.get('email') ?? '').trim()
    const password = String(formData.get('password') ?? '').trim()

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!name || !email || !emailRegex.test(email) || password.length < 8) {
      setFormError(t('auth.signUp.errors.invalidForm'))
      setIsSubmitting(false)

      return
    }

    try {
      const destination = await signUpWithEmailPassword({
        email,
        name,
        password,
      })

      setFormError(null)
      navigate(destination, { replace: true })
    } catch {
      setFormError(t('auth.session.errors.signUpFailed'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthPanel
      actionLabel={t('common.actions.createAccount')}
      description={t('auth.signUp.description')}
      footer={
        <p>
          {t('auth.signUp.footer.prompt')}{' '}
          <Link
            className='font-medium text-primary underline-offset-4 hover:underline'
            to='/sign-in'>
            {t('auth.signUp.footer.link')}
          </Link>
        </p>
      }
      isSubmitting={isSubmitting}
      title={t('auth.signUp.title')}
      onSubmit={handleSubmit}>
      {formError ? (
        <p className='text-sm text-destructive'>{formError}</p>
      ) : null}
      <AuthField id='full-name' label={t('auth.signUp.fields.fullName.label')}>
        <Input
          autoComplete='name'
          id='full-name'
          name='fullName'
          placeholder={t('auth.signUp.fields.fullName.placeholder')}
        />
      </AuthField>

      <AuthField id='sign-up-email' label={t('auth.signUp.fields.email.label')}>
        <Input
          autoComplete='email'
          id='sign-up-email'
          name='email'
          placeholder={t('auth.signUp.fields.email.placeholder')}
          type='email'
        />
      </AuthField>

      <AuthField
        id='sign-up-password'
        label={t('auth.signUp.fields.password.label')}>
        <Input
          autoComplete='new-password'
          id='sign-up-password'
          name='password'
          placeholder={t('auth.signUp.fields.password.placeholder')}
          type='password'
        />
      </AuthField>
    </AuthPanel>
  )
}
