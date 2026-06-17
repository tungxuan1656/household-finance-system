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

type BudgetDTO = {
  id: string
  scope: 'household' | 'personal' | 'category'
  householdId: string | null
  ownerUserId: string | null
  period: string
  totalLimitMinor: number
  currencyCode: string
  categoryLimits: Array<{
    categoryKey: string
    limitMinor: number
  }>
  createdByUserId: string
  createdAt: number
  updatedAt: number
}

const createBudgetHousehold = async (accessToken: string) => {
  const response = await SELF.fetch('https://example.com/api/v1/households', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ name: 'Test' }),
  })

  const payload = await parseJson<ApiEnvelope<{ id: string }>>(response)
  expect(response.status).toBe(201)

  return payload.data.id
}

describe('Worker integration: budgets create and list', () => {
  it('creates a budget with totalLimit only', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-budget-create-total-only:budget-create-total-only@example.com',
    )
    const householdId = await createBudgetHousehold(auth.accessToken)

    const response = await SELF.fetch('https://example.com/api/v1/budgets', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${auth.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        scope: 'household',
        householdId,
        period: '2026-05',
        totalLimit: 125000,
      }),
    })
    const payload = await parseJson<ApiEnvelope<BudgetDTO>>(response)

    expect(response.status).toBe(201)
    expect(payload.data).toMatchObject({
      scope: 'household',
      householdId,
      period: '2026-05',
      totalLimitMinor: 125000,
      categoryLimits: [],
      createdByUserId: auth.user.id,
    })
    expect(typeof payload.data.createdAt).toBe('number')
    expect(typeof payload.data.updatedAt).toBe('number')
  })

  it('creates a budget with totalLimit and categoryLimits', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-budget-create-with-categories:budget-create-with-categories@example.com',
    )
    const householdId = await createBudgetHousehold(auth.accessToken)

    const response = await SELF.fetch('https://example.com/api/v1/budgets', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${auth.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        scope: 'household',
        householdId,
        period: '2026-06',
        totalLimit: 200000,
        categoryLimits: [
          { categoryKey: 'food', limitMinor: 80000 },
          { categoryKey: 'travel', limitMinor: 40000 },
        ],
      }),
    })
    const payload = await parseJson<ApiEnvelope<BudgetDTO>>(response)

    expect(response.status).toBe(201)
    expect(payload.data.categoryLimits).toEqual([
      { categoryKey: 'food', limitMinor: 80000 },
      { categoryKey: 'travel', limitMinor: 40000 },
    ])
  })

  it('lists budgets by household', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-budget-list:budget-list@example.com',
    )
    const householdId = await createBudgetHousehold(auth.accessToken)

    for (const [period, totalLimit] of [
      ['2026-04', 111000],
      ['2026-05', 222000],
    ] as const) {
      const createResponse = await SELF.fetch(
        'https://example.com/api/v1/budgets',
        {
          method: 'POST',
          headers: {
            authorization: `Bearer ${auth.accessToken}`,
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            scope: 'household',
            householdId,
            period,
            totalLimit,
          }),
        },
      )
      expect(createResponse.status).toBe(201)
    }

    const response = await SELF.fetch(
      `https://example.com/api/v1/budgets?household_id=${householdId}`,
      {
        headers: { authorization: `Bearer ${auth.accessToken}` },
      },
    )
    const payload =
      await parseJson<ApiEnvelope<{ items: BudgetDTO[] }>>(response)

    expect(response.status).toBe(200)
    expect(payload.data.items.map((item) => item.period)).toEqual([
      '2026-05',
      '2026-04',
    ])
  })

  it('lists budgets by household and period', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-budget-list-filtered:budget-list-filtered@example.com',
    )
    const householdId = await createBudgetHousehold(auth.accessToken)

    for (const [period, totalLimit] of [
      ['2026-04', 111000],
      ['2026-05', 222000],
    ] as const) {
      const createResponse = await SELF.fetch(
        'https://example.com/api/v1/budgets',
        {
          method: 'POST',
          headers: {
            authorization: `Bearer ${auth.accessToken}`,
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            scope: 'household',
            householdId,
            period,
            totalLimit,
          }),
        },
      )
      expect(createResponse.status).toBe(201)
    }

    const response = await SELF.fetch(
      `https://example.com/api/v1/budgets?household_id=${householdId}&period=2026-05`,
      { headers: { authorization: `Bearer ${auth.accessToken}` } },
    )
    const payload =
      await parseJson<ApiEnvelope<{ items: BudgetDTO[] }>>(response)

    expect(response.status).toBe(200)
    expect(payload.data.items).toHaveLength(1)
    expect(payload.data.items[0].period).toBe('2026-05')
  })

  it('rejects create budget with invalid period format', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-budget-invalid-period:budget-invalid-period@example.com',
    )
    const householdId = await createBudgetHousehold(auth.accessToken)

    const response = await SELF.fetch('https://example.com/api/v1/budgets', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${auth.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        scope: 'household',
        householdId,
        period: '2026-4',
        totalLimit: 100000,
      }),
    })
    const payload = await parseJson<ApiErrorEnvelope>(response)

    expect(response.status).toBe(400)
    expect(payload.error.code).toBe('INVALID_INPUT')
  })

  it('rejects create budget with zero totalLimit', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-budget-zero-limit:budget-zero-limit@example.com',
    )
    const householdId = await createBudgetHousehold(auth.accessToken)

    const response = await SELF.fetch('https://example.com/api/v1/budgets', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${auth.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        scope: 'household',
        householdId,
        period: '2026-05',
        totalLimit: 0,
      }),
    })
    const payload = await parseJson<ApiErrorEnvelope>(response)

    expect(response.status).toBe(400)
    expect(payload.error.code).toBe('INVALID_INPUT')
  })

  it('rejects create budget with non-expense categoryKey', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-budget-invalid-category:budget-invalid-category@example.com',
    )
    const householdId = await createBudgetHousehold(auth.accessToken)

    const response = await SELF.fetch('https://example.com/api/v1/budgets', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${auth.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        scope: 'household',
        householdId,
        period: '2026-05',
        totalLimit: 100000,
        categoryLimits: [{ categoryKey: 'money-in', limitMinor: 10000 }],
      }),
    })
    const payload = await parseJson<ApiErrorEnvelope>(response)

    expect(response.status).toBe(400)
    expect(payload.error.code).toBe('INVALID_INPUT')
  })

  it('rejects create budget with duplicate categoryKeys', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-budget-duplicate-categories:budget-duplicate-categories@example.com',
    )
    const householdId = await createBudgetHousehold(auth.accessToken)

    const response = await SELF.fetch('https://example.com/api/v1/budgets', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${auth.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        scope: 'household',
        householdId,
        period: '2026-05',
        totalLimit: 100000,
        categoryLimits: [
          { categoryKey: 'food', limitMinor: 30000 },
          { categoryKey: 'food', limitMinor: 40000 },
        ],
      }),
    })
    const payload = await parseJson<ApiErrorEnvelope>(response)

    expect(response.status).toBe(400)
    expect(payload.error.code).toBe('INVALID_INPUT')
  })

  it('rejects create budget with missing householdId', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-budget-missing-household:budget-missing-household@example.com',
    )

    const response = await SELF.fetch('https://example.com/api/v1/budgets', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${auth.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        scope: 'household',
        period: '2026-05',
        totalLimit: 100000,
      }),
    })
    const payload = await parseJson<ApiErrorEnvelope>(response)

    expect(response.status).toBe(400)
    expect(payload.error.code).toBe('INVALID_INPUT')
  })

  it('rejects duplicate budget for same household and period', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-budget-conflict:budget-conflict@example.com',
    )
    const householdId = await createBudgetHousehold(auth.accessToken)

    const firstResponse = await SELF.fetch(
      'https://example.com/api/v1/budgets',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          scope: 'household',
          householdId,
          period: '2026-05',
          totalLimit: 100000,
        }),
      },
    )
    expect(firstResponse.status).toBe(201)

    const response = await SELF.fetch('https://example.com/api/v1/budgets', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${auth.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        scope: 'household',
        householdId,
        period: '2026-05',
        totalLimit: 150000,
      }),
    })
    const payload = await parseJson<ApiErrorEnvelope>(response)

    expect(response.status).toBe(409)
    expect(payload.error.code).toBe('CONFLICT')
  })
})
