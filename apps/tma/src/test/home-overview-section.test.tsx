import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { FinanceSummaryCard } from '@/features/finance/components'
import { HomeOverviewSection } from '@/features/home/components/home-overview-section'
import { usePeriodStore } from '@/features/period/store'
import { createReportingPeriodPresetSelection } from '@/lib/period'

const mocks = vi.hoisted(() => ({
  budgetListQueryOptions: vi.fn((householdId: string, period: string) => ({
    queryFn: vi.fn(),
    queryKey: ['budgets', 'list', householdId, period],
  })),
  useAnalyticsComparisonQuery: vi.fn(() => ({
    data: undefined,
    error: null,
    isFetching: false,
    isLoading: false,
    refetch: vi.fn(),
  })),
  useAnalyticsOverviewQuery: vi.fn(() => ({
    data: {
      currencyCode: 'VND',
      dailySpend: [],
      expenseCount: 2,
      householdId: null,
      period: '2026-06-08..2026-06-15',
      topCategories: [],
      totalSpendMinor: 120_000,
    },
    error: null,
    isError: false,
    isFetching: false,
    isLoading: false,
    refetch: vi.fn(),
  })),
  useQuery: vi.fn((options: { enabled?: boolean }) => ({
    data: options.enabled
      ? {
          items: [
            {
              categoryLimits: [],
              createdAt: 0,
              createdByUserId: 'user-1',
              currencyCode: 'VND',
              householdId: 'household-1',
              id: 'budget-1',
              period: '2026-06',
              totalLimitMinor: 500_000,
              updatedAt: 0,
            },
          ],
        }
      : undefined,
    error: null,
    isFetching: false,
    isLoading: false,
    refetch: vi.fn(),
  })),
}))

vi.mock('@tanstack/react-query', () => ({
  useQuery: mocks.useQuery,
}))

vi.mock('@/features/home/api', () => ({
  budgetListQueryOptions: mocks.budgetListQueryOptions,
  useAnalyticsComparisonQuery: mocks.useAnalyticsComparisonQuery,
  useAnalyticsOverviewQuery: mocks.useAnalyticsOverviewQuery,
}))

describe('HomeOverviewSection budget period', () => {
  let host: HTMLDivElement
  let root: Root

  beforeEach(() => {
    ;

(
      globalThis as typeof globalThis & {
        IS_REACT_ACT_ENVIRONMENT?: boolean
      }
    ).IS_REACT_ACT_ENVIRONMENT = true

    usePeriodStore.getState().reset()

    usePeriodStore
      .getState()
      .setSelectedPeriod(
        createReportingPeriodPresetSelection(
          'lastWeek',
          new Date('2026-06-15T12:00:00Z'),
        ),
      )

    mocks.budgetListQueryOptions.mockClear()
    mocks.useAnalyticsComparisonQuery.mockClear()
    mocks.useAnalyticsOverviewQuery.mockClear()
    mocks.useQuery.mockClear()

    host = document.createElement('div')
    document.body.append(host)
    root = createRoot(host)
  })

  afterEach(async () => {
    await act(async () => {
      root.unmount()
    })

    host.remove()
  })

  it('queries household budgets with a YYYY-MM period when the selected period is weekly', async () => {
    await act(async () => {
      root.render(
        <FinanceSummaryCard householdId='household-1' showPeriodChip={false} />,
      )
    })

    expect(mocks.budgetListQueryOptions).toHaveBeenCalledWith(
      'household-1',
      '2026-06',
    )
  })

  it('shows the monthly budget context on Home when the selected period is weekly', async () => {
    await act(async () => {
      root.render(<HomeOverviewSection />)
    })

    expect(host.textContent).toContain('Ngân sách tháng 06/2026')
    expect(host.textContent).not.toContain('Ngân sách chỉ có theo tháng')
  })
})
