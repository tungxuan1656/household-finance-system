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
      set((state) => ({
        filter: { ...state.filter, ...buildDefaultPeriodFilter() },
      })),
    reset: () => set({ filter: buildInitialExpenseListFilter() }),
  }),
)

export const getExpenseListFilterSnapshot = () =>
  useExpenseListFilterStore.getState()

/**
 * Optional payload accepted via `location.state` when navigating to the
 * `/expenses` route. Each field means "scope the list to this dimension
 * on mount".
 */
export interface ExpensesRouteState {
  appliedHouseholdId?: string
  appliedGroupId?: string
}

/**
 * Pure mapping from a navigation `location.state` to the partial filter
 * update that should be applied to the expenses filter store.
 *
 * Mirrors the cross-clearing contract of the manual filter picker: when a
 * household scope is applied, any pre-existing `groupId` is cleared (and
 * vice versa). Without this, a stale `groupId` from a previous filter
 * session would AND with the new `householdId` on the API and return zero
 * rows.
 *
 * Returns `null` when no scope dimension is present in the state — the
 * caller should leave the existing filter untouched.
 */
export const applyExpensesRouteState = (
  state: ExpensesRouteState | null | undefined,
): Partial<ExpenseListFilter> | null => {
  if (!state) return null

  const partial: Partial<ExpenseListFilter> = {}

  if (state.appliedHouseholdId != null) {
    partial.householdId = state.appliedHouseholdId
    // Drop any leftover group filter — the new household scope must not
    // be combined with a group from a different household. The picker
    // has access to allGroups to validate compatibility; navigation
    // does not, so we always clear to stay consistent with the scope
    // the user just entered.
    partial.groupId = undefined
  }

  if (state.appliedGroupId != null) {
    partial.groupId = state.appliedGroupId
    // Mirror: a leftover household scope from a previous session would
    // AND with this group on the API and return zero rows.
    partial.householdId = undefined
  }

  if (partial.householdId === undefined && partial.groupId === undefined) {
    return null
  }

  return partial
}

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
