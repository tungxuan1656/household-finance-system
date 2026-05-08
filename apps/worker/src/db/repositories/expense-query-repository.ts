import type { ReferenceCategoryKey } from '@/contracts/reference-data'

import { buildAnalyticsExportCsv } from './expense-analytics-export'
import {
  getAnalyticsComparison,
  getAnalyticsGroups,
  getAnalyticsOverview,
} from './expense-analytics-repository'
import { decodeCursor, encodeCursor } from './expense-query-cursor'
import { buildPeriodWhereClause } from './expense-query-scope'
import type {
  ExpenseRow,
  ListExpensesInput,
  ListExpensesResult,
  StoredExpense,
} from './expense-repository'
import { mapRow } from './expense-repository'

export {
  getAnalyticsComparison,
  getAnalyticsGroups,
  getAnalyticsOverview,
} from './expense-analytics-repository'
export { decodeCursor } from './expense-query-cursor'

type AnalyticsQueryInput = {
  userId: string
  householdId?: string
  periodStart: number
  periodEnd: number
  period: string
}

type AnalyticsExportQueryInput = AnalyticsQueryInput

type AnalyticsExportExpenseRow = {
  id: string
  occurredAt: number
  categoryKey: ReferenceCategoryKey
  payerUserId: string
  visibility: 'private' | 'household'
  title: string
  amountMinor: number
}

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

export { summarizeExpenses } from './expense-summary-repository'

export const getAnalyticsExport = async (
  db: D1Database,
  input: AnalyticsExportQueryInput,
): Promise<string> => {
  const overview = await getAnalyticsOverview(db, input)
  const previousPeriodDate = new Date(`${input.period}-01T00:00:00.000Z`)
  previousPeriodDate.setUTCMonth(previousPeriodDate.getUTCMonth() - 1)

  const previousPeriod = previousPeriodDate.toISOString().slice(0, 7)
  const previousPeriodStart = Date.UTC(
    previousPeriodDate.getUTCFullYear(),
    previousPeriodDate.getUTCMonth(),
    1,
  )
  const previousPeriodEnd = Date.UTC(
    previousPeriodDate.getUTCFullYear(),
    previousPeriodDate.getUTCMonth() + 1,
    1,
  )
  const comparison = await getAnalyticsComparison(db, {
    ...input,
    previousPeriod,
    previousPeriodStart,
    previousPeriodEnd,
  })
  const groups = await getAnalyticsGroups(db, input)
  const { whereClause, params } = buildPeriodWhereClause(
    input.userId,
    input.householdId,
    input.periodStart,
    input.periodEnd,
  )

  const expenseRows = await db
    .prepare(
      `SELECT e.occurred_at AS occurredAt, e.category_key AS categoryKey, e.payer_user_id AS payerUserId, e.visibility AS visibility, e.title AS title, e.amount_minor AS amountMinor
              , e.id AS id
         FROM expenses e
        WHERE ${whereClause}
        ORDER BY e.occurred_at ASC, e.id ASC`,
    )
    .bind(...params)
    .all<AnalyticsExportExpenseRow>()

  return buildAnalyticsExportCsv({
    comparison,
    expenseRows: expenseRows.results,
    groups,
    overview,
  })
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
