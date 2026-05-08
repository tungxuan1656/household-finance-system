import { describe, expect, it } from 'vitest'

import { calculateDeltaPercent } from '@/db/repositories/expense-analytics-repository'

describe('expense analytics repository helpers', () => {
  it('returns null when previous spend is zero and current spend increased', () => {
    expect(calculateDeltaPercent(100, 0)).toBeNull()
  })

  it('returns zero when both periods are zero', () => {
    expect(calculateDeltaPercent(0, 0)).toBe(0)
  })

  it('rounds percentage delta for non-zero previous spend', () => {
    expect(calculateDeltaPercent(150, 100)).toBe(50)
  })
})
