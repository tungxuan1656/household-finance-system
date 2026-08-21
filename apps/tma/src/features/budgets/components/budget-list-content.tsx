import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { QueryState } from '@/components/shared/query-state'
import { buttonVariants } from '@/components/ui/button'
import type { HouseholdDTO } from '@/features/home/types'
import { TMA_PATHS } from '@/lib/constants/routes'
import { impact } from '@/lib/telegram/haptics'

import { type useBudgetListQuery } from '../api'
import type { ScopeFilter } from '../hooks/use-budget-list'
import type { ListBudgetsResponse } from '../types'
import { BudgetListCard } from './budget-list-card'

type BudgetListContentProps = {
  budgetsQuery: ReturnType<typeof useBudgetListQuery>
  households: HouseholdDTO[]
  scopeFilter: ScopeFilter
  canCreateBudget: boolean
  retryBoth: () => Promise<void>
}

export const BudgetListContent = ({
  budgetsQuery,
  households,
  scopeFilter,
  canCreateBudget,
  retryBoth,
}: BudgetListContentProps) => {
  const { t } = useTranslation()
  const householdById = useMemo(
    () => new Map(households.map((h) => [h.id, h] as const)),
    [households],
  )

  const emptyTitle =
    scopeFilter === 'personal'
      ? t('budgets.emptyPersonal')
      : scopeFilter === 'household'
        ? t('budgets.emptyHousehold')
        : t('budgets.emptyGeneric')

  const emptyDescription =
    scopeFilter === 'personal'
      ? t('budgets.emptyPersonalDesc')
      : scopeFilter === 'household'
        ? t('budgets.emptyHouseholdDesc')
        : t('budgets.emptyGenericDesc')

  return (
    <QueryState
      empty={{
        title: emptyTitle,
        description: emptyDescription,
        action: canCreateBudget ? (
          <Link
            className={buttonVariants({ size: 'sm', variant: 'secondary' })}
            to={TMA_PATHS.budgetsNew}
            onClick={() => impact('light')}>
            {t('budgets.create')}
          </Link>
        ) : undefined,
      }}
      error={{
        title: t('budgets.loadError'),
        description: t('budgets.loadErrorDesc'),
      }}
      isEmpty={(data: ListBudgetsResponse) => {
        const items = data.items ?? []
        if (scopeFilter === 'all') return items.length === 0

        return items.filter((b) => b.scope === scopeFilter).length === 0
      }}
      pending={{
        title: t('budgets.loadingTitle'),
        description: t('budgets.loadingDesc'),
      }}
      query={budgetsQuery}
      retryAction={retryBoth}
      variant='card'>
      {(data: ListBudgetsResponse) => {
        const sorted = [...(data.items ?? [])].sort((a, b) =>
          b.period.localeCompare(a.period),
        )
        const filtered =
          scopeFilter === 'all'
            ? sorted
            : sorted.filter((b) => b.scope === scopeFilter)

        return (
          <div className='grid gap-3'>
            {filtered.map((budget) => (
              <BudgetListCard
                key={budget.id}
                budget={budget}
                household={
                  budget.householdId
                    ? householdById.get(budget.householdId)
                    : undefined
                }
              />
            ))}
          </div>
        )
      }}
    </QueryState>
  )
}
