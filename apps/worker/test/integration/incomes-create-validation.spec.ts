import { SELF } from 'cloudflare:test'
import { describe, expect, it } from 'vitest'

import {
  type ApiErrorEnvelope,
  exchangeAccessToken,
  parseJson,
  registerWorkerIntegrationSetup,
} from '../helpers/test-context'

registerWorkerIntegrationSetup()

describe('POST /api/v1/incomes — validation errors', () => {
  it('Error: unauthenticated -> 401', async () => {
    const response = await SELF.fetch('https://example.com/api/v1/incomes', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        amount: 100000,
        sourceKey: 'cash',
        title: 'Test',
        occurredAt: Date.now(),
      }),
    })

    expect(response.status).toBe(401)

    const payload = await parseJson<ApiErrorEnvelope>(response)
    expect(payload.success).toBe(false)
    expect(payload.error.code).toBe('UNAUTHENTICATED')
  })

  it('Error: missing required fields -> 400', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-inc-missing:inc-missing@example.com',
    )

    const response = await SELF.fetch('https://example.com/api/v1/incomes', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${auth.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({}),
    })

    expect(response.status).toBe(400)

    const payload = await parseJson<ApiErrorEnvelope>(response)
    expect(payload.error.code).toBe('INVALID_INPUT')
  })

  it('Error: negative amount -> 400', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-inc-neg:inc-neg@example.com',
    )

    const response = await SELF.fetch('https://example.com/api/v1/incomes', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${auth.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        amount: -100,
        sourceKey: 'cash',
        title: 'Test',
        occurredAt: Date.now(),
      }),
    })

    expect(response.status).toBe(400)

    const payload = await parseJson<ApiErrorEnvelope>(response)
    expect(payload.error.code).toBe('INVALID_INPUT')
  })

  it('Error: blank title -> 400', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-inc-blank-title:inc-blank@example.com',
    )

    const response = await SELF.fetch('https://example.com/api/v1/incomes', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${auth.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        amount: 100000,
        sourceKey: 'cash',
        title: '   ',
        occurredAt: Date.now(),
      }),
    })

    expect(response.status).toBe(400)
  })

  it('Error: invalid sourceKey -> 400', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-inc-bad-src:inc-bad-src@example.com',
    )

    const response = await SELF.fetch('https://example.com/api/v1/incomes', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${auth.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        amount: 100000,
        sourceKey: 'invalid-source',
        title: 'Test',
        occurredAt: Date.now(),
      }),
    })

    expect(response.status).toBe(400)

    const payload = await parseJson<ApiErrorEnvelope>(response)
    expect(payload.error.code).toBe('INVALID_INPUT')
  })

  it('rejects extra fields via strict schema', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-inc-extra:inc-extra@example.com',
    )

    const response = await SELF.fetch('https://example.com/api/v1/incomes', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${auth.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        amount: 100000,
        sourceKey: 'cash',
        title: 'Test',
        occurredAt: Date.now(),
        categoryKey: 'transport', // should be rejected — server sets it
      }),
    })

    expect(response.status).toBe(400)
  })
})
