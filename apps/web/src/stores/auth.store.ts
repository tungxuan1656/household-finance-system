import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

import { createSelectors } from '@/stores/types'

type AuthUser = {
  email: string
  name: string
}

interface AuthState {
  isAuthenticated: boolean
  returnTo: string | null
  user: AuthUser | null
}

const initialState: AuthState = {
  isAuthenticated: false,
  returnTo: null,
  user: null,
}

const _useAuthStore = create<AuthState>()(
  devtools(() => initialState, {
    name: 'auth-store',
  }),
)

const authActions = {
  setReturnTo: (returnTo: string | null) =>
    _useAuthStore.setState({ returnTo }),
  signIn: (user: AuthUser) =>
    _useAuthStore.setState({
      isAuthenticated: true,
      returnTo: null,
      user,
    }),
  signOut: () => _useAuthStore.setState(initialState),
  signUp: (user: AuthUser) =>
    _useAuthStore.setState({
      isAuthenticated: true,
      returnTo: null,
      user,
    }),
  reset: () => _useAuthStore.setState(initialState),
}

const useAuthStore = createSelectors(_useAuthStore)

export type { AuthState, AuthUser }
export { authActions, useAuthStore }
