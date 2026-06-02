import { SELF } from 'cloudflare:test'
import { describe, expect, it } from 'vitest'

import { buildTelegramInitData } from '../fixtures/telegram-init-data'
import { type ApiEnvelope, parseJson } from './auth-session.test-setup'

const exchangeWithTelegram = async (initData: string) =>
  SELF.fetch('https://example.com/api/v1/auth/provider/exchange', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ provider: 'telegram', initData }),
  })

describe('Worker integration: Telegram provider exchange', () => {
  it('exchanges valid Telegram initData and accesses a protected route', async () => {
    const initData = await buildTelegramInitData({
      user: {
        id: 1_234_567_890,
        first_name: 'Tung',
        last_name: 'Doan',
        username: 'tungdoan',
      },
    })

    const exchangeResponse = await exchangeWithTelegram(initData)
    const exchangePayload = await parseJson<
      ApiEnvelope<{
        accessToken: string
        refreshToken: string
        user: {
          id: string
          email: string | null
          displayName: string | null
          avatarUrl: string | null
          provider: string
        }
      }>
    >(exchangeResponse)

    expect(exchangeResponse.status).toBe(200)
    expect(exchangePayload.data.user.email).toBeNull()
    expect(exchangePayload.data.user.displayName).toBe('Tung Doan')
    expect(exchangePayload.data.user.provider).toBe('telegram')

    const protectedResponse = await SELF.fetch(
      'https://example.com/api/v1/protected/ping',
      {
        headers: {
          authorization: `Bearer ${exchangePayload.data.accessToken}`,
        },
      },
    )

    const protectedPayload =
      await parseJson<ApiEnvelope<{ ok: boolean }>>(protectedResponse)

    expect(protectedResponse.status).toBe(200)
    expect(protectedPayload.data.ok).toBe(true)
  })

  it('maps the same Telegram user to the same app identity on repeated exchanges', async () => {
    const initData = await buildTelegramInitData({
      user: {
        id: 9_999_999_999,
        first_name: 'Repeat',
        last_name: 'User',
      },
    })

    const firstResponse = await exchangeWithTelegram(initData)
    const firstPayload =
      await parseJson<ApiEnvelope<{ user: { id: string } }>>(firstResponse)

    const secondResponse = await exchangeWithTelegram(initData)
    const secondPayload =
      await parseJson<ApiEnvelope<{ user: { id: string } }>>(secondResponse)

    expect(firstResponse.status).toBe(200)
    expect(secondResponse.status).toBe(200)
    expect(secondPayload.data.user.id).toBe(firstPayload.data.user.id)
  })

  it('rejects Telegram initData with an expired auth_date', async () => {
    const initData = await buildTelegramInitData({
      authDate: Math.floor(Date.now() / 1000) - 7200,
    })

    const response = await exchangeWithTelegram(initData)
    const payload = await parseJson<{ error: { code: string } }>(response)

    expect(response.status).toBe(401)
    expect(payload.error.code).toBe('UNAUTHENTICATED')
  })

  it('rejects Telegram initData with a tampered field', async () => {
    const initData = await buildTelegramInitData()
    const params = new URLSearchParams(initData)
    params.set(
      'user',
      JSON.stringify({ id: 555_000_111, first_name: 'Tampered' }),
    )

    const response = await exchangeWithTelegram(params.toString())
    const payload = await parseJson<{ error: { code: string } }>(response)

    expect(response.status).toBe(401)
    expect(payload.error.code).toBe('UNAUTHENTICATED')
  })

  it('rejects Telegram initData with a missing hash', async () => {
    const params = new URLSearchParams({
      auth_date: String(Math.floor(Date.now() / 1000) - 60),
      user: JSON.stringify({ id: 1, first_name: 'NoHash' }),
    })

    const response = await exchangeWithTelegram(params.toString())
    const payload = await parseJson<{ error: { code: string } }>(response)

    expect(response.status).toBe(400)
    expect(payload.error.code).toBe('INVALID_INPUT')
  })

  it('rejects Telegram initData with a missing user field', async () => {
    const initData = await buildTelegramInitData()
    const params = new URLSearchParams(initData)
    params.delete('user')

    const response = await exchangeWithTelegram(params.toString())
    const payload = await parseJson<{ error: { code: string } }>(response)

    expect(response.status).toBe(400)
    expect(payload.error.code).toBe('INVALID_INPUT')
  })

  it('rejects an unsupported provider literal', async () => {
    const response = await SELF.fetch(
      'https://example.com/api/v1/auth/provider/exchange',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          provider: 'google',
          idToken: 'unused',
        }),
      },
    )
    const payload = await parseJson<{ error: { code: string } }>(response)

    expect(response.status).toBe(400)
    expect(payload.error.code).toBe('INVALID_INPUT')
  })

  it('preserves the existing Firebase provider path for backward compatibility', async () => {
    const response = await SELF.fetch(
      'https://example.com/api/v1/auth/provider/exchange',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          provider: 'firebase',
          idToken: 'test:firebase-user-tg-1:tg-1@example.com',
        }),
      },
    )
    const payload =
      await parseJson<
        ApiEnvelope<{ user: { provider: string; email: string | null } }>
      >(response)

    expect(response.status).toBe(200)
    expect(payload.data.user.provider).toBe('firebase')
    expect(payload.data.user.email).toBe('tg-1@example.com')
  })

  it('treats Firebase and Telegram as separate identities for the same email', async () => {
    const sharedEmail = 'shared@example.com'

    const firebaseResponse = await SELF.fetch(
      'https://example.com/api/v1/auth/provider/exchange',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          provider: 'firebase',
          idToken: `test:firebase-shared:${sharedEmail}`,
        }),
      },
    )
    const firebasePayload =
      await parseJson<ApiEnvelope<{ user: { id: string; provider: string } }>>(
        firebaseResponse,
      )

    const telegramInitData = await buildTelegramInitData({
      user: {
        id: 42_424_242,
        first_name: 'Telegram',
        username: 'sharedtg',
      },
    })
    const telegramResponse = await exchangeWithTelegram(telegramInitData)
    const telegramPayload =
      await parseJson<ApiEnvelope<{ user: { id: string; provider: string } }>>(
        telegramResponse,
      )

    expect(firebaseResponse.status).toBe(200)
    expect(telegramResponse.status).toBe(200)
    expect(firebasePayload.data.user.id).not.toBe(telegramPayload.data.user.id)
    expect(firebasePayload.data.user.provider).toBe('firebase')
    expect(telegramPayload.data.user.provider).toBe('telegram')
  })
})
