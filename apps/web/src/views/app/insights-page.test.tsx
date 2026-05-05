import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { InsightsPage } from '@/views/app/insights-page'

const useAnalyticsOverviewQueryMock = vi.fn()
const useAnalyticsComparisonQueryMock = vi.fn()
const useAnalyticsGroupsQueryMock = vi.fn()
const useReferenceCategoriesQueryMock = vi.fn()
const fetchHouseholdsMock = vi.fn()
const householdStoreState = {
  currentHousehold: { id: 'hh-1' } as { id: string } | null,
  households: [{ id: 'hh-1' }] as Array<{ id: string }>,
}

vi.mock('@/hooks/api/use-analytics', () => ({
  useAnalyticsOverviewQuery: (...args: unknown[]) =>
    useAnalyticsOverviewQueryMock(...args),
  useAnalyticsComparisonQuery: (...args: unknown[]) =>
    useAnalyticsComparisonQueryMock(...args),
  useAnalyticsGroupsQuery: (...args: unknown[]) =>
    useAnalyticsGroupsQueryMock(...args),
}))

vi.mock('@/hooks/api/use-reference-data', () => ({
  useReferenceCategoriesQuery: () => useReferenceCategoriesQueryMock(),
}))

vi.mock('@/lib/i18n/t', () => ({ t: (key: string) => key }))

vi.mock('@/stores/household.store', () => ({
  householdActions: { fetchHouseholds: () => fetchHouseholdsMock() },
  useHouseholdStore: {
    use: {
      currentHousehold: () => householdStoreState.currentHousehold,
      households: () => householdStoreState.households,
    },
  },
}))

describe('InsightsPage', () => {
  beforeEach(() => {
    fetchHouseholdsMock.mockReset()
    useAnalyticsOverviewQueryMock.mockReset()
    useAnalyticsComparisonQueryMock.mockReset()
    useAnalyticsGroupsQueryMock.mockReset()
    householdStoreState.currentHousehold = { id: 'hh-1' }
    householdStoreState.households = [{ id: 'hh-1' }]

    useReferenceCategoriesQueryMock.mockReturnValue({
      data: {
        items: [
          { key: 'food', kind: 'expense', color: '#f00', iconUrl: '/food.svg' },
          {
            key: 'transport',
            kind: 'expense',
            color: '#0f0',
            iconUrl: '/transport.svg',
          },
        ],
      },
    })

    useAnalyticsComparisonQueryMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    })

    useAnalyticsGroupsQueryMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    })
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
      .mockReturnValueOnce({
        data: undefined,
        isLoading: false,
        error: null,
      })
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

  it('requests analytics for selected household and current month', () => {
    useAnalyticsComparisonQueryMock.mockReturnValue({
      data: {
        householdId: 'hh-1',
        currencyCode: 'VND',
        currentPeriod: {
          period: '2026-05',
          totalSpendMinor: 59000,
          expenseCount: 3,
        },
        previousPeriod: {
          period: '2026-04',
          totalSpendMinor: 40000,
          expenseCount: 2,
        },
        totalDeltaSpendMinor: 19000,
        totalDeltaPercent: 48,
        topCategoryDeltas: [
          {
            categoryKey: 'food',
            currentTotalSpendMinor: 21000,
            previousTotalSpendMinor: 10000,
            deltaSpendMinor: 11000,
            deltaPercent: 110,
          },
        ],
        payerAttribution: [
          {
            payerUserId: 'user-1',
            totalSpendMinor: 59000,
            percentOfTotal: 100,
            expenseCount: 3,
          },
        ],
      },
      isLoading: false,
      error: null,
    })

    useAnalyticsGroupsQueryMock.mockReturnValue({
      data: {
        period: '2026-05',
        householdId: 'hh-1',
        currencyCode: 'VND',
        totalGroupedSpendMinor: 45000,
        groups: [
          {
            groupId: 'g-1',
            groupName: 'Trip group',
            totalSpendMinor: 45000,
            expenseCount: 1,
            overlapPercentOfTotal: 100,
            percentOfTotal: 100,
          },
        ],
      },
      isLoading: false,
      error: null,
    })

    useAnalyticsOverviewQueryMock.mockReturnValue({
      data: {
        period: '2026-05',
        householdId: 'hh-1',
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
      },
      isLoading: false,
      error: null,
    })

    render(<InsightsPage initialPeriod='2026-05' />)

    expect(useAnalyticsOverviewQueryMock).toHaveBeenCalledWith(
      {
        household_id: 'hh-1',
        period: '2026-05',
      },
      { enabled: true },
    )

    expect(useAnalyticsComparisonQueryMock).toHaveBeenCalledWith(
      {
        household_id: 'hh-1',
        period: '2026-05',
      },
      { enabled: true },
    )

    expect(useAnalyticsGroupsQueryMock).toHaveBeenCalledWith(
      {
        household_id: 'hh-1',
        period: '2026-05',
      },
      { enabled: true },
    )

    expect(screen.getAllByText(/59[,.]000/).length).toBeGreaterThan(0)
    expect(screen.getAllByText('3').length).toBeGreaterThan(0)
    expect(screen.getByText('insights.comparison.title')).toBeInTheDocument()
    expect(screen.getByText('insights.groups.title')).toBeInTheDocument()

    expect(
      screen.getByText('1 · 100% insights.groups.overlapShareLabel'),
    ).toBeInTheDocument()

    expect(
      screen.getByText('app.expenseReference.categories.transport'),
    ).toBeInTheDocument()
  })

  it('shows empty state when selected month has no expenses', () => {
    useAnalyticsOverviewQueryMock.mockReturnValue({
      data: {
        period: '2026-05',
        householdId: 'hh-1',
        currencyCode: 'VND',
        totalSpendMinor: 0,
        expenseCount: 0,
        dailySpend: [],
        topCategories: [],
      },
      isLoading: false,
      error: null,
    })

    render(<InsightsPage initialPeriod='2026-05' />)

    expect(screen.getByText('insights.empty.title')).toBeInTheDocument()
    expect(screen.getByText('insights.empty.description')).toBeInTheDocument()
    expect(screen.getByLabelText('insights.periodLabel')).toBeInTheDocument()
  })

  it('shows error state when analytics query fails', () => {
    useAnalyticsOverviewQueryMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('boom'),
    })

    render(<InsightsPage initialPeriod='2026-05' />)

    expect(screen.getByText('insights.error.title')).toBeInTheDocument()
    expect(screen.getByText('insights.error.description')).toBeInTheDocument()
    expect(screen.getByLabelText('insights.periodLabel')).toBeInTheDocument()
  })

  it('shows loading skeleton while analytics query is loading', () => {
    useAnalyticsOverviewQueryMock.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    })

    render(<InsightsPage initialPeriod='2026-05' />)

    expect(screen.getByTestId('insights-loading')).toBeInTheDocument()
  })

  it('shows comparison error state when secondary analytics query fails', () => {
    useAnalyticsOverviewQueryMock.mockReturnValue({
      data: {
        period: '2026-05',
        householdId: 'hh-1',
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
        ],
      },
      isLoading: false,
      error: null,
    })

    useAnalyticsComparisonQueryMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('boom'),
    })

    render(<InsightsPage initialPeriod='2026-05' />)

    expect(screen.getByText('insights.error.title')).toBeInTheDocument()
  })
})
