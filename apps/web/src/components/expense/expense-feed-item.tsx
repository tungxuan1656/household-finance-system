'use client'

import { format } from 'date-fns'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { formatExpenseAmount } from '@/lib/format-expense-amount'
import type { TranslationKey } from '@/lib/i18n/i18n-init'
import { t } from '@/lib/i18n/t'
import { getCategoryLabel } from '@/lib/reference-data/labels'
import type { ExpenseDTO, ExpenseVisibility } from '@/types/expense'

type ExpenseFeedItemProps = {
  expense: ExpenseDTO
  onClick?: (id: string) => void
}

const VISIBILITY_BADGE_LABELS: Record<ExpenseVisibility, TranslationKey> = {
  private: 'expense.visibilityBadge.private',
  household: 'expense.visibilityBadge.household',
}

const VISIBILITY_BADGE_VARIANTS: Record<
  ExpenseVisibility,
  'outline' | 'secondary'
> = {
  private: 'outline',
  household: 'secondary',
}

function formatDate(occurredAt: number): string {
  return format(new Date(occurredAt), 'dd/MM/yyyy')
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

  return (
    <Card
      className='cursor-pointer transition-colors hover:bg-muted/50'
      role='button'
      size='sm'
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}>
      <CardContent className='flex items-center justify-between gap-3'>
        <div className='flex min-w-0 flex-1 flex-col gap-1'>
          <span className='text-xs text-muted-foreground'>
            {getCategoryLabel(expense.categoryKey)}
          </span>
          <span className='truncate text-sm font-medium'>{expense.title}</span>
          <span className='text-xs text-muted-foreground'>
            {formatDate(expense.occurredAt)}
          </span>
        </div>
        <div className='flex flex-col items-end gap-1.5'>
          <span className='text-sm font-semibold tabular-nums'>
            {formatExpenseAmount(expense.amountMinor, expense.currencyCode)}
          </span>
          <Badge variant={VISIBILITY_BADGE_VARIANTS[expense.visibility]}>
            {t(VISIBILITY_BADGE_LABELS[expense.visibility])}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
