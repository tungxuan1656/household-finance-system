'use client'

import { Card, CardContent } from '@/components/ui/card'
import { useExpenseSummaryQuery } from '@/hooks/api/use-expense'
import { t } from '@/lib/i18n/t'
import type { ExpenseListParams } from '@/types/expense'

type ExpenseFeedSummaryProps = {
  filters?: ExpenseListParams
  search?: string
}

export function ExpenseFeedSummary({
  filters,
  search,
}: ExpenseFeedSummaryProps) {
  const { data, isLoading } = useExpenseSummaryQuery({
    ...filters,
    query: search?.trim() || undefined,
  })

  return (
    <Card size='sm'>
      <CardContent className='flex items-center justify-between gap-4'>
        <div className='flex flex-col gap-1'>
          <span className='text-sm text-muted-foreground'>
            {t('groups.summary.expenseCount')}
          </span>
          <span className='font-medium'>
            {isLoading ? '—' : (data?.expenseCount ?? 0).toString()}
          </span>
        </div>
        <div className='flex flex-col items-end gap-1'>
          <span className='text-sm text-muted-foreground'>
            {t('groups.summary.totalSpend')}
          </span>
          <span className='font-medium'>
            {isLoading ? '—' : (data?.totalSpendMinor ?? 0).toString()}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
