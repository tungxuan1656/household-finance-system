import './overview-page.test-setup'

import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { OverviewPage } from '@/views/app/overview-page'

import {
  householdStoreState,
  resetOverviewPageTestState,
  useAnalyticsOverviewQueryMock,
  useExpenseSummaryQueryMock,
} from './overview-page.test-setup'

describe('OverviewPage content links', () => {
  beforeEach(() => {
    resetOverviewPageTestState()
  })

  it('renders household names in LensSelector for multiple households', () => {
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
      {
        createdAt: 2,
        defaultCurrencyCode: 'USD',
        defaultVisibility: 'household',
        id: 'household-2',
        name: 'Gia đình Hai',
        role: 'member',
        slug: 'gia-dinh-hai',
        timezone: 'UTC',
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

    render(<OverviewPage />)

    // Both household names should appear in LensSelector (rendered twice: desktop + mobile)
    expect(screen.getAllByText('Gia đình Một').length).toBe(2)
    expect(screen.getAllByText('Gia đình Hai').length).toBe(2)
    // Personal lens should also be present
    expect(screen.getAllByText('Personal').length).toBe(2)
  })

  it('renders page without crashing with single household', () => {
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
        expenseCount: 2,
        totalSpendMinor: 250000,
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    })

    useAnalyticsOverviewQueryMock.mockReturnValue({
      data: {
        currencyCode: 'VND',
        dailySpend: [],
        expenseCount: 2,
        householdId: 'household-1',
        period: '2026-05',
        topCategories: [],
        totalSpendMinor: 250000,
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    })

    render(<OverviewPage />)

    // LensSelector renders labels twice (desktop + mobile)
    expect(screen.getAllByText('Personal').length).toBe(2)
    expect(screen.getAllByText('Gia đình Một').length).toBe(2)
    // Page should render the spending summary section
    expect(screen.getByText('This month spending')).toBeInTheDocument()
  })
})
