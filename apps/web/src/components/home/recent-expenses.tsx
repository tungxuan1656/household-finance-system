'use client'

import { ReceiptText } from 'lucide-react'
import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { t } from '@/lib/i18n/t'
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
  if (diffDays === 0) return t('app.overview.recentExpenses.today')
  if (diffDays === 1) return t('app.overview.recentExpenses.yesterday')

  return date.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' })
}

function RecentExpenses({
  expenses,
  isLoading,
  error,
  onRetry,
  isEmpty,
}: RecentExpensesProps) {
  return (
    <Card surface='glass'>
      <CardHeader className='flex flex-row items-center justify-between gap-3'>
        <CardTitle>{t('app.overview.recentExpenses.title')}</CardTitle>
        <Button asChild size='sm' variant='ghost'>
          <Link href='/expenses'>
            {t('app.overview.recentExpenses.viewAll')}
            <span aria-hidden='true'>&nbsp;&rarr;</span>
          </Link>
        </Button>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <LoadingSkeleton />
        ) : error ? (
          <ErrorState onRetry={onRetry} />
        ) : isEmpty ? (
          <EmptyState />
        ) : (
          <ul className='divide-y divide-border'>
            {expenses.map((item) => (
              <li
                key={item.id}
                className='flex items-start gap-3 py-3 first:pt-0 last:pb-0'>
                <Badge className='size-10 rounded-full p-0' variant='outline'>
                  <ReceiptText className='size-5 text-muted-foreground' />
                </Badge>

                <div className='min-w-0 flex-1 py-0.5'>
                  <p className='truncate text-sm font-medium'>{item.title}</p>
                  <div className='mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-muted-foreground'>
                    <span>{formatRelativeDate(item.occurredAt)}</span>

                    {item.payerName && (
                      <>
                        <span aria-hidden='true'>&middot;</span>
                        <span>{item.payerName}</span>
                      </>
                    )}

                    <span aria-hidden='true'>&middot;</span>
                    <span className='capitalize'>{item.categoryKey}</span>

                    {item.groupNames && item.groupNames.length > 0 && (
                      <>
                        <span aria-hidden='true'>&middot;</span>
                        {item.groupNames.map((group) => (
                          <Badge key={group} variant='secondary'>
                            {group}
                          </Badge>
                        ))}
                      </>
                    )}
                  </div>
                </div>

                <span className='shrink-0 py-0.5 font-mono text-sm font-medium tabular-nums'>
                  {formatCurrency(item.amountMinor, item.currencyCode)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
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
        {t('app.overview.recentExpenses.error')}
      </p>
      <Button size='sm' variant='outline' onClick={onRetry}>
        {t('app.overview.actions.retrySummary')}
      </Button>
    </div>
  )
}

function EmptyState() {
  return (
    <div className='py-6 text-center'>
      <p className='text-sm text-muted-foreground'>
        {t('app.overview.recentExpenses.empty')}
      </p>
    </div>
  )
}

export type { RecentExpenseItem, RecentExpensesProps }
export { RecentExpenses }
