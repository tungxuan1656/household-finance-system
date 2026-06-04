import { create } from 'zustand'

import type { AuthenticatedUser } from '@/lib/auth/api'

export type AuthStatus = 'idle' | 'bootstrapping' | 'authenticated' | 'error'

export type AuthErrorCode = 'launchInvalid' | 'networkError' | 'sessionExpired'

export interface AuthError {
  code: AuthErrorCode
  message?: string
}

export interface AuthState {
  status: AuthStatus
  user: AuthenticatedUser | null
  accessToken: string | null
  accessTokenExpiresAt: number | null
  refreshToken: string | null
  error: AuthError | null
  setBootstrapping: () => void
  setSession: (input: {
    user: AuthenticatedUser
    accessToken: string
    accessTokenExpiresIn: number
    refreshToken: string
  }) => void
  refresh: (input: {
    accessToken: string
    accessTokenExpiresIn: number
    refreshToken: string
  }) => void
  setError: (error: AuthError) => void
  reset: () => void
}

const computeExpiry = (ttlSeconds: number): number =>
  Date.now() + ttlSeconds * 1000

const initialState = (): Pick<
  AuthState,
  | 'status'
  | 'user'
  | 'accessToken'
  | 'accessTokenExpiresAt'
  | 'refreshToken'
  | 'error'
> => ({
  status: 'idle',
  user: null,
  accessToken: null,
  accessTokenExpiresAt: null,
  refreshToken: null,
  error: null,
})

export const useAuthStore = create<AuthState>((set) => ({
  ...initialState(),
  setBootstrapping: () =>
    set({
      status: 'bootstrapping',
      error: null,
    }),
  setSession: ({ user, accessToken, accessTokenExpiresIn, refreshToken }) =>
    set({
      status: 'authenticated',
      user,
      accessToken,
      accessTokenExpiresAt: computeExpiry(accessTokenExpiresIn),
      refreshToken,
      error: null,
    }),
  refresh: ({ accessToken, accessTokenExpiresIn, refreshToken }) =>
    set((state) => ({
      status: 'authenticated',
      user: state.user,
      accessToken,
      accessTokenExpiresAt: computeExpiry(accessTokenExpiresIn),
      refreshToken,
      error: null,
    })),
  setError: (error) =>
    set({
      status: 'error',
      error,
    }),
  reset: () => set({ ...initialState(), status: 'idle' }),
}))

export const getAuthSnapshot = () => useAuthStore.getState()
