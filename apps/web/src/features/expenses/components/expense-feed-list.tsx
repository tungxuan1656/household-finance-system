'use client'

import { useRouter } from 'next/navigation'

import { DataState } from '@/components/shared/data-state'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { t } from '@/lib/i18n/t'

import { useInfiniteExpenseListQuery } from '../hooks/use-expense'
import type { ExpenseListParams } from '../types/expense'
import { ExpenseFeedItem } from './expense-feed-item'

type ExpenseFeedListProps = {
  filters?: ExpenseListParams
  search?: string
}

export function ExpenseFeedList({ filters, search }: ExpenseFeedListProps) {
  const router = useRouter()
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteExpenseListQuery({
    ...filters,
    query: search?.trim() || undefined,
  })

  const handleExpenseClick = (id: string) => {
    router.push(`/expenses/${id}`)
  }

  const expenses = data?.pages.flatMap((page) => page.items) ?? []

  return (
    <DataState
      emptyDescription=''
      emptyTitle={t('expense.feed.empty')}
      errorDescription={t('expense.loadError')}
      errorTitle={t('expense.feed.error')}
      isEmpty={!isLoading && expenses.length === 0}
      isError={isError}
      isLoading={isLoading}
      retryAction={refetch}>
      <div className='flex flex-col gap-1'>
        {expenses.map((expense) => (
          <>
            <ExpenseFeedItem
              key={expense.id}
              expense={expense}
              onClick={handleExpenseClick}
            />
            <Separator className='mx-1' />
          </>
        ))}
        {hasNextPage && (
          <Button
            className='w-full sm:w-auto'
            disabled={isFetchingNextPage}
            size='xl'
            variant='outline'
            onClick={() => fetchNextPage()}>
            {isFetchingNextPage
              ? t('expense.feed.loading')
              : t('expense.feed.loadMore')}
          </Button>
        )}
      </div>
    </DataState>
  )
}
