import './insights-page.test-setup'

import { render } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { InsightsPage } from '@/views/app/insights-page'

import {
  fetchHouseholdsMock,
  householdStoreState,
  resetInsightsPageTestState,
  useAnalyticsComparisonQueryMock,
  useAnalyticsGroupsQueryMock,
  useAnalyticsOverviewQueryMock,
} from './insights-page.test-setup'

describe('InsightsPage bootstrap', () => {
  beforeEach(() => {
    resetInsightsPageTestState()
  })

  it('waits for household context before fetching analytics', () => {
    householdStoreState.currentHousehold = null
    householdStoreState.households = []

    useAnalyticsOverviewQueryMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    })

    render(<InsightsPage initialPeriod='2026-05' />)

    expect(useAnalyticsOverviewQueryMock).toHaveBeenCalledWith(
      { period: '2026-05' },
      { enabled: false },
    )

    expect(useAnalyticsComparisonQueryMock).toHaveBeenCalledWith(
      { period: '2026-05' },
      { enabled: false },
    )

    expect(useAnalyticsGroupsQueryMock).toHaveBeenCalledWith(
      { period: '2026-05' },
      { enabled: false },
    )

    expect(fetchHouseholdsMock).toHaveBeenCalledTimes(1)
  })

  it('fetches personal analytics after household bootstrap when user has no households', () => {
    householdStoreState.currentHousehold = null
    householdStoreState.households = []

    useAnalyticsOverviewQueryMock
      .mockReturnValueOnce({ data: undefined, isLoading: false, error: null })
      .mockReturnValueOnce({
        data: {
          period: '2026-05',
          householdId: null,
          currencyCode: 'VND',
          totalSpendMinor: 12000,
          expenseCount: 1,
          dailySpend: [{ date: '2026-05-02', totalSpendMinor: 12000 }],
          topCategories: [
            {
              categoryKey: 'food',
              totalSpendMinor: 12000,
              percentOfTotal: 100,
              expenseCount: 1,
            },
          ],
        },
        isLoading: false,
        error: null,
      })

    fetchHouseholdsMock.mockImplementation(() => {
      householdStoreState.households = []
      householdStoreState.currentHousehold = null
    })

    render(<InsightsPage initialPeriod='2026-05' />)

    expect(useAnalyticsOverviewQueryMock).toHaveBeenNthCalledWith(
      1,
      { period: '2026-05' },
      { enabled: false },
    )

    expect(useAnalyticsOverviewQueryMock).toHaveBeenNthCalledWith(
      2,
      { period: '2026-05' },
      { enabled: true },
    )

    expect(useAnalyticsComparisonQueryMock).toHaveBeenNthCalledWith(
      2,
      { period: '2026-05' },
      { enabled: true },
    )

    expect(useAnalyticsGroupsQueryMock).toHaveBeenNthCalledWith(
      2,
      { period: '2026-05' },
      { enabled: true },
    )
  })
})
