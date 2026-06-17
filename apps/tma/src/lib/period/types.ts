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

export const REPORTING_PERIOD_PRESETS: ReportingPeriodPreset[] = [
  'thisMonth',
  'lastMonth',
  'thisWeek',
  'lastWeek',
  'thisYear',
  'lastYear',
]
