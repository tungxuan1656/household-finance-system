import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { HouseholdSummaryCard } from '@/components/household/household-summary-card'

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode
    href: string
  }) => <a href={href}>{children}</a>,
}))

vi.mock('@/hooks/api/use-households', () => ({
  useHouseholdMembersQuery: () => ({
    data: {
      items: [{}, {}],
    },
  }),
}))

vi.mock('@/hooks/api/use-budgets', () => ({
  useBudgetListQuery: () => ({
    data: {
      items: [],
    },
  }),
}))

vi.mock('@/hooks/api/use-analytics', () => ({
  useAnalyticsOverviewQuery: () => ({
    data: {
      currencyCode: 'VND',
      expenseCount: 6,
      totalSpendMinor: 1250000,
    },
  }),
}))

describe('HouseholdSummaryCard', () => {
  it('renders without navigator being available', () => {
    const originalNavigator = globalThis.navigator

    Object.defineProperty(globalThis, 'navigator', {
      configurable: true,
      value: undefined,
    })

    render(
      <HouseholdSummaryCard
        household={{
          createdAt: 1,
          defaultCurrencyCode: 'VND',
          defaultVisibility: 'private',
          id: 'household-1',
          name: 'Gia đình Một',
          role: 'admin',
          slug: 'gia-dinh-mot',
          timezone: 'Asia/Ho_Chi_Minh',
        }}
      />,
    )

    expect(screen.getByText('Gia đình Một')).toBeInTheDocument()

    Object.defineProperty(globalThis, 'navigator', {
      configurable: true,
      value: originalNavigator,
    })
  })
})
