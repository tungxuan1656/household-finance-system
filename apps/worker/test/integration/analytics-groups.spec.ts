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
    overlapPercentOfTotal: number
  }>
}

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

  it('returns household default currency for month with no grouped expenses', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-analytics-groups-empty-currency:analytics-groups-empty-currency@example.com',
    )

    const householdResponse = await createHousehold(
      auth.accessToken,
      'Empty grouped currency household',
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
      currencyCode: 'USD',
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
