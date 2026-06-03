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
}

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
  useAuthStore.getState().setBootstrapping()

  const launchData = deps.loadLaunchData()

  if (!launchData) {
    useAuthStore.getState().setError({ code: 'launchInvalid' })
    deps.onFatal?.()

    return 'fatal'
  }

  try {
    const session = await deps.exchangeLaunchData(launchData)
    await deps.setRefreshToken(session.refreshToken)

    useAuthStore.getState().setSession({
      user: session.user,
      accessToken: session.accessToken,
      accessTokenExpiresIn: session.accessTokenExpiresIn,
      refreshToken: session.refreshToken,
    })

    return 'authenticated'
  } catch (error) {
    if (isLaunchRejected(error)) {
      useAuthStore.getState().setError({ code: 'launchInvalid' })
      deps.onFatal?.()

      return 'fatal'
    }

    const refreshToken = await deps.loadRefreshToken()

    if (!refreshToken) {
      useAuthStore.getState().setError({ code: 'networkError' })
      deps.onFatal?.()

      return 'fatal'
    }

    try {
      const refreshed = await deps.refreshSession(refreshToken)
      await deps.setRefreshToken(refreshed.refreshToken)

      useAuthStore.getState().refresh({
        accessToken: refreshed.accessToken,
        accessTokenExpiresIn: refreshed.accessTokenExpiresIn,
        refreshToken: refreshed.refreshToken,
      })

      return 'authenticated'
    } catch (refreshError) {
      if (isTransientBootstrapFailure(refreshError)) {
        useAuthStore.getState().setError({ code: 'networkError' })
        deps.onFatal?.()

        return 'fatal'
      }

      await deps.clearRefreshToken()
      useAuthStore.getState().setError({ code: 'sessionExpired' })
      deps.onFatal?.()

      return 'fatal'
    }
  }
}
