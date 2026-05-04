import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { QuickAddExpenseTrigger } from '@/components/expense/quick-add-expense-trigger'

const { dialogRenderMock } = vi.hoisted(() => ({
  dialogRenderMock: vi.fn(),
}))

vi.mock('@/lib/i18n/t', () => ({
  t: (key: string) => key,
}))

vi.mock('@/components/expense/quick-add-expense-dialog', () => ({
  QuickAddExpenseDialog: ({
    open,
    onOpenChange,
  }: {
    open: boolean
    onOpenChange: (open: boolean) => void
  }) => {
    dialogRenderMock(open)

    return open ? (
      <div aria-modal='true' role='dialog'>
        <button type='button' onClick={() => onOpenChange(false)}>
          Close quick add
        </button>
      </div>
    ) : null
  },
}))

describe('QuickAddExpenseTrigger', () => {
  beforeEach(() => {
    window.localStorage.clear()
    dialogRenderMock.mockReset()
  })

  it('opens from button click and from keyboard shortcut outside editable targets', async () => {
    const user = userEvent.setup()

    render(
      <div>
        <QuickAddExpenseTrigger />
        <input aria-label='editable-input' />
      </div>,
    )

    expect(
      screen.getByRole('button', { name: 'expense.quickAdd.headerOpen' }),
    ).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: 'expense.quickAdd.open' }),
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Close quick add' }))

    await user.keyboard('q')
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Close quick add' }))
    await user.click(screen.getByLabelText('editable-input'))
    await user.keyboard('q')

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('opens from header trigger click', async () => {
    const user = userEvent.setup()

    render(<QuickAddExpenseTrigger />)

    await user.click(
      screen.getByRole('button', { name: 'expense.quickAdd.headerOpen' }),
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('does not re-open when shortcut fires while dialog is already open', async () => {
    const user = userEvent.setup()

    render(<QuickAddExpenseTrigger />)

    await user.keyboard('q')
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    dialogRenderMock.mockClear()
    await user.keyboard('q')

    expect(dialogRenderMock).not.toHaveBeenCalledWith(true)
  })
})
