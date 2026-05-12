'use client'

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { HouseholdCreateDialog } from '@/components/household/household-create-dialog'
import { t } from '@/lib/i18n/t'

describe('HouseholdCreateDialog', () => {
  const onOpenChangeMock = vi.fn()

  beforeEach(() => {
    onOpenChangeMock.mockClear()
  })

  it('preserves the typed household name when submit returns false', async () => {
    const onSubmit = vi.fn(async () => false)

    render(
      <HouseholdCreateDialog
        isOpen
        isSubmitting={false}
        onOpenChange={onOpenChangeMock}
        onSubmit={onSubmit}
      />,
    )

    const input = screen.getByLabelText(
      t('app.households.fields.householdName.label'),
    )

    fireEvent.change(input, { target: { value: 'Gia đình thử nghiệm' } })
    fireEvent.submit(input.closest('form') as HTMLFormElement)

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({ name: 'Gia đình thử nghiệm' })
    })

    expect(input).toHaveValue('Gia đình thử nghiệm')
  })

  it('keeps the close button available and keeps the primary action last in a non-reversed footer', () => {
    render(
      <HouseholdCreateDialog
        isOpen
        isSubmitting={false}
        onOpenChange={onOpenChangeMock}
        onSubmit={vi.fn(async () => true)}
      />,
    )

    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument()

    const footer = screen
      .getByRole('button', { name: t('app.households.actions.create') })
      .closest('[data-slot="dialog-footer"]')

    const buttons = footer?.querySelectorAll('button')

    expect(footer).toHaveClass('flex-col')

    expect(footer).not.toHaveClass('flex-col-reverse')

    expect(buttons?.[buttons.length - 1]).toHaveTextContent(
      t('app.households.actions.create'),
    )
  })

  it('uses the dialog size prop instead of a shell width override class', () => {
    render(
      <HouseholdCreateDialog
        isOpen
        isSubmitting={false}
        onOpenChange={onOpenChangeMock}
        onSubmit={vi.fn(async () => true)}
      />,
    )

    const content = screen.getByRole('dialog')

    expect(content).toHaveAttribute('data-size', 'default')
    expect(content.className).toContain('sm:max-w-md')

    const shell = content.closest('[data-slot="dialog-content"]')

    expect(shell).toBe(content)
  })
})
