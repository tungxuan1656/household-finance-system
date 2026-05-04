import type { CategoryKey } from './reference-data'

export type AnalyticsOverviewParams = {
  period: string
  household_id?: string
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
