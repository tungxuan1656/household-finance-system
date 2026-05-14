import type { AnalyticsExportParams } from '@/types/analytics'

export const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}

export const getFallbackFilename = (params: AnalyticsExportParams): string =>
  `analytics-${params.period}-${params.household_id ? 'household' : 'personal'}.csv`
