import type {
  AuthApiClient,
  ExchangeProviderResponse,
  RefreshSessionResponse,
} from '@/lib/auth/api'
import { AuthApiError } from '@/lib/auth/api'

import { useAuthStore } from './store'

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
  onPhase: undefined,
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
  const notePhase = (phase: AuthBootstrapPhase) => {
    deps.onPhase?.(phase)
  }

  try {
    useAuthStore.getState().setBootstrapping()
    notePhase('start')

    notePhase('launch')

    const launchData = deps.loadLaunchData()

    if (!launchData) {
      notePhase('fatal-launch')
      useAuthStore.getState().setError({ code: 'launchInvalid' })
      deps.onFatal?.()

      return 'fatal'
    }

    try {
      notePhase('exchange')

      const session = await deps.exchangeLaunchData(launchData)
      notePhase('exchange-success')
      notePhase('storage')
      await deps.setRefreshToken(session.refreshToken)

      notePhase('session')

      useAuthStore.getState().setSession({
        user: session.user,
        accessToken: session.accessToken,
        accessTokenExpiresIn: session.accessTokenExpiresIn,
        refreshToken: session.refreshToken,
      })

      return 'authenticated'
    } catch (error) {
      if (isLaunchRejected(error)) {
        notePhase('fatal-launch')
        useAuthStore.getState().setError({ code: 'launchInvalid' })
        deps.onFatal?.()

        return 'fatal'
      }

      notePhase('refresh-token-load')

      const refreshToken = await deps.loadRefreshToken()

      if (!refreshToken) {
        notePhase('fatal-network')
        useAuthStore.getState().setError({ code: 'networkError' })
        deps.onFatal?.()

        return 'fatal'
      }

      try {
        notePhase('refresh')

        const refreshed = await deps.refreshSession(refreshToken)
        notePhase('refresh-success')
        notePhase('storage')
        await deps.setRefreshToken(refreshed.refreshToken)

        notePhase('session')

        useAuthStore.getState().refresh({
          accessToken: refreshed.accessToken,
          accessTokenExpiresIn: refreshed.accessTokenExpiresIn,
          refreshToken: refreshed.refreshToken,
        })

        return 'authenticated'
      } catch (refreshError) {
        if (isTransientBootstrapFailure(refreshError)) {
          notePhase('fatal-network')
          useAuthStore.getState().setError({ code: 'networkError' })
          deps.onFatal?.()

          return 'fatal'
        }

        notePhase('fatal-session')
        await deps.clearRefreshToken()
        useAuthStore.getState().setError({ code: 'sessionExpired' })
        deps.onFatal?.()

        return 'fatal'
      }
    }
  } catch {
    notePhase('fatal-network')
    useAuthStore.getState().setError({ code: 'networkError' })
    deps.onFatal?.()

    return 'fatal'
  }
}
