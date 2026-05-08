import { describe, expect, it } from 'vitest'

import {
  SELF,
  type ApiErrorEnvelope,
  createExpense,
  exchangeAccessToken,
  parseJson,
} from './expenses-update.test-setup'

describe('PATCH /api/v1/expenses validation', () => {
  it('rejects update of non-existent expense with 404', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-expense-update-nonexistent:update-nonexistent@example.com',
    )

    const response = await SELF.fetch(
      'https://example.com/api/v1/expenses/non-existent-id',
      {
        method: 'PATCH',
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          amount: 10000,
          categoryKey: 'food',
          sourceKey: 'cash',
          visibility: 'private',
          title: 'Non-existent',
          occurredAt: Date.now(),
        }),
      },
    )

    expect(response.status).toBe(404)
    const payload = await parseJson<ApiErrorEnvelope>(response)
    expect(payload.error.code).toBe('NOT_FOUND')
  })

  it('rejects update with invalid category', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-expense-update-invalidcat:update-invalidcat@example.com',
    )
    const createResponse = await createExpense(auth.accessToken, {
      amount: 30000,
      categoryKey: 'food',
      sourceKey: 'cash',
      visibility: 'private',
      title: 'Valid expense',
      occurredAt: Date.now(),
    })
    expect(createResponse.status).toBe(201)
    const created = await parseJson<{ data: { id: string } }>(
      createResponse as never,
    )

    const response = await SELF.fetch(
      `https://example.com/api/v1/expenses/${created.data.id}`,
      {
        method: 'PATCH',
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          amount: 30000,
          categoryKey: 'invalid-category',
          sourceKey: 'cash',
          visibility: 'private',
          title: 'Updated',
          occurredAt: Date.now(),
        }),
      },
    )

    expect(response.status).toBe(400)
    const payload = await parseJson<ApiErrorEnvelope>(response)
    expect(payload.error.code).toBe('INVALID_INPUT')
  })
})
