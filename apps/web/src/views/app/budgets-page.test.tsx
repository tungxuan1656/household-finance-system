import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { BudgetsPage } from '@/views/app/budgets-page'

const statusMock = vi.fn()
const summaryMock = vi.fn()

vi.mock('@/components/budget', () => ({
  BudgetSummaryCard: (props: unknown) => {
    summaryMock(props)

    return <div data-testid='summary' />
  },
  BudgetStatusPanel: (props: unknown) => {
    statusMock(props)

    return <div data-testid='status-panel' />
  },
  CreateBudgetDialog: () => <div data-testid='create-dialog' />,
  EditBudgetDialog: () => <div data-testid='edit-dialog' />,
  BudgetList: () => <div data-testid='budget-list' />,
}))

vi.mock('@/components/budget/budget-list', () => ({
  BudgetList: () => <div data-testid='budget-list' />,
}))

vi.mock('@/components/budget/budget-summary-card', () => ({
  BudgetSummaryCard: (props: unknown) => {
    summaryMock(props)

    return <div data-testid='summary' />
  },
}))

vi.mock('@/hooks/api/use-budgets', () => ({
  useCreateBudgetMutation: () => ({ isPending: false, mutateAsync: vi.fn() }),
  useUpdateBudgetMutation: () => ({ isPending: false, mutateAsync: vi.fn() }),
  useBudgetListQuery: () => ({ data: { items: [{ id: 'budget-1' }] } }),
  useBudgetStatusQuery: () => ({
    data: { period: '2026-05' },
    isLoading: false,
  }),
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

describe('BudgetsPage', () => {
  it('passes latest budget status into tracking panel', () => {
    render(<BudgetsPage />)

    expect(screen.getByTestId('status-panel')).toBeInTheDocument()

    expect(statusMock).toHaveBeenCalledWith(
      expect.objectContaining({
        status: { period: '2026-05' },
        isLoading: false,
      }),
    )

    expect(summaryMock).toHaveBeenCalled()
  })
})
