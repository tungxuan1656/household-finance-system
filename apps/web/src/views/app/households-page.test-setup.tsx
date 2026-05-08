import { vi } from 'vitest'

export const fetchHouseholdsMock = vi.fn(async (): Promise<void> => undefined)

export const householdStoreState: {
  error: string | null
  households: Array<{
    createdAt: number
    defaultCurrencyCode: string
    defaultVisibility: 'private' | 'household'
    id: string
    name: string
    role: 'admin' | 'member'
    slug: string
    timezone: string
  }>
  isLoading: boolean
} = {
  error: null,
  households: [],
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

vi.mock('@/stores/household.store', () => ({
  householdActions: {
    createHousehold: vi.fn(async () => undefined),
    fetchHouseholds: () => fetchHouseholdsMock(),
  },
  useHouseholdStore: {
    use: {
      error: () => householdStoreState.error,
      households: () => householdStoreState.households,
      isLoading: () => householdStoreState.isLoading,
    },
  },
}))

vi.mock('@/hooks/api/use-households', () => ({
  useHouseholdMembersQuery: (householdId: string | undefined) => {
    if (householdId === 'household-1') {
      return {
        data: {
          items: [{}, {}],
        },
      }
    }

    if (householdId === 'household-2') {
      return {
        data: {
          items: [{}],
        },
      }
    }

    return {
      data: undefined,
    }
  },
}))

vi.mock('@/hooks/api/use-budgets', () => ({
  useBudgetListQuery: (householdId: string | undefined) => {
    if (householdId === 'household-1') {
      return {
        data: {
          items: [
            {
              id: 'budget-1',
            },
          ],
        },
      }
    }

    if (householdId === 'household-2') {
      return {
        data: {
          items: [],
        },
      }
    }

    return {
      data: undefined,
    }
  },
}))

vi.mock('@/hooks/api/use-analytics', () => ({
  useAnalyticsOverviewQuery: (
    params: { household_id?: string; period: string },
    options?: { enabled?: boolean },
  ) => {
    if (!options?.enabled) {
      return {
        data: undefined,
      }
    }

    if (params.household_id === 'household-1') {
      return {
        data: {
          currencyCode: 'VND',
          dailySpend: [],
          expenseCount: 6,
          householdId: 'household-1',
          period: params.period,
          topCategories: [],
          totalSpendMinor: 1250000,
        },
      }
    }

    if (params.household_id === 'household-2') {
      return {
        data: {
          currencyCode: 'USD',
          dailySpend: [],
          expenseCount: 0,
          householdId: 'household-2',
          period: params.period,
          topCategories: [],
          totalSpendMinor: 0,
        },
      }
    }

    return {
      data: undefined,
    }
  },
}))

export function resetHouseholdsPageTestState(): void {
  fetchHouseholdsMock.mockClear()
  householdStoreState.error = null
  householdStoreState.households = []
  householdStoreState.isLoading = false
}
