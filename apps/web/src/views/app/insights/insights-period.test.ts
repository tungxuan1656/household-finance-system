import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/i18n/t', () => ({ t: (key: string) => key }))

import {
  buildPeriodOptions,
  formatCurrency,
  getDefaultPeriod,
} from '@/views/app/insights/insights-period'

describe('insights-period', () => {
  it('formats currency values with locale formatting', () => {
    expect(formatCurrency(59000, 'VND')).toMatch(/59[,.]000/)
  })

  it('builds six descending month options from selected period', () => {
    expect(buildPeriodOptions('2026-05')).toEqual([
      { value: '2026-05', label: '2026-05' },
      { value: '2026-04', label: '2026-04' },
      { value: '2026-03', label: '2026-03' },
      { value: '2026-02', label: '2026-02' },
      { value: '2026-01', label: '2026-01' },
      { value: '2025-12', label: '2025-12' },
    ])
  })

  it('defaults to current UTC year-month', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-20T08:00:00.000Z'))

    expect(getDefaultPeriod()).toBe('2026-05')

    vi.useRealTimers()
  })
})
