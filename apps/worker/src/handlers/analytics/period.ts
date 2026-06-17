export const toPeriodRange = (period: string) => {
  const [yearValue, monthValue] = period.split('-')
  const year = Number(yearValue)
  const monthIndex = Number(monthValue) - 1

  return {
    start: Date.UTC(year, monthIndex, 1),
    end: Date.UTC(year, monthIndex + 1, 1),
  }
}

export const toPreviousPeriod = (period: string) => {
  const [yearValue, monthValue] = period.split('-')
  const date = new Date(Date.UTC(Number(yearValue), Number(monthValue) - 1, 1))

  date.setUTCMonth(date.getUTCMonth() - 1)

  const year = date.getUTCFullYear()
  const month = `${date.getUTCMonth() + 1}`.padStart(2, '0')

  return `${year}-${month}`
}

type PeriodQuery = {
  period: string
}

type DateRangeQuery = {
  date_from: number
  date_to: number
}

export type AnalyticsRangeDescriptor = {
  period: string
  start: number
  end: number
}

const toIsoDate = (value: number): string =>
  new Date(value).toISOString().slice(0, 10)

const toRangePeriodLabel = (start: number, end: number): string =>
  `${toIsoDate(start)}..${toIsoDate(end)}`

export const toAnalyticsRange = (
  query: PeriodQuery | DateRangeQuery,
): AnalyticsRangeDescriptor => {
  if ('period' in query) {
    const range = toPeriodRange(query.period)

    return {
      period: query.period,
      start: range.start,
      end: range.end,
    }
  }

  return {
    period: toRangePeriodLabel(query.date_from, query.date_to),
    start: query.date_from,
    end: query.date_to,
  }
}

export const toPreviousAnalyticsRange = (
  currentRange: AnalyticsRangeDescriptor,
): AnalyticsRangeDescriptor => {
  const duration = currentRange.end - currentRange.start
  const start = currentRange.start - duration
  const end = currentRange.start

  if (/^\d{4}-(0[1-9]|1[0-2])$/.test(currentRange.period)) {
    const period = toPreviousPeriod(currentRange.period)

    return {
      period,
      start,
      end,
    }
  }

  return {
    period: toRangePeriodLabel(start, end),
    start,
    end,
  }
}
