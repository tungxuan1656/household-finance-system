export type PeriodGranularity = 'month' | 'week' | 'year'

export type PeriodSelection = {
  granularity: PeriodGranularity
  dateFrom: number
  dateTo: number
}

const DAY_IN_MS = 24 * 60 * 60 * 1000

const formatTwoDigits = (value: number): string =>
  String(value).padStart(2, '0')

const toUtcDateParts = (value: number) => {
  const date = new Date(value)

  return {
    day: formatTwoDigits(date.getUTCDate()),
    month: formatTwoDigits(date.getUTCMonth() + 1),
    year: date.getUTCFullYear(),
  }
}

const getIsoWeekStart = (value: number): number => {
  const date = new Date(value)
  const weekday = date.getUTCDay() || 7

  date.setUTCHours(0, 0, 0, 0)
  date.setUTCDate(date.getUTCDate() - weekday + 1)

  return date.getTime()
}

const getIsoWeekYear = (value: number): number =>
  new Date(getIsoWeekStart(value) + 3 * DAY_IN_MS).getUTCFullYear()

const getIsoWeekYearStart = (year: number): number =>
  getIsoWeekStart(Date.UTC(year, 0, 4))

export const getCurrentPeriod = (): string => {
  const now = new Date()
  const year = now.getUTCFullYear()
  const month = formatTwoDigits(now.getUTCMonth() + 1)

  return `${year}-${month}`
}

export const getPeriodSelectionYear = (selection: PeriodSelection): number =>
  selection.granularity === 'week'
    ? getIsoWeekYear(selection.dateFrom)
    : new Date(selection.dateFrom).getUTCFullYear()

export const getPeriodSelectionMonth = (
  selection: PeriodSelection,
): number | null =>
  selection.granularity === 'month'
    ? new Date(selection.dateFrom).getUTCMonth() + 1
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
  dateFrom: Date.UTC(year, month - 1, 1),
  dateTo: Date.UTC(year, month, 1),
})

export const createYearPeriodSelection = (year: number): PeriodSelection => ({
  granularity: 'year',
  dateFrom: Date.UTC(year, 0, 1),
  dateTo: Date.UTC(year + 1, 0, 1),
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
): PeriodSelection =>
  createMonthPeriodSelection(now.getUTCFullYear(), now.getUTCMonth() + 1)

export const formatPeriodSelectionLabel = (
  selection: PeriodSelection,
): string => {
  if (selection.granularity === 'year') {
    return String(new Date(selection.dateFrom).getUTCFullYear())
  }

  if (selection.granularity === 'month') {
    const { month, year } = toUtcDateParts(selection.dateFrom)

    return `${month}/${String(year).slice(-2)}`
  }

  const from = toUtcDateParts(selection.dateFrom)
  const to = toUtcDateParts(selection.dateTo - 1)

  return `${from.day}/${from.month}-${to.day}/${to.month}`
}

export const formatPeriodSelectionDate = (value: number): string => {
  const { day, month, year } = toUtcDateParts(value)

  return `${day}/${month}/${String(year).slice(-2)}`
}

export const formatPeriodSelectionRangeLabel = (
  selection: PeriodSelection,
): string =>
  `${formatPeriodSelectionDate(selection.dateFrom)} - ${formatPeriodSelectionDate(selection.dateTo - 1)}`

export const getMonthBudgetPeriod = (
  selection: PeriodSelection,
): string | null => {
  if (selection.granularity !== 'month') {
    return null
  }

  const { month, year } = toUtcDateParts(selection.dateFrom)

  return `${year}-${month}`
}

export const isMonthPeriodSelection = (selection: PeriodSelection): boolean =>
  selection.granularity === 'month'

export const getComparisonGranularityLabel = (
  granularity: PeriodGranularity,
): string => {
  if (granularity === 'week') return 'tuần trước'
  if (granularity === 'year') return 'năm trước'

  return 'tháng trước'
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
  const currentYear = now.getUTCFullYear()

  return Array.from({ length: count }, (_, index) => currentYear - index)
}

export const getWeeksInYear = (year: number): number => {
  const start = getIsoWeekYearStart(year)
  const end = getIsoWeekYearStart(year + 1)

  return Math.round((end - start) / DAY_IN_MS / 7)
}
