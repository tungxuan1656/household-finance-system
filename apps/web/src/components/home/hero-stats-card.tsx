'use client'

import { ArrowDown, ArrowUp } from 'lucide-react'

import { StateCard } from '@/components/shared/state-card'
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
import { formatCurrency } from '@/views/app/overview/overview-formatters'

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
  onPeriodChange: (period: string) => void
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
  /* ── Loading state ─────────────────────────────────────────────── */
  if (isLoading) {
    return <StateCard isLoading title={t('app.overview.summary.title')} />
  }

  /* ── Error state ───────────────────────────────────────────────── */
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

  /* ── Computed values ───────────────────────────────────────────── */
  const hasBudget = budgetLimitMinor != null
  const percentUsed = hasBudget
    ? Math.round((totalSpendMinor / budgetLimitMinor) * 100)
    : 0
  const isOverBudget = hasBudget && totalSpendMinor > budgetLimitMinor
  const budgetRemaining = hasBudget ? budgetLimitMinor - totalSpendMinor : 0

  /* Month-over-month */
  const delta =
    previousTotalSpendMinor != null
      ? totalSpendMinor - previousTotalSpendMinor
      : null
  const momPercent =
    delta != null && previousTotalSpendMinor && previousTotalSpendMinor > 0
      ? Math.round((delta / previousTotalSpendMinor) * 100)
      : null

  /* Safe daily rate (only when not over budget) */
  const showDailyRate = hasBudget && !isOverBudget && daysRemaining > 0
  const dailyRate = showDailyRate
    ? Math.round(budgetRemaining / daysRemaining)
    : null

  /* ── Populated state ───────────────────────────────────────────── */
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('app.overview.summary.title')}</CardTitle>
        <CardAction>
          <span className='text-sm font-medium tabular-nums'>{period}</span>
        </CardAction>
      </CardHeader>
      <CardContent className='flex flex-col gap-4'>
        {/* Main number */}
        <div className='font-mono text-4xl font-bold tracking-tight tabular-nums md:text-5xl'>
          {formatCurrency(totalSpendMinor, currencyCode)}
        </div>

        {/* Budget section */}
        {hasBudget ? (
          <>
            {/* Progress bar */}
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
                        amount: formatCurrency(
                          Math.abs(budgetRemaining),
                          currencyCode,
                        ),
                      })
                    : t('app.overview.hero.remaining', {
                        amount: formatCurrency(budgetRemaining, currencyCode),
                      })}
                </span>
              </div>
            </div>

            {/* Month-over-month trend */}
            {momPercent != null && momPercent !== 0 && (
              <div className='flex items-center gap-1 text-sm'>
                {delta! < 0 ? <ArrowDown data-icon /> : <ArrowUp data-icon />}
                <span>
                  {t('app.overview.hero.monthOverMonth', {
                    percent: Math.abs(momPercent),
                  })}
                </span>
              </div>
            )}

            {/* Safe daily rate */}
            {dailyRate != null && (
              <p className='text-xs text-muted-foreground'>
                {t('app.overview.hero.dailyRate', {
                  days: daysRemaining,
                  amount: formatCurrency(dailyRate, currencyCode),
                })}
              </p>
            )}
          </>
        ) : (
          /* No budget set — prompt */
          <p className='text-xs text-muted-foreground'>
            {t('app.overview.hero.noBudget')}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export { HeroStatsCard }
export type { HeroStatsCardProps }
