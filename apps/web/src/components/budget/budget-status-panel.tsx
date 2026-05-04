'use client'

import { Card, CardContent } from '@/components/ui/card'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { t } from '@/lib/i18n/t'
import type { BudgetStatusDTO } from '@/types/budget'

import { BudgetStatusCard } from './budget-status-card'

type BudgetStatusPanelProps = {
  status?: BudgetStatusDTO | null
  isLoading?: boolean
}

function BudgetStatusPanel({ status, isLoading }: BudgetStatusPanelProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className='pt-6'>
          <Skeleton className='h-6 w-40' />
          <Skeleton className='mt-4 h-24 w-full' />
        </CardContent>
      </Card>
    )
  }

  if (!status) {
    return (
      <Empty className='border'>
        <EmptyHeader>
          <EmptyMedia variant='icon'>
            <span aria-hidden='true'>📊</span>
          </EmptyMedia>
          <EmptyTitle>{t('budgets.status.empty.title')}</EmptyTitle>
          <EmptyDescription>
            {t('budgets.status.empty.description')}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return <BudgetStatusCard status={status} />
}

export { BudgetStatusPanel }
