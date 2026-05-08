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

describe('OverviewPage content', () => {
  beforeEach(() => {
    resetOverviewPageTestState()
  })

  it('renders household summary cards and scoped links for multiple households', () => {
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

    useHouseholdMembersQueryMock.mockImplementation((householdId: string) => ({
      data:
        householdId === 'household-1' ? { items: [{}, {}] } : { items: [{}] },
      isLoading: false,
      error: null,
    }))

    useBudgetListQueryMock.mockImplementation((householdId: string) => ({
      data: {
        items:
          householdId === 'household-1'
            ? [{ id: 'budget-1', period: '2026-05' }]
            : [],
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    }))

    useAnalyticsOverviewQueryMock.mockImplementation(
      (params: { household_id?: string }) => ({
        data: {
          currencyCode: params.household_id === 'household-1' ? 'VND' : 'USD',
          dailySpend: [],
          expenseCount: params.household_id === 'household-1' ? 6 : 0,
          householdId: params.household_id ?? null,
          period: '2026-05',
          topCategories: [],
          totalSpendMinor: params.household_id === 'household-1' ? 1250000 : 0,
        },
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      }),
    )

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

    expect(screen.getByText('Gia đình Một')).toBeInTheDocument()
    expect(screen.getByText('Gia đình Hai')).toBeInTheDocument()

    expect(
      screen.getByText('app.overview.households.title'),
    ).toBeInTheDocument()

    expect(useAnalyticsOverviewQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({ household_id: 'household-1' }),
      expect.objectContaining({ enabled: true }),
    )

    expect(
      screen.getByRole('link', { name: 'app.overview.actions.viewHouseholds' }),
    ).toHaveAttribute('href', '/households')

    expect(
      screen.getByRole('link', { name: 'app.overview.actions.viewBudgets' }),
    ).toHaveAttribute('href', '/budgets')

    expect(
      screen.getByRole('link', { name: 'app.overview.actions.viewInsights' }),
    ).toHaveAttribute('href', '/insights')

    expect(
      screen.getByText(
        'app.householdDetail.members.invite.fields.role.options.admin',
      ),
    ).toBeInTheDocument()

    expect(
      screen.getByText(
        'app.householdDetail.members.invite.fields.role.options.member',
      ),
    ).toBeInTheDocument()
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

  it('links invite-members action to households flow for admin household context', () => {
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
      data: { items: [{}] },
      isLoading: false,
      error: null,
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

    useBudgetListQueryMock.mockReturnValue({
      data: { items: [] },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    })

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

    render(<OverviewPage />)

    expect(
      screen.getByRole('link', { name: 'app.overview.actions.inviteMembers' }),
    ).toHaveAttribute('href', '/households')
  })
})
