import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { ExpensesPage } from '@/views/app/expenses-page'

const expenseFeedListMock = vi.fn()
const expenseFeedSummaryMock = vi.fn()
const useExpenseGroupListQueryMock = vi.fn()

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

vi.mock('@/hooks/api/use-groups', () => ({
  useExpenseGroupListQuery: (householdId?: string) =>
    useExpenseGroupListQueryMock(householdId),
}))

vi.mock('@/lib/i18n/t', () => ({
  t: (key: string) => key,
}))

describe('ExpensesPage', () => {
  it('owns expanded feed filter state and passes the same filters to summary and list', async () => {
    const user = userEvent.setup()

    useExpenseGroupListQueryMock.mockReturnValue({
      data: {
        items: [{ id: 'group-1', name: 'Trip', householdId: 'household-1' }],
      },
    })

    render(<ExpensesPage />)

    expect(
      screen.getByRole('heading', { name: 'expense.feed.title' }),
    ).toBeInTheDocument()

    expect(screen.getByLabelText('expense feed search')).toBeInTheDocument()
    expect(screen.getByLabelText('expense feed visibility')).toBeInTheDocument()
    expect(screen.getByLabelText('expense feed category')).toBeInTheDocument()
    expect(screen.getByLabelText('expense feed sort')).toBeInTheDocument()
    expect(screen.getByLabelText('expense feed date from')).toBeInTheDocument()
    expect(screen.getByLabelText('expense feed date to')).toBeInTheDocument()
    expect(screen.getByLabelText('expense feed amount min')).toBeInTheDocument()
    expect(screen.getByLabelText('expense feed amount max')).toBeInTheDocument()
    expect(screen.getByLabelText('expense feed group')).toBeInTheDocument()

    await user.type(screen.getByLabelText('expense feed search'), ' lunch ')

    await user.selectOptions(
      screen.getByLabelText('expense feed visibility'),
      'household',
    )

    await user.selectOptions(
      screen.getByLabelText('expense feed category'),
      'food',
    )

    await user.selectOptions(
      screen.getByLabelText('expense feed sort'),
      'amount_desc',
    )

    await user.type(
      screen.getByLabelText('expense feed date from'),
      '2026-05-01',
    )

    await user.type(screen.getByLabelText('expense feed date to'), '2026-05-31')
    await user.type(screen.getByLabelText('expense feed amount min'), '100')
    await user.type(screen.getByLabelText('expense feed amount max'), '500')

    await user.selectOptions(
      screen.getByLabelText('expense feed group'),
      'group-1',
    )

    await waitFor(() => {
      expect(expenseFeedSummaryMock).toHaveBeenLastCalledWith(
        expect.objectContaining({
          filters: {
            amount_max: 500,
            amount_min: 100,
            category_key: 'food',
            date_from: new Date('2026-05-01').getTime(),
            date_to: new Date('2026-05-31T23:59:59.999Z').getTime(),
            group_id: 'group-1',
            sort: 'amount_desc',
            visibility: 'household',
          },
          search: ' lunch ',
        }),
      )

      expect(expenseFeedListMock).toHaveBeenLastCalledWith(
        expect.objectContaining({
          filters: {
            amount_max: 500,
            amount_min: 100,
            category_key: 'food',
            date_from: new Date('2026-05-01').getTime(),
            date_to: new Date('2026-05-31T23:59:59.999Z').getTime(),
            group_id: 'group-1',
            sort: 'amount_desc',
            visibility: 'household',
          },
          search: ' lunch ',
        }),
      )
    })
  })
})
