import { getActiveRefreshInterceptor } from '@/features/auth/refresh-interceptor'
import { useAuthStore } from '@/features/auth/store'

const API_BASE_PATH = (import.meta.env.VITE_WORKER_URL ?? '/api/v1').replace(
  /\/$/,
  '',
)

const DEFAULT_TIMEOUT_MS = 20_000

type ApiEnvelope<T> =
  | {
      success: true
      data: T
      error: null
      meta: { requestId: string }
    }
  | {
      success: false
      data: null
      error: {
        code: string
        message: string
        details?: unknown
      }
      meta: { requestId: string }
    }

type PrimitiveParam = number | string | undefined

export class ApiClientError extends Error {
  public readonly code: string
  public readonly details?: unknown
  public readonly requestId?: string
  public readonly status: number

  public constructor(input: {
    code: string
    message: string
    status: number
    details?: unknown
    requestId?: string
  }) {
    super(input.message)
    this.name = 'ApiClientError'
    this.code = input.code
    this.details = input.details
    this.requestId = input.requestId
    this.status = input.status
  }
}

export interface RequestOptions {
  authenticated?: boolean
  body?: unknown
  method?: 'DELETE' | 'GET' | 'PATCH' | 'POST'
  params?: Record<string, PrimitiveParam>
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const toApiClientError = (
  status: number,
  payload: unknown,
  fallbackMessage: string,
): ApiClientError => {
  if (
    isRecord(payload) &&
    payload.success === false &&
    isRecord(payload.error) &&
    typeof payload.error.code === 'string'
  ) {
    return new ApiClientError({
      code: payload.error.code,
      details: payload.error.details,
      message:
        typeof payload.error.message === 'string'
          ? payload.error.message
          : fallbackMessage,
      requestId:
        isRecord(payload.meta) && typeof payload.meta.requestId === 'string'
          ? payload.meta.requestId
          : undefined,
      status,
    })
  }

  return new ApiClientError({
    code: status === 0 ? 'NETWORK_ERROR' : 'HTTP_ERROR',
    message: fallbackMessage,
    requestId:
      isRecord(payload) &&
      isRecord(payload.meta) &&
      typeof payload.meta.requestId === 'string'
        ? payload.meta.requestId
        : undefined,
    status,
  })
}

const buildUrl = (
  path: string,
  params?: Record<string, PrimitiveParam>,
): string => {
  const search = new URLSearchParams()

  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined) {
      search.set(key, String(value))
    }
  }

  const query = search.toString()

  return `${API_BASE_PATH}${path}${query.length > 0 ? `?${query}` : ''}`
}

export const request = async <TResponse>(
  path: string,
  options: RequestOptions = {},
): Promise<TResponse> => {
  const headers = new Headers({ accept: 'application/json' })

  if (options.body !== undefined) {
    headers.set('content-type', 'application/json')
  }

  const interceptor = getActiveRefreshInterceptor()
  const shouldUseInterceptor =
    interceptor !== null && (options.authenticated ?? true)

  if (options.authenticated ?? true) {
    const accessToken = useAuthStore.getState().accessToken

    if (accessToken && !shouldUseInterceptor) {
      // Only add auth header ourselves when no interceptor is available.
      // The interceptor handles auth headers + 401 retry transparently.
      headers.set('authorization', `Bearer ${accessToken}`)
    }
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS)

  let response: Response

  try {
    const execFetch = shouldUseInterceptor
      ? (url: string, init: RequestInit) => interceptor!.fetch(url, init)
      : (url: string, init: RequestInit) => fetch(url, init)

    response = await execFetch(buildUrl(path, options.params), {
      body:
        options.body !== undefined ? JSON.stringify(options.body) : undefined,
      headers,
      method: options.method ?? 'GET',
      signal: controller.signal,
    })
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiClientError({
        code: 'TIMEOUT',
        message: 'Request timed out.',
        status: 0,
      })
    }
    throw toApiClientError(0, null, 'Network request failed.')
  }

  clearTimeout(timeoutId)

  let payload: ApiEnvelope<TResponse> | null = null

  try {
    payload = (await response.json()) as ApiEnvelope<TResponse>
  } catch {
    payload = null
  }

  if (!response.ok) {
    throw toApiClientError(
      response.status,
      payload,
      `Request failed with status ${response.status}.`,
    )
  }

  if (!payload || payload.success !== true) {
    throw toApiClientError(
      response.status,
      payload,
      'Response did not match the API envelope contract.',
    )
  }

  return payload.data
}

export const get = <TResponse>(
  path: string,
  options?: Omit<RequestOptions, 'body' | 'method'>,
) => request<TResponse>(path, { ...options, method: 'GET' })

export const post = <TResponse>(
  path: string,
  body?: unknown,
  options?: Omit<RequestOptions, 'body' | 'method'>,
) => request<TResponse>(path, { ...options, body, method: 'POST' })

export const patch = <TResponse>(
  path: string,
  body?: unknown,
  options?: Omit<RequestOptions, 'body' | 'method'>,
) => request<TResponse>(path, { ...options, body, method: 'PATCH' })

export const deleteRequest = <TResponse>(
  path: string,
  options?: Omit<RequestOptions, 'body' | 'method'>,
) => request<TResponse>(path, { ...options, method: 'DELETE' })
