import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'

import { AuthField } from '@/components/auth/auth-field'
import { AuthPanel } from '@/components/auth/auth-panel'
import { Input } from '@/components/ui/input'
import { t } from '@/lib/i18n'
import { authActions, useAuthStore } from '@/stores/auth.store'

function SignUpPage() {
  const navigate = useNavigate()

  const [formError, setFormError] = useState<string | null>(null)

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const name = String(formData.get('fullName') ?? '').trim()
    const email = String(formData.get('email') ?? '').trim()
    const password = String(formData.get('password') ?? '').trim()
    const destination = useAuthStore.getState().returnTo ?? '/app/onboarding'

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!name || !email || !emailRegex.test(email) || password.length < 8) {
      setFormError(t('auth.signUp.errors.invalidForm'))

      return
    }

    authActions.signUp({
      email,
      name: name || email.split('@')[0] || t('app.overview.demoFamily'),
    })

    const safeDestination =
      typeof destination === 'string' &&
      destination.startsWith('/') &&
      !destination.startsWith('//') &&
      !destination.includes('://')
        ? destination
        : '/app/onboarding'

    setFormError(null)
    navigate(safeDestination, { replace: true })
  }

  return (
    <AuthPanel
      actionLabel={t('common.actions.createAccount')}
      description={t('auth.signUp.description')}
      eyebrowLabel={t('common.labels.publicRoute')}
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
      title={t('auth.signUp.title')}
      onSubmit={handleSubmit}>
      {formError ? (
        <p className='text-sm text-destructive'>{formError}</p>
      ) : null}
      <AuthField
        description={t('auth.signUp.fields.fullName.description')}
        id='full-name'
        label={t('auth.signUp.fields.fullName.label')}>
        <Input
          autoComplete='name'
          id='full-name'
          name='fullName'
          placeholder={t('auth.signUp.fields.fullName.placeholder')}
        />
      </AuthField>

      <AuthField
        description={t('auth.signUp.fields.email.description')}
        id='sign-up-email'
        label={t('auth.signUp.fields.email.label')}>
        <Input
          autoComplete='email'
          id='sign-up-email'
          name='email'
          placeholder={t('auth.signUp.fields.email.placeholder')}
          type='email'
        />
      </AuthField>

      <AuthField
        description={t('auth.signUp.fields.password.description')}
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

export { SignUpPage }
