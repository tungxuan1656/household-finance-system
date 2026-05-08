'use client'

import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { useAnalyticsOverviewQuery } from '@/hooks/api/use-analytics'
import { useBudgetListQuery } from '@/hooks/api/use-budgets'
import { useExpenseSummaryQuery } from '@/hooks/api/use-expense'
import { useHouseholdMembersQuery } from '@/hooks/api/use-households'
import { PATHS } from '@/lib/constants/paths'
import { t } from '@/lib/i18n/t'
import { useAuthStore } from '@/stores/auth.store'
import { useHouseholdStore } from '@/stores/household.store'
import type { HouseholdDTO } from '@/types/household'

function getCurrentPeriod() {
  const now = new Date()
  const year = now.getUTCFullYear()
  const month = String(now.getUTCMonth() + 1).padStart(2, '0')

  return `${year}-${month}`
}

function formatCurrency(amountMinor: number, currencyCode: string) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: currencyCode,
  }).format(amountMinor / 100)
}

function formatPeriodLabel(period: string) {
  const [year, month] = period.split('-')

  return t('app.overview.summary.period', {
    month,
    year,
  })
}

function getRoleLabel(role: HouseholdDTO['role']) {
  return t(`app.householdDetail.members.invite.fields.role.options.${role}`)
}

function QueryState({
  description,
  isLoading,
  onRetry,
  retryLabel,
  title,
}: {
  description: string
  isLoading?: boolean
  onRetry?: () => void
  retryLabel?: string
  title?: string
}) {
  if (isLoading) {
    return (
      <div className='space-y-2'>
        <Skeleton className='h-4 w-32' />
        <Skeleton className='h-4 w-24' />
      </div>
    )
  }

  return (
    <div className='space-y-3 rounded-xl border border-dashed p-4'>
      <div className='space-y-1'>
        {title ? <p className='font-medium'>{title}</p> : null}
        <p className='text-sm text-muted-foreground'>{description}</p>
      </div>
      {onRetry && retryLabel ? (
        <Button
          className='min-h-11'
          type='button'
          variant='outline'
          onClick={onRetry}>
          {retryLabel}
        </Button>
      ) : null}
    </div>
  )
}

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
    <Card className='min-w-0'>
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
          <QueryState
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

function OverviewPage() {
  const user = useAuthStore.use.user()
  const households = useHouseholdStore.use.households()
  const currentHousehold = useHouseholdStore.use.currentHousehold()
  const period = getCurrentPeriod()

  const expenseSummaryQuery = useExpenseSummaryQuery()
  const budgetSummaryQuery = useBudgetListQuery(currentHousehold?.id)

  const showEmptyState = households.length === 0
  const canInviteMembers = households.some(
    (household) => household.role === 'admin',
  )

  return (
    <div className='space-y-6'>
      <header className='space-y-2'>
        <Badge variant='outline'>{t('app.overview.badge')}</Badge>
        <h1 className='font-heading text-3xl tracking-tight'>
          {t('app.overview.title')}
        </h1>
        <p className='max-w-2xl text-sm leading-6 text-muted-foreground'>
          {t('app.overview.description')}
        </p>
        <p className='text-sm text-muted-foreground'>
          {t('app.overview.signedInAs')}{' '}
          <span className='font-medium text-foreground'>
            {user?.displayName ?? t('app.overview.demoFamily')}
          </span>
          {user?.email ? <span> · {user.email}</span> : null}
        </p>
      </header>

      {showEmptyState ? (
        <Empty className='border bg-card'>
          <EmptyHeader>
            <EmptyTitle>{t('app.overview.empty.title')}</EmptyTitle>
            <EmptyDescription>
              {t('app.overview.empty.description')}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild className='w-full sm:w-auto'>
              <Link href={PATHS.ONBOARDING}>
                {t('app.overview.empty.createHousehold')}
              </Link>
            </Button>
            <Button asChild className='w-full sm:w-auto' variant='outline'>
              <Link href={PATHS.ONBOARDING}>
                {t('app.overview.empty.joinHousehold')}
              </Link>
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className='space-y-6'>
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
                    <QueryState
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
                  <CardTitle>
                    {t('app.overview.summary.expenseCount')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {expenseSummaryQuery.isLoading ? (
                    <Skeleton className='h-10 w-20' />
                  ) : expenseSummaryQuery.error ? (
                    <QueryState
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
                  <CardTitle>
                    {t('app.overview.summary.householdCount')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='font-heading text-3xl tracking-tight'>
                    {households.length}
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          <section className='space-y-3'>
            <div className='space-y-1'>
              <h2 className='font-heading text-2xl tracking-tight'>
                {t('app.overview.households.title')}
              </h2>
              <p className='text-sm text-muted-foreground'>
                {t('app.overview.households.description')}
              </p>
            </div>

            <div className='grid gap-4 md:grid-cols-2'>
              {households.map((household) => (
                <HouseholdOverviewCard
                  key={household.id}
                  household={household}
                />
              ))}
            </div>
          </section>

          <section className='grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]'>
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
                  <QueryState
                    description={t('app.overview.budget.errorDescription')}
                    retryLabel={t('app.overview.actions.retryBudget')}
                    title={t('app.overview.budget.errorTitle')}
                    onRetry={() => budgetSummaryQuery.refetch()}
                  />
                ) : !currentHousehold ? (
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

            <Card>
              <CardHeader>
                <CardTitle>{t('app.overview.nextSteps.title')}</CardTitle>
                <CardDescription>
                  {t('app.overview.nextSteps.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-2'>
                <Button
                  asChild
                  className='min-h-11 w-full justify-start'
                  variant='outline'>
                  <Link href={PATHS.EXPENSES}>
                    {t('app.overview.actions.openExpenses')}
                  </Link>
                </Button>
                <Button
                  asChild
                  className='min-h-11 w-full justify-start'
                  variant='outline'>
                  <Link href={PATHS.BUDGETS}>
                    {t('app.overview.actions.openBudgetSetup')}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </section>
        </div>
      )}
    </div>
  )
}

export { OverviewPage }
