import { describe, expect, it } from 'vitest'

import { calculateDeltaPercent } from '@/db/repositories/expense-analytics-helpers'

describe('expense analytics helpers', () => {
  it('returns null when previous total is zero and current total is positive', () => {
    expect(calculateDeltaPercent(120, 0)).toBeNull()
  })

  it('returns zero when both totals are zero', () => {
    expect(calculateDeltaPercent(0, 0)).toBe(0)
  })

  it('rounds percent delta for non-zero previous totals', () => {
    expect(calculateDeltaPercent(150, 100)).toBe(50)
  })
})
