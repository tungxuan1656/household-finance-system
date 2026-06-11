import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { usePeriodStore } from '@/features/period/store'
import { createReportingPeriodPresetSelection } from '@/lib/period'
import { StatisticsPage } from '@/routes/statistics'

const analyticsOverviewMock = vi.fn()
const analyticsComparisonMock = vi.fn()
const vietnamTimestamp = (
  year: number,
  monthIndex: number,
  day: number,
): number => Date.UTC(year, monthIndex, day) - 7 * 60 * 60 * 1000

vi.mock('@/features/home/api', () => ({
  useAnalyticsComparisonQuery: (params: unknown) => {
    analyticsComparisonMock(params)

    return {
      data: undefined,
      isFetching: false,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    }
  },
  useAnalyticsOverviewQuery: (params: unknown) => {
    analyticsOverviewMock(params)

    return {
      data: {
        currencyCode: 'VND',
        dailySpend: [],
        expenseCount: 2,
        householdId: null,
        period: '2026-06-08..2026-06-15',
        topCategories: [
          {
            categoryKey: 'food',
            expenseCount: 1,
            percentOfTotal: 60,
            totalSpendMinor: 60_000,
          },
          {
            categoryKey: 'transport',
            expenseCount: 1,
            percentOfTotal: 40,
            totalSpendMinor: 40_000,
          },
        ],
        totalSpendMinor: 100_000,
      },
      error: null,
      isError: false,
      isFetching: false,
      isLoading: false,
      refetch: vi.fn(),
    }
  },
  useReferenceCategoriesQuery: () => ({
    data: { items: [] },
  }),
}))

vi.mock('@/lib/telegram/bottom-button', () => ({
  hideBottomButton: vi.fn(),
}))

vi.mock('@/lib/telegram/haptics', () => ({
  impact: vi.fn(),
  selection: vi.fn(),
}))

describe('StatisticsPage', () => {
  let host: HTMLDivElement
  let root: Root

  beforeEach(() => {
    ;

(
      globalThis as typeof globalThis & {
        IS_REACT_ACT_ENVIRONMENT?: boolean
      }
    ).IS_REACT_ACT_ENVIRONMENT = true

    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-15T12:00:00Z'))
    usePeriodStore.getState().reset()

    usePeriodStore
      .getState()
      .setSelectedPeriod(createReportingPeriodPresetSelection('lastWeek'))

    analyticsOverviewMock.mockClear()
    analyticsComparisonMock.mockClear()

    host = document.createElement('div')
    document.body.append(host)
    root = createRoot(host)
  })

  afterEach(async () => {
    vi.useRealTimers()

    await act(async () => {
      root.unmount()
    })

    host.remove()
  })

  it('uses the shared selected period and renders pie legend percentages', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <StatisticsPage />
        </MemoryRouter>,
      )
    })

    expect(analyticsOverviewMock).toHaveBeenCalledWith({
      date_from: vietnamTimestamp(2026, 5, 8),
      date_to: vietnamTimestamp(2026, 5, 15),
    })

    expect(analyticsComparisonMock).toHaveBeenCalledWith({
      date_from: vietnamTimestamp(2026, 5, 8),
      date_to: vietnamTimestamp(2026, 5, 15),
    })

    expect(host.textContent).toContain('Tuần trước')
    expect(host.textContent).toContain('Biểu đồ danh mục')
    expect(host.textContent).toContain('Ăn uống')
    expect(host.textContent).toContain('60%')
    expect(host.textContent).toContain('Di chuyển')
    expect(host.textContent).toContain('40%')
  })
})
