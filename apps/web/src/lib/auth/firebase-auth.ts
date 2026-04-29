import { type FirebaseApp, getApps, initializeApp } from 'firebase/app'
import {
  type Auth,
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  getAuth,
  getIdToken,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth'

import type { AuthProvider } from '@/types/auth'

type FirebaseAuthConfig = {
  apiKey: string
  appId: string
  authDomain: string
  projectId: string
}

const readFirebaseConfig = (): FirebaseAuthConfig => {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  }

  if (
    !config.apiKey ||
    !config.appId ||
    !config.authDomain ||
    !config.projectId
  ) {
    throw new Error(
      'Missing Firebase web config. Set NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_APP_ID, NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, and NEXT_PUBLIC_FIREBASE_PROJECT_ID.',
    )
  }

  return config as FirebaseAuthConfig
}

let firebaseApp: FirebaseApp | null = null
let firebaseAuthPromise: Promise<Auth> | null = null

const waitForFirebaseAuthReady = async (auth: Auth) => {
  const readyAuth = auth as Auth & {
    authStateReady?: () => Promise<void>
  }

  if (typeof readyAuth.authStateReady === 'function') {
    await readyAuth.authStateReady()

    return
  }

  await new Promise<void>((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, () => {
      unsubscribe()
      resolve()
    })
  })
}

const getFirebaseApp = () => {
  if (firebaseApp) {
    return firebaseApp
  }

  firebaseApp =
    getApps().find((app) => app.name === '[DEFAULT]') ??
    initializeApp(readFirebaseConfig())

  return firebaseApp
}

const getFirebaseAuth = async () => {
  if (!firebaseAuthPromise) {
    firebaseAuthPromise = (async () => {
      const auth = getAuth(getFirebaseApp())
      try {
        await setPersistence(auth, browserLocalPersistence)
        await waitForFirebaseAuthReady(auth)
      } catch (error) {
        firebaseAuthPromise = null
        throw error
      }

      return auth
    })()
  }

  return firebaseAuthPromise
}

export const getFirebaseCurrentUser = async () => {
  const auth = await getFirebaseAuth()

  return auth.currentUser
}

export const signInWithFirebaseEmailPassword = async (input: {
  email: string
  password: string
}) =>
  signInWithEmailAndPassword(
    await getFirebaseAuth(),
    input.email,
    input.password,
  )

export const signUpWithFirebaseEmailPassword = async (input: {
  email: string
  name: string
  password: string
}) => {
  const credential = await createUserWithEmailAndPassword(
    await getFirebaseAuth(),
    input.email,
    input.password,
  )

  if (input.name) {
    await updateProfile(credential.user, {
      displayName: input.name,
    })
  }

  return credential
}

export const signOutFirebaseSession = async () => {
  await signOut(await getFirebaseAuth())
}

export const getFirebaseIdToken = async (firebaseUser: User) =>
  getIdToken(firebaseUser, true)

export const getFirebaseProvider = (): AuthProvider => 'firebase'
