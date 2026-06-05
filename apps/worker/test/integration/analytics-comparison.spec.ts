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

type AnalyticsComparisonDTO = {
  householdId: string | null
  currencyCode: string
  currentPeriod: {
    period: string
    totalSpendMinor: number
    expenseCount: number
  }
  previousPeriod: {
    period: string
    totalSpendMinor: number
    expenseCount: number
  }
  totalDeltaSpendMinor: number
  totalDeltaPercent: number | null
  topCategoryDeltas: Array<{
    categoryKey: string
    currentTotalSpendMinor: number
    previousTotalSpendMinor: number
    deltaSpendMinor: number
    deltaPercent: number | null
  }>
}

describe('GET /api/v1/analytics/comparison', () => {
  it('returns 401 when request is unauthenticated', async () => {
    const response = await SELF.fetch(
      'https://example.com/api/v1/analytics/comparison?period=2026-05',
    )

    expect(response.status).toBe(401)
  })

  it('returns comparison analytics for an explicit date range', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-analytics-comparison-range:analytics-comparison-range@example.com',
    )

    await createExpense(auth.accessToken, {
      amount: 10000,
      categoryKey: 'food',
      sourceKey: 'cash',
      title: 'April breakfast',
      occurredAt: Date.UTC(2026, 3, 3, 8),
    })

    await createExpense(auth.accessToken, {
      amount: 30000,
      categoryKey: 'transport',
      sourceKey: 'cash',
      title: 'April commute',
      occurredAt: Date.UTC(2026, 3, 5, 8),
    })

    await createExpense(auth.accessToken, {
      amount: 20000,
      categoryKey: 'food',
      sourceKey: 'cash',
      title: 'May groceries',
      occurredAt: Date.UTC(2026, 4, 4, 8),
    })

    await createExpense(auth.accessToken, {
      amount: 50000,
      categoryKey: 'travel',
      sourceKey: 'cash',
      title: 'May hotel',
      occurredAt: Date.UTC(2026, 4, 9, 8),
    })

    const dateFrom = Date.UTC(2026, 4, 1)
    const dateTo = Date.UTC(2026, 5, 1)

    const response = await SELF.fetch(
      `https://example.com/api/v1/analytics/comparison?date_from=${dateFrom}&date_to=${dateTo}`,
      {
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
        },
      },
    )

    expect(response.status).toBe(200)

    const payload =
      await parseJson<ApiEnvelope<AnalyticsComparisonDTO>>(response)

    expect(payload.data.currentPeriod.totalSpendMinor).toBe(70000)
    expect(payload.data.currentPeriod.expenseCount).toBe(2)
    expect(payload.data.previousPeriod.totalSpendMinor).toBe(40000)
    expect(payload.data.previousPeriod.expenseCount).toBe(2)
    expect(payload.data.totalDeltaSpendMinor).toBe(30000)
    expect(payload.data.totalDeltaPercent).toBe(75)
  })

  it('returns household comparison analytics with payer attribution and category deltas', async () => {
    const owner = await exchangeAccessToken(
      'test:firebase-user-analytics-comparison-owner:analytics-comparison-owner@example.com',
    )
    const member = await exchangeAccessToken(
      'test:firebase-user-analytics-comparison-member:analytics-comparison-member@example.com',
    )

    const householdResponse = await createHousehold(
      owner.accessToken,
      'Comparison household',
    )
    expect(householdResponse.status).toBe(201)
    const householdId = (
      await parseJson<ApiEnvelope<{ id: string }>>(householdResponse)
    ).data.id

    const inviteResponse = await SELF.fetch(
      `https://example.com/api/v1/households/${householdId}/invitations`,
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${owner.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ role: 'member', ttlHours: 72 }),
      },
    )
    expect(inviteResponse.status).toBe(201)
    const invitationToken = (
      await parseJson<ApiEnvelope<{ token: string }>>(inviteResponse)
    ).data.token

    const acceptResponse = await SELF.fetch(
      `https://example.com/api/v1/invitations/${invitationToken}/accept`,
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${member.accessToken}`,
        },
      },
    )
    expect(acceptResponse.status).toBe(200)

    await createExpense(owner.accessToken, {
      amount: 10000,
      categoryKey: 'food',
      sourceKey: 'cash',
      householdId,
      title: 'April breakfast',
      occurredAt: Date.UTC(2026, 3, 3, 8),
    })

    await createExpense(member.accessToken, {
      amount: 30000,
      categoryKey: 'transport',
      sourceKey: 'cash',
      householdId,
      title: 'April commute',
      occurredAt: Date.UTC(2026, 3, 5, 8),
    })

    await createExpense(owner.accessToken, {
      amount: 20000,
      categoryKey: 'food',
      sourceKey: 'cash',
      householdId,
      title: 'May groceries',
      occurredAt: Date.UTC(2026, 4, 4, 8),
    })

    await createExpense(member.accessToken, {
      amount: 50000,
      categoryKey: 'travel',
      sourceKey: 'cash',
      householdId,
      title: 'May hotel',
      occurredAt: Date.UTC(2026, 4, 9, 8),
    })

    await createExpense(owner.accessToken, {
      amount: 7000,
      categoryKey: 'shopping',
      sourceKey: 'cash',
      title: 'Private item',
      occurredAt: Date.UTC(2026, 4, 10, 8),
    })

    const response = await SELF.fetch(
      `https://example.com/api/v1/analytics/comparison?period=2026-05&household_id=${householdId}`,
      {
        headers: {
          authorization: `Bearer ${owner.accessToken}`,
        },
      },
    )

    expect(response.status).toBe(200)

    const payload =
      await parseJson<ApiEnvelope<AnalyticsComparisonDTO>>(response)

    expect(payload.data).toEqual({
      householdId,
      currencyCode: 'VND',
      currentPeriod: {
        period: '2026-05',
        totalSpendMinor: 70000,
        expenseCount: 2,
      },
      previousPeriod: {
        period: '2026-04',
        totalSpendMinor: 40000,
        expenseCount: 2,
      },
      totalDeltaSpendMinor: 30000,
      totalDeltaPercent: 75,
      topCategoryDeltas: [
        {
          categoryKey: 'travel',
          currentTotalSpendMinor: 50000,
          previousTotalSpendMinor: 0,
          deltaSpendMinor: 50000,
          deltaPercent: null,
        },
        {
          categoryKey: 'transport',
          currentTotalSpendMinor: 0,
          previousTotalSpendMinor: 30000,
          deltaSpendMinor: -30000,
          deltaPercent: -100,
        },
        {
          categoryKey: 'food',
          currentTotalSpendMinor: 20000,
          previousTotalSpendMinor: 10000,
          deltaSpendMinor: 10000,
          deltaPercent: 100,
        },
      ],
    })
  })

  it('returns 400 for invalid period', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-analytics-comparison-invalid:analytics-comparison-invalid@example.com',
    )

    const response = await SELF.fetch(
      'https://example.com/api/v1/analytics/comparison?period=2026-5',
      {
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
        },
      },
    )

    expect(response.status).toBe(400)
  })

  it('returns 400 for reversed date range', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-analytics-comparison-reversed:analytics-comparison-reversed@example.com',
    )

    const response = await SELF.fetch(
      `https://example.com/api/v1/analytics/comparison?date_from=${Date.UTC(2026, 5, 1)}&date_to=${Date.UTC(2026, 4, 1)}`,
      {
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
        },
      },
    )

    expect(response.status).toBe(400)
  })

  it('returns 403 for non-member household analytics', async () => {
    const owner = await exchangeAccessToken(
      'test:firebase-user-analytics-comparison-owner-403:analytics-comparison-owner-403@example.com',
    )
    const stranger = await exchangeAccessToken(
      'test:firebase-user-analytics-comparison-stranger:analytics-comparison-stranger@example.com',
    )

    const householdResponse = await createHousehold(
      owner.accessToken,
      'Comparison owner household',
    )
    const householdId = (
      await parseJson<ApiEnvelope<{ id: string }>>(householdResponse)
    ).data.id

    const response = await SELF.fetch(
      `https://example.com/api/v1/analytics/comparison?period=2026-05&household_id=${householdId}`,
      {
        headers: {
          authorization: `Bearer ${stranger.accessToken}`,
        },
      },
    )

    expect(response.status).toBe(403)
  })
})
