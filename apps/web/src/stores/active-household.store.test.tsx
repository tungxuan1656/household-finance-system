import { act } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import {
  activeHouseholdActions,
  useActiveHouseholdStore,
} from '@/stores/active-household.store'

beforeEach(() => {
  act(() => {
    activeHouseholdActions.reset()
  })
})

describe('active household store', () => {
  it('starts with null active household id', () => {
    expect(useActiveHouseholdStore.getState()).toMatchObject({
      activeHouseholdId: null,
    })
  })

  it('sets active household id', () => {
    act(() => {
      activeHouseholdActions.setActiveHouseholdId('household-1')
    })

    expect(useActiveHouseholdStore.getState().activeHouseholdId).toBe(
      'household-1',
    )
  })

  it('clears active household id', () => {
    act(() => {
      activeHouseholdActions.setActiveHouseholdId('household-1')
      activeHouseholdActions.clearActiveHousehold()
    })

    expect(useActiveHouseholdStore.getState().activeHouseholdId).toBeNull()
  })

  it('resets store to initial state', () => {
    act(() => {
      activeHouseholdActions.setActiveHouseholdId('household-1')
      activeHouseholdActions.reset()
    })

    expect(useActiveHouseholdStore.getState().activeHouseholdId).toBeNull()
  })
})
