'use client'

import { Button } from '@/components/ui/button'
import { AnalyticsExportAction } from '@/features/insights/components/analytics-export-action'

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

function InsightsHeader({
  isExportDisabled,
  onPeriodChange,
  params,
  period,
  periodOptions,
}: InsightsHeaderProps) {
  return (
    <div className='flex flex-col gap-3'>
      <div className='-mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-1'>
        {periodOptions.map((option) => {
          const isActive = option.value === period

          return (
            <Button
              key={option.value}
              className='shrink-0 rounded-full px-4'
              size='sm'
              type='button'
              variant={isActive ? 'default' : 'outline'}
              onClick={() => onPeriodChange(option.value)}>
              {option.label}
            </Button>
          )
        })}
      </div>
      <div className='flex justify-end'>
        <AnalyticsExportAction
          className='h-10 rounded-full px-4'
          disabled={isExportDisabled}
          params={params}
          variant='outline'
        />
      </div>
    </div>
  )
}

export { InsightsHeader }
