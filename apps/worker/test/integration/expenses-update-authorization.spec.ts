import { describe, expect, it } from 'vitest'

import {
  SELF,
  type ApiEnvelope,
  createExpense,
  exchangeAccessToken,
  parseJson,
} from './expenses-update.test-setup'

describe('PATCH /api/v1/expenses authorization', () => {
  it('rejects unauthorized update of private expense (non-owner)', async () => {
    const owner = await exchangeAccessToken(
      'test:firebase-user-expense-update-private-owner:update-private-owner@example.com',
    )
    const other = await exchangeAccessToken(
      'test:firebase-user-expense-update-private-other:update-private-other@example.com',
    )

    const createResponse = await createExpense(owner.accessToken, {
      amount: 50000,
      categoryKey: 'food',
      sourceKey: 'cash',
      visibility: 'private',
      title: 'Private expense',
      occurredAt: Date.now(),
    })
    expect(createResponse.status).toBe(201)
    const created = await parseJson<ApiEnvelope<{ id: string }>>(createResponse)

    const response = await SELF.fetch(
      `https://example.com/api/v1/expenses/${created.data.id}`,
      {
        method: 'PATCH',
        headers: {
          authorization: `Bearer ${other.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          amount: 60000,
          categoryKey: 'food',
          sourceKey: 'cash',
          visibility: 'private',
          title: 'Updated private expense',
          occurredAt: Date.now(),
        }),
      },
    )

    expect(response.status).toBe(403)
    const payload = await parseJson<{ error: { code: string } }>(
      response as never,
    )
    expect(payload.error.code).toBe('FORBIDDEN')
  })
})
