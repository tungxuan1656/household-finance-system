'use client'

import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/views/app/overview/overview-formatters'

type CategoryItem = {
  categoryKey: string
  totalSpendMinor: number
  percentOfTotal: number
}

type CategoryBreakdownProps = {
  categories: CategoryItem[]
  currencyCode: string
  totalSpendMinor: number
  isLoading: boolean
  isEmpty: boolean
}

const CHART_COLORS = [
  '[&>div]:bg-chart-1',
  '[&>div]:bg-chart-2',
  '[&>div]:bg-chart-3',
  '[&>div]:bg-chart-4',
  '[&>div]:bg-chart-5',
]

function CategoryBreakdown({
  categories,
  currencyCode,
  isLoading,
  isEmpty,
}: CategoryBreakdownProps) {
  return (
    <section>
      <h2 className='mb-3 text-base font-semibold'>Category Breakdown</h2>

      {isLoading ? (
        <LoadingSkeleton />
      ) : isEmpty ? (
        <EmptyState />
      ) : (
        <div className='rounded-xl border bg-card p-4'>
          <div className='space-y-3'>
            {categories.map((cat, index) => {
              const colorClass = CHART_COLORS[index % CHART_COLORS.length]

              return (
                <div key={cat.categoryKey} className='flex flex-col gap-1'>
                  {/* Top row: label + percent + amount */}
                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-medium'>
                      {cat.categoryKey}
                    </span>
                    <div className='flex items-center gap-2'>
                      <span className='font-mono text-sm text-muted-foreground tabular-nums'>
                        {cat.percentOfTotal}%
                      </span>
                      <span className='font-mono text-sm tabular-nums'>
                        {formatCurrency(cat.totalSpendMinor, currencyCode)}
                      </span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <Progress
                    className={cn('h-1.5 rounded-full', colorClass)}
                    value={cat.percentOfTotal}
                  />
                </div>
              )
            })}
          </div>
        </div>
      )}
    </section>
  )
}

function LoadingSkeleton() {
  return (
    <div className='space-y-4'>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className='flex flex-col gap-1'>
          <div className='flex items-center justify-between'>
            <Skeleton className='h-4 w-20' />
            <div className='flex items-center gap-2'>
              <Skeleton className='h-4 w-10' />
              <Skeleton className='h-4 w-16' />
            </div>
          </div>
          <Skeleton className='h-2 w-full rounded-full' />
        </div>
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div className='py-4 text-center'>
      <p className='text-sm text-muted-foreground'>
        Start adding expenses to see your spending breakdown.
      </p>
    </div>
  )
}

export type { CategoryBreakdownProps, CategoryItem }
export { CategoryBreakdown }
