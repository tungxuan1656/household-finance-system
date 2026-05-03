import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ExpenseTrashPage } from '@/views/app/expense-trash-page'

const restoreMutateMock = vi.fn()

const deletedListState = {
  data: {
    items: [
      {
        id: 'expense-1',
        amountMinor: 125000,
        currencyCode: 'VND',
        categoryKey: 'food' as const,
        sourceKey: 'cash' as const,
        title: 'Deleted lunch',
        occurredAt: new Date(2026, 4, 3).getTime(),
        note: 'team lunch',
        visibility: 'household' as const,
        householdId: 'household-1',
        payerUserId: 'user-1',
        createdByUserId: 'user-1',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ],
    nextCursor: null,
  },
  error: null,
  isLoading: false,
}

vi.mock('@/stores/household.store', () => ({
  useHouseholdStore: {
    use: {
      currentHousehold: () => ({
        id: 'household-1',
        name: 'Family',
        slug: 'family',
        defaultCurrencyCode: 'VND',
        timezone: 'Asia/Ho_Chi_Minh',
        defaultVisibility: 'household',
        role: 'admin' as const,
        createdAt: Date.now(),
      }),
    },
  },
}))

vi.mock('@/hooks/api/use-expense', () => ({
  useDeletedExpenseListQuery: () => deletedListState,
  useRestoreExpenseMutation: () => ({
    isPending: false,
    mutate: restoreMutateMock,
  }),
}))

describe('ExpenseTrashPage', () => {
  beforeEach(() => {
    restoreMutateMock.mockClear()
    deletedListState.error = null
    deletedListState.isLoading = false
  })

  it('lists deleted household expenses and restores them', async () => {
    const user = userEvent.setup()

    render(<ExpenseTrashPage />)

    expect(screen.getByText('Deleted lunch')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Khôi phục' }))

    expect(restoreMutateMock).toHaveBeenCalledWith(
      'expense-1',
      expect.any(Object),
    )
  })
})
