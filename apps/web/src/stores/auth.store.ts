import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

import { AUTH_ACCESS_TOKEN_REFRESH_LEAD_TIME_MS } from '@/lib/constants/auth'
import { createSelectors } from '@/stores/types'
import type { AuthenticatedUserDTO } from '@/types/auth'

type AuthSessionState = {
  accessToken: string | null
  accessTokenExpiresAt: number | null
  bootstrapComplete: boolean
  isAuthenticated: boolean
  postAuthRedirect: string | null
  returnTo: string | null
  user: AuthenticatedUserDTO | null
}

type SetSessionInput = {
  accessToken: string
  accessTokenExpiresIn: number
  refreshSession: () => Promise<unknown>
  user: AuthenticatedUserDTO | null
}

type ClearSessionInput = {
  preserveReturnTo?: boolean
}

type AuthStoreActions = {
  clearRoutingState: () => void
  clearSession: (input?: ClearSessionInput) => void
  reset: () => void
  setBootstrapping: () => void
  setPostAuthRedirect: (postAuthRedirect: string | null) => void
  setReturnTo: (returnTo: string | null) => void
  setSession: (input: SetSessionInput) => void
}

const initialState: AuthSessionState = {
  accessToken: null,
  accessTokenExpiresAt: null,
  bootstrapComplete: false,
  isAuthenticated: false,
  postAuthRedirect: null,
  returnTo: null,
  user: null,
}

let refreshTimer: ReturnType<typeof setTimeout> | null = null

const clearScheduledRefresh = () => {
  if (refreshTimer) {
    clearTimeout(refreshTimer)
    refreshTimer = null
  }
}

const scheduleSilentRefresh = (
  accessTokenExpiresIn: number,
  refreshSession: () => Promise<unknown>,
) => {
  clearScheduledRefresh()

  const delayMs = Math.max(
    accessTokenExpiresIn * 1000 - AUTH_ACCESS_TOKEN_REFRESH_LEAD_TIME_MS,
    1_000,
  )

  refreshTimer = setTimeout(() => {
    void refreshSession()
  }, delayMs)
}

const _useAuthStore = create<AuthSessionState & AuthStoreActions>()(
  devtools(() => initialState, {
    name: 'auth-store',
  }),
)

const authActions: AuthStoreActions = {
  clearRoutingState: () =>
    _useAuthStore.setState({
      postAuthRedirect: null,
      returnTo: null,
    }),
  clearSession: (input) => {
    clearScheduledRefresh()

    _useAuthStore.setState((state) => ({
      accessToken: null,
      accessTokenExpiresAt: null,
      bootstrapComplete: true,
      isAuthenticated: false,
      postAuthRedirect: null,
      returnTo: input?.preserveReturnTo ? state.returnTo : null,
      user: null,
    }))
  },
  reset: () => {
    clearScheduledRefresh()
    _useAuthStore.setState(initialState)
  },
  setBootstrapping: () =>
    _useAuthStore.setState({
      bootstrapComplete: false,
    }),
  setPostAuthRedirect: (postAuthRedirect) =>
    _useAuthStore.setState({
      postAuthRedirect,
    }),
  setReturnTo: (returnTo) =>
    _useAuthStore.setState({
      returnTo,
    }),
  setSession: (input) => {
    clearScheduledRefresh()

    _useAuthStore.setState({
      accessToken: input.accessToken,
      accessTokenExpiresAt: Date.now() + input.accessTokenExpiresIn * 1000,
      bootstrapComplete: true,
      isAuthenticated: true,
      user: input.user,
    })

    scheduleSilentRefresh(input.accessTokenExpiresIn, input.refreshSession)
  },
}

const useAuthStore = createSelectors(_useAuthStore)

export type { AuthSessionState, ClearSessionInput, SetSessionInput }
export { authActions, useAuthStore }
