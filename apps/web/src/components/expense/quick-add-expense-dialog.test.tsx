import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { QuickAddExpenseDialog } from '@/components/expense/quick-add-expense-dialog'

const { createMutateMock, deleteMutateMock, toastSuccessMock, toastErrorMock } =
  vi.hoisted(() => ({
    createMutateMock: vi.fn(),
    deleteMutateMock: vi.fn(),
    toastSuccessMock: vi.fn(),
    toastErrorMock: vi.fn(),
  }))

vi.mock('sonner', () => ({
  toast: { success: toastSuccessMock, error: toastErrorMock },
}))

vi.mock('@/lib/i18n/t', () => ({
  t: (key: string) => key,
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

vi.mock('@/hooks/api/use-expense', () => ({
  useCreateExpenseMutation: () => ({
    isPending: false,
    mutate: createMutateMock,
  }),
  useDeleteExpenseMutation: () => ({
    isPending: false,
    mutate: deleteMutateMock,
  }),
  useUpdateExpenseMutation: () => ({
    isPending: false,
    mutate: vi.fn(),
  }),
}))

vi.mock('@/hooks/api/use-households', () => ({
  useHouseholdsQuery: () => ({
    data: {
      items: [
        {
          id: 'household-1',
          name: 'Family',
          slug: 'family',
          defaultCurrencyCode: 'VND',
          timezone: 'Asia/Ho_Chi_Minh',
          defaultVisibility: 'household',
          role: 'admin',
          createdAt: Date.now(),
        },
      ],
    },
  }),
  useHouseholdMembersQuery: () => ({
    data: {
      items: [{ userId: 'user-1', name: 'Owner', role: 'admin' }],
    },
  }),
}))

vi.mock('@/hooks/api/use-reference-data', () => ({
  useReferenceCategoriesQuery: () => ({
    data: {
      items: [
        {
          key: 'food',
          kind: 'expense',
          iconUrl: '/food.svg',
          color: '#f97316',
        },
      ],
    },
  }),
}))

vi.mock('@/components/expense/category-picker', () => ({
  CategoryPicker: ({
    id,
    value,
    onValueChange,
  }: {
    id: string
    value?: string
    onValueChange: (value: string) => void
  }) => (
    <select
      aria-label='quick-add-category'
      id={id}
      value={value ?? ''}
      onChange={(event) => onValueChange(event.target.value)}>
      <option value=''>Select category</option>
      <option value='food'>Food</option>
    </select>
  ),
}))

vi.mock('@/components/expense/source-picker', () => ({
  SourcePicker: ({
    id,
    value,
    onValueChange,
  }: {
    id: string
    value?: string
    onValueChange: (value: string) => void
  }) => (
    <select
      aria-label='quick-add-source'
      id={id}
      value={value ?? ''}
      onChange={(event) => onValueChange(event.target.value)}>
      <option value=''>Select source</option>
      <option value='cash'>Cash</option>
      <option value='bank-transfer'>Bank transfer</option>
    </select>
  ),
}))

describe('QuickAddExpenseDialog', () => {
  beforeEach(() => {
    createMutateMock.mockReset()
    deleteMutateMock.mockReset()
    toastSuccessMock.mockReset()
    toastErrorMock.mockReset()
    window.localStorage.clear()
    window.sessionStorage.clear()
  })

  it('focuses amount on open and submits a private expense with defaults', async () => {
    const user = userEvent.setup()

    render(<QuickAddExpenseDialog open onOpenChange={vi.fn()} />)

    const amountInput = screen.getByLabelText('expense.amount')
    expect(amountInput).toHaveFocus()

    await user.type(amountInput, '125000')
    await user.selectOptions(screen.getByLabelText('quick-add-source'), 'cash')

    await user.selectOptions(
      screen.getByLabelText('quick-add-category'),
      'food',
    )

    await user.click(
      screen.getByRole('button', { name: 'expense.quickAdd.submit' }),
    )

    expect(createMutateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 125000,
        sourceKey: 'cash',
        categoryKey: 'food',
        title: 'app.expenseReference.categories.food',
        visibility: 'private',
        occurredAt: expect.any(Number),
      }),
      expect.any(Object),
    )
  })

  it('requires an explicit household when switched to household visibility', async () => {
    const user = userEvent.setup()

    render(<QuickAddExpenseDialog open onOpenChange={vi.fn()} />)

    await user.type(screen.getByLabelText('expense.amount'), '50000')
    await user.selectOptions(screen.getByLabelText('quick-add-source'), 'cash')

    await user.selectOptions(
      screen.getByLabelText('quick-add-category'),
      'food',
    )

    await user.click(
      screen.getByRole('switch', { name: 'expense.visibilityLabel' }),
    )

    const householdSelect = await screen.findByLabelText(
      'expense.selectHousehold',
    )

    await user.click(
      screen.getByRole('button', { name: 'expense.quickAdd.submit' }),
    )

    await waitFor(() => {
      expect(householdSelect).toHaveAttribute('aria-invalid', 'true')
    })

    expect(createMutateMock).not.toHaveBeenCalled()
  })

  it('defaults household payer to the current user when shared', async () => {
    const user = userEvent.setup()

    render(<QuickAddExpenseDialog open onOpenChange={vi.fn()} />)

    await user.type(screen.getByLabelText('expense.amount'), '50000')
    await user.selectOptions(screen.getByLabelText('quick-add-source'), 'cash')

    await user.selectOptions(
      screen.getByLabelText('quick-add-category'),
      'food',
    )

    await user.click(
      screen.getByRole('switch', { name: 'expense.visibilityLabel' }),
    )

    await user.selectOptions(
      screen.getByLabelText('expense.selectHousehold'),
      'household-1',
    )

    await user.click(
      screen.getByRole('button', { name: 'expense.quickAdd.submit' }),
    )

    expect(createMutateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        householdId: 'household-1',
        payerUserId: 'user-1',
        visibility: 'household',
      }),
      expect.any(Object),
    )
  })

  it('offers undo after create success and deletes the created expense', async () => {
    const user = userEvent.setup()

    createMutateMock.mockImplementation((_payload, options) => {
      options.onSuccess({ id: 'expense-1' })
    })

    render(<QuickAddExpenseDialog open onOpenChange={vi.fn()} />)

    await user.type(screen.getByLabelText('expense.amount'), '10000')
    await user.selectOptions(screen.getByLabelText('quick-add-source'), 'cash')

    await user.selectOptions(
      screen.getByLabelText('quick-add-category'),
      'food',
    )

    await user.click(
      screen.getByRole('button', { name: 'expense.quickAdd.submit' }),
    )

    expect(toastSuccessMock).toHaveBeenCalledWith(
      'expense.quickAdd.success',
      expect.objectContaining({
        action: expect.objectContaining({
          label: 'expense.quickAdd.undo',
          onClick: expect.any(Function),
        }),
        duration: 5000,
      }),
    )

    const toastConfig = toastSuccessMock.mock.calls[0]?.[1]
    toastConfig.action.onClick()

    await waitFor(() => {
      expect(deleteMutateMock).toHaveBeenCalledWith(
        'expense-1',
        expect.objectContaining({ onError: expect.any(Function) }),
      )
    })
  })

  it('restores the last used source from session storage only', () => {
    window.sessionStorage.setItem(
      'expense-quick-add-last-source',
      'bank-transfer',
    )

    render(<QuickAddExpenseDialog open onOpenChange={vi.fn()} />)

    expect(screen.getByLabelText('quick-add-source')).toHaveValue(
      'bank-transfer',
    )
  })
})
