import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'

import { AuthField } from '@/components/auth/auth-field'
import { AuthPanel } from '@/components/auth/auth-panel'
import { Input } from '@/components/ui/input'
import { t } from '@/lib/i18n'
import { authActions, useAuthStore } from '@/stores/auth.store'

function SignInPage() {
  const navigate = useNavigate()

  const [formError, setFormError] = useState<string | null>(null)

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const email = String(formData.get('email') ?? '').trim()
    const password = String(formData.get('password') ?? '').trim()
    const destination = useAuthStore.getState().returnTo ?? '/app'

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!email || !emailRegex.test(email) || password.length < 8) {
      setFormError(t('auth.signIn.errors.invalidForm'))

      return
    }

    authActions.signIn({
      email,
      name: email.split('@')[0] || t('app.overview.demoFamily'),
    })

    const safeDestination =
      typeof destination === 'string' &&
      destination.startsWith('/') &&
      !destination.startsWith('//') &&
      !destination.includes('://')
        ? destination
        : '/app'

    setFormError(null)
    navigate(safeDestination, { replace: true })
  }

  return (
    <AuthPanel
      actionLabel={t('common.actions.signIn')}
      description={t('auth.signIn.description')}
      eyebrowLabel={t('common.labels.publicRoute')}
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
      title={t('auth.signIn.title')}
      onSubmit={handleSubmit}>
      {formError ? (
        <p className='text-sm text-destructive'>{formError}</p>
      ) : null}
      <AuthField
        description={t('auth.signIn.fields.email.description')}
        id='email'
        label={t('auth.signIn.fields.email.label')}>
        <Input
          autoComplete='email'
          id='email'
          name='email'
          placeholder={t('auth.signIn.fields.email.placeholder')}
          type='email'
        />
      </AuthField>

      <AuthField
        description={t('auth.signIn.fields.password.description')}
        id='password'
        label={t('auth.signIn.fields.password.label')}>
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

export { SignInPage }
