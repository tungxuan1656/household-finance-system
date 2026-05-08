import './quick-add-expense-dialog.test-setup'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { vi } from 'vitest'

import { QuickAddExpenseDialog } from '@/components/expense/quick-add-expense-dialog'

import {
  createMutateMock,
  currentProfile,
  recentExpenses,
  resetQuickAddDialogTestState,
  updateProfileMutateMock,
} from './quick-add-expense-dialog.test-setup'

describe('QuickAddExpenseDialog persistence and defaults', () => {
  beforeEach(() => {
    resetQuickAddDialogTestState()
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
      { quickAddLastSourceKey: 'cash' },
      expect.any(Object),
    )
  })

  it('prefills category from most recent expense with matching source', () => {
    recentExpenses.push({
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
    })

    currentProfile.quickAddLastSourceKey = 'bank-transfer'

    render(<QuickAddExpenseDialog open onOpenChange={vi.fn()} />)

    expect(screen.getByLabelText('quick-add-category')).toHaveValue('food')
  })

  it('updates category heuristic when source changes and category is empty', async () => {
    const user = userEvent.setup()

    recentExpenses.push({
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
      sourceKey: 'bank-transfer',
      title: 'Lunch',
      updatedAt: 20,
      visibility: 'private',
    })

    render(<QuickAddExpenseDialog open onOpenChange={vi.fn()} />)

    const categorySelect = screen.getByLabelText('quick-add-category')
    await user.selectOptions(screen.getByLabelText('quick-add-source'), 'cash')

    expect(categorySelect).toHaveValue('food')
  })

  it('keeps smart defaults after successful submit reset', async () => {
    const user = userEvent.setup()

    currentProfile.quickAddLastSourceKey = 'bank-transfer'

    recentExpenses.push({
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
    })

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

  it('keeps typed values when async smart defaults arrive after open', async () => {
    const user = userEvent.setup()

    currentProfile.quickAddLastSourceKey = null

    const view = render(<QuickAddExpenseDialog open onOpenChange={vi.fn()} />)
    const amountInput = screen.getByLabelText('expense.amount')

    await user.type(amountInput, '125000')
    currentProfile.quickAddLastSourceKey = 'bank-transfer'

    recentExpenses.push({
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
    })

    view.rerender(<QuickAddExpenseDialog open onOpenChange={vi.fn()} />)

    expect(amountInput).toHaveValue(125000)
    expect(screen.getByLabelText('quick-add-source')).toHaveValue('')
  })

  it('does not repopulate category after user clears it', async () => {
    const user = userEvent.setup()

    recentExpenses.push({
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
    })

    render(<QuickAddExpenseDialog open onOpenChange={vi.fn()} />)

    const categorySelect = screen.getByLabelText('quick-add-category')
    expect(categorySelect).toHaveValue('food')

    await user.selectOptions(categorySelect, '')
    await user.selectOptions(screen.getByLabelText('quick-add-source'), 'cash')

    expect(categorySelect).toHaveValue('')
  })
})
