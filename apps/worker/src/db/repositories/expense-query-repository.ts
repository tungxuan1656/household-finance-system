import type { ReferenceCategoryKey } from '@/contracts/reference-data'

import type {
  ExpenseRow,
  ExpenseSummaryResult,
  ListExpensesInput,
  ListExpensesResult,
  StoredExpense,
} from './expense-repository'
import { mapRow } from './expense-repository'

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

type AnalyticsOverviewDTO = {
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

type AnalyticsComparisonDTO = {
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

type AnalyticsGroupsDTO = {
  period: string
  householdId: string | null
  currencyCode: string
  totalGroupedSpendMinor: number
  groups: Array<{
    groupId: string
    groupName: string
    totalSpendMinor: number
    expenseCount: number
    percentOfTotal: number
  }>
}

type AnalyticsSummaryRow = {
  expenseCount: number
  totalSpendMinor: number
  currencyCode: string | null
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

const buildVisibleExpenseConditions = (
  userId: string,
  householdId?: string,
): { conditions: string[]; params: unknown[] } => {
  const conditions: string[] = ['e.deleted_at IS NULL']
  const params: unknown[] = []

  if (householdId) {
    conditions.push('e.visibility = ?')
    params.push('household')
    conditions.push('e.household_id = ?')
    params.push(householdId)
  } else {
    conditions.push(`(
      (
        e.visibility = 'private'
        AND e.created_by_user_id = ?
      )
      OR (
        e.visibility = 'household'
        AND e.household_id IN (
          SELECT hm.household_id
            FROM household_memberships hm
           WHERE hm.user_id = ?
             AND hm.state = 'active'
        )
      )
    )`)

    params.push(userId, userId)
  }

  return { conditions, params }
}

const getAnalyticsSummary = async (
  db: D1Database,
  whereClause: string,
  params: unknown[],
): Promise<AnalyticsSummaryRow> => {
  const row = await db
    .prepare(
      `SELECT COUNT(*) AS expenseCount, COALESCE(SUM(e.amount_minor), 0) AS totalSpendMinor, MIN(e.currency_code) AS currencyCode FROM expenses e WHERE ${whereClause}`,
    )
    .bind(...params)
    .first<AnalyticsSummaryRow>()

  return {
    expenseCount: Number(row?.expenseCount ?? 0),
    totalSpendMinor: Number(row?.totalSpendMinor ?? 0),
    currencyCode: row?.currencyCode ?? 'VND',
  }
}

const calculateDeltaPercent = (
  currentTotalSpendMinor: number,
  previousTotalSpendMinor: number,
): number | null => {
  if (previousTotalSpendMinor === 0) {
    return currentTotalSpendMinor === 0 ? 0 : null
  }

  return Math.round(
    ((currentTotalSpendMinor - previousTotalSpendMinor) /
      previousTotalSpendMinor) *
      100,
  )
}

const buildPeriodWhereClause = (
  userId: string,
  householdId: string | undefined,
  periodStart: number,
  periodEnd: number,
) => {
  const { conditions, params } = buildVisibleExpenseConditions(
    userId,
    householdId,
  )

  conditions.push('e.occurred_at >= ?')
  params.push(periodStart)
  conditions.push('e.occurred_at < ?')
  params.push(periodEnd)

  return {
    whereClause: conditions.join(' AND '),
    params,
  }
}

type ExpenseCursor =
  | { sort: 'occurred_at_desc'; occurredAt: number; id: string }
  | {
      sort: 'amount_desc'
      amountMinor: number
      occurredAt: number
      id: string
    }

// Decode a composite cursor into its parts.
// Returns null if the cursor format is invalid.
export const decodeCursor = (cursor: string): ExpenseCursor | null => {
  try {
    const decoded = atob(cursor)
    const parts = decoded.split(':')

    if (parts.length === 2) {
      const occurredAt = Number(parts[0])
      const id = parts[1]

      if (!occurredAt || !id) return null

      return { sort: 'occurred_at_desc', occurredAt, id }
    }

    if (parts.length === 3) {
      const amountMinor = Number(parts[0])
      const occurredAt = Number(parts[1])
      const id = parts[2]

      if (Number.isNaN(amountMinor) || !occurredAt || !id) return null

      return { sort: 'amount_desc', amountMinor, occurredAt, id }
    }

    return null
  } catch {
    return null
  }
}

const encodeCursor = (
  sort: ListExpensesInput['sort'],
  expense: Pick<ExpenseRow, 'amount_minor' | 'occurred_at' | 'id'>,
): string =>
  sort === 'amount_desc'
    ? btoa(`${expense.amount_minor}:${expense.occurred_at}:${expense.id}`)
    : btoa(`${expense.occurred_at}:${expense.id}`)

// Explicit column list for SELECT queries (no SELECT *).
const EXPENSE_COLUMNS = `
  id,
  household_id,
  created_by_user_id,
  payer_user_id,
  category_key,
  source_key,
  category_id,
  amount_minor,
  currency_code,
  occurred_at,
  visibility,
  title,
  note,
  deleted_at,
  created_at,
  updated_at`

export const listExpenses = async (
  db: D1Database,
  input: ListExpensesInput,
): Promise<ListExpensesResult> => {
  const {
    userId,
    householdId,
    cursor,
    limit,
    dateFrom,
    dateTo,
    categoryKey,
    payerId,
    visibility,
    groupId,
    query,
    amountMin,
    amountMax,
    creatorId,
    sort,
  } = input

  // Build WHERE conditions and bind params.
  // Personal feed (no householdId): user sees their own private expenses
  //   plus household expenses where they are an active member.
  // Household feed (with householdId): only that household's shared expenses.
  const conditions: string[] = ['e.deleted_at IS NULL']
  const params: unknown[] = []

  if (householdId) {
    // Household feed: only household-visible expenses in that household.
    conditions.push('e.visibility = ?')
    params.push('household')
    conditions.push('e.household_id = ?')
    params.push(householdId)
  } else {
    // Personal feed: own private expenses OR household expenses
    // where user is an active member of that household.
    conditions.push(`(
      (
        e.visibility = 'private'
        AND e.created_by_user_id = ?
      )
      OR (
        e.visibility = 'household'
        AND e.household_id IN (
          SELECT hm.household_id
            FROM household_memberships hm
           WHERE hm.user_id = ?
             AND hm.state = 'active'
        )
      )
    )`)

    params.push(userId, userId)
  }

  // Optional filters
  if (dateFrom !== undefined) {
    conditions.push('e.occurred_at >= ?')
    params.push(dateFrom)
  }

  if (dateTo !== undefined) {
    conditions.push('e.occurred_at <= ?')
    params.push(dateTo)
  }

  if (categoryKey !== undefined) {
    conditions.push('e.category_key = ?')
    params.push(categoryKey)
  }

  if (payerId !== undefined) {
    conditions.push('e.payer_user_id = ?')
    params.push(payerId)
  }

  if (visibility !== undefined) {
    conditions.push('e.visibility = ?')
    params.push(visibility)
  }

  if (groupId !== undefined) {
    conditions.push(
      `e.id IN (
        SELECT eg.expense_id
          FROM expense_group_items eg
         WHERE eg.group_id = ?
      )`,
    )

    params.push(groupId)
  }

  if (query !== undefined) {
    conditions.push("LOWER(COALESCE(e.note, '')) LIKE ?")
    params.push(`%${query.toLowerCase()}%`)
  }

  if (amountMin !== undefined) {
    conditions.push('e.amount_minor >= ?')
    params.push(amountMin)
  }

  if (amountMax !== undefined) {
    conditions.push('e.amount_minor <= ?')
    params.push(amountMax)
  }

  if (creatorId !== undefined) {
    conditions.push('e.created_by_user_id = ?')
    params.push(creatorId)
  }

  // Cursor pagination: occurred_at DESC, id DESC for tie-breaking.
  // Cursor encodes "occurred_at:id" — we want rows BEFORE this cursor.
  if (cursor) {
    const decoded = decodeCursor(cursor)

    if (decoded) {
      if (sort === 'amount_desc') {
        if (decoded.sort !== 'amount_desc') {
          conditions.push('1 = 0')
        } else {
          conditions.push(`(
            e.amount_minor < ?
            OR (e.amount_minor = ? AND e.occurred_at < ?)
            OR (e.amount_minor = ? AND e.occurred_at = ? AND e.id < ?)
          )`)

          params.push(
            decoded.amountMinor,
            decoded.amountMinor,
            decoded.occurredAt,
            decoded.amountMinor,
            decoded.occurredAt,
            decoded.id,
          )
        }
      } else {
        conditions.push(
          '(e.occurred_at < ? OR (e.occurred_at = ? AND e.id < ?))',
        )

        params.push(decoded.occurredAt, decoded.occurredAt, decoded.id)
      }
    }
  }

  const whereClause = conditions.join(' AND ')

  // Fetch limit + 1 to determine if there's a next page.
  const fetchLimit = limit + 1

  const orderBy =
    sort === 'amount_desc'
      ? 'ORDER BY e.amount_minor DESC, e.occurred_at DESC, e.id DESC'
      : 'ORDER BY e.occurred_at DESC, e.id DESC'

  const querySql = `SELECT ${EXPENSE_COLUMNS}
     FROM expenses e
    WHERE ${whereClause}
    ${orderBy}
    LIMIT ?`

  params.push(fetchLimit)

  const result = await db
    .prepare(querySql)
    .bind(...params)
    .all<ExpenseRow>()

  const rows = result.results.map(mapRow)
  const hasMore = rows.length > limit
  const items = hasMore ? rows.slice(0, limit) : rows
  const nextCursor =
    hasMore && items.length > 0
      ? encodeCursor(sort, {
          amount_minor: items[items.length - 1].amountMinor,
          occurred_at: items[items.length - 1].occurredAt,
          id: items[items.length - 1].id,
        })
      : null

  return { items, nextCursor }
}

export const summarizeExpenses = async (
  db: D1Database,
  input: Pick<
    ListExpensesInput,
    | 'userId'
    | 'householdId'
    | 'dateFrom'
    | 'dateTo'
    | 'categoryKey'
    | 'payerId'
    | 'visibility'
    | 'groupId'
    | 'query'
    | 'amountMin'
    | 'amountMax'
    | 'creatorId'
  >,
): Promise<ExpenseSummaryResult> => {
  const { conditions, params } = buildVisibleExpenseConditions(
    input.userId,
    input.householdId,
  )

  if (input.query !== undefined) {
    conditions.push("LOWER(COALESCE(e.note, '')) LIKE ?")
    params.push(`%${input.query.toLowerCase()}%`)
  }

  if (input.dateFrom !== undefined) {
    conditions.push('e.occurred_at >= ?')
    params.push(input.dateFrom)
  }

  if (input.dateTo !== undefined) {
    conditions.push('e.occurred_at <= ?')
    params.push(input.dateTo)
  }

  if (input.categoryKey !== undefined) {
    conditions.push('e.category_key = ?')
    params.push(input.categoryKey)
  }

  if (input.payerId !== undefined) {
    conditions.push('e.payer_user_id = ?')
    params.push(input.payerId)
  }

  if (input.visibility !== undefined) {
    conditions.push('e.visibility = ?')
    params.push(input.visibility)
  }

  if (input.groupId !== undefined) {
    conditions.push(
      `e.id IN (
        SELECT eg.expense_id
          FROM expense_group_items eg
         WHERE eg.group_id = ?
      )`,
    )

    params.push(input.groupId)
  }

  if (input.amountMin !== undefined) {
    conditions.push('e.amount_minor >= ?')
    params.push(input.amountMin)
  }

  if (input.amountMax !== undefined) {
    conditions.push('e.amount_minor <= ?')
    params.push(input.amountMax)
  }

  if (input.creatorId !== undefined) {
    conditions.push('e.created_by_user_id = ?')
    params.push(input.creatorId)
  }

  const row = await db
    .prepare(
      `SELECT COUNT(*) AS expenseCount, COALESCE(SUM(e.amount_minor), 0) AS totalSpendMinor, MIN(e.currency_code) AS currencyCode FROM expenses e WHERE ${conditions.join(' AND ')}`,
    )
    .bind(...params)
    .first<{
      expenseCount: number
      totalSpendMinor: number
      currencyCode: string | null
    }>()

  return {
    expenseCount: Number(row?.expenseCount ?? 0),
    totalSpendMinor: Number(row?.totalSpendMinor ?? 0),
    currencyCode: row?.currencyCode ?? 'VND',
  }
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
    percentOfTotal: 0,
  }))

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

  return {
    period: input.period,
    householdId: input.householdId ?? null,
    currencyCode: 'VND',
    totalGroupedSpendMinor,
    groups: groups.map((group) => ({
      ...group,
      percentOfTotal:
        totalGroupedSpendMinor > 0
          ? Math.round((group.totalSpendMinor / totalGroupedSpendMinor) * 100)
          : 0,
    })),
  }
}

export const listDeletedExpensesByHousehold = async (
  db: D1Database,
  householdId: string,
): Promise<StoredExpense[]> => {
  const result = await db
    .prepare(
      `SELECT ${EXPENSE_COLUMNS}
         FROM expenses
        WHERE household_id = ?
          AND visibility = 'household'
          AND deleted_at IS NOT NULL
        ORDER BY deleted_at DESC, id DESC`,
    )
    .bind(householdId)
    .all<ExpenseRow>()

  return result.results.map(mapRow)
}
