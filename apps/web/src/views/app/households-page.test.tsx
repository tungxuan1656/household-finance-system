import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { t } from '@/lib/i18n/t'
import { householdActions } from '@/stores/household.store'
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
    vi.mocked(householdActions.createHousehold).mockReset()

    vi.mocked(householdActions.createHousehold).mockImplementation(
      async () => ({
        createdAt: 1,
        defaultCurrencyCode: 'VND',
        defaultVisibility: 'private',
        id: 'household-created',
        name: 'Gia đình mới',
        role: 'admin',
        slug: 'gia-dinh-moi',
        timezone: 'Asia/Ho_Chi_Minh',
      }),
    )

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

    const firstCard = screen
      .getByText('Gia đình Một')
      .closest('[data-slot="card"]')
    const secondCard = screen
      .getByText('Gia đình Hai')
      .closest('[data-slot="card"]')

    expect(firstCard).not.toBeNull()
    expect(secondCard).not.toBeNull()

    expect(screen.getByText('Quản trị viên')).toBeInTheDocument()
    expect(screen.getByText('Thành viên')).toBeInTheDocument()

    expect(firstCard).toHaveTextContent('VND')
    expect(firstCard).toHaveTextContent('Asia/Ho_Chi_Minh')
    expect(firstCard).toHaveTextContent('2 thành viên')

    expect(secondCard).toHaveTextContent('USD')
    expect(secondCard).toHaveTextContent('UTC')
    expect(secondCard).toHaveTextContent('1 thành viên')

    expect(screen.getByText('2 thành viên')).toBeInTheDocument()
    expect(screen.getByText('1 thành viên')).toBeInTheDocument()
    expect(screen.getByText('Riêng tư')).toBeInTheDocument()
    expect(screen.getByText('Chia sẻ trong gia đình')).toBeInTheDocument()

    expect(screen.getByText('Ngân sách · Đang hoạt động')).toBeInTheDocument()

    expect(
      screen.getByText('Ngân sách · Chưa đặt ngân sách'),
    ).toBeInTheDocument()

    expect(firstCard).toHaveTextContent('Đã chi')
    expect(firstCard).toHaveTextContent('6 khoản chi')

    expect(secondCard).toHaveTextContent('Đã chi')
    expect(secondCard).toHaveTextContent('0 khoản chi')

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

  it('keeps the existing household list visible while creating a household', async () => {
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

    let resolveCreateHousehold: (() => void) | undefined
    const createHouseholdMock = vi
      .mocked(householdActions.createHousehold)
      .mockImplementation(async () => {
        householdStoreState.isLoading = true
        rerender(<HouseholdsPage />)

        return await new Promise((resolve) => {
          resolveCreateHousehold = () => {
            householdStoreState.isLoading = false
            rerender(<HouseholdsPage />)

            resolve({
              createdAt: 3,
              defaultCurrencyCode: 'VND',
              defaultVisibility: 'private',
              id: 'household-3',
              name: 'Nhà mới',
              role: 'admin',
              slug: 'nha-moi',
              timezone: 'Asia/Ho_Chi_Minh',
            })
          }
        })
      })

    const { container, rerender } = render(<HouseholdsPage />)

    fireEvent.click(
      screen.getByRole('button', {
        name: t('app.households.actions.create'),
      }),
    )

    fireEvent.change(
      screen.getByLabelText(t('app.households.fields.householdName.label')),
      {
        target: { value: 'Nhà mới' },
      },
    )

    fireEvent.click(
      screen.getByRole('button', {
        name: t('app.households.actions.create'),
      }),
    )

    await waitFor(() => {
      expect(createHouseholdMock).toHaveBeenCalledTimes(1)
    })

    expect(screen.getByText('Gia đình Một')).toBeInTheDocument()
    expect(container.querySelectorAll('[data-slot="skeleton"]')).toHaveLength(0)

    expect(
      screen.getByRole('dialog', {
        name: t('app.households.create.title'),
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('button', {
        name: t('app.households.actions.creating'),
      }),
    ).toBeDisabled()

    await act(async () => {
      resolveCreateHousehold?.()
    })
  })

  it('keeps the create dialog coherent in empty state while create toggles shared loading', async () => {
    let resolveCreateHousehold: (() => void) | undefined
    const createHouseholdMock = vi
      .mocked(householdActions.createHousehold)
      .mockImplementation(async () => {
        householdStoreState.isLoading = true
        rerender(<HouseholdsPage />)

        return await new Promise((resolve) => {
          resolveCreateHousehold = () => {
            householdStoreState.isLoading = false
            rerender(<HouseholdsPage />)

            resolve({
              createdAt: 1,
              defaultCurrencyCode: 'VND',
              defaultVisibility: 'private',
              id: 'household-1',
              name: 'Nhà mới',
              role: 'admin',
              slug: 'nha-moi',
              timezone: 'Asia/Ho_Chi_Minh',
            })
          }
        })
      })

    const { container, rerender } = render(<HouseholdsPage />)

    fireEvent.click(
      screen.getAllByRole('button', {
        name: t('app.households.actions.create'),
      })[0],
    )

    fireEvent.change(
      screen.getByLabelText(t('app.households.fields.householdName.label')),
      {
        target: { value: 'Nhà mới' },
      },
    )

    fireEvent.click(
      screen.getByRole('button', {
        name: t('app.households.actions.create'),
      }),
    )

    await waitFor(() => {
      expect(createHouseholdMock).toHaveBeenCalledTimes(1)
    })

    expect(
      screen.getByRole('dialog', {
        name: t('app.households.create.title'),
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('button', {
        name: t('app.households.actions.creating'),
      }),
    ).toBeDisabled()

    expect(
      screen.getByText(t('app.households.empty.title')),
    ).toBeInTheDocument()

    expect(container.querySelectorAll('[data-slot="skeleton"]')).toHaveLength(0)

    await act(async () => {
      resolveCreateHousehold?.()
    })
  })
})
