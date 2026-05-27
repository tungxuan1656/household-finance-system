import { buildVisibleExpenseConditions } from './expense-query-scope'
import type {
  ExpenseSummaryResult,
  ListExpensesInput,
} from './expense-repository'

export const summarizeExpenses = async (
  db: D1Database,
  input: Pick<
    ListExpensesInput,
    | 'userId'
    | 'householdId'
    | 'dateFrom'
    | 'dateTo'
    | 'categoryKey'
    | 'groupId'
    | 'query'
    | 'amountMin'
    | 'amountMax'
    | 'spentByUserId'
  >,
): Promise<ExpenseSummaryResult> => {
  const { conditions, params } = buildVisibleExpenseConditions(
    input.userId,
    input.householdId,
  )

  if (input.query !== undefined) {
    conditions.push("LOWER(COALESCE(e.note, '')) LIKE ?")
    params.push(`%${input.query.toLowerCase()}%`)
  }

  if (input.dateFrom !== undefined) {
    conditions.push('e.occurred_at >= ?')
    params.push(input.dateFrom)
  }

  if (input.dateTo !== undefined) {
    conditions.push('e.occurred_at <= ?')
    params.push(input.dateTo)
  }

  if (input.categoryKey !== undefined) {
    conditions.push('e.category_key = ?')
    params.push(input.categoryKey)
  }

  if (input.groupId !== undefined) {
    conditions.push(
      `e.id IN (
        SELECT eg.expense_id
          FROM expense_group_items eg
         WHERE eg.group_id = ?
      )`,
    )

    params.push(input.groupId)
  }

  if (input.amountMin !== undefined) {
    conditions.push('e.amount_minor >= ?')
    params.push(input.amountMin)
  }

  if (input.amountMax !== undefined) {
    conditions.push('e.amount_minor <= ?')
    params.push(input.amountMax)
  }

  if (input.spentByUserId !== undefined) {
    conditions.push('e.created_by_user_id = ?')
    params.push(input.spentByUserId)
  }

  const row = await db
    .prepare(
      `SELECT COUNT(*) AS expenseCount, COALESCE(SUM(e.amount_minor), 0) AS totalSpendMinor, MIN(e.currency_code) AS currencyCode FROM expenses e WHERE ${conditions.join(' AND ')}`,
    )
    .bind(...params)
    .first<{
      expenseCount: number
      totalSpendMinor: number
      currencyCode: string | null
    }>()

  return {
    expenseCount: Number(row?.expenseCount ?? 0),
    totalSpendMinor: Number(row?.totalSpendMinor ?? 0),
    currencyCode: row?.currencyCode ?? 'VND',
  }
}
