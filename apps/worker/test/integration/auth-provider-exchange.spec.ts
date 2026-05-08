import { describe, expect, it } from 'vitest'

import {
  type ApiEnvelope,
  env,
  parseJson,
  SELF,
} from './auth-session.test-setup'

describe('Worker integration: auth provider exchange', () => {
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
})
