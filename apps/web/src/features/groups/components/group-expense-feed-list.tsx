'use client'

import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Empty, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { ExpenseFeedItem } from '@/features/expenses/components/expense-feed-item'
import { useGroupExpenseListQuery } from '@/features/groups/hooks/use-groups'
import { t } from '@/lib/i18n/t'

type GroupExpenseFeedListProps = { groupId: string; householdId: string }

export function GroupExpenseFeedList({
  groupId,
  householdId,
}: GroupExpenseFeedListProps) {
  const router = useRouter()
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useGroupExpenseListQuery(groupId, householdId)
  if (isLoading)
    return (
      <div className='flex flex-col gap-3'>
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} size='sm'>
            <CardContent className='flex items-center justify-between gap-3'>
              <div className='flex flex-col gap-2'>
                <Skeleton className='h-3 w-16' />
                <Skeleton className='h-4 w-32' />
                <Skeleton className='h-3 w-20' />
              </div>
              <div className='flex flex-col items-end gap-2'>
                <Skeleton className='h-4 w-20' />
                <Skeleton className='h-4 w-12' />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  if (isError)
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>{t('expense.feed.error')}</EmptyTitle>
        </EmptyHeader>
        <Button variant='outline' onClick={() => refetch()}>
          {t('app.households.actions.retry')}
        </Button>
      </Empty>
    )

  const expenses = data?.pages.flatMap((page) => page.items) ?? []
  if (expenses.length === 0)
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>{t('groups.detail.emptyExpenses')}</EmptyTitle>
        </EmptyHeader>
      </Empty>
    )

  return (
    <div className='flex flex-col gap-3'>
      {expenses.map((expense) => (
        <ExpenseFeedItem
          key={expense.id}
          expense={expense}
          onClick={() => router.push(`/expenses/${expense.id}`)}
        />
      ))}
      {hasNextPage && (
        <Button
          disabled={isFetchingNextPage}
          variant='outline'
          onClick={() => fetchNextPage()}>
          {isFetchingNextPage
            ? t('expense.feed.loadingMore')
            : t('expense.feed.loadMore')}
        </Button>
      )}
    </div>
  )
}
