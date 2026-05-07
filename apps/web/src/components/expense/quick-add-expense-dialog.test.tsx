import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ApiClientError } from '@/api/client'
import { QuickAddExpenseDialog } from '@/components/expense/quick-add-expense-dialog'

const {
  createMutateMock,
  deleteMutateMock,
  updateProfileMutateMock,
  toastSuccessMock,
  toastErrorMock,
  quickAddMetricSpy,
} = vi.hoisted(() => ({
  createMutateMock: vi.fn(),
  deleteMutateMock: vi.fn(),
  updateProfileMutateMock: vi.fn(),
  toastSuccessMock: vi.fn(),
  toastErrorMock: vi.fn(),
  quickAddMetricSpy: vi.fn(),
}))

let currentProfile = {
  id: 'user-1',
  displayName: 'Owner',
  email: 'owner@example.com',
  avatarUrl: null,
  quickAddLastSourceKey: null as 'cash' | 'bank-transfer' | null,
  createdAt: 1,
}

let recentExpenses = [] as Array<{
  id: string
  amountMinor: number
  currencyCode: string
  categoryKey: 'food'
  sourceKey: 'cash' | 'bank-transfer'
  title: string
  occurredAt: number
  note: string | null
  visibility: 'private' | 'household'
  householdId: string | null
  payerUserId: string | null
  createdByUserId: string
  createdAt: number
  updatedAt: number
}>

vi.mock('sonner', () => ({
  toast: { success: toastSuccessMock, error: toastErrorMock },
}))

vi.mock('@/lib/i18n/t', () => ({
  t: (key: string) => key,
}))

vi.mock('@/hooks/api/use-profile', () => ({
  useCurrentUserProfileQuery: () => ({
    data: currentProfile,
  }),
  useUpdateCurrentUserProfileMutation: () => ({
    isPending: false,
    mutate: updateProfileMutateMock,
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
  useRecentQuickAddExpensesQuery: () => ({
    data: {
      items: recentExpenses,
      nextCursor: null,
    },
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
        {
          id: 'household-2',
          name: 'Friends',
          slug: 'friends',
          defaultCurrencyCode: 'VND',
          timezone: 'Asia/Ho_Chi_Minh',
          defaultVisibility: 'household',
          role: 'member',
          createdAt: Date.now(),
        },
      ],
    },
  }),
  useHouseholdMembersQuery: (householdId?: string) => ({
    data:
      householdId === 'household-2'
        ? {
            items: [{ userId: 'user-2', name: 'Friend', role: 'member' }],
          }
        : {
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

vi.mock('@/hooks/api/use-groups', () => ({
  useExpenseGroupListQuery: (householdId?: string) => ({
    data:
      householdId === 'household-1'
        ? {
            items: [
              {
                id: 'group-1',
                name: 'Trip',
                description: 'Trip fund',
                status: 'active',
                startDate: Date.now(),
                endDate: Date.now(),
                eventBudgetMinor: null,
                totalSpendMinor: 0,
                householdId: 'household-1',
                createdByUserId: 'user-1',
                createdAt: Date.now(),
                updatedAt: Date.now(),
              },
            ],
          }
        : { items: [] },
  }),
}))

vi.mock('@/lib/metrics/quick-add-metrics', () => ({
  reportQuickAddTiming: quickAddMetricSpy,
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
    updateProfileMutateMock.mockReset()

    updateProfileMutateMock.mockImplementation((_payload, options) => {
      options?.onSettled?.()
    })

    toastSuccessMock.mockReset()
    toastErrorMock.mockReset()
    quickAddMetricSpy.mockReset()

    currentProfile = {
      id: 'user-1',
      displayName: 'Owner',
      email: 'owner@example.com',
      avatarUrl: null,
      quickAddLastSourceKey: null,
      createdAt: 1,
    }

    recentExpenses = []
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

  it('shows note and group fields for household quick add', async () => {
    const user = userEvent.setup()

    render(<QuickAddExpenseDialog open onOpenChange={vi.fn()} />)

    await user.click(
      screen.getByRole('switch', { name: 'expense.visibilityLabel' }),
    )

    await user.selectOptions(
      screen.getByLabelText('expense.selectHousehold'),
      'household-1',
    )

    expect(screen.getByLabelText('expense.note')).toBeInTheDocument()

    expect(
      screen.getByLabelText('expense.groupPicker.ariaLabel'),
    ).toBeInTheDocument()
  })

  it('resets stale payer selection when household changes', async () => {
    const user = userEvent.setup()

    render(<QuickAddExpenseDialog open onOpenChange={vi.fn()} />)

    await user.type(screen.getByLabelText('expense.amount'), '75000')
    await user.selectOptions(screen.getByLabelText('quick-add-source'), 'cash')

    await user.selectOptions(
      screen.getByLabelText('quick-add-category'),
      'food',
    )

    await user.click(
      screen.getByRole('switch', { name: 'expense.visibilityLabel' }),
    )

    const householdSelect = screen.getByLabelText('expense.selectHousehold')
    await user.selectOptions(householdSelect, 'household-1')

    const payerSelect = screen.getByLabelText('expense.payer')
    await user.selectOptions(payerSelect, 'user-1')

    await user.selectOptions(householdSelect, 'household-2')

    await waitFor(() => {
      expect(screen.getByLabelText('expense.payer')).toHaveValue('user-2')
    })

    await user.click(
      screen.getByRole('button', { name: 'expense.quickAdd.submit' }),
    )

    expect(createMutateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        householdId: 'household-2',
        payerUserId: 'user-2',
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

  it('reports quick-add timing on successful create', async () => {
    const user = userEvent.setup()

    vi.spyOn(performance, 'now')
      .mockReturnValueOnce(100)
      .mockReturnValueOnce(1600)

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

    expect(quickAddMetricSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        visibility: 'private',
        wasHousehold: false,
      }),
    )

    expect(quickAddMetricSpy.mock.calls[0]?.[0].durationMs).toBeGreaterThan(0)
  })

  it('reports household visibility in quick-add timing on shared success', async () => {
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
      screen.getByRole('switch', { name: 'expense.visibilityLabel' }),
    )

    await user.selectOptions(
      screen.getByLabelText('expense.selectHousehold'),
      'household-1',
    )

    await user.click(
      screen.getByRole('button', { name: 'expense.quickAdd.submit' }),
    )

    expect(quickAddMetricSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        visibility: 'household',
        wasHousehold: true,
      }),
    )
  })

  it('keeps dialog open and shows retry guidance on network failure', async () => {
    const user = userEvent.setup()

    createMutateMock.mockImplementation((_payload, options) => {
      options.onError(
        new ApiClientError({
          code: 'NETWORK_ERROR',
          message: 'Network request failed.',
          status: 0,
        }),
      )
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

    expect(screen.getByRole('dialog')).toBeInTheDocument()

    expect(
      screen.getByText('expense.quickAdd.networkError'),
    ).toBeInTheDocument()

    expect(screen.getByText('expense.quickAdd.retryHint')).toBeInTheDocument()
  })

  it('offers save-as-private fallback on household permission error', async () => {
    const user = userEvent.setup()

    createMutateMock.mockImplementation((payload, options) => {
      if (payload.visibility === 'household') {
        options.onError(
          new ApiClientError({
            code: 'FORBIDDEN',
            message: 'Forbidden',
            status: 403,
          }),
        )

        return
      }

      options.onSuccess({ id: 'expense-1' })
    })

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

    expect(
      screen.getByText('expense.quickAdd.permissionError'),
    ).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: 'expense.quickAdd.saveAsPrivate' }),
    )

    expect(createMutateMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        visibility: 'private',
        householdId: undefined,
      }),
      expect.any(Object),
    )
  })

  it('restores the last used source from profile preference', () => {
    currentProfile.quickAddLastSourceKey = 'bank-transfer'

    window.sessionStorage.setItem('expense-quick-add-last-source', 'cash')

    render(<QuickAddExpenseDialog open onOpenChange={vi.fn()} />)

    expect(screen.getByLabelText('quick-add-source')).toHaveValue(
      'bank-transfer',
    )
  })

  it('persists the last used source to profile after create success', async () => {
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

    expect(updateProfileMutateMock).toHaveBeenCalledWith(
      {
        quickAddLastSourceKey: 'cash',
      },
      expect.any(Object),
    )
  })

  it('prefills category from most recent expense with matching source', () => {
    recentExpenses = [
      {
        id: 'expense-1',
        amountMinor: 10000,
        categoryKey: 'food',
        createdAt: 10,
        createdByUserId: 'user-1',
        currencyCode: 'VND',
        householdId: null,
        note: null,
        occurredAt: 10,
        payerUserId: null,
        sourceKey: 'bank-transfer',
        title: 'Lunch',
        updatedAt: 10,
        visibility: 'private',
      },
    ]

    currentProfile.quickAddLastSourceKey = 'bank-transfer'

    render(<QuickAddExpenseDialog open onOpenChange={vi.fn()} />)

    expect(screen.getByLabelText('quick-add-category')).toHaveValue('food')
  })

  it('updates category heuristic when source changes and category is empty', async () => {
    const user = userEvent.setup()

    recentExpenses = [
      {
        id: 'expense-1',
        amountMinor: 10000,
        categoryKey: 'food',
        createdAt: 20,
        createdByUserId: 'user-1',
        currencyCode: 'VND',
        householdId: null,
        note: null,
        occurredAt: 20,
        payerUserId: null,
        sourceKey: 'cash',
        title: 'Lunch',
        updatedAt: 20,
        visibility: 'private',
      },
      {
        id: 'expense-2',
        amountMinor: 20000,
        categoryKey: 'food',
        createdAt: 10,
        createdByUserId: 'user-1',
        currencyCode: 'VND',
        householdId: null,
        note: null,
        occurredAt: 10,
        payerUserId: null,
        sourceKey: 'bank-transfer',
        title: 'Dinner',
        updatedAt: 10,
        visibility: 'private',
      },
    ]

    render(<QuickAddExpenseDialog open onOpenChange={vi.fn()} />)

    const categorySelect = screen.getByLabelText('quick-add-category')
    await user.selectOptions(categorySelect, '')
    await user.selectOptions(screen.getByLabelText('quick-add-source'), 'cash')

    expect(categorySelect).toHaveValue('food')
  })

  it('keeps smart defaults after successful submit reset', async () => {
    const user = userEvent.setup()

    currentProfile.quickAddLastSourceKey = 'bank-transfer'

    recentExpenses = [
      {
        id: 'expense-1',
        amountMinor: 10000,
        categoryKey: 'food',
        createdAt: 10,
        createdByUserId: 'user-1',
        currencyCode: 'VND',
        householdId: null,
        note: null,
        occurredAt: 10,
        payerUserId: null,
        sourceKey: 'bank-transfer',
        title: 'Lunch',
        updatedAt: 10,
        visibility: 'private',
      },
    ]

    createMutateMock.mockImplementation((_payload, options) => {
      options.onSuccess({ id: 'expense-1' })
    })

    render(<QuickAddExpenseDialog open onOpenChange={vi.fn()} />)

    await user.type(screen.getByLabelText('expense.amount'), '10000')

    await user.click(
      screen.getByRole('button', { name: 'expense.quickAdd.submit' }),
    )

    expect(screen.getByLabelText('quick-add-source')).toHaveValue(
      'bank-transfer',
    )

    expect(screen.getByLabelText('quick-add-category')).toHaveValue('food')
  })
})
