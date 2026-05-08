import { describe, expect, it } from 'vitest'

import {
  type AnalyticsGroupsDTO,
  type ApiEnvelope,
  SELF,
  createHousehold,
  exchangeAccessToken,
  parseJson,
  updateHouseholdCurrency,
} from './analytics-groups.test-setup'

describe('GET /api/v1/analytics/groups auth and empty states', () => {
  it('returns 401 when request is unauthenticated', async () => {
    const response = await SELF.fetch(
      'https://example.com/api/v1/analytics/groups?period=2026-05',
    )

    expect(response.status).toBe(401)
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

    const updateHouseholdResponse = await updateHouseholdCurrency(
      auth.accessToken,
      householdId,
      'USD',
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
})
