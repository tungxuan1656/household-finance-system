'use client'

import { ArrowUpRight } from 'lucide-react'

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
    <Card className='overflow-hidden' size='sm'>
      <CardContent className='flex flex-row items-center justify-between gap-3 p-4'>
        <div className='flex flex-col gap-1'>
          <div className='flex items-center gap-2'>
            <span className='text-xs font-medium tracking-wider text-muted-foreground uppercase'>
              {t('groups.summary.totalSpend')}
            </span>
            <ArrowUpRight aria-hidden='true' className='size-4 text-primary' />
          </div>
          <div className='font-mono text-3xl font-semibold tabular-nums'>
            {isLoading
              ? '—'
              : formatCurrency(data?.totalSpendMinor ?? 0, currencyCode)}
          </div>
        </div>
        <div className='flex flex-col items-end gap-1'>
          <span className='text-xs font-medium tracking-wider text-muted-foreground uppercase'>
            {isLoading ? '—' : (data?.expenseCount ?? 0)}{' '}
            {t('expense.feed.expenses')}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
