import { act, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { authActions, useAuthStore } from '@/stores/auth.store'

function AuthUserProbe() {
  const isAuthenticated = useAuthStore.use.isAuthenticated()
  const isSessionChecked = useAuthStore.use.isSessionChecked()
  const postAuthRedirect = useAuthStore.use.postAuthRedirect()
  const refreshToken = useAuthStore.use.refreshToken()
  const returnTo = useAuthStore.use.returnTo()
  const user = useAuthStore.use.user()

  return (
    <div>
      <span data-testid='is-session-checked'>{String(isSessionChecked)}</span>
      <span data-testid='is-authenticated'>{String(isAuthenticated)}</span>
      <span data-testid='refresh-token'>{refreshToken ?? ''}</span>
      <span data-testid='post-auth-redirect'>{postAuthRedirect ?? ''}</span>
      <span data-testid='return-to'>{returnTo ?? ''}</span>
      <span data-testid='user-display-name'>{user?.displayName ?? ''}</span>
    </div>
  )
}

beforeEach(() => {
  act(() => {
    authActions.reset()
  })
})

describe('auth store', () => {
  it('starts in anonymous non-hydrated state', () => {
    expect(useAuthStore.getState()).toMatchObject({
      accessToken: null,
      isAuthenticated: false,
      isSessionChecked: false,
      postAuthRedirect: null,
      refreshToken: null,
      returnTo: null,
      user: null,
    })
  })

  it('marks session checked after hydration gate resolves', () => {
    act(() => {
      authActions.markSessionChecked()
    })

    expect(useAuthStore.getState().isSessionChecked).toBe(true)
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

  it('stores an authenticated session', () => {
    act(() => {
      authActions.setSession({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
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
      isAuthenticated: true,
      isSessionChecked: true,
      refreshToken: 'refresh-token',
      user: {
        displayName: 'Alex Morgan',
        email: 'alex@example.com',
      },
    })
  })

  it('preserves return-to when clearing failed session', () => {
    act(() => {
      authActions.setReturnTo('/app/expenses')

      authActions.setSession({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
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
      isAuthenticated: false,
      isSessionChecked: true,
      refreshToken: null,
      returnTo: '/app/expenses',
      user: null,
    })
  })

  it('updates user profile fields without replacing auth session', () => {
    act(() => {
      authActions.setSession({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: {
          avatarUrl: 'https://cdn.example.com/old-avatar.jpg',
          displayName: 'Alex Morgan',
          email: 'alex@example.com',
          id: 'user-1',
          provider: 'firebase',
        },
      })

      authActions.updateUserProfile({
        avatarUrl: 'https://cdn.example.com/new-avatar.jpg',
        displayName: 'Alex Updated',
      })
    })

    expect(useAuthStore.getState()).toMatchObject({
      accessToken: 'access-token',
      isAuthenticated: true,
      refreshToken: 'refresh-token',
      user: {
        avatarUrl: 'https://cdn.example.com/new-avatar.jpg',
        displayName: 'Alex Updated',
        email: 'alex@example.com',
        id: 'user-1',
      },
    })
  })

  it('renders selector-backed auth data', () => {
    act(() => {
      authActions.setSession({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
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

    expect(screen.getByTestId('is-session-checked')).toHaveTextContent('true')
    expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true')

    expect(screen.getByTestId('refresh-token')).toHaveTextContent(
      'refresh-token',
    )

    expect(screen.getByTestId('post-auth-redirect')).toHaveTextContent(
      '/app/onboarding',
    )

    expect(screen.getByTestId('return-to')).toHaveTextContent('')

    expect(screen.getByTestId('user-display-name')).toHaveTextContent(
      'Alex Morgan',
    )
  })
})
