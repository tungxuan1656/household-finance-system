import { Link } from 'react-router-dom'

import { QueryState } from '@/components/shared/query-state'
import { TmaPageShell } from '@/components/shared/tma-page-shell'
import { buttonVariants } from '@/components/ui/button'
import { TMA_PATHS } from '@/lib/constants/routes'
import { impact } from '@/lib/telegram/haptics'

import { BudgetHouseholdFilterCard } from '../components/budget-household-filter-card'
import { BudgetListContent } from '../components/budget-list-content'
import { BudgetScopeFilterBar } from '../components/budget-scope-filter-bar'
import { useBudgetList } from '../hooks/use-budget-list'

export const BudgetListPage = () => {
  const {
    t,
    householdsQuery,
    scopeFilter,
    setScopeFilter,
    selectedHouseholdId,
    setSelectedHouseholdId,
    scopeFilterOptions,
    budgetsQuery,
    canCreateBudget,
    retryBoth,
  } = useBudgetList()

  return (
    <TmaPageShell
      contentClassName='flex flex-col gap-4'
      title={t('budgets.title')}
      onRefresh={retryBoth}>
      <div className='flex items-center justify-between gap-3'>
        <h2 className='m-0 text-base font-bold'>{t('budgets.title')}</h2>
        {canCreateBudget ? (
          <Link
            className={buttonVariants({ size: 'sm', variant: 'secondary' })}
            to={TMA_PATHS.budgetsNew}
            onClick={() => impact('light')}>
            {t('budgets.create')}
          </Link>
        ) : null}
      </div>

      <BudgetScopeFilterBar
        options={scopeFilterOptions}
        value={scopeFilter}
        onChange={setScopeFilter}
      />

      <QueryState
        error={{
          title: t('budgets.loadError'),
          description: t('budgets.loadErrorDesc'),
        }}
        isEmpty={() => false}
        pending={{
          title: t('budgets.loadingTitle'),
          description: t('budgets.loadingDesc'),
        }}
        query={householdsQuery}
        retryAction={retryBoth}
        variant='card'>
        {(householdsData) => (
          <div className='flex flex-col gap-4'>
            {scopeFilter === 'household' ? (
              <BudgetHouseholdFilterCard
                households={householdsData.items}
                isLoading={householdsQuery.isLoading}
                selectedHouseholdId={selectedHouseholdId}
                onChange={setSelectedHouseholdId}
              />
            ) : null}

            <BudgetListContent
              budgetsQuery={budgetsQuery}
              canCreateBudget={canCreateBudget}
              households={householdsData.items}
              retryBoth={retryBoth}
              scopeFilter={scopeFilter}
            />
          </div>
        )}
      </QueryState>
    </TmaPageShell>
  )
}
