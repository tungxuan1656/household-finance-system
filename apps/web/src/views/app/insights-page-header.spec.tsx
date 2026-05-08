import './insights-page.test-setup'

import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { InsightsPage } from '@/views/app/insights-page'

import {
  resetInsightsPageTestState,
  useAnalyticsOverviewQueryMock,
} from './insights-page.test-setup'

describe('InsightsPage header and export', () => {
  beforeEach(() => {
    resetInsightsPageTestState()
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
})
