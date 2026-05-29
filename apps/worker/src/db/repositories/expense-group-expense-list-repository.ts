export interface ListExpensesByGroupInput {
  groupId: string
  cursor?: string
  limit: number
}

export interface ListExpensesByGroupResult {
  items: Array<{
    id: string
    title: string
    amountMinor: number
    currencyCode: string
    categoryKey: string
    sourceKey: string
    occurredAt: number
    spentByUserId: string
    note: string | null
    createdAt: number
    updatedAt: number
  }>
  nextCursor: string | null
}

export const listExpensesByGroup = async (
  db: D1Database,
  input: ListExpensesByGroupInput,
): Promise<ListExpensesByGroupResult> => {
  const limit = Math.min(input.limit, 100)

  let cursorClause = ''
  let cursorValue: number | null = null
  if (input.cursor) {
    try {
      cursorValue = Number(atob(input.cursor))
      cursorClause = 'AND e.occurred_at < ?3'
    } catch {
      // Invalid cursor ignored; will return first page
    }
  }

  const rows = await db
    .prepare(
      `SELECT e.id,
              e.title,
              e.amount_minor,
              e.currency_code,
              e.category_key,
              e.source_key,
              e.occurred_at,
              e.spent_by_user_id,
              e.note,
              e.created_at,
              e.updated_at
         FROM expense_group_items egi
         JOIN expenses e ON e.id = egi.expense_id AND e.deleted_at IS NULL
        WHERE egi.group_id = ?1
          ${cursorClause}
        ORDER BY e.occurred_at DESC
        LIMIT ?2`,
    )
    .bind(
      input.groupId,
      limit + 1,
      ...(cursorValue !== null ? [cursorValue] : []),
    )
    .all<{
      id: string
      title: string
      amount_minor: number
      currency_code: string
      category_key: string
      source_key: string
      occurred_at: number
      spent_by_user_id: string
      note: string | null
      created_at: number
      updated_at: number
    }>()

  const items = rows.results.slice(0, limit).map((row) => ({
    id: row.id,
    title: row.title,
    amountMinor: row.amount_minor,
    currencyCode: row.currency_code,
    categoryKey: row.category_key,
    sourceKey: row.source_key,
    occurredAt: row.occurred_at,
    spentByUserId: row.spent_by_user_id,
    note: row.note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }))

  let nextCursor: string | null = null
  if (rows.results.length > limit) {
    const last = items[items.length - 1]
    nextCursor = btoa(String(last.occurredAt))
  }

  return { items, nextCursor }
}
