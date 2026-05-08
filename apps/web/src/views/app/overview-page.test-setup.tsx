import { vi } from 'vitest'

export const useAnalyticsOverviewQueryMock = vi.fn()
export const useBudgetListQueryMock = vi.fn()
export const useHouseholdMembersQueryMock = vi.fn()
export const useExpenseSummaryQueryMock = vi.fn()
export const fetchHouseholdsMock = vi.fn()

export const authStoreState = {
  user: {
    displayName: 'Demo User',
    email: 'demo@example.com',
  } as { displayName: string | null; email: string | null } | null,
}

export const householdStoreState = {
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

export function resetOverviewPageTestState(): void {
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
}
