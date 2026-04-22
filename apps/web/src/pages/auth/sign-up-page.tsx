import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'

import { AuthField } from '@/components/auth/auth-field'
import { AuthPanel } from '@/components/auth/auth-panel'
import { Input } from '@/components/ui/input'
import { authActions, useAuthStore } from '@/stores/auth.store'

function SignUpPage() {
  const navigate = useNavigate()

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const name = String(formData.get('fullName') ?? '').trim()
    const email = String(formData.get('email') ?? '').trim()
    const destination = useAuthStore.getState().returnTo ?? '/app/onboarding'

    authActions.signUp({
      email,
      name: name || email.split('@')[0] || 'New user',
    })

    navigate(destination, { replace: true })
  }

  return (
    <AuthPanel
      actionLabel='Create account'
      description='Create the account that will later join or create a household.'
      footer={
        <p>
          Already have an account?{' '}
          <Link
            className='font-medium text-primary underline-offset-4 hover:underline'
            to='/sign-in'>
            Back to sign in
          </Link>
        </p>
      }
      title='Create your account'
      onSubmit={handleSubmit}>
      <AuthField
        description='This is the name shown to your household.'
        id='full-name'
        label='Full name'>
        <Input
          autoComplete='name'
          id='full-name'
          name='fullName'
          placeholder='Alex Morgan'
        />
      </AuthField>

      <AuthField
        description='We will use this for the login flow.'
        id='sign-up-email'
        label='Email address'>
        <Input
          autoComplete='email'
          id='sign-up-email'
          name='email'
          placeholder='name@example.com'
          type='email'
        />
      </AuthField>

      <AuthField
        description='Choose a secure password for the app.'
        id='sign-up-password'
        label='Password'>
        <Input
          autoComplete='new-password'
          id='sign-up-password'
          name='password'
          placeholder='••••••••'
          type='password'
        />
      </AuthField>
    </AuthPanel>
  )
}

export { SignUpPage }
