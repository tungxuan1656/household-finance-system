'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { t } from '@/lib/i18n/t'

import { useInfiniteExpenseListQuery } from '../hooks/use-expense'
import { ExpenseFeedItem } from './expense-feed-item'

type RecentExpensesCardProps = {
  householdId: string
  limit?: number
}

export function RecentExpensesCard({
  householdId,
  limit = 3,
}: RecentExpensesCardProps) {
  const { data, isLoading, error } = useInfiniteExpenseListQuery({
    household_id: householdId,
    limit,
  })

  const expenses =
    data?.pages.flatMap((page) => page.items).slice(0, limit) ?? []

  if (isLoading && expenses.length === 0) {
    return (
      <div className='rounded-xl border p-4'>
        <Skeleton className='mb-3 h-5 w-32' />
        <div className='flex flex-col gap-2'>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className='h-14 rounded-xl' />
          ))}
        </div>
      </div>
    )
  }

  if (error && expenses.length === 0) {
    return (
      <div className='rounded-xl border border-destructive/30 p-4'>
        <p className='text-sm text-destructive'>{t('expense.loadError')}</p>
      </div>
    )
  }

  return (
    <div className='rounded-xl border p-4'>
      <h3 className='mb-3 font-semibold'>
        {t('app.householdDetail.recentExpenses.title')}
      </h3>
      {expenses.length === 0 ? (
        <p className='py-4 text-center text-sm text-muted-foreground'>
          {t('app.householdDetail.recentExpenses.empty')}
        </p>
      ) : (
        <div className='flex flex-col gap-0'>
          {expenses.map((expense) => (
            <ExpenseFeedItem
              key={expense.id}
              expense={expense}
              onClick={() => {}}
            />
          ))}
        </div>
      )}
    </div>
  )
}
