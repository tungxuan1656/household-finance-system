import { SELF } from 'cloudflare:test'
import { describe, expect, it } from 'vitest'

import {
  type ApiEnvelope,
  type ApiErrorEnvelope,
  createExpense,
  createHousehold,
  exchangeAccessToken,
  parseJson,
  registerWorkerIntegrationSetup,
} from '../helpers/test-context'

registerWorkerIntegrationSetup()

describe('GET /api/v1/expenses/summary', () => {
  it('returns summary totals for filtered expenses', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-expense-summary-happy:expense-summary-happy@example.com',
    )

    const householdResponse = await createHousehold(
      auth.accessToken,
      'Expense summary household',
    )
    expect(householdResponse.status).toBe(201)
    const householdId = (
      await parseJson<ApiEnvelope<{ id: string }>>(householdResponse)
    ).data.id

    const groupResponse = await SELF.fetch(
      'https://example.com/api/v1/groups',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          householdId,
          name: 'Summary Filter Group',
        }),
      },
    )
    expect(groupResponse.status).toBe(201)
    const groupId = (
      await parseJson<ApiEnvelope<{ id: string }>>(groupResponse)
    ).data.id

    await createExpense(auth.accessToken, {
      amount: 12000,
      categoryKey: 'food',
      sourceKey: 'cash',
      householdId,
      groupIds: [groupId],
      title: 'Lunch with note',
      note: 'shared lunch note',
      occurredAt: 1_700_000_000_000,
    })

    await createExpense(auth.accessToken, {
      amount: 45000,
      categoryKey: 'transport',
      sourceKey: 'cash',
      householdId,
      groupIds: [groupId],
      title: 'Taxi ride',
      note: 'other note',
      occurredAt: 1_700_000_100_000,
    })

    await createExpense(auth.accessToken, {
      amount: 30000,
      categoryKey: 'transport',
      sourceKey: 'cash',
      title: 'Private lunch',
      note: 'shared lunch note',
      occurredAt: 1_700_000_200_000,
    })

    const response = await SELF.fetch(
      `https://example.com/api/v1/expenses/summary?household_id=${householdId}&query=lunch&amount_min=10000&amount_max=20000&spent_by_user_id=${auth.user.id}&category_key=food&date_from=1699999999000&date_to=1700000000500&group_id=${groupId}&sort=amount_desc`,
      {
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
        },
      },
    )

    expect(response.status).toBe(200)

    const payload = await parseJson<
      ApiEnvelope<{
        totalSpendMinor: number
        expenseCount: number
        currencyCode: string
      }>
    >(response)

    expect(payload.success).toBe(true)
    expect(payload.data.totalSpendMinor).toBe(12000)
    expect(payload.data.expenseCount).toBe(1)
    expect(payload.data.currencyCode).toBe('VND')
  })

  it('returns 400 for invalid summary filters', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-expense-summary-invalid:expense-summary-invalid@example.com',
    )

    const response = await SELF.fetch(
      'https://example.com/api/v1/expenses/summary?amount_min=abc&sort=sideways',
      {
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
        },
      },
    )

    expect(response.status).toBe(400)

    const payload = await parseJson<ApiErrorEnvelope>(response)

    expect(payload.success).toBe(false)
    expect(payload.error.code).toBe('INVALID_INPUT')
  })
})
