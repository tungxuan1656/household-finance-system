import { describe, expect, it } from 'vitest'

import {
  formatDialogAmountDisplay,
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
})
