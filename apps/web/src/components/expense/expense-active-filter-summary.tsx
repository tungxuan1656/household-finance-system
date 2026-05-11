'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { t } from '@/lib/i18n/t'

type ExpenseActiveFilterSummaryProps = {
  labels: string[]
  onReset: () => void
}

export function ExpenseActiveFilterSummary({
  labels,
  onReset,
}: ExpenseActiveFilterSummaryProps) {
  if (labels.length === 0) {
    return null
  }

  return (
    <div className='flex flex-col gap-3 rounded-lg border border-border bg-card px-4 py-3 sm:flex-row sm:items-start sm:justify-between'>
      <div className='flex flex-col gap-2'>
        <p className='text-sm font-medium'>
          {t('expense.feed.filters.activeTitle')}
        </p>
        <div className='flex flex-wrap gap-2'>
          {labels.map((label) => (
            <Badge
              key={label}
              className='h-6 text-sm sm:h-5 sm:text-xs'
              variant='secondary'>
              {label}
            </Badge>
          ))}
        </div>
      </div>
      <Button
        className='h-12 w-full sm:h-10 sm:w-auto'
        variant='outline'
        onClick={onReset}>
        {t('expense.feed.filters.reset')}
      </Button>
    </div>
  )
}
