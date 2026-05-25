export const getDefaultPeriod = () => {
  const now = new Date()
  const year = now.getUTCFullYear()
  const month = String(now.getUTCMonth() + 1).padStart(2, '0')

  return `${year}-${month}`
}

export const buildPeriodOptions = (selectedPeriod: string) => {
  const basePeriod =
    selectedPeriod > getDefaultPeriod() ? selectedPeriod : getDefaultPeriod()

  const [yearValue, monthValue] = basePeriod.split('-')
  const year = Number(yearValue)
  const month = Number(monthValue) - 1
  const baseDate = new Date(Date.UTC(year, month, 1))

  return Array.from({ length: 6 }, (_, index) => {
    const optionDate = new Date(baseDate)
    optionDate.setUTCMonth(baseDate.getUTCMonth() - index)

    const optionYear = optionDate.getUTCFullYear()
    const optionMonth = String(optionDate.getUTCMonth() + 1).padStart(2, '0')
    const value = `${optionYear}-${optionMonth}`

    return { value, label: value }
  })
}
