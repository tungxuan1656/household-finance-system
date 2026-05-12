import { act } from 'react'
import { beforeEach, describe, expect, it } from 'vitest'

import { authActions, useAuthStore } from '@/stores/auth.store'

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

  it('stores auth-facing fields in state for selector consumers', () => {
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
      isAuthenticated: true,
      isSessionChecked: true,
      refreshToken: 'refresh-token',
      user: {
        displayName: 'Alex Morgan',
      },
    })
  })
})
