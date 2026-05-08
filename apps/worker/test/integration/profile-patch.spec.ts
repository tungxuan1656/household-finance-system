import { SELF, env } from 'cloudflare:test'
import { describe, expect, it } from 'vitest'

import {
  type ApiEnvelope,
  parseJson,
  registerWorkerIntegrationSetup,
} from '../helpers/test-context'

registerWorkerIntegrationSetup()

describe('Worker integration: profile patch', () => {
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
        quickAddLastSourceKey: 'cash',
      }),
    })

    const payload = await parseJson<
      ApiEnvelope<{
        createdAt: number
        id: string
        email: string | null
        displayName: string | null
        avatarUrl: string | null
        quickAddLastSourceKey: string | null
      }>
    >(response)

    expect(response.status).toBe(200)
    expect(typeof payload.data.createdAt).toBe('number')
    expect(payload.data.displayName).toBe('Updated Name')
    expect(payload.data.avatarUrl).toBeNull()
    expect(payload.data.quickAddLastSourceKey).toBe('cash')

    const storedUser = await env.DB.prepare(
      `SELECT display_name, avatar_url, quick_add_last_source_key
        FROM users
        WHERE id = ?`,
    )
      .bind(exchangePayload.data.user.id)
      .first<{
        display_name: string | null
        avatar_url: string | null
        quick_add_last_source_key: string | null
      }>()

    expect(storedUser).toEqual({
      display_name: 'Updated Name',
      avatar_url: null,
      quick_add_last_source_key: 'cash',
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
