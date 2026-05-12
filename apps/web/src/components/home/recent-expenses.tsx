'use client'

import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/views/app/overview/overview-formatters'

type RecentExpenseItem = {
  id: string
  title: string
  categoryKey: string
  amountMinor: number
  currencyCode: string
  occurredAt: number
  payerName?: string
  groupNames?: string[]
  visibility: 'private' | 'household'
}

type RecentExpensesProps = {
  expenses: RecentExpenseItem[]
  isLoading: boolean
  error: Error | null
  onRetry: () => void
  isEmpty: boolean
}

function formatRelativeDate(timestampSec: number): string {
  const now = new Date()
  const date = new Date(timestampSec * 1000)
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
  )
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function RecentExpenses({
  expenses,
  isLoading,
  error,
  onRetry,
  isEmpty,
}: RecentExpensesProps) {
  return (
    <section>
      {/* Section header */}
      <div className='mb-3 flex items-center justify-between'>
        <h2 className='text-base font-semibold'>Recent Expenses</h2>
        <Button asChild size='sm' variant='ghost'>
          <Link href='/expenses'>
            View all
            <span aria-hidden='true'>&nbsp;&rarr;</span>
          </Link>
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : error ? (
        <ErrorState onRetry={onRetry} />
      ) : isEmpty ? (
        <EmptyState />
      ) : (
        <ul className='divide-y divide-border'>
          {expenses.map((item) => (
            <li key={item.id} className='flex items-start gap-3 py-3'>
              {/* Category badge */}
              <span className='self-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium'>
                {item.categoryKey}
              </span>

              {/* Middle content */}
              <div className='min-w-0 flex-1'>
                <p className='truncate text-sm font-medium'>{item.title}</p>
                <p className='mt-0.5 truncate text-xs text-muted-foreground'>
                  <span>{formatRelativeDate(item.occurredAt)}</span>
                  {item.payerName && (
                    <>
                      <span aria-hidden='true'> · </span>
                      <span>{item.payerName}</span>
                    </>
                  )}
                  {item.groupNames && item.groupNames.length > 0 && (
                    <>
                      <span aria-hidden='true'> · </span>
                      {item.groupNames.map((group) => (
                        <span
                          key={group}
                          className='rounded-full bg-muted/50 px-1.5 py-0 text-xs'>
                          {group}
                        </span>
                      ))}
                    </>
                  )}
                </p>
              </div>

              {/* Amount */}
              <span className='shrink-0 text-sm font-medium tabular-nums'>
                {formatCurrency(item.amountMinor, item.currencyCode)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function LoadingSkeleton() {
  return (
    <div className='divide-y divide-border'>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className='flex items-start gap-3 py-3'>
          <Skeleton className='size-10 shrink-0 rounded-full' />
          <div className='flex-1 space-y-2'>
            <Skeleton className='h-4 w-3/5' />
            <Skeleton className='h-3 w-2/5' />
          </div>
        </div>
      ))}
    </div>
  )
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className='py-6 text-center'>
      <p className='mb-3 text-sm text-muted-foreground'>
        Could not load recent expenses.
      </p>
      <Button size='sm' variant='outline' onClick={onRetry}>
        Retry
      </Button>
    </div>
  )
}

function EmptyState() {
  return (
    <div className='py-6 text-center'>
      <p className='text-sm text-muted-foreground'>
        No expenses yet. Tap + to add your first one.
      </p>
    </div>
  )
}

export type { RecentExpenseItem, RecentExpensesProps }
export { RecentExpenses }
