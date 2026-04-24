import {
  env,
  createExecutionContext,
  waitOnExecutionContext,
  SELF,
} from 'cloudflare:test'
import { beforeEach, describe, expect, it } from 'vitest'

import { applyMigrations } from './helpers/apply-migrations'
import { insertHouseholdFixture } from './helpers/household-fixtures'
import worker from '@/index'

const IncomingRequest = Request

const clearTableStatements = [
  'DELETE FROM audit_logs',
  'DELETE FROM budget_limits',
  'DELETE FROM budgets',
  'DELETE FROM expense_group_items',
  'DELETE FROM expenses',
  'DELETE FROM expense_groups',
  'DELETE FROM expense_categories',
  'DELETE FROM household_memberships',
  'DELETE FROM households',
  'DELETE FROM refresh_sessions',
  'DELETE FROM auth_identities',
  'DELETE FROM users',
]

type ApiEnvelope<T> = {
  success: true
  data: T
  error: null
  meta: {
    requestId: string
  }
}

type ApiErrorEnvelope = {
  success: false
  data: null
  error: {
    code: string
    message: string
    details?: unknown
  }
  meta: {
    requestId: string
  }
}

const parseJson = async <T>(response: Response): Promise<T> =>
  response.json() as Promise<T>

beforeEach(async () => {
  await applyMigrations(env.DB)

  for (const statement of clearTableStatements) {
    await env.DB.exec(statement)
  }
})

describe('Worker foundation', () => {
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

  it('returns upload signature payload for authenticated image upload request', async () => {
    const exchangeResponse = await SELF.fetch(
      'https://example.com/api/v1/auth/provider/exchange',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'firebase',
          idToken:
            'test:firebase-user-media-signature:user-media-signature@example.com',
        }),
      },
    )

    const exchangePayload =
      await parseJson<ApiEnvelope<{ accessToken: string }>>(exchangeResponse)

    const response = await SELF.fetch(
      'https://example.com/api/v1/media/upload-signature',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${exchangePayload.data.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          resourceType: 'image',
          mimeType: 'image/jpeg',
          sizeBytes: 1024,
          feature: 'expense-receipt',
          extension: 'jpg',
        }),
      },
    )

    const payload = await parseJson<
      ApiEnvelope<{
        cloudName: string
        apiKey: string
        uploadPreset: string
        timestamp: number
        signature: string
        folder: string
        publicId: string
        resourceType: 'image' | 'video'
        uploadUrl: string
        expiresAt: number
        maxBytes: number
        allowedMimeTypes: string[]
      }>
    >(response)

    expect(response.status).toBe(200)
    expect(payload.data.cloudName).toBe('demo-cloud')
    expect(payload.data.apiKey).toBe('demo-key')
    expect(payload.data.uploadPreset).toBe('household-finance-system-preset')
    expect(payload.data.resourceType).toBe('image')
    expect(payload.data.uploadUrl).toBe(
      'https://api.cloudinary.com/v1_1/demo-cloud/image/upload',
    )
    expect(payload.data.folder).toContain('/expense-receipt')
    expect(payload.data.publicId.endsWith('.jpg')).toBe(true)
    expect(payload.data.signature.length).toBe(40)
    expect(payload.data.expiresAt).toBeGreaterThan(payload.data.timestamp)
    expect(payload.data.maxBytes).toBeGreaterThan(0)
    expect(payload.data.allowedMimeTypes).toContain('image/jpeg')
  })

  it('rejects media upload signature request when bearer token is missing', async () => {
    const response = await SELF.fetch(
      'https://example.com/api/v1/media/upload-signature',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          resourceType: 'image',
          mimeType: 'image/jpeg',
          sizeBytes: 1024,
          feature: 'expense-receipt',
        }),
      },
    )

    const payload = await parseJson<ApiErrorEnvelope>(response)

    expect(response.status).toBe(401)
    expect(payload.error.code).toBe('UNAUTHENTICATED')
  })

  it('rejects media upload signature request for unsupported mime type', async () => {
    const exchangeResponse = await SELF.fetch(
      'https://example.com/api/v1/auth/provider/exchange',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'firebase',
          idToken:
            'test:firebase-user-media-invalid-mime:user-media-invalid-mime@example.com',
        }),
      },
    )

    const exchangePayload =
      await parseJson<ApiEnvelope<{ accessToken: string }>>(exchangeResponse)

    const response = await SELF.fetch(
      'https://example.com/api/v1/media/upload-signature',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${exchangePayload.data.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          resourceType: 'video',
          mimeType: 'video/ogg',
          sizeBytes: 4096,
          feature: 'expense-receipt',
        }),
      },
    )

    const payload = await parseJson<ApiErrorEnvelope>(response)

    expect(response.status).toBe(400)
    expect(payload.error.code).toBe('INVALID_INPUT')
  })

  it('updates display name only on profile patch', async () => {
    const exchangeResponse = await SELF.fetch(
      'https://example.com/api/v1/auth/provider/exchange',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'firebase',
          idToken:
            'test:firebase-user-profile-name:user-profile-name@example.com',
        }),
      },
    )

    const exchangePayload =
      await parseJson<
        ApiEnvelope<{ accessToken: string; user: { id: string } }>
      >(exchangeResponse)

    const response = await SELF.fetch('https://example.com/api/v1/users/me', {
      method: 'PATCH',
      headers: {
        authorization: `Bearer ${exchangePayload.data.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        displayName: 'Updated Name',
      }),
    })

    const payload = await parseJson<
      ApiEnvelope<{
        createdAt: number
        id: string
        email: string | null
        displayName: string | null
        avatarUrl: string | null
      }>
    >(response)

    expect(response.status).toBe(200)
    expect(typeof payload.data.createdAt).toBe('number')
    expect(payload.data.displayName).toBe('Updated Name')
    expect(payload.data.avatarUrl).toBeNull()

    const storedUser = await env.DB.prepare(
      `SELECT display_name, avatar_url
       FROM users
       WHERE id = ?`,
    )
      .bind(exchangePayload.data.user.id)
      .first<{ display_name: string | null; avatar_url: string | null }>()

    expect(storedUser).toEqual({
      display_name: 'Updated Name',
      avatar_url: null,
    })
  })

  it('updates avatar URL only on profile patch', async () => {
    const exchangeResponse = await SELF.fetch(
      'https://example.com/api/v1/auth/provider/exchange',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'firebase',
          idToken:
            'test:firebase-user-profile-avatar:user-profile-avatar@example.com',
        }),
      },
    )

    const exchangePayload =
      await parseJson<
        ApiEnvelope<{ accessToken: string; user: { id: string } }>
      >(exchangeResponse)

    const response = await SELF.fetch('https://example.com/api/v1/users/me', {
      method: 'PATCH',
      headers: {
        authorization: `Bearer ${exchangePayload.data.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        avatarUrl: 'https://firebasestorage.googleapis.com/avatar.png',
      }),
    })

    const payload =
      await parseJson<
        ApiEnvelope<{ displayName: string | null; avatarUrl: string | null }>
      >(response)

    expect(response.status).toBe(200)
    expect(payload.data.displayName).toBeNull()
    expect(payload.data.avatarUrl).toBe(
      'https://firebasestorage.googleapis.com/avatar.png',
    )
  })

  it('updates both display name and avatar URL on profile patch', async () => {
    const exchangeResponse = await SELF.fetch(
      'https://example.com/api/v1/auth/provider/exchange',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'firebase',
          idToken:
            'test:firebase-user-profile-both:user-profile-both@example.com',
        }),
      },
    )

    const exchangePayload =
      await parseJson<ApiEnvelope<{ accessToken: string }>>(exchangeResponse)

    const response = await SELF.fetch('https://example.com/api/v1/users/me', {
      method: 'PATCH',
      headers: {
        authorization: `Bearer ${exchangePayload.data.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        displayName: 'Parent One',
        avatarUrl: 'https://firebasestorage.googleapis.com/parent-one.png',
      }),
    })

    const payload =
      await parseJson<
        ApiEnvelope<{ displayName: string | null; avatarUrl: string | null }>
      >(response)

    expect(response.status).toBe(200)
    expect(payload.data).toMatchObject({
      displayName: 'Parent One',
      avatarUrl: 'https://firebasestorage.googleapis.com/parent-one.png',
    })
  })

  it('clears display name and avatar URL on profile patch with null values', async () => {
    const exchangeResponse = await SELF.fetch(
      'https://example.com/api/v1/auth/provider/exchange',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'firebase',
          idToken:
            'test:firebase-user-profile-clear:user-profile-clear@example.com',
        }),
      },
    )

    const exchangePayload =
      await parseJson<
        ApiEnvelope<{ accessToken: string; user: { id: string } }>
      >(exchangeResponse)

    await env.DB.prepare(
      `UPDATE users
       SET display_name = ?, avatar_url = ?
       WHERE id = ?`,
    )
      .bind(
        'Needs Clearing',
        'https://firebasestorage.googleapis.com/needs-clearing.png',
        exchangePayload.data.user.id,
      )
      .run()

    const response = await SELF.fetch('https://example.com/api/v1/users/me', {
      method: 'PATCH',
      headers: {
        authorization: `Bearer ${exchangePayload.data.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        displayName: null,
        avatarUrl: null,
      }),
    })

    const payload =
      await parseJson<
        ApiEnvelope<{ displayName: string | null; avatarUrl: string | null }>
      >(response)

    expect(response.status).toBe(200)
    expect(payload.data).toMatchObject({
      displayName: null,
      avatarUrl: null,
    })
  })

  it('rejects invalid avatar URL on profile patch', async () => {
    const exchangeResponse = await SELF.fetch(
      'https://example.com/api/v1/auth/provider/exchange',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'firebase',
          idToken:
            'test:firebase-user-profile-invalid-avatar:user-profile-invalid-avatar@example.com',
        }),
      },
    )

    const exchangePayload =
      await parseJson<ApiEnvelope<{ accessToken: string }>>(exchangeResponse)

    const response = await SELF.fetch('https://example.com/api/v1/users/me', {
      method: 'PATCH',
      headers: {
        authorization: `Bearer ${exchangePayload.data.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        avatarUrl: 'not-a-url',
      }),
    })

    const payload = await parseJson<{ error: { code: string } }>(response)

    expect(response.status).toBe(400)
    expect(payload.error.code).toBe('INVALID_INPUT')
  })

  it('rejects blank trimmed display name on profile patch', async () => {
    const exchangeResponse = await SELF.fetch(
      'https://example.com/api/v1/auth/provider/exchange',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'firebase',
          idToken:
            'test:firebase-user-profile-blank-name:user-profile-blank-name@example.com',
        }),
      },
    )

    const exchangePayload =
      await parseJson<ApiEnvelope<{ accessToken: string }>>(exchangeResponse)

    const response = await SELF.fetch('https://example.com/api/v1/users/me', {
      method: 'PATCH',
      headers: {
        authorization: `Bearer ${exchangePayload.data.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        displayName: '   ',
      }),
    })

    const payload = await parseJson<{ error: { code: string } }>(response)

    expect(response.status).toBe(400)
    expect(payload.error.code).toBe('INVALID_INPUT')
  })

  it('rejects display name longer than 100 characters on profile patch', async () => {
    const exchangeResponse = await SELF.fetch(
      'https://example.com/api/v1/auth/provider/exchange',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'firebase',
          idToken:
            'test:firebase-user-profile-long-name:user-profile-long-name@example.com',
        }),
      },
    )

    const exchangePayload =
      await parseJson<ApiEnvelope<{ accessToken: string }>>(exchangeResponse)

    const response = await SELF.fetch('https://example.com/api/v1/users/me', {
      method: 'PATCH',
      headers: {
        authorization: `Bearer ${exchangePayload.data.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        displayName: 'a'.repeat(101),
      }),
    })

    const payload = await parseJson<{ error: { code: string } }>(response)

    expect(response.status).toBe(400)
    expect(payload.error.code).toBe('INVALID_INPUT')
  })

  it('rejects unknown fields on profile patch', async () => {
    const exchangeResponse = await SELF.fetch(
      'https://example.com/api/v1/auth/provider/exchange',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'firebase',
          idToken:
            'test:firebase-user-profile-unknown:user-profile-unknown@example.com',
        }),
      },
    )

    const exchangePayload =
      await parseJson<ApiEnvelope<{ accessToken: string }>>(exchangeResponse)

    const response = await SELF.fetch('https://example.com/api/v1/users/me', {
      method: 'PATCH',
      headers: {
        authorization: `Bearer ${exchangePayload.data.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        displayName: 'Known',
        provider: 'firebase',
      }),
    })

    const payload = await parseJson<{ error: { code: string } }>(response)

    expect(response.status).toBe(400)
    expect(payload.error.code).toBe('INVALID_INPUT')
  })

  it('rejects attempts to send email on profile patch', async () => {
    const exchangeResponse = await SELF.fetch(
      'https://example.com/api/v1/auth/provider/exchange',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'firebase',
          idToken:
            'test:firebase-user-profile-email:user-profile-email@example.com',
        }),
      },
    )

    const exchangePayload =
      await parseJson<ApiEnvelope<{ accessToken: string }>>(exchangeResponse)

    const response = await SELF.fetch('https://example.com/api/v1/users/me', {
      method: 'PATCH',
      headers: {
        authorization: `Bearer ${exchangePayload.data.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        email: 'hijack@example.com',
      }),
    })

    const payload = await parseJson<{ error: { code: string } }>(response)

    expect(response.status).toBe(400)
    expect(payload.error.code).toBe('INVALID_INPUT')
  })

  it('rejects empty profile patch payload', async () => {
    const exchangeResponse = await SELF.fetch(
      'https://example.com/api/v1/auth/provider/exchange',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'firebase',
          idToken:
            'test:firebase-user-profile-empty:user-profile-empty@example.com',
        }),
      },
    )

    const exchangePayload =
      await parseJson<ApiEnvelope<{ accessToken: string }>>(exchangeResponse)

    const response = await SELF.fetch('https://example.com/api/v1/users/me', {
      method: 'PATCH',
      headers: {
        authorization: `Bearer ${exchangePayload.data.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({}),
    })

    const payload = await parseJson<{ error: { code: string } }>(response)

    expect(response.status).toBe(400)
    expect(payload.error.code).toBe('INVALID_INPUT')
  })

  it('exchanges firebase token and accesses protected route', async () => {
    const exchangeResponse = await SELF.fetch(
      'https://example.com/api/v1/auth/provider/exchange',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'firebase',
          idToken: 'test:firebase-user-1:user1@example.com',
        }),
      },
    )

    const exchangePayload = await parseJson<
      ApiEnvelope<{
        accessToken: string
        refreshToken: string
        user: {
          id: string
          email: string | null
        }
      }>
    >(exchangeResponse)

    expect(exchangeResponse.status).toBe(200)
    expect(exchangePayload.data.user.email).toBe('user1@example.com')

    const protectedResponse = await SELF.fetch(
      'https://example.com/api/v1/protected/ping',
      {
        headers: {
          authorization: `Bearer ${exchangePayload.data.accessToken}`,
        },
      },
    )

    const protectedPayload = await parseJson<
      ApiEnvelope<{
        ok: boolean
        user: {
          id: string
          email: string | null
        }
      }>
    >(protectedResponse)

    expect(protectedResponse.status).toBe(200)
    expect(protectedPayload.data.ok).toBe(true)
    expect(protectedPayload.data.user.id).toBe(exchangePayload.data.user.id)
  })

  it('preserves existing user profile fields on sparse provider claims', async () => {
    const initialExchangeResponse = await SELF.fetch(
      'https://example.com/api/v1/auth/provider/exchange',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'firebase',
          idToken: 'test:firebase-user-sparse:user-sparse@example.com',
        }),
      },
    )

    const initialExchangePayload = await parseJson<
      ApiEnvelope<{
        user: {
          id: string
          email: string | null
        }
      }>
    >(initialExchangeResponse)

    await env.DB.prepare(
      `UPDATE users
       SET display_name = ?, avatar_url = ?
       WHERE id = ?`,
    )
      .bind(
        'Saved Name',
        'https://cdn.example.com/avatar.png',
        initialExchangePayload.data.user.id,
      )
      .run()

    const sparseExchangeResponse = await SELF.fetch(
      'https://example.com/api/v1/auth/provider/exchange',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'firebase',
          idToken: 'test:firebase-user-sparse',
        }),
      },
    )

    const sparseExchangePayload = await parseJson<
      ApiEnvelope<{
        user: {
          email: string | null
          displayName: string | null
          avatarUrl: string | null
        }
      }>
    >(sparseExchangeResponse)

    expect(sparseExchangeResponse.status).toBe(200)
    expect(sparseExchangePayload.data.user.email).toBe(
      'user-sparse@example.com',
    )
    expect(sparseExchangePayload.data.user.displayName).toBe('Saved Name')
    expect(sparseExchangePayload.data.user.avatarUrl).toBe(
      'https://cdn.example.com/avatar.png',
    )
  })

  it('refreshes mirrored profile fields from provider claims when claims are present', async () => {
    const initialExchangeResponse = await SELF.fetch(
      'https://example.com/api/v1/auth/provider/exchange',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'firebase',
          idToken:
            'test:firebase-user-claim-refresh:user-claim-refresh@example.com',
        }),
      },
    )

    const initialExchangePayload = await parseJson<
      ApiEnvelope<{
        user: {
          id: string
        }
      }>
    >(initialExchangeResponse)

    await env.DB.prepare(
      `UPDATE users
       SET display_name = ?, avatar_url = ?
       WHERE id = ?`,
    )
      .bind(
        'Mirrored Name',
        'https://cdn.example.com/mirrored-avatar.png',
        initialExchangePayload.data.user.id,
      )
      .run()

    const secondExchangeResponse = await SELF.fetch(
      'https://example.com/api/v1/auth/provider/exchange',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'firebase',
          idToken:
            'test:firebase-user-claim-refresh:user-claim-refresh@example.com:Firebase Name:https://firebasestorage.googleapis.com/firebase-avatar.png',
        }),
      },
    )

    const secondExchangePayload = await parseJson<
      ApiEnvelope<{
        user: {
          displayName: string | null
          avatarUrl: string | null
        }
      }>
    >(secondExchangeResponse)

    expect(secondExchangeResponse.status).toBe(200)
    expect(secondExchangePayload.data.user.displayName).toBe('Firebase Name')
    expect(secondExchangePayload.data.user.avatarUrl).toBe(
      'https://firebasestorage.googleapis.com/firebase-avatar.png',
    )
  })

  it('rotates refresh token and invalidates old refresh token', async () => {
    const exchangeResponse = await SELF.fetch(
      'https://example.com/api/v1/auth/provider/exchange',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'firebase',
          idToken: 'test:firebase-user-2:user2@example.com',
        }),
      },
    )

    const exchangePayload = await parseJson<
      ApiEnvelope<{
        accessToken: string
        refreshToken: string
      }>
    >(exchangeResponse)

    const refreshResponse = await SELF.fetch(
      'https://example.com/api/v1/auth/refresh',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: exchangePayload.data.refreshToken,
        }),
      },
    )

    const refreshPayload = await parseJson<
      ApiEnvelope<{
        accessToken: string
        refreshToken: string
      }>
    >(refreshResponse)

    expect(refreshResponse.status).toBe(200)
    expect(refreshPayload.data.accessToken).not.toBe(
      exchangePayload.data.accessToken,
    )
    expect(refreshPayload.data.refreshToken).not.toBe(
      exchangePayload.data.refreshToken,
    )

    const oldRefreshReplayResponse = await SELF.fetch(
      'https://example.com/api/v1/auth/refresh',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: exchangePayload.data.refreshToken,
        }),
      },
    )

    const oldRefreshReplayPayload = await parseJson<{
      error: { code: string }
    }>(oldRefreshReplayResponse)

    expect(oldRefreshReplayResponse.status).toBe(401)
    expect(oldRefreshReplayPayload.error.code).toBe('UNAUTHENTICATED')
  })

  it('rejects old access token after refresh rotation', async () => {
    const exchangeResponse = await SELF.fetch(
      'https://example.com/api/v1/auth/provider/exchange',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'firebase',
          idToken: 'test:firebase-user-3:user3@example.com',
        }),
      },
    )

    const exchangePayload = await parseJson<
      ApiEnvelope<{
        accessToken: string
        refreshToken: string
      }>
    >(exchangeResponse)

    const refreshResponse = await SELF.fetch(
      'https://example.com/api/v1/auth/refresh',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: exchangePayload.data.refreshToken,
        }),
      },
    )

    expect(refreshResponse.status).toBe(200)

    const protectedResponse = await SELF.fetch(
      'https://example.com/api/v1/protected/ping',
      {
        headers: {
          authorization: `Bearer ${exchangePayload.data.accessToken}`,
        },
      },
    )

    const protectedPayload = await parseJson<{
      error: { code: string }
    }>(protectedResponse)

    expect(protectedResponse.status).toBe(401)
    expect(protectedPayload.error.code).toBe('UNAUTHENTICATED')
  })

  it('rejects logout without a bearer token', async () => {
    const logoutResponse = await SELF.fetch(
      'https://example.com/api/v1/auth/logout',
      {
        method: 'POST',
      },
    )

    const logoutPayload = await parseJson<{
      error: { code: string }
    }>(logoutResponse)

    expect(logoutResponse.status).toBe(401)
    expect(logoutPayload.error.code).toBe('UNAUTHENTICATED')
  })

  it('revokes the current session on logout and blocks the previous access token', async () => {
    const exchangeResponse = await SELF.fetch(
      'https://example.com/api/v1/auth/provider/exchange',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'firebase',
          idToken: 'test:firebase-user-logout:user-logout@example.com',
        }),
      },
    )

    const exchangePayload = await parseJson<
      ApiEnvelope<{
        accessToken: string
        refreshToken: string
      }>
    >(exchangeResponse)

    const protectedBeforeLogoutResponse = await SELF.fetch(
      'https://example.com/api/v1/protected/ping',
      {
        headers: {
          authorization: `Bearer ${exchangePayload.data.accessToken}`,
        },
      },
    )

    expect(protectedBeforeLogoutResponse.status).toBe(200)

    const logoutResponse = await SELF.fetch(
      'https://example.com/api/v1/auth/logout',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${exchangePayload.data.accessToken}`,
        },
      },
    )

    const logoutPayload =
      await parseJson<ApiEnvelope<{ revoked: boolean }>>(logoutResponse)

    expect(logoutResponse.status).toBe(200)
    expect(logoutPayload.data.revoked).toBe(true)

    const protectedAfterLogoutResponse = await SELF.fetch(
      'https://example.com/api/v1/protected/ping',
      {
        headers: {
          authorization: `Bearer ${exchangePayload.data.accessToken}`,
        },
      },
    )

    const protectedAfterLogoutPayload = await parseJson<{
      error: { code: string }
    }>(protectedAfterLogoutResponse)

    expect(protectedAfterLogoutResponse.status).toBe(401)
    expect(protectedAfterLogoutPayload.error.code).toBe('UNAUTHENTICATED')

    const refreshAfterLogoutResponse = await SELF.fetch(
      'https://example.com/api/v1/auth/refresh',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: exchangePayload.data.refreshToken,
        }),
      },
    )

    const refreshAfterLogoutPayload = await parseJson<{
      error: { code: string }
    }>(refreshAfterLogoutResponse)

    expect(refreshAfterLogoutResponse.status).toBe(401)
    expect(refreshAfterLogoutPayload.error.code).toBe('UNAUTHENTICATED')
  })

  it('rejects access token when user has been deleted', async () => {
    const exchangeResponse = await SELF.fetch(
      'https://example.com/api/v1/auth/provider/exchange',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'firebase',
          idToken: 'test:firebase-user-4:user4@example.com',
        }),
      },
    )

    const exchangePayload = await parseJson<
      ApiEnvelope<{
        accessToken: string
        user: { id: string }
      }>
    >(exchangeResponse)

    await env.DB.prepare('DELETE FROM refresh_sessions WHERE user_id = ?')
      .bind(exchangePayload.data.user.id)
      .run()

    await env.DB.prepare('DELETE FROM auth_identities WHERE user_id = ?')
      .bind(exchangePayload.data.user.id)
      .run()

    await env.DB.prepare('DELETE FROM users WHERE id = ?')
      .bind(exchangePayload.data.user.id)
      .run()

    const protectedResponse = await SELF.fetch(
      'https://example.com/api/v1/protected/ping',
      {
        headers: {
          authorization: `Bearer ${exchangePayload.data.accessToken}`,
        },
      },
    )

    const protectedPayload = await parseJson<{
      error: { code: string }
    }>(protectedResponse)

    expect(protectedResponse.status).toBe(401)
    expect(protectedPayload.error.code).toBe('UNAUTHENTICATED')
  })

  it('rejects duplicate household membership for the same user and household', async () => {
    await insertHouseholdFixture(env.DB)

    await expect(
      env.DB.prepare(
        `INSERT INTO household_memberships (
          id,
          household_id,
          user_id,
          role,
          state
        )
        VALUES ('hm4', 'h1', 'u2', 'member', 'invited')`,
      ).run(),
    ).rejects.toThrow()
  })

  it('rejects invalid membership role and expense visibility values', async () => {
    await insertHouseholdFixture(env.DB)

    await expect(
      env.DB.prepare(
        `INSERT INTO household_memberships (
          id,
          household_id,
          user_id,
          role,
          state
        )
        VALUES ('hm4', 'h1', 'u3', 'owner', 'active')`,
      ).run(),
    ).rejects.toThrow()

    await expect(
      env.DB.prepare(
        `INSERT INTO expenses (
          id,
          household_id,
          created_by_user_id,
          payer_user_id,
          category_id,
          amount_minor,
          currency_code,
          occurred_at,
          visibility,
          title
        )
        VALUES ('exp3', 'h1', 'u1', 'u2', 'cat1', 1000, 'USD', 1713916800000, 'team', 'Invalid visibility')`,
      ).run(),
    ).rejects.toThrow()
  })

  it('rejects cross-household expense group assignment', async () => {
    await insertHouseholdFixture(env.DB)

    await expect(
      env.DB.prepare(
        `INSERT INTO expense_group_items (
          id,
          household_id,
          expense_id,
          group_id,
          assigned_by_user_id
        )
        VALUES ('egi1', 'h2', 'exp1', 'grp2', 'u3')`,
      ).run(),
    ).rejects.toThrow()
  })

  it('rejects duplicate category names within a household', async () => {
    await insertHouseholdFixture(env.DB)

    await expect(
      env.DB.prepare(
        `INSERT INTO expense_categories (
          id,
          household_id,
          name,
          kind,
          created_by_user_id
        )
        VALUES ('cat3', 'h1', 'Groceries', 'expense', 'u1')`,
      ).run(),
    ).rejects.toThrow()
  })

  it('rejects duplicate expense to group assignment', async () => {
    await insertHouseholdFixture(env.DB)

    await env.DB.prepare(
      `INSERT INTO expense_group_items (
        id,
        household_id,
        expense_id,
        group_id,
        assigned_by_user_id
      )
      VALUES ('egi1', 'h1', 'exp1', 'grp1', 'u1')`,
    ).run()

    await expect(
      env.DB.prepare(
        `INSERT INTO expense_group_items (
          id,
          household_id,
          expense_id,
          group_id,
          assigned_by_user_id
        )
        VALUES ('egi2', 'h1', 'exp1', 'grp1', 'u1')`,
      ).run(),
    ).rejects.toThrow()
  })

  it('rejects duplicate household budget scope for the same month', async () => {
    await insertHouseholdFixture(env.DB)

    await expect(
      env.DB.prepare(
        `INSERT INTO budgets (
          id,
          household_id,
          scope,
          budget_month,
          start_date,
          end_date,
          currency_code,
          total_limit_minor,
          created_by_user_id
        )
        VALUES ('bud2', 'h1', 'household', '2026-04', '2026-04-01', '2026-04-30', 'USD', 600000, 'u1')`,
      ).run(),
    ).rejects.toThrow()
  })

  it('records audit log entries for household actions', async () => {
    await insertHouseholdFixture(env.DB)

    await env.DB.prepare(
      `INSERT INTO audit_logs (
        id,
        household_id,
        actor_user_id,
        action_type,
        target_type,
        target_id,
        payload_json
      )
      VALUES (
        'audit1',
        'h1',
        'u1',
        'household.member.added',
        'household_membership',
        'hm2',
        '{"after":{"role":"member","state":"active"}}'
      )`,
    ).run()

    const auditRows = await env.DB.prepare(
      `SELECT action_type, target_type, target_id
         FROM audit_logs
         WHERE household_id = ?
         ORDER BY created_at DESC`,
    )
      .bind('h1')
      .all<{
        action_type: string
        target_type: string
        target_id: string
      }>()

    expect(auditRows.results).toEqual([
      {
        action_type: 'household.member.added',
        target_type: 'household_membership',
        target_id: 'hm2',
      },
    ])
  })
})
