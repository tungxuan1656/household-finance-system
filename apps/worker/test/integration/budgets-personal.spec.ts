import { SELF } from 'cloudflare:test'
import { describe, expect, it } from 'vitest'

import {
  type ApiEnvelope,
  type ApiErrorEnvelope,
  createHousehold,
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

describe('Worker integration: personal budgets', () => {
  it('creates a personal budget owned by current user', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-personal-budget-create:personal-budget-create@example.com',
    )

    const response = await SELF.fetch('https://example.com/api/v1/budgets', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${auth.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        scope: 'personal',
        period: '2026-07',
        totalLimit: 150000,
        currencyCode: 'USD',
      }),
    })
    const payload = await parseJson<ApiEnvelope<BudgetDTO>>(response)

    expect(response.status).toBe(201)
    expect(payload.data).toMatchObject({
      scope: 'personal',
      householdId: null,
      ownerUserId: auth.user.id,
      period: '2026-07',
      totalLimitMinor: 150000,
      currencyCode: 'USD',
      categoryLimits: [],
      createdByUserId: auth.user.id,
    })
  })

  it('rejects create personal budget without currencyCode', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-personal-budget-no-currency:personal-budget-no-currency@example.com',
    )

    const response = await SELF.fetch('https://example.com/api/v1/budgets', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${auth.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        scope: 'personal',
        period: '2026-07',
        totalLimit: 150000,
      }),
    })
    const payload = await parseJson<ApiErrorEnvelope>(response)

    expect(response.status).toBe(400)
    expect(payload.error.code).toBe('INVALID_INPUT')
  })

  it('rejects create personal budget with householdId set', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-personal-budget-mix:personal-budget-mix@example.com',
    )

    const householdResponse = await createHousehold(
      auth.accessToken,
      'Personal budget mix household',
    )
    expect(householdResponse.status).toBe(201)
    const householdId = (
      await parseJson<ApiEnvelope<{ id: string }>>(householdResponse)
    ).data.id

    const response = await SELF.fetch('https://example.com/api/v1/budgets', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${auth.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        scope: 'personal',
        householdId,
        period: '2026-07',
        totalLimit: 150000,
        currencyCode: 'USD',
      }),
    })
    const payload = await parseJson<ApiErrorEnvelope>(response)

    expect(response.status).toBe(400)
    expect(payload.error.code).toBe('INVALID_INPUT')
  })

  it('rejects duplicate personal budget for same period', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-personal-budget-conflict:personal-budget-conflict@example.com',
    )

    const first = await SELF.fetch('https://example.com/api/v1/budgets', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${auth.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        scope: 'personal',
        period: '2026-07',
        totalLimit: 150000,
        currencyCode: 'USD',
      }),
    })
    expect(first.status).toBe(201)

    const second = await SELF.fetch('https://example.com/api/v1/budgets', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${auth.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        scope: 'personal',
        period: '2026-07',
        totalLimit: 200000,
        currencyCode: 'USD',
      }),
    })
    const payload = await parseJson<ApiErrorEnvelope>(second)

    expect(second.status).toBe(409)
    expect(payload.error.code).toBe('CONFLICT')
  })

  it('lists personal budgets by default when no filter is given', async () => {
    const owner = await exchangeAccessToken(
      'test:firebase-user-personal-budget-list:personal-budget-list@example.com',
    )

    for (const [period, totalLimit] of [
      ['2026-05', 100000],
      ['2026-06', 200000],
    ] as const) {
      const createResponse = await SELF.fetch(
        'https://example.com/api/v1/budgets',
        {
          method: 'POST',
          headers: {
            authorization: `Bearer ${owner.accessToken}`,
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            scope: 'personal',
            period,
            totalLimit,
            currencyCode: 'USD',
          }),
        },
      )
      expect(createResponse.status).toBe(201)
    }

    const response = await SELF.fetch(
      'https://example.com/api/v1/budgets?scope=personal',
      {
        headers: { authorization: `Bearer ${owner.accessToken}` },
      },
    )
    const payload =
      await parseJson<ApiEnvelope<{ items: BudgetDTO[] }>>(response)

    expect(response.status).toBe(200)
    expect(payload.data.items).toHaveLength(2)
    expect(payload.data.items.map((item) => item.period)).toEqual([
      '2026-06',
      '2026-05',
    ])
    expect(payload.data.items.every((item) => item.scope === 'personal')).toBe(
      true,
    )
  })

  it('union list returns both personal and household budgets for the user', async () => {
    const owner = await exchangeAccessToken(
      'test:firebase-user-personal-budget-union:personal-budget-union@example.com',
    )

    const householdResponse = await createHousehold(
      owner.accessToken,
      'Personal union household',
    )
    const householdId = (
      await parseJson<ApiEnvelope<{ id: string }>>(householdResponse)
    ).data.id

    const householdBudget = await SELF.fetch(
      'https://example.com/api/v1/budgets',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${owner.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          scope: 'household',
          householdId,
          period: '2026-04',
          totalLimit: 300000,
        }),
      },
    )
    expect(householdBudget.status).toBe(201)

    const personalBudget = await SELF.fetch(
      'https://example.com/api/v1/budgets',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${owner.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          scope: 'personal',
          period: '2026-05',
          totalLimit: 150000,
          currencyCode: 'USD',
        }),
      },
    )
    expect(personalBudget.status).toBe(201)

    const response = await SELF.fetch('https://example.com/api/v1/budgets', {
      headers: { authorization: `Bearer ${owner.accessToken}` },
    })
    const payload =
      await parseJson<ApiEnvelope<{ items: BudgetDTO[] }>>(response)

    expect(response.status).toBe(200)
    expect(payload.data.items).toHaveLength(2)
    const scopes = payload.data.items.map((item) => item.scope).sort()
    expect(scopes).toEqual(['household', 'personal'])
  })

  it('returns not found when non-owner reads a personal budget', async () => {
    const owner = await exchangeAccessToken(
      'test:firebase-user-personal-budget-owner:personal-budget-owner@example.com',
    )
    const outsider = await exchangeAccessToken(
      'test:firebase-user-personal-budget-outsider:personal-budget-outsider@example.com',
    )

    const createResponse = await SELF.fetch(
      'https://example.com/api/v1/budgets',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${owner.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          scope: 'personal',
          period: '2026-07',
          totalLimit: 150000,
          currencyCode: 'USD',
        }),
      },
    )
    const budgetId = (
      await parseJson<ApiEnvelope<{ id: string }>>(createResponse)
    ).data.id

    const response = await SELF.fetch(
      `https://example.com/api/v1/budgets/${budgetId}`,
      {
        headers: { authorization: `Bearer ${outsider.accessToken}` },
      },
    )
    const payload = await parseJson<ApiErrorEnvelope>(response)

    expect(response.status).toBe(404)
    expect(payload.error.code).toBe('NOT_FOUND')
  })

  it('lets owner update and delete their personal budget', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-personal-budget-mutate:personal-budget-mutate@example.com',
    )

    const createResponse = await SELF.fetch(
      'https://example.com/api/v1/budgets',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          scope: 'personal',
          period: '2026-07',
          totalLimit: 150000,
          currencyCode: 'USD',
        }),
      },
    )
    const budgetId = (
      await parseJson<ApiEnvelope<{ id: string }>>(createResponse)
    ).data.id

    const patchResponse = await SELF.fetch(
      `https://example.com/api/v1/budgets/${budgetId}`,
      {
        method: 'PATCH',
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ totalLimit: 250000 }),
      },
    )
    const patchPayload = await parseJson<ApiEnvelope<BudgetDTO>>(patchResponse)
    expect(patchResponse.status).toBe(200)
    expect(patchPayload.data.totalLimitMinor).toBe(250000)

    const deleteResponse = await SELF.fetch(
      `https://example.com/api/v1/budgets/${budgetId}`,
      {
        method: 'DELETE',
        headers: { authorization: `Bearer ${auth.accessToken}` },
      },
    )
    expect(deleteResponse.status).toBe(200)
  })
})
