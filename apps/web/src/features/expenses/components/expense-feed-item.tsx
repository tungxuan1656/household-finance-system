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
      className='group flex cursor-pointer items-center gap-4 rounded-3xl px-2 transition-all hover:bg-accent/50 active:scale-[0.99]'
      role='button'
      tabIndex={0}
      onClick={handleClick}>
      <Badge
        className='size-12 shrink-0'
        style={{ backgroundColor: category.color + '1A' }}
        variant='secondary'>
        <img alt={category.label} className='size-7' src={category.iconUrl} />
      </Badge>
      <div className='min-w-0 flex-1'>
        <p className='truncate text-base font-semibold tracking-tight'>
          {expense.title}
        </p>
        <div className='mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground'>
          <span className='font-medium'>{category.label}</span>
          {contextLabel ? (
            <>
              <span aria-hidden='true'>&middot;</span>
              <Badge
                className='h-5 rounded-full bg-muted px-2 text-[10px] font-medium'
                variant='secondary'>
                {contextLabel}
              </Badge>
            </>
          ) : null}
          {expense.note ? (
            <>
              <span aria-hidden='true'>&middot;</span>
              <span className='truncate font-normal'>{expense.note}</span>
            </>
          ) : null}
        </div>
      </div>
      <div className='flex flex-col items-end gap-0.5'>
        <span className='shrink-0 font-mono text-lg font-semibold text-foreground tabular-nums'>
          {formatCurrency(expense.amountMinor, expense.currencyCode)}
        </span>
      </div>
    </div>
  )
}
