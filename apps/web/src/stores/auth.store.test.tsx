import { act, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { authActions, useAuthStore } from '@/stores/auth.store'

function AuthUserProbe() {
  const bootstrapComplete = useAuthStore.use.bootstrapComplete()
  const isAuthenticated = useAuthStore.use.isAuthenticated()
  const postAuthRedirect = useAuthStore.use.postAuthRedirect()
  const returnTo = useAuthStore.use.returnTo()
  const user = useAuthStore.use.user()

  return (
    <div>
      <span data-testid='bootstrap-complete'>{String(bootstrapComplete)}</span>
      <span data-testid='is-authenticated'>{String(isAuthenticated)}</span>
      <span data-testid='post-auth-redirect'>{postAuthRedirect ?? ''}</span>
      <span data-testid='return-to'>{returnTo ?? ''}</span>
      <span data-testid='user-display-name'>{user?.displayName ?? ''}</span>
    </div>
  )
}

beforeEach(() => {
  vi.useFakeTimers()

  act(() => {
    authActions.reset()
  })
})

describe('auth store', () => {
  it('starts in the bootstrapping anonymous session state', () => {
    expect(useAuthStore.getState()).toMatchObject({
      accessToken: null,
      accessTokenExpiresAt: null,
      bootstrapComplete: false,
      isAuthenticated: false,
      postAuthRedirect: null,
      returnTo: null,
      user: null,
    })
  })

  it('stores and clears routing state independently', () => {
    act(() => {
      authActions.setReturnTo('/app/onboarding')
      authActions.setPostAuthRedirect('/app/onboarding')
    })

    expect(useAuthStore.getState()).toMatchObject({
      postAuthRedirect: '/app/onboarding',
      returnTo: '/app/onboarding',
    })

    act(() => {
      authActions.clearRoutingState()
    })

    expect(useAuthStore.getState()).toMatchObject({
      postAuthRedirect: null,
      returnTo: null,
    })
  })

  it('stores an authenticated session and schedules silent refresh', async () => {
    const refreshSession = vi.fn(async () => undefined)

    act(() => {
      authActions.setSession({
        accessToken: 'access-token',
        accessTokenExpiresIn: 120,
        refreshSession,
        user: {
          avatarUrl: null,
          displayName: 'Alex Morgan',
          email: 'alex@example.com',
          id: 'user-1',
          provider: 'firebase',
        },
      })
    })

    expect(useAuthStore.getState()).toMatchObject({
      accessToken: 'access-token',
      bootstrapComplete: true,
      isAuthenticated: true,
      user: {
        displayName: 'Alex Morgan',
        email: 'alex@example.com',
      },
    })

    await act(async () => {
      await vi.runOnlyPendingTimersAsync()
    })

    expect(refreshSession).toHaveBeenCalledTimes(1)
  })

  it('preserves the requested return path when clearing a failed session', () => {
    act(() => {
      authActions.setReturnTo('/app/expenses')

      authActions.setSession({
        accessToken: 'access-token',
        accessTokenExpiresIn: 120,
        refreshSession: vi.fn(async () => undefined),
        user: {
          avatarUrl: null,
          displayName: 'Alex Morgan',
          email: 'alex@example.com',
          id: 'user-1',
          provider: 'firebase',
        },
      })

      authActions.clearSession({
        preserveReturnTo: true,
      })
    })

    expect(useAuthStore.getState()).toMatchObject({
      accessToken: null,
      bootstrapComplete: true,
      isAuthenticated: false,
      returnTo: '/app/expenses',
      user: null,
    })
  })

  it('renders selector-backed auth data', () => {
    act(() => {
      authActions.setSession({
        accessToken: 'access-token',
        accessTokenExpiresIn: 120,
        refreshSession: vi.fn(async () => undefined),
        user: {
          avatarUrl: null,
          displayName: 'Alex Morgan',
          email: 'alex@example.com',
          id: 'user-1',
          provider: 'firebase',
        },
      })

      authActions.setPostAuthRedirect('/app/onboarding')
    })

    render(<AuthUserProbe />)

    expect(screen.getByTestId('bootstrap-complete')).toHaveTextContent('true')
    expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true')

    expect(screen.getByTestId('post-auth-redirect')).toHaveTextContent(
      '/app/onboarding',
    )

    expect(screen.getByTestId('return-to')).toHaveTextContent('')

    expect(screen.getByTestId('user-display-name')).toHaveTextContent(
      'Alex Morgan',
    )
  })

  it('resets back to the initial anonymous bootstrapping state', () => {
    act(() => {
      authActions.setSession({
        accessToken: 'access-token',
        accessTokenExpiresIn: 120,
        refreshSession: vi.fn(async () => undefined),
        user: {
          avatarUrl: null,
          displayName: 'Alex Morgan',
          email: 'alex@example.com',
          id: 'user-1',
          provider: 'firebase',
        },
      })

      authActions.setReturnTo('/app/settings')
      authActions.reset()
    })

    expect(useAuthStore.getState()).toMatchObject({
      accessToken: null,
      accessTokenExpiresAt: null,
      bootstrapComplete: false,
      isAuthenticated: false,
      postAuthRedirect: null,
      returnTo: null,
      user: null,
    })
  })
})
