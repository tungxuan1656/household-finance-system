import './overview-page.test-setup'

import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { OverviewPage } from '@/views/app/overview-page'

import {
  householdStoreState,
  resetOverviewPageTestState,
  useAnalyticsOverviewQueryMock,
  useBudgetListQueryMock,
  useExpenseSummaryQueryMock,
} from './overview-page.test-setup'

describe('OverviewPage empty and loading', () => {
  beforeEach(() => {
    resetOverviewPageTestState()
  })

  it('shows empty state when user has no data (no expenses, no budgets)', () => {
    // isEntirelyEmpty requires expenseCount === 0, no budgets, and no loading
    useExpenseSummaryQueryMock.mockReturnValue({
      data: {
        currencyCode: 'VND',
        expenseCount: 0,
        totalSpendMinor: 0,
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    })

    useBudgetListQueryMock.mockReturnValue({
      data: { items: [] },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    })

    useAnalyticsOverviewQueryMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    })

    render(<OverviewPage />)

    expect(screen.getByText('Welcome to Expense Tracker')).toBeInTheDocument()

    expect(
      screen.getByText(
        'Start tracking your spending to see insights and stay on budget.',
      ),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('button', { name: 'Add Your First Expense' }),
    ).toBeInTheDocument()
  })

  it('does not show empty state while queries are loading', () => {
    // Even with empty data, loading takes precedence
    useExpenseSummaryQueryMock.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    })

    useBudgetListQueryMock.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    })

    useAnalyticsOverviewQueryMock.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    })

    render(<OverviewPage />)

    // Empty state should NOT be shown
    expect(
      screen.queryByText('Welcome to Expense Tracker'),
    ).not.toBeInTheDocument()

    // Skeletons should be visible
    expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(0)
  })

  it('shows loading placeholders instead of misleading zero values', () => {
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
      data: undefined,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    })

    useAnalyticsOverviewQueryMock.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    })

    useBudgetListQueryMock.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    })

    render(<OverviewPage />)

    expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(0)
  })
})
