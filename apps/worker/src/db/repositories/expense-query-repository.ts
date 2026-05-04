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
  const { conditions, params } = buildVisibleExpenseConditions(
    input.userId,
    input.householdId,
  )

  conditions.push('e.occurred_at >= ?')
  params.push(input.periodStart)
  conditions.push('e.occurred_at < ?')
  params.push(input.periodEnd)

  const whereClause = conditions.join(' AND ')

  const summaryRow = await db
    .prepare(
      `SELECT COUNT(*) AS expenseCount, COALESCE(SUM(e.amount_minor), 0) AS totalSpendMinor, MIN(e.currency_code) AS currencyCode FROM expenses e WHERE ${whereClause}`,
    )
    .bind(...params)
    .first<{
      expenseCount: number
      totalSpendMinor: number
      currencyCode: string | null
    }>()

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
