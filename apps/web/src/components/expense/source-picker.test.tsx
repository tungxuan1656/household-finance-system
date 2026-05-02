import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { SourcePicker } from '@/components/expense/source-picker'
import { t } from '@/lib/i18n/t'

describe('SourcePicker', () => {
  it('renders canonical source options in order', () => {
    render(<SourcePicker value='cash' onValueChange={vi.fn()} />)

    const options = screen.getAllByRole('option')

    expect(options.map((option) => option.getAttribute('value'))).toEqual([
      '',
      'cash',
      'bank-transfer',
      'card',
      'e-wallet',
      'other',
    ])
  })

  it('maps labels from i18n and forwards selection changes', () => {
    const onValueChange = vi.fn()

    render(<SourcePicker value='cash' onValueChange={onValueChange} />)

    const select = screen.getByRole('combobox', {
      name: t('app.expenseReference.sourcePicker.ariaLabel'),
    })
    fireEvent.change(select, { target: { value: 'card' } })

    expect(onValueChange).toHaveBeenCalledWith('card')

    expect(
      screen.getByRole('option', {
        name: t('app.expenseReference.sources.card'),
      }),
    ).toBeInTheDocument()
  })
})
