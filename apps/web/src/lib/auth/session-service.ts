import {
  exchangeProviderToken,
  logoutSession,
  refreshSession,
} from '@/api/auth'
import { type AuthSessionAdapter, createApiClient } from '@/api/client'
import {
  getFirebaseIdToken,
  getFirebaseProvider,
  signInWithFirebaseEmailPassword,
  signOutFirebaseSession,
  signUpWithFirebaseEmailPassword,
} from '@/lib/auth/firebase-auth'
import { resolveAuthRedirect } from '@/lib/auth/redirect'
import {
  AUTH_DEFAULT_REDIRECT_PATH,
  AUTH_ONBOARDING_REDIRECT_PATH,
} from '@/lib/constants/auth'
import { authActions, useAuthStore } from '@/stores/auth.store'
import type {
  AuthenticatedUserDTO,
  ExchangeProviderResponse,
  RefreshSessionResponse,
} from '@/types/auth'

const isUnauthenticatedError = (error: unknown): boolean =>
  error instanceof Error &&
  ('status' in error || 'code' in error) &&
  ((error as Error & { status?: number }).status === 401 ||
    (error as Error & { code?: string }).code === 'UNAUTHENTICATED')

const applySession = (
  session: ExchangeProviderResponse | RefreshSessionResponse,
  user: AuthenticatedUserDTO | null,
) => {
  authActions.setSession({
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
    user,
  })
}

const clearSessionAfterFailure = (preserveReturnTo: boolean) => {
  authActions.clearSession({
    preserveReturnTo,
  })
}

let authenticatedApiClient: ReturnType<typeof createApiClient> | null = null
const getAuthenticatedApiClient = () => {
  if (!authenticatedApiClient) {
    authenticatedApiClient = createApiClient({
      authSessionAdapter,
    })
  }

  return authenticatedApiClient
}

export const refreshCurrentSession = async () => {
  const refreshToken = useAuthStore.getState().refreshToken

  if (!refreshToken) {
    return null
  }

  try {
    const refreshedSession = await refreshSession({
      refreshToken,
    })

    applySession(refreshedSession, useAuthStore.getState().user)

    return refreshedSession.accessToken
  } catch (error) {
    if (isUnauthenticatedError(error)) {
      clearSessionAfterFailure(true)
    }

    return null
  }
}

export const signInWithEmailPassword = async (input: {
  email: string
  password: string
}) => {
  const credential = await signInWithFirebaseEmailPassword(input)
  try {
    const idToken = await getFirebaseIdToken(credential.user)
    const session = await exchangeProviderToken({
      idToken,
      provider: getFirebaseProvider(),
    })

    applySession(session, session.user)
  } catch (error) {
    try {
      await signOutFirebaseSession()
    } catch {
      // If exchange fails after Firebase sign-in, best-effort sign-out keeps the browser consistent.
    }

    throw error
  }

  const destination = resolveAuthRedirect({
    fallback: AUTH_DEFAULT_REDIRECT_PATH,
    returnTo: useAuthStore.getState().returnTo,
  })

  authActions.clearRoutingState()

  return destination
}

export const signUpWithEmailPassword = async (input: {
  email: string
  name: string
  password: string
}) => {
  const credential = await signUpWithFirebaseEmailPassword(input)
  try {
    const idToken = await getFirebaseIdToken(credential.user)
    const session = await exchangeProviderToken({
      idToken,
      provider: getFirebaseProvider(),
    })

    applySession(session, session.user)
  } catch (error) {
    try {
      await signOutFirebaseSession()
    } catch {
      // If exchange fails after Firebase sign-up, best-effort sign-out keeps the browser consistent.
    }

    throw error
  }

  authActions.setPostAuthRedirect(AUTH_ONBOARDING_REDIRECT_PATH)

  const destination = resolveAuthRedirect({
    fallback: AUTH_ONBOARDING_REDIRECT_PATH,
    postAuthRedirect: useAuthStore.getState().postAuthRedirect,
    returnTo: useAuthStore.getState().returnTo,
  })

  authActions.clearRoutingState()

  return destination
}

export const signOutCurrentSession = async () => {
  try {
    if (useAuthStore.getState().isAuthenticated) {
      await logoutSession(getAuthenticatedApiClient())
    }
  } catch {
    // Logout must still clear local state if the server call fails.
  } finally {
    try {
      await signOutFirebaseSession()
    } catch {
      // Firebase sign-out is best-effort after the app session is revoked.
    }

    clearSessionAfterFailure(false)
  }

  return AUTH_DEFAULT_REDIRECT_PATH
}

export const authSessionAdapter: AuthSessionAdapter = {
  getAccessToken: async () => useAuthStore.getState().accessToken,
  handleUnauthenticated: async () => {
    clearSessionAfterFailure(true)
  },
  refreshSession: async () => refreshCurrentSession(),
}
