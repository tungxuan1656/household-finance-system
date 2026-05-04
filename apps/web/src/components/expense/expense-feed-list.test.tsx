import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { ExpenseFeedList } from '@/components/expense/expense-feed-list'
import type { ExpenseListParams } from '@/types/expense'

const fetchNextPageMock = vi.fn()
const refetchMock = vi.fn()
const routerPushMock = vi.fn()
const useInfiniteExpenseListQueryMock = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: routerPushMock,
  }),
}))

vi.mock('@/hooks/api/use-expense', () => ({
  useInfiniteExpenseListQuery: (params?: ExpenseListParams) =>
    useInfiniteExpenseListQueryMock(params),
}))

vi.mock('@/components/expense/expense-feed-item', () => ({
  ExpenseFeedItem: ({ expense, onClick }: any) => (
    <button onClick={() => onClick(expense.id)}>{expense.title}</button>
  ),
}))

vi.mock('@/lib/i18n/t', () => ({
  t: (key: string) => key,
}))

describe('ExpenseFeedList', () => {
  it('forwards filters to the infinite query and renders load more state', async () => {
    const user = userEvent.setup()
    const filters: ExpenseListParams = {
      category_key: 'food',
      visibility: 'household',
    }

    useInfiniteExpenseListQueryMock.mockReturnValue({
      data: {
        pages: [
          {
            items: [
              {
                id: 'expense-1',
                amountMinor: 125000,
                currencyCode: 'VND',
                categoryKey: 'food',
                sourceKey: 'cash',
                title: 'Lunch',
                occurredAt: Date.now(),
                note: null,
                visibility: 'household',
                householdId: 'household-1',
                payerUserId: 'user-1',
                createdByUserId: 'user-1',
                createdAt: Date.now(),
                updatedAt: Date.now(),
              },
            ],
          },
        ],
      },
      isLoading: false,
      isError: false,
      fetchNextPage: fetchNextPageMock,
      hasNextPage: true,
      isFetchingNextPage: false,
      refetch: refetchMock,
    })

    render(<ExpenseFeedList filters={filters} search='lunch' />)

    expect(useInfiniteExpenseListQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        category_key: 'food',
        visibility: 'household',
        query: 'lunch',
      }),
    )

    expect(screen.getByRole('button', { name: 'Lunch' })).toBeInTheDocument()

    expect(
      screen.getByRole('button', { name: 'expense.feed.loadMore' }),
    ).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: 'expense.feed.loadMore' }),
    )

    expect(fetchNextPageMock).toHaveBeenCalledOnce()
  })
})
