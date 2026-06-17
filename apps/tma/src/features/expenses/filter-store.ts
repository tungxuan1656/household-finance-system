import { create } from 'zustand'

import type { CategoryKey } from '@/features/home/types'

export type ExpenseListSort = 'occurred_at_desc' | 'amount_desc'

export interface ExpenseListFilter {
  dateFrom?: number
  dateTo?: number
  householdId?: string
  groupId?: string
  categoryKey?: CategoryKey
  sort: ExpenseListSort
}

export const buildInitialExpenseListFilter = (): ExpenseListFilter => ({
  sort: 'occurred_at_desc',
})

interface ExpenseListFilterState {
  filter: ExpenseListFilter
  setFilter: (partial: Partial<ExpenseListFilter>) => void
  reset: () => void
}

export const useExpenseListFilterStore = create<ExpenseListFilterState>(
  (set) => ({
    filter: buildInitialExpenseListFilter(),
    setFilter: (partial) =>
      set((state) => ({ filter: { ...state.filter, ...partial } })),
    reset: () => set({ filter: buildInitialExpenseListFilter() }),
  }),
)

export const getExpenseListFilterSnapshot = () =>
  useExpenseListFilterStore.getState()

export const countActiveExpenseListFilters = (
  filter: ExpenseListFilter,
): number => {
  let count = 0
  if (filter.dateFrom != null || filter.dateTo != null) count += 1
  if (filter.householdId != null) count += 1
  if (filter.groupId != null) count += 1
  if (filter.categoryKey != null) count += 1

  return count
}
