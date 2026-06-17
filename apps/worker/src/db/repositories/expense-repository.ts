import {
  type ExpenseRow,
  mapRow,
  type StoredExpense,
} from './expense-row-mapper'

export {
  type ExpenseRow,
  mapRow,
  type StoredExpense,
} from './expense-row-mapper'

// Input for creating an expense. This mirrors the handler output shape.
export interface CreateExpenseInput {
  id: string
  householdId: string | null
  spentByUserId: string
  categoryKey: string
  sourceKey: string
  categoryId?: string | null
  amountMinor: number
  currencyCode: string
  occurredAt: number
  title: string
  note?: string | null
}

export const createExpense = async (
  db: D1Database,
  input: CreateExpenseInput,
): Promise<StoredExpense> => {
  const now = Date.now()

  // Explicit column insert to avoid SELECT * patterns
  await db
    .prepare(
      `INSERT INTO expenses (
        id,
        household_id,
        spent_by_user_id,
        category_key,
        source_key,
        category_id,
        amount_minor,
        currency_code,
        occurred_at,
        title,
        note,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      input.id,
      input.householdId,
      input.spentByUserId,
      input.categoryKey,
      input.sourceKey,
      input.categoryId ?? null,
      input.amountMinor,
      input.currencyCode,
      input.occurredAt,
      input.title,
      input.note ?? null,
      now,
      now,
    )
    .run()

  // Retrieve the inserted row to return a fully mapped StoredExpense
  const row = await db
    .prepare(
      `SELECT id,
              household_id,
              spent_by_user_id,
              category_key,
              source_key,
              category_id,
              amount_minor,
              currency_code,
              occurred_at,
              title,
              note,
              deleted_at,
              created_at,
              updated_at
         FROM expenses
        WHERE id = ?
        LIMIT 1`,
    )
    .bind(input.id)
    .first<ExpenseRow>()

  if (!row) {
    throw new Error('Failed to create expense: no row returned')
  }

  return mapRow(row)
}

// Fetch expense by ID without access check.
// The handler is responsible for checking access rights.
export const findExpenseByIdRaw = async (
  db: D1Database,
  expenseId: string,
): Promise<StoredExpense | null> => {
  const row = await db
    .prepare(
      `SELECT id,
              household_id,
              spent_by_user_id,
              category_key,
              source_key,
              category_id,
              amount_minor,
              currency_code,
              occurred_at,
              title,
              note,
              deleted_at,
              created_at,
              updated_at
         FROM expenses
        WHERE id = ?
          AND deleted_at IS NULL
        LIMIT 1`,
    )
    .bind(expenseId)
    .first<ExpenseRow>()

  if (!row) return null

  return mapRow(row)
}

export const findExpenseByIdIncludingDeleted = async (
  db: D1Database,
  expenseId: string,
): Promise<StoredExpense | null> => {
  const row = await db
    .prepare(
      `SELECT id,
              household_id,
              spent_by_user_id,
              category_key,
              source_key,
              category_id,
              amount_minor,
              currency_code,
              occurred_at,
              title,
              note,
              deleted_at,
              created_at,
              updated_at
         FROM expenses
        WHERE id = ?
        LIMIT 1`,
    )
    .bind(expenseId)
    .first<ExpenseRow>()

  if (!row) return null

  return mapRow(row)
}

export interface UpdateExpenseInput {
  expenseId: string
  householdId: string | null
  spentByUserId: string
  categoryKey: string
  sourceKey: string
  categoryId?: string | null
  amountMinor: number
  currencyCode: string
  occurredAt: number
  title: string
  note: string | null
}

export const updateExpense = async (
  db: D1Database,
  input: UpdateExpenseInput,
): Promise<StoredExpense | null> => {
  const now = Date.now()

  const setClauses: string[] = []
  const params: unknown[] = []

  setClauses.push('household_id = ?')
  params.push(input.householdId)
  setClauses.push('spent_by_user_id = ?')
  params.push(input.spentByUserId)
  setClauses.push('category_key = ?')
  params.push(input.categoryKey)
  setClauses.push('source_key = ?')
  params.push(input.sourceKey)

  if (input.categoryId !== undefined) {
    setClauses.push('category_id = ?')
    params.push(input.categoryId)
  }

  setClauses.push('amount_minor = ?')
  params.push(input.amountMinor)
  setClauses.push('currency_code = ?')
  params.push(input.currencyCode)
  setClauses.push('occurred_at = ?')
  params.push(input.occurredAt)
  setClauses.push('title = ?')
  params.push(input.title)
  setClauses.push('note = ?')
  params.push(input.note)
  setClauses.push('updated_at = ?')
  params.push(now)

  params.push(input.expenseId)

  const result = await db
    .prepare(
      `UPDATE expenses
          SET ${setClauses.join(', ')}
        WHERE id = ?
          AND deleted_at IS NULL`,
    )
    .bind(...params)
    .run()

  if (Number(result.meta.changes ?? 0) !== 1) {
    return null
  }

  return findExpenseByIdRaw(db, input.expenseId)
}

export const softDeleteExpense = async (
  db: D1Database,
  expenseId: string,
): Promise<boolean> => {
  const now = Date.now()
  const result = await db
    .prepare(
      `UPDATE expenses
          SET deleted_at = ?,
              updated_at = ?
        WHERE id = ?
          AND deleted_at IS NULL`,
    )
    .bind(now, now, expenseId)
    .run()

  return Number(result.meta.changes ?? 0) === 1
}

export const restoreExpense = async (
  db: D1Database,
  expenseId: string,
): Promise<StoredExpense | null> => {
  const now = Date.now()
  const result = await db
    .prepare(
      `UPDATE expenses
          SET deleted_at = NULL,
              updated_at = ?
        WHERE id = ?
          AND deleted_at IS NOT NULL`,
    )
    .bind(now, expenseId)
    .run()

  if (Number(result.meta.changes ?? 0) !== 1) {
    return null
  }

  return findExpenseByIdRaw(db, expenseId)
}

export interface ListExpensesInput {
  userId: string
  householdId?: string
  cursor?: string
  limit: number
  dateFrom?: number
  dateTo?: number
  categoryKey?: string
  groupId?: string
  query?: string
  amountMin?: number
  amountMax?: number
  spentByUserId?: string
  sort?: 'occurred_at_desc' | 'amount_desc'
}

export interface ListExpensesResult {
  items: StoredExpense[]
  nextCursor: string | null
}

export interface ExpenseSummaryResult {
  totalSpendMinor: number
  expenseCount: number
  currencyCode: string
}
