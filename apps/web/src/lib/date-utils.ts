export function timestampToLocalDate(ts: number): string {
  const d = new Date(ts)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function localDateToTimestamp(dateStr: string): number {
  const [year, month, day] = dateStr.split('-').map(Number)

  return new Date(year, month - 1, day).getTime()
}
