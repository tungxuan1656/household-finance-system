import { describe, expect, it } from 'vitest'

import { analyticsOverviewQuerySchema } from '@/contracts'

describe('analytics overview query schema', () => {
  it('parses valid monthly period with optional household', () => {
    const parsed = analyticsOverviewQuerySchema().safeParse({
      period: '2026-05',
      household_id: 'hh_123',
    })

    expect(parsed.success).toBe(true)
    if (parsed.success) {
      expect(parsed.data.period).toBe('2026-05')
      expect(parsed.data.household_id).toBe('hh_123')
    }
  })

  it('rejects malformed period strings', () => {
    const parsed = analyticsOverviewQuerySchema().safeParse({
      period: '2026-5',
    })

    expect(parsed.success).toBe(false)
  })

  it('rejects impossible month values', () => {
    const parsed = analyticsOverviewQuerySchema().safeParse({
      period: '2026-13',
    })

    expect(parsed.success).toBe(false)
  })
})
