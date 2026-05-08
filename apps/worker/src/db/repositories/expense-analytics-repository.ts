import type { ReferenceCategoryKey } from '@/contracts/reference-data'

import {
  calculateDeltaPercent,
  getAnalyticsSummary,
} from './expense-analytics-helpers'
import { buildPeriodWhereClause } from './expense-query-scope'
import { findHouseholdById } from './household-repository'

type AnalyticsQueryInput = {
  userId: string
  householdId?: string
  periodStart: number
  periodEnd: number
  period: string
}

type AnalyticsDailySpendPointDTO = {
  date: string
  totalSpendMinor: number
}

type AnalyticsTopCategoryRow = {
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
  payerAttribution: Array<{
    payerDisplayName: string | null
    payerUserId: string
    totalSpendMinor: number
    percentOfTotal: number
    expenseCount: number
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

type AnalyticsCategoryTotalRow = {
  categoryKey: ReferenceCategoryKey
  totalSpendMinor: number
}

type AnalyticsPayerAttributionRow = {
  payerDisplayName: string | null
  payerUserId: string
  totalSpendMinor: number
  expenseCount: number
}

type AnalyticsGroupSpendRow = {
  groupId: string
  groupName: string
  totalSpendMinor: number
  expenseCount: number
}

export const getAnalyticsOverview = async (
  db: D1Database,
  input: AnalyticsQueryInput,
): Promise<AnalyticsOverviewDTO> => {
  const { whereClause, params } = buildPeriodWhereClause(
    input.userId,
    input.householdId,
    input.periodStart,
    input.periodEnd,
  )

  const summaryRow = await getAnalyticsSummary(db, whereClause, params)

  const dailyResult = await db
    .prepare(
      `SELECT strftime('%Y-%m-%d', e.occurred_at / 1000, 'unixepoch') AS date, COALESCE(SUM(e.amount_minor), 0) AS totalSpendMinor
         FROM expenses e
        WHERE ${whereClause}
        GROUP BY strftime('%Y-%m-%d', e.occurred_at / 1000, 'unixepoch')
        ORDER BY date ASC`,
    )
    .bind(...params)
    .all<AnalyticsDailySpendPointDTO>()

  const topCategoriesResult = await db
    .prepare(
      `SELECT e.category_key AS categoryKey, COALESCE(SUM(e.amount_minor), 0) AS totalSpendMinor, COUNT(*) AS expenseCount
         FROM expenses e
        WHERE ${whereClause}
        GROUP BY e.category_key
        ORDER BY totalSpendMinor DESC, expenseCount DESC, categoryKey ASC
        LIMIT 5`,
    )
    .bind(...params)
    .all<AnalyticsTopCategoryRow>()

  const totalSpendMinor = Number(summaryRow?.totalSpendMinor ?? 0)

  return {
    period: input.period,
    householdId: input.householdId ?? null,
    currencyCode: summaryRow?.currencyCode ?? 'VND',
    totalSpendMinor,
    expenseCount: Number(summaryRow?.expenseCount ?? 0),
    dailySpend: dailyResult.results.map((row) => ({
      date: row.date,
      totalSpendMinor: Number(row.totalSpendMinor),
    })),
    topCategories: topCategoriesResult.results.map((row) => ({
      categoryKey: row.categoryKey,
      totalSpendMinor: Number(row.totalSpendMinor),
      percentOfTotal:
        totalSpendMinor > 0
          ? Math.round((Number(row.totalSpendMinor) / totalSpendMinor) * 100)
          : 0,
      expenseCount: Number(row.expenseCount),
    })),
  }
}

export const getAnalyticsComparison = async (
  db: D1Database,
  input: AnalyticsQueryInput & {
    previousPeriod: string
    previousPeriodStart: number
    previousPeriodEnd: number
  },
): Promise<AnalyticsComparisonDTO> => {
  const currentScope = buildPeriodWhereClause(
    input.userId,
    input.householdId,
    input.periodStart,
    input.periodEnd,
  )
  const previousScope = buildPeriodWhereClause(
    input.userId,
    input.householdId,
    input.previousPeriodStart,
    input.previousPeriodEnd,
  )

  const currentSummary = await getAnalyticsSummary(
    db,
    currentScope.whereClause,
    currentScope.params,
  )
  const previousSummary = await getAnalyticsSummary(
    db,
    previousScope.whereClause,
    previousScope.params,
  )

  const currentCategoryTotals = await db
    .prepare(
      `SELECT e.category_key AS categoryKey, COALESCE(SUM(e.amount_minor), 0) AS totalSpendMinor
         FROM expenses e
         LEFT JOIN users u ON u.id = e.payer_user_id
        WHERE ${currentScope.whereClause}
        GROUP BY e.category_key`,
    )
    .bind(...currentScope.params)
    .all<AnalyticsCategoryTotalRow>()

  const previousCategoryTotals = await db
    .prepare(
      `SELECT e.category_key AS categoryKey, COALESCE(SUM(e.amount_minor), 0) AS totalSpendMinor
         FROM expenses e
        WHERE ${previousScope.whereClause}
        GROUP BY e.category_key`,
    )
    .bind(...previousScope.params)
    .all<AnalyticsCategoryTotalRow>()

  const payerAttributionResult = await db
    .prepare(
      `SELECT e.payer_user_id AS payerUserId,
              COALESCE(u.display_name, u.primary_email, e.payer_user_id) AS payerDisplayName,
              COALESCE(SUM(e.amount_minor), 0) AS totalSpendMinor,
              COUNT(*) AS expenseCount
         FROM expenses e
         LEFT JOIN users u ON u.id = e.payer_user_id
        WHERE ${currentScope.whereClause}
        GROUP BY e.payer_user_id
        ORDER BY totalSpendMinor DESC, expenseCount DESC, payerUserId ASC`,
    )
    .bind(...currentScope.params)
    .all<AnalyticsPayerAttributionRow>()

  const currentCategoryMap = new Map(
    currentCategoryTotals.results.map((row) => [
      row.categoryKey,
      Number(row.totalSpendMinor),
    ]),
  )
  const previousCategoryMap = new Map(
    previousCategoryTotals.results.map((row) => [
      row.categoryKey,
      Number(row.totalSpendMinor),
    ]),
  )

  const categoryKeys = new Set<ReferenceCategoryKey>([
    ...currentCategoryMap.keys(),
    ...previousCategoryMap.keys(),
  ])

  const topCategoryDeltas = Array.from(categoryKeys)
    .map((categoryKey) => {
      const currentTotalSpendMinor = currentCategoryMap.get(categoryKey) ?? 0
      const previousTotalSpendMinor = previousCategoryMap.get(categoryKey) ?? 0

      return {
        categoryKey,
        currentTotalSpendMinor,
        previousTotalSpendMinor,
        deltaSpendMinor: currentTotalSpendMinor - previousTotalSpendMinor,
        deltaPercent: calculateDeltaPercent(
          currentTotalSpendMinor,
          previousTotalSpendMinor,
        ),
      }
    })
    .sort((left, right) => {
      const deltaGap =
        Math.abs(right.deltaSpendMinor) - Math.abs(left.deltaSpendMinor)
      if (deltaGap !== 0) return deltaGap

      return left.categoryKey.localeCompare(right.categoryKey)
    })
    .slice(0, 5)

  return {
    householdId: input.householdId ?? null,
    currencyCode:
      currentSummary.currencyCode || previousSummary.currencyCode || 'VND',
    currentPeriod: {
      period: input.period,
      totalSpendMinor: currentSummary.totalSpendMinor,
      expenseCount: currentSummary.expenseCount,
    },
    previousPeriod: {
      period: input.previousPeriod,
      totalSpendMinor: previousSummary.totalSpendMinor,
      expenseCount: previousSummary.expenseCount,
    },
    totalDeltaSpendMinor:
      currentSummary.totalSpendMinor - previousSummary.totalSpendMinor,
    totalDeltaPercent: calculateDeltaPercent(
      currentSummary.totalSpendMinor,
      previousSummary.totalSpendMinor,
    ),
    topCategoryDeltas,
    payerAttribution: payerAttributionResult.results.map((row) => ({
      payerDisplayName: row.payerDisplayName,
      payerUserId: row.payerUserId,
      totalSpendMinor: Number(row.totalSpendMinor),
      percentOfTotal:
        currentSummary.totalSpendMinor > 0
          ? Math.round(
              (Number(row.totalSpendMinor) / currentSummary.totalSpendMinor) *
                100,
            )
          : 0,
      expenseCount: Number(row.expenseCount),
    })),
  }
}

export const getAnalyticsGroups = async (
  db: D1Database,
  input: AnalyticsQueryInput,
): Promise<AnalyticsGroupsDTO> => {
  const { whereClause, params } = buildPeriodWhereClause(
    input.userId,
    input.householdId,
    input.periodStart,
    input.periodEnd,
  )

  const groupsResult = await db
    .prepare(
      `SELECT g.id AS groupId,
              g.name AS groupName,
              COALESCE(SUM(e.amount_minor), 0) AS totalSpendMinor,
              COUNT(DISTINCT e.id) AS expenseCount
         FROM expenses e
         JOIN expense_group_items egi ON egi.expense_id = e.id
         JOIN expense_groups g ON g.id = egi.group_id
        WHERE ${whereClause}
        GROUP BY g.id, g.name
        ORDER BY totalSpendMinor DESC, expenseCount DESC, groupName ASC`,
    )
    .bind(...params)
    .all<AnalyticsGroupSpendRow>()

  const groups = groupsResult.results.map((row) => ({
    groupId: row.groupId,
    groupName: row.groupName,
    totalSpendMinor: Number(row.totalSpendMinor),
    expenseCount: Number(row.expenseCount),
    overlapPercentOfTotal: 0,
    percentOfTotal: 0,
  }))

  const groupedSummary = await getAnalyticsSummary(db, whereClause, params)

  const groupedSummaryResult = await db
    .prepare(
      `SELECT COALESCE(SUM(grouped_expenses.amount_minor), 0) AS totalGroupedSpendMinor
         FROM (
           SELECT DISTINCT e.id, e.amount_minor
             FROM expenses e
             JOIN expense_group_items egi ON egi.expense_id = e.id
            WHERE ${whereClause}
         ) AS grouped_expenses`,
    )
    .bind(...params)
    .first<{ totalGroupedSpendMinor: number | null }>()

  const totalGroupedSpendMinor = Number(
    groupedSummaryResult?.totalGroupedSpendMinor ?? 0,
  )

  const household = input.householdId
    ? await findHouseholdById(db, input.householdId)
    : null

  const currencyCode =
    household?.defaultCurrencyCode ?? groupedSummary.currencyCode ?? 'VND'

  return {
    period: input.period,
    householdId: input.householdId ?? null,
    currencyCode,
    totalGroupedSpendMinor,
    groups: groups.map((group) => {
      const overlapPercentOfTotal =
        totalGroupedSpendMinor > 0
          ? Math.round((group.totalSpendMinor / totalGroupedSpendMinor) * 100)
          : 0

      return {
        ...group,
        overlapPercentOfTotal,
        percentOfTotal: overlapPercentOfTotal,
      }
    }),
  }
}
