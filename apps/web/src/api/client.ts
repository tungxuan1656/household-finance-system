import axios, {
  AxiosHeaders,
  type AxiosInstance,
  type AxiosResponse,
  isAxiosError,
} from 'axios'

import { useActiveHouseholdStore } from '@/stores/active-household.store'
import { authActions, useAuthStore } from '@/stores/auth.store'
import type { ApiEnvelope, ApiErrorCode } from '@/types/api'

import { API_BASE_PATH } from './endpoints'

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

declare module 'axios' {
  interface AxiosRequestConfig {
    skipAuth?: boolean
  }

  interface InternalAxiosRequestConfig {
    skipAuth?: boolean
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

const withInterceptors = (axiosClient: AxiosInstance) => {
  axiosClient.interceptors.request.use(
    (config) => {
      setHeader(config, 'accept', 'application/json')

      if (!config.skipAuth) {
        const accessToken = useAuthStore.getState().accessToken
        const activeHouseholdId =
          useActiveHouseholdStore.getState().activeHouseholdId

        if (accessToken) {
          setAuthorizationHeader(config, accessToken)
        }

        if (activeHouseholdId) {
          setHeader(config, 'x-household-id', activeHouseholdId)
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

      if (!response) {
        throw toApiClientError(0, null, error)
      }

      if (response.status === 401) {
        authActions.clearSession()
      }

      throw toApiClientError(response.status, response.data)
    },
  )
}

export const client = axios.create({
  baseURL: API_BASE_PATH,
  headers: {
    'Content-Type': 'application/json',
  },
})

withInterceptors(client)
