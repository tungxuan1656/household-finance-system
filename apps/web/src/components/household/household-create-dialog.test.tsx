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
})
