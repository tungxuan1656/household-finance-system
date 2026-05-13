'use client'

import { InsightsComparisonSection } from '@/components/analytics'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { t } from '@/lib/i18n/t'
import type { AnalyticsComparisonDTO } from '@/types/analytics'

type InsightsComparisonPanelProps = {
  data: AnalyticsComparisonDTO | null | undefined
  error: Error | null
  formatCurrency: (amount: number, currencyCode: string) => string
  isLoading: boolean
  onRetry: () => void
}

export function InsightsComparisonPanel({
  data,
  error,
  formatCurrency,
  isLoading,
  onRetry,
}: InsightsComparisonPanelProps) {
  if (error) {
    return (
      <Empty className='min-h-64'>
        <EmptyHeader>
          <EmptyTitle>{t('insights.error.comparisonTitle')}</EmptyTitle>
          <EmptyDescription>
            {t('insights.error.comparisonDescription')}
          </EmptyDescription>
        </EmptyHeader>
        <Button variant='outline' onClick={onRetry}>
          {t('insights.actions.retryComparison')}
        </Button>
      </Empty>
    )
  }

  if (isLoading || !data) {
    return (
      <div
        className='grid gap-4 md:grid-cols-2 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]'
        data-testid='insights-comparison-skeleton'>
        <Skeleton className='h-64 rounded-xl' />
        <Skeleton className='h-64 rounded-xl' />
      </div>
    )
  }

  return (
    <InsightsComparisonSection data={data} formatCurrency={formatCurrency} />
  )
}
