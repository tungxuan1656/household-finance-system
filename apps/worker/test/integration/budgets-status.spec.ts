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
