export type AuthProvider = 'firebase' | 'telegram'

export interface AuthenticatedUser {
  id: string
  email: string | null
  displayName: string | null
  avatarUrl: string | null
  provider: AuthProvider
}

export type ExchangeProviderRequest =
  | { provider: 'firebase'; idToken: string }
  | { provider: 'telegram'; initData: string }

export interface ExchangeProviderResponse {
  tokenType: 'Bearer'
  accessToken: string
  accessTokenExpiresIn: number
  refreshToken: string
  refreshTokenExpiresIn: number
  user: AuthenticatedUser
}

export interface RefreshSessionResponse {
  tokenType: 'Bearer'
  accessToken: string
  accessTokenExpiresIn: number
  refreshToken: string
  refreshTokenExpiresIn: number
}

export interface LogoutSessionResponse {
  revoked: true
}

export interface ApiErrorPayload {
  code: string
  message?: string
}

export class AuthApiError extends Error {
  public readonly status: number
  public readonly code: string

  public constructor(status: number, code: string, message?: string) {
    super(message ?? code)
    this.name = 'AuthApiError'
    this.status = status
    this.code = code
  }
}

export interface AuthApiClient {
  exchangeProviderToken: (
    payload: ExchangeProviderRequest,
  ) => Promise<ExchangeProviderResponse>
  refreshSession: (refreshToken: string) => Promise<RefreshSessionResponse>
  logoutSession: (refreshToken: string) => Promise<LogoutSessionResponse>
}

export interface CreateAuthApiClientOptions {
  baseUrl: string
  fetchImpl?: typeof fetch
  accessTokenProvider?: () => string | null
  timeoutMs?: number
}

type AuthDebugStage =
  | 'idle'
  | 'fetch-start'
  | 'fetch-response'
  | 'json-start'
  | 'json-success'
  | 'error'

const setAuthDebugStage = (
  path: string,
  stage: AuthDebugStage,
  extra: Record<string, string> = {},
): void => {
  if (typeof document === 'undefined') {
    return
  }

  const root = document.documentElement
  const isExchange = path === '/auth/provider/exchange'

  if (!isExchange) {
    return
  }

  root.dataset.authExchangeStage = stage
  const loader = document.querySelector<HTMLElement>(
    '[data-loading="auth-bootstrap"]',
  )
  loader?.setAttribute('data-exchange-stage', stage)

  for (const [key, value] of Object.entries(extra)) {
    const dataKey = `authExchange${key.slice(0, 1).toUpperCase()}${key.slice(1)}`
    root.dataset[dataKey] = value
    loader?.setAttribute(
      `data-exchange-${key.replaceAll(/([A-Z])/g, '-$1').toLowerCase()}`,
      value,
    )
  }
}

const DEFAULT_AUTH_API_TIMEOUT_MS = 10_000

const withTimeout = async <T>(
  promise: Promise<T>,
  timeoutMs: number,
  onTimeout?: () => void,
): Promise<T> => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timeoutId = setTimeout(() => {
          onTimeout?.()
          reject(new AuthApiError(504, 'NETWORK_TIMEOUT'))
        }, timeoutMs)
      }),
    ])
  } finally {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
    }
  }
}

const joinUrl = (baseUrl: string, path: string): string =>
  `${baseUrl.replace(/\/$/, '')}${path}`

const parseErrorPayload = async (
  response: Response,
  timeoutMs: number,
): Promise<ApiErrorPayload> => {
  try {
    const data = (await withTimeout(
      response.json() as Promise<{ error?: ApiErrorPayload }>,
      timeoutMs,
    )) as { error?: ApiErrorPayload }

    return data.error ?? { code: 'UNKNOWN_ERROR' }
  } catch {
    return { code: 'UNKNOWN_ERROR' }
  }
}

const buildHeaders = (accessToken: string | null): HeadersInit => {
  const headers: Record<string, string> = {
    'content-type': 'application/json',
  }

  if (accessToken) {
    headers.authorization = `Bearer ${accessToken}`
  }

  return headers
}

export const createAuthApiClient = (
  options: CreateAuthApiClientOptions,
): AuthApiClient => {
  const fetchImpl = options.fetchImpl ?? fetch
  const timeoutMs = options.timeoutMs ?? DEFAULT_AUTH_API_TIMEOUT_MS

  const request = async <TResponse>(
    path: string,
    init: { method: 'POST'; body?: unknown; authenticated?: boolean },
  ): Promise<TResponse> => {
    const accessToken =
      init.authenticated && options.accessTokenProvider
        ? options.accessTokenProvider()
        : null

    const controller = new AbortController()
    setAuthDebugStage(path, 'fetch-start')

    const response = await withTimeout(
      fetchImpl(joinUrl(options.baseUrl, path), {
        method: init.method,
        headers: buildHeaders(accessToken),
        body: init.body ? JSON.stringify(init.body) : undefined,
        signal: controller.signal,
      }),
      timeoutMs,
      () => {
        controller.abort()
      },
    )

    setAuthDebugStage(path, 'fetch-response', {
      status: String(response.status),
      ok: String(response.ok),
    })

    if (!response.ok) {
      const errorPayload = await parseErrorPayload(response, timeoutMs)
      setAuthDebugStage(path, 'error', {
        status: String(response.status),
        code: errorPayload.code,
      })
      throw new AuthApiError(
        response.status,
        errorPayload.code,
        errorPayload.message,
      )
    }

    setAuthDebugStage(path, 'json-start')
    const data = (await withTimeout(
      response.json() as Promise<{ data: TResponse }>,
      timeoutMs,
    )) as { data: TResponse }

    setAuthDebugStage(path, 'json-success', {
      success: String(Boolean(data.data)),
    })

    return data.data
  }

  return {
    exchangeProviderToken: (payload) =>
      request<ExchangeProviderResponse>('/auth/provider/exchange', {
        method: 'POST',
        body: payload,
      }),
    refreshSession: (refreshToken) =>
      request<RefreshSessionResponse>('/auth/refresh', {
        method: 'POST',
        body: { refreshToken },
      }),
    logoutSession: (refreshToken) =>
      request<LogoutSessionResponse>('/auth/logout', {
        method: 'POST',
        body: { refreshToken },
        authenticated: true,
      }),
  }
}
