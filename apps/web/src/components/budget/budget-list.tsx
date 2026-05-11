'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { useBudgetListQuery } from '@/hooks/api/use-budgets'
import { t } from '@/lib/i18n/t'
import type { BudgetDTO } from '@/types/budget'

import { BudgetCard } from './budget-card'

type BudgetListProps = {
  householdId: string
  period?: string
  onEdit: (budget: BudgetDTO) => void
}

function BudgetList({ householdId, period, onEdit }: BudgetListProps) {
  const { data, isLoading, isError, refetch } = useBudgetListQuery(
    householdId,
    period,
  )

  if (isLoading) {
    return (
      <div className='flex flex-col gap-4 md:gap-6'>
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardContent className='pt-6'>
              <Skeleton className='h-5 w-48' />
              <Skeleton className='mt-2 h-4 w-32' />
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
            {t('budgets.error.loadFailed')}
          </p>
          <Button
            size='xl'
            type='button'
            variant='outline'
            onClick={() => void refetch()}>
            {t('budgets.actions.retry')}
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
            <span aria-hidden='true'>💰</span>
          </EmptyMedia>
          <EmptyTitle>{t('budgets.empty.title')}</EmptyTitle>
          <EmptyDescription>{t('budgets.empty.description')}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className='flex flex-col gap-4 md:gap-6'>
      {data.items.map((budget) => (
        <BudgetCard
          key={budget.id}
          budget={budget}
          onEdit={() => onEdit(budget)}
        />
      ))}
    </div>
  )
}

export { BudgetList }
