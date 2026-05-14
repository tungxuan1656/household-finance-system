'use client'

import { InsightsSummaryCards } from '@/components/analytics'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { t } from '@/lib/i18n/t'
import type { AnalyticsOverviewDTO } from '@/types/analytics'

type InsightsOverviewPanelProps = {
  data: AnalyticsOverviewDTO | null | undefined
  error: Error | null
  isLoading: boolean
  onRetry: () => void
}

export function InsightsOverviewPanel({
  data,
  error,
  isLoading,
  onRetry,
}: InsightsOverviewPanelProps) {
  if (error) {
    return (
      <Empty className='min-h-32'>
        <EmptyHeader>
          <EmptyTitle>{t('insights.error.title')}</EmptyTitle>
          <EmptyDescription>{t('insights.error.description')}</EmptyDescription>
        </EmptyHeader>
        <Button variant='outline' onClick={onRetry}>
          {t('insights.actions.retry')}
        </Button>
      </Empty>
    )
  }

  if (isLoading || !data) {
    return (
      <div
        className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'
        data-testid='insights-summary-skeleton'>
        <Skeleton className='h-32 rounded-xl' />
        <Skeleton className='h-32 rounded-xl' />
        <Skeleton className='h-32 rounded-xl' />
      </div>
    )
  }

  if (data.expenseCount === 0) {
    return (
      <Empty className='min-h-80'>
        <EmptyHeader>
          <EmptyTitle>{t('insights.empty.title')}</EmptyTitle>
          <EmptyDescription>{t('insights.empty.description')}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return <InsightsSummaryCards data={data} />
}
