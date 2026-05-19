function timestampToDateString(ts: number | undefined | null): string {
  if (ts == null) {
    return ''
  }

  return new Date(ts).toISOString().split('T')[0]
}

function dateStringToTimestamp(dateStr: string): number | undefined {
  if (!dateStr) {
    return undefined
  }

  return new Date(dateStr).getTime()
}

export { dateStringToTimestamp, timestampToDateString }
