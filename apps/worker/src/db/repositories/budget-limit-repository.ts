import {
  BUDGET_LIMIT_COLUMNS,
  type BudgetLimitRow,
  mapBudgetLimitRow,
  type StoredBudgetLimit,
} from './budget-row-mapper'

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

export const deleteBudgetLimits = async (
  db: D1Database,
  budgetId: string,
): Promise<void> => {
  await db
    .prepare(`DELETE FROM budget_limits WHERE budget_id = ?`)
    .bind(budgetId)
    .run()
}
