'use client'

import Link from 'next/link'

import { CardPlaceholder } from '@/components/shared/card-placeholder'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { t } from '@/lib/i18n/t'
import { getCategoryPresentation } from '@/lib/reference-data/category-presentation'
import type { ReferenceCategoryDTO } from '@/types/reference-data'
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
  referenceCategories?: ReferenceCategoryDTO[]
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
  referenceCategories,
}: RecentExpensesProps) {
  return (
    <CardPlaceholder
      isEmpty={isEmpty}
      isLoading={isLoading}
      title={t('app.overview.recentExpenses.title')}>
      <CardHeader>
        <CardTitle>{t('app.overview.recentExpenses.title')}</CardTitle>
        <CardAction>
          <Button asChild className='h-auto! px-0!' variant={'ghost'}>
            <Link href='/expenses'>
              {t('app.overview.recentExpenses.viewAll')}
              <span aria-hidden='true'>&nbsp;&rarr;</span>
            </Link>
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent>
        {error ? (
          <ErrorState onRetry={onRetry} />
        ) : (
          <ul className='divide-y divide-border'>
            {expenses.map((item) => {
              const category = getCategoryPresentation(
                item.categoryKey,
                referenceCategories,
              )

              return (
                <li
                  key={item.id}
                  className='flex items-start gap-3 py-3 first:pt-0 last:pb-0'>
                  <Badge
                    className='size-10'
                    style={{ backgroundColor: category.color + '1A' }}
                    variant='secondary'>
                    <img
                      alt={category.label}
                      className='size-6'
                      src={category.iconUrl}
                    />
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
                      <span>{category.label}</span>

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

                  <span className='shrink-0 py-0.5 font-mono text-base font-medium tabular-nums'>
                    {formatCurrency(item.amountMinor, item.currencyCode)}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </CardPlaceholder>
  )
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className='py-6 text-center'>
      <div className='flex flex-col items-center gap-3'>
        <p className='text-sm text-muted-foreground'>
          {t('app.overview.recentExpenses.error')}
        </p>
        <Button onClick={onRetry}>
          {t('app.overview.actions.retrySummary')}
        </Button>
      </div>
    </div>
  )
}

export type { RecentExpenseItem, RecentExpensesProps }
export { RecentExpenses }
