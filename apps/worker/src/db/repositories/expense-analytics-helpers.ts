type AnalyticsSummaryRow = {
  expenseCount: number
  totalSpendMinor: number
  currencyCode: string | null
}

export const getAnalyticsSummary = async (
  db: D1Database,
  whereClause: string,
  params: unknown[],
): Promise<AnalyticsSummaryRow> => {
  const row = await db
    .prepare(
      `SELECT COUNT(*) AS expenseCount, COALESCE(SUM(e.amount_minor), 0) AS totalSpendMinor, MIN(e.currency_code) AS currencyCode FROM expenses e WHERE ${whereClause}`,
    )
    .bind(...params)
    .first<AnalyticsSummaryRow>()

  return {
    expenseCount: Number(row?.expenseCount ?? 0),
    totalSpendMinor: Number(row?.totalSpendMinor ?? 0),
    currencyCode: row?.currencyCode ?? null,
  }
}

export const calculateDeltaPercent = (
  currentTotalSpendMinor: number,
  previousTotalSpendMinor: number,
): number | null => {
  if (previousTotalSpendMinor === 0) {
    return currentTotalSpendMinor === 0 ? 0 : null
  }

  return Math.round(
    ((currentTotalSpendMinor - previousTotalSpendMinor) /
      previousTotalSpendMinor) *
      100,
  )
}
