import type { VariantProps } from 'class-variance-authority'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button, type buttonVariants } from '@/components/ui/button'
import { exportAnalyticsCsv } from '@/features/insights/api/use-analytics'
import { t } from '@/lib/i18n/t'
import type { AnalyticsExportParams } from '@/types/analytics'
import { downloadBlob, getFallbackFilename } from '@/utils/export/download'

type AnalyticsExportActionProps = {
  params: AnalyticsExportParams
  disabled?: boolean
  className?: string
  variant?: VariantProps<typeof buttonVariants>['variant']
}

function AnalyticsExportAction({
  params,
  disabled,
  className,
  variant,
}: AnalyticsExportActionProps) {
  const [isExporting, setIsExporting] = useState(false)
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
    <Button
      className={className}
      disabled={disabled || isExporting}
      variant={variant}
      onClick={handleExport}>
      {isExporting ? t('insights.export.loading') : t('insights.export.action')}
    </Button>
  )
}

export { AnalyticsExportAction }
