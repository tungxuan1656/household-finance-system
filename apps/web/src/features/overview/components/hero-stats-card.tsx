'use client'

import { DataState } from '@/components/shared/data-state'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { t } from '@/lib/i18n/t'
import { formatCurrency } from '@/utils/currency/format'

type HeroStatsCardProps = {
  currencyCode: string
  totalSpendMinor: number
  budgetLimitMinor?: number
  previousTotalSpendMinor?: number
  daysRemaining: number
  isLoading: boolean
  error: Error | null
  onRetry: () => void
  period: string
}

function HeroStatsCard({
  currencyCode,
  totalSpendMinor,
  budgetLimitMinor,
  previousTotalSpendMinor,
  daysRemaining,
  isLoading,
  error,
  onRetry,
  period,
}: HeroStatsCardProps) {
  if (isLoading)
    return <DataState isLoading title={t('app.overview.summary.title')} />

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('app.overview.summary.title')}</CardTitle>
        </CardHeader>
        <CardContent className='flex flex-col items-start gap-3'>
          <p className='text-sm text-muted-foreground'>
            {t('app.overview.summary.errorTitle')}
          </p>
          <Button variant='outline' onClick={onRetry}>
            {t('app.overview.actions.retrySummary')}
          </Button>
        </CardContent>
      </Card>
    )
  }

  const hasBudget = budgetLimitMinor != null
  const percentUsed = hasBudget
    ? Math.round((totalSpendMinor / budgetLimitMinor) * 100)
    : 0
  const isOverBudget = hasBudget && totalSpendMinor > budgetLimitMinor
  const budgetRemaining = hasBudget ? budgetLimitMinor - totalSpendMinor : 0
  const remainingBudgetAmount = formatCurrency(
    Math.max(budgetRemaining, 0),
    currencyCode,
  )
  const overBudgetAmount = formatCurrency(
    Math.abs(budgetRemaining),
    currencyCode,
  )
  const delta =
    previousTotalSpendMinor != null
      ? totalSpendMinor - previousTotalSpendMinor
      : null
  const momPercent =
    delta != null && previousTotalSpendMinor && previousTotalSpendMinor > 0
      ? Math.round((delta / previousTotalSpendMinor) * 100)
      : null
  const showDailyRate = hasBudget && !isOverBudget && daysRemaining > 0
  const dailyRate = showDailyRate
    ? Math.round(budgetRemaining / daysRemaining)
    : null

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('app.overview.summary.title')}</CardTitle>
        <CardAction>
          <span className='text-sm font-medium tabular-nums'>{period}</span>
        </CardAction>
      </CardHeader>
      <CardContent className='flex flex-col gap-4'>
        <div className='font-mono text-4xl font-bold tracking-tight tabular-nums md:text-5xl'>
          {formatCurrency(totalSpendMinor, currencyCode)}
        </div>
        {hasBudget ? (
          <>
            <div className='flex flex-col gap-2'>
              <Progress value={Math.min(percentUsed, 100)} />
              <div className='flex items-center justify-between'>
                <span className='text-xs text-muted-foreground'>
                  {t('app.overview.hero.percentOfBudget', {
                    percent: percentUsed,
                  })}
                </span>
                <span className='text-xs text-muted-foreground'>
                  {isOverBudget
                    ? t('app.overview.hero.overBudget', {
                        amount: overBudgetAmount,
                      })
                    : t('app.overview.hero.withinBudget')}
                </span>
              </div>
            </div>
            <div className='grid gap-3 text-sm md:grid-cols-3'>
              <div>
                <p className='text-muted-foreground'>
                  {t('app.overview.hero.budgetRemaining')}
                </p>
                <p className='font-medium tabular-nums'>
                  {remainingBudgetAmount}
                </p>
              </div>
              <div>
                <p className='text-muted-foreground'>
                  {t('app.overview.hero.daysRemaining')}
                </p>
                <p className='font-medium tabular-nums'>{daysRemaining}</p>
              </div>
              <div>
                <p className='text-muted-foreground'>
                  {t('app.overview.hero.dailyRateLabel')}
                </p>
                <p className='font-medium tabular-nums'>
                  {dailyRate != null
                    ? formatCurrency(dailyRate, currencyCode)
                    : '—'}
                </p>
              </div>
            </div>
          </>
        ) : null}
        {momPercent != null ? (
          <p className='text-sm text-muted-foreground'>
            {t('app.overview.hero.changeFromPrevious', {
              percent: momPercent,
            })}
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}

export { HeroStatsCard }
export type { HeroStatsCardProps }
