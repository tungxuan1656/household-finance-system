'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useReferenceCategoriesQuery } from '@/hooks/api/use-reference-data'
import type { TranslationKey } from '@/lib/i18n/i18n-init'
import { t } from '@/lib/i18n/t'
import { getCategoryPresentation } from '@/lib/reference-data/category-presentation'
import { formatCurrency } from '@/utils/currency/format'
import { formatRelativeDate } from '@/utils/datetime/format'

import type { ExpenseDTO, ExpenseVisibility } from '../types/expense'

type ExpenseFeedItemProps = {
  expense: ExpenseDTO
  onClick?: (id: string) => void
}

const VISIBILITY_BADGE_LABELS: Record<ExpenseVisibility, TranslationKey> = {
  private: 'expense.visibilityBadge.private',
  household: 'expense.visibilityBadge.household',
}

export function ExpenseFeedItem({ expense, onClick }: ExpenseFeedItemProps) {
  const handleClick = () => {
    onClick?.(expense.id)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick?.(expense.id)
    }
  }

  const referenceCategoriesQuery = useReferenceCategoriesQuery()
  const category = getCategoryPresentation(
    expense.categoryKey,
    referenceCategoriesQuery.data?.items,
  )

  return (
    <Card
      className='cursor-pointer transition-colors hover:bg-accent/50 hover:shadow-sm active:scale-[0.98]'
      role='button'
      size='sm'
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}>
      <CardContent className='flex items-start gap-3'>
        <Badge
          className='size-10 shrink-0'
          style={{ backgroundColor: category.color + '1A' }}
          variant='secondary'>
          {category.iconUrl && (
            <img
              alt={category.label}
              className='size-6'
              src={category.iconUrl}
            />
          )}
        </Badge>
        <div className='min-w-0 flex-1 py-0.5'>
          <p className='truncate text-sm font-medium'>{expense.title}</p>
          <div className='mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-muted-foreground'>
            <span>{formatRelativeDate(expense.occurredAt)}</span>
            <span aria-hidden='true'>&middot;</span>
            <span>{category.label}</span>
            {expense.visibility !== 'household' && (
              <>
                <span aria-hidden='true'>&middot;</span>
                <span>{t(VISIBILITY_BADGE_LABELS[expense.visibility])}</span>
              </>
            )}
          </div>
        </div>
        <span className='shrink-0 py-0.5 font-mono text-base font-medium tabular-nums'>
          {formatCurrency(expense.amountMinor, expense.currencyCode)}
        </span>
      </CardContent>
    </Card>
  )
}
