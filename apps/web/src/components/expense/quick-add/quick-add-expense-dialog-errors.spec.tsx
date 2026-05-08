import './quick-add-expense-dialog.test-setup'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { vi } from 'vitest'

import { ApiClientError } from '@/api/client'
import { QuickAddExpenseDialog } from '@/components/expense/quick-add-expense-dialog'

import {
  createMutateMock,
  resetQuickAddDialogTestState,
} from './quick-add-expense-dialog.test-setup'

describe('QuickAddExpenseDialog error flow', () => {
  beforeEach(() => {
    resetQuickAddDialogTestState()
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
