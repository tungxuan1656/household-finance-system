import { describe, expect, it } from 'vitest'

import {
  type ApiEnvelope,
  env,
  parseJson,
  SELF,
} from './auth-session.test-setup'

describe('Worker integration: auth session lifecycle', () => {
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
