/**
 * Compute start_date and end_date from a YYYY-MM period string.
 * start_date = first day of month (YYYY-MM-01)
 * end_date = last day of month (YYYY-MM-DD where DD depends on month)
 */
export const computeDateRange = (
  period: string,
): { startDate: string; endDate: string } => {
  const [yearStr, monthStr] = period.split('-')
  const year = parseInt(yearStr, 10)
  const month = parseInt(monthStr, 10)
  const startDate = `${yearStr}-${monthStr}-01`
  const nextMonth = month === 12 ? 1 : month + 1
  const nextYear = month === 12 ? year + 1 : year
  const lastDay = new Date(nextYear, nextMonth - 1, 0).getDate()
  const endDate = `${yearStr}-${monthStr}-${String(lastDay).padStart(2, '0')}`

  return { startDate, endDate }
}
