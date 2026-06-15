export interface StoredBudgetSpendSummary {
  totalActualMinor: number
  categoryActualMinorByKey: Record<string, number>
}

export type BudgetSpendSummaryInput = {
  startDate: string
  endDate: string
  categoryKeys: string[]
} & (
  | { householdId: string; ownerUserId?: never }
  | { ownerUserId: string; householdId?: never }
)

const buildDateFilter = () =>
  `date(e.occurred_at / 1000, 'unixepoch') >= ?\n           AND date(e.occurred_at / 1000, 'unixepoch') <= ?`

const buildScopeFilter = (input: BudgetSpendSummaryInput) => {
  if ('householdId' in input) {
    return {
      clause: 'e.household_id = ?',
      param: input.householdId,
    }
  }

  return {
    clause: 'e.spent_by_user_id = ? AND e.household_id IS NULL',
    param: input.ownerUserId,
  }
}

export const getBudgetSpendSummary = async (
  db: D1Database,
  input: BudgetSpendSummaryInput,
): Promise<StoredBudgetSpendSummary> => {
  const scope = buildScopeFilter(input)
  const baseParams = [scope.param, input.startDate, input.endDate]

  const totalRow = await db
    .prepare(
      `SELECT COALESCE(SUM(e.amount_minor), 0) AS totalActualMinor
         FROM expenses e
        WHERE e.deleted_at IS NULL
          AND ${scope.clause}
          AND ${buildDateFilter()}`,
    )
    .bind(...baseParams)
    .first<{ totalActualMinor: number | null }>()

  if (input.categoryKeys.length === 0) {
    return {
      totalActualMinor: Number(totalRow?.totalActualMinor ?? 0),
      categoryActualMinorByKey: {},
    }
  }

  const placeholders = input.categoryKeys.map(() => '?').join(', ')
  const categoryParams = [...baseParams, ...input.categoryKeys]

  const categoryRows = await db
    .prepare(
      `SELECT e.category_key AS categoryKey, COALESCE(SUM(e.amount_minor), 0) AS totalActualMinor
         FROM expenses e
        WHERE e.deleted_at IS NULL
          AND ${scope.clause}
          AND ${buildDateFilter()}
          AND e.category_key IN (${placeholders})
        GROUP BY e.category_key
        ORDER BY e.category_key`,
    )
    .bind(...categoryParams)
    .all<{ categoryKey: string | null; totalActualMinor: number | null }>()

  return {
    totalActualMinor: Number(totalRow?.totalActualMinor ?? 0),
    categoryActualMinorByKey: Object.fromEntries(
      categoryRows.results
        .filter(
          (
            row,
          ): row is { categoryKey: string; totalActualMinor: number | null } =>
            typeof row.categoryKey === 'string',
        )
        .map((row) => [row.categoryKey, Number(row.totalActualMinor ?? 0)]),
    ),
  }
}
