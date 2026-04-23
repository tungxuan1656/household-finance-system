import { beforeEach, describe, expect, it, vi } from 'vitest'

import type {
  AuthenticatedUserDTO,
  ExchangeProviderResponse,
  RefreshSessionResponse,
} from '@/types/auth'

const mocks = vi.hoisted(() => {
  const authState = {
    accessToken: null as string | null,
    accessTokenExpiresAt: null as number | null,
    bootstrapComplete: false,
    isAuthenticated: false,
    postAuthRedirect: null as string | null,
    returnTo: null as string | null,
    user: null as AuthenticatedUserDTO | null,
  }

  const resetAuthState = () => {
    authState.accessToken = null
    authState.accessTokenExpiresAt = null
    authState.bootstrapComplete = false
    authState.isAuthenticated = false
    authState.postAuthRedirect = null
    authState.returnTo = null
    authState.user = null
  }

  const refreshSessionValue = {
    current: 'refresh-token',
  }

  const authActions = {
    clearRoutingState: vi.fn(() => {
      authState.postAuthRedirect = null
      authState.returnTo = null
    }),
    clearSession: vi.fn((input?: { preserveReturnTo?: boolean }) => {
      authState.accessToken = null
      authState.accessTokenExpiresAt = null
      authState.bootstrapComplete = true
      authState.isAuthenticated = false
      authState.postAuthRedirect = null
      authState.returnTo = input?.preserveReturnTo ? authState.returnTo : null
      authState.user = null
    }),
    reset: vi.fn(() => {
      resetAuthState()
    }),
    setBootstrapping: vi.fn(() => {
      authState.bootstrapComplete = false
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
        accessTokenExpiresIn: number
        refreshSession: () => Promise<unknown>
        user: AuthenticatedUserDTO | null
      }) => {
        authState.accessToken = input.accessToken

        authState.accessTokenExpiresAt =
          Date.now() + input.accessTokenExpiresIn * 1000

        authState.bootstrapComplete = true
        authState.isAuthenticated = true
        authState.user = input.user
      },
    ),
  }

  return {
    authActions,
    authState,
    refreshSessionValue,
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

const createDeferred = <T>() => {
  let resolve!: (value: T | PromiseLike<T>) => void
  let reject!: (reason?: unknown) => void

  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolve = promiseResolve
    reject = promiseReject
  })

  return {
    promise,
    reject,
    resolve,
  }
}

vi.mock('@/api/auth', () => ({
  exchangeProviderToken: vi.fn(),
  logoutSession: vi.fn(),
  refreshSession: vi.fn(),
}))

vi.mock('@/api/client', () => ({
  createApiClient: vi.fn(() => ({})),
}))

vi.mock('@/lib/auth/firebase-auth', () => ({
  getFirebaseCurrentUser: vi.fn(),
  getFirebaseIdToken: vi.fn(),
  getFirebaseProvider: vi.fn(() => 'firebase'),
  signInWithFirebaseEmailPassword: vi.fn(),
  signOutFirebaseSession: vi.fn(),
  signUpWithFirebaseEmailPassword: vi.fn(),
}))

vi.mock('@/lib/auth/redirect', () => ({
  resolveAuthRedirect: vi.fn(() => '/app'),
}))

vi.mock('@/lib/storages/auth-refresh-token-storage', () => ({
  authRefreshTokenStorage: {
    clear: vi.fn(),
    read: vi.fn(() => mocks.refreshSessionValue.current),
    write: vi.fn(),
  },
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
  getFirebaseCurrentUser,
  getFirebaseIdToken,
  signInWithFirebaseEmailPassword,
  signOutFirebaseSession,
  signUpWithFirebaseEmailPassword,
} from '@/lib/auth/firebase-auth'
import {
  bootstrapAuthSession,
  signInWithEmailPassword,
  signUpWithEmailPassword,
} from '@/lib/auth/session-service'
import { authRefreshTokenStorage } from '@/lib/storages/auth-refresh-token-storage'
import { authActions, useAuthStore } from '@/stores/auth.store'

describe('auth session service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.authActions.reset()
    mocks.refreshSessionValue.current = 'refresh-token'
    useAuthStore.getState().bootstrapComplete = false
    useAuthStore.getState().isAuthenticated = false
  })

  it('ignores a stale bootstrap result after a newer sign-in completes', async () => {
    const deferredSession = createDeferred<RefreshSessionResponse>()
    vi.mocked(refreshSession).mockReturnValueOnce(deferredSession.promise)

    vi.mocked(signInWithFirebaseEmailPassword).mockResolvedValueOnce({
      user: {
        uid: 'firebase-user',
      },
    } as never)

    vi.mocked(getFirebaseIdToken).mockResolvedValueOnce('firebase-id-token')
    vi.mocked(exchangeProviderToken).mockResolvedValueOnce(createSession())

    const bootstrapPromise = bootstrapAuthSession()

    await signInWithEmailPassword({
      email: 'alex@example.com',
      password: 'secret-password',
    })

    deferredSession.resolve(createSession())

    await bootstrapPromise

    expect(authActions.setSession).toHaveBeenCalledTimes(1)
    expect(getFirebaseCurrentUser).not.toHaveBeenCalled()
    expect(authActions.clearSession).not.toHaveBeenCalled()
    expect(authRefreshTokenStorage.write).toHaveBeenCalledTimes(1)
  })

  it('finalizes bootstrap when Firebase auth initialization fails', async () => {
    vi.mocked(refreshSession).mockResolvedValueOnce(createSession())

    vi.mocked(getFirebaseCurrentUser).mockRejectedValueOnce(
      new Error('firebase auth init failed'),
    )

    await bootstrapAuthSession()

    expect(authActions.setBootstrapping).toHaveBeenCalledTimes(1)
    expect(authActions.clearSession).toHaveBeenCalledTimes(1)
    expect(authActions.setSession).not.toHaveBeenCalled()
    expect(useAuthStore.getState().bootstrapComplete).toBe(true)
  })

  it('signs out Firebase when provider exchange fails during sign-in', async () => {
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
    expect(authRefreshTokenStorage.write).not.toHaveBeenCalled()
  })

  it('signs out Firebase when provider exchange fails during sign-up', async () => {
    vi.mocked(signUpWithFirebaseEmailPassword).mockResolvedValueOnce({
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
      signUpWithEmailPassword({
        email: 'alex@example.com',
        name: 'Alex Morgan',
        password: 'secret-password',
      }),
    ).rejects.toThrow('exchange failed')

    expect(signOutFirebaseSession).toHaveBeenCalledTimes(1)
    expect(authActions.setSession).not.toHaveBeenCalled()
    expect(authRefreshTokenStorage.write).not.toHaveBeenCalled()
  })
})
