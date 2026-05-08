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

export {
  findGroupIdsForExpense,
  findGroupIdsForExpenses,
  replaceExpenseGroupAssignments,
} from './expense-group-assignment-repository'
export { listExpensesByGroup } from './expense-group-expense-list-repository'
export {
  getExpenseGroupTotalSpend,
  getGroupSummary,
} from './expense-group-summary-repository'
