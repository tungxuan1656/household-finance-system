import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { PATHS } from '@/lib/constants/paths'
import { t } from '@/lib/i18n/t'

import { formatCurrency } from './overview-formatters'
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
}

function OverviewSummarySection({
  canInviteMembers,
  expenseSummaryQuery,
  householdCount,
}: OverviewSummarySectionProps) {
  return (
    <section className='space-y-4'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
        <h2 className='text-lg font-semibold'>
          {t('app.overview.summary.title')}
        </h2>
        <div className='flex flex-col gap-2 sm:flex-row'>
          {canInviteMembers ? (
            <Button asChild className='min-h-11 w-full sm:w-auto'>
              <Link href={PATHS.HOUSEHOLDS}>
                {t('app.overview.actions.inviteMembers')}
              </Link>
            </Button>
          ) : null}
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
          </div>
        </div>
      </div>

      <div className='grid gap-4 md:grid-cols-3'>
        <Card className='transition-all duration-200 hover:border-primary/20 hover:shadow-md'>
          <CardHeader className='pb-2'>
            <p className='text-sm text-muted-foreground'>
              {t('app.overview.summary.totalSpend')}
            </p>
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
                className='font-heading text-2xl font-semibold tracking-tight wrap-break-word md:text-3xl'>
                {formatCurrency(
                  expenseSummaryQuery.data.totalSpendMinor,
                  expenseSummaryQuery.data.currencyCode,
                )}
              </div>
            ) : null}
          </CardContent>
        </Card>
        <Card className='transition-all duration-200 hover:border-primary/20 hover:shadow-md'>
          <CardHeader className='pb-2'>
            <p className='text-sm text-muted-foreground'>
              {t('app.overview.summary.expenseCount')}
            </p>
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
                className='font-heading text-2xl font-semibold tracking-tight'>
                {expenseSummaryQuery.data.expenseCount}
              </div>
            ) : null}
          </CardContent>
        </Card>
        <Card className='transition-all duration-200 hover:border-primary/20 hover:shadow-md'>
          <CardHeader className='pb-2'>
            <p className='text-sm text-muted-foreground'>
              {t('app.overview.summary.householdCount')}
            </p>
          </CardHeader>
          <CardContent>
            <div className='font-heading text-2xl font-semibold tracking-tight'>
              {householdCount}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

export { OverviewSummarySection }
