import { SELF } from 'cloudflare:test'
import { describe, expect, it } from 'vitest'

import {
  type ApiEnvelope,
  type ApiErrorEnvelope,
  exchangeAccessToken,
  parseJson,
  registerWorkerIntegrationSetup,
} from '../helpers/test-context'

registerWorkerIntegrationSetup()

describe('POST /api/v1/incomes — integration tests', () => {
  it('Happy path: create personal income', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-inc-create:inc-create@example.com',
    )

    const response = await SELF.fetch('https://example.com/api/v1/incomes', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${auth.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        amount: 5000000,
        sourceKey: 'bank-transfer',
        title: 'Monthly salary',
        occurredAt: Date.now(),
      }),
    })

    expect(response.status).toBe(201)

    const payload = await parseJson<
      ApiEnvelope<{
        id: string
        title: string
        amountMinor: number
        currencyCode: string
        categoryKey: string
        sourceKey: string
        spentByUserId: string
        note: string | null
      }>
    >(response)

    expect(payload.success).toBe(true)
    expect(payload.data.title).toBe('Monthly salary')
    expect(payload.data.amountMinor).toBe(5000000)
    expect(payload.data.currencyCode).toBe('VND')
    expect(payload.data.categoryKey).toBe('money-in')
    expect(payload.data.sourceKey).toBe('bank-transfer')
    expect(payload.data.spentByUserId).toBe(auth.user.id)
    expect(payload.data.note).toBeNull()
    expect(typeof payload.data.id).toBe('string')
  })

  it('accepts optional note', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-inc-note:inc-note@example.com',
    )

    const response = await SELF.fetch('https://example.com/api/v1/incomes', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${auth.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        amount: 2000000,
        sourceKey: 'bank-transfer',
        title: 'Freelance payment',
        occurredAt: Date.now(),
        note: 'Web dev project',
      }),
    })

    expect(response.status).toBe(201)

    const payload =
      await parseJson<ApiEnvelope<{ note: string | null }>>(response)

    expect(payload.data.note).toBe('Web dev project')
  })
})
