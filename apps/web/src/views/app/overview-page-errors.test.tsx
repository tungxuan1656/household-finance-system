import './overview-page.test-setup'

import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { OverviewPage } from '@/views/app/overview-page'

import {
  householdStoreState,
  resetOverviewPageTestState,
  useAnalyticsOverviewQueryMock,
  useExpenseSummaryQueryMock,
  useInfiniteExpenseListQueryMock,
} from './overview-page.test-setup'

describe('OverviewPage errors', () => {
  beforeEach(() => {
    resetOverviewPageTestState()
  })

  it('shows error state in HeroStatsCard when analytics query fails', () => {
    householdStoreState.households = [
      {
        createdAt: 1,
        defaultCurrencyCode: 'VND',
        defaultVisibility: 'private',
        id: 'household-1',
        name: 'Gia đình Một',
        role: 'admin',
        slug: 'gia-dinh-mot',
        timezone: 'Asia/Ho_Chi_Minh',
      },
    ]

    useExpenseSummaryQueryMock.mockReturnValue({
      data: {
        currencyCode: 'VND',
        expenseCount: 6,
        totalSpendMinor: 1250000,
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    })

    useAnalyticsOverviewQueryMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('analytics boom'),
      refetch: vi.fn(),
    })

    render(<OverviewPage />)

    expect(
      screen.getByText('Could not load spending summary.'),
    ).toBeInTheDocument()

    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument()
  })

  it('shows error state in RecentExpenses when recent expenses query fails', () => {
    householdStoreState.households = [
      {
        createdAt: 1,
        defaultCurrencyCode: 'VND',
        defaultVisibility: 'private',
        id: 'household-1',
        name: 'Gia đình Một',
        role: 'admin',
        slug: 'gia-dinh-mot',
        timezone: 'Asia/Ho_Chi_Minh',
      },
    ]

    useExpenseSummaryQueryMock.mockReturnValue({
      data: {
        currencyCode: 'VND',
        expenseCount: 6,
        totalSpendMinor: 1250000,
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    })

    useAnalyticsOverviewQueryMock.mockReturnValue({
      data: {
        currencyCode: 'VND',
        dailySpend: [],
        expenseCount: 6,
        householdId: 'household-1',
        period: '2026-05',
        topCategories: [],
        totalSpendMinor: 1250000,
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    })

    useInfiniteExpenseListQueryMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('expenses boom'),
      refetch: vi.fn(),
    })

    render(<OverviewPage />)

    expect(
      screen.getByText('Could not load recent expenses.'),
    ).toBeInTheDocument()

    // Should have Retry buttons: one in RecentExpenses error, one in HeroStatsCard (no budget → shows "Set a monthly budget" link, not Retry)
    // Actually HeroStatsCard has no error (overviewQuery.error is null), so only 1 Retry from RecentExpenses
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument()
  })
})
