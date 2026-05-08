'use client'

import { AnalyticsExportAction } from '@/components/analytics'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { t } from '@/lib/i18n/t'

type InsightsHeaderProps = {
  isExportDisabled: boolean
  onPeriodChange: (period: string) => void
  params: {
    household_id?: string
    period: string
  }
  period: string
  periodOptions: Array<{ label: string; value: string }>
}

export function InsightsHeader({
  isExportDisabled,
  onPeriodChange,
  params,
  period,
  periodOptions,
}: InsightsHeaderProps) {
  return (
    <header className='flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between'>
      <div className='flex flex-col gap-1'>
        <h1 className='font-heading text-2xl tracking-tight'>
          {t('insights.title')}
        </h1>
        <p className='text-sm text-muted-foreground'>
          {t('insights.description')}
        </p>
      </div>
      <div className='flex w-full flex-col gap-4 sm:w-auto sm:flex-row sm:flex-wrap sm:items-end'>
        <label className='flex w-full flex-col gap-1 text-sm text-muted-foreground sm:min-w-56 sm:flex-1'>
          <span>{t('insights.periodLabel')}</span>
          <NativeSelect
            aria-label={t('insights.periodLabel')}
            value={period}
            onChange={(event) => onPeriodChange(event.target.value)}>
            {periodOptions.map((option) => (
              <NativeSelectOption key={option.value} value={option.value}>
                {option.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </label>
        <AnalyticsExportAction disabled={isExportDisabled} params={params} />
      </div>
    </header>
  )
}
