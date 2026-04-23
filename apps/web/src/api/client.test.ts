import { describe, expect, it, vi } from 'vitest'

import {
  ApiClientError,
  type AuthSessionAdapter,
  createApiClient,
} from '@/api/client'
import { API_ENDPOINTS } from '@/api/endpoints'
import type { ApiEnvelope } from '@/types/api'

const createEnvelopeResponse = <T>(
  body: ApiEnvelope<T>,
  status: number,
): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json',
    },
  })

describe('api client', () => {
  it('unwraps successful response data', async () => {
    const fetchImpl = vi.fn(async () =>
      createEnvelopeResponse(
        {
          success: true,
          data: { ok: true },
          error: null,
          meta: {
            requestId: 'request-1',
          },
        },
        200,
      ),
    )
    const apiClient = createApiClient({ fetchImpl })

    await expect(
      apiClient.get<{ ok: boolean }>(API_ENDPOINTS.health),
    ).resolves.toEqual({
      ok: true,
    })

    expect(fetchImpl).toHaveBeenCalledWith(
      '/api/v1/health',
      expect.objectContaining({
        method: 'GET',
      }),
    )
  })

  it('injects the bearer token from the auth adapter', async () => {
    let capturedInit: RequestInit | undefined
    const fetchImpl = vi.fn(
      async (_input: RequestInfo | URL, init?: RequestInit) => {
        capturedInit = init

        return createEnvelopeResponse(
          {
            success: true,
            data: { ok: true },
            error: null,
            meta: {
              requestId: 'request-2',
            },
          },
          200,
        )
      },
    )
    const authSessionAdapter: AuthSessionAdapter = {
      getAccessToken: vi.fn(async () => 'access-token-123'),
      refreshSession: vi.fn(async () => null),
    }
    const apiClient = createApiClient({ authSessionAdapter, fetchImpl })

    await apiClient.get<{ ok: boolean }>(API_ENDPOINTS.health)

    const headers = new Headers(capturedInit?.headers)

    expect(headers.get('authorization')).toBe('Bearer access-token-123')
    expect(headers.get('accept')).toBe('application/json')
  })

  it('maps API failure envelopes to typed client errors', async () => {
    const fetchImpl = vi.fn(async () =>
      createEnvelopeResponse(
        {
          success: false,
          data: null,
          error: {
            code: 'INVALID_INPUT',
            message: 'Invalid payload.',
          },
          meta: {
            requestId: 'request-3',
          },
        },
        400,
      ),
    )
    const apiClient = createApiClient({ fetchImpl })

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
    const capturedInits: Array<RequestInit | undefined> = []
    const fetchImpl = vi.fn(
      async (_input: RequestInfo | URL, init?: RequestInit) => {
        capturedInits.push(init)

        if (capturedInits.length === 1) {
          return createEnvelopeResponse(
            {
              success: false,
              data: null,
              error: {
                code: 'UNAUTHENTICATED',
                message: 'Expired token.',
              },
              meta: {
                requestId: 'request-4',
              },
            },
            401,
          )
        }

        return createEnvelopeResponse(
          {
            success: true,
            data: { ok: true },
            error: null,
            meta: {
              requestId: 'request-5',
            },
          },
          200,
        )
      },
    )
    const authSessionAdapter: AuthSessionAdapter = {
      getAccessToken: vi
        .fn()
        .mockResolvedValueOnce('stale-token')
        .mockResolvedValueOnce('fresh-token'),
      refreshSession: vi.fn(async () => 'fresh-token'),
      handleUnauthenticated: vi.fn(),
    }
    const apiClient = createApiClient({ authSessionAdapter, fetchImpl })

    await expect(
      apiClient.get<{ ok: boolean }>(API_ENDPOINTS.profile),
    ).resolves.toEqual({
      ok: true,
    })

    expect(authSessionAdapter.refreshSession).toHaveBeenCalledTimes(1)
    expect(fetchImpl).toHaveBeenCalledTimes(2)

    const headers = new Headers(capturedInits[1]?.headers)

    expect(headers.get('authorization')).toBe('Bearer fresh-token')
  })

  it('surfaces unauthenticated errors when refresh cannot recover', async () => {
    const fetchImpl = vi.fn(async () =>
      createEnvelopeResponse(
        {
          success: false,
          data: null,
          error: {
            code: 'UNAUTHENTICATED',
            message: 'Session expired.',
          },
          meta: {
            requestId: 'request-6',
          },
        },
        401,
      ),
    )
    const handleUnauthenticated = vi.fn()
    const authSessionAdapter: AuthSessionAdapter = {
      getAccessToken: vi.fn(async () => 'expired-token'),
      refreshSession: vi.fn(async () => null),
      handleUnauthenticated,
    }
    const apiClient = createApiClient({ authSessionAdapter, fetchImpl })

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

  it('rejects malformed JSON success payloads that do not match the API envelope', async () => {
    const fetchImpl = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            data: {
              ok: true,
            },
            meta: {
              requestId: 'request-7',
            },
          }),
          {
            status: 200,
            headers: {
              'content-type': 'application/json',
            },
          },
        ),
    )
    const apiClient = createApiClient({ fetchImpl })

    await expect(apiClient.get(API_ENDPOINTS.health)).rejects.toMatchObject({
      code: 'HTTP_ERROR',
      message: 'Response did not match the API envelope contract.',
      requestId: 'request-7',
      status: 200,
    })
  })

  it('wraps invalid JSON responses in a typed client error', async () => {
    const fetchImpl = vi.fn(
      async () =>
        new Response('{', {
          status: 502,
          headers: {
            'content-type': 'application/json',
          },
        }),
    )
    const apiClient = createApiClient({ fetchImpl })

    await expect(apiClient.get(API_ENDPOINTS.health)).rejects.toMatchObject({
      code: 'HTTP_ERROR',
      message: 'Response body was not valid JSON.',
      status: 502,
    })
  })
})
