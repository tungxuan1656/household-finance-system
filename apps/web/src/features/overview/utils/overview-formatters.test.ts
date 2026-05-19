import { describe, expect, it, vi } from 'vitest'

import {
  formatPeriodLabel,
  getCurrentPeriod,
} from '@/features/overview/utils/overview-formatters'

vi.mock('@/lib/i18n/t', () => ({
  t: (key: string, params?: Record<string, string>) =>
    params ? `${key}:${params.month ?? ''}:${params.year ?? ''}` : key,
}))

describe('overview-formatters', () => {
  it('formats period label from yyyy-mm period', () => {
    expect(formatPeriodLabel('2026-05')).toBe(
      'app.overview.summary.period:05:2026',
    )
  })

  it('returns the current utc year-month period', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-20T08:00:00.000Z'))

    expect(getCurrentPeriod()).toBe('2026-05')

    vi.useRealTimers()
  })
})
