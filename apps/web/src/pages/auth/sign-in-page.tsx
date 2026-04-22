import { Link } from 'react-router-dom'

import { AuthField } from '@/components/auth/auth-field'
import { AuthPanel } from '@/components/auth/auth-panel'
import { Input } from '@/components/ui/input'

function SignInPage() {
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
      title='Sign in'>
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
