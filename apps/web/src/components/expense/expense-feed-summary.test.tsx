import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { ExpenseFeedSummary } from '@/components/expense/expense-feed-summary'
import type { ExpenseListParams } from '@/types/expense'

const useExpenseSummaryQueryMock = vi.fn()

vi.mock('@/hooks/api/use-expense', () => ({
  useExpenseSummaryQuery: (params?: ExpenseListParams) =>
    useExpenseSummaryQueryMock(params),
}))

vi.mock('@/lib/i18n/t', () => ({
  t: (key: string) => key,
}))

describe('ExpenseFeedSummary', () => {
  it('forwards filters to the summary query and renders totals', () => {
    useExpenseSummaryQueryMock.mockReturnValue({
      data: {
        totalSpendMinor: 120000,
        expenseCount: 3,
        currencyCode: 'VND',
      },
      isLoading: false,
    })

    render(
      <ExpenseFeedSummary
        filters={{ visibility: 'household' }}
        search=' lunch '
      />,
    )

    expect(useExpenseSummaryQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        visibility: 'household',
        query: 'lunch',
      }),
    )

    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('120000')).toBeInTheDocument()
  })
})
