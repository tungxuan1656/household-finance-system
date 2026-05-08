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

describe('InsightsPage partial panel states', () => {
  beforeEach(() => {
    resetInsightsPageTestState()
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

    expect(screen.getAllByText(/59[,.]000/).length).toBeGreaterThan(0)

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
})
