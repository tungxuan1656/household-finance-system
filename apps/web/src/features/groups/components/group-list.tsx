'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
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

  if (isLoading) {
    return (
      <div className='flex flex-col gap-3'>
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className='h-5 w-48' />
              <Skeleton className='mt-1 h-4 w-72' />
            </CardHeader>
            <CardContent className='flex flex-col gap-3'>
              <Skeleton className='h-4 w-32' />
              <Skeleton className='h-2 w-full' />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <Card>
        <CardContent className='flex items-center justify-between gap-2 pt-1'>
          <p className='text-sm text-destructive'>
            {t('groups.error.loadFailed')}
          </p>
          <Button
            type='button'
            variant='outline'
            onClick={() => void refetch()}>
            {t('groups.actions.retry')}
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!data || data.items.length === 0) {
    return (
      <Empty className='border'>
        <EmptyHeader>
          <EmptyMedia variant='icon'>
            <span aria-hidden='true'>📁</span>
          </EmptyMedia>
          <EmptyTitle>{t('groups.empty.title')}</EmptyTitle>
          <EmptyDescription>{t('groups.empty.description')}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
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
  )
}

export { GroupList }
