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
  telegramUserId: number | null
  accessToken: string | null
  accessTokenExpiresAt: number | null
  refreshToken: string | null
  refreshTokenExpiresAt: number | null
  error: AuthError | null
  setBootstrapping: () => void
  setSession: (input: {
    user: AuthenticatedUser
    telegramUserId: number | null
    accessToken: string
    accessTokenExpiresIn: number
    refreshToken: string
    refreshTokenExpiresIn: number
  }) => void
  restoreSession: (input: {
    user: AuthenticatedUser
    telegramUserId: number
    accessToken: string
    accessTokenExpiresAt: number
    refreshToken: string
    refreshTokenExpiresAt: number
  }) => void
  refresh: (input: {
    accessToken: string
    accessTokenExpiresIn: number
    refreshToken: string
    refreshTokenExpiresIn: number
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
  | 'telegramUserId'
  | 'accessToken'
  | 'accessTokenExpiresAt'
  | 'refreshToken'
  | 'refreshTokenExpiresAt'
  | 'error'
> => ({
  status: 'idle',
  user: null,
  telegramUserId: null,
  accessToken: null,
  accessTokenExpiresAt: null,
  refreshToken: null,
  refreshTokenExpiresAt: null,
  error: null,
})

export const useAuthStore = create<AuthState>((set) => ({
  ...initialState(),
  setBootstrapping: () =>
    set({
      status: 'bootstrapping',
      error: null,
    }),
  setSession: ({
    user,
    telegramUserId,
    accessToken,
    accessTokenExpiresIn,
    refreshToken,
    refreshTokenExpiresIn,
  }) =>
    set({
      status: 'authenticated',
      user,
      telegramUserId,
      accessToken,
      accessTokenExpiresAt: computeExpiry(accessTokenExpiresIn),
      refreshToken,
      refreshTokenExpiresAt: computeExpiry(refreshTokenExpiresIn),
      error: null,
    }),
  restoreSession: ({
    user,
    telegramUserId,
    accessToken,
    accessTokenExpiresAt,
    refreshToken,
    refreshTokenExpiresAt,
  }) =>
    set({
      status: 'authenticated',
      user,
      telegramUserId,
      accessToken,
      accessTokenExpiresAt,
      refreshToken,
      refreshTokenExpiresAt,
      error: null,
    }),
  refresh: ({
    accessToken,
    accessTokenExpiresIn,
    refreshToken,
    refreshTokenExpiresIn,
  }) =>
    set((state) => ({
      status: 'authenticated',
      user: state.user,
      telegramUserId: state.telegramUserId,
      accessToken,
      accessTokenExpiresAt: computeExpiry(accessTokenExpiresIn),
      refreshToken,
      refreshTokenExpiresAt: computeExpiry(refreshTokenExpiresIn),
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
