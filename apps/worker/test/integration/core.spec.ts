import {
  SELF,
  createExecutionContext,
  env,
  waitOnExecutionContext,
} from 'cloudflare:test'
import { describe, expect, it } from 'vitest'

import {
  type ApiEnvelope,
  type ApiErrorEnvelope,
  parseJson,
  registerWorkerIntegrationSetup,
} from '../helpers/test-context'
import worker from '@/index'

const IncomingRequest = Request

registerWorkerIntegrationSetup()

describe('Worker integration: core', () => {
  it('responds with health payload', async () => {
    const request = new IncomingRequest('http://example.com/api/v1/health')
    const ctx = createExecutionContext()
    const response = await worker.fetch(request, env, ctx)

    await waitOnExecutionContext(ctx)
    const payload = await parseJson<ApiEnvelope<{ ok: boolean }>>(response)

    expect(response.status).toBe(200)
    expect(payload.success).toBe(true)
    expect(payload.data.ok).toBe(true)
    expect(payload.error).toBeNull()
    expect(payload.meta.requestId.length).toBeGreaterThan(0)
  })

  it('preserves x-request-id when provided', async () => {
    const response = await SELF.fetch('https://example.com/api/v1/health', {
      headers: {
        'x-request-id': 'request-123',
      },
    })

    const payload = await parseJson<ApiEnvelope<{ ok: boolean }>>(response)

    expect(response.status).toBe(200)
    expect(payload.success).toBe(true)
    expect(payload.meta.requestId).toBe('request-123')
  })

  it('returns not found for unknown routes', async () => {
    const response = await SELF.fetch('https://example.com/api/v1/unknown', {
      headers: {
        'accept-language': 'en-US,en;q=0.9',
      },
    })
    const payload = await parseJson<ApiErrorEnvelope>(response)

    expect(response.status).toBe(404)
    expect(payload.success).toBe(false)
    expect(payload.data).toBeNull()
    expect(payload.error.code).toBe('NOT_FOUND')
    expect(payload.error.message).toBe('Không tìm thấy đường dẫn.')
    expect(payload.meta.requestId.length).toBeGreaterThan(0)
  })

  it('returns invalid input when auth exchange payload is malformed JSON via x-locale', async () => {
    const response = await SELF.fetch(
      'https://example.com/api/v1/auth/provider/exchange',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-locale': 'fr-FR',
          'accept-language': 'en-US,en;q=0.9',
        },
        body: '{',
      },
    )

    const payload = await parseJson<ApiErrorEnvelope>(response)

    expect(response.status).toBe(400)
    expect(payload.success).toBe(false)
    expect(payload.data).toBeNull()
    expect(payload.error.code).toBe('INVALID_INPUT')
    expect(payload.error.message).toBe('Thân yêu cầu phải là JSON hợp lệ.')
  })

  it('rejects protected route when bearer token is missing', async () => {
    const response = await SELF.fetch(
      'https://example.com/api/v1/protected/ping',
      {
        headers: {
          'accept-language': 'en-US,en;q=0.9',
        },
      },
    )

    const payload = await parseJson<ApiErrorEnvelope>(response)

    expect(response.status).toBe(401)
    expect(payload.success).toBe(false)
    expect(payload.data).toBeNull()
    expect(payload.error.code).toBe('UNAUTHENTICATED')
    expect(payload.error.message).toBe('Thiếu token bearer.')
  })

  it('returns current profile for an authenticated user', async () => {
    const exchangeResponse = await SELF.fetch(
      'https://example.com/api/v1/auth/provider/exchange',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'firebase',
          idToken: 'test:firebase-user-profile:user-profile@example.com',
        }),
      },
    )

    const exchangePayload = await parseJson<
      ApiEnvelope<{
        accessToken: string
        user: {
          id: string
          email: string | null
          displayName: string | null
          avatarUrl: string | null
        }
      }>
    >(exchangeResponse)

    const profileResponse = await SELF.fetch(
      'https://example.com/api/v1/users/me',
      {
        headers: {
          authorization: `Bearer ${exchangePayload.data.accessToken}`,
        },
      },
    )

    const profilePayload = await parseJson<
      ApiEnvelope<{
        createdAt: number
        id: string
        email: string | null
        displayName: string | null
        avatarUrl: string | null
      }>
    >(profileResponse)

    expect(profileResponse.status).toBe(200)
    expect(typeof profilePayload.data.createdAt).toBe('number')
    expect(profilePayload.data).toEqual({
      createdAt: profilePayload.data.createdAt,
      id: exchangePayload.data.user.id,
      email: 'user-profile@example.com',
      displayName: null,
      avatarUrl: null,
    })
  })

  it('rejects current profile request when bearer token is missing', async () => {
    const response = await SELF.fetch('https://example.com/api/v1/users/me')

    const payload = await parseJson<ApiErrorEnvelope>(response)

    expect(response.status).toBe(401)
    expect(payload.success).toBe(false)
    expect(payload.data).toBeNull()
    expect(payload.error.code).toBe('UNAUTHENTICATED')
  })
})
