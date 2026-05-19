import { describe, expect, it } from 'vitest'

import {
  formatDialogAmountDisplay,
  parseDialogAmountRawFromStoredMinor,
  parseDialogAmountSubmitMinor,
} from '@/components/expense/dialog-amount-helper'

describe('dialog amount helper', () => {
  it('formats raw digit input into display and canonical submit amount', () => {
    expect(formatDialogAmountDisplay('3')).toBe('3.000 đ')
    expect(parseDialogAmountSubmitMinor('3')).toBe(3000)
  })

  it('handles empty input as blank display and no submit amount', () => {
    expect(formatDialogAmountDisplay('')).toBe('')
    expect(parseDialogAmountSubmitMinor('')).toBeNull()
  })

  it('supports multi digit input', () => {
    expect(formatDialogAmountDisplay('1234')).toBe('1.234.000 đ')
    expect(parseDialogAmountSubmitMinor('1234')).toBe(1234000)
  })

  it('maps stored minor amount back to raw input for edit', () => {
    expect(parseDialogAmountRawFromStoredMinor(12000)).toBe('12')
    expect(parseDialogAmountRawFromStoredMinor(1234000)).toBe('1234')
  })

  it('returns empty raw input for invalid stored amount', () => {
    expect(parseDialogAmountRawFromStoredMinor(0)).toBe('')
    expect(parseDialogAmountRawFromStoredMinor(-1000)).toBe('')
    expect(parseDialogAmountRawFromStoredMinor(Number.NaN)).toBe('')
  })
})
