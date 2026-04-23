import { API_BASE_PATH } from '@/api/endpoints'
import type { ApiEnvelope, ApiErrorCode } from '@/types/api'

type ApiClientMethod = 'GET' | 'PATCH' | 'POST'

type RequestBody = BodyInit | Record<string, unknown> | undefined

type MaybePromise<T> = Promise<T> | T

type PreparedRequestBody = {
  bodyInit: BodyInit | undefined
  isJsonPayload: boolean
}

export interface AuthSessionAdapter {
  getAccessToken(): MaybePromise<string | null>
  refreshSession(): Promise<string | null>
  handleUnauthenticated?(error: ApiClientError): MaybePromise<void>
}

export class ApiClientError extends Error {
  public readonly code: ApiErrorCode | 'HTTP_ERROR' | 'NETWORK_ERROR'
  public readonly details?: unknown
  public readonly requestId?: string
  public readonly status: number

  public constructor(input: {
    code: ApiErrorCode | 'HTTP_ERROR' | 'NETWORK_ERROR'
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

interface ApiClientConfig {
  authSessionAdapter?: AuthSessionAdapter
  basePath?: string
  fetchImpl?: typeof fetch
}

interface InternalRequestOptions {
  accessTokenOverride?: string
  retryUnauthorized?: boolean
}

const isAbsoluteUrl = (value: string): boolean =>
  /^https?:\/\//u.test(value) || value.startsWith('//')

const resolveUrl = (path: string, basePath: string): string => {
  if (isAbsoluteUrl(path) || path.startsWith(basePath)) {
    return path
  }

  if (path.startsWith('/')) {
    return `${basePath}${path}`
  }

  return `${basePath}/${path}`
}

const isBodyInit = (value: RequestBody): value is BodyInit =>
  value instanceof Blob ||
  value instanceof FormData ||
  value instanceof URLSearchParams ||
  ArrayBuffer.isView(value) ||
  value instanceof ArrayBuffer ||
  typeof value === 'string'

const toRequestBody = (body: RequestBody): PreparedRequestBody => {
  if (body === undefined || isBodyInit(body)) {
    return {
      bodyInit: body,
      isJsonPayload: false,
    }
  }

  return {
    bodyInit: JSON.stringify(body),
    isJsonPayload: true,
  }
}

const toHeaders = (input?: HeadersInit): Headers => new Headers(input)

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const hasOwn = <TKey extends string>(
  value: Record<string, unknown>,
  key: TKey,
): value is Record<TKey, unknown> =>
  Object.prototype.hasOwnProperty.call(value, key)

const getRequestId = (payload: unknown): string | undefined => {
  if (!isRecord(payload)) {
    return undefined
  }

  const meta = payload.meta

  if (!isRecord(meta) || typeof meta.requestId !== 'string') {
    return undefined
  }

  return meta.requestId
}

const isApiErrorEnvelope = (
  payload: unknown,
): payload is ApiEnvelope<unknown> & { success: false } => {
  if (
    !isRecord(payload) ||
    payload.success !== false ||
    payload.data !== null
  ) {
    return false
  }

  if (!isRecord(payload.error) || !isRecord(payload.meta)) {
    return false
  }

  return (
    typeof payload.error.code === 'string' &&
    typeof payload.error.message === 'string' &&
    typeof payload.meta.requestId === 'string'
  )
}

const isApiSuccessEnvelope = <T>(
  payload: unknown,
): payload is ApiEnvelope<T> & { success: true } => {
  if (
    !isRecord(payload) ||
    !hasOwn(payload, 'data') ||
    payload.success !== true ||
    payload.error !== null
  ) {
    return false
  }

  return isRecord(payload.meta) && typeof payload.meta.requestId === 'string'
}

const toApiClientError = (status: number, payload: unknown): ApiClientError => {
  if (isApiErrorEnvelope(payload)) {
    return new ApiClientError({
      code: payload.error.code,
      details: payload.error.details,
      message: payload.error.message,
      requestId: payload.meta.requestId,
      status,
    })
  }

  return new ApiClientError({
    code: 'HTTP_ERROR',
    message:
      payload === null
        ? `Request failed with status ${status}.`
        : 'Response did not match the API envelope contract.',
    requestId: getRequestId(payload),
    status,
  })
}

const parseEnvelope = async <T>(
  response: Response,
): Promise<ApiEnvelope<T> | null> => {
  const contentType = response.headers.get('content-type') ?? ''

  if (!contentType.includes('application/json')) {
    return null
  }

  try {
    return (await response.json()) as ApiEnvelope<T>
  } catch (error) {
    throw new ApiClientError({
      code: 'HTTP_ERROR',
      details: error,
      message: 'Response body was not valid JSON.',
      status: response.status,
    })
  }
}

const createRequestMethod =
  (
    config: Required<Pick<ApiClientConfig, 'basePath' | 'fetchImpl'>> &
      Pick<ApiClientConfig, 'authSessionAdapter'>,
  ) =>
  async <TResponse, TBody = undefined>(
    method: ApiClientMethod,
    path: string,
    body?: TBody,
    init?: RequestInit,
    options: InternalRequestOptions = {
      retryUnauthorized: true,
    },
  ): Promise<TResponse> => {
    const headers = toHeaders(init?.headers)
    headers.set('accept', 'application/json')

    const { bodyInit, isJsonPayload } = toRequestBody(body as RequestBody)

    if (isJsonPayload && !headers.has('content-type')) {
      headers.set('content-type', 'application/json')
    }

    const accessToken =
      options.accessTokenOverride ??
      (await config.authSessionAdapter?.getAccessToken())

    if (accessToken && !headers.has('authorization')) {
      headers.set('authorization', `Bearer ${accessToken}`)
    }

    let response: Response

    try {
      response = await config.fetchImpl(resolveUrl(path, config.basePath), {
        ...init,
        body: bodyInit,
        headers,
        method,
      })
    } catch (error) {
      throw new ApiClientError({
        code: 'NETWORK_ERROR',
        details: error,
        message: 'Network request failed.',
        status: 0,
      })
    }

    const payload = await parseEnvelope<TResponse>(response)

    if (
      response.status === 401 &&
      options.retryUnauthorized !== false &&
      config.authSessionAdapter
    ) {
      const refreshedToken = await config.authSessionAdapter.refreshSession()
      const retryToken =
        refreshedToken ?? (await config.authSessionAdapter.getAccessToken())

      if (retryToken) {
        return createRequestMethod(config)<TResponse, TBody>(
          method,
          path,
          body,
          init,
          {
            accessTokenOverride: retryToken,
            retryUnauthorized: false,
          },
        )
      }
    }

    if (!response.ok || payload === null || !isApiSuccessEnvelope(payload)) {
      const clientError = toApiClientError(response.status, payload)

      if (response.status === 401) {
        await config.authSessionAdapter?.handleUnauthenticated?.(clientError)
      }

      throw clientError
    }

    return payload.data
  }

export const createApiClient = (config: ApiClientConfig = {}) => {
  const runtimeConfig = {
    authSessionAdapter: config.authSessionAdapter,
    basePath: config.basePath ?? API_BASE_PATH,
    fetchImpl: config.fetchImpl ?? fetch,
  }
  const request = createRequestMethod(runtimeConfig)

  return {
    get: <TResponse>(path: string, init?: RequestInit) =>
      request<TResponse>('GET', path, undefined, init),
    patch: <TResponse, TBody = Record<string, unknown>>(
      path: string,
      body: TBody,
      init?: RequestInit,
    ) => request<TResponse, TBody>('PATCH', path, body, init),
    post: <TResponse, TBody = Record<string, unknown>>(
      path: string,
      body: TBody,
      init?: RequestInit,
    ) => request<TResponse, TBody>('POST', path, body, init),
  }
}

export const client = createApiClient()
