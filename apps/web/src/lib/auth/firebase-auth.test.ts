import { describe, expect, it, vi } from 'vitest'

const firebaseMocks = vi.hoisted(() => {
  const readyUser = {
    delete: vi.fn(async () => undefined),
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
    reauthenticateWithCredential: vi.fn(async () => undefined),
    setPersistence: vi.fn(async () => undefined),
    updatePassword: vi.fn(async () => undefined),
    credential: vi.fn(() => ({ providerId: 'password' })),
  }
})

vi.mock('firebase/app', () => ({
  getApps: firebaseMocks.getApps,
  initializeApp: firebaseMocks.initializeApp,
}))

vi.mock('firebase/auth', () => ({
  browserLocalPersistence: {},
  createUserWithEmailAndPassword: vi.fn(),
  EmailAuthProvider: {
    credential: firebaseMocks.credential,
  },
  getAuth: firebaseMocks.getAuth,
  getIdToken: vi.fn(),
  onAuthStateChanged: vi.fn(),
  reauthenticateWithCredential: firebaseMocks.reauthenticateWithCredential,
  setPersistence: firebaseMocks.setPersistence,
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  updatePassword: firebaseMocks.updatePassword,
  updateProfile: vi.fn(),
}))

import {
  changeFirebasePassword,
  deleteCurrentFirebaseUser,
  getFirebaseCurrentUser,
} from '@/lib/auth/firebase-auth'

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

  it('reauthenticates before changing the current Firebase password', async () => {
    await changeFirebasePassword({
      currentPassword: 'old-password',
      newPassword: 'new-password',
    })

    expect(firebaseMocks.credential).toHaveBeenCalledWith(
      'alex@example.com',
      'old-password',
    )

    expect(firebaseMocks.reauthenticateWithCredential).toHaveBeenCalledWith(
      firebaseMocks.readyUser,
      { providerId: 'password' },
    )

    expect(firebaseMocks.updatePassword).toHaveBeenCalledWith(
      firebaseMocks.readyUser,
      'new-password',
    )
  })

  it('reauthenticates before deleting the current Firebase user', async () => {
    await deleteCurrentFirebaseUser({ currentPassword: 'old-password' })

    expect(firebaseMocks.credential).toHaveBeenCalledWith(
      'alex@example.com',
      'old-password',
    )

    expect(firebaseMocks.reauthenticateWithCredential).toHaveBeenCalledWith(
      firebaseMocks.readyUser,
      { providerId: 'password' },
    )

    expect(firebaseMocks.readyUser.delete).toHaveBeenCalledTimes(1)
  })
})
