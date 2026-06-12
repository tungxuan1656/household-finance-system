import type {
  AuthApiClient,
  ExchangeProviderResponse,
  RefreshSessionResponse,
} from '@/lib/auth/api'
import { AuthApiError } from '@/lib/auth/api'

import { type AuthErrorCode, useAuthStore } from './store'

export interface AuthBootstrapDeps {
  loadLaunchData: () => string | null
  loadRefreshToken: () => Promise<string | null>
  setRefreshToken: (token: string) => Promise<void>
  clearRefreshToken: () => Promise<void>
  exchangeLaunchData: (initData: string) => Promise<ExchangeProviderResponse>
  refreshSession: (refreshToken: string) => Promise<RefreshSessionResponse>
  onFatal?: () => void
  onPhase?: (phase: AuthBootstrapPhase) => void
}

export type AuthBootstrapPhase =
  | 'start'
  | 'launch'
  | 'exchange'
  | 'exchange-success'
  | 'storage'
  | 'session'
  | 'refresh-token-load'
  | 'refresh'
  | 'refresh-success'
  | 'fatal-launch'
  | 'fatal-network'
  | 'fatal-session'

export const createAuthApiBootstrapDeps = (options: {
  api: AuthApiClient
  storage: {
    getRefreshToken: () => Promise<string | null>
    setRefreshToken: (token: string) => Promise<void>
    clearRefreshToken: () => Promise<void>
  }
  readRawInitData: () => string | null
  onFatal?: () => void
}): AuthBootstrapDeps => ({
  loadLaunchData: () => options.readRawInitData(),
  loadRefreshToken: () => options.storage.getRefreshToken(),
  setRefreshToken: (token) => options.storage.setRefreshToken(token),
  clearRefreshToken: () => options.storage.clearRefreshToken(),
  exchangeLaunchData: (initData) =>
    options.api.exchangeProviderToken({ provider: 'telegram', initData }),
  refreshSession: (refreshToken) => options.api.refreshSession(refreshToken),
  onFatal: options.onFatal,
})

const isAuthApiError = (error: unknown): error is AuthApiError =>
  error instanceof AuthApiError

const isLaunchRejected = (error: unknown): boolean =>
  isAuthApiError(error) && (error.status === 400 || error.status === 401)

const isTransientBootstrapFailure = (error: unknown): boolean =>
  !isAuthApiError(error) || error.status >= 500

export const runAuthBootstrap = async (
  deps: AuthBootstrapDeps,
): Promise<'authenticated' | 'fatal'> => {
  const exit = (phase: AuthBootstrapPhase, code: AuthErrorCode): 'fatal' => {
    deps.onPhase?.(phase)
    useAuthStore.getState().setError({ code })
    deps.onFatal?.()

    return 'fatal'
  }

  try {
    useAuthStore.getState().setBootstrapping()
    deps.onPhase?.('launch')

    const launchData = deps.loadLaunchData()
    if (!launchData) {
      return exit('fatal-launch', 'launchInvalid')
    }

    try {
      deps.onPhase?.('exchange')

      const session = await deps.exchangeLaunchData(launchData)
      deps.onPhase?.('exchange-success')
      deps.onPhase?.('storage')
      await deps.setRefreshToken(session.refreshToken)
      deps.onPhase?.('session')

      useAuthStore.getState().setSession({
        user: session.user,
        accessToken: session.accessToken,
        accessTokenExpiresIn: session.accessTokenExpiresIn,
        refreshToken: session.refreshToken,
      })

      return 'authenticated'
    } catch (error) {
      if (isLaunchRejected(error)) {
        return exit('fatal-launch', 'launchInvalid')
      }

      deps.onPhase?.('refresh-token-load')

      const refreshToken = await deps.loadRefreshToken()
      if (!refreshToken) {
        return exit('fatal-network', 'networkError')
      }

      try {
        deps.onPhase?.('refresh')

        const refreshed = await deps.refreshSession(refreshToken)
        deps.onPhase?.('refresh-success')
        deps.onPhase?.('storage')
        await deps.setRefreshToken(refreshed.refreshToken)
        deps.onPhase?.('session')

        useAuthStore.getState().refresh({
          accessToken: refreshed.accessToken,
          accessTokenExpiresIn: refreshed.accessTokenExpiresIn,
          refreshToken: refreshed.refreshToken,
        })

        return 'authenticated'
      } catch (refreshError) {
        if (isTransientBootstrapFailure(refreshError)) {
          return exit('fatal-network', 'networkError')
        }

        deps.onPhase?.('fatal-session')
        await deps.clearRefreshToken()

        return exit('fatal-session', 'sessionExpired')
      }
    }
  } catch {
    return exit('fatal-network', 'networkError')
  }
}
