/**
 * Period utility helpers for monthly budget/analytics periods.
 */

/**
 * Get the current period key in YYYY-MM format.
 */
export const getCurrentPeriod = (): string => {
  const now = new Date()
  const year = now.getFullYear()
  const month = `${now.getMonth() + 1}`.padStart(2, '0')

  return `${year}-${month}`
}

/**
 * Convert a YYYY-MM period to start/end epoch milliseconds.
 */
export const toPeriodRange = (
  period: string,
): { start: number; end: number } => {
  const [yearValue, monthValue] = period.split('-')
  const year = Number(yearValue)
  const monthIndex = Number(monthValue) - 1

  return {
    start: Date.UTC(year, monthIndex, 1),
    end: Date.UTC(year, monthIndex + 1, 1),
  }
}

/**
 * Format a period key to a human-readable Vietnamese label.
 * Example: "2024-06" → "Tháng 6/2024"
 */
export const formatPeriodLabel = (period: string): string => {
  const [year, month] = period.split('-')

  return `Tháng ${Number(month)}/${year}`
}
