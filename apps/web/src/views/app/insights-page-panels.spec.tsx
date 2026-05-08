import './insights-page.test-setup'

import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { InsightsPage } from '@/views/app/insights-page'

import {
  resetInsightsPageTestState,
  useAnalyticsComparisonQueryMock,
  useAnalyticsGroupsQueryMock,
  useAnalyticsOverviewQueryMock,
} from './insights-page.test-setup'

describe('InsightsPage panels', () => {
  beforeEach(() => {
    resetInsightsPageTestState()
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
      { household_id: 'hh-1', period: '2026-05' },
      { enabled: true },
    )

    expect(useAnalyticsComparisonQueryMock).toHaveBeenCalledWith(
      { household_id: 'hh-1', period: '2026-05' },
      { enabled: true },
    )

    expect(useAnalyticsGroupsQueryMock).toHaveBeenCalledWith(
      { household_id: 'hh-1', period: '2026-05' },
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

    expect(screen.getByTestId('insights-summary-skeleton')).toBeInTheDocument()

    expect(
      screen.queryByTestId('insights-comparison-skeleton'),
    ).not.toBeInTheDocument()

    expect(
      screen.queryByTestId('insights-groups-skeleton'),
    ).not.toBeInTheDocument()
  })
})
