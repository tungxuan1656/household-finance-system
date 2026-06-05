import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  createCurrentMonthPeriodSelection,
  createMonthPeriodSelection,
  createWeekPeriodSelection,
  createYearPeriodSelection,
  formatPeriodSelectionDate,
  formatPeriodSelectionLabel,
  formatPeriodSelectionRangeLabel,
  getCurrentPeriod,
} from '@/lib/period'

describe('getCurrentPeriod', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns the current UTC year-month in YYYY-MM format', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-15T23:45:00Z'))

    expect(getCurrentPeriod()).toBe('2026-06')
  })

  it('creates the current month selection as a date range', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-15T23:45:00Z'))

    expect(createCurrentMonthPeriodSelection()).toEqual({
      granularity: 'month',
      dateFrom: Date.UTC(2026, 5, 1),
      dateTo: Date.UTC(2026, 6, 1),
    })
  })

  it('formats a week selection as dd/MM-dd/MM', () => {
    expect(formatPeriodSelectionLabel(createWeekPeriodSelection(2026, 1))).toBe(
      '29/12-04/01',
    )
  })

  it('formats a month selection as MM/yy', () => {
    expect(
      formatPeriodSelectionLabel(createMonthPeriodSelection(2026, 1)),
    ).toBe('01/26')
  })

  it('formats a year selection as yyyy', () => {
    expect(formatPeriodSelectionLabel(createYearPeriodSelection(2026))).toBe(
      '2026',
    )
  })

  it('formats picker dates as dd/MM/yy', () => {
    expect(formatPeriodSelectionDate(Date.UTC(2026, 0, 4))).toBe('04/01/26')
  })

  it('formats picker week ranges with full dates', () => {
    expect(
      formatPeriodSelectionRangeLabel(createWeekPeriodSelection(2026, 1)),
    ).toBe('29/12/25 - 04/01/26')
  })
})
