// Input for creating an expense. This mirrors the handler output shape.
export interface CreateExpenseInput {
  id: string
  householdId: string | null
  createdByUserId: string
  payerUserId: string
  categoryKey: string
  sourceKey: string
  categoryId?: string | null
  amountMinor: number
  currencyCode: string
  occurredAt: number
  visibility: 'private' | 'household'
  title: string
  note?: string | null
}

// Keep this local file self-contained while reusing the repository pattern
// used by other repositories in this folder (eg. household-repository.ts).

export interface StoredExpense {
  id: string
  householdId: string | null
  createdByUserId: string
  payerUserId: string
  categoryKey: string
  sourceKey: string
  categoryId: string | null
  amountMinor: number
  currencyCode: string
  occurredAt: number
  visibility: 'private' | 'household'
  title: string
  note: string | null
  deletedAt: number | null
  createdAt: number
  updatedAt: number
}

// Internal shape for mapping DB rows to StoredExpense
type ExpenseRow = {
  id: string
  household_id: string
  created_by_user_id: string
  payer_user_id: string
  category_key: string
  source_key: string
  category_id: string | null
  amount_minor: number
  currency_code: string
  occurred_at: number
  visibility: 'private' | 'household'
  title: string
  note: string | null
  deleted_at: number | null
  created_at: number
  updated_at: number
}

const mapRow = (r: ExpenseRow): StoredExpense => ({
  id: r.id,
  householdId: r.household_id,
  createdByUserId: r.created_by_user_id,
  payerUserId: r.payer_user_id,
  categoryKey: r.category_key,
  sourceKey: r.source_key,
  categoryId: r.category_id,
  amountMinor: r.amount_minor,
  currencyCode: r.currency_code,
  occurredAt: r.occurred_at,
  visibility: r.visibility,
  title: r.title,
  note: r.note,
  deletedAt: r.deleted_at,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
})

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
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      input.id,
      input.householdId,
      input.createdByUserId,
      input.payerUserId,
      input.categoryKey,
      input.sourceKey,
      input.categoryId ?? null,
      input.amountMinor,
      input.currencyCode,
      input.occurredAt,
      input.visibility,
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

export const findExpenseById = async (
  db: D1Database,
  expenseId: string,
): Promise<StoredExpense | null> => {
  const row = await db
    .prepare(
      `SELECT id,
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
