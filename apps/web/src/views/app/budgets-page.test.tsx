import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { BudgetsPage } from '@/views/app/budgets-page'

const statusMock = vi.fn()
const summaryMock = vi.fn()
const useBudgetListQueryMock = vi.fn()
const useBudgetStatusQueryMock = vi.fn()

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
  useBudgetListQuery: (...args: unknown[]) => useBudgetListQueryMock(...args),
  useBudgetStatusQuery: (...args: unknown[]) =>
    useBudgetStatusQueryMock(...args),
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
  const budgetOne = {
    id: 'budget-1',
    householdId: 'hh-1',
    period: '2026-04',
    totalLimitMinor: 1000,
    currencyCode: 'VND',
    categoryLimits: [],
    createdByUserId: 'u1',
    createdAt: 1,
    updatedAt: 1,
  }

  const budgetTwo = {
    ...budgetOne,
    id: 'budget-2',
    period: '2026-05',
  }

  const defaultStatusResult = {
    data: { period: '2026-05' },
    isLoading: false,
    error: null,
  }

  beforeEach(() => {
    statusMock.mockClear()
    summaryMock.mockClear()

    useBudgetListQueryMock.mockReturnValue({
      data: { items: [budgetOne, budgetTwo] },
    })

    useBudgetStatusQueryMock.mockReturnValue(defaultStatusResult)
  })

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
    expect(useBudgetStatusQueryMock).toHaveBeenCalledWith('budget-2')
  })

  it('passes an error message when status loading fails', () => {
    useBudgetStatusQueryMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('boom'),
    })

    render(<BudgetsPage />)

    expect(statusMock).toHaveBeenCalledWith(
      expect.objectContaining({
        errorMessage: 'budgets.status.error.loadFailed',
      }),
    )
  })
})
