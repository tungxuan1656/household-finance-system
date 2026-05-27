import type { ReferenceCategoryKey } from '@/contracts/reference-data'

export type AnalyticsQueryInput = {
  userId: string
  householdId?: string
  periodStart: number
  periodEnd: number
  period: string
}

export type AnalyticsDailySpendPointDTO = {
  date: string
  totalSpendMinor: number
}

export type AnalyticsTopCategoryRow = {
  categoryKey: ReferenceCategoryKey
  totalSpendMinor: number
  expenseCount: number
}

export type AnalyticsOverviewDTO = {
  period: string
  householdId: string | null
  currencyCode: string
  totalSpendMinor: number
  expenseCount: number
  dailySpend: AnalyticsDailySpendPointDTO[]
  topCategories: Array<{
    categoryKey: ReferenceCategoryKey
    totalSpendMinor: number
    percentOfTotal: number
    expenseCount: number
  }>
}

export type AnalyticsComparisonDTO = {
  householdId: string | null
  currencyCode: string
  currentPeriod: {
    period: string
    totalSpendMinor: number
    expenseCount: number
  }
  previousPeriod: {
    period: string
    totalSpendMinor: number
    expenseCount: number
  }
  totalDeltaSpendMinor: number
  totalDeltaPercent: number | null
  topCategoryDeltas: Array<{
    categoryKey: ReferenceCategoryKey
    currentTotalSpendMinor: number
    previousTotalSpendMinor: number
    deltaSpendMinor: number
    deltaPercent: number | null
  }>
}

export type AnalyticsGroupsDTO = {
  period: string
  householdId: string | null
  currencyCode: string
  totalGroupedSpendMinor: number
  groups: Array<{
    groupId: string
    groupName: string
    totalSpendMinor: number
    expenseCount: number
    overlapPercentOfTotal: number
    percentOfTotal: number
  }>
}

export type AnalyticsCategoryTotalRow = {
  categoryKey: ReferenceCategoryKey
  totalSpendMinor: number
}

export type AnalyticsGroupSpendRow = {
  groupId: string
  groupName: string
  totalSpendMinor: number
  expenseCount: number
}
