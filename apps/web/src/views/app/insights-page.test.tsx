import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { InsightsPage } from '@/views/app/insights-page'

const useAnalyticsOverviewQueryMock = vi.fn()
const useReferenceCategoriesQueryMock = vi.fn()

vi.mock('@/hooks/api/use-analytics', () => ({
  useAnalyticsOverviewQuery: (...args: unknown[]) =>
    useAnalyticsOverviewQueryMock(...args),
}))

vi.mock('@/hooks/api/use-reference-data', () => ({
  useReferenceCategoriesQuery: () => useReferenceCategoriesQueryMock(),
}))

vi.mock('@/lib/i18n/t', () => ({ t: (key: string) => key }))

vi.mock('@/stores/household.store', () => ({
  householdActions: { fetchHouseholds: vi.fn() },
  useHouseholdStore: {
    use: {
      currentHousehold: () => ({ id: 'hh-1' }),
      households: () => [{ id: 'hh-1' }],
    },
  },
}))

describe('InsightsPage', () => {
  beforeEach(() => {
    useReferenceCategoriesQueryMock.mockReturnValue({
      data: {
        items: [
          { key: 'food', kind: 'expense', color: '#f00', iconUrl: '/food.svg' },
          {
            key: 'transport',
            kind: 'expense',
            color: '#0f0',
            iconUrl: '/transport.svg',
          },
        ],
      },
    })
  })

  it('requests analytics for selected household and current month', () => {
    useAnalyticsOverviewQueryMock.mockReturnValue({
      data: {
        period: '2026-05',
        householdId: 'hh-1',
        currencyCode: 'VND',
        totalSpendMinor: 59000,
        expenseCount: 3,
        dailySpend: [
          { date: '2026-05-02', totalSpendMinor: 50000 },
          { date: '2026-05-14', totalSpendMinor: 9000 },
        ],
        topCategories: [
          {
            categoryKey: 'transport',
            totalSpendMinor: 38000,
            percentOfTotal: 64,
            expenseCount: 1,
          },
          {
            categoryKey: 'food',
            totalSpendMinor: 21000,
            percentOfTotal: 36,
            expenseCount: 2,
          },
        ],
      },
      isLoading: false,
      error: null,
    })

    render(<InsightsPage initialPeriod='2026-05' />)

    expect(useAnalyticsOverviewQueryMock).toHaveBeenCalledWith({
      household_id: 'hh-1',
      period: '2026-05',
    })

    expect(screen.getByText('59000')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()

    expect(
      screen.getByText('app.expenseReference.categories.transport'),
    ).toBeInTheDocument()
  })

  it('shows empty state when selected month has no expenses', () => {
    useAnalyticsOverviewQueryMock.mockReturnValue({
      data: {
        period: '2026-05',
        householdId: 'hh-1',
        currencyCode: 'VND',
        totalSpendMinor: 0,
        expenseCount: 0,
        dailySpend: [],
        topCategories: [],
      },
      isLoading: false,
      error: null,
    })

    render(<InsightsPage initialPeriod='2026-05' />)

    expect(screen.getByText('insights.empty.title')).toBeInTheDocument()
    expect(screen.getByText('insights.empty.description')).toBeInTheDocument()
  })

  it('shows error state when analytics query fails', () => {
    useAnalyticsOverviewQueryMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('boom'),
    })

    render(<InsightsPage initialPeriod='2026-05' />)

    expect(screen.getByText('insights.error.title')).toBeInTheDocument()
    expect(screen.getByText('insights.error.description')).toBeInTheDocument()
  })
})
