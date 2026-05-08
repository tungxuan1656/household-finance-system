import type { CategoryKey } from './reference-data'

export type AnalyticsOverviewParams = {
  period: string
  household_id?: string
}

export type AnalyticsComparisonParams = AnalyticsOverviewParams

export type AnalyticsGroupsParams = AnalyticsOverviewParams

export type AnalyticsExportParams = AnalyticsOverviewParams

export type AnalyticsExportResult = {
  blob: Blob
  filename: string | null
}

export type AnalyticsDailySpendPointDTO = {
  date: string
  totalSpendMinor: number
}

export type AnalyticsTopCategoryDTO = {
  categoryKey: CategoryKey
  totalSpendMinor: number
  percentOfTotal: number
  expenseCount: number
}

export type AnalyticsOverviewDTO = {
  period: string
  householdId: string | null
  currencyCode: string
  totalSpendMinor: number
  expenseCount: number
  dailySpend: AnalyticsDailySpendPointDTO[]
  topCategories: AnalyticsTopCategoryDTO[]
}

export type AnalyticsPeriodSpendDTO = {
  period: string
  totalSpendMinor: number
  expenseCount: number
}

export type AnalyticsCategoryDeltaDTO = {
  categoryKey: CategoryKey
  currentTotalSpendMinor: number
  previousTotalSpendMinor: number
  deltaSpendMinor: number
  deltaPercent: number | null
}

export type AnalyticsPayerAttributionDTO = {
  payerDisplayName: string | null
  payerUserId: string
  totalSpendMinor: number
  percentOfTotal: number
  expenseCount: number
}

export type AnalyticsComparisonDTO = {
  householdId: string | null
  currencyCode: string
  currentPeriod: AnalyticsPeriodSpendDTO
  previousPeriod: AnalyticsPeriodSpendDTO
  totalDeltaSpendMinor: number
  totalDeltaPercent: number | null
  topCategoryDeltas: AnalyticsCategoryDeltaDTO[]
  payerAttribution: AnalyticsPayerAttributionDTO[]
}

export type AnalyticsGroupSpendDTO = {
  groupId: string
  groupName: string
  totalSpendMinor: number
  expenseCount: number
  overlapPercentOfTotal: number
  /** Deprecated compatibility alias for overlapPercentOfTotal. */
  percentOfTotal: number
}

export type AnalyticsGroupsDTO = {
  period: string
  householdId: string | null
  currencyCode: string
  totalGroupedSpendMinor: number
  groups: AnalyticsGroupSpendDTO[]
}
