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

describe('OverviewPage membership actions', () => {
  beforeEach(() => {
    resetOverviewPageTestState()
  })

  it('renders page with member-only household', () => {
    householdStoreState.households = [
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
        currencyCode: 'USD',
        expenseCount: 1,
        totalSpendMinor: 9000,
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    })

    useAnalyticsOverviewQueryMock.mockReturnValue({
      data: {
        currencyCode: 'USD',
        dailySpend: [],
        expenseCount: 1,
        householdId: 'household-2',
        period: '2026-05',
        topCategories: [],
        totalSpendMinor: 9000,
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    })

    render(<OverviewPage />)

    // LensSelector renders labels twice (desktop + mobile)
    expect(screen.getAllByText('Gia đình Hai').length).toBe(2)
    expect(screen.getAllByText('Personal').length).toBe(2)
    // The spending summary should render
    expect(screen.getByText('This month spending')).toBeInTheDocument()
  })
})
