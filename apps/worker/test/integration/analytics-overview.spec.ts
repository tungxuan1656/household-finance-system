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

type AnalyticsOverviewDTO = {
  period: string
  householdId: string | null
  currencyCode: string
  totalSpendMinor: number
  expenseCount: number
  dailySpend: Array<{
    date: string
    totalSpendMinor: number
  }>
  topCategories: Array<{
    categoryKey: string
    totalSpendMinor: number
    percentOfTotal: number
    expenseCount: number
  }>
}

describe('GET /api/v1/analytics/overview', () => {
  it('returns household analytics and excludes private expenses from household totals', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-analytics-overview-happy:analytics-overview-happy@example.com',
    )

    const householdResponse = await createHousehold(
      auth.accessToken,
      'Analytics household',
    )
    expect(householdResponse.status).toBe(201)
    const householdId = (
      await parseJson<ApiEnvelope<{ id: string }>>(householdResponse)
    ).data.id

    await createExpense(auth.accessToken, {
      amount: 12000,
      categoryKey: 'food',
      sourceKey: 'cash',
      visibility: 'household',
      householdId,
      title: 'Breakfast',
      occurredAt: Date.UTC(2026, 4, 2, 8),
    })

    await createExpense(auth.accessToken, {
      amount: 38000,
      categoryKey: 'transport',
      sourceKey: 'cash',
      visibility: 'household',
      householdId,
      title: 'Taxi',
      occurredAt: Date.UTC(2026, 4, 2, 18),
    })

    await createExpense(auth.accessToken, {
      amount: 9000,
      categoryKey: 'food',
      sourceKey: 'cash',
      visibility: 'household',
      householdId,
      title: 'Snack',
      occurredAt: Date.UTC(2026, 4, 14, 11),
    })

    await createExpense(auth.accessToken, {
      amount: 7000,
      categoryKey: 'shopping',
      sourceKey: 'cash',
      visibility: 'private',
      title: 'Private purchase',
      occurredAt: Date.UTC(2026, 4, 10, 11),
    })

    const response = await SELF.fetch(
      `https://example.com/api/v1/analytics/overview?period=2026-05&household_id=${householdId}`,
      {
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
        },
      },
    )

    expect(response.status).toBe(200)

    const payload = await parseJson<ApiEnvelope<AnalyticsOverviewDTO>>(response)

    expect(payload.data).toEqual({
      period: '2026-05',
      householdId,
      currencyCode: 'VND',
      totalSpendMinor: 59000,
      expenseCount: 3,
      dailySpend: [
        { date: '2026-05-02', totalSpendMinor: 50000 },
        { date: '2026-05-14', totalSpendMinor: 9000 },
      ],
      topCategories: [
        {
          categoryKey: 'transport',
          totalSpendMinor: 38000,
          percentOfTotal: 64,
          expenseCount: 1,
        },
        {
          categoryKey: 'food',
          totalSpendMinor: 21000,
          percentOfTotal: 36,
          expenseCount: 2,
        },
      ],
    })
  })

  it('returns personal analytics for visible expenses in selected month only', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-analytics-overview-personal:analytics-overview-personal@example.com',
    )

    const householdResponse = await createHousehold(
      auth.accessToken,
      'Analytics personal household',
    )
    const householdId = (
      await parseJson<ApiEnvelope<{ id: string }>>(householdResponse)
    ).data.id

    await createExpense(auth.accessToken, {
      amount: 11000,
      categoryKey: 'food',
      sourceKey: 'cash',
      visibility: 'private',
      title: 'Private lunch',
      occurredAt: Date.UTC(2026, 4, 3, 12),
    })

    await createExpense(auth.accessToken, {
      amount: 22000,
      categoryKey: 'travel',
      sourceKey: 'cash',
      visibility: 'household',
      householdId,
      title: 'Shared trip',
      occurredAt: Date.UTC(2026, 4, 20, 12),
    })

    await createExpense(auth.accessToken, {
      amount: 99999,
      categoryKey: 'travel',
      sourceKey: 'cash',
      visibility: 'private',
      title: 'Old month item',
      occurredAt: Date.UTC(2026, 3, 20, 12),
    })

    const response = await SELF.fetch(
      'https://example.com/api/v1/analytics/overview?period=2026-05',
      {
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
        },
      },
    )

    expect(response.status).toBe(200)

    const payload = await parseJson<ApiEnvelope<AnalyticsOverviewDTO>>(response)

    expect(payload.data.totalSpendMinor).toBe(33000)
    expect(payload.data.expenseCount).toBe(2)
    expect(payload.data.householdId).toBeNull()
    expect(payload.data.dailySpend).toEqual([
      { date: '2026-05-03', totalSpendMinor: 11000 },
      { date: '2026-05-20', totalSpendMinor: 22000 },
    ])
  })

  it('returns 400 for invalid period', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-analytics-overview-invalid:analytics-overview-invalid@example.com',
    )

    const response = await SELF.fetch(
      'https://example.com/api/v1/analytics/overview?period=2026-5',
      {
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
        },
      },
    )

    expect(response.status).toBe(400)

    const payload = await parseJson<ApiErrorEnvelope>(response)
    expect(payload.error.code).toBe('INVALID_INPUT')
  })

  it('returns 403 for non-member household analytics', async () => {
    const owner = await exchangeAccessToken(
      'test:firebase-user-analytics-overview-owner:analytics-overview-owner@example.com',
    )
    const stranger = await exchangeAccessToken(
      'test:firebase-user-analytics-overview-stranger:analytics-overview-stranger@example.com',
    )

    const householdResponse = await createHousehold(
      owner.accessToken,
      'Owner household',
    )
    const householdId = (
      await parseJson<ApiEnvelope<{ id: string }>>(householdResponse)
    ).data.id

    const response = await SELF.fetch(
      `https://example.com/api/v1/analytics/overview?period=2026-05&household_id=${householdId}`,
      {
        headers: {
          authorization: `Bearer ${stranger.accessToken}`,
        },
      },
    )

    expect(response.status).toBe(403)
  })
})
