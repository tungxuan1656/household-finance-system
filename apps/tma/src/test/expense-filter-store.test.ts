import { beforeEach, describe, expect, it } from 'vitest'

import {
  applyExpensesRouteState,
  buildInitialExpenseListFilter,
  countActiveExpenseListFilters,
  useExpenseListFilterStore,
} from '@/features/expenses/filter-store'

const getState = () => useExpenseListFilterStore.getState()

describe('useExpenseListFilterStore', () => {
  beforeEach(() => {
    useExpenseListFilterStore.getState().reset()
  })

  it('starts with the default sort, thisMonth period, and no other filters applied', () => {
    const initial = buildInitialExpenseListFilter()

    expect(getState().filter).toEqual(initial)
    expect(getState().filter.sort).toBe('occurred_at_desc')
    expect(getState().filter.periodPreset).toBe('thisMonth')
    expect(getState().filter.dateFrom).toBeTypeOf('number')
    expect(getState().filter.dateTo).toBeTypeOf('number')

    expect(getState().filter.dateFrom! <= getState().filter.dateTo!).toBe(true)

    expect(countActiveExpenseListFilters(getState().filter)).toBe(0)
  })

  it('setFilter merges the partial filter into the current state', () => {
    getState().setFilter({ sort: 'amount_desc' })
    getState().setFilter({ householdId: 'hh-1' })
    getState().setFilter({ categoryKey: 'food' })

    getState().setFilter({
      dateFrom: 1_700_000_000_000,
      dateTo: 1_800_000_000_000,
      periodPreset: 'custom',
    })

    expect(getState().filter).toEqual({
      sort: 'amount_desc',
      householdId: 'hh-1',
      categoryKey: 'food',
      dateFrom: 1_700_000_000_000,
      dateTo: 1_800_000_000_000,
      periodPreset: 'custom',
    })
  })

  it('counts a custom period preset as a single active filter', () => {
    getState().setFilter({
      dateFrom: 1,
      dateTo: 2,
      periodPreset: 'custom',
    })

    expect(countActiveExpenseListFilters(getState().filter)).toBe(1)
  })

  it('does not count the default thisMonth period as active', () => {
    const initial = buildInitialExpenseListFilter()
    expect(initial.dateFrom).toBeDefined()
    expect(initial.dateTo).toBeDefined()
    expect(initial.periodPreset).toBe('thisMonth')

    expect(countActiveExpenseListFilters(initial)).toBe(0)
  })

  it('setDefaultPeriod restores thisMonth and clears the custom active count', () => {
    getState().setFilter({
      dateFrom: 1,
      dateTo: 2,
      periodPreset: 'custom',
    })

    expect(countActiveExpenseListFilters(getState().filter)).toBe(1)

    getState().setDefaultPeriod()

    const filter = getState().filter
    expect(filter.periodPreset).toBe('thisMonth')
    expect(filter.dateFrom).toBeTypeOf('number')
    expect(filter.dateTo).toBeTypeOf('number')
    expect(filter.dateFrom! <= filter.dateTo!).toBe(true)
    expect(countActiveExpenseListFilters(filter)).toBe(0)
  })

  it('setDefaultPeriod preserves other non-period filters', () => {
    getState().setFilter({ sort: 'amount_desc', householdId: 'hh-1' })
    getState().setDefaultPeriod()

    expect(getState().filter.sort).toBe('amount_desc')
    expect(getState().filter.householdId).toBe('hh-1')
    expect(getState().filter.periodPreset).toBe('thisMonth')
  })

  it('counts every independent filter dimension', () => {
    getState().setFilter({
      dateFrom: 1,
      dateTo: 2,
      periodPreset: 'custom',
    })

    getState().setFilter({ householdId: 'hh-1' })
    getState().setFilter({ groupId: 'group-1' })
    getState().setFilter({ categoryKey: 'food' })

    expect(countActiveExpenseListFilters(getState().filter)).toBe(4)
  })

  it('reset returns the filter to the default state', () => {
    getState().setFilter({ sort: 'amount_desc', householdId: 'hh-1' })

    getState().reset()

    expect(getState().filter).toEqual(buildInitialExpenseListFilter())
  })

  it('setFilter with empty partial does not change the state', () => {
    getState().setFilter({ sort: 'amount_desc' })

    const before = getState().filter

    getState().setFilter({})

    expect(getState().filter).toEqual(before)
  })
})

describe('applyExpensesRouteState', () => {
  it('returns null when state is null or undefined', () => {
    expect(applyExpensesRouteState(null)).toBeNull()
    expect(applyExpensesRouteState(undefined)).toBeNull()
  })

  it('returns null when neither scope dimension is set', () => {
    expect(applyExpensesRouteState({})).toBeNull()
  })

  it('maps appliedHouseholdId to a household-only partial', () => {
    const partial = applyExpensesRouteState({ appliedHouseholdId: 'hh-1' })

    expect(partial).toEqual({ householdId: 'hh-1', groupId: undefined })
  })

  it('maps appliedGroupId to a group-only partial', () => {
    const partial = applyExpensesRouteState({ appliedGroupId: 'group-1' })

    expect(partial).toEqual({ groupId: 'group-1', householdId: undefined })
  })

  it('clears a stale groupId when applying a household scope', () => {
    // Simulate the regression: user previously set groupId via the manual
    // picker, then navigated to a household detail and tapped "view all".
    // The stale groupId must be cleared so the new household scope does
    // not AND with it on the API and return zero rows.
    const partial = applyExpensesRouteState({ appliedHouseholdId: 'hh-2' })

    expect(partial).toEqual({ householdId: 'hh-2', groupId: undefined })

    // Apply on top of a filter that already has a stale groupId.
    getState().setFilter({ householdId: 'hh-1', groupId: 'group-old' })
    getState().setFilter(partial!)

    expect(getState().filter.groupId).toBeUndefined()
    expect(getState().filter.householdId).toBe('hh-2')
  })

  it('clears a stale householdId when applying a group scope', () => {
    // Mirror: stale householdId must be cleared when applying a group scope.
    getState().setFilter({ householdId: 'hh-1', groupId: 'group-old' })

    const partial = applyExpensesRouteState({ appliedGroupId: 'group-2' })!

    getState().setFilter(partial)

    expect(getState().filter.householdId).toBeUndefined()
    expect(getState().filter.groupId).toBe('group-2')
  })

  it('prefers the group scope when both dimensions are passed in state', () => {
    const partial = applyExpensesRouteState({
      appliedGroupId: 'group-1',
      appliedHouseholdId: 'hh-1',
    })

    expect(partial).toEqual({ householdId: undefined, groupId: 'group-1' })
  })
})
