import { newId } from '@/utils/id'

import { computeDateRange } from './budget-period'
import {
  BUDGET_COLUMNS,
  BUDGET_LIMIT_COLUMNS,
  type BudgetLimitRow,
  type BudgetRow,
  type BudgetScope,
  mapBudgetLimitRow,
  mapBudgetRow,
  type StoredBudget,
  type StoredBudgetLimit,
} from './budget-row-mapper'

export {
  BUDGET_COLUMNS,
  BUDGET_LIMIT_COLUMNS,
  type BudgetLimitRow,
  type BudgetRow,
  type BudgetScope,
  mapBudgetLimitRow,
  mapBudgetRow,
  type StoredBudget,
  type StoredBudgetLimit,
} from './budget-row-mapper'
export {
  getBudgetSpendSummary,
  type StoredBudgetSpendSummary,
} from './budget-spend-summary-repository'

interface CreateBudgetBase {
  scope: BudgetScope
  period: string // YYYY-MM
  totalLimitMinor: number
  currencyCode: string
  createdByUserId: string
  categoryLimits?: Array<{ categoryKey: string; limitMinor: number }>
}

export type CreateBudgetInput = CreateBudgetBase &
  (
    | { scope: 'household'; householdId: string; ownerUserId?: never }
    | { scope: 'personal'; ownerUserId: string; householdId?: never }
  )

export interface UpdateBudgetInput {
  totalLimitMinor?: number
  categoryLimits?: Array<{ categoryKey: string; limitMinor: number }>
}

const isPersonalInput = (
  input: CreateBudgetInput,
): input is Extract<CreateBudgetInput, { scope: 'personal' }> =>
  input.scope === 'personal'

const isHouseholdInput = (
  input: CreateBudgetInput,
): input is Extract<CreateBudgetInput, { scope: 'household' }> =>
  input.scope === 'household'

export const createBudget = async (
  db: D1Database,
  input: CreateBudgetInput,
): Promise<StoredBudget> => {
  const id = newId()
  const now = Date.now()
  const { startDate, endDate } = computeDateRange(input.period)

  const householdId = isHouseholdInput(input) ? input.householdId : null
  const ownerUserId = isPersonalInput(input) ? input.ownerUserId : null

  const statements: D1PreparedStatement[] = []

  // Insert budget
  statements.push(
    db
      .prepare(
        `INSERT INTO budgets (
          id, household_id, owner_user_id, scope, budget_month, start_date, end_date,
          currency_code, total_limit_minor, category_id, created_by_user_id,
          archived_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, NULL, ?, ?)`,
      )
      .bind(
        id,
        householdId,
        ownerUserId,
        input.scope,
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
            householdId,
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
    household_id: householdId,
    owner_user_id: ownerUserId,
    scope: input.scope,
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

export const findHouseholdBudgetByPeriod = async (
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

export const findPersonalBudgetByPeriod = async (
  db: D1Database,
  ownerUserId: string,
  period: string,
): Promise<StoredBudget | null> => {
  const row = await db
    .prepare(
      `SELECT ${BUDGET_COLUMNS}
         FROM budgets b
        WHERE b.owner_user_id = ?
          AND b.budget_month = ?
          AND b.scope = 'personal'
          AND b.archived_at IS NULL
        LIMIT 1`,
    )
    .bind(ownerUserId, period)
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

export const listBudgetsByOwner = async (
  db: D1Database,
  ownerUserId: string,
): Promise<StoredBudget[]> => {
  const result = await db
    .prepare(
      `SELECT ${BUDGET_COLUMNS}
         FROM budgets b
        WHERE b.owner_user_id = ?
          AND b.archived_at IS NULL
        ORDER BY b.budget_month DESC`,
    )
    .bind(ownerUserId)
    .all<BudgetRow>()

  return result.results.map(mapBudgetRow)
}

export const listAccessibleBudgets = async (
  db: D1Database,
  ownerUserId: string,
  householdIds: string[],
): Promise<StoredBudget[]> => {
  const placeholders = householdIds.map(() => '?').join(',')
  const binds: string[] = [ownerUserId, ...householdIds]

  const result = await db
    .prepare(
      `SELECT ${BUDGET_COLUMNS}
         FROM budgets b
        WHERE b.archived_at IS NULL
          AND (
            (b.scope = 'personal' AND b.owner_user_id = ?)
            ${
              householdIds.length > 0
                ? `OR (b.scope = 'household' AND b.household_id IN (${placeholders}))`
                : ''
            }
          )
        ORDER BY b.budget_month DESC`,
    )
    .bind(...binds)
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

    // Insert new limits - household_id comes from the parent budget (NULL for personal)
    for (const cl of input.categoryLimits) {
      const limitId = newId()

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

export const softDeleteBudget = async (
  db: D1Database,
  budgetId: string,
): Promise<boolean> => {
  const now = Date.now()
  const result = await db
    .prepare(
      `UPDATE budgets
          SET archived_at = ?,
              updated_at = ?
        WHERE id = ?
          AND archived_at IS NULL`,
    )
    .bind(now, now, budgetId)
    .run()

  return (result.meta.changes ?? 0) > 0
}

export const restoreBudget = async (
  db: D1Database,
  budgetId: string,
): Promise<boolean> => {
  const now = Date.now()
  const result = await db
    .prepare(
      `UPDATE budgets
          SET archived_at = NULL,
              updated_at = ?
        WHERE id = ?
          AND archived_at IS NOT NULL`,
    )
    .bind(now, budgetId)
    .run()

  return (result.meta.changes ?? 0) > 0
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
