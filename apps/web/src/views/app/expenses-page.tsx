'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

import { ExpenseActiveFilterSummary } from '@/components/expense/expense-active-filter-summary'
import {
  ExpenseFeedFilters,
  type ExpenseFeedFilterValues,
} from '@/components/expense/expense-feed-filters'
import { ExpenseFeedList } from '@/components/expense/expense-feed-list'
import { ExpenseFeedSummary } from '@/components/expense/expense-feed-summary'
import { Button } from '@/components/ui/button'
import { useExpenseGroupListQuery } from '@/hooks/api/use-groups'
import { useReferenceCategoriesQuery } from '@/hooks/api/use-reference-data'
import { PATHS } from '@/lib/constants/paths'
import { t } from '@/lib/i18n/t'
import { getCategoryLabel } from '@/lib/reference-data/labels'
import { householdActions, useHouseholdStore } from '@/stores/household.store'
import type { ExpenseListParams } from '@/types/expense'

const DEFAULT_FILTER_VALUES: ExpenseFeedFilterValues = {
  amountMax: '',
  amountMin: '',
  categoryKey: '',
  dateFrom: '',
  dateTo: '',
  groupId: '',
  search: '',
  sort: 'occurred_at_desc',
  visibility: '',
}

const toTimestamp = (value: string, endOfDay: boolean) => {
  if (!value) {
    return undefined
  }

  const parsed = new Date(
    endOfDay ? `${value}T23:59:59.999Z` : `${value}T00:00:00.000Z`,
  ).getTime()

  return Number.isNaN(parsed) ? undefined : parsed
}

const toNumber = (value: string) => {
  if (!value) {
    return undefined
  }

  const parsed = Number(value)

  return Number.isNaN(parsed) ? undefined : parsed
}

function ExpensesPage() {
  const currentHousehold = useHouseholdStore.use.currentHousehold()
  const households = useHouseholdStore.use.households()
  const selectedHouseholdId = currentHousehold?.id ?? households[0]?.id
  const [filterValues, setFilterValues] = useState<ExpenseFeedFilterValues>(
    DEFAULT_FILTER_VALUES,
  )

  const { data: referenceCategories } = useReferenceCategoriesQuery()
  const { data: expenseGroupsResponse } =
    useExpenseGroupListQuery(selectedHouseholdId)

  useEffect(() => {
    if (households.length === 0) {
      void householdActions.fetchHouseholds()
    }
  }, [households.length])

  const categories = useMemo(
    () =>
      (referenceCategories?.items ?? []).filter(
        (category) => category.kind === 'expense',
      ),
    [referenceCategories?.items],
  )

  const groups = expenseGroupsResponse?.items ?? []
  const selectedCategory = categories.find(
    (category) => category.key === filterValues.categoryKey,
  )

  const filters = useMemo<ExpenseListParams>(
    () => ({
      amount_max: toNumber(filterValues.amountMax),
      amount_min: toNumber(filterValues.amountMin),
      category_key: filterValues.categoryKey || undefined,
      date_from: toTimestamp(filterValues.dateFrom, false),
      date_to: toTimestamp(filterValues.dateTo, true),
      group_id: filterValues.groupId || undefined,
      sort: filterValues.sort || undefined,
      visibility: filterValues.visibility || undefined,
    }),
    [filterValues],
  )

  const activeFilterLabels = useMemo(
    () =>
      [
        filterValues.visibility
          ? t(`expense.visibility.${filterValues.visibility}` as never)
          : null,
        selectedCategory ? getCategoryLabel(selectedCategory.key) : null,
        filterValues.sort === 'amount_desc'
          ? t('expense.feed.filters.sortHighestAmount')
          : null,
        filterValues.dateFrom
          ? `${t('expense.feed.filters.dateFrom')}: ${filterValues.dateFrom}`
          : null,
        filterValues.dateTo
          ? `${t('expense.feed.filters.dateTo')}: ${filterValues.dateTo}`
          : null,
        filterValues.amountMin
          ? `${t('expense.feed.filters.amountMin')}: ${filterValues.amountMin}`
          : null,
        filterValues.amountMax
          ? `${t('expense.feed.filters.amountMax')}: ${filterValues.amountMax}`
          : null,
        groups.find((group) => group.id === filterValues.groupId)?.name ?? null,
      ].filter((value): value is string => Boolean(value)),
    [filterValues, groups, selectedCategory],
  )

  const handleFilterChange = (
    key: keyof ExpenseFeedFilterValues,
    value: string,
  ) => {
    setFilterValues((current) => ({
      ...current,
      [key]: value,
    }))
  }

  return (
    <div className='flex flex-col gap-4 sm:gap-6'>
      <header className='flex flex-wrap items-center justify-between gap-4'>
        <div className='flex flex-col gap-1'>
          <h1 className='font-heading text-2xl tracking-tight'>
            {t('expense.feed.title')}
          </h1>
        </div>
        <Button asChild className='w-full sm:w-auto' size='lg'>
          <Link href={PATHS.ADD_EXPENSE}>{t('expense.addTitle')}</Link>
        </Button>
      </header>

      <ExpenseFeedFilters
        categories={categories}
        groups={groups}
        values={filterValues}
        onChange={handleFilterChange}
      />

      <ExpenseActiveFilterSummary
        labels={activeFilterLabels}
        onReset={() => setFilterValues(DEFAULT_FILTER_VALUES)}
      />

      <ExpenseFeedSummary filters={filters} search={filterValues.search} />

      <ExpenseFeedList filters={filters} search={filterValues.search} />
    </div>
  )
}

export { ExpensesPage }
