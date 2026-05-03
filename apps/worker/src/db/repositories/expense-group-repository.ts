import { newId } from '@/utils/id'

export interface StoredExpenseGroup {
  id: string
  householdId: string
  name: string
  description: string | null
  status: 'active' | 'archived'
  startDate: number | null
  endDate: number | null
  eventBudgetMinor: number | null
  totalSpendMinor: number
  createdByUserId: string
  archivedAt: number | null
  createdAt: number
  updatedAt: number
}

export interface CreateExpenseGroupInput {
  householdId: string
  name: string
  description?: string | null
  startDate?: number | null
  endDate?: number | null
  eventBudgetMinor?: number | null
  createdByUserId: string
}

export interface UpdateExpenseGroupInput {
  name?: string
  description?: string | null
  startDate?: number | null
  endDate?: number | null
  eventBudgetMinor?: number | null
}

// Internal shape for mapping DB rows to StoredExpenseGroup
type ExpenseGroupRow = {
  id: string
  household_id: string
  name: string
  description: string | null
  status: 'active' | 'archived'
  start_date: string | null
  end_date: string | null
  event_budget_minor: number | null
  total_spend_minor: number
  created_by_user_id: string
  archived_at: number | null
  created_at: number
  updated_at: number
}

const mapRow = (r: ExpenseGroupRow): StoredExpenseGroup => ({
  id: r.id,
  householdId: r.household_id,
  name: r.name,
  description: r.description,
  status: r.status,
  startDate: r.start_date !== null ? Number(r.start_date) : null,
  endDate: r.end_date !== null ? Number(r.end_date) : null,
  eventBudgetMinor: r.event_budget_minor,
  totalSpendMinor: r.total_spend_minor,
  createdByUserId: r.created_by_user_id,
  archivedAt: r.archived_at,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
})

// Columns used for explicit SELECT statements (without total_spend_minor since
// it is computed via JOIN only in specific queries).
const BASE_COLUMNS = `
  eg.id,
  eg.household_id,
  eg.name,
  eg.description,
  eg.status,
  eg.start_date,
  eg.end_date,
  eg.event_budget_minor,
  eg.created_by_user_id,
  eg.archived_at,
  eg.created_at,
  eg.updated_at
`

export const createExpenseGroup = async (
  db: D1Database,
  input: CreateExpenseGroupInput,
): Promise<StoredExpenseGroup> => {
  const id = newId()
  const now = Date.now()

  await db
    .prepare(
      `INSERT INTO expense_groups (
        id,
        household_id,
        name,
        description,
        status,
        start_date,
        end_date,
        event_budget_minor,
        created_by_user_id,
        archived_at,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, 'active', ?, ?, ?, ?, NULL, ?, ?)`,
    )
    .bind(
      id,
      input.householdId,
      input.name,
      input.description ?? null,
      input.startDate !== undefined ? String(input.startDate) : null,
      input.endDate !== undefined ? String(input.endDate) : null,
      input.eventBudgetMinor ?? null,
      input.createdByUserId,
      now,
      now,
    )
    .run()

  return mapRow({
    id,
    household_id: input.householdId,
    name: input.name,
    description: input.description ?? null,
    status: 'active' as const,
    start_date: input.startDate !== undefined ? String(input.startDate) : null,
    end_date: input.endDate !== undefined ? String(input.endDate) : null,
    event_budget_minor: input.eventBudgetMinor ?? null,
    total_spend_minor: 0,
    created_by_user_id: input.createdByUserId,
    archived_at: null,
    created_at: now,
    updated_at: now,
  })
}

export const listExpenseGroupsByHousehold = async (
  db: D1Database,
  householdId: string,
): Promise<StoredExpenseGroup[]> => {
  const result = await db
    .prepare(
      `SELECT ${BASE_COLUMNS},
              COALESCE(SUM(e.amount_minor), 0) AS total_spend_minor
         FROM expense_groups eg
         LEFT JOIN expense_group_items egi ON egi.group_id = eg.id
         LEFT JOIN expenses e ON e.id = egi.expense_id AND e.deleted_at IS NULL
        WHERE eg.household_id = ?
          AND eg.status = 'active'
          AND eg.archived_at IS NULL
        GROUP BY eg.id
        ORDER BY eg.created_at DESC`,
    )
    .bind(householdId)
    .all<ExpenseGroupRow>()

  return result.results.map((row) => mapRow(row))
}

export const findExpenseGroupById = async (
  db: D1Database,
  groupId: string,
): Promise<StoredExpenseGroup | null> => {
  const row = await db
    .prepare(
      `SELECT ${BASE_COLUMNS},
              COALESCE(SUM(e.amount_minor), 0) AS total_spend_minor
         FROM expense_groups eg
         LEFT JOIN expense_group_items egi ON egi.group_id = eg.id
         LEFT JOIN expenses e ON e.id = egi.expense_id AND e.deleted_at IS NULL
        WHERE eg.id = ?
          AND eg.status = 'active'
          AND eg.archived_at IS NULL
        GROUP BY eg.id
        LIMIT 1`,
    )
    .bind(groupId)
    .first<ExpenseGroupRow>()

  if (!row) return null

  return mapRow(row)
}

export const findExpenseGroupByIdIncludingArchived = async (
  db: D1Database,
  groupId: string,
): Promise<StoredExpenseGroup | null> => {
  const row = await db
    .prepare(
      `SELECT ${BASE_COLUMNS}
         FROM expense_groups eg
        WHERE eg.id = ?
        LIMIT 1`,
    )
    .bind(groupId)
    .first<ExpenseGroupRow>()

  if (!row) return null

  return mapRow({ ...row, total_spend_minor: 0 })
}

export const updateExpenseGroup = async (
  db: D1Database,
  groupId: string,
  input: UpdateExpenseGroupInput,
): Promise<boolean> => {
  const now = Date.now()

  const result = await db
    .prepare(
      `UPDATE expense_groups
          SET name = CASE
                WHEN ?1 THEN ?2
                ELSE name
              END,
              description = CASE
                WHEN ?3 THEN ?4
                ELSE description
              END,
              start_date = CASE
                WHEN ?5 THEN ?6
                ELSE start_date
              END,
              end_date = CASE
                WHEN ?7 THEN ?8
                ELSE end_date
              END,
              event_budget_minor = CASE
                WHEN ?9 THEN ?10
                ELSE event_budget_minor
              END,
              updated_at = ?11
        WHERE id = ?12
          AND status = 'active'
          AND archived_at IS NULL`,
    )
    .bind(
      input.name !== undefined ? 1 : 0,
      input.name ?? null,
      input.description !== undefined ? 1 : 0,
      input.description !== undefined ? (input.description ?? null) : null,
      input.startDate !== undefined ? 1 : 0,
      input.startDate !== undefined
        ? input.startDate !== null
          ? String(input.startDate)
          : null
        : null,
      input.endDate !== undefined ? 1 : 0,
      input.endDate !== undefined
        ? input.endDate !== null
          ? String(input.endDate)
          : null
        : null,
      input.eventBudgetMinor !== undefined ? 1 : 0,
      input.eventBudgetMinor ?? null,
      now,
      groupId,
    )
    .run()

  return Number(result.meta.changes ?? 0) === 1
}

export const archiveExpenseGroup = async (
  db: D1Database,
  groupId: string,
): Promise<boolean> => {
  const now = Date.now()
  const result = await db
    .prepare(
      `UPDATE expense_groups
          SET status = 'archived',
              archived_at = ?1,
              updated_at = ?1
        WHERE id = ?2
          AND status = 'active'
          AND archived_at IS NULL`,
    )
    .bind(now, groupId)
    .run()

  return Number(result.meta.changes ?? 0) === 1
}

export const getExpenseGroupTotalSpend = async (
  db: D1Database,
  groupId: string,
): Promise<number> => {
  const row = await db
    .prepare(
      `SELECT COALESCE(SUM(e.amount_minor), 0) AS total
         FROM expense_group_items egi
         LEFT JOIN expenses e ON e.id = egi.expense_id AND e.deleted_at IS NULL
        WHERE egi.group_id = ?`,
    )
    .bind(groupId)
    .first<{ total: number }>()

  return row?.total ?? 0
}

export const findGroupIdsForExpense = async (
  db: D1Database,
  expenseId: string,
): Promise<string[]> => {
  const rows = await db
    .prepare(
      `SELECT group_id
         FROM expense_group_items
        WHERE expense_id = ?`,
    )
    .bind(expenseId)
    .all<{ group_id: string }>()

  return rows.results.map((r) => r.group_id)
}

export const findGroupIdsForExpenses = async (
  db: D1Database,
  expenseIds: string[],
): Promise<Map<string, string[]>> => {
  if (expenseIds.length === 0) {
    return new Map()
  }

  const placeholders = expenseIds.map(() => '?').join(',')
  const rows = await db
    .prepare(
      `SELECT expense_id, group_id
         FROM expense_group_items
        WHERE expense_id IN (${placeholders})`,
    )
    .bind(...expenseIds)
    .all<{ expense_id: string; group_id: string }>()

  const map = new Map<string, string[]>()
  for (const r of rows.results) {
    const arr = map.get(r.expense_id) ?? []
    arr.push(r.group_id)
    map.set(r.expense_id, arr)
  }

  return map
}

// Replace all group assignments for an expense. This is idempotent (delete then insert).
export const replaceExpenseGroupAssignments = async (
  db: D1Database,
  expenseId: string,
  householdId: string,
  groupIds: string[],
): Promise<void> => {
  const statements: D1PreparedStatement[] = []

  // Delete existing assignments for this expense+household
  statements.push(
    db
      .prepare(
        `DELETE FROM expense_group_items
          WHERE expense_id = ? AND household_id = ?`,
      )
      .bind(expenseId, householdId),
  )

  // Insert new assignments
  const now = Date.now()
  for (const groupId of groupIds) {
    statements.push(
      db
        .prepare(
          `INSERT INTO expense_group_items (
            id, household_id, expense_id, group_id, assigned_by_user_id, created_at
          ) VALUES (?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          newId(),
          householdId,
          expenseId,
          groupId,
          '', // assignedByUserId is filled by caller if needed; kept for schema compat
          now,
        ),
    )
  }

  await db.batch(statements)
}

export interface GroupSummaryResult {
  totalSpendMinor: number
  expenseCount: number
  budgetRemainingMinor: number | null
  memberContributions: Array<{
    userId: string
    displayName: string | null
    totalSpendMinor: number
    expenseCount: number
  }>
}

export const getGroupSummary = async (
  db: D1Database,
  groupId: string,
  eventBudgetMinor: number | null,
): Promise<GroupSummaryResult> => {
  const totalRow = await db
    .prepare(
      `SELECT COALESCE(SUM(e.amount_minor), 0) AS total_spend,
              COUNT(DISTINCT e.id) AS expense_count
         FROM expense_group_items egi
         JOIN expenses e ON e.id = egi.expense_id AND e.deleted_at IS NULL
        WHERE egi.group_id = ?`,
    )
    .bind(groupId)
    .first<{ total_spend: number; expense_count: number }>()

  const totalSpendMinor = Number(totalRow?.total_spend ?? 0)
  const expenseCount = Number(totalRow?.expense_count ?? 0)

  const memberRows = await db
    .prepare(
      `SELECT e.payer_user_id AS user_id,
              COALESCE(u.display_name, e.payer_user_id) AS display_name,
              COALESCE(SUM(e.amount_minor), 0) AS total_spend,
              COUNT(DISTINCT e.id) AS expense_count
         FROM expense_group_items egi
         JOIN expenses e ON e.id = egi.expense_id AND e.deleted_at IS NULL
         LEFT JOIN users u ON u.id = e.payer_user_id
        WHERE egi.group_id = ?
        GROUP BY e.payer_user_id`,
    )
    .bind(groupId)
    .all<{
      user_id: string
      display_name: string | null
      total_spend: number
      expense_count: number
    }>()

  const memberContributions = memberRows.results.map((r) => ({
    userId: r.user_id,
    displayName: r.display_name,
    totalSpendMinor: Number(r.total_spend),
    expenseCount: Number(r.expense_count),
  }))

  return {
    totalSpendMinor,
    expenseCount,
    budgetRemainingMinor:
      eventBudgetMinor !== null ? eventBudgetMinor - totalSpendMinor : null,
    memberContributions,
  }
}

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
    visibility: 'private' | 'household'
    payerUserId: string
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
              e.visibility,
              e.payer_user_id,
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
      visibility: 'private' | 'household'
      payer_user_id: string
      note: string | null
      created_at: number
      updated_at: number
    }>()

  const items = rows.results.slice(0, limit).map((r) => ({
    id: r.id,
    title: r.title,
    amountMinor: r.amount_minor,
    currencyCode: r.currency_code,
    categoryKey: r.category_key,
    sourceKey: r.source_key,
    occurredAt: r.occurred_at,
    visibility: r.visibility,
    payerUserId: r.payer_user_id,
    note: r.note,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }))

  let nextCursor: string | null = null
  if (rows.results.length > limit) {
    const last = items[items.length - 1]
    nextCursor = btoa(String(last.occurredAt))
  }

  return { items, nextCursor }
}
