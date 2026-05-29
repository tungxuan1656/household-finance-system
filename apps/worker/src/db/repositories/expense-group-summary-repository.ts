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
      `SELECT e.spent_by_user_id AS user_id,
              COALESCE(u.display_name, e.spent_by_user_id) AS display_name,
              COALESCE(SUM(e.amount_minor), 0) AS total_spend,
              COUNT(DISTINCT e.id) AS expense_count
         FROM expense_group_items egi
         JOIN expenses e ON e.id = egi.expense_id AND e.deleted_at IS NULL
         LEFT JOIN users u ON u.id = e.spent_by_user_id
        WHERE egi.group_id = ?
        GROUP BY e.spent_by_user_id`,
    )
    .bind(groupId)
    .all<{
      user_id: string
      display_name: string | null
      total_spend: number
      expense_count: number
    }>()

  const memberContributions = memberRows.results.map((row) => ({
    userId: row.user_id,
    displayName: row.display_name,
    totalSpendMinor: Number(row.total_spend),
    expenseCount: Number(row.expense_count),
  }))

  return {
    totalSpendMinor,
    expenseCount,
    budgetRemainingMinor:
      eventBudgetMinor !== null ? eventBudgetMinor - totalSpendMinor : null,
    memberContributions,
  }
}
