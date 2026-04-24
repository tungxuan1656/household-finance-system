import { create } from 'zustand'
import { createJSONStorage, devtools, persist } from 'zustand/middleware'

import { createSelectors } from '@/stores/types'
import type { AuthenticatedUserDTO } from '@/types/auth'

type AuthSessionState = {
  accessToken: string | null
  isAuthenticated: boolean
  isSessionChecked: boolean
  postAuthRedirect: string | null
  refreshToken: string | null
  returnTo: string | null
  user: AuthenticatedUserDTO | null
}

type SetSessionInput = {
  accessToken: string
  refreshToken: string
  user: AuthenticatedUserDTO | null
}

type ClearSessionInput = {
  preserveReturnTo?: boolean
}

type AuthStoreActions = {
  clearRoutingState: () => void
  clearSession: (input?: ClearSessionInput) => void
  markSessionChecked: () => void
  reset: () => void
  setPostAuthRedirect: (postAuthRedirect: string | null) => void
  setReturnTo: (returnTo: string | null) => void
  setSession: (input: SetSessionInput) => void
}

const initialState: AuthSessionState = {
  accessToken: null,
  isAuthenticated: false,
  isSessionChecked: false,
  postAuthRedirect: null,
  refreshToken: null,
  returnTo: null,
  user: null,
}

const _useAuthStore = create<AuthSessionState>()(
  devtools(
    persist(() => initialState, {
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...(persistedState as Partial<AuthSessionState>),
        isSessionChecked: true,
      }),
      name: 'auth-store',
      partialize: (state) => ({
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
      storage: createJSONStorage(() => localStorage),
    }),
    {
      name: 'auth-store',
    },
  ),
)

const authActions: AuthStoreActions = {
  clearRoutingState: () =>
    _useAuthStore.setState({
      postAuthRedirect: null,
      returnTo: null,
    }),
  clearSession: (input) =>
    _useAuthStore.setState((state) => ({
      accessToken: null,
      isAuthenticated: false,
      isSessionChecked: true,
      postAuthRedirect: null,
      refreshToken: null,
      returnTo: input?.preserveReturnTo ? state.returnTo : null,
      user: null,
    })),
  markSessionChecked: () =>
    _useAuthStore.setState({
      isSessionChecked: true,
    }),
  reset: () => {
    _useAuthStore.setState(initialState)
    void _useAuthStore.persist.clearStorage()
  },
  setPostAuthRedirect: (postAuthRedirect) =>
    _useAuthStore.setState({
      postAuthRedirect,
    }),
  setReturnTo: (returnTo) =>
    _useAuthStore.setState({
      returnTo,
    }),
  setSession: (input) =>
    _useAuthStore.setState({
      accessToken: input.accessToken,
      isAuthenticated: true,
      isSessionChecked: true,
      refreshToken: input.refreshToken,
      user: input.user,
    }),
}

const useAuthStore = createSelectors(_useAuthStore)

export type { AuthSessionState, ClearSessionInput, SetSessionInput }
export { authActions, useAuthStore }
