import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { vi } from 'vitest'

import { ApiClientError } from '@/api/client'
import { QuickAddExpenseDialog } from '@/components/expense/quick-add-expense-dialog'

import {
  createMutateMock,
  resetQuickAddDialogTestState,
} from './quick-add-expense-dialog.test-setup'

describe('QuickAddExpenseDialog flow', () => {
  beforeEach(() => {
    resetQuickAddDialogTestState()
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
})
