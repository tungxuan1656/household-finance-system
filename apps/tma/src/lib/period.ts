export type PeriodGranularity = 'custom' | 'month' | 'week' | 'year'

export type ReportingPeriodPreset =
  | 'lastMonth'
  | 'lastWeek'
  | 'lastYear'
  | 'thisMonth'
  | 'thisWeek'
  | 'thisYear'

export type PeriodSelection = {
  granularity: PeriodGranularity
  dateFrom: number
  dateTo: number
}

const DAY_IN_MS = 24 * 60 * 60 * 1000
const VIETNAM_UTC_OFFSET_MS = 7 * 60 * 60 * 1000

export const REPORTING_PERIOD_PRESETS: ReportingPeriodPreset[] = [
  'thisMonth',
  'lastMonth',
  'thisWeek',
  'lastWeek',
  'thisYear',
  'lastYear',
]

const REPORTING_PERIOD_PRESET_LABELS: Record<ReportingPeriodPreset, string> = {
  lastMonth: 'Tháng trước',
  lastWeek: 'Tuần trước',
  lastYear: 'Năm ngoái',
  thisMonth: 'Tháng này',
  thisWeek: 'Tuần này',
  thisYear: 'Năm nay',
}

const formatTwoDigits = (value: number): string =>
  String(value).padStart(2, '0')

const toVietnamDate = (value: number): Date =>
  new Date(value + VIETNAM_UTC_OFFSET_MS)

const createVietnamTimestamp = (
  year: number,
  monthIndex: number,
  day: number,
): number => Date.UTC(year, monthIndex, day) - VIETNAM_UTC_OFFSET_MS

const toVietnamDateParts = (value: number) => {
  const date = toVietnamDate(value)

  return {
    day: formatTwoDigits(date.getUTCDate()),
    month: formatTwoDigits(date.getUTCMonth() + 1),
    year: date.getUTCFullYear(),
  }
}

const getIsoWeekStart = (value: number): number => {
  const date = toVietnamDate(value)
  const weekday = date.getUTCDay() || 7

  date.setUTCHours(0, 0, 0, 0)
  date.setUTCDate(date.getUTCDate() - weekday + 1)

  return date.getTime() - VIETNAM_UTC_OFFSET_MS
}

const getIsoWeekYear = (value: number): number =>
  toVietnamDateParts(getIsoWeekStart(value) + 3 * DAY_IN_MS).year

const getIsoWeekYearStart = (year: number): number =>
  getIsoWeekStart(createVietnamTimestamp(year, 0, 4))

const startOfVietnamDay = (value: number): number => {
  const date = toVietnamDate(value)

  return createVietnamTimestamp(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
  )
}

const sameRange = (left: PeriodSelection, right: PeriodSelection): boolean =>
  left.dateFrom === right.dateFrom && left.dateTo === right.dateTo

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

export const getReportingPeriodPresetLabel = (
  preset: ReportingPeriodPreset,
): string => REPORTING_PERIOD_PRESET_LABELS[preset]

export const getMatchingReportingPeriodPreset = (
  selection: PeriodSelection,
  now: Date = new Date(),
): ReportingPeriodPreset | null =>
  REPORTING_PERIOD_PRESETS.find((preset) =>
    sameRange(selection, createReportingPeriodPresetSelection(preset, now)),
  ) ?? null

export const formatPeriodSelectionLabel = (
  selection: PeriodSelection,
): string => {
  const matchingPreset = getMatchingReportingPeriodPreset(selection)

  if (matchingPreset) {
    return getReportingPeriodPresetLabel(matchingPreset)
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

export const getMonthBudgetPeriod = (selection: PeriodSelection): string => {
  const { month, year } = toVietnamDateParts(selection.dateFrom)

  return `${year}-${month}`
}

export const isMonthPeriodSelection = (selection: PeriodSelection): boolean =>
  selection.granularity === 'month'

export const getComparisonGranularityLabel = (
  granularity: PeriodGranularity,
): string => {
  if (granularity === 'week') return 'tuần trước'
  if (granularity === 'year') return 'năm trước'
  if (granularity === 'custom') return 'kỳ trước'

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
  const currentYear = toVietnamDateParts(now.getTime()).year

  return Array.from({ length: count }, (_, index) => currentYear - index)
}

export const getWeeksInYear = (year: number): number => {
  const start = getIsoWeekYearStart(year)
  const end = getIsoWeekYearStart(year + 1)

  return Math.round((end - start) / DAY_IN_MS / 7)
}
