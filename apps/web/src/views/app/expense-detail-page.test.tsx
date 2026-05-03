import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ExpenseDetailPage } from '@/views/app/expense-detail-page'

const pushMock = vi.fn()
const backMock = vi.fn()
const deleteMutateMock = vi.fn()
const confirmMock = vi.fn()

const expenseDetailState = {
  data: {
    id: 'expense-1',
    amountMinor: 125000,
    currencyCode: 'VND',
    categoryKey: 'food' as const,
    sourceKey: 'cash' as const,
    title: 'Lunch',
    occurredAt: new Date(2026, 4, 3).getTime(),
    note: 'team lunch',
    visibility: 'private' as const,
    householdId: null,
    payerUserId: 'user-1',
    createdByUserId: 'user-1',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  error: null,
  isLoading: false,
}

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'expense-1' }),
  useRouter: () => ({ back: backMock, push: pushMock }),
}))

vi.mock('@/hooks/api/use-profile', () => ({
  useCurrentUserProfileQuery: () => ({
    data: {
      id: 'user-1',
      displayName: 'Owner',
      email: 'owner@example.com',
      avatarUrl: null,
      createdAt: Date.now(),
    },
  }),
}))

vi.mock('@/hooks/api/use-households', () => ({
  useHouseholdsQuery: () => ({
    data: {
      items: [],
    },
  }),
}))

vi.mock('@/hooks/api/use-expense', () => ({
  useExpenseDetailQuery: () => expenseDetailState,
  useDeleteExpenseMutation: () => ({
    isPending: false,
    mutate: deleteMutateMock,
  }),
}))

describe('ExpenseDetailPage lifecycle actions', () => {
  beforeEach(() => {
    pushMock.mockClear()
    backMock.mockClear()
    deleteMutateMock.mockClear()
    confirmMock.mockReset()
    confirmMock.mockReturnValue(true)
    expenseDetailState.isLoading = false
    expenseDetailState.error = null
    vi.stubGlobal('confirm', confirmMock)
  })

  it('renders edit and delete actions for an owned expense', async () => {
    const user = userEvent.setup()

    render(<ExpenseDetailPage />)

    await user.click(screen.getByRole('button', { name: 'Chỉnh sửa' }))

    expect(pushMock).toHaveBeenCalledWith('/expenses/expense-1/edit')

    await user.click(screen.getByRole('button', { name: 'Xoá khoản chi' }))

    expect(deleteMutateMock).toHaveBeenCalledWith(
      'expense-1',
      expect.any(Object),
    )
  })
})
