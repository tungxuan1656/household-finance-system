export interface StoredBudgetSpendSummary {
  totalActualMinor: number
  categoryActualMinorByKey: Record<string, number>
}

export const getBudgetSpendSummary = async (
  db: D1Database,
  input: {
    householdId: string
    startDate: string
    endDate: string
    categoryKeys: string[]
  },
): Promise<StoredBudgetSpendSummary> => {
  const baseParams = [input.householdId, input.startDate, input.endDate]

  const totalRow = await db
    .prepare(
      `SELECT COALESCE(SUM(e.amount_minor), 0) AS totalActualMinor
         FROM expenses e
        WHERE e.deleted_at IS NULL
          AND e.visibility = 'household'
          AND e.household_id = ?
          AND date(e.occurred_at / 1000, 'unixepoch') >= ?
          AND date(e.occurred_at / 1000, 'unixepoch') <= ?`,
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
          AND e.visibility = 'household'
          AND e.household_id = ?
          AND date(e.occurred_at / 1000, 'unixepoch') >= ?
          AND date(e.occurred_at / 1000, 'unixepoch') <= ?
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
