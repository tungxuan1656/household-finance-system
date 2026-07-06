import type { IncomeRow, StoredIncome } from './income-row-mapper'
import { mapIncomeRow } from './income-row-mapper'

export {
  type IncomeRow,
  mapIncomeRow,
  type StoredIncome,
} from './income-row-mapper'

// Explicit column list for SELECT queries.
const INCOME_COLUMNS = `
  id,
  spent_by_user_id,
  amount_minor,
  currency_code,
  occurred_at,
  title,
  note,
  category_key,
  source_key,
  kind,
  deleted_at,
  created_at,
  updated_at`

export interface CreateIncomeInput {
  id: string
  spentByUserId: string
  sourceKey: string
  amountMinor: number
  currencyCode: string
  occurredAt: number
  title: string
  note?: string | null
}

export const createIncome = async (
  db: D1Database,
  input: CreateIncomeInput,
): Promise<StoredIncome> => {
  const now = Date.now()

  await db
    .prepare(
      `INSERT INTO incomes (
        id,
        spent_by_user_id,
        amount_minor,
        currency_code,
        occurred_at,
        title,
        note,
        category_key,
        source_key,
        kind,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'money-in', ?, 'income', ?, ?)`,
    )
    .bind(
      input.id,
      input.spentByUserId,
      input.amountMinor,
      input.currencyCode,
      input.occurredAt,
      input.title,
      input.note ?? null,
      input.sourceKey,
      now,
      now,
    )
    .run()

  // Retrieve the inserted row
  const row = await db
    .prepare(
      `SELECT ${INCOME_COLUMNS}
         FROM incomes
        WHERE id = ?
        LIMIT 1`,
    )
    .bind(input.id)
    .first<IncomeRow>()

  if (!row) {
    throw new Error('Failed to create income: no row returned')
  }

  return mapIncomeRow(row)
}

export interface ListIncomesInput {
  userId: string
  cursor?: string
  limit: number
  dateFrom?: number
  dateTo?: number
  sourceKey?: string
}

export interface ListIncomesResult {
  items: StoredIncome[]
  nextCursor: string | null
}

/**
 * Decode a cursor string: base64("occurred_at:id").
 * Returns null on invalid format.
 */
export const decodeIncomeCursor = (
  cursor: string,
): { occurredAt: number; id: string } | null => {
  try {
    const decoded = atob(cursor)
    const parts = decoded.split(':')

    if (parts.length !== 2) return null

    const occurredAt = Number(parts[0])
    const id = parts[1]

    if (!occurredAt || !id) return null

    return { occurredAt, id }
  } catch {
    return null
  }
}

/**
 * Encode a cursor string: base64("occurred_at:id").
 */
const encodeIncomeCursor = (
  income: Pick<IncomeRow, 'occurred_at' | 'id'>,
): string => btoa(`${income.occurred_at}:${income.id}`)

export const listIncomes = async (
  db: D1Database,
  input: ListIncomesInput,
): Promise<ListIncomesResult> => {
  const { userId, cursor, limit, dateFrom, dateTo, sourceKey } = input

  const conditions: string[] = ['spent_by_user_id = ?', 'deleted_at IS NULL']
  const params: unknown[] = [userId]

  if (dateFrom !== undefined) {
    conditions.push('occurred_at >= ?')
    params.push(dateFrom)
  }

  if (dateTo !== undefined) {
    conditions.push('occurred_at <= ?')
    params.push(dateTo)
  }

  if (sourceKey !== undefined) {
    conditions.push('source_key = ?')
    params.push(sourceKey)
  }

  // Cursor pagination: occurred_at DESC, id DESC for tie-breaking.
  if (cursor) {
    const decoded = decodeIncomeCursor(cursor)

    if (decoded) {
      conditions.push('(occurred_at < ? OR (occurred_at = ? AND id < ?))')

      params.push(decoded.occurredAt, decoded.occurredAt, decoded.id)
    }
  }

  const whereClause = conditions.join(' AND ')

  // Fetch limit + 1 to determine if there's a next page.
  const fetchLimit = limit + 1

  const querySql = `SELECT ${INCOME_COLUMNS}
     FROM incomes
    WHERE ${whereClause}
    ORDER BY occurred_at DESC, id DESC
    LIMIT ?`

  params.push(fetchLimit)

  const result = await db
    .prepare(querySql)
    .bind(...params)
    .all<IncomeRow>()

  const rows = result.results.map(mapIncomeRow)
  const hasMore = rows.length > limit
  const items = hasMore ? rows.slice(0, limit) : rows
  const nextCursor =
    hasMore && items.length > 0
      ? encodeIncomeCursor({
          occurred_at: items[items.length - 1].occurredAt,
          id: items[items.length - 1].id,
        })
      : null

  return { items, nextCursor }
}
