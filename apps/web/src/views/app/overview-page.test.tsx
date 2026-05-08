import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { OverviewPage } from '@/views/app/overview-page'

const useAnalyticsOverviewQueryMock = vi.fn()
const useBudgetListQueryMock = vi.fn()
const useHouseholdMembersQueryMock = vi.fn()
const useExpenseSummaryQueryMock = vi.fn()
const fetchHouseholdsMock = vi.fn()

const authStoreState = {
  user: {
    displayName: 'Demo User',
    email: 'demo@example.com',
  } as { displayName: string | null; email: string | null } | null,
}

const householdStoreState = {
  currentHousehold: null as null | { id: string },
  households: [] as Array<{
    createdAt: number
    defaultCurrencyCode: string
    defaultVisibility: 'private' | 'household'
    id: string
    name: string
    role: 'admin' | 'member'
    slug: string
    timezone: string
  }>,
  isLoading: false,
}

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode
    href: string
  }) => <a href={href}>{children}</a>,
}))

vi.mock('@/lib/i18n/t', () => ({ t: (key: string) => key }))

vi.mock('@/components/ui/skeleton', () => ({
  Skeleton: (props: React.ComponentProps<'div'>) => (
    <div data-testid='skeleton' {...props} />
  ),
}))

vi.mock('@/stores/auth.store', () => ({
  useAuthStore: {
    use: {
      user: () => authStoreState.user,
    },
  },
}))

vi.mock('@/stores/household.store', () => ({
  householdActions: { fetchHouseholds: () => fetchHouseholdsMock() },
  useHouseholdStore: {
    use: {
      currentHousehold: () => householdStoreState.currentHousehold,
      households: () => householdStoreState.households,
      isLoading: () => householdStoreState.isLoading,
    },
  },
}))

vi.mock('@/hooks/api/use-analytics', () => ({
  useAnalyticsOverviewQuery: (...args: unknown[]) =>
    useAnalyticsOverviewQueryMock(...args),
}))

vi.mock('@/hooks/api/use-budgets', () => ({
  useBudgetListQuery: (...args: unknown[]) => useBudgetListQueryMock(...args),
}))

vi.mock('@/hooks/api/use-households', () => ({
  useHouseholdMembersQuery: (...args: unknown[]) =>
    useHouseholdMembersQueryMock(...args),
}))

vi.mock('@/hooks/api/use-expense', () => ({
  useExpenseSummaryQuery: (...args: unknown[]) =>
    useExpenseSummaryQueryMock(...args),
}))

describe('OverviewPage', () => {
  beforeEach(() => {
    authStoreState.user = {
      displayName: 'Demo User',
      email: 'demo@example.com',
    }

    householdStoreState.currentHousehold = null
    householdStoreState.households = []
    householdStoreState.isLoading = false

    useAnalyticsOverviewQueryMock.mockReset()
    useBudgetListQueryMock.mockReset()
    useHouseholdMembersQueryMock.mockReset()
    useExpenseSummaryQueryMock.mockReset()
    fetchHouseholdsMock.mockReset()
    fetchHouseholdsMock.mockResolvedValue([])

    useAnalyticsOverviewQueryMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    })

    useBudgetListQueryMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    })

    useHouseholdMembersQueryMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    })

    useExpenseSummaryQueryMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    })
  })

  it('shows onboarding-first empty state when user has no households', () => {
    render(<OverviewPage />)

    expect(screen.getByText('app.overview.empty.title')).toBeInTheDocument()

    expect(
      screen.getByText('app.overview.empty.description'),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('link', { name: 'app.overview.empty.createHousehold' }),
    ).toHaveAttribute('href', '/onboarding')

    expect(
      screen.getByRole('link', { name: 'app.overview.empty.joinHousehold' }),
    ).toHaveAttribute('href', '/onboarding')
  })

  it('loads households on mount and does not show empty state while initial household load is pending', () => {
    householdStoreState.isLoading = true

    render(<OverviewPage />)

    expect(fetchHouseholdsMock).toHaveBeenCalledTimes(1)

    expect(
      screen.queryByText('app.overview.empty.title'),
    ).not.toBeInTheDocument()

    expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(0)
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
      expect.objectContaining({
        household_id: 'household-1',
      }),
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

    useHouseholdMembersQueryMock.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
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

    useExpenseSummaryQueryMock.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    })

    render(<OverviewPage />)

    expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(0)
    expect(screen.queryByText('0')).not.toBeInTheDocument()
    expect(screen.queryByText('—')).not.toBeInTheDocument()
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
