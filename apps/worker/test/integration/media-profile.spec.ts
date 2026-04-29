import { SELF, env } from 'cloudflare:test'
import { describe, expect, it } from 'vitest'

import {
  type ApiEnvelope,
  type ApiErrorEnvelope,
  parseJson,
  registerWorkerIntegrationSetup,
} from '../helpers/test-context'

registerWorkerIntegrationSetup()

describe('Worker integration: media signatures and profile patch', () => {
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
        maxFileSize: number
        allowedFormats: string[]
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
    expect(payload.data.maxFileSize).toBe(1024)
    expect(payload.data.allowedMimeTypes).toContain('image/jpeg')
    expect(payload.data.allowedFormats).toContain('jpg')
    expect(payload.data.allowedFormats).not.toContain('png')
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
})
