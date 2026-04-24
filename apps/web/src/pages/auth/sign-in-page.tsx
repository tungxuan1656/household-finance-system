import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { AuthField } from '@/components/auth/auth-field'
import { AuthPanel } from '@/components/auth/auth-panel'
import { Input } from '@/components/ui/input'
import { resolveAuthRedirect } from '@/lib/auth/redirect'
import { signInWithEmailPassword } from '@/lib/auth/session-service'
import { t } from '@/lib/i18n'
import { useAuthStore } from '@/stores/auth.store'

export const SignInPage = () => {
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
        fallback: '/app',
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
    const email = String(formData.get('email') ?? '').trim()
    const password = String(formData.get('password') ?? '').trim()

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!email || !emailRegex.test(email) || password.length < 8) {
      setFormError(t('auth.signIn.errors.invalidForm'))
      setIsSubmitting(false)

      return
    }

    try {
      const destination = await signInWithEmailPassword({
        email,
        password,
      })

      setFormError(null)
      navigate(destination, { replace: true })
    } catch {
      setFormError(t('auth.session.errors.signInFailed'))
    } finally {
      setIsSubmitting(false)
    }
  }

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
      isSubmitting={isSubmitting}
      title={t('auth.signIn.title')}
      onSubmit={handleSubmit}>
      {formError ? (
        <p className='text-sm text-destructive'>{formError}</p>
      ) : null}
      <AuthField id='email' label={t('auth.signIn.fields.email.label')}>
        <Input
          autoComplete='email'
          id='email'
          name='email'
          placeholder={t('auth.signIn.fields.email.placeholder')}
          type='email'
        />
      </AuthField>

      <AuthField id='password' label={t('auth.signIn.fields.password.label')}>
        <Input
          autoComplete='current-password'
          id='password'
          name='password'
          placeholder={t('auth.signIn.fields.password.placeholder')}
          type='password'
        />
      </AuthField>
    </AuthPanel>
  )
}
