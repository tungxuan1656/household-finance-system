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
  updateHouseholdCurrency,
} from './analytics-groups.test-setup'

describe('GET /api/v1/analytics/groups currency and overlap', () => {
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

    const updateHouseholdResponse = await updateHouseholdCurrency(
      auth.accessToken,
      householdId,
      'USD',
    )
    expect(updateHouseholdResponse.status).toBe(200)

    const tripGroup = await createExpenseGroup(
      auth.accessToken,
      householdId,
      'Overlapping trip group',
    )
    expect(tripGroup.response.status).toBe(201)

    const foodGroup = await createExpenseGroup(
      auth.accessToken,
      householdId,
      'Overlapping food group',
    )
    expect(foodGroup.response.status).toBe(201)

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

    await assignExpenseGroups(auth.accessToken, groupedExpenseId, [
      foodGroup.id,
      tripGroup.id,
    ])
    await assignExpenseGroups(auth.accessToken, secondGroupedExpenseId, [
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

    expect(payload.data.currencyCode).toBe('USD')
    expect(payload.data.totalGroupedSpendMinor).toBe(6000)
    expect(payload.data.groups).toEqual([
      {
        groupId: tripGroup.id,
        groupName: 'Overlapping trip group',
        totalSpendMinor: 6000,
        expenseCount: 2,
        overlapPercentOfTotal: 100,
        percentOfTotal: 100,
      },
      {
        groupId: foodGroup.id,
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
