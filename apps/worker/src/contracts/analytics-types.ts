import type { z } from 'zod'

import {
  type analyticsComparisonQuerySchema,
  type analyticsGroupsQuerySchema,
  type analyticsOverviewQuerySchema,
} from './analytics-schemas'
import type { ReferenceCategoryKey } from './reference-data'

export type AnalyticsOverviewQuery = z.output<
  ReturnType<typeof analyticsOverviewQuerySchema>
>

export type AnalyticsComparisonQuery = z.output<
  ReturnType<typeof analyticsComparisonQuerySchema>
>

export type AnalyticsGroupsQuery = z.output<
  ReturnType<typeof analyticsGroupsQuerySchema>
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

export interface AnalyticsPeriodSpendDTO {
  period: string
  totalSpendMinor: number
  expenseCount: number
}

export interface AnalyticsCategoryDeltaDTO {
  categoryKey: ReferenceCategoryKey
  currentTotalSpendMinor: number
  previousTotalSpendMinor: number
  deltaSpendMinor: number
  deltaPercent: number | null
}

export interface AnalyticsPayerAttributionDTO {
  payerDisplayName: string | null
  payerUserId: string
  totalSpendMinor: number
  percentOfTotal: number
  expenseCount: number
}

export interface AnalyticsComparisonDTO {
  householdId: string | null
  currencyCode: string
  currentPeriod: AnalyticsPeriodSpendDTO
  previousPeriod: AnalyticsPeriodSpendDTO
  totalDeltaSpendMinor: number
  totalDeltaPercent: number | null
  topCategoryDeltas: AnalyticsCategoryDeltaDTO[]
  payerAttribution: AnalyticsPayerAttributionDTO[]
}

export interface AnalyticsGroupSpendDTO {
  groupId: string
  groupName: string
  totalSpendMinor: number
  expenseCount: number
  overlapPercentOfTotal: number
  /** Deprecated compatibility alias for overlapPercentOfTotal. */
  percentOfTotal: number
}

export interface AnalyticsGroupsDTO {
  period: string
  householdId: string | null
  currencyCode: string
  totalGroupedSpendMinor: number
  groups: AnalyticsGroupSpendDTO[]
}
