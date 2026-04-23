import {
  exchangeProviderToken,
  logoutSession,
  refreshSession,
} from '@/api/auth'
import { type AuthSessionAdapter, createApiClient } from '@/api/client'
import {
  getFirebaseCurrentUser,
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
import { authRefreshTokenStorage } from '@/lib/storages/auth-refresh-token-storage'
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

let sessionMutationVersion = 0

const markSessionMutation = () => {
  sessionMutationVersion += 1

  return sessionMutationVersion
}

const isStaleBootstrap = (bootstrapVersion: number) =>
  bootstrapVersion !== sessionMutationVersion

const readCurrentUser = async (): Promise<AuthenticatedUserDTO | null> => {
  const firebaseUser = await getFirebaseCurrentUser()

  if (!firebaseUser) {
    return useAuthStore.getState().user
  }

  return {
    avatarUrl: firebaseUser.photoURL,
    displayName: firebaseUser.displayName,
    email: firebaseUser.email,
    id: firebaseUser.uid,
    provider: getFirebaseProvider(),
  }
}

const applySession = async (
  session: ExchangeProviderResponse | RefreshSessionResponse,
  options: {
    refreshSessionCallback: () => Promise<unknown>
    user?: AuthenticatedUserDTO | null
  },
) => {
  markSessionMutation()
  authRefreshTokenStorage.write(session.refreshToken)

  authActions.setSession({
    accessToken: session.accessToken,
    accessTokenExpiresIn: session.accessTokenExpiresIn,
    refreshSession: async () => {
      await options.refreshSessionCallback()
    },
    user:
      options.user ?? (await readCurrentUser()) ?? useAuthStore.getState().user,
  })
}

const clearSessionAfterFailure = (preserveReturnTo: boolean) => {
  markSessionMutation()
  authRefreshTokenStorage.clear()

  authActions.clearSession({
    preserveReturnTo,
  })
}

const refreshSessionFromStorage = async () => {
  const refreshToken = authRefreshTokenStorage.read()

  if (!refreshToken) {
    return { kind: 'missing' as const }
  }

  try {
    const refreshedSession = await refreshSession({
      refreshToken,
    })

    return {
      kind: 'restored' as const,
      session: refreshedSession,
    }
  } catch (error) {
    return {
      kind: isUnauthenticatedError(error)
        ? ('unauthenticated' as const)
        : ('failed' as const),
    }
  }
}

const restoreFromRefreshToken = async (
  preserveReturnTo: boolean,
  bootstrapVersion: number,
) => {
  const result = await refreshSessionFromStorage()

  if (isStaleBootstrap(bootstrapVersion)) {
    return
  }

  if (result.kind === 'missing') {
    authActions.clearSession({
      preserveReturnTo,
    })

    return
  }

  if (result.kind === 'restored') {
    if (isStaleBootstrap(bootstrapVersion)) {
      return
    }

    const user = await readCurrentUser()

    if (isStaleBootstrap(bootstrapVersion)) {
      return
    }

    await applySession(result.session, {
      refreshSessionCallback: refreshCurrentSession,
      user,
    })

    return
  }

  if (result.kind === 'unauthenticated') {
    clearSessionAfterFailure(preserveReturnTo)

    return
  }

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

export const bootstrapAuthSession = async () => {
  if (useAuthStore.getState().bootstrapComplete) {
    return
  }

  authActions.setBootstrapping()

  const bootstrapVersion = sessionMutationVersion

  try {
    await restoreFromRefreshToken(true, bootstrapVersion)
  } catch {
    if (isStaleBootstrap(bootstrapVersion)) {
      return
    }

    clearSessionAfterFailure(true)
  }
}

export const refreshCurrentSession = async () => {
  const refreshToken = authRefreshTokenStorage.read()

  if (!refreshToken) {
    return null
  }

  try {
    const refreshedSession = await refreshSession({
      refreshToken,
    })

    await applySession(refreshedSession, {
      refreshSessionCallback: refreshCurrentSession,
      user: await readCurrentUser(),
    })

    return refreshedSession.accessToken
  } catch {
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

    await applySession(session, {
      refreshSessionCallback: refreshCurrentSession,
      user: session.user,
    })
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

    await applySession(session, {
      refreshSessionCallback: refreshCurrentSession,
      user: session.user,
    })
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
