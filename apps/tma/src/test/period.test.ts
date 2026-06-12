import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  createCurrentMonthPeriodSelection,
  createCustomPeriodSelection,
  createMonthPeriodSelection,
  createReportingPeriodPresetSelection,
  createWeekPeriodSelection,
  createYearPeriodSelection,
  formatPeriodDateInputValue,
  formatPeriodSelectionDate,
  formatPeriodSelectionLabel,
  formatPeriodSelectionRangeLabel,
  getCurrentPeriod,
  getReportingPeriodPresetLabel,
  parsePeriodDateInputValue,
  REPORTING_PERIOD_PRESETS,
} from '@/lib/period'

const vietnamTimestamp = (
  year: number,
  monthIndex: number,
  day: number,
): number => Date.UTC(year, monthIndex, day) - 7 * 60 * 60 * 1000

describe('getCurrentPeriod', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns the current Vietnam year-month in YYYY-MM format', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-30T18:30:00Z'))

    expect(getCurrentPeriod()).toBe('2026-07')
  })

  it('creates the current month selection using Vietnam day boundaries', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-30T18:30:00Z'))

    expect(createCurrentMonthPeriodSelection()).toEqual({
      granularity: 'month',
      dateFrom: vietnamTimestamp(2026, 6, 1),
      dateTo: vietnamTimestamp(2026, 7, 1),
    })
  })

  it('defaults reporting period to this month', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-30T18:30:00Z'))

    expect(createReportingPeriodPresetSelection('thisMonth')).toEqual({
      granularity: 'month',
      dateFrom: vietnamTimestamp(2026, 6, 1),
      dateTo: vietnamTimestamp(2026, 7, 1),
    })

    expect(
      formatPeriodSelectionLabel(createCurrentMonthPeriodSelection()),
    ).toBe('Tháng này')
  })

  it('creates all requested reporting presets as date ranges', () => {
    const now = new Date('2026-06-15T12:00:00Z')

    expect(createReportingPeriodPresetSelection('lastMonth', now)).toEqual({
      granularity: 'month',
      dateFrom: vietnamTimestamp(2026, 4, 1),
      dateTo: vietnamTimestamp(2026, 5, 1),
    })

    expect(createReportingPeriodPresetSelection('thisWeek', now)).toEqual({
      granularity: 'week',
      dateFrom: vietnamTimestamp(2026, 5, 15),
      dateTo: vietnamTimestamp(2026, 5, 22),
    })

    expect(createReportingPeriodPresetSelection('lastWeek', now)).toEqual({
      granularity: 'week',
      dateFrom: vietnamTimestamp(2026, 5, 8),
      dateTo: vietnamTimestamp(2026, 5, 15),
    })

    expect(createReportingPeriodPresetSelection('thisYear', now)).toEqual({
      granularity: 'year',
      dateFrom: vietnamTimestamp(2026, 0, 1),
      dateTo: vietnamTimestamp(2027, 0, 1),
    })

    expect(createReportingPeriodPresetSelection('lastYear', now)).toEqual({
      granularity: 'year',
      dateFrom: vietnamTimestamp(2025, 0, 1),
      dateTo: vietnamTimestamp(2026, 0, 1),
    })
  })

  it('exposes requested reporting preset labels in display order', () => {
    expect(
      REPORTING_PERIOD_PRESETS.map((preset) =>
        getReportingPeriodPresetLabel(preset),
      ),
    ).toEqual([
      'Tháng này',
      'Tháng trước',
      'Tuần này',
      'Tuần trước',
      'Năm nay',
      'Năm ngoái',
    ])
  })

  it('formats custom ranges for chip and date inputs', () => {
    const selection = createCustomPeriodSelection(
      Date.UTC(2026, 5, 2, 20),
      Date.UTC(2026, 5, 11, 15),
    )

    expect(selection).toEqual({
      granularity: 'custom',
      dateFrom: vietnamTimestamp(2026, 5, 3),
      dateTo: vietnamTimestamp(2026, 5, 12),
    })

    expect(formatPeriodSelectionLabel(selection)).toBe('03/06 -> 11/06')

    expect(formatPeriodSelectionRangeLabel(selection)).toBe(
      '03/06/26 -> 11/06/26',
    )

    expect(formatPeriodDateInputValue(selection.dateFrom)).toBe('2026-06-03')

    expect(parsePeriodDateInputValue('2026-06-03')).toBe(
      vietnamTimestamp(2026, 5, 3),
    )
  })

  it('formats a week selection as dd/MM-dd/MM', () => {
    expect(formatPeriodSelectionLabel(createWeekPeriodSelection(2026, 1))).toBe(
      '29/12 -> 04/01',
    )
  })

  it('formats a month selection as MM/yy', () => {
    expect(
      formatPeriodSelectionLabel(createMonthPeriodSelection(2026, 1)),
    ).toBe('01/26')
  })

  it('formats a current year selection as the relative preset label', () => {
    expect(formatPeriodSelectionLabel(createYearPeriodSelection(2026))).toBe(
      'Năm nay',
    )
  })

  it('formats picker dates as dd/MM/yy', () => {
    expect(formatPeriodSelectionDate(vietnamTimestamp(2026, 0, 4))).toBe(
      '04/01/26',
    )
  })

  it('formats picker week ranges with full dates', () => {
    expect(
      formatPeriodSelectionRangeLabel(createWeekPeriodSelection(2026, 1)),
    ).toBe('29/12/25 -> 04/01/26')
  })

  it('uses Vietnam local week boundaries near UTC day rollover', () => {
    const now = new Date('2026-06-14T18:30:00Z')

    expect(createReportingPeriodPresetSelection('thisWeek', now)).toEqual({
      granularity: 'week',
      dateFrom: vietnamTimestamp(2026, 5, 15),
      dateTo: vietnamTimestamp(2026, 5, 22),
    })
  })
})
