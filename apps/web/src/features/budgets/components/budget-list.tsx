'use client'

import { DataState } from '@/components/shared/data-state'
import { Button } from '@/components/ui/button'
import { useBudgetListQuery } from '@/features/budgets/hooks/use-budgets'
import type { BudgetDTO } from '@/features/budgets/types/budget'
import { t } from '@/lib/i18n/t'

import { BudgetCard } from './budget-card'

type BudgetListProps = {
  householdId?: string
  scope?: 'household' | 'personal'
  period?: string
  deletingBudgetId?: string | null
  onDelete: (budget: BudgetDTO) => Promise<void>
  onEdit: (budget: BudgetDTO) => void
}
function BudgetList({
  householdId,
  scope,
  period,
  deletingBudgetId,
  onDelete,
  onEdit,
}: BudgetListProps) {
  const { data, isLoading, isError, refetch } = useBudgetListQuery({
    householdId,
    scope,
    period,
  })
  const isEmpty = !isLoading && !isError && (!data || data.items.length === 0)

  return (
    <DataState
      customAction={
        isError ? (
          <Button
            size='default'
            type='button'
            variant='outline'
            onClick={() => void refetch()}>
            {t('budgets.actions.retry')}
          </Button>
        ) : undefined
      }
      emptyDescription={t('budgets.empty.description')}
      emptyTitle={t('budgets.empty.title')}
      errorDescription=''
      errorTitle={t('budgets.error.loadFailed')}
      isEmpty={isEmpty}
      isError={isError}
      isLoading={isLoading}>
      {data ? (
        <div className='flex flex-col gap-4 md:gap-6'>
          {data.items.map((budget) => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              isDeleting={deletingBudgetId === budget.id}
              onDelete={() => onDelete(budget)}
              onEdit={() => onEdit(budget)}
            />
          ))}
        </div>
      ) : null}
    </DataState>
  )
}

export { BudgetList }
