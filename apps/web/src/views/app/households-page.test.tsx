import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { t } from '@/lib/i18n/t'
import { HouseholdsPage } from '@/views/app/households-page'

const fetchHouseholdsMock = vi.fn(async (): Promise<void> => undefined)

const householdStoreState: {
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

describe('HouseholdsPage', () => {
  beforeEach(() => {
    fetchHouseholdsMock.mockClear()
    householdStoreState.error = null
    householdStoreState.households = []
    householdStoreState.isLoading = false
  })

  it('renders localized household cards without placeholder member count', () => {
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

    render(<HouseholdsPage />)

    expect(fetchHouseholdsMock).toHaveBeenCalledTimes(1)

    expect(screen.getByText('Gia đình Một')).toBeInTheDocument()
    expect(screen.getByText('Gia đình Hai')).toBeInTheDocument()

    expect(screen.getByText('Quản trị viên')).toBeInTheDocument()
    expect(screen.getByText('Thành viên')).toBeInTheDocument()
    expect(screen.getByText('VND · Asia/Ho_Chi_Minh')).toBeInTheDocument()
    expect(screen.getByText('USD · UTC')).toBeInTheDocument()
    expect(screen.getByText('2 thành viên')).toBeInTheDocument()
    expect(screen.getByText('1 thành viên')).toBeInTheDocument()
    expect(screen.getByText('Riêng tư')).toBeInTheDocument()
    expect(screen.getByText('Chia sẻ trong gia đình')).toBeInTheDocument()

    expect(screen.getByText('Ngân sách · Đang hoạt động')).toBeInTheDocument()

    expect(
      screen.getByText('Ngân sách · Chưa đặt ngân sách'),
    ).toBeInTheDocument()

    expect(
      screen.getByText('Đã chi · 12.500 ₫ · 6 khoản chi'),
    ).toBeInTheDocument()

    expect(
      screen.getByText('Đã chi · 0,00 US$ · 0 khoản chi'),
    ).toBeInTheDocument()

    expect(
      screen.queryByText(t('app.households.memberCountPlaceholder')),
    ).not.toBeInTheDocument()

    expect(
      screen.queryByText(t('app.households.create.description')),
    ).not.toBeInTheDocument()

    expect(
      screen.getAllByRole('link', {
        name: t('app.households.actions.viewDetail'),
      }),
    ).toHaveLength(2)
  })

  it('renders an accessible retry state when loading households fails', () => {
    householdStoreState.error = 'Load households failed'

    render(<HouseholdsPage />)

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Load households failed',
    )

    fireEvent.click(
      screen.getByRole('button', {
        name: t('app.households.actions.retry'),
      }),
    )

    expect(fetchHouseholdsMock).toHaveBeenCalledTimes(2)
  })

  it('renders loading placeholders instead of a text-only loading card', () => {
    householdStoreState.isLoading = true

    const { container } = render(<HouseholdsPage />)

    expect(
      screen.queryByText(t('app.households.loading')),
    ).not.toBeInTheDocument()

    expect(
      container.querySelectorAll('[data-slot="skeleton"]').length,
    ).toBeGreaterThan(0)
  })
})
