'use client'

import { Button } from '@/components/ui/button'
import { AnalyticsExportAction } from '@/features/insights/components/analytics-export-action'
import { cn } from '@/utils/cn'

import { InsightsFilter } from './insights-filter'

type InsightsHeaderProps = {
  isExportDisabled: boolean
  onPeriodChange: (period: string) => void
  period: string
  periodOptions: Array<{ label: string; value: string }>
  selectedHouseholdId: string | null
  households: Array<{ id: string; name: string }>
  onHouseholdChange: (value: string | null) => void
}

function InsightsHeader({
  isExportDisabled,
  onPeriodChange,
  period,
  periodOptions,
  selectedHouseholdId,
  households,
  onHouseholdChange,
}: InsightsHeaderProps) {
  return (
    <div className='flex flex-col gap-3'>
      <div className='-mx-1 flex flex-wrap items-center gap-2 overflow-x-auto px-1 pb-1'>
        <InsightsFilter
          households={households}
          value={selectedHouseholdId}
          onChange={onHouseholdChange}
        />
      </div>
      <div className='flex flex-wrap items-center gap-2'>
        {periodOptions.map((option) => {
          const isActive = option.value === period

          return (
            <Button
              key={option.value}
              className={cn(
                'shrink-0 rounded-full px-4',
                isActive
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'border-border bg-background hover:bg-muted',
              )}
              size='sm'
              type='button'
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
          params={{
            household_id: selectedHouseholdId ?? undefined,
            period,
          }}
          variant='outline'
        />
      </div>
    </div>
  )
}

export { InsightsHeader }
