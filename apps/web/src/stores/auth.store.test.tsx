import { act, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { authActions, useAuthStore } from '@/stores/auth.store'

function AuthUserProbe() {
  const isAuthenticated = useAuthStore.use.isAuthenticated()
  const isSessionChecked = useAuthStore.use.isSessionChecked()
  const refreshToken = useAuthStore.use.refreshToken()
  const user = useAuthStore.use.user()

  return (
    <div>
      <span data-testid='is-session-checked'>{String(isSessionChecked)}</span>
      <span data-testid='is-authenticated'>{String(isAuthenticated)}</span>
      <span data-testid='refresh-token'>{refreshToken ?? ''}</span>
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
      refreshToken: null,
      user: null,
    })
  })

  it('marks session checked after hydration gate resolves', () => {
    act(() => {
      authActions.markSessionChecked()
    })

    expect(useAuthStore.getState().isSessionChecked).toBe(true)
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

  it('clears session state', () => {
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

      authActions.clearSession()
    })

    expect(useAuthStore.getState()).toMatchObject({
      accessToken: null,
      isAuthenticated: false,
      isSessionChecked: true,
      refreshToken: null,
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
    })

    render(<AuthUserProbe />)

    expect(screen.getByTestId('is-session-checked')).toHaveTextContent('true')

    expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true')

    expect(screen.getByTestId('refresh-token')).toHaveTextContent(
      'refresh-token',
    )

    expect(screen.getByTestId('user-display-name')).toHaveTextContent(
      'Alex Morgan',
    )
  })
})
