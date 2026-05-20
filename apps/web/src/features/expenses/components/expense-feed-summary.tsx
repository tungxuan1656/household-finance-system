'use client'

import { Card, CardContent } from '@/components/ui/card'
import { t } from '@/lib/i18n/t'
import { formatCurrency } from '@/utils/currency/format'

import { useExpenseSummaryQuery } from '../hooks/use-expense'
import type { ExpenseListParams } from '../types/expense'

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

  const currencyCode = data?.currencyCode ?? 'VND'

  return (
    <Card size='sm'>
      <CardContent className='flex flex-row items-center justify-between gap-2'>
        <div className='font-medium text-foreground'>
          {t('groups.summary.totalSpend')}
        </div>
        <div>
          <span className='font-mono text-xl font-medium'>
            {isLoading
              ? '—'
              : formatCurrency(data?.totalSpendMinor ?? 0, currencyCode)}
          </span>
          <span className='mx-2'>{' / '}</span>
          <span className='font-medium'>
            {isLoading ? '—' : (data?.expenseCount ?? 0).toString()}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
