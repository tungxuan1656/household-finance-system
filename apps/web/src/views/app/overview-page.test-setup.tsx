import { vi } from 'vitest'

import { MockNextLink } from '@/test/mock-next-link'

export const useAnalyticsOverviewQueryMock = vi.fn()
export const useAnalyticsComparisonQueryMock = vi.fn()
export const useBudgetListQueryMock = vi.fn()
export const useHouseholdMembersQueryMock = vi.fn()
export const useExpenseSummaryQueryMock = vi.fn()
export const useInfiniteExpenseListQueryMock = vi.fn()
export const useExpenseGroupListQueryMock = vi.fn()
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
  default: MockNextLink,
}))

vi.mock('@/lib/i18n/t', () => ({ t: (key: string) => key }))

vi.mock('@/components/ui/skeleton', () => ({
  Skeleton: (props: React.ComponentProps<'div'>) => (
    <div data-testid='skeleton' {...props} />
  ),
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
  useAnalyticsComparisonQuery: (...args: unknown[]) =>
    useAnalyticsComparisonQueryMock(...args),
}))

vi.mock('@/hooks/api/use-budgets', () => ({
  useBudgetListQuery: (...args: unknown[]) => useBudgetListQueryMock(...args),
}))

vi.mock('@/hooks/api/use-groups', () => ({
  useExpenseGroupListQuery: (...args: unknown[]) =>
    useExpenseGroupListQueryMock(...args),
}))

vi.mock('@/hooks/api/use-households', () => ({
  useHouseholdMembersQuery: (...args: unknown[]) =>
    useHouseholdMembersQueryMock(...args),
}))

vi.mock('@/hooks/api/use-expense', () => ({
  useExpenseSummaryQuery: (...args: unknown[]) =>
    useExpenseSummaryQueryMock(...args),
  useInfiniteExpenseListQuery: (...args: unknown[]) =>
    useInfiniteExpenseListQueryMock(...args),
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
  useAnalyticsComparisonQueryMock.mockReset()
  useBudgetListQueryMock.mockReset()
  useHouseholdMembersQueryMock.mockReset()
  useExpenseSummaryQueryMock.mockReset()
  useInfiniteExpenseListQueryMock.mockReset()
  useExpenseGroupListQueryMock.mockReset()
  fetchHouseholdsMock.mockReset()
  fetchHouseholdsMock.mockResolvedValue([])

  useAnalyticsOverviewQueryMock.mockReturnValue({
    data: undefined,
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  })

  useAnalyticsComparisonQueryMock.mockReturnValue({
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

  useInfiniteExpenseListQueryMock.mockReturnValue({
    data: undefined,
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  })

  useExpenseGroupListQueryMock.mockReturnValue({
    data: undefined,
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  })
}
