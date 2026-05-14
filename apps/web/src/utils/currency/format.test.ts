import { describe, expect, it } from 'vitest'

import { formatCurrency, toMajorUnits } from '@/utils/currency/format'

describe('currency/format', () => {
  it('formats minor units using currency fraction digits', () => {
    const expected = new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'USD',
    }).format(12.34)

    expect(formatCurrency(1234, 'USD')).toBe(expected)
  })

  it('converts minor units to major units', () => {
    expect(toMajorUnits(1234, 'USD')).toBeCloseTo(12.34)
    expect(toMajorUnits(1234, 'JPY')).toBe(1234)
  })

  it('keeps zero-decimal currencies in minor units', () => {
    expect(formatCurrency(1234, 'JPY')).toBe(
      new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'JPY',
      }).format(1234),
    )
  })

  it('converts three-decimal currencies from minor units before formatting', () => {
    expect(formatCurrency(1234, 'BHD')).toBe(
      new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'BHD',
      }).format(1.234),
    )
  })
})
