import { describe, expect, it } from 'vitest'

import {
  formatDialogAmountDisplay,
  parseDialogAmountRawFromStoredMinor,
  parseDialogAmountSubmitMinor,
} from '@/components/expense/dialog-amount-helper'

describe('dialog amount helper', () => {
  it('keeps small raw input unchanged while preserving canonical submit amount', () => {
    expect(formatDialogAmountDisplay('3')).toBe('3')
    expect(parseDialogAmountSubmitMinor('3')).toBe(3000)
  })

  it('handles empty input as blank display and no submit amount', () => {
    expect(formatDialogAmountDisplay('')).toBe('')
    expect(parseDialogAmountSubmitMinor('')).toBeNull()
  })

  it('formats grouped thousands without adding currency display text', () => {
    expect(formatDialogAmountDisplay('1000')).toBe('1.000')
    expect(parseDialogAmountSubmitMinor('1000')).toBe(1000000)

    expect(formatDialogAmountDisplay('1234')).toBe('1.234')
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
