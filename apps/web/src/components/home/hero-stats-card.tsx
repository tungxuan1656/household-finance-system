'use client'

import { ArrowDown, ArrowUp } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { t } from '@/lib/i18n/t'
import { cn } from '@/lib/utils'
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

function getProgressTone(percent: number): 'default' | 'warning' | 'danger' {
  if (percent >= 100) return 'danger'
  if (percent >= 80) return 'warning'

  return 'default'
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
    return (
      <Card surface='glass'>
        <CardContent className='space-y-4 p-5 md:p-6'>
          <div className='flex items-center justify-between'>
            <Skeleton className='h-4 w-32' />
            <Skeleton className='h-6 w-24' />
          </div>
          <Skeleton className='h-10 w-48' />
          <Skeleton className='h-2 w-full' />
          <Skeleton className='h-4 w-40' />
          <Skeleton className='h-4 w-48' />
        </CardContent>
      </Card>
    )
  }

  /* ── Error state ───────────────────────────────────────────────── */
  if (error) {
    return (
      <Card surface='glass'>
        <CardContent className='p-5 md:p-6'>
          <p className='mb-3 text-sm text-muted-foreground'>
            {t('app.overview.summary.errorTitle')}
          </p>
          <Button size='sm' variant='outline' onClick={onRetry}>
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
    <Card
      className='space-y-4 bg-gradient-to-br from-card to-muted/20 p-0'
      surface='glass'>
      <CardContent className='space-y-4 p-5 md:p-6'>
        {/* Top row */}
        <div className='flex items-center justify-between'>
          <span className='text-sm text-muted-foreground'>
            {t('app.overview.summary.title')}
          </span>
          <span className='text-sm font-medium tabular-nums'>{period}</span>
        </div>

        {/* Main number */}
        <div className='font-mono text-4xl font-bold tracking-tight tabular-nums md:text-5xl'>
          {formatCurrency(totalSpendMinor, currencyCode)}
        </div>

        {/* Budget section */}
        {hasBudget ? (
          <>
            {/* Progress bar */}
            <div className='space-y-2'>
              <Progress
                className='h-2'
                tone={getProgressTone(percentUsed)}
                value={Math.min(percentUsed, 100)}
              />
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
              <div
                className={cn(
                  'flex items-center gap-1 text-sm',
                  delta! < 0 ? 'text-status-success' : 'text-status-warning',
                )}>
                {delta! < 0 ? (
                  <ArrowDown className='size-4' />
                ) : (
                  <ArrowUp className='size-4' />
                )}
                <span>
                  {t('app.overview.hero.monthOverMonth', {
                    percent: Math.abs(momPercent),
                  })}
                </span>
              </div>
            )}

            {/* Safe daily rate */}
            {dailyRate != null && (
              <p className='mt-1 text-xs text-muted-foreground'>
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
