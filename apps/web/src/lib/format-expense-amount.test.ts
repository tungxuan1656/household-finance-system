import { describe, expect, it } from 'vitest'

import { formatExpenseAmount } from '@/lib/format-expense-amount'

describe('formatExpenseAmount', () => {
  it('keeps zero-decimal currencies in minor units', () => {
    expect(formatExpenseAmount(1234, 'JPY')).toBe(
      new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'JPY',
      }).format(1234),
    )
  })

  it('converts two-decimal currencies from minor units before formatting', () => {
    expect(formatExpenseAmount(1234, 'USD')).toBe(
      new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'USD',
      }).format(12.34),
    )
  })

  it('converts three-decimal currencies from minor units before formatting', () => {
    expect(formatExpenseAmount(1234, 'BHD')).toBe(
      new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'BHD',
      }).format(1.234),
    )
  })
})
