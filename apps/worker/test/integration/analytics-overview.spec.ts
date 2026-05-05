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
  it('returns 401 when request is unauthenticated', async () => {
    const response = await SELF.fetch(
      'https://example.com/api/v1/analytics/overview?period=2026-05',
    )

    expect(response.status).toBe(401)
  })

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

  it('returns empty analytics for valid month with no visible expenses', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-analytics-overview-empty:analytics-overview-empty@example.com',
    )

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

    expect(payload.data).toEqual({
      period: '2026-05',
      householdId: null,
      currencyCode: 'VND',
      totalSpendMinor: 0,
      expenseCount: 0,
      dailySpend: [],
      topCategories: [],
    })
  })
})

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
  payerAttribution: Array<{
    payerDisplayName: string | null
    payerUserId: string
    totalSpendMinor: number
    percentOfTotal: number
    expenseCount: number
  }>
}

type AnalyticsGroupsDTO = {
  period: string
  householdId: string | null
  currencyCode: string
  totalGroupedSpendMinor: number
  groups: Array<{
    groupId: string
    groupName: string
    totalSpendMinor: number
    expenseCount: number
    percentOfTotal: number
  }>
}

describe('GET /api/v1/analytics/comparison', () => {
  it('returns 401 when request is unauthenticated', async () => {
    const response = await SELF.fetch(
      'https://example.com/api/v1/analytics/comparison?period=2026-05',
    )

    expect(response.status).toBe(401)
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
      visibility: 'household',
      householdId,
      title: 'April breakfast',
      occurredAt: Date.UTC(2026, 3, 3, 8),
    })

    await createExpense(member.accessToken, {
      amount: 30000,
      categoryKey: 'transport',
      sourceKey: 'cash',
      visibility: 'household',
      householdId,
      title: 'April commute',
      occurredAt: Date.UTC(2026, 3, 5, 8),
    })

    await createExpense(owner.accessToken, {
      amount: 20000,
      categoryKey: 'food',
      sourceKey: 'cash',
      visibility: 'household',
      householdId,
      title: 'May groceries',
      occurredAt: Date.UTC(2026, 4, 4, 8),
    })

    await createExpense(member.accessToken, {
      amount: 50000,
      categoryKey: 'travel',
      sourceKey: 'cash',
      visibility: 'household',
      householdId,
      title: 'May hotel',
      occurredAt: Date.UTC(2026, 4, 9, 8),
    })

    await createExpense(owner.accessToken, {
      amount: 7000,
      categoryKey: 'shopping',
      sourceKey: 'cash',
      visibility: 'private',
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
      payerAttribution: [
        {
          payerDisplayName: 'analytics-comparison-member@example.com',
          payerUserId: member.user.id,
          totalSpendMinor: 50000,
          percentOfTotal: 71,
          expenseCount: 1,
        },
        {
          payerDisplayName: 'analytics-comparison-owner@example.com',
          payerUserId: owner.user.id,
          totalSpendMinor: 20000,
          percentOfTotal: 29,
          expenseCount: 1,
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

describe('GET /api/v1/analytics/groups', () => {
  it('returns 401 when request is unauthenticated', async () => {
    const response = await SELF.fetch(
      'https://example.com/api/v1/analytics/groups?period=2026-05',
    )

    expect(response.status).toBe(401)
  })

  it('returns grouped spend only and excludes ungrouped expenses', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-analytics-groups-owner:analytics-groups-owner@example.com',
    )

    const householdResponse = await createHousehold(
      auth.accessToken,
      'Groups household',
    )
    expect(householdResponse.status).toBe(201)
    const householdId = (
      await parseJson<ApiEnvelope<{ id: string }>>(householdResponse)
    ).data.id

    const tripGroupResponse = await SELF.fetch(
      'https://example.com/api/v1/groups',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ householdId, name: 'Trip group' }),
      },
    )
    expect(tripGroupResponse.status).toBe(201)
    const tripGroupId = (
      await parseJson<ApiEnvelope<{ id: string }>>(tripGroupResponse)
    ).data.id

    const foodGroupResponse = await SELF.fetch(
      'https://example.com/api/v1/groups',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ householdId, name: 'Food group' }),
      },
    )
    expect(foodGroupResponse.status).toBe(201)
    const foodGroupId = (
      await parseJson<ApiEnvelope<{ id: string }>>(foodGroupResponse)
    ).data.id

    const groupedExpenseResponse = await createExpense(auth.accessToken, {
      amount: 15000,
      categoryKey: 'food',
      sourceKey: 'cash',
      visibility: 'household',
      householdId,
      title: 'Group lunch',
      occurredAt: Date.UTC(2026, 4, 6, 8),
    })
    const groupedExpenseId = (
      await parseJson<ApiEnvelope<{ id: string }>>(groupedExpenseResponse)
    ).data.id

    const secondGroupedExpenseResponse = await createExpense(auth.accessToken, {
      amount: 45000,
      categoryKey: 'travel',
      sourceKey: 'cash',
      visibility: 'household',
      householdId,
      title: 'Group travel',
      occurredAt: Date.UTC(2026, 4, 7, 8),
    })
    const secondGroupedExpenseId = (
      await parseJson<ApiEnvelope<{ id: string }>>(secondGroupedExpenseResponse)
    ).data.id

    await createExpense(auth.accessToken, {
      amount: 9999,
      categoryKey: 'shopping',
      sourceKey: 'cash',
      visibility: 'household',
      householdId,
      title: 'Ungrouped item',
      occurredAt: Date.UTC(2026, 4, 8, 8),
    })

    await SELF.fetch(
      `https://example.com/api/v1/expenses/${groupedExpenseId}/groups`,
      {
        method: 'PATCH',
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ groupIds: [foodGroupId] }),
      },
    )

    await SELF.fetch(
      `https://example.com/api/v1/expenses/${secondGroupedExpenseId}/groups`,
      {
        method: 'PATCH',
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ groupIds: [tripGroupId] }),
      },
    )

    await SELF.fetch(
      `https://example.com/api/v1/expenses/${groupedExpenseId}/groups`,
      {
        method: 'PATCH',
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ groupIds: [foodGroupId, tripGroupId] }),
      },
    )

    const response = await SELF.fetch(
      `https://example.com/api/v1/analytics/groups?period=2026-05&household_id=${householdId}`,
      {
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
        },
      },
    )

    expect(response.status).toBe(200)

    const payload = await parseJson<ApiEnvelope<AnalyticsGroupsDTO>>(response)

    expect(payload.data).toEqual({
      period: '2026-05',
      householdId,
      currencyCode: 'VND',
      totalGroupedSpendMinor: 60000,
      groups: [
        {
          groupId: tripGroupId,
          groupName: 'Trip group',
          totalSpendMinor: 60000,
          expenseCount: 2,
          overlapPercentOfTotal: 100,
          percentOfTotal: 100,
        },
        {
          groupId: foodGroupId,
          groupName: 'Food group',
          totalSpendMinor: 15000,
          expenseCount: 1,
          overlapPercentOfTotal: 25,
          percentOfTotal: 25,
        },
      ],
    })
  })

  it('returns empty grouped spend for valid month with no grouped expenses', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-analytics-groups-empty:analytics-groups-empty@example.com',
    )

    const response = await SELF.fetch(
      'https://example.com/api/v1/analytics/groups?period=2026-05',
      {
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
        },
      },
    )

    expect(response.status).toBe(200)

    const payload = await parseJson<ApiEnvelope<AnalyticsGroupsDTO>>(response)
    expect(payload.data).toEqual({
      period: '2026-05',
      householdId: null,
      currencyCode: 'VND',
      totalGroupedSpendMinor: 0,
      groups: [],
    })
  })

  it('returns 403 for non-member household analytics', async () => {
    const owner = await exchangeAccessToken(
      'test:firebase-user-analytics-groups-owner-403:analytics-groups-owner-403@example.com',
    )
    const stranger = await exchangeAccessToken(
      'test:firebase-user-analytics-groups-stranger:analytics-groups-stranger@example.com',
    )

    const householdResponse = await createHousehold(
      owner.accessToken,
      'Groups owner household',
    )
    const householdId = (
      await parseJson<ApiEnvelope<{ id: string }>>(householdResponse)
    ).data.id

    const response = await SELF.fetch(
      `https://example.com/api/v1/analytics/groups?period=2026-05&household_id=${householdId}`,
      {
        headers: {
          authorization: `Bearer ${stranger.accessToken}`,
        },
      },
    )

    expect(response.status).toBe(403)
  })

  it('returns grouped spend currency from stored expenses and overlap percentages explicitly', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-analytics-groups-currency:analytics-groups-currency@example.com',
    )

    const householdResponse = await createHousehold(
      auth.accessToken,
      'Foreign currency household',
    )
    expect(householdResponse.status).toBe(201)
    const householdId = (
      await parseJson<ApiEnvelope<{ id: string }>>(householdResponse)
    ).data.id

    const updateHouseholdResponse = await SELF.fetch(
      `https://example.com/api/v1/households/${householdId}`,
      {
        method: 'PATCH',
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ defaultCurrencyCode: 'USD' }),
      },
    )
    expect(updateHouseholdResponse.status).toBe(200)

    const tripGroupResponse = await SELF.fetch(
      'https://example.com/api/v1/groups',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ householdId, name: 'Overlapping trip group' }),
      },
    )
    expect(tripGroupResponse.status).toBe(201)
    const tripGroupId = (
      await parseJson<ApiEnvelope<{ id: string }>>(tripGroupResponse)
    ).data.id

    const foodGroupResponse = await SELF.fetch(
      'https://example.com/api/v1/groups',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ householdId, name: 'Overlapping food group' }),
      },
    )
    expect(foodGroupResponse.status).toBe(201)
    const foodGroupId = (
      await parseJson<ApiEnvelope<{ id: string }>>(foodGroupResponse)
    ).data.id

    const groupedExpenseResponse = await createExpense(auth.accessToken, {
      amount: 15,
      categoryKey: 'food',
      sourceKey: 'cash',
      visibility: 'household',
      householdId,
      title: 'USD lunch',
      occurredAt: Date.UTC(2026, 4, 6, 8),
    })
    const groupedExpenseId = (
      await parseJson<ApiEnvelope<{ id: string }>>(groupedExpenseResponse)
    ).data.id

    const secondGroupedExpenseResponse = await createExpense(auth.accessToken, {
      amount: 45,
      categoryKey: 'travel',
      sourceKey: 'cash',
      visibility: 'household',
      householdId,
      title: 'USD travel',
      occurredAt: Date.UTC(2026, 4, 7, 8),
    })
    const secondGroupedExpenseId = (
      await parseJson<ApiEnvelope<{ id: string }>>(secondGroupedExpenseResponse)
    ).data.id

    await SELF.fetch(
      `https://example.com/api/v1/expenses/${groupedExpenseId}/groups`,
      {
        method: 'PATCH',
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ groupIds: [foodGroupId, tripGroupId] }),
      },
    )

    await SELF.fetch(
      `https://example.com/api/v1/expenses/${secondGroupedExpenseId}/groups`,
      {
        method: 'PATCH',
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ groupIds: [tripGroupId] }),
      },
    )

    const response = await SELF.fetch(
      `https://example.com/api/v1/analytics/groups?period=2026-05&household_id=${householdId}`,
      {
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
        },
      },
    )

    expect(response.status).toBe(200)

    const payload = await parseJson<ApiEnvelope<AnalyticsGroupsDTO>>(response)

    expect(payload.data.currencyCode).toBe('USD')
    expect(payload.data.totalGroupedSpendMinor).toBe(6000)
    expect(payload.data.groups).toEqual([
      {
        groupId: tripGroupId,
        groupName: 'Overlapping trip group',
        totalSpendMinor: 6000,
        expenseCount: 2,
        overlapPercentOfTotal: 100,
        percentOfTotal: 100,
      },
      {
        groupId: foodGroupId,
        groupName: 'Overlapping food group',
        totalSpendMinor: 1500,
        expenseCount: 1,
        overlapPercentOfTotal: 25,
        percentOfTotal: 25,
      },
    ])
    expect(
      payload.data.groups.reduce(
        (total, group) => total + group.overlapPercentOfTotal,
        0,
      ),
    ).toBeGreaterThan(100)
  })
})
