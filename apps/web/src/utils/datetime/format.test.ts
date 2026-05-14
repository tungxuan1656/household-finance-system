import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/i18n/t', () => ({ t: (key: string) => key }))

import { DATE_TIME_FORMATS } from '@/utils/datetime/constants'
import {
  formatDate,
  formatRelativeDate,
  getDaysRemaining,
} from '@/utils/datetime/format'

describe('datetime/format', () => {
  it('formats date and time variants via single formatDate function', () => {
    const baseDate = new Date(2026, 4, 14, 9, 8, 7)
    const timestamp = baseDate.getTime()

    expect(formatDate(timestamp, DATE_TIME_FORMATS.date)).toBe('14/05/2026')

    expect(formatDate(timestamp, DATE_TIME_FORMATS.dateTime)).toBe(
      '14/05/2026 09:08',
    )

    expect(formatDate(timestamp, DATE_TIME_FORMATS.monthYear)).toBe('05/2026')
    expect(formatDate(timestamp, DATE_TIME_FORMATS.time)).toBe('09:08')

    expect(formatDate(timestamp, DATE_TIME_FORMATS.timeSeconds)).toBe(
      '09:08:07',
    )

    expect(formatDate(timestamp, DATE_TIME_FORMATS.year)).toBe('2026')
  })

  it('returns null for null/undefined timestamp', () => {
    expect(formatDate(null, DATE_TIME_FORMATS.date)).toBeNull()
    expect(formatDate(undefined, DATE_TIME_FORMATS.date)).toBeNull()
  })

  it('formats relative dates with today and yesterday labels', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 4, 14, 12, 0, 0))

    const todaySec = new Date(2026, 4, 14, 9, 0, 0).getTime() / 1000
    const yesterdaySec = new Date(2026, 4, 13, 9, 0, 0).getTime() / 1000
    const olderSec = new Date(2026, 4, 10, 9, 0, 0).getTime() / 1000

    expect(formatRelativeDate(todaySec)).toBe(
      'app.overview.recentExpenses.today',
    )

    expect(formatRelativeDate(yesterdaySec)).toBe(
      'app.overview.recentExpenses.yesterday',
    )

    expect(formatRelativeDate(olderSec)).toBe(
      new Date(olderSec * 1000).toLocaleDateString('vi-VN', {
        month: 'short',
        day: 'numeric',
      }),
    )

    vi.useRealTimers()
  })

  it('counts remaining days in the current month', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 1, 10, 8, 0, 0))

    expect(getDaysRemaining()).toBe(19)

    vi.useRealTimers()
  })
})
