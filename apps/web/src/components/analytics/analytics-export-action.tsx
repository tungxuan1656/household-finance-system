import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { exportAnalyticsCsv } from '@/hooks/api/use-analytics'
import { t } from '@/lib/i18n/t'
import type { AnalyticsExportParams } from '@/types/analytics'

type AnalyticsExportActionProps = {
  params: AnalyticsExportParams
  disabled?: boolean
  hidden?: boolean
}

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}

const getFallbackFilename = (params: AnalyticsExportParams): string =>
  `analytics-${params.period}-${params.household_id ? 'household' : 'personal'}.csv`

function AnalyticsExportAction({
  params,
  disabled,
  hidden,
}: AnalyticsExportActionProps) {
  const [isExporting, setIsExporting] = useState(false)

  if (hidden) {
    return null
  }

  const handleExport = async () => {
    setIsExporting(true)

    try {
      const result = await exportAnalyticsCsv(params)
      downloadBlob(result.blob, result.filename ?? getFallbackFilename(params))
      toast.success(t('insights.export.success'))
    } catch {
      toast.error(t('insights.export.failed'))
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button disabled={disabled || isExporting} onClick={handleExport}>
      {isExporting ? t('insights.export.loading') : t('insights.export.action')}
    </Button>
  )
}

export { AnalyticsExportAction }
