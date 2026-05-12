'use client'

import { ArrowDown, ArrowUp } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
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

function getProgressColor(percent: number): string {
  if (percent >= 100) return '[&>div]:bg-destructive'
  if (percent >= 80) return '[&>div]:bg-warning'

  return ''
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
      <div className='space-y-4 rounded-2xl border bg-card p-5 shadow-sm md:p-6'>
        <div className='flex items-center justify-between'>
          <Skeleton className='h-4 w-32' />
          <Skeleton className='h-6 w-24' />
        </div>
        <Skeleton className='h-10 w-48' />
        <Skeleton className='h-2 w-full' />
        <Skeleton className='h-4 w-40' />
        <Skeleton className='h-4 w-48' />
      </div>
    )
  }

  /* ── Error state ───────────────────────────────────────────────── */
  if (error) {
    return (
      <div className='rounded-2xl border bg-card p-5 shadow-sm md:p-6'>
        <p className='mb-3 text-sm text-muted-foreground'>
          Could not load spending summary.
        </p>
        <Button size='sm' variant='outline' onClick={onRetry}>
          Retry
        </Button>
      </div>
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
    <div className='space-y-4 rounded-2xl border bg-card p-5 shadow-sm md:p-6'>
      {/* Top row */}
      <div className='flex items-center justify-between'>
        <span className='text-sm text-muted-foreground'>
          This month spending
        </span>
        <span className='text-sm font-medium tabular-nums'>{period}</span>
      </div>

      {/* Main number */}
      <div className='text-3xl font-bold tracking-tight tabular-nums md:text-4xl'>
        {formatCurrency(totalSpendMinor, currencyCode)}
      </div>

      {/* Budget section */}
      {hasBudget ? (
        <>
          {/* Progress bar */}
          <div className='space-y-2'>
            <Progress
              className={cn('h-2', getProgressColor(percentUsed))}
              value={Math.min(percentUsed, 100)}
            />
            <div className='flex items-center justify-between'>
              <span className='text-xs text-muted-foreground'>
                {percentUsed}% of monthly budget
              </span>
              <span className='text-xs text-muted-foreground'>
                {isOverBudget
                  ? `Over budget by ${formatCurrency(
                      Math.abs(budgetRemaining),
                      currencyCode,
                    )}`
                  : `Còn ${formatCurrency(budgetRemaining, currencyCode)}`}
              </span>
            </div>
          </div>

          {/* Month-over-month trend */}
          {momPercent != null && momPercent !== 0 && (
            <div
              className={cn(
                'flex items-center gap-1 text-sm',
                delta! < 0 ? 'text-green-600' : 'text-yellow-600',
              )}>
              {delta! < 0 ? (
                <ArrowDown className='size-4' />
              ) : (
                <ArrowUp className='size-4' />
              )}
              <span>{Math.abs(momPercent)}% so với tháng trước</span>
            </div>
          )}

          {/* Safe daily rate */}
          {dailyRate != null && (
            <p className='mt-1 text-xs text-muted-foreground'>
              Còn {daysRemaining} ngày &mdash; khoảng{' '}
              {formatCurrency(dailyRate, currencyCode)}
              /ngày
            </p>
          )}
        </>
      ) : (
        /* No budget set — prompt */
        <p className='text-xs text-muted-foreground'>
          Set a monthly budget to track your spending
        </p>
      )}
    </div>
  )
}

export { HeroStatsCard }
export type { HeroStatsCardProps }
