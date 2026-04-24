import { beforeEach, describe, expect, it, vi } from 'vitest'

import type {
  AuthenticatedUserDTO,
  ExchangeProviderResponse,
  RefreshSessionResponse,
} from '@/types/auth'

const mocks = vi.hoisted(() => {
  const authState = {
    accessToken: null as string | null,
    isAuthenticated: false,
    isSessionChecked: false,
    postAuthRedirect: null as string | null,
    refreshToken: null as string | null,
    returnTo: null as string | null,
    user: null as AuthenticatedUserDTO | null,
  }

  const resetAuthState = () => {
    authState.accessToken = null
    authState.isAuthenticated = false
    authState.isSessionChecked = false
    authState.postAuthRedirect = null
    authState.refreshToken = null
    authState.returnTo = null
    authState.user = null
  }

  const authActions = {
    clearRoutingState: vi.fn(() => {
      authState.postAuthRedirect = null
      authState.returnTo = null
    }),
    clearSession: vi.fn((input?: { preserveReturnTo?: boolean }) => {
      authState.accessToken = null
      authState.isAuthenticated = false
      authState.isSessionChecked = true
      authState.postAuthRedirect = null
      authState.refreshToken = null
      authState.returnTo = input?.preserveReturnTo ? authState.returnTo : null
      authState.user = null
    }),
    markSessionChecked: vi.fn(() => {
      authState.isSessionChecked = true
    }),
    reset: vi.fn(() => {
      resetAuthState()
    }),
    setPostAuthRedirect: vi.fn((postAuthRedirect: string | null) => {
      authState.postAuthRedirect = postAuthRedirect
    }),
    setReturnTo: vi.fn((returnTo: string | null) => {
      authState.returnTo = returnTo
    }),
    setSession: vi.fn(
      (input: {
        accessToken: string
        refreshToken: string
        user: AuthenticatedUserDTO | null
      }) => {
        authState.accessToken = input.accessToken
        authState.isAuthenticated = true
        authState.isSessionChecked = true
        authState.refreshToken = input.refreshToken
        authState.user = input.user
      },
    ),
  }

  return {
    authActions,
    authState,
  }
})

const createSession = (
  overrides: Partial<RefreshSessionResponse> & {
    user?: AuthenticatedUserDTO
  } = {},
): ExchangeProviderResponse & RefreshSessionResponse => ({
  accessToken: 'access-token',
  accessTokenExpiresIn: 120,
  refreshToken: 'refresh-token',
  refreshTokenExpiresIn: 3600,
  tokenType: 'Bearer',
  user: {
    avatarUrl: null,
    displayName: 'Alex Morgan',
    email: 'alex@example.com',
    id: 'user-1',
    provider: 'firebase',
  },
  ...overrides,
})

vi.mock('@/api/auth', () => ({
  exchangeProviderToken: vi.fn(),
  logoutSession: vi.fn(),
  refreshSession: vi.fn(),
}))

vi.mock('@/api/client', () => ({
  createApiClient: vi.fn(() => ({
    post: vi.fn(async () => ({
      revoked: true,
    })),
  })),
}))

vi.mock('@/lib/auth/firebase-auth', () => ({
  getFirebaseIdToken: vi.fn(),
  getFirebaseProvider: vi.fn(() => 'firebase'),
  signInWithFirebaseEmailPassword: vi.fn(),
  signOutFirebaseSession: vi.fn(),
  signUpWithFirebaseEmailPassword: vi.fn(),
}))

vi.mock('@/lib/auth/redirect', () => ({
  resolveAuthRedirect: vi.fn(() => '/app'),
}))

vi.mock('@/stores/auth.store', () => ({
  authActions: mocks.authActions,
  useAuthStore: {
    getState: () => mocks.authState,
  },
}))

vi.mock('@/lib/constants/auth', () => ({
  AUTH_DEFAULT_REDIRECT_PATH: '/app',
  AUTH_ONBOARDING_REDIRECT_PATH: '/app/onboarding',
}))

import { exchangeProviderToken, refreshSession } from '@/api/auth'
import {
  getFirebaseIdToken,
  signInWithFirebaseEmailPassword,
  signOutFirebaseSession,
  signUpWithFirebaseEmailPassword,
} from '@/lib/auth/firebase-auth'
import {
  refreshCurrentSession,
  signInWithEmailPassword,
  signUpWithEmailPassword,
} from '@/lib/auth/session-service'
import { authActions, useAuthStore } from '@/stores/auth.store'

describe('auth session service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.authActions.reset()
  })

  it('stores backend user + tokens on sign-in', async () => {
    vi.mocked(signInWithFirebaseEmailPassword).mockResolvedValueOnce({
      user: {
        uid: 'firebase-user',
      },
    } as never)

    vi.mocked(getFirebaseIdToken).mockResolvedValueOnce('firebase-id-token')
    vi.mocked(exchangeProviderToken).mockResolvedValueOnce(createSession())

    await signInWithEmailPassword({
      email: 'alex@example.com',
      password: 'secret-password',
    })

    expect(authActions.setSession).toHaveBeenCalledWith(
      expect.objectContaining({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: expect.objectContaining({
          displayName: 'Alex Morgan',
        }),
      }),
    )
  })

  it('signs out Firebase when exchange fails during sign-in', async () => {
    vi.mocked(signInWithFirebaseEmailPassword).mockResolvedValueOnce({
      user: {
        uid: 'firebase-user',
      },
    } as never)

    vi.mocked(getFirebaseIdToken).mockResolvedValueOnce('firebase-id-token')

    vi.mocked(exchangeProviderToken).mockRejectedValueOnce(
      new Error('exchange failed'),
    )

    vi.mocked(signOutFirebaseSession).mockResolvedValueOnce(undefined)

    await expect(
      signInWithEmailPassword({
        email: 'alex@example.com',
        password: 'secret-password',
      }),
    ).rejects.toThrow('exchange failed')

    expect(signOutFirebaseSession).toHaveBeenCalledTimes(1)
    expect(authActions.setSession).not.toHaveBeenCalled()
  })

  it('stores onboarding redirect + session on sign-up', async () => {
    vi.mocked(signUpWithFirebaseEmailPassword).mockResolvedValueOnce({
      user: {
        uid: 'firebase-user',
      },
    } as never)

    vi.mocked(getFirebaseIdToken).mockResolvedValueOnce('firebase-id-token')
    vi.mocked(exchangeProviderToken).mockResolvedValueOnce(createSession())

    await signUpWithEmailPassword({
      email: 'alex@example.com',
      name: 'Alex Morgan',
      password: 'secret-password',
    })

    expect(authActions.setSession).toHaveBeenCalled()

    expect(authActions.setPostAuthRedirect).toHaveBeenCalledWith(
      '/app/onboarding',
    )
  })

  it('rotates tokens with refreshCurrentSession and keeps existing user', async () => {
    useAuthStore.getState().refreshToken = 'refresh-token'

    useAuthStore.getState().user = {
      avatarUrl: null,
      displayName: 'Existing User',
      email: 'existing@example.com',
      id: 'user-1',
      provider: 'firebase',
    }

    vi.mocked(refreshSession).mockResolvedValueOnce(
      createSession({
        accessToken: 'fresh-access-token',
        refreshToken: 'fresh-refresh-token',
      }),
    )

    const accessToken = await refreshCurrentSession()

    expect(accessToken).toBe('fresh-access-token')

    expect(authActions.setSession).toHaveBeenCalledWith({
      accessToken: 'fresh-access-token',
      refreshToken: 'fresh-refresh-token',
      user: expect.objectContaining({
        displayName: 'Existing User',
      }),
    })
  })

  it('clears session when refresh returns unauthenticated', async () => {
    useAuthStore.getState().refreshToken = 'refresh-token'

    const unauthenticatedError = new Error('session expired') as Error & {
      code: string
      status: number
    }
    unauthenticatedError.code = 'UNAUTHENTICATED'
    unauthenticatedError.status = 401

    vi.mocked(refreshSession).mockRejectedValueOnce(unauthenticatedError)

    const accessToken = await refreshCurrentSession()

    expect(accessToken).toBeNull()

    expect(authActions.clearSession).toHaveBeenCalledWith({
      preserveReturnTo: true,
    })
  })
})
