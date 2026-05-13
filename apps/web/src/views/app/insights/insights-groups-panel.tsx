'use client'

import { InsightsGroupsSection } from '@/components/analytics'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { t } from '@/lib/i18n/t'
import type { AnalyticsGroupsDTO } from '@/types/analytics'

type InsightsGroupsPanelProps = {
  data: AnalyticsGroupsDTO | null | undefined
  error: Error | null
  formatCurrency: (amount: number, currencyCode: string) => string
  isLoading: boolean
  onRetry: () => void
}

export function InsightsGroupsPanel({
  data,
  error,
  formatCurrency,
  isLoading,
  onRetry,
}: InsightsGroupsPanelProps) {
  if (error) {
    return (
      <Empty className='min-h-64'>
        <EmptyHeader>
          <EmptyTitle>{t('insights.error.groupsTitle')}</EmptyTitle>
          <EmptyDescription>
            {t('insights.error.groupsDescription')}
          </EmptyDescription>
        </EmptyHeader>
        <Button variant='outline' onClick={onRetry}>
          {t('insights.actions.retryGroups')}
        </Button>
      </Empty>
    )
  }

  if (isLoading || !data) {
    return (
      <Skeleton
        className='h-64 rounded-xl'
        data-testid='insights-groups-skeleton'
      />
    )
  }

  return <InsightsGroupsSection data={data} formatCurrency={formatCurrency} />
}
