'use client'

import { AlertTriangle } from 'lucide-react'

import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/views/app/overview/overview-formatters'

type BudgetInfo = {
  id: string
  name: string
  categoryKey?: string
  limitMinor: number
  spentMinor: number
  percentUsed: number
  currencyCode: string
}

type BudgetStatusCardsProps = {
  budgets: BudgetInfo[]
  isLoading: boolean
  isEmpty: boolean
}

function getProgressColor(percent: number): string {
  if (percent >= 100) return '[&>div]:bg-destructive'
  if (percent >= 80) return '[&>div]:bg-warning'

  return ''
}

function BudgetStatusCards({
  budgets,
  isLoading,
  isEmpty,
}: BudgetStatusCardsProps) {
  /* ── Loading state ─────────────────────────────────────────────── */
  if (isLoading) {
    return (
      <div className='flex gap-3 overflow-x-auto px-4 pb-2'>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className='h-[100px] min-w-[180px] shrink-0 animate-pulse rounded-xl bg-muted'
          />
        ))}
      </div>
    )
  }

  /* ── Empty state ───────────────────────────────────────────────── */
  if (isEmpty || budgets.length === 0) {
    return (
      <div className='px-4 pb-2'>
        <div className='rounded-xl border bg-card p-4'>
          <p className='text-sm text-muted-foreground'>
            Set a budget to track spending
          </p>
        </div>
      </div>
    )
  }

  /* ── Sort: Overall first, then descending by usage ─────────────── */
  const sorted = [...budgets].sort((a, b) => {
    if (a.name === 'Overall') return -1
    if (b.name === 'Overall') return 1

    return b.percentUsed - a.percentUsed
  })

  const isExceeded = (b: BudgetInfo) => b.spentMinor > b.limitMinor
  const remaining = (b: BudgetInfo) => b.limitMinor - b.spentMinor

  /* ── Populated state ───────────────────────────────────────────── */
  return (
    <div className='flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 md:flex-wrap md:overflow-x-visible'>
      {sorted.map((budget) => (
        <div
          key={budget.id}
          className='max-w-[220px] min-w-[180px] shrink-0 snap-start space-y-2 rounded-xl border bg-card p-4 md:shrink'>
          {/* Header row */}
          <div className='flex items-center gap-1'>
            <span
              className={cn(
                budget.name === 'Overall' ? 'text-sm font-medium' : 'text-sm',
              )}>
              {budget.name}
            </span>
            {budget.percentUsed >= 80 && (
              <AlertTriangle className='text-warning size-3 shrink-0' />
            )}
          </div>

          {/* Progress bar + percent */}
          <div className='flex items-center gap-2'>
            <Progress
              className={cn('h-2 flex-1', getProgressColor(budget.percentUsed))}
              value={Math.min(budget.percentUsed, 100)}
            />
            <span className='font-mono text-xs tabular-nums'>
              {budget.percentUsed}%
            </span>
          </div>

          {/* Spent / Limit */}
          <p className='text-xs'>
            {formatCurrency(budget.spentMinor, budget.currencyCode)}
            {' / '}
            {formatCurrency(budget.limitMinor, budget.currencyCode)}
          </p>

          {/* Remaining or exceeded */}
          {isExceeded(budget) ? (
            <p className='text-xs text-destructive'>
              Vượt{' '}
              {formatCurrency(Math.abs(remaining(budget)), budget.currencyCode)}
            </p>
          ) : (
            <p className='text-xs text-muted-foreground'>
              Còn {formatCurrency(remaining(budget), budget.currencyCode)}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}

export { BudgetStatusCards }
export type { BudgetInfo, BudgetStatusCardsProps }
