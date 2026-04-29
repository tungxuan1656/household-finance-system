import { SELF, env } from 'cloudflare:test'
import { describe, expect, it } from 'vitest'

import {
  type ApiEnvelope,
  parseJson,
  registerWorkerIntegrationSetup,
} from '../helpers/test-context'

registerWorkerIntegrationSetup()

describe('Worker integration: auth and session lifecycle', () => {
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
})
