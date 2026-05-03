'use client'

import { useParams, useRouter } from 'next/navigation'

import { GroupExpenseFeedList } from '@/components/group/group-expense-feed-list'
import { GroupSummaryCard } from '@/components/group/group-summary-card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useExpenseGroupDetailQuery,
  useGroupSummaryQuery,
} from '@/hooks/api/use-groups'
import { t } from '@/lib/i18n/t'

export function GroupDetailPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const groupId = params?.id

  const {
    data: group,
    isLoading: isGroupLoading,
    isError: isGroupError,
  } = useExpenseGroupDetailQuery(groupId)

  const {
    data: summary,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
  } = useGroupSummaryQuery(groupId)

  const isLoading = isGroupLoading || isSummaryLoading
  const isError = isGroupError || isSummaryError
  const householdId = group?.householdId

  if (isLoading) {
    return (
      <div className='flex flex-col gap-6'>
        <Skeleton className='h-8 w-48' />
        <Skeleton className='h-40 w-full' />
        <Skeleton className='h-8 w-32' />
        <div className='flex flex-col gap-3'>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className='h-20 w-full' />
          ))}
        </div>
      </div>
    )
  }

  if (isError || !group) {
    return (
      <div className='flex flex-col gap-6'>
        <h1 className='font-heading text-2xl tracking-tight'>
          {t('groups.detail.title')}
        </h1>
        <p className='text-muted-foreground'>{t('groups.detail.loadFailed')}</p>
        <Button variant='outline' onClick={() => router.push('/groups')}>
          {t('common.actions.backToOverview')}
        </Button>
      </div>
    )
  }

  return (
    <div className='flex flex-col gap-6'>
      <header className='flex items-center justify-between'>
        <div className='flex flex-col gap-1'>
          <h1 className='font-heading text-2xl tracking-tight'>{group.name}</h1>
          {group.description && (
            <p className='text-sm text-muted-foreground'>{group.description}</p>
          )}
        </div>
        <Button variant='outline' onClick={() => router.push('/groups')}>
          {t('common.actions.backToOverview')}
        </Button>
      </header>

      {summary && <GroupSummaryCard summary={summary} />}

      <div className='flex flex-col gap-3'>
        <h2 className='text-lg font-semibold'>
          {t('groups.detail.expensesTitle')}
        </h2>
        {householdId ? (
          <GroupExpenseFeedList groupId={groupId} householdId={householdId} />
        ) : (
          <p className='text-sm text-muted-foreground'>
            {t('groups.detail.noHousehold')}
          </p>
        )}
      </div>
    </div>
  )
}
