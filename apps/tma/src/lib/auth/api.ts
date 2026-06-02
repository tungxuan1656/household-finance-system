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
}

const joinUrl = (baseUrl: string, path: string): string =>
  `${baseUrl.replace(/\/$/, '')}${path}`

const parseErrorPayload = async (
  response: Response,
): Promise<ApiErrorPayload> => {
  try {
    const data = (await response.json()) as { error?: ApiErrorPayload }

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

  const request = async <TResponse>(
    path: string,
    init: { method: 'POST'; body?: unknown; authenticated?: boolean },
  ): Promise<TResponse> => {
    const accessToken =
      init.authenticated && options.accessTokenProvider
        ? options.accessTokenProvider()
        : null

    const response = await fetchImpl(joinUrl(options.baseUrl, path), {
      method: init.method,
      headers: buildHeaders(accessToken),
      body: init.body ? JSON.stringify(init.body) : undefined,
    })

    if (!response.ok) {
      const errorPayload = await parseErrorPayload(response)
      throw new AuthApiError(
        response.status,
        errorPayload.code,
        errorPayload.message,
      )
    }

    const data = (await response.json()) as { data: TResponse }

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
