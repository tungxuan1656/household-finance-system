import { describe, expect, it, vi } from 'vitest'

const firebaseMocks = vi.hoisted(() => {
  const readyUser = {
    displayName: 'Alex Morgan',
    email: 'alex@example.com',
    photoURL: null,
    uid: 'firebase-user',
  }

  const authState = {
    currentUser: null as unknown,
  }

  const auth = {
    authStateReady: vi.fn(async () => {
      authState.currentUser = readyUser
    }),
    get currentUser() {
      return authState.currentUser
    },
  }

  return {
    auth,
    authState,
    readyUser,
    getApps: vi.fn(() => [{ name: '[DEFAULT]' }]),
    getAuth: vi.fn(() => auth),
    initializeApp: vi.fn(() => ({ name: '[DEFAULT]' })),
    setPersistence: vi.fn(async () => undefined),
  }
})

vi.mock('firebase/app', () => ({
  getApps: firebaseMocks.getApps,
  initializeApp: firebaseMocks.initializeApp,
}))

vi.mock('firebase/auth', () => ({
  browserLocalPersistence: {},
  createUserWithEmailAndPassword: vi.fn(),
  getAuth: firebaseMocks.getAuth,
  getIdToken: vi.fn(),
  onAuthStateChanged: vi.fn(),
  setPersistence: firebaseMocks.setPersistence,
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  updateProfile: vi.fn(),
}))

import { getFirebaseCurrentUser } from '@/lib/auth/firebase-auth'

describe('firebase auth adapter', () => {
  it('waits for auth state readiness before reading the current user', async () => {
    await expect(getFirebaseCurrentUser()).resolves.toMatchObject({
      uid: 'firebase-user',
    })

    expect(firebaseMocks.setPersistence).toHaveBeenCalledTimes(1)
    expect(firebaseMocks.auth.authStateReady).toHaveBeenCalledTimes(1)

    expect(firebaseMocks.authState.currentUser).toMatchObject({
      uid: 'firebase-user',
    })
  })
})
