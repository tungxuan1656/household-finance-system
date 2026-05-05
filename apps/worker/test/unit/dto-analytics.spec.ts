import { describe, expect, it } from 'vitest'

import {
  analyticsComparisonQuerySchema,
  analyticsGroupsQuerySchema,
  analyticsOverviewQuerySchema,
} from '@/contracts'

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

describe('analytics comparison query schema', () => {
  it('parses valid monthly period with optional household', () => {
    const parsed = analyticsComparisonQuerySchema().safeParse({
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
    const parsed = analyticsComparisonQuerySchema().safeParse({
      period: '2026-5',
    })

    expect(parsed.success).toBe(false)
  })
})

describe('analytics groups query schema', () => {
  it('parses valid monthly period with optional household', () => {
    const parsed = analyticsGroupsQuerySchema().safeParse({
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
    const parsed = analyticsGroupsQuerySchema().safeParse({
      period: '2026-14',
    })

    expect(parsed.success).toBe(false)
  })
})
