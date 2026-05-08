import './insights-page.test-setup'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { InsightsPage } from '@/views/app/insights-page'

import {
  exportAnalyticsCsvMock,
  resetInsightsPageTestState,
  useAnalyticsGroupsQueryMock,
  useAnalyticsOverviewQueryMock,
} from './insights-page.test-setup'

describe('InsightsPage actions', () => {
  beforeEach(() => {
    resetInsightsPageTestState()
  })

  it('allows retrying failed overview query', async () => {
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

  it('allows retrying failed groups query', async () => {
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
