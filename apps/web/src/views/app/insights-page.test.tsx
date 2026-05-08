import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { InsightsPage } from '@/views/app/insights-page'

const useAnalyticsOverviewQueryMock = vi.fn()
const useAnalyticsComparisonQueryMock = vi.fn()
const useAnalyticsGroupsQueryMock = vi.fn()
const exportAnalyticsCsvMock = vi.fn()
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
  exportAnalyticsCsv: (...args: unknown[]) => exportAnalyticsCsvMock(...args),
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

vi.mock('recharts', async () => {
  const actual = await vi.importActual<typeof import('recharts')>('recharts')

  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: ReactNode }) => (
      <div style={{ height: 320, width: 640 }}>{children}</div>
    ),
  }
})

describe('InsightsPage', () => {
  beforeEach(() => {
    fetchHouseholdsMock.mockReset()
    useAnalyticsOverviewQueryMock.mockReset()
    useAnalyticsComparisonQueryMock.mockReset()
    useAnalyticsGroupsQueryMock.mockReset()
    exportAnalyticsCsvMock.mockReset()
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

  it('allows retrying a failed overview query', async () => {
    const refetchMock = vi.fn()

    useAnalyticsOverviewQueryMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('boom'),
      refetch: refetchMock,
    })

    render(<InsightsPage initialPeriod='2026-05' />)

    await userEvent.click(
      screen.getByRole('button', { name: 'insights.actions.retry' }),
    )

    expect(refetchMock).toHaveBeenCalledTimes(1)
  })

  it('shows loading skeleton while analytics query is loading', () => {
    useAnalyticsOverviewQueryMock.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    })

    render(<InsightsPage initialPeriod='2026-05' />)

    expect(screen.getByTestId('insights-summary-skeleton')).toBeInTheDocument()

    expect(
      screen.queryByTestId('insights-comparison-skeleton'),
    ).not.toBeInTheDocument()

    expect(
      screen.queryByTestId('insights-groups-skeleton'),
    ).not.toBeInTheDocument()
  })

  it('shows comparison error state while keeping overview visible', () => {
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

    // Overview still visible
    expect(screen.getAllByText(/59[,.]000/).length).toBeGreaterThan(0)

    // Comparison error visible with retry button
    expect(
      screen.getByText('insights.error.comparisonTitle'),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('button', { name: 'insights.actions.retryComparison' }),
    ).toBeInTheDocument()
  })

  it('shows comparison skeleton while keeping overview visible', () => {
    useAnalyticsOverviewQueryMock.mockReturnValue({
      data: {
        period: '2026-05',
        householdId: 'hh-1',
        currencyCode: 'VND',
        totalSpendMinor: 59000,
        expenseCount: 3,
        dailySpend: [],
        topCategories: [],
      },
      isLoading: false,
      error: null,
    })

    useAnalyticsComparisonQueryMock.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    })

    render(<InsightsPage initialPeriod='2026-05' />)

    expect(screen.getAllByText(/59[,.]000/).length).toBeGreaterThan(0)

    expect(
      screen.getByTestId('insights-comparison-skeleton'),
    ).toBeInTheDocument()
  })

  it('allows retrying a failed groups query', async () => {
    const refetchGroupsMock = vi.fn()

    useAnalyticsOverviewQueryMock.mockReturnValue({
      data: {
        period: '2026-05',
        householdId: 'hh-1',
        currencyCode: 'VND',
        totalSpendMinor: 59000,
        expenseCount: 3,
        dailySpend: [],
        topCategories: [],
      },
      isLoading: false,
      error: null,
    })

    useAnalyticsGroupsQueryMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('boom'),
      refetch: refetchGroupsMock,
    })

    render(<InsightsPage initialPeriod='2026-05' />)

    await userEvent.click(
      screen.getByRole('button', { name: 'insights.actions.retryGroups' }),
    )

    expect(refetchGroupsMock).toHaveBeenCalledTimes(1)
  })

  it('shows distinct partial failure actions for comparison and groups', () => {
    useAnalyticsOverviewQueryMock.mockReturnValue({
      data: {
        period: '2026-05',
        householdId: 'hh-1',
        currencyCode: 'VND',
        totalSpendMinor: 59000,
        expenseCount: 3,
        dailySpend: [],
        topCategories: [],
      },
      isLoading: false,
      error: null,
    })

    useAnalyticsComparisonQueryMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('comparison failed'),
    })

    useAnalyticsGroupsQueryMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('groups failed'),
    })

    render(<InsightsPage initialPeriod='2026-05' />)

    expect(
      screen.getByText('insights.error.comparisonTitle'),
    ).toBeInTheDocument()

    expect(screen.getByText('insights.error.groupsTitle')).toBeInTheDocument()

    expect(
      screen.getByRole('button', { name: 'insights.actions.retryComparison' }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('button', { name: 'insights.actions.retryGroups' }),
    ).toBeInTheDocument()
  })

  it('keeps header controls stacked on small screens and charts expose summaries', () => {
    useAnalyticsOverviewQueryMock.mockReturnValue({
      data: {
        period: '2026-05',
        householdId: 'hh-1',
        currencyCode: 'VND',
        totalSpendMinor: 59000,
        expenseCount: 3,
        dailySpend: [{ date: '2026-05-02', totalSpendMinor: 50000 }],
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

    render(<InsightsPage initialPeriod='2026-05' />)

    expect(
      screen.getByLabelText('insights.periodLabel').closest('label'),
    ).toHaveClass('w-full')

    expect(
      screen.getByText(/insights.dailySpend.description: 2026-05-02/i),
    ).toHaveClass('sr-only')

    expect(
      screen.getByText(/insights.topCategories.description:/i),
    ).toHaveClass('sr-only')
  })

  it('shows export action only when analytics data is ready', () => {
    useAnalyticsOverviewQueryMock.mockReturnValue({
      data: {
        period: '2026-05',
        householdId: 'hh-1',
        currencyCode: 'VND',
        totalSpendMinor: 59000,
        expenseCount: 3,
        dailySpend: [],
        topCategories: [],
      },
      isLoading: false,
      error: null,
    })

    render(<InsightsPage initialPeriod='2026-05' />)

    expect(
      screen.getByRole('button', { name: 'insights.export.action' }),
    ).toBeEnabled()
  })

  it('disables export action when page loading, empty, or error', () => {
    useAnalyticsOverviewQueryMock.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    })

    const { rerender } = render(<InsightsPage initialPeriod='2026-05' />)

    expect(
      screen.getByRole('button', { name: 'insights.export.action' }),
    ).toBeDisabled()

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

    rerender(<InsightsPage initialPeriod='2026-05' />)

    expect(
      screen.getByRole('button', { name: 'insights.export.action' }),
    ).toBeDisabled()

    useAnalyticsOverviewQueryMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('boom'),
    })

    rerender(<InsightsPage initialPeriod='2026-05' />)

    expect(
      screen.getByRole('button', { name: 'insights.export.action' }),
    ).toBeDisabled()
  })

  it('exports current period csv with household context', async () => {
    useAnalyticsOverviewQueryMock.mockReturnValue({
      data: {
        period: '2026-05',
        householdId: 'hh-1',
        currencyCode: 'VND',
        totalSpendMinor: 59000,
        expenseCount: 3,
        dailySpend: [],
        topCategories: [],
      },
      isLoading: false,
      error: null,
    })

    exportAnalyticsCsvMock.mockResolvedValue({
      blob: new Blob(['date,total\n']),
      filename: 'analytics-2026-05-household.csv',
    })

    render(<InsightsPage initialPeriod='2026-05' />)

    await userEvent.click(
      screen.getByRole('button', { name: 'insights.export.action' }),
    )

    expect(exportAnalyticsCsvMock).toHaveBeenCalledWith({
      household_id: 'hh-1',
      period: '2026-05',
    })
  })
})
