export const toPeriodRange = (period: string) => {
  const [yearValue, monthValue] = period.split('-')
  const year = Number(yearValue)
  const monthIndex = Number(monthValue) - 1

  return {
    start: Date.UTC(year, monthIndex, 1),
    end: Date.UTC(year, monthIndex + 1, 1),
  }
}

export const toPreviousPeriod = (period: string) => {
  const [yearValue, monthValue] = period.split('-')
  const date = new Date(Date.UTC(Number(yearValue), Number(monthValue) - 1, 1))

  date.setUTCMonth(date.getUTCMonth() - 1)

  const year = date.getUTCFullYear()
  const month = `${date.getUTCMonth() + 1}`.padStart(2, '0')

  return `${year}-${month}`
}
