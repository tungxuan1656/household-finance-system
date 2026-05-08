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

describe('OverviewPage membership actions', () => {
  beforeEach(() => {
    resetOverviewPageTestState()
  })

  it('does not show invite-members action for member-only household context', () => {
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

    useHouseholdMembersQueryMock.mockReturnValue({
      data: { items: [{}] },
      isLoading: false,
      error: null,
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

    useBudgetListQueryMock.mockReturnValue({
      data: { items: [] },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    })

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

    render(<OverviewPage />)

    expect(
      screen.queryByRole('link', {
        name: 'app.overview.actions.inviteMembers',
      }),
    ).not.toBeInTheDocument()
  })
})
