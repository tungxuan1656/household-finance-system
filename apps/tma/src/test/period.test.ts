import { afterEach, describe, expect, it, vi } from 'vitest'

import { getCurrentPeriod } from '@/lib/period'

describe('getCurrentPeriod', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns the current UTC year-month in YYYY-MM format', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-15T23:45:00Z'))

    expect(getCurrentPeriod()).toBe('2026-06')
  })
})
