import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { ExpenseSummaryCard, ExpenseTimeline } from '@/components/finance'
import { TmaHapticButton } from '@/components/shared/tma-haptic-button'
import { FilterIcon, PlusIcon } from '@/components/shared/tma-icons'
import { TmaPageShell } from '@/components/shared/tma-page-shell'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  applyExpensesRouteState,
  countActiveExpenseListFilters,
  type ExpensesRouteState,
  useExpenseListFilterStore,
} from '@/features/expenses/filter-store'
import { useImportFlowStore } from '@/features/expenses/import-store'
import { buildHouseholdNameMap } from '@/features/expenses/presentation'
import {
  useExpenseListInfiniteQuery,
  useExpenseSummaryQuery,
  useHouseholdsQuery,
  useReferenceCategoriesQuery,
} from '@/features/home/api'
import type { ExpenseListParams } from '@/features/home/types'
import { TMA_PATHS } from '@/lib/constants/routes'
import { impact } from '@/lib/telegram/haptics'

export const ExpensesPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()
  const filter = useExpenseListFilterStore((state) => state.filter)
  const setFilter = useExpenseListFilterStore((state) => state.setFilter)
  const activeFilterCount = countActiveExpenseListFilters(filter)

  useEffect(() => {
    const partial = applyExpensesRouteState(
      location.state as ExpensesRouteState | null,
    )

    if (partial) {
      setFilter(partial)
    }
  }, [location.state, setFilter])

  const queryParams = useMemo<ExpenseListParams>(
    () => ({
      sort: filter.sort,
      limit: 50,
      ...(filter.dateFrom != null ? { date_from: filter.dateFrom } : {}),
      ...(filter.dateTo != null ? { date_to: filter.dateTo } : {}),
      ...(filter.householdId != null
        ? { household_id: filter.householdId }
        : {}),
      ...(filter.groupId != null ? { group_id: filter.groupId } : {}),
      ...(filter.categoryKey != null
        ? { category_key: filter.categoryKey }
        : {}),
    }),
    [filter],
  )

  const summaryParams = useMemo<ExpenseListParams>(
    () => ({
      ...(filter.dateFrom != null ? { date_from: filter.dateFrom } : {}),
      ...(filter.dateTo != null ? { date_to: filter.dateTo } : {}),
      ...(filter.householdId != null
        ? { household_id: filter.householdId }
        : {}),
      ...(filter.groupId != null ? { group_id: filter.groupId } : {}),
      ...(filter.categoryKey != null
        ? { category_key: filter.categoryKey }
        : {}),
    }),
    [filter],
  )

  const expensesQuery = useExpenseListInfiniteQuery(queryParams)
  const summaryQuery = useExpenseSummaryQuery(summaryParams)
  const referenceCategoriesQuery = useReferenceCategoriesQuery()
  const householdsQuery = useHouseholdsQuery()

  const expenses = useMemo(
    () => expensesQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [expensesQuery.data?.pages],
  )

  const householdNameMap = useMemo(
    () => buildHouseholdNameMap(householdsQuery.data?.items ?? []),
    [householdsQuery.data?.items],
  )

  if (expensesQuery.isLoading || referenceCategoriesQuery.isLoading) {
    return (
      <TmaPageShell title={t('expenses.title')}>
        <Card>
          <CardHeader>
            <CardTitle>{t('expenses.loadingTitle')}</CardTitle>
            <CardDescription>{t('expenses.loadingDesc')}</CardDescription>
          </CardHeader>
        </Card>
        <ExpensesAddFab />
      </TmaPageShell>
    )
  }

  return (
    <TmaPageShell title={t('expenses.title')}>
      <ExpenseSummaryCard summary={summaryQuery.data} />
      <div className='mb-2 flex justify-between px-1 py-4'>
        <TmaHapticButton
          size='sm'
          onClick={() => {
            useImportFlowStore.getState().reset()
            navigate(TMA_PATHS.expensesNewChat)
          }}>
          <span className='text-xs'>AI</span>
          <span>{t('expenses.aiImport')}</span>
        </TmaHapticButton>
        <TmaHapticButton
          aria-label={t('expenses.openFilterAria')}
          size='sm'
          variant={activeFilterCount > 0 ? 'default' : 'outline'}
          onClick={() => {
            navigate(TMA_PATHS.expensesFilter)
          }}>
          <FilterIcon height='16' width='16' />
          <span>
            {activeFilterCount > 0
              ? t('expenses.filterCount', { count: activeFilterCount })
              : t('expenses.filterLabel')}
          </span>
        </TmaHapticButton>
      </div>

      {expenses.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>{t('expenses.emptyTitle')}</CardTitle>
            <CardDescription>{t('expenses.emptyDesc')}</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <>
          <ExpenseTimeline
            expenses={expenses}
            householdNameById={householdNameMap}
          />
          {expensesQuery.hasNextPage && (
            <div className='mt-4 flex justify-center'>
              <TmaHapticButton
                disabled={expensesQuery.isFetchingNextPage}
                size='sm'
                variant='outline'
                onClick={() => {
                  void expensesQuery.fetchNextPage()
                }}>
                {expensesQuery.isFetchingNextPage
                  ? t('expenses.loadingMore')
                  : t('expenses.loadMore')}
              </TmaHapticButton>
            </div>
          )}
        </>
      )}
      <ExpensesAddFab />
    </TmaPageShell>
  )
}

/**
 * Floating add-expense button — mirrors the center bubble from
 * `TmaBottomTabs` so the affordance stays consistent when the bottom tabs
 * are hidden (which is the case on the `/expenses` route).
 */
const ExpensesAddFab = () => {
  const { t } = useTranslation()

  const prefetchAddExpense = () => {
    void import('@/routes/add-expense-category').catch(() => undefined)
  }

  return (
    <div className='pointer-events-none fixed inset-x-0 bottom-[calc(14px+var(--tma-content-safe-bottom))] z-30 flex justify-center px-4'>
      <Link
        aria-label={t('shell.addExpenseAria')}
        className='pointer-events-auto grid size-13.5 place-items-center rounded-full bg-linear-to-br from-[#2a3a5c] to-foreground text-white shadow-[0_8px_20px_rgba(17,24,39,0.16),inset_0_1px_0_rgba(255,255,255,0.18),0_0_0_4px_rgba(255,255,255,0.55)] transition active:scale-95'
        to={TMA_PATHS.expensesNewCategory}
        onClick={() => {
          impact('medium')
        }}
        onMouseEnter={prefetchAddExpense}
        onTouchStart={prefetchAddExpense}>
        <PlusIcon height='24' width='24' />
      </Link>
    </div>
  )
}
