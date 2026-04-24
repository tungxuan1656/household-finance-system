import axios, { AxiosError, AxiosHeaders, type AxiosRequestConfig } from 'axios'
import { describe, expect, it, vi } from 'vitest'

import {
  ApiClientError,
  type AuthSessionAdapter,
  createApiClient,
} from '@/api/client'
import { API_ENDPOINTS } from '@/api/endpoints'
import type { ApiEnvelope } from '@/types/api'

const createSuccessResponse = <T>(
  config: any,
  data: ApiEnvelope<T>,
  status = 200,
): any => ({
  config,
  data,
  headers: {},
  request: {},
  status,
  statusText: String(status),
})

const createError = <T>(config: any, data: ApiEnvelope<T>, status: number) =>
  new AxiosError(
    `Request failed with status ${status}`,
    undefined,
    config,
    {},
    createSuccessResponse(config, data, status),
  )

const createAxiosTestClient = (handler: (config: any) => Promise<any>) =>
  axios.create({
    adapter: async (config: AxiosRequestConfig) => handler(config),
    baseURL: '/api/v1',
  })

describe('api client', () => {
  it('unwraps successful response data', async () => {
    const axiosInstance = createAxiosTestClient(async (config) =>
      createSuccessResponse(
        config,
        {
          data: { ok: true },
          error: null,
          meta: { requestId: 'request-1' },
          success: true,
        },
        200,
      ),
    )
    const apiClient = createApiClient({ axiosInstance })

    await expect(
      apiClient.get<{ ok: boolean }>(API_ENDPOINTS.health),
    ).resolves.toEqual({
      ok: true,
    })
  })

  it('injects the bearer token from the auth adapter', async () => {
    let capturedConfig: any = null
    const axiosInstance = createAxiosTestClient(async (config) => {
      capturedConfig = config

      return createSuccessResponse(
        config,
        {
          data: { ok: true },
          error: null,
          meta: { requestId: 'request-2' },
          success: true,
        },
        200,
      )
    })
    const authSessionAdapter: AuthSessionAdapter = {
      getAccessToken: vi.fn(async () => 'access-token-123'),
      refreshSession: vi.fn(async () => null),
    }
    const apiClient = createApiClient({ authSessionAdapter, axiosInstance })

    await apiClient.get<{ ok: boolean }>(API_ENDPOINTS.health)

    const headers: Record<string, unknown> = {}

    if (capturedConfig && capturedConfig.headers instanceof AxiosHeaders) {
      Object.assign(headers, capturedConfig.headers.toJSON())
    } else if (capturedConfig && capturedConfig.headers) {
      Object.assign(headers, capturedConfig.headers)
    }

    expect(headers.authorization).toBe('Bearer access-token-123')
    expect(headers.accept ?? headers.Accept).toBe('application/json')
  })

  it('maps API failure envelopes to typed client errors', async () => {
    const axiosInstance = createAxiosTestClient(async (config) =>
      Promise.reject(
        createError(
          config,
          {
            data: null,
            error: {
              code: 'INVALID_INPUT',
              message: 'Invalid payload.',
            },
            meta: { requestId: 'request-3' },
            success: false,
          },
          400,
        ),
      ),
    )
    const apiClient = createApiClient({ axiosInstance })

    await expect(
      apiClient.post(API_ENDPOINTS.auth.providerExchange, {}),
    ).rejects.toMatchObject({
      code: 'INVALID_INPUT',
      message: 'Invalid payload.',
      requestId: 'request-3',
      status: 400,
    })
  })

  it('refreshes once after a 401 and retries with the refreshed token', async () => {
    const requestAuthorizationHeaders: string[] = []
    let requestCount = 0
    const axiosInstance = createAxiosTestClient(async (config) => {
      requestCount += 1
      requestAuthorizationHeaders.push(config.headers.authorization as string)

      if (requestCount === 1) {
        return Promise.reject(
          createError(
            config,
            {
              data: null,
              error: {
                code: 'UNAUTHENTICATED',
                message: 'Expired token.',
              },
              meta: { requestId: 'request-4' },
              success: false,
            },
            401,
          ),
        )
      }

      return createSuccessResponse(
        config,
        {
          data: { ok: true },
          error: null,
          meta: { requestId: 'request-5' },
          success: true,
        },
        200,
      )
    })
    const authSessionAdapter: AuthSessionAdapter = {
      getAccessToken: vi
        .fn()
        .mockResolvedValueOnce('stale-token')
        .mockResolvedValueOnce('fresh-token'),
      refreshSession: vi.fn(async () => 'fresh-token'),
      handleUnauthenticated: vi.fn(),
    }
    const apiClient = createApiClient({ authSessionAdapter, axiosInstance })

    await expect(
      apiClient.get<{ ok: boolean }>(API_ENDPOINTS.profile),
    ).resolves.toEqual({
      ok: true,
    })

    expect(authSessionAdapter.refreshSession).toHaveBeenCalledTimes(1)

    expect(requestAuthorizationHeaders).toEqual([
      'Bearer stale-token',
      'Bearer fresh-token',
    ])
  })

  it('replays queued 401 requests after one shared refresh', async () => {
    let refreshCompleted = false
    let requestCount = 0
    const axiosInstance = createAxiosTestClient(async (config) => {
      if (!refreshCompleted) {
        requestCount += 1

        return Promise.reject(
          createError(
            config,
            {
              data: null,
              error: {
                code: 'UNAUTHENTICATED',
                message: 'Expired token.',
              },
              meta: { requestId: `request-${requestCount}` },
              success: false,
            },
            401,
          ),
        )
      }

      return createSuccessResponse(
        config,
        {
          data: {
            ok: true,
            url: config.url,
          },
          error: null,
          meta: { requestId: `request-${requestCount + 1}` },
          success: true,
        },
        200,
      )
    })
    const authSessionAdapter: AuthSessionAdapter = {
      getAccessToken: vi.fn(async () => 'stale-token'),
      refreshSession: vi.fn(async () => {
        refreshCompleted = true

        return 'fresh-token'
      }),
      handleUnauthenticated: vi.fn(),
    }
    const apiClient = createApiClient({ authSessionAdapter, axiosInstance })

    const pendingRequests = await Promise.all([
      apiClient.get<{ ok: boolean; url?: string }>(API_ENDPOINTS.profile),
      apiClient.get<{ ok: boolean; url?: string }>(
        API_ENDPOINTS.protected.ping,
      ),
    ])

    expect(authSessionAdapter.refreshSession).toHaveBeenCalledTimes(1)

    expect(pendingRequests).toEqual([
      { ok: true, url: API_ENDPOINTS.profile },
      { ok: true, url: API_ENDPOINTS.protected.ping },
    ])
  })

  it('surfaces unauthenticated errors when refresh cannot recover', async () => {
    const axiosInstance = createAxiosTestClient(async (config) =>
      Promise.reject(
        createError(
          config,
          {
            data: null,
            error: {
              code: 'UNAUTHENTICATED',
              message: 'Session expired.',
            },
            meta: { requestId: 'request-6' },
            success: false,
          },
          401,
        ),
      ),
    )
    const handleUnauthenticated = vi.fn()
    const authSessionAdapter: AuthSessionAdapter = {
      getAccessToken: vi.fn(async () => 'expired-token'),
      refreshSession: vi.fn(async () => null),
      handleUnauthenticated,
    }
    const apiClient = createApiClient({ authSessionAdapter, axiosInstance })

    const requestPromise = apiClient.get(API_ENDPOINTS.profile)

    await expect(requestPromise).rejects.toBeInstanceOf(ApiClientError)

    await expect(requestPromise).rejects.toMatchObject({
      code: 'UNAUTHENTICATED',
      requestId: 'request-6',
      status: 401,
    })

    expect(authSessionAdapter.refreshSession).toHaveBeenCalled()
    expect(handleUnauthenticated).toHaveBeenCalled()
  })

  it('rejects malformed success payloads that do not match the API envelope', async () => {
    const axiosInstance = createAxiosTestClient(async (config) => ({
      config,
      data: {
        data: { ok: true },
        meta: { requestId: 'request-7' },
      },
      headers: {},
      request: {},
      status: 200,
      statusText: '200',
    }))
    const apiClient = createApiClient({ axiosInstance })

    await expect(apiClient.get(API_ENDPOINTS.health)).rejects.toMatchObject({
      code: 'HTTP_ERROR',
      message: 'Response did not match the API envelope contract.',
      requestId: 'request-7',
      status: 200,
    })
  })
})
