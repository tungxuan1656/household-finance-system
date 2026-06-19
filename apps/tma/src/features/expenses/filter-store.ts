import { create } from 'zustand'

import type { CategoryKey } from '@/features/home/types'
import { createCurrentMonthPeriodSelection } from '@/lib/period'

export type ExpenseListSort = 'occurred_at_desc' | 'amount_desc'

export type ExpenseListPeriodPreset = 'thisMonth' | 'custom'

export interface ExpenseListFilter {
  dateFrom?: number
  dateTo?: number
  periodPreset?: ExpenseListPeriodPreset
  householdId?: string
  groupId?: string
  categoryKey?: CategoryKey
  sort: ExpenseListSort
}

const buildDefaultPeriodFilter = (): Pick<
  ExpenseListFilter,
  'dateFrom' | 'dateTo' | 'periodPreset'
> => {
  const selection = createCurrentMonthPeriodSelection()

  return {
    dateFrom: selection.dateFrom,
    dateTo: selection.dateTo,
    periodPreset: 'thisMonth',
  }
}

export const buildInitialExpenseListFilter = (): ExpenseListFilter => ({
  sort: 'occurred_at_desc',
  ...buildDefaultPeriodFilter(),
})

interface ExpenseListFilterState {
  filter: ExpenseListFilter
  setFilter: (partial: Partial<ExpenseListFilter>) => void
  setDefaultPeriod: () => void
  reset: () => void
}

export const useExpenseListFilterStore = create<ExpenseListFilterState>(
  (set) => ({
    filter: buildInitialExpenseListFilter(),
    setFilter: (partial) =>
      set((state) => ({ filter: { ...state.filter, ...partial } })),
    setDefaultPeriod: () =>
      set((state) => ({ filter: { ...state.filter, ...buildDefaultPeriodFilter() } })),
    reset: () => set({ filter: buildInitialExpenseListFilter() }),
  }),
)

export const getExpenseListFilterSnapshot = () =>
  useExpenseListFilterStore.getState()

export const countActiveExpenseListFilters = (
  filter: ExpenseListFilter,
): number => {
  let count = 0
  if (filter.periodPreset === 'custom') count += 1
  if (filter.householdId != null) count += 1
  if (filter.groupId != null) count += 1
  if (filter.categoryKey != null) count += 1

  return count
}
