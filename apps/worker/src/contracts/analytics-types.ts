import type { z } from 'zod'

import { type analyticsOverviewQuerySchema } from './analytics-schemas'
import type { ReferenceCategoryKey } from './reference-data'

export type AnalyticsOverviewQuery = z.output<
  ReturnType<typeof analyticsOverviewQuerySchema>
>

export interface AnalyticsDailySpendPointDTO {
  date: string
  totalSpendMinor: number
}

export interface AnalyticsTopCategoryDTO {
  categoryKey: ReferenceCategoryKey
  totalSpendMinor: number
  percentOfTotal: number
  expenseCount: number
}

export interface AnalyticsOverviewDTO {
  period: string
  householdId: string | null
  currencyCode: string
  totalSpendMinor: number
  expenseCount: number
  dailySpend: AnalyticsDailySpendPointDTO[]
  topCategories: AnalyticsTopCategoryDTO[]
}
