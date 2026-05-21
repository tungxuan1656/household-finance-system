'use client'

import { DataState } from '@/components/shared/data-state'
import { Button } from '@/components/ui/button'
import { useExpenseGroupListQuery } from '@/features/groups/hooks/use-groups'
import type { ExpenseGroupDTO } from '@/features/groups/types/group'
import { t } from '@/lib/i18n/t'

import { GroupCard } from './group-card'

type GroupListProps = {
  householdId: string
  onEdit: (group: ExpenseGroupDTO) => void
  onArchive: (group: ExpenseGroupDTO) => void
}

function GroupList({ householdId, onEdit, onArchive }: GroupListProps) {
  const { data, isLoading, isError, refetch } =
    useExpenseGroupListQuery(householdId)
  const isEmpty = !isLoading && !isError && (!data || data.items.length === 0)

  return (
    <DataState
      customAction={
        isError ? (
          <Button
            type='button'
            variant='outline'
            onClick={() => void refetch()}>
            {t('groups.actions.retry')}
          </Button>
        ) : undefined
      }
      emptyDescription={t('groups.empty.description')}
      emptyTitle={t('groups.empty.title')}
      errorDescription=''
      errorTitle={t('groups.error.loadFailed')}
      isEmpty={isEmpty}
      isError={isError}
      isLoading={isLoading}>
      {data ? (
        <div className='flex flex-col gap-3'>
          {data.items.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              onArchive={() => onArchive(group)}
              onEdit={() => onEdit(group)}
            />
          ))}
        </div>
      ) : null}
    </DataState>
  )
}

export { GroupList }
