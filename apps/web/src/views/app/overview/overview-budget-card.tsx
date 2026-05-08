import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { t } from '@/lib/i18n/t'

import { OverviewQueryState } from './overview-query-state'

type OverviewBudgetCardProps = {
  budgetSummaryQuery: {
    data: { items: unknown[] } | undefined
    error: Error | null
    isLoading: boolean
    refetch: () => void
  }
  hasCurrentHousehold: boolean
}

function OverviewBudgetCard({
  budgetSummaryQuery,
  hasCurrentHousehold,
}: OverviewBudgetCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('app.overview.budget.title')}</CardTitle>
        <CardDescription>
          {t('app.overview.budget.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-3'>
        {budgetSummaryQuery.isLoading ? (
          <div className='space-y-2'>
            <Skeleton className='h-4 w-32' />
            <Skeleton className='h-4 w-24' />
          </div>
        ) : budgetSummaryQuery.error ? (
          <OverviewQueryState
            description={t('app.overview.budget.errorDescription')}
            retryLabel={t('app.overview.actions.retryBudget')}
            title={t('app.overview.budget.errorTitle')}
            onRetry={() => budgetSummaryQuery.refetch()}
          />
        ) : !hasCurrentHousehold ? (
          <p className='text-sm text-muted-foreground'>
            {t('app.overview.budget.selectHousehold')}
          </p>
        ) : (
          <p className='text-sm text-muted-foreground'>
            {t('app.overview.budget.availableBudgets', {
              count: budgetSummaryQuery.data?.items.length ?? 0,
            })}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export { OverviewBudgetCard }
