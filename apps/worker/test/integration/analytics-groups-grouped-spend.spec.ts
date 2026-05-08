import { describe, expect, it } from 'vitest'

import {
  type AnalyticsGroupsDTO,
  type ApiEnvelope,
  SELF,
  assignExpenseGroups,
  createExpense,
  createExpenseGroup,
  createHousehold,
  exchangeAccessToken,
  parseJson,
} from './analytics-groups.test-setup'

describe('GET /api/v1/analytics/groups grouped spend', () => {
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

    const tripGroup = await createExpenseGroup(
      auth.accessToken,
      householdId,
      'Trip group',
    )
    expect(tripGroup.response.status).toBe(201)

    const foodGroup = await createExpenseGroup(
      auth.accessToken,
      householdId,
      'Food group',
    )
    expect(foodGroup.response.status).toBe(201)

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

    await assignExpenseGroups(auth.accessToken, groupedExpenseId, [
      foodGroup.id,
    ])
    await assignExpenseGroups(auth.accessToken, secondGroupedExpenseId, [
      tripGroup.id,
    ])
    await assignExpenseGroups(auth.accessToken, groupedExpenseId, [
      foodGroup.id,
      tripGroup.id,
    ])

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
          groupId: tripGroup.id,
          groupName: 'Trip group',
          totalSpendMinor: 60000,
          expenseCount: 2,
          overlapPercentOfTotal: 100,
          percentOfTotal: 100,
        },
        {
          groupId: foodGroup.id,
          groupName: 'Food group',
          totalSpendMinor: 15000,
          expenseCount: 1,
          overlapPercentOfTotal: 25,
          percentOfTotal: 25,
        },
      ],
    })
  })
})
