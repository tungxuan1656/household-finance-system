import type {
  AuthApiClient,
  AuthenticatedUser,
  ExchangeProviderResponse,
  RefreshSessionResponse,
} from '@/lib/auth/api'
import { AuthApiError } from '@/lib/auth/api'
import type { StoredSession } from '@/lib/storage/adapter'

import { type AuthErrorCode, useAuthStore } from './store'

const ACCESS_TOKEN_BUFFER_MS = 60_000
const UNKNOWN_TELEGRAM_USER_ID = 0

export interface AuthBootstrapDeps {
  loadLaunchData: () => string | null
  loadTelegramUserId: () => number | null
  loadStoredSession: () => Promise<StoredSession | null>
  persistSession: (session: StoredSession) => Promise<void>
  clearStoredSession: () => Promise<void>
  exchangeLaunchData: (initData: string) => Promise<ExchangeProviderResponse>
  refreshSession: (refreshToken: string) => Promise<RefreshSessionResponse>
  onFatal?: () => void
  onPhase?: (phase: AuthBootstrapPhase) => void
}

export type AuthBootstrapPhase =
  | 'start'
  | 'launch'
  | 'restore'
  | 'restore-success'
  | 'exchange'
  | 'exchange-success'
  | 'storage'
  | 'session'
  | 'refresh'
  | 'refresh-success'
  | 'fatal-launch'
  | 'fatal-network'
  | 'fatal-session'

export const createAuthApiBootstrapDeps = (options: {
  api: AuthApiClient
  storage: {
    getSession: () => Promise<StoredSession | null>
    setSession: (session: StoredSession) => Promise<void>
    clearSession: () => Promise<void>
  }
  readRawInitData: () => string | null
  readTelegramUserId: () => number | null
  onFatal?: () => void
}): AuthBootstrapDeps => ({
  loadLaunchData: () => options.readRawInitData(),
  loadTelegramUserId: () => options.readTelegramUserId(),
  loadStoredSession: () => options.storage.getSession(),
  persistSession: (session) => options.storage.setSession(session),
  clearStoredSession: () => options.storage.clearSession(),
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

const buildSessionFromExchange = (
  telegramUserId: number | null,
  session: ExchangeProviderResponse,
): StoredSession => ({
  telegramUserId: telegramUserId ?? UNKNOWN_TELEGRAM_USER_ID,
  user: session.user,
  accessToken: session.accessToken,
  refreshToken: session.refreshToken,
  accessTokenExpiresAt: Date.now() + session.accessTokenExpiresIn * 1000,
  refreshTokenExpiresAt: Date.now() + session.refreshTokenExpiresIn * 1000,
})

const buildSessionFromRefresh = (
  previous: StoredSession,
  refreshed: RefreshSessionResponse,
): StoredSession => ({
  telegramUserId: previous.telegramUserId,
  user: previous.user,
  accessToken: refreshed.accessToken,
  refreshToken: refreshed.refreshToken,
  accessTokenExpiresAt: Date.now() + refreshed.accessTokenExpiresIn * 1000,
  refreshTokenExpiresAt: Date.now() + refreshed.refreshTokenExpiresIn * 1000,
})

const restoreSessionToStore = (session: StoredSession): void => {
  useAuthStore.getState().restoreSession({
    user: session.user,
    telegramUserId: session.telegramUserId,
    accessToken: session.accessToken,
    accessTokenExpiresAt: session.accessTokenExpiresAt,
    refreshToken: session.refreshToken,
    refreshTokenExpiresAt: session.refreshTokenExpiresAt,
  })
}

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

    const currentTelegramUserId = deps.loadTelegramUserId()

    deps.onPhase?.('restore')

    const storedSession = await deps.loadStoredSession()

    const now = Date.now()
    const sameUser =
      currentTelegramUserId !== null &&
      storedSession !== null &&
      storedSession.telegramUserId === currentTelegramUserId

    // ── Restore: access token still valid → use directly (0 API calls) ──
    if (
      sameUser &&
      storedSession!.accessTokenExpiresAt - now > ACCESS_TOKEN_BUFFER_MS
    ) {
      deps.onPhase?.('restore-success')
      deps.onPhase?.('session')
      restoreSessionToStore(storedSession!)

      return 'authenticated'
    }

    // ── Restore: access expired, refresh valid → try refresh (1 API call) ──
    if (sameUser && storedSession!.refreshTokenExpiresAt - now > 0) {
      deps.onPhase?.('refresh')

      try {
        const refreshed = await deps.refreshSession(storedSession!.refreshToken)
        deps.onPhase?.('refresh-success')

        const newSession = buildSessionFromRefresh(storedSession!, refreshed)

        deps.onPhase?.('storage')
        await deps.persistSession(newSession)
        deps.onPhase?.('session')
        restoreSessionToStore(newSession)

        return 'authenticated'
      } catch {
        // Refresh failed — fall through to exchange.
      }
    }

    // ── Exchange: fresh session (mismatch, no cache, both expired, or refresh failed) ──
    deps.onPhase?.('exchange')

    try {
      const session = await deps.exchangeLaunchData(launchData)
      deps.onPhase?.('exchange-success')

      const newSession = buildSessionFromExchange(
        currentTelegramUserId,
        session,
      )

      deps.onPhase?.('storage')
      await deps.persistSession(newSession)
      deps.onPhase?.('session')
      restoreSessionToStore(newSession)

      return 'authenticated'
    } catch (error) {
      if (isLaunchRejected(error)) {
        return exit('fatal-launch', 'launchInvalid')
      }

      if (isTransientBootstrapFailure(error)) {
        return exit('fatal-network', 'networkError')
      }

      return exit('fatal-session', 'sessionExpired')
    }
  } catch {
    return exit('fatal-network', 'networkError')
  }
}

export type { AuthenticatedUser }
