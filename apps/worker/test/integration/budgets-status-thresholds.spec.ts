import { SELF } from 'cloudflare:test'
import { describe, expect, it } from 'vitest'

import {
  type ApiEnvelope,
  createExpense,
  createHousehold,
  exchangeAccessToken,
  parseJson,
  registerWorkerIntegrationSetup,
} from '../helpers/test-context'

registerWorkerIntegrationSetup()

type BudgetThresholdStatus = 'ok' | 'warning' | 'exceeded'

type BudgetStatusDTO = {
  totalPercentUsed: number
  totalStatus: BudgetThresholdStatus
  categoryStatuses: Array<{
    status: BudgetThresholdStatus
  }>
}

describe('GET /api/v1/budgets/:id/status thresholds', () => {
  it('classifies 79.6% as ok and keeps displayed percent at 80', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-budget-status-frac-79p6:budget-status-frac-79p6@example.com',
    )

    const householdResponse = await createHousehold(
      auth.accessToken,
      'Budget 79.6% household',
    )
    expect(householdResponse.status).toBe(201)
    const householdId = (
      await parseJson<ApiEnvelope<{ id: string }>>(householdResponse)
    ).data.id

    const createBudgetResponse = await SELF.fetch(
      'https://example.com/api/v1/budgets',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          householdId,
          period: '2026-04',
          totalLimit: 100000,
        }),
      },
    )
    expect(createBudgetResponse.status).toBe(201)
    const budgetId = (
      await parseJson<ApiEnvelope<{ id: string }>>(createBudgetResponse)
    ).data.id

    await createExpense(auth.accessToken, {
      amount: 79600,
      categoryKey: 'food',
      sourceKey: 'cash',
      visibility: 'household',
      householdId,
      title: '79.6% spend',
      occurredAt: Date.UTC(2026, 3, 18),
    })

    const response = await SELF.fetch(
      `https://example.com/api/v1/budgets/${budgetId}/status`,
      {
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
        },
      },
    )

    expect(response.status).toBe(200)

    const payload = await parseJson<ApiEnvelope<BudgetStatusDTO>>(response)

    expect(payload.data.totalStatus).toBe('ok')
    expect(payload.data.totalPercentUsed).toBe(80)
  })

  it('classifies 99.5% as warning and keeps displayed percent at 100', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-budget-status-frac-99p5:budget-status-frac-99p5@example.com',
    )

    const householdResponse = await createHousehold(
      auth.accessToken,
      'Budget 99.5% household',
    )
    expect(householdResponse.status).toBe(201)
    const householdId = (
      await parseJson<ApiEnvelope<{ id: string }>>(householdResponse)
    ).data.id

    const createBudgetResponse = await SELF.fetch(
      'https://example.com/api/v1/budgets',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          householdId,
          period: '2026-04',
          totalLimit: 100000,
        }),
      },
    )
    expect(createBudgetResponse.status).toBe(201)
    const budgetId = (
      await parseJson<ApiEnvelope<{ id: string }>>(createBudgetResponse)
    ).data.id

    await createExpense(auth.accessToken, {
      amount: 99500,
      categoryKey: 'food',
      sourceKey: 'cash',
      visibility: 'household',
      householdId,
      title: '99.5% spend',
      occurredAt: Date.UTC(2026, 3, 18),
    })

    const response = await SELF.fetch(
      `https://example.com/api/v1/budgets/${budgetId}/status`,
      {
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
        },
      },
    )

    expect(response.status).toBe(200)

    const payload = await parseJson<ApiEnvelope<BudgetStatusDTO>>(response)

    expect(payload.data.totalStatus).toBe('warning')
    expect(payload.data.totalPercentUsed).toBe(100)
  })

  it.each([
    { amount: 79000, totalStatus: 'ok' },
    { amount: 80000, totalStatus: 'warning' },
    { amount: 99000, totalStatus: 'warning' },
    { amount: 100000, totalStatus: 'exceeded' },
    { amount: 120000, totalStatus: 'exceeded' },
  ] as const)(
    'applies total threshold boundaries for amount=$amount',
    async ({ amount, totalStatus }) => {
      const auth = await exchangeAccessToken(
        `test:firebase-user-budget-status-threshold-${amount}:budget-status-threshold-${amount}@example.com`,
      )

      const householdResponse = await createHousehold(
        auth.accessToken,
        `Budget threshold ${amount}`,
      )
      expect(householdResponse.status).toBe(201)
      const householdId = (
        await parseJson<ApiEnvelope<{ id: string }>>(householdResponse)
      ).data.id

      const createBudgetResponse = await SELF.fetch(
        'https://example.com/api/v1/budgets',
        {
          method: 'POST',
          headers: {
            authorization: `Bearer ${auth.accessToken}`,
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            householdId,
            period: '2026-04',
            totalLimit: 100000,
            categoryLimits: [{ categoryKey: 'food', limitMinor: 100000 }],
          }),
        },
      )
      expect(createBudgetResponse.status).toBe(201)
      const budgetId = (
        await parseJson<ApiEnvelope<{ id: string }>>(createBudgetResponse)
      ).data.id

      await createExpense(auth.accessToken, {
        amount,
        categoryKey: 'food',
        sourceKey: 'cash',
        visibility: 'household',
        householdId,
        title: 'Threshold expense',
        occurredAt: Date.UTC(2026, 3, 18),
      })

      const response = await SELF.fetch(
        `https://example.com/api/v1/budgets/${budgetId}/status`,
        {
          headers: {
            authorization: `Bearer ${auth.accessToken}`,
          },
        },
      )

      expect(response.status).toBe(200)

      const payload = await parseJson<ApiEnvelope<BudgetStatusDTO>>(response)

      expect(payload.data.totalStatus).toBe(totalStatus)
      expect(payload.data.categoryStatuses[0]?.status).toBe(totalStatus)
    },
  )
})
