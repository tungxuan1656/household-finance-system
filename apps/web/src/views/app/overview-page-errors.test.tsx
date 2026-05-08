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
  useHouseholdMembersQueryMock,
} from './overview-page.test-setup'

describe('OverviewPage errors', () => {
  beforeEach(() => {
    resetOverviewPageTestState()
  })

  it('keeps healthy summary sections visible when budget slice fails', () => {
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

    useHouseholdMembersQueryMock.mockReturnValue({
      data: { items: [{}, {}] },
      isLoading: false,
      error: null,
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

    useBudgetListQueryMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('boom'),
      refetch: vi.fn(),
    })

    render(<OverviewPage />)

    expect(screen.getByText('app.overview.summary.title')).toBeInTheDocument()

    expect(
      screen.getByText('app.overview.budget.errorTitle'),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('button', { name: 'app.overview.actions.retryBudget' }),
    ).toBeInTheDocument()
  })

  it('shows retry actions when summary slices fail', () => {
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

    useHouseholdMembersQueryMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('members boom'),
    })

    useAnalyticsOverviewQueryMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('analytics boom'),
      refetch: vi.fn(),
    })

    useBudgetListQueryMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    })

    useExpenseSummaryQueryMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('summary boom'),
      refetch: vi.fn(),
    })

    render(<OverviewPage />)

    expect(
      screen.getAllByRole('button', {
        name: 'app.overview.actions.retrySummary',
      }),
    ).toHaveLength(2)

    expect(
      screen.getByRole('button', {
        name: 'app.overview.actions.retryHouseholdCard',
      }),
    ).toBeInTheDocument()
  })
})
