import { createReportingPeriodPresetSelection } from './selectors'
import type { PeriodSelection, ReportingPeriodPreset } from './types'
import { REPORTING_PERIOD_PRESETS } from './types'
import {
  createVietnamTimestamp,
  DAY_IN_MS,
  getIsoWeekYearStart,
  sameRange,
  toVietnamDate,
  toVietnamDateParts,
} from './vietnam-time'

export const getReportingPeriodPresetLabel = (
  preset: ReportingPeriodPreset,
  t: (key: string) => string,
): string => t(`period.${preset}`)

export const getMatchingReportingPeriodPreset = (
  selection: PeriodSelection,
  now: Date = new Date(),
): ReportingPeriodPreset | null =>
  REPORTING_PERIOD_PRESETS.find((preset) =>
    sameRange(selection, createReportingPeriodPresetSelection(preset, now)),
  ) ?? null

export const formatPeriodSelectionLabel = (
  selection: PeriodSelection,
  t: (key: string) => string,
): string => {
  const matchingPreset = getMatchingReportingPeriodPreset(selection)

  if (matchingPreset) {
    return getReportingPeriodPresetLabel(matchingPreset, t)
  }

  if (selection.granularity === 'custom') {
    const from = toVietnamDateParts(selection.dateFrom)
    const to = toVietnamDateParts(selection.dateTo - 1)

    return `${from.day}/${from.month} → ${to.day}/${to.month}`
  }

  if (selection.granularity === 'year') {
    return String(toVietnamDateParts(selection.dateFrom).year)
  }

  if (selection.granularity === 'month') {
    const { month, year } = toVietnamDateParts(selection.dateFrom)

    return `${month}/${String(year).slice(-2)}`
  }

  const from = toVietnamDateParts(selection.dateFrom)
  const to = toVietnamDateParts(selection.dateTo - 1)

  return `${from.day}/${from.month} → ${to.day}/${to.month}`
}

export const formatPeriodSelectionDate = (value: number): string => {
  const { day, month, year } = toVietnamDateParts(value)

  return `${day}/${month}/${String(year).slice(-2)}`
}

export const formatPeriodSelectionRangeLabel = (
  selection: PeriodSelection,
): string =>
  `${formatPeriodSelectionDate(selection.dateFrom)} → ${formatPeriodSelectionDate(selection.dateTo - 1)}`

export const formatPeriodDateInputValue = (value: number): string => {
  const { day, month, year } = toVietnamDateParts(value)

  return `${year}-${month}-${day}`
}

export const parsePeriodDateInputValue = (value: string): number | null => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)

  if (!match) return null

  const year = Number(match[1])
  const monthIndex = Number(match[2]) - 1
  const day = Number(match[3])
  const timestamp = createVietnamTimestamp(year, monthIndex, day)
  const parsed = toVietnamDate(timestamp)

  return parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === monthIndex &&
    parsed.getUTCDate() === day
    ? timestamp
    : null
}

export const toAnalyticsRangeParams = (
  selection: PeriodSelection,
  householdId?: string,
) => ({
  date_from: selection.dateFrom,
  date_to: selection.dateTo,
  ...(householdId ? { household_id: householdId } : {}),
})

export const getPeriodYears = (
  now: Date = new Date(),
  count: number = 10,
): number[] => {
  const currentYear = toVietnamDateParts(now.getTime()).year

  return Array.from({ length: count }, (_, index) => currentYear - index)
}

export const getWeeksInYear = (year: number): number => {
  const start = getIsoWeekYearStart(year)
  const end = getIsoWeekYearStart(year + 1)

  return Math.round((end - start) / DAY_IN_MS / 7)
}
