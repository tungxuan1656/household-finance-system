'use client'

import { useRouter } from 'next/navigation'

import { DataState } from '@/components/shared/data-state'
import { Button } from '@/components/ui/button'
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
  const expenses = data?.pages.flatMap((page) => page.items) ?? []
  const isEmpty = !isLoading && !isError && expenses.length === 0

  return (
    <DataState
      emptyDescription=''
      emptyTitle={t('groups.detail.emptyExpenses')}
      errorDescription=''
      errorTitle={t('expense.feed.error')}
      isEmpty={isEmpty}
      isError={isError}
      isLoading={isLoading}
      retryAction={isError ? refetch : undefined}>
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
    </DataState>
  )
}
