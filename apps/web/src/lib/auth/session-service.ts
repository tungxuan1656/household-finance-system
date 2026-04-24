import { exchangeProviderToken, logoutSession } from '@/api/auth'
import {
  getFirebaseIdToken,
  getFirebaseProvider,
  signInWithFirebaseEmailPassword,
  signOutFirebaseSession,
  signUpWithFirebaseEmailPassword,
} from '@/lib/auth/firebase-auth'
import { authActions, useAuthStore } from '@/stores/auth.store'

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

    authActions.setSession({
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      user: session.user,
    })
  } catch (error) {
    try {
      await signOutFirebaseSession()
    } catch {
      // Best effort only.
    }

    throw error
  }
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

    authActions.setSession({
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      user: session.user,
    })
  } catch (error) {
    try {
      await signOutFirebaseSession()
    } catch {
      // Best effort only.
    }

    throw error
  }
}

export const signOutCurrentSession = async () => {
  try {
    if (useAuthStore.getState().isAuthenticated) {
      await logoutSession()
    }
  } catch {
    // Even if the server logout fails, clear local state below.
  } finally {
    try {
      await signOutFirebaseSession()
    } catch {
      // Best effort only.
    }

    authActions.clearSession()
  }
}
