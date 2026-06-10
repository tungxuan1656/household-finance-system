import { beforeEach, describe, expect, it } from 'vitest'

import {
  buildInitialExpenseListFilter,
  countActiveExpenseListFilters,
  useExpenseListFilterStore,
} from '@/features/expenses/filter-store'

const getState = () => useExpenseListFilterStore.getState()

describe('useExpenseListFilterStore', () => {
  beforeEach(() => {
    useExpenseListFilterStore.getState().reset()
  })

  it('starts with the default sort and no other filters applied', () => {
    const initial = buildInitialExpenseListFilter()

    expect(getState().filter).toEqual(initial)
    expect(getState().filter.sort).toBe('occurred_at_desc')
    expect(countActiveExpenseListFilters(getState().filter)).toBe(0)
  })

  it('setFilter merges the partial filter into the current state', () => {
    getState().setFilter({ sort: 'amount_desc' })
    getState().setFilter({ householdId: 'hh-1' })
    getState().setFilter({ categoryKey: 'food' })

    getState().setFilter({
      dateFrom: 1_700_000_000_000,
      dateTo: 1_800_000_000_000,
    })

    expect(getState().filter).toEqual({
      sort: 'amount_desc',
      householdId: 'hh-1',
      categoryKey: 'food',
      dateFrom: 1_700_000_000_000,
      dateTo: 1_800_000_000_000,
    })
  })

  it('counts date range as a single active filter', () => {
    getState().setFilter({ dateFrom: 1, dateTo: 2 })

    expect(countActiveExpenseListFilters(getState().filter)).toBe(1)
  })

  it('counts every independent filter dimension', () => {
    getState().setFilter({ dateFrom: 1, dateTo: 2 })
    getState().setFilter({ householdId: 'hh-1' })
    getState().setFilter({ categoryKey: 'food' })

    expect(countActiveExpenseListFilters(getState().filter)).toBe(3)
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
