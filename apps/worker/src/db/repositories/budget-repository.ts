import { newId } from '@/utils/id'

export interface StoredBudget {
  id: string
  householdId: string
  scope: 'household'
  budgetMonth: string
  startDate: string | null
  endDate: string | null
  currencyCode: string
  totalLimitMinor: number
  categoryId: string | null
  createdByUserId: string
  archivedAt: number | null
  createdAt: number
  updatedAt: number
}

export interface StoredBudgetLimit {
  id: string
  budgetId: string
  householdId: string
  categoryId: string | null
  categoryKey: string | null
  limitMinor: number
  createdAt: number
  updatedAt: number
}

export interface CreateBudgetInput {
  householdId: string
  period: string // YYYY-MM
  totalLimitMinor: number
  currencyCode: string
  createdByUserId: string
  categoryLimits?: Array<{ categoryKey: string; limitMinor: number }>
}

export interface UpdateBudgetInput {
  totalLimitMinor?: number
  categoryLimits?: Array<{ categoryKey: string; limitMinor: number }>
}

type BudgetRow = {
  id: string
  household_id: string
  scope: 'household'
  budget_month: string
  start_date: string | null
  end_date: string | null
  currency_code: string
  total_limit_minor: number
  category_id: string | null
  created_by_user_id: string
  archived_at: number | null
  created_at: number
  updated_at: number
}

type BudgetLimitRow = {
  id: string
  budget_id: string
  household_id: string
  category_id: string | null
  category_key: string | null
  limit_minor: number
  created_at: number
  updated_at: number
}

const mapBudgetRow = (r: BudgetRow): StoredBudget => ({
  id: r.id,
  householdId: r.household_id,
  scope: r.scope,
  budgetMonth: r.budget_month,
  startDate: r.start_date,
  endDate: r.end_date,
  currencyCode: r.currency_code,
  totalLimitMinor: r.total_limit_minor,
  categoryId: r.category_id,
  createdByUserId: r.created_by_user_id,
  archivedAt: r.archived_at,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
})

const mapBudgetLimitRow = (r: BudgetLimitRow): StoredBudgetLimit => ({
  id: r.id,
  budgetId: r.budget_id,
  householdId: r.household_id,
  categoryId: r.category_id,
  categoryKey: r.category_key,
  limitMinor: r.limit_minor,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
})

const BUDGET_COLUMNS = `
  b.id,
  b.household_id,
  b.scope,
  b.budget_month,
  b.start_date,
  b.end_date,
  b.currency_code,
  b.total_limit_minor,
  b.category_id,
  b.created_by_user_id,
  b.archived_at,
  b.created_at,
  b.updated_at
`

const BUDGET_LIMIT_COLUMNS = `
  bl.id,
  bl.budget_id,
  bl.household_id,
  bl.category_id,
  bl.category_key,
  bl.limit_minor,
  bl.created_at,
  bl.updated_at
`

/**
 * Compute start_date and end_date from a YYYY-MM period string.
 * start_date = first day of month (YYYY-MM-01)
 * end_date = last day of month (YYYY-MM-DD where DD depends on month)
 */
const computeDateRange = (
  period: string,
): { startDate: string; endDate: string } => {
  const [yearStr, monthStr] = period.split('-')
  const year = parseInt(yearStr, 10)
  const month = parseInt(monthStr, 10)
  const startDate = `${yearStr}-${monthStr}-01`
  // Last day of month: day 0 of next month
  const nextMonth = month === 12 ? 1 : month + 1
  const nextYear = month === 12 ? year + 1 : year
  const lastDay = new Date(nextYear, nextMonth - 1, 0).getDate()
  const endDate = `${yearStr}-${monthStr}-${String(lastDay).padStart(2, '0')}`

  return { startDate, endDate }
}

export const createBudget = async (
  db: D1Database,
  input: CreateBudgetInput,
): Promise<StoredBudget> => {
  const id = newId()
  const now = Date.now()
  const { startDate, endDate } = computeDateRange(input.period)

  const statements: D1PreparedStatement[] = []

  // Insert budget
  statements.push(
    db
      .prepare(
        `INSERT INTO budgets (
          id, household_id, scope, budget_month, start_date, end_date,
          currency_code, total_limit_minor, category_id, created_by_user_id,
          archived_at, created_at, updated_at
        ) VALUES (?, ?, 'household', ?, ?, ?, ?, ?, NULL, ?, NULL, ?, ?)`,
      )
      .bind(
        id,
        input.householdId,
        input.period,
        startDate,
        endDate,
        input.currencyCode,
        input.totalLimitMinor,
        input.createdByUserId,
        now,
        now,
      ),
  )

  // Insert category limits if provided
  if (input.categoryLimits && input.categoryLimits.length > 0) {
    for (const cl of input.categoryLimits) {
      const limitId = newId()

      statements.push(
        db
          .prepare(
            `INSERT INTO budget_limits (
              id, budget_id, household_id, category_id, category_key, limit_minor, created_at, updated_at
            ) VALUES (?, ?, ?, NULL, ?, ?, ?, ?)`,
          )
          .bind(
            limitId,
            id,
            input.householdId,
            cl.categoryKey,
            cl.limitMinor,
            now,
            now,
          ),
      )
    }
  }

  await db.batch(statements)

  return mapBudgetRow({
    id,
    household_id: input.householdId,
    scope: 'household' as const,
    budget_month: input.period,
    start_date: startDate,
    end_date: endDate,
    currency_code: input.currencyCode,
    total_limit_minor: input.totalLimitMinor,
    category_id: null,
    created_by_user_id: input.createdByUserId,
    archived_at: null,
    created_at: now,
    updated_at: now,
  })
}

export const findBudgetById = async (
  db: D1Database,
  budgetId: string,
): Promise<StoredBudget | null> => {
  const row = await db
    .prepare(
      `SELECT ${BUDGET_COLUMNS}
         FROM budgets b
        WHERE b.id = ?
          AND b.archived_at IS NULL
        LIMIT 1`,
    )
    .bind(budgetId)
    .first<BudgetRow>()

  if (!row) return null

  return mapBudgetRow(row)
}

export const findBudgetByPeriod = async (
  db: D1Database,
  householdId: string,
  period: string,
): Promise<StoredBudget | null> => {
  const row = await db
    .prepare(
      `SELECT ${BUDGET_COLUMNS}
         FROM budgets b
        WHERE b.household_id = ?
          AND b.budget_month = ?
          AND b.scope = 'household'
          AND b.archived_at IS NULL
        LIMIT 1`,
    )
    .bind(householdId, period)
    .first<BudgetRow>()

  if (!row) return null

  return mapBudgetRow(row)
}

export const listBudgetsByHousehold = async (
  db: D1Database,
  householdId: string,
): Promise<StoredBudget[]> => {
  const result = await db
    .prepare(
      `SELECT ${BUDGET_COLUMNS}
         FROM budgets b
        WHERE b.household_id = ?
          AND b.archived_at IS NULL
        ORDER BY b.budget_month DESC`,
    )
    .bind(householdId)
    .all<BudgetRow>()

  return result.results.map(mapBudgetRow)
}

export const findBudgetLimits = async (
  db: D1Database,
  budgetId: string,
): Promise<StoredBudgetLimit[]> => {
  const result = await db
    .prepare(
      `SELECT ${BUDGET_LIMIT_COLUMNS}
         FROM budget_limits bl
        WHERE bl.budget_id = ?
        ORDER BY bl.category_key`,
    )
    .bind(budgetId)
    .all<BudgetLimitRow>()

  return result.results.map(mapBudgetLimitRow)
}

export const updateBudget = async (
  db: D1Database,
  budgetId: string,
  input: UpdateBudgetInput,
): Promise<boolean> => {
  const now = Date.now()
  const statements: D1PreparedStatement[] = []

  // Update budget fields
  if (input.totalLimitMinor !== undefined) {
    statements.push(
      db
        .prepare(
          `UPDATE budgets
              SET total_limit_minor = ?,
                  updated_at = ?
            WHERE id = ?
              AND archived_at IS NULL`,
        )
        .bind(input.totalLimitMinor, now, budgetId),
    )
  } else {
    // Still update updated_at timestamp
    statements.push(
      db
        .prepare(
          `UPDATE budgets SET updated_at = ? WHERE id = ? AND archived_at IS NULL`,
        )
        .bind(now, budgetId),
    )
  }

  // Replace category limits if provided
  if (input.categoryLimits !== undefined) {
    // Delete existing limits
    statements.push(
      db
        .prepare(`DELETE FROM budget_limits WHERE budget_id = ?`)
        .bind(budgetId),
    )

    // Insert new limits
    for (const cl of input.categoryLimits) {
      const limitId = newId()

      // We need household_id for the insert - fetch from budget
      statements.push(
        db
          .prepare(
            `INSERT INTO budget_limits (
              id, budget_id, household_id, category_id, category_key, limit_minor, created_at, updated_at
            )
            SELECT ?, ?, b.household_id, NULL, ?, ?, ?, ?
              FROM budgets b
             WHERE b.id = ?`,
          )
          .bind(
            limitId,
            budgetId,
            cl.categoryKey,
            cl.limitMinor,
            now,
            now,
            budgetId,
          ),
      )
    }
  }

  await db.batch(statements)

  return true
}

export const deleteBudgetLimits = async (
  db: D1Database,
  budgetId: string,
): Promise<void> => {
  await db
    .prepare(`DELETE FROM budget_limits WHERE budget_id = ?`)
    .bind(budgetId)
    .run()
}
