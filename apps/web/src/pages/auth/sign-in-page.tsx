import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'

import { AuthField } from '@/components/auth/auth-field'
import { AuthPanel } from '@/components/auth/auth-panel'
import { Input } from '@/components/ui/input'
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
      setFormError(
        'Please provide a valid email and a password (minimum 8 characters).',
      )

      return
    }

    authActions.signIn({
      email,
      name: email.split('@')[0] || 'Signed-in user',
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
      actionLabel='Sign in'
      description='Use your email address to continue into the household shell.'
      footer={
        <p>
          New here?{' '}
          <Link
            className='font-medium text-primary underline-offset-4 hover:underline'
            to='/sign-up'>
            Create an account
          </Link>
        </p>
      }
      title='Sign in'
      onSubmit={handleSubmit}>
      {formError ? (
        <p className='text-sm text-destructive'>{formError}</p>
      ) : null}
      <AuthField
        description='The inbox tied to your account.'
        id='email'
        label='Email address'>
        <Input
          autoComplete='email'
          id='email'
          name='email'
          placeholder='name@example.com'
          type='email'
        />
      </AuthField>

      <AuthField
        description='At least 8 characters.'
        id='password'
        label='Password'>
        <Input
          autoComplete='current-password'
          id='password'
          name='password'
          placeholder='••••••••'
          type='password'
        />
      </AuthField>
    </AuthPanel>
  )
}

export { SignInPage }
