'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { PageShell } from '@/components/ui/page-shell'
import { useAddExpenseDialog } from '@/features/expenses/components/add-expense/provider'
import { ExpenseActiveFilterSummary } from '@/features/expenses/components/expense-active-filter-summary'
import {
  ExpenseFeedFilters,
  type ExpenseFeedFilterValues,
} from '@/features/expenses/components/expense-feed-filters'
import { ExpenseFeedList } from '@/features/expenses/components/expense-feed-list'
import { ExpenseFeedSummary } from '@/features/expenses/components/expense-feed-summary'
import { useExpenseGroupListQuery } from '@/features/groups/hooks/use-groups'
import { useReferenceCategoriesQuery } from '@/hooks/api/use-reference-data'
import { useDebounce } from '@/hooks/shared/use-debounce'
import { t } from '@/lib/i18n/t'
import { householdActions, useHouseholdStore } from '@/stores/household.store'

import {
  buildExpenseFeedActiveFilterLabels,
  buildExpenseFeedFilters,
  DEFAULT_EXPENSE_FEED_FILTER_VALUES,
  getExpenseFeedCategories,
  mergeExpenseFeedGroups,
} from './expense-feed-page-helpers'

const INPUT_DEBOUNCE_MS = 500

export const ExpensesPage = () => {
  const { openDialog } = useAddExpenseDialog()
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentHousehold = useHouseholdStore.use.currentHousehold()
  const households = useHouseholdStore.use.households()
  const selectedHouseholdId = currentHousehold?.id ?? households[0]?.id

  const [filterValues, setFilterValues] = useState<ExpenseFeedFilterValues>(
    DEFAULT_EXPENSE_FEED_FILTER_VALUES,
  )

  // Debounce free-text and amount inputs to avoid rapid re-fetching while typing.
  const debouncedSearch = useDebounce(filterValues.search, INPUT_DEBOUNCE_MS)
  const debouncedAmountMin = useDebounce(
    filterValues.amountMin,
    INPUT_DEBOUNCE_MS,
  )
  const debouncedAmountMax = useDebounce(
    filterValues.amountMax,
    INPUT_DEBOUNCE_MS,
  )

  const { data: referenceCategories } = useReferenceCategoriesQuery()
  const { data: personalGroupsResponse } = useExpenseGroupListQuery(undefined)
  const { data: householdGroupsResponse } =
    useExpenseGroupListQuery(selectedHouseholdId)

  useEffect(() => {
    if (households.length === 0) void householdActions.fetchHouseholds()
  }, [households.length])

  // Handle deep-link: ?add-expense=1 auto-opens the add expense dialog.
  useEffect(() => {
    if (searchParams.get('add-expense') !== '1') return
    openDialog()

    const nextParams = new URLSearchParams(searchParams.toString())
    nextParams.delete('add-expense')

    const nextQuery = nextParams.toString()

    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
      scroll: false,
    })
  }, [openDialog, pathname, router, searchParams])

  const categories = useMemo(
    () => getExpenseFeedCategories(referenceCategories?.items ?? []),
    [referenceCategories?.items],
  )

  const groups = useMemo(
    () =>
      mergeExpenseFeedGroups(
        personalGroupsResponse?.items ?? [],
        householdGroupsResponse?.items ?? [],
      ),
    [householdGroupsResponse?.items, personalGroupsResponse?.items],
  )

  const selectedCategory = categories.find(
    (c) => c.key === filterValues.categoryKey,
  )

  const filters = useMemo(
    () =>
      buildExpenseFeedFilters({
        values: filterValues,
        debouncedAmountMax,
        debouncedAmountMin,
      }),
    [
      debouncedAmountMax,
      debouncedAmountMin,
      filterValues.categoryKey,
      filterValues.dateFrom,
      filterValues.dateTo,
      filterValues.groupId,
      filterValues.sort,
      filterValues.visibility,
    ],
  )

  const activeFilterLabels = useMemo(
    () =>
      buildExpenseFeedActiveFilterLabels({
        values: filterValues,
        groups,
        selectedCategory,
      }),
    [filterValues, groups, selectedCategory],
  )

  const handleFilterChange = (
    key: keyof ExpenseFeedFilterValues,
    value: string,
  ) => {
    setFilterValues((current) => ({ ...current, [key]: value }))
  }

  return (
    <PageShell title={t('expense.feed.title')}>
      <div className='flex flex-col gap-4 md:gap-6'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
          <p className='text-sm text-muted-foreground'>
            {t('expense.feed.description')}
          </p>
          <Button size='xl' type='button' onClick={openDialog}>
            {t('expense.addTitle')}
          </Button>
        </div>

        <ExpenseFeedFilters
          categories={categories}
          groups={groups}
          values={filterValues}
          onChange={handleFilterChange}
        />
        <ExpenseActiveFilterSummary
          labels={activeFilterLabels}
          onReset={() => setFilterValues(DEFAULT_EXPENSE_FEED_FILTER_VALUES)}
        />
        <ExpenseFeedSummary filters={filters} search={debouncedSearch} />
        <ExpenseFeedList filters={filters} search={debouncedSearch} />
      </div>
    </PageShell>
  )
}
