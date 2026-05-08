import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { PATHS } from '@/lib/constants/paths'
import { t } from '@/lib/i18n/t'

import { formatCurrency, formatPeriodLabel } from './overview-formatters'
import { OverviewQueryState } from './overview-query-state'

type OverviewSummarySectionProps = {
  canInviteMembers: boolean
  expenseSummaryQuery: {
    data:
      | {
          currencyCode: string
          expenseCount: number
          totalSpendMinor: number
        }
      | undefined
    error: Error | null
    isLoading: boolean
    refetch: () => void
  }
  householdCount: number
  period: string
}

function OverviewSummarySection({
  canInviteMembers,
  expenseSummaryQuery,
  householdCount,
  period,
}: OverviewSummarySectionProps) {
  return (
    <section className='space-y-3'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
        <div className='space-y-1'>
          <h2 className='font-heading text-2xl tracking-tight'>
            {t('app.overview.summary.title')}
          </h2>
          <p className='text-sm text-muted-foreground'>
            {t('app.overview.summary.description')}
          </p>
          <p className='text-sm text-muted-foreground'>
            {formatPeriodLabel(period)}
          </p>
        </div>
        <div className='flex flex-col gap-2 sm:flex-row'>
          <Button
            asChild
            className='min-h-11 w-full sm:w-auto'
            variant='outline'>
            <Link href={PATHS.HOUSEHOLDS}>
              {t('app.overview.actions.viewHouseholds')}
            </Link>
          </Button>
          <Button
            asChild
            className='min-h-11 w-full sm:w-auto'
            variant='outline'>
            <Link href={PATHS.BUDGETS}>
              {t('app.overview.actions.viewBudgets')}
            </Link>
          </Button>
          <Button
            asChild
            className='min-h-11 w-full sm:w-auto'
            variant='outline'>
            <Link href={PATHS.INSIGHTS}>
              {t('app.overview.actions.viewInsights')}
            </Link>
          </Button>
          {canInviteMembers ? (
            <Button asChild className='min-h-11 w-full sm:w-auto'>
              <Link href={PATHS.HOUSEHOLDS}>
                {t('app.overview.actions.inviteMembers')}
              </Link>
            </Button>
          ) : null}
        </div>
      </div>

      <div className='grid gap-4 md:grid-cols-3'>
        <Card>
          <CardHeader>
            <CardTitle>{t('app.overview.summary.totalSpend')}</CardTitle>
          </CardHeader>
          <CardContent>
            {expenseSummaryQuery.isLoading ? (
              <Skeleton className='h-10 w-32' />
            ) : expenseSummaryQuery.error ? (
              <OverviewQueryState
                description={t('app.overview.summary.errorDescription')}
                retryLabel={t('app.overview.actions.retrySummary')}
                title={t('app.overview.summary.errorTitle')}
                onRetry={() => expenseSummaryQuery.refetch()}
              />
            ) : expenseSummaryQuery.data ? (
              <div
                aria-live='polite'
                className='font-heading text-2xl tracking-tight wrap-break-word sm:text-3xl'>
                {formatCurrency(
                  expenseSummaryQuery.data.totalSpendMinor,
                  expenseSummaryQuery.data.currencyCode,
                )}
              </div>
            ) : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t('app.overview.summary.expenseCount')}</CardTitle>
          </CardHeader>
          <CardContent>
            {expenseSummaryQuery.isLoading ? (
              <Skeleton className='h-10 w-20' />
            ) : expenseSummaryQuery.error ? (
              <OverviewQueryState
                description={t('app.overview.summary.errorDescription')}
                retryLabel={t('app.overview.actions.retrySummary')}
                title={t('app.overview.summary.errorTitle')}
                onRetry={() => expenseSummaryQuery.refetch()}
              />
            ) : expenseSummaryQuery.data ? (
              <div
                aria-live='polite'
                className='font-heading text-3xl tracking-tight'>
                {expenseSummaryQuery.data.expenseCount}
              </div>
            ) : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t('app.overview.summary.householdCount')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='font-heading text-3xl tracking-tight'>
              {householdCount}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

export { OverviewSummarySection }
