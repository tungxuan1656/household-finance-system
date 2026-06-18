import type { AuthApiClient, AuthenticatedUser } from '@/lib/auth/api'
import type { AuthStorage, StoredSession } from '@/lib/storage/adapter'

import { useAuthStore } from './store'

export interface RefreshInterceptorOptions {
  api: AuthApiClient
  storage: AuthStorage
  fetchImpl?: typeof fetch
  onSessionExpired?: () => void
}

interface UnauthorizedListener {
  (): void
}

let currentInterceptor: RefreshInterceptor | null = null

const REFRESH_PATH = '/api/v1/auth/refresh'
const PROVIDER_EXCHANGE_PATH = '/api/v1/auth/provider/exchange'

const isRefreshOrExchange = (input: string): boolean => {
  const path = input.startsWith('http')
    ? (() => {
        try {
          return new URL(input).pathname
        } catch {
          return input
        }
      })()
    : input

  return path.endsWith(REFRESH_PATH) || path.endsWith(PROVIDER_EXCHANGE_PATH)
}

export class RefreshInterceptor {
  private inFlightRefresh: Promise<string | null> | null = null
  private readonly listeners = new Set<UnauthorizedListener>()

  public constructor(private readonly options: RefreshInterceptorOptions) {
    currentInterceptor = this
  }

  public dispose(): void {
    if (currentInterceptor === this) {
      currentInterceptor = null
    }
    this.listeners.clear()
    this.inFlightRefresh = null
  }

  /**
   * Expose the refresh flow for proactive (pre-expiry) refresh.
   * Returns the new access token on success, or null if refresh failed.
   */
  public triggerRefresh(): Promise<string | null> {
    return this.runRefresh()
  }

  public onUnauthorized(listener: UnauthorizedListener): () => void {
    this.listeners.add(listener)

    return () => {
      this.listeners.delete(listener)
    }
  }

  public async fetch(input: string, init: RequestInit = {}): Promise<Response> {
    const fetchImpl = this.options.fetchImpl ?? fetch
    const auth = useAuthStore.getState()
    const headers = new Headers(init.headers ?? undefined)
    if (!headers.has('content-type') && init.body) {
      headers.set('content-type', 'application/json')
    }
    if (auth.accessToken && !headers.has('authorization')) {
      headers.set('authorization', `Bearer ${auth.accessToken}`)
    }

    const firstResponse = await fetchImpl(input, { ...init, headers })

    if (firstResponse.status !== 401) {
      return firstResponse
    }

    if (isRefreshOrExchange(input)) {
      this.notifySessionExpired()

      return firstResponse
    }

    const refreshed = await this.runRefresh()

    if (!refreshed) {
      this.notifySessionExpired()

      return firstResponse
    }

    const retryHeaders = new Headers(init.headers ?? undefined)
    if (!retryHeaders.has('content-type') && init.body) {
      retryHeaders.set('content-type', 'application/json')
    }
    retryHeaders.set('authorization', `Bearer ${refreshed}`)

    return fetchImpl(input, { ...init, headers: retryHeaders })
  }

  private async runRefresh(): Promise<string | null> {
    if (this.inFlightRefresh) {
      return this.inFlightRefresh
    }

    const auth = useAuthStore.getState()

    if (!auth.refreshToken) {
      return null
    }

    const refreshToken = auth.refreshToken
    const telegramUserId = auth.telegramUserId
    const user = auth.user

    this.inFlightRefresh = (async () => {
      try {
        const refreshed = await this.options.api.refreshSession(refreshToken)

        useAuthStore.getState().refresh({
          accessToken: refreshed.accessToken,
          accessTokenExpiresIn: refreshed.accessTokenExpiresIn,
          refreshToken: refreshed.refreshToken,
          refreshTokenExpiresIn: refreshed.refreshTokenExpiresIn,
        })

        if (telegramUserId !== null && user) {
          const updatedSession: StoredSession = {
            telegramUserId,
            user,
            accessToken: refreshed.accessToken,
            refreshToken: refreshed.refreshToken,
            accessTokenExpiresAt:
              Date.now() + refreshed.accessTokenExpiresIn * 1000,
            refreshTokenExpiresAt:
              Date.now() + refreshed.refreshTokenExpiresIn * 1000,
          }

          await this.options.storage.setSession(updatedSession)
        }

        return refreshed.accessToken
      } catch {
        return null
      } finally {
        this.inFlightRefresh = null
      }
    })()

    return this.inFlightRefresh
  }

  private notifySessionExpired(): void {
    useAuthStore.getState().setError({
      code: 'sessionExpired',
    })

    for (const listener of this.listeners) {
      listener()
    }

    this.options.onSessionExpired?.()
  }
}

export const getActiveRefreshInterceptor = (): RefreshInterceptor | null =>
  currentInterceptor

export type { AuthenticatedUser }
