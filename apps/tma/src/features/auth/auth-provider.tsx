import { createContext, type ReactNode, useContext, useMemo } from 'react'

import type { AuthenticatedUser } from '@/lib/auth/api'

import { type AuthStatus, useAuthStore } from './store'

export interface AuthContextValue {
  status: 'idle' | 'bootstrapping' | 'authenticated' | 'error'
  user: AuthenticatedUser | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export const deriveIsAuthenticated = (
  status: AuthStatus,
  accessToken: string | null,
): boolean => status === 'authenticated' && Boolean(accessToken)

export interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const status = useAuthStore((state) => state.status)
  const user = useAuthStore((state) => state.user)
  const accessToken = useAuthStore((state) => state.accessToken)
  const refreshToken = useAuthStore((state) => state.refreshToken)

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      accessToken,
      refreshToken,
      isAuthenticated: deriveIsAuthenticated(status, accessToken),
    }),
    [status, user, accessToken, refreshToken],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside an <AuthProvider>')
  }

  return context
}
