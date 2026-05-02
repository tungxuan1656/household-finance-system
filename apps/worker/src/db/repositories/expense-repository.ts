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
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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

// Fetch expense by ID without visibility check.
// The handler is responsible for checking access rights.
export const findExpenseByIdRaw = async (
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
          AND deleted_at IS NULL
        LIMIT 1`,
    )
    .bind(expenseId)
    .first<ExpenseRow>()

  if (!row) return null

  return mapRow(row)
}

export interface ListExpensesInput {
  userId: string
  householdId?: string
  cursor?: string
  limit: number
  dateFrom?: number
  dateTo?: number
  categoryKey?: string
  payerId?: string
  visibility?: 'private' | 'household'
}

export interface ListExpensesResult {
  items: StoredExpense[]
  nextCursor: string | null
}

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
  } = input

  // Build WHERE conditions and bind params.
  // Personal feed (no householdId): user sees their own expenses
  //   (private + household they created) plus household expenses
  //   where they are a member.
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
    // Personal feed: expenses where user is creator OR
    // household expenses where user is a member of that household.
    conditions.push(`(
      e.created_by_user_id = ?
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
