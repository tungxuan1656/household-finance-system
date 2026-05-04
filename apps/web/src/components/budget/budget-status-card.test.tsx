import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { BudgetStatusCard } from '@/components/budget/budget-status-card'

vi.mock('@/hooks/api/use-reference-data', () => ({
  useReferenceCategoriesQuery: () => ({
    data: { items: [{ key: 'food', color: '#ff0000' }] },
  }),
}))

vi.mock('@/lib/reference-data/labels', () => ({
  getCategoryLabel: (key: string) => `label:${key}`,
}))

vi.mock('@/lib/i18n/t', () => ({ t: (key: string) => key }))

describe('BudgetStatusCard', () => {
  it('renders status metrics and category rows', () => {
    render(
      <BudgetStatusCard
        status={{
          budgetId: 'budget-1',
          householdId: 'hh-1',
          period: '2026-05',
          currencyCode: 'VND',
          totalPlannedMinor: 1000,
          totalActualMinor: 750,
          totalRemainingMinor: 250,
          totalPercentUsed: 75,
          totalStatus: 'warning',
          categoryStatuses: [
            {
              categoryKey: 'food',
              plannedLimitMinor: 500,
              actualSpendMinor: 600,
              remainingMinor: -100,
              percentUsed: 120,
              status: 'exceeded',
            },
          ],
        }}
      />,
    )

    expect(screen.getByText('budgets.status.title')).toBeInTheDocument()

    expect(
      screen.getByText(/budgets\.status\.labels\.warning/),
    ).toBeInTheDocument()

    expect(screen.getByText('label:food')).toBeInTheDocument()
  })
})
