'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import { useAddExpenseDialog } from '@/components/expense/add-expense/provider'
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
import { t } from '@/lib/i18n/t'
import { getCategoryLabel } from '@/lib/reference-data/labels'
import { householdActions, useHouseholdStore } from '@/stores/household.store'
import type { ExpenseListParams } from '@/types/expense'
import type { ExpenseGroupDTO } from '@/types/group'

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

const mergeGroups = (
  personalGroups: ExpenseGroupDTO[],
  householdGroups: ExpenseGroupDTO[],
) => {
  const deduped = new Map<string, ExpenseGroupDTO>()

  for (const group of [...personalGroups, ...householdGroups]) {
    deduped.set(group.id, group)
  }

  return [...deduped.values()]
}

function ExpensesPage() {
  const { openDialog } = useAddExpenseDialog()
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentHousehold = useHouseholdStore.use.currentHousehold()
  const households = useHouseholdStore.use.households()
  const selectedHouseholdId = currentHousehold?.id ?? households[0]?.id
  const [filterValues, setFilterValues] = useState<ExpenseFeedFilterValues>(
    DEFAULT_FILTER_VALUES,
  )

  const { data: referenceCategories } = useReferenceCategoriesQuery()
  const { data: personalGroupsResponse } = useExpenseGroupListQuery(undefined)
  const { data: householdGroupsResponse } =
    useExpenseGroupListQuery(selectedHouseholdId)

  useEffect(() => {
    if (households.length === 0) {
      void householdActions.fetchHouseholds()
    }
  }, [households.length])

  useEffect(() => {
    if (searchParams.get('add-expense') !== '1') {
      return
    }

    openDialog()

    const nextParams = new URLSearchParams(searchParams.toString())
    nextParams.delete('add-expense')

    const nextQuery = nextParams.toString()

    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
      scroll: false,
    })
  }, [openDialog, pathname, router, searchParams])

  const categories = useMemo(
    () =>
      (referenceCategories?.items ?? []).filter(
        (category) => category.kind === 'expense',
      ),
    [referenceCategories?.items],
  )

  const groups = useMemo(
    () =>
      mergeGroups(
        personalGroupsResponse?.items ?? [],
        householdGroupsResponse?.items ?? [],
      ),
    [householdGroupsResponse?.items, personalGroupsResponse?.items],
  )
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
    <div className='flex flex-col gap-4 md:gap-6'>
      <header className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex flex-col gap-1'>
          <h1 className='font-heading text-xl tracking-tight md:text-2xl'>
            {t('expense.feed.title')}
          </h1>
          <p className='text-sm text-muted-foreground'>
            {t('expense.feed.description')}
          </p>
        </div>
        <Button size='xl' type='button' onClick={openDialog}>
          {t('expense.addTitle')}
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
