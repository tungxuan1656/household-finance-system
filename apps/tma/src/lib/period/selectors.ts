import type {
  PeriodGranularity,
  PeriodSelection,
  ReportingPeriodPreset,
} from './types'
import {
  createVietnamTimestamp,
  DAY_IN_MS,
  getIsoWeekStart,
  getIsoWeekYear,
  getIsoWeekYearStart,
  startOfVietnamDay,
  toVietnamDateParts,
} from './vietnam-time'

export const capitalize = (s: string): string =>
  s.length > 0 ? s.charAt(0).toUpperCase() + s.slice(1) : s

export const getCurrentPeriod = (): string => {
  const { month, year } = toVietnamDateParts(Date.now())

  return `${year}-${month}`
}

export const getPeriodSelectionYear = (selection: PeriodSelection): number =>
  selection.granularity === 'week'
    ? getIsoWeekYear(selection.dateFrom)
    : toVietnamDateParts(selection.dateFrom).year

export const getPeriodSelectionMonth = (
  selection: PeriodSelection,
): number | null =>
  selection.granularity === 'month'
    ? Number(toVietnamDateParts(selection.dateFrom).month)
    : null

export const getPeriodSelectionWeek = (
  selection: PeriodSelection,
): number | null => {
  if (selection.granularity !== 'week') {
    return null
  }

  const yearStart = getIsoWeekYearStart(getPeriodSelectionYear(selection))

  return Math.floor((selection.dateFrom - yearStart) / DAY_IN_MS / 7) + 1
}

export const createMonthPeriodSelection = (
  year: number,
  month: number,
): PeriodSelection => ({
  granularity: 'month',
  dateFrom: createVietnamTimestamp(year, month - 1, 1),
  dateTo: createVietnamTimestamp(year, month, 1),
})

export const createYearPeriodSelection = (year: number): PeriodSelection => ({
  granularity: 'year',
  dateFrom: createVietnamTimestamp(year, 0, 1),
  dateTo: createVietnamTimestamp(year + 1, 0, 1),
})

export const createWeekPeriodSelection = (
  year: number,
  week: number,
): PeriodSelection => {
  const dateFrom = getIsoWeekYearStart(year) + (week - 1) * 7 * DAY_IN_MS

  return {
    granularity: 'week',
    dateFrom,
    dateTo: dateFrom + 7 * DAY_IN_MS,
  }
}

export const createCurrentMonthPeriodSelection = (
  now: Date = new Date(),
): PeriodSelection => createReportingPeriodPresetSelection('thisMonth', now)

export const createCustomPeriodSelection = (
  dateFrom: number,
  dateToInclusive: number,
): PeriodSelection => ({
  granularity: 'custom',
  dateFrom: startOfVietnamDay(dateFrom),
  dateTo: startOfVietnamDay(dateToInclusive) + DAY_IN_MS,
})

export const createReportingPeriodPresetSelection = (
  preset: ReportingPeriodPreset,
  now: Date = new Date(),
): PeriodSelection => {
  const { month, year } = toVietnamDateParts(now.getTime())

  if (preset === 'thisMonth') {
    return createMonthPeriodSelection(year, Number(month))
  }

  if (preset === 'lastMonth') {
    return createMonthPeriodSelection(year, Number(month) - 1)
  }

  if (preset === 'thisWeek') {
    const dateFrom = getIsoWeekStart(now.getTime())

    return {
      granularity: 'week',
      dateFrom,
      dateTo: dateFrom + 7 * DAY_IN_MS,
    }
  }

  if (preset === 'lastWeek') {
    const dateFrom = getIsoWeekStart(now.getTime()) - 7 * DAY_IN_MS

    return {
      granularity: 'week',
      dateFrom,
      dateTo: dateFrom + 7 * DAY_IN_MS,
    }
  }

  if (preset === 'thisYear') {
    return createYearPeriodSelection(year)
  }

  return createYearPeriodSelection(year - 1)
}

export const getMonthBudgetPeriod = (selection: PeriodSelection): string => {
  const { month, year } = toVietnamDateParts(selection.dateFrom)

  return `${year}-${month}`
}

export const isMonthPeriodSelection = (selection: PeriodSelection): boolean =>
  selection.granularity === 'month'

export const getComparisonGranularityLabel = (
  granularity: PeriodGranularity,
  t: (key: string) => string,
): string => t(`period.granularity${capitalize(granularity)}`)
