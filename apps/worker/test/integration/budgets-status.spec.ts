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

type BudgetThresholdStatus = 'ok' | 'warning' | 'exceeded'

type BudgetStatusDTO = {
  budgetId: string
  householdId: string
  period: string
  currencyCode: string
  totalPlannedMinor: number
  totalActualMinor: number
  totalRemainingMinor: number
  totalPercentUsed: number
  totalStatus: BudgetThresholdStatus
  categoryStatuses: Array<{
    categoryKey: string
    plannedLimitMinor: number
    actualSpendMinor: number
    remainingMinor: number
    percentUsed: number
    status: BudgetThresholdStatus
  }>
}

describe('GET /api/v1/budgets/:id/status', () => {
  it('includes unconfigured-category spend in total status while keeping category rows configured-only', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-budget-status-unconfigured:budget-status-unconfigured@example.com',
    )

    const householdResponse = await createHousehold(
      auth.accessToken,
      'Budget status unconfigured household',
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
          categoryLimits: [{ categoryKey: 'food', limitMinor: 40000 }],
        }),
      },
    )
    expect(createBudgetResponse.status).toBe(201)
    const budgetId = (
      await parseJson<ApiEnvelope<{ id: string }>>(createBudgetResponse)
    ).data.id

    await createExpense(auth.accessToken, {
      amount: 20000,
      categoryKey: 'food',
      sourceKey: 'cash',
      visibility: 'household',
      householdId,
      title: 'Food spend',
      occurredAt: Date.UTC(2026, 3, 10),
    })

    await createExpense(auth.accessToken, {
      amount: 30000,
      categoryKey: 'travel',
      sourceKey: 'cash',
      visibility: 'household',
      householdId,
      title: 'Travel spend',
      occurredAt: Date.UTC(2026, 3, 11),
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

    expect(payload.data.totalActualMinor).toBe(50000)
    expect(payload.data.totalRemainingMinor).toBe(50000)
    expect(payload.data.totalPercentUsed).toBe(50)
    expect(payload.data.categoryStatuses).toEqual([
      {
        categoryKey: 'food',
        plannedLimitMinor: 40000,
        actualSpendMinor: 20000,
        remainingMinor: 20000,
        percentUsed: 50,
        status: 'ok',
      },
    ])
  })

  it('tracks total actual spend even when the budget has no configured category limits', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-budget-status-no-categories:budget-status-no-categories@example.com',
    )

    const householdResponse = await createHousehold(
      auth.accessToken,
      'Budget status no categories household',
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
      amount: 81000,
      categoryKey: 'travel',
      sourceKey: 'cash',
      visibility: 'household',
      householdId,
      title: 'Trip booking',
      occurredAt: Date.UTC(2026, 3, 20),
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

    expect(payload.data.totalActualMinor).toBe(81000)
    expect(payload.data.totalRemainingMinor).toBe(19000)
    expect(payload.data.totalPercentUsed).toBe(81)
    expect(payload.data.totalStatus).toBe('warning')
    expect(payload.data.categoryStatuses).toEqual([])
  })

  it('classifies 79.6% as ok (not rounded up to warning)', async () => {
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

  it('classifies 99.5% as warning (not rounded up to exceeded)', async () => {
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

  it('returns planned vs actual totals and excludes private expenses from household aggregates', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-budget-status-happy:budget-status-happy@example.com',
    )

    const householdResponse = await createHousehold(
      auth.accessToken,
      'Budget status household',
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
          categoryLimits: [
            { categoryKey: 'food', limitMinor: 40000 },
            { categoryKey: 'transport', limitMinor: 20000 },
          ],
        }),
      },
    )
    expect(createBudgetResponse.status).toBe(201)
    const budgetId = (
      await parseJson<ApiEnvelope<{ id: string }>>(createBudgetResponse)
    ).data.id

    const april10 = Date.UTC(2026, 3, 10)
    const april12 = Date.UTC(2026, 3, 12)
    const april15 = Date.UTC(2026, 3, 15)

    await createExpense(auth.accessToken, {
      amount: 32000,
      categoryKey: 'food',
      sourceKey: 'cash',
      visibility: 'household',
      householdId,
      title: 'Shared groceries',
      occurredAt: april10,
    })

    await createExpense(auth.accessToken, {
      amount: 10000,
      categoryKey: 'transport',
      sourceKey: 'cash',
      visibility: 'household',
      householdId,
      title: 'Taxi rides',
      occurredAt: april12,
    })

    await createExpense(auth.accessToken, {
      amount: 50000,
      categoryKey: 'food',
      sourceKey: 'cash',
      visibility: 'private',
      title: 'Private dinner',
      occurredAt: april15,
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

    expect(payload.success).toBe(true)
    expect(payload.data).toMatchObject({
      budgetId,
      householdId,
      period: '2026-04',
      currencyCode: 'VND',
      totalPlannedMinor: 100000,
      totalActualMinor: 42000,
      totalRemainingMinor: 58000,
      totalPercentUsed: 42,
      totalStatus: 'ok',
    })
    expect(payload.data.categoryStatuses).toEqual([
      {
        categoryKey: 'food',
        plannedLimitMinor: 40000,
        actualSpendMinor: 32000,
        remainingMinor: 8000,
        percentUsed: 80,
        status: 'warning',
      },
      {
        categoryKey: 'transport',
        plannedLimitMinor: 20000,
        actualSpendMinor: 10000,
        remainingMinor: 10000,
        percentUsed: 50,
        status: 'ok',
      },
    ])
  })

  it('returns 404 when the requester is not an active household member', async () => {
    const owner = await exchangeAccessToken(
      'test:firebase-user-budget-status-owner:budget-status-owner@example.com',
    )
    const outsider = await exchangeAccessToken(
      'test:firebase-user-budget-status-outsider:budget-status-outsider@example.com',
    )

    const householdResponse = await createHousehold(
      owner.accessToken,
      'Budget status private household',
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
          authorization: `Bearer ${owner.accessToken}`,
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

    const response = await SELF.fetch(
      `https://example.com/api/v1/budgets/${budgetId}/status`,
      {
        headers: {
          authorization: `Bearer ${outsider.accessToken}`,
        },
      },
    )

    expect(response.status).toBe(404)

    const payload = await parseJson<ApiErrorEnvelope>(response)

    expect(payload.success).toBe(false)
    expect(payload.error.code).toBe('NOT_FOUND')
  })
})
