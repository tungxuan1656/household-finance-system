'use client'

import { useParams, useRouter } from 'next/navigation'

import { DataState } from '@/components/shared/data-state'
import {
  PageContainer,
  PageContent,
  PageHeader,
} from '@/components/shared/page'
import { Button } from '@/components/ui/button'
import { GroupExpenseFeedList } from '@/features/groups/components/group-expense-feed-list'
import { GroupSummaryCard } from '@/features/groups/components/group-summary-card'
import {
  useExpenseGroupDetailQuery,
  useGroupSummaryQuery,
} from '@/features/groups/hooks/use-groups'
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
  const isNotFound = !isLoading && !isError && !group

  return (
    <PageContainer>
      <PageHeader
        showBack
        title={group?.name ?? t('groups.detail.title')}
        onBack={() => router.push('/groups')}
      />
      <PageContent>
        <DataState
          customAction={
            isError || isNotFound ? (
              <Button variant='outline' onClick={() => router.push('/groups')}>
                {t('common.actions.backToOverview')}
              </Button>
            ) : undefined
          }
          emptyDescription=''
          emptyTitle={t('groups.detail.loadFailed')}
          errorDescription=''
          errorTitle={t('groups.detail.loadFailed')}
          isEmpty={isNotFound}
          isError={isError}
          isLoading={isLoading}>
          {group ? (
            <div className='flex flex-col gap-6'>
              <Button
                className='hidden w-fit sm:inline-flex'
                variant='outline'
                onClick={() => router.push('/groups')}>
                {t('common.actions.backToOverview')}
              </Button>
              {group.description ? (
                <p className='text-sm text-muted-foreground'>
                  {group.description}
                </p>
              ) : null}
              {summary && <GroupSummaryCard summary={summary} />}
              <div className='flex flex-col gap-3'>
                <h2 className='text-lg font-semibold'>
                  {t('groups.detail.expensesTitle')}
                </h2>
                {householdId ? (
                  <GroupExpenseFeedList
                    groupId={groupId}
                    householdId={householdId}
                  />
                ) : (
                  <p className='text-sm text-muted-foreground'>
                    {t('groups.detail.noHousehold')}
                  </p>
                )}
              </div>
            </div>
          ) : null}
        </DataState>
      </PageContent>
    </PageContainer>
  )
}
