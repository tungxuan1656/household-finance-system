import { useMemo } from 'react'

import type { ExpenseGroupDTO } from '@/features/groups/types'
import { getCategoryLabel } from '@/features/home/presentation'
import type { CategoryKey } from '@/features/home/types'
import type { HouseholdDTO, ReferenceCategoryDTO } from '@/features/home/types'
import { impact, selection } from '@/lib/telegram/haptics'

import type { ExpenseListSort } from '../filter-store'
import { useExpenseListFilterStore } from '../filter-store'

const ALL_VALUE = '__all__'

const makeSortOptions = (
  t: (key: string) => string,
): Array<{ label: string; value: ExpenseListSort }> => [
  { label: t('expenses.filter.sortNewest'), value: 'occurred_at_desc' },
  { label: t('expenses.filter.sortAmount'), value: 'amount_desc' },
]

export const useExpenseFilterOptions = (
  filter: {
    dateFrom?: number
    dateTo?: number
    householdId?: string
    groupId?: string
    categoryKey?: CategoryKey
    sort: ExpenseListSort
  },
  allGroups: ExpenseGroupDTO[],
  households: HouseholdDTO[],
  referenceCategories: ReferenceCategoryDTO[],
  t: (key: string) => string,
) => {
  const setFilter = useExpenseListFilterStore((state) => state.setFilter)
  const reset = useExpenseListFilterStore((state) => state.reset)

  // Filter groups by selected household
  const filteredGroups = useMemo(() => {
    if (filter.householdId == null) return allGroups

    return allGroups.filter(
      (g) => g.householdId === filter.householdId || g.householdId == null,
    )
  }, [allGroups, filter.householdId])

  const categoryOptions = useMemo(
    () =>
      referenceCategories
        .filter((category) => category.kind === 'expense')
        .map((category) => category.key),
    [referenceCategories],
  )

  const householdPickerOptions = useMemo(
    () => [
      { label: t('expenses.filter.householdAll'), value: ALL_VALUE },
      ...households.map((h) => ({ label: h.name, value: h.id })),
    ],
    [households, t],
  )

  const groupPickerOptions = useMemo(
    () => [
      { label: t('expenses.filter.groupAll'), value: ALL_VALUE },
      ...filteredGroups.map((g) => ({
        label: g.name,
        value: g.id,
      })),
    ],
    [filteredGroups, t],
  )

  const categoryPickerOptions = useMemo(
    () => [
      { label: t('expenses.filter.categoryAll'), value: ALL_VALUE },
      ...categoryOptions.map((key) => ({
        label: getCategoryLabel(key, t),
        value: key,
      })),
    ],
    [categoryOptions, t],
  )

  const handleHouseholdChange = (value: string) => {
    selection()
    if (value === ALL_VALUE) {
      setFilter({ householdId: undefined })
    } else {
      // Clear group if it doesn't belong to new household
      const newGroupBelongs =
        filter.groupId == null ||
        allGroups.some(
          (g) =>
            g.id === filter.groupId &&
            (g.householdId === value || g.householdId == null),
        )

      setFilter({
        householdId: value,
        ...(newGroupBelongs ? {} : { groupId: undefined }),
      })
    }
  }

  const handleGroupChange = (value: string) => {
    selection()
    if (value === ALL_VALUE) {
      setFilter({ groupId: undefined })
    } else {
      setFilter({ groupId: value })
    }
  }

  const handleCategoryChange = (value: string) => {
    selection()
    if (value === ALL_VALUE) {
      setFilter({ categoryKey: undefined })
    } else {
      setFilter({ categoryKey: value as CategoryKey })
    }
  }

  const handleReset = () => {
    impact('light')
    reset()
  }

  const handleSortChange = (next: ExpenseListSort) => {
    selection()
    setFilter({ sort: next })
  }

  return {
    makeSortOptions,
    householdPickerOptions,
    groupPickerOptions,
    categoryPickerOptions,
    handleHouseholdChange,
    handleGroupChange,
    handleCategoryChange,
    handleReset,
    handleSortChange,
  }
}
