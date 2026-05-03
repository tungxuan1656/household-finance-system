import type {
  ExpenseRow,
  ListExpensesInput,
  ListExpensesResult,
  StoredExpense,
} from './expense-repository'
import { mapRow } from './expense-repository'

// Decode a composite cursor (base64 of "occurred_at:id") into its parts.
// Returns null if the cursor format is invalid.
export const decodeCursor = (
  cursor: string,
): { occurredAt: number; id: string } | null => {
  try {
    const decoded = atob(cursor)
    const separatorIndex = decoded.indexOf(':')

    if (separatorIndex === -1) return null

    const occurredAt = Number(decoded.slice(0, separatorIndex))
    const id = decoded.slice(separatorIndex + 1)

    if (!occurredAt || !id) return null

    return { occurredAt, id }
  } catch {
    return null
  }
}

// Encode occurred_at and id into a composite cursor.
const encodeCursor = (occurredAt: number, id: string): string =>
  btoa(`${occurredAt}:${id}`)

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

  // Cursor pagination: occurred_at DESC, id DESC for tie-breaking.
  // Cursor encodes "occurred_at:id" — we want rows BEFORE this cursor.
  if (cursor) {
    const decoded = decodeCursor(cursor)

    if (decoded) {
      conditions.push('(e.occurred_at < ? OR (e.occurred_at = ? AND e.id < ?))')
      params.push(decoded.occurredAt, decoded.occurredAt, decoded.id)
    }
  }

  const whereClause = conditions.join(' AND ')

  // Fetch limit + 1 to determine if there's a next page.
  const fetchLimit = limit + 1

  const query = `SELECT ${EXPENSE_COLUMNS}
    FROM expenses e
   WHERE ${whereClause}
   ORDER BY e.occurred_at DESC, e.id DESC
   LIMIT ?`

  params.push(fetchLimit)

  const result = await db
    .prepare(query)
    .bind(...params)
    .all<ExpenseRow>()

  const rows = result.results.map(mapRow)
  const hasMore = rows.length > limit
  const items = hasMore ? rows.slice(0, limit) : rows
  const nextCursor =
    hasMore && items.length > 0
      ? encodeCursor(
          items[items.length - 1].occurredAt,
          items[items.length - 1].id,
        )
      : null

  return { items, nextCursor }
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
