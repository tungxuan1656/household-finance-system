import axios, {
  AxiosHeaders,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  isAxiosError,
} from 'axios'

import { API_BASE_PATH } from '@/api/endpoints'
import type { ApiEnvelope, ApiErrorCode } from '@/types/api'

type ApiClientMethod = 'get' | 'patch' | 'post'

type MaybePromise<T> = Promise<T> | T

type RequestBody = FormData | Record<string, unknown> | undefined

export type ApiRequestOptions = {
  headers?: Record<string, string>
  signal?: AbortSignal
  skipAuth?: boolean
  skipAuthRefresh?: boolean
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
  axiosInstance?: AxiosInstance
}

declare module 'axios' {
  interface AxiosRequestConfig {
    skipAuth?: boolean
    skipAuthRefresh?: boolean
  }

  interface InternalAxiosRequestConfig {
    _retry?: boolean
    skipAuth?: boolean
    skipAuthRefresh?: boolean
  }
}

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

const toApiClientError = (
  status: number,
  payload: unknown,
  details?: unknown,
): ApiClientError => {
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
    code: status === 0 ? 'NETWORK_ERROR' : 'HTTP_ERROR',
    details,
    message:
      status === 0
        ? 'Network request failed.'
        : payload === null
          ? `Request failed with status ${status}.`
          : 'Response did not match the API envelope contract.',
    requestId: getRequestId(payload),
    status,
  })
}

const setHeader = (
  config: {
    headers?: AxiosHeaders | Record<string, string>
  },
  key: string,
  value: string,
) => {
  if (config.headers instanceof AxiosHeaders) {
    config.headers.set(key, value)

    return
  }

  config.headers = {
    ...config.headers,
    [key]: value,
  }
}

const setAuthorizationHeader = (
  config: {
    headers?: AxiosHeaders | Record<string, string>
  },
  accessToken: string,
) => {
  setHeader(config, 'authorization', `Bearer ${accessToken}`)
}

const withInterceptors = (
  axiosClient: AxiosInstance,
  authSessionAdapter?: AuthSessionAdapter,
) => {
  let isRefreshing = false
  const failedQueue: Array<{
    reject: (reason?: unknown) => void
    resolve: (token: string) => void
  }> = []

  const processQueue = (error: unknown, refreshedToken: string | null) => {
    failedQueue.forEach((pendingRequest) => {
      if (error || !refreshedToken) {
        pendingRequest.reject(error ?? new Error('Refresh failed'))

        return
      }

      pendingRequest.resolve(refreshedToken)
    })

    failedQueue.length = 0
  }

  axiosClient.interceptors.request.use(
    async (config) => {
      setHeader(config, 'accept', 'application/json')

      if (!config.skipAuth && authSessionAdapter) {
        const accessToken = await authSessionAdapter.getAccessToken()

        if (accessToken) {
          setAuthorizationHeader(config, accessToken)
        }
      }

      return config
    },
    (error) => Promise.reject(error),
  )

  axiosClient.interceptors.response.use(
    (response: AxiosResponse<ApiEnvelope<unknown>>) => {
      if (isApiSuccessEnvelope(response.data)) {
        return {
          ...response,
          data: response.data.data,
        }
      }

      throw toApiClientError(response.status, response.data)
    },
    async (error: unknown) => {
      if (!isAxiosError(error)) {
        throw toApiClientError(0, null, error)
      }

      const response = error.response
      const originalRequest = error.config

      if (!response) {
        throw toApiClientError(0, null, error)
      }

      if (
        response.status === 401 &&
        authSessionAdapter &&
        originalRequest &&
        !originalRequest.skipAuthRefresh
      ) {
        if (originalRequest._retry) {
          const authError = toApiClientError(response.status, response.data)

          await authSessionAdapter.handleUnauthenticated?.(authError)
          throw authError
        }

        if (isRefreshing) {
          return new Promise<AxiosResponse>((resolve, reject) => {
            failedQueue.push({
              reject,
              resolve: (refreshedToken) => {
                originalRequest._retry = true
                setAuthorizationHeader(originalRequest, refreshedToken)
                resolve(axiosClient.request(originalRequest))
              },
            })
          })
        }

        originalRequest._retry = true
        isRefreshing = true

        try {
          const refreshedToken = await authSessionAdapter.refreshSession()
          const retryToken =
            refreshedToken ?? (await authSessionAdapter.getAccessToken())

          if (!retryToken) {
            throw toApiClientError(response.status, response.data)
          }

          processQueue(null, retryToken)
          setAuthorizationHeader(originalRequest, retryToken)

          return axiosClient.request(originalRequest)
        } catch (refreshError) {
          processQueue(refreshError, null)

          if (
            isAxiosError(refreshError) &&
            refreshError.response &&
            isApiErrorEnvelope(refreshError.response.data)
          ) {
            const refreshClientError = toApiClientError(
              refreshError.response.status,
              refreshError.response.data,
            )

            await authSessionAdapter.handleUnauthenticated?.(refreshClientError)
            throw refreshClientError
          }

          const authError = toApiClientError(response.status, response.data)
          await authSessionAdapter.handleUnauthenticated?.(authError)
          throw authError
        } finally {
          isRefreshing = false
        }
      }

      throw toApiClientError(response.status, response.data)
    },
  )
}

export const createApiClient = (config: ApiClientConfig = {}) => {
  const axiosClient =
    config.axiosInstance ??
    axios.create({
      baseURL: config.basePath ?? API_BASE_PATH,
    })

  withInterceptors(axiosClient, config.authSessionAdapter)

  const request = async <TResponse, TBody = RequestBody>(
    method: ApiClientMethod,
    path: string,
    body?: TBody,
    options?: ApiRequestOptions,
  ) => {
    const response = await axiosClient.request<TResponse>({
      data: body,
      headers: options?.headers,
      method,
      signal: options?.signal,
      skipAuth: options?.skipAuth,
      skipAuthRefresh: options?.skipAuthRefresh,
      url: path,
    } as AxiosRequestConfig<TBody>)

    return response.data
  }

  return {
    get: <TResponse>(path: string, options?: ApiRequestOptions) =>
      request<TResponse>('get', path, undefined, options),
    patch: <TResponse, TBody = Record<string, unknown>>(
      path: string,
      body: TBody,
      options?: ApiRequestOptions,
    ) => request<TResponse, TBody>('patch', path, body, options),
    post: <TResponse, TBody = Record<string, unknown>>(
      path: string,
      body: TBody,
      options?: ApiRequestOptions,
    ) => request<TResponse, TBody>('post', path, body, options),
  }
}

export const client = createApiClient()
