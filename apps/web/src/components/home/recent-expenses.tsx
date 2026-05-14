'use client'

import Link from 'next/link'

import { DataState } from '@/components/shared/data-state'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { t } from '@/lib/i18n/t'
import { getCategoryPresentation } from '@/lib/reference-data/category-presentation'
import type { ExpenseDTO } from '@/types/expense'
import type { ReferenceCategoryDTO } from '@/types/reference-data'
import { formatCurrency } from '@/utils/currency/format'
import { formatRelativeDate } from '@/utils/datetime/format'

type RecentExpensesProps = {
  expenses: ExpenseDTO[]
  isLoading: boolean
  error: Error | null
  onRetry: () => void
  isEmpty: boolean
  referenceCategories?: ReferenceCategoryDTO[]
}

function RecentExpenses({
  expenses,
  isLoading,
  error,
  onRetry,
  isEmpty,
  referenceCategories,
}: RecentExpensesProps) {
  const showError = Boolean(error) && expenses.length === 0

  return (
    <DataState
      action={
        showError ? (
          <Button onClick={onRetry}>
            {t('app.overview.actions.retrySummary')}
          </Button>
        ) : undefined
      }
      errorDescription={
        showError ? t('app.overview.recentExpenses.error') : undefined
      }
      isEmpty={isEmpty}
      isError={showError}
      isLoading={isLoading}
      title={t('app.overview.recentExpenses.title')}>
      <Card>
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

                      <span aria-hidden='true'>&middot;</span>
                      <span>{category.label}</span>
                    </div>
                  </div>

                  <span className='shrink-0 py-0.5 font-mono text-base font-medium tabular-nums'>
                    {formatCurrency(item.amountMinor, item.currencyCode)}
                  </span>
                </li>
              )
            })}
          </ul>
        </CardContent>
      </Card>
    </DataState>
  )
}

export type { RecentExpensesProps }
export { RecentExpenses }
