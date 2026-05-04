import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { ExpensesPage } from '@/views/app/expenses-page'

const expenseFeedListMock = vi.fn()
const expenseFeedSummaryMock = vi.fn()

vi.mock('@/components/expense/expense-feed-list', () => ({
  ExpenseFeedList: (props: unknown) => {
    expenseFeedListMock(props)

    return <div data-testid='expense-feed-list' />
  },
}))

vi.mock('@/components/expense/expense-feed-summary', () => ({
  ExpenseFeedSummary: (props: unknown) => {
    expenseFeedSummaryMock(props)

    return <div data-testid='expense-feed-summary' />
  },
}))

vi.mock('@/hooks/api/use-reference-data', () => ({
  useReferenceCategoriesQuery: () => ({
    data: {
      items: [
        { key: 'food', kind: 'expense', iconUrl: '/food.png', color: '#fff' },
        {
          key: 'money-in',
          kind: 'income',
          iconUrl: '/income.png',
          color: '#000',
        },
      ],
    },
  }),
}))

vi.mock('@/lib/i18n/t', () => ({
  t: (key: string) => key,
}))

describe('ExpensesPage', () => {
  it('owns feed filter state and passes it to the feed list', () => {
    render(<ExpensesPage />)

    expect(
      screen.getByRole('heading', { name: 'expense.feed.title' }),
    ).toBeInTheDocument()

    expect(screen.getByLabelText('expense feed search')).toBeInTheDocument()
    expect(screen.getByLabelText('expense feed visibility')).toBeInTheDocument()
    expect(screen.getByLabelText('expense feed category')).toBeInTheDocument()

    expect(expenseFeedSummaryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        filters: expect.any(Object),
        search: expect.any(String),
      }),
    )

    expect(expenseFeedListMock).toHaveBeenCalledWith(
      expect.objectContaining({
        filters: expect.any(Object),
        search: expect.any(String),
      }),
    )
  })
})
