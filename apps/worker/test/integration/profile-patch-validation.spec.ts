import { describe, expect, it } from 'vitest'

import {
  SELF,
  exchangeProfileToken,
  parseJson,
} from './profile-patch.test-setup'

describe('Worker integration: profile patch validation', () => {
  it('rejects invalid avatar URL on profile patch', async () => {
    const exchange = await exchangeProfileToken(
      'test:firebase-user-profile-invalid-avatar:user-profile-invalid-avatar@example.com',
    )

    const response = await SELF.fetch('https://example.com/api/v1/users/me', {
      method: 'PATCH',
      headers: {
        authorization: `Bearer ${exchange.payload.data.accessToken}`,
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
    const exchange = await exchangeProfileToken(
      'test:firebase-user-profile-blank-name:user-profile-blank-name@example.com',
    )

    const response = await SELF.fetch('https://example.com/api/v1/users/me', {
      method: 'PATCH',
      headers: {
        authorization: `Bearer ${exchange.payload.data.accessToken}`,
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
    const exchange = await exchangeProfileToken(
      'test:firebase-user-profile-long-name:user-profile-long-name@example.com',
    )

    const response = await SELF.fetch('https://example.com/api/v1/users/me', {
      method: 'PATCH',
      headers: {
        authorization: `Bearer ${exchange.payload.data.accessToken}`,
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
    const exchange = await exchangeProfileToken(
      'test:firebase-user-profile-unknown:user-profile-unknown@example.com',
    )

    const response = await SELF.fetch('https://example.com/api/v1/users/me', {
      method: 'PATCH',
      headers: {
        authorization: `Bearer ${exchange.payload.data.accessToken}`,
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
    const exchange = await exchangeProfileToken(
      'test:firebase-user-profile-email:user-profile-email@example.com',
    )

    const response = await SELF.fetch('https://example.com/api/v1/users/me', {
      method: 'PATCH',
      headers: {
        authorization: `Bearer ${exchange.payload.data.accessToken}`,
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
    const exchange = await exchangeProfileToken(
      'test:firebase-user-profile-empty:user-profile-empty@example.com',
    )

    const response = await SELF.fetch('https://example.com/api/v1/users/me', {
      method: 'PATCH',
      headers: {
        authorization: `Bearer ${exchange.payload.data.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({}),
    })

    const payload = await parseJson<{ error: { code: string } }>(response)

    expect(response.status).toBe(400)
    expect(payload.error.code).toBe('INVALID_INPUT')
  })
})
