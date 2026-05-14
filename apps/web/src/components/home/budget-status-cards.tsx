'use client'

import { AlertTriangle } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/utils/currency/format'

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
          <Card key={i} className='min-w-45 shrink-0'>
            <CardHeader>
              <CardTitle>
                <Skeleton className='h-4 w-24' />
              </CardTitle>
            </CardHeader>
            <CardContent className='grid gap-2'>
              <Skeleton className='h-2 w-full' />
              <Skeleton className='h-4 w-20' />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  /* ── Empty state ───────────────────────────────────────────────── */
  if (isEmpty || budgets.length === 0) {
    return (
      <div className='px-4 pb-2'>
        <Card>
          <CardHeader>
            <CardTitle>Budget status</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-muted-foreground'>
              Set a budget to track spending
            </p>
          </CardContent>
        </Card>
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
        <Card
          key={budget.id}
          className='max-w-55 min-w-45 shrink-0 snap-start md:shrink'>
          <CardHeader>
            <CardTitle className='flex items-center gap-1'>
              <span>{budget.name}</span>
              {budget.percentUsed >= 80 && <AlertTriangle data-icon />}
            </CardTitle>
          </CardHeader>
          <CardContent className='grid gap-2'>
            <div className='flex items-center gap-2'>
              <Progress value={Math.min(budget.percentUsed, 100)} />
              <span className='font-mono text-xs tabular-nums'>
                {budget.percentUsed}%
              </span>
            </div>
            <p className='text-xs'>
              {formatCurrency(budget.spentMinor, budget.currencyCode)}
              {' / '}
              {formatCurrency(budget.limitMinor, budget.currencyCode)}
            </p>
            {isExceeded(budget) ? (
              <p className='text-xs text-muted-foreground'>
                Vượt{' '}
                {formatCurrency(
                  Math.abs(remaining(budget)),
                  budget.currencyCode,
                )}
              </p>
            ) : (
              <p className='text-xs text-muted-foreground'>
                Còn {formatCurrency(remaining(budget), budget.currencyCode)}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export { BudgetStatusCards }
export type { BudgetInfo, BudgetStatusCardsProps }
