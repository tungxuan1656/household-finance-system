import { act, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { authActions, useAuthStore } from '@/stores/auth.store'

function AuthUserProbe() {
  const isAuthenticated = useAuthStore.use.isAuthenticated()
  const returnTo = useAuthStore.use.returnTo()
  const user = useAuthStore.use.user()

  return (
    <div>
      <span data-testid='is-authenticated'>{String(isAuthenticated)}</span>
      <span data-testid='return-to'>{returnTo ?? ''}</span>
      <span data-testid='user-email'>{user?.email ?? ''}</span>
      <span data-testid='user-name'>{user?.name ?? ''}</span>
    </div>
  )
}

beforeEach(() => {
  act(() => {
    authActions.reset()
  })
})

describe('auth store', () => {
  it('starts with anonymous shell state', () => {
    expect(useAuthStore.getState()).toEqual({
      isAuthenticated: false,
      returnTo: null,
      user: null,
    })
  })

  it('stores a protected return path and clears it', () => {
    act(() => {
      authActions.setReturnTo('/app/onboarding')
    })

    expect(useAuthStore.getState().returnTo).toBe('/app/onboarding')

    act(() => {
      authActions.setReturnTo(null)
    })

    expect(useAuthStore.getState().returnTo).toBeNull()
  })

  it('marks the shell authenticated on sign in', () => {
    act(() => {
      authActions.setReturnTo('/app/expenses')
      authActions.signIn({ email: 'alex@example.com', name: 'Alex' })
    })

    expect(useAuthStore.getState()).toEqual({
      isAuthenticated: true,
      returnTo: null,
      user: { email: 'alex@example.com', name: 'Alex' },
    })
  })

  it('renders selector-backed auth data', () => {
    act(() => {
      authActions.signUp({ email: 'alex@example.com', name: 'Alex Morgan' })
    })

    render(<AuthUserProbe />)

    expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true')
    expect(screen.getByTestId('return-to')).toHaveTextContent('')

    expect(screen.getByTestId('user-email')).toHaveTextContent(
      'alex@example.com',
    )

    expect(screen.getByTestId('user-name')).toHaveTextContent('Alex Morgan')
  })

  it('resets back to the initial anonymous state', () => {
    act(() => {
      authActions.signIn({ email: 'alex@example.com', name: 'Alex' })
      authActions.setReturnTo('/app/settings')
      authActions.reset()
    })

    expect(useAuthStore.getState()).toEqual({
      isAuthenticated: false,
      returnTo: null,
      user: null,
    })
  })
})
