import Link from 'next/link'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAnalyticsOverviewQuery } from '@/hooks/api/use-analytics'
import { useBudgetListQuery } from '@/hooks/api/use-budgets'
import { useHouseholdMembersQuery } from '@/hooks/api/use-households'
import { PATHS } from '@/lib/constants/paths'
import { t } from '@/lib/i18n/t'
import type { HouseholdDTO } from '@/types/household'

import {
  formatCurrency,
  getCurrentPeriod,
  getRoleLabel,
} from './overview-formatters'
import { OverviewQueryState } from './overview-query-state'

type HouseholdOverviewCardProps = {
  household: HouseholdDTO
}

function HouseholdOverviewCard({ household }: HouseholdOverviewCardProps) {
  const period = getCurrentPeriod()
  const membersQuery = useHouseholdMembersQuery(household.id)
  const budgetsQuery = useBudgetListQuery(household.id)
  const analyticsQuery = useAnalyticsOverviewQuery(
    {
      period,
      household_id: household.id,
    },
    {
      enabled: true,
    },
  )

  const memberCount = membersQuery.data?.items.length ?? 0
  const budgetCount = budgetsQuery.data?.items.length ?? 0
  const expenseCount = analyticsQuery.data?.expenseCount ?? 0
  const totalSpend = analyticsQuery.data
    ? formatCurrency(
        analyticsQuery.data.totalSpendMinor,
        analyticsQuery.data.currencyCode,
      )
    : null
  const isLoading =
    membersQuery.isLoading || budgetsQuery.isLoading || analyticsQuery.isLoading
  const hasError =
    membersQuery.error || budgetsQuery.error || analyticsQuery.error || null

  const handleRetry = () => {
    void membersQuery.refetch?.()
    void budgetsQuery.refetch?.()
    void analyticsQuery.refetch?.()
  }

  return (
    <Card className='min-w-0 transition-all duration-200 hover:border-primary/20 hover:shadow-md'>
      <CardHeader className='space-y-1'>
        <div className='flex items-start justify-between gap-3'>
          <div className='min-w-0 space-y-1'>
            <CardTitle className='text-base wrap-break-word'>
              {household.name}
            </CardTitle>
            <CardDescription>{getRoleLabel(household.role)}</CardDescription>
          </div>
          <Button asChild className='min-h-11 shrink-0' variant='outline'>
            <Link href={`${PATHS.HOUSEHOLDS}/${household.id}`}>
              {t('app.households.actions.viewDetail')}
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className='space-y-2 text-sm text-muted-foreground'>
        {isLoading ? (
          <div className='space-y-2'>
            <Skeleton className='h-4 w-28' />
            <Skeleton className='h-4 w-24' />
            <Skeleton className='h-4 w-20' />
          </div>
        ) : hasError ? (
          <OverviewQueryState
            description={t('app.overview.households.errorDescription')}
            retryLabel={t('app.overview.actions.retryHouseholdCard')}
            title={t('app.overview.households.errorTitle')}
            onRetry={handleRetry}
          />
        ) : (
          <>
            <p>
              {t('app.overview.households.memberCount')}: {memberCount}
            </p>
            <p>
              {t('app.overview.households.budgetCount')}: {budgetCount}
            </p>
            <p>
              {t('app.overview.households.expenseCount')}: {expenseCount}
            </p>
            {totalSpend ? (
              <p>
                {t('app.overview.households.totalSpend')}: {totalSpend}
              </p>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  )
}

export { HouseholdOverviewCard }
