'use client'

import { Badge } from '@/components/ui/badge'
import { useReferenceCategoriesQuery } from '@/hooks/api/use-reference-data'
import { t } from '@/lib/i18n/t'
import { getCategoryPresentation } from '@/lib/reference-data/category-presentation'
import { formatCurrency } from '@/utils/currency/format'

import type { ExpenseDTO } from '../types/expense'

type ExpenseFeedItemProps = {
  expense: ExpenseDTO
  onClick?: (id: string) => void
}

export function ExpenseFeedItem({ expense, onClick }: ExpenseFeedItemProps) {
  const handleClick = () => {
    onClick?.(expense.id)
  }

  const referenceCategoriesQuery = useReferenceCategoriesQuery()
  const category = getCategoryPresentation(
    expense.categoryKey,
    referenceCategoriesQuery.data?.items,
  )
  const contextLabel =
    expense.groupIds && expense.groupIds.length > 0
      ? t('expense.group')
      : expense.householdId
        ? t('expense.household')
        : null

  return (
    <div
      className='flex cursor-pointer items-center gap-3 rounded-3xl px-3 py-3 transition-colors hover:bg-accent/50 hover:shadow-sm active:scale-[0.98]'
      role='button'
      tabIndex={0}
      onClick={handleClick}>
      <Badge
        className='size-10'
        style={{ backgroundColor: category.color + '1A' }}
        variant='secondary'>
        <img alt={category.label} className='size-6' src={category.iconUrl} />
      </Badge>
      <div className='min-w-0 flex-1 py-0.5'>
        <p className='truncate text-sm font-medium'>{expense.title}</p>
        <div className='mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-muted-foreground'>
          <span>{category.label}</span>
          {contextLabel ? (
            <>
              <span aria-hidden='true'>&middot;</span>
              <Badge
                className='h-5 rounded-full px-2 text-[10px]'
                variant='secondary'>
                {contextLabel}
              </Badge>
            </>
          ) : null}
          {expense.note ? (
            <>
              <span aria-hidden='true'>&middot;</span>
              <span className='truncate'>{expense.note}</span>
            </>
          ) : null}
        </div>
      </div>
      <span className='shrink-0 py-0.5 font-mono text-base font-medium tabular-nums'>
        {formatCurrency(expense.amountMinor, expense.currencyCode)}
      </span>
    </div>
  )
}
