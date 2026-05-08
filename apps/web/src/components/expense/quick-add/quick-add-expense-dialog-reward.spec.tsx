import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { vi } from 'vitest'

import { QuickAddExpenseDialog } from '@/components/expense/quick-add-expense-dialog'

import {
  createMutateMock,
  deleteMutateMock,
  quickAddMetricSpy,
  resetQuickAddDialogTestState,
  toastSuccessMock,
  updateProfileMutateMock,
} from './quick-add-expense-dialog.test-setup'

describe('QuickAddExpenseDialog rewards and metrics', () => {
  beforeEach(() => {
    resetQuickAddDialogTestState()
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
      expect.objectContaining({ visibility: 'private', wasHousehold: false }),
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
      expect.objectContaining({ visibility: 'household', wasHousehold: true }),
    )
  })

  it('persists profile source after create success', async () => {
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
      { quickAddLastSourceKey: 'cash' },
      expect.any(Object),
    )
  })
})
