'use client'

import { useRouter } from 'next/navigation'

import { DataState } from '@/components/shared/data-state'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { t } from '@/lib/i18n/t'

import { useInfiniteExpenseListQuery } from '../hooks/use-expense'
import { buildExpenseTimelineGroups } from '../pages/expense-feed-page-helpers'
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
  const timelineGroups = buildExpenseTimelineGroups(expenses)

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
      <div className='flex flex-col gap-4'>
        {timelineGroups.map((group) => (
          <section key={group.label} className='flex flex-col gap-2'>
            <p className='px-1 text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase'>
              {group.label}
            </p>
            <Card className='rounded-[1.75rem] border-border/80 bg-card/95'>
              <CardContent className='flex flex-col gap-0 p-2 py-0'>
                {group.items.map((expense, index) => (
                  <div key={expense.id}>
                    <ExpenseFeedItem
                      expense={expense}
                      onClick={handleExpenseClick}
                    />
                    {index < group.items.length - 1 ? (
                      <Separator className='mx-2 my-4 w-auto!' />
                    ) : null}
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>
        ))}
        {hasNextPage && (
          <Button
            className='w-full sm:w-auto'
            disabled={isFetchingNextPage}
            size='default'
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
