import type { PeriodSelection } from './types'

export const DAY_IN_MS = 24 * 60 * 60 * 1000

const VIETNAM_UTC_OFFSET_MS = 7 * 60 * 60 * 1000

const formatTwoDigits = (value: number): string =>
  String(value).padStart(2, '0')

export const toVietnamDate = (value: number): Date =>
  new Date(value + VIETNAM_UTC_OFFSET_MS)

export const createVietnamTimestamp = (
  year: number,
  monthIndex: number,
  day: number,
): number => Date.UTC(year, monthIndex, day) - VIETNAM_UTC_OFFSET_MS

export const toVietnamDateParts = (value: number) => {
  const date = toVietnamDate(value)

  return {
    day: formatTwoDigits(date.getUTCDate()),
    month: formatTwoDigits(date.getUTCMonth() + 1),
    year: date.getUTCFullYear(),
  }
}

export const getIsoWeekStart = (value: number): number => {
  const date = toVietnamDate(value)
  const weekday = date.getUTCDay() || 7

  date.setUTCHours(0, 0, 0, 0)
  date.setUTCDate(date.getUTCDate() - weekday + 1)

  return date.getTime() - VIETNAM_UTC_OFFSET_MS
}

export const getIsoWeekYear = (value: number): number =>
  toVietnamDateParts(getIsoWeekStart(value) + 3 * DAY_IN_MS).year

export const getIsoWeekYearStart = (year: number): number =>
  getIsoWeekStart(createVietnamTimestamp(year, 0, 4))

export const startOfVietnamDay = (value: number): number => {
  const date = toVietnamDate(value)

  return createVietnamTimestamp(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
  )
}

export const sameRange = (
  left: PeriodSelection,
  right: PeriodSelection,
): boolean => left.dateFrom === right.dateFrom && left.dateTo === right.dateTo
