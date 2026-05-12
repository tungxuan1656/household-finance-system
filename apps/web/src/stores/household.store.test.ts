import { act } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  archiveHousehold,
  createHousehold,
  getHousehold,
  listHouseholds,
  updateHousehold,
} from '@/api/household'
import { householdActions, useHouseholdStore } from '@/stores/household.store'

const baseHousehold = {
  createdAt: Date.now(),
  defaultCurrencyCode: 'USD',
  defaultVisibility: 'private' as const,
  id: 'h-1',
  name: 'Family One',
  role: 'admin' as const,
  slug: 'family-one',
  timezone: 'UTC',
}

vi.mock('@/api/household', () => ({
  archiveHousehold: vi.fn(async () => ({ archived: true })),
  createHousehold: vi.fn(async () => ({ ...baseHousehold })),
  getHousehold: vi.fn(async () => ({ ...baseHousehold })),
  listHouseholds: vi.fn(async () => ({
    items: [{ ...baseHousehold }],
  })),
  updateHousehold: vi.fn(async () => ({
    ...baseHousehold,
    defaultCurrencyCode: 'EUR',
    defaultVisibility: 'household' as const,
    name: 'Family One Updated',
    timezone: 'Asia/Ho_Chi_Minh',
  })),
}))

beforeEach(() => {
  act(() => {
    householdActions.reset()
  })
})

describe('household store', () => {
  it('starts with initial state', () => {
    expect(useHouseholdStore.getState()).toMatchObject({
      currentHousehold: null,
      error: null,
      households: [],
      isLoading: false,
    })
  })

  it('fetches households into state', async () => {
    await householdActions.fetchHouseholds()

    expect(listHouseholds).toHaveBeenCalled()
    expect(useHouseholdStore.getState().households).toHaveLength(1)
  })

  it('creates household and appends to list', async () => {
    await householdActions.createHousehold({
      name: 'Family One',
    })

    expect(createHousehold).toHaveBeenCalled()
    expect(useHouseholdStore.getState().households).toHaveLength(1)
    expect(useHouseholdStore.getState().currentHousehold?.id).toBe('h-1')
  })

  it('fetches household detail', async () => {
    await householdActions.fetchHouseholdById('h-1')

    expect(getHousehold).toHaveBeenCalledWith('h-1')
    expect(useHouseholdStore.getState().currentHousehold?.id).toBe('h-1')
  })

  it('fetched household includes defaultVisibility field', async () => {
    await householdActions.fetchHouseholdById('h-1')

    expect(
      useHouseholdStore.getState().currentHousehold?.defaultVisibility,
    ).toBe('private')
  })

  it('updates household with timezone and defaultVisibility', async () => {
    await householdActions.createHousehold({
      name: 'Family One',
    })

    await householdActions.updateHousehold('h-1', {
      defaultCurrencyCode: 'EUR',
      defaultVisibility: 'household',
      name: 'Family One Updated',
      timezone: 'Asia/Ho_Chi_Minh',
    })

    expect(updateHousehold).toHaveBeenCalledWith('h-1', {
      defaultCurrencyCode: 'EUR',
      defaultVisibility: 'household',
      name: 'Family One Updated',
      timezone: 'Asia/Ho_Chi_Minh',
    })

    const current = useHouseholdStore.getState().currentHousehold
    expect(current?.name).toBe('Family One Updated')
    expect(current?.timezone).toBe('Asia/Ho_Chi_Minh')
    expect(current?.defaultVisibility).toBe('household')
  })

  it('updates household in list and current household', async () => {
    await householdActions.createHousehold({
      name: 'Family One',
    })

    await householdActions.updateHousehold('h-1', {
      defaultCurrencyCode: 'EUR',
      name: 'Family One Updated',
    })

    expect(updateHousehold).toHaveBeenCalledWith('h-1', {
      defaultCurrencyCode: 'EUR',
      name: 'Family One Updated',
    })

    expect(useHouseholdStore.getState().currentHousehold?.name).toBe(
      'Family One Updated',
    )
  })

  it('archives household and removes it from list', async () => {
    await householdActions.createHousehold({
      name: 'Family One',
    })

    await householdActions.archiveHousehold('h-1')

    expect(archiveHousehold).toHaveBeenCalledWith('h-1')
    expect(useHouseholdStore.getState().households).toHaveLength(0)
    expect(useHouseholdStore.getState().currentHousehold).toBeNull()
  })

  it('propagates archive error when API throws (e.g. 409 conflict)', async () => {
    vi.mocked(archiveHousehold).mockRejectedValueOnce(
      new Error('Conflict: active members remain'),
    )

    await householdActions.createHousehold({
      name: 'Family One',
    })

    await expect(householdActions.archiveHousehold('h-1')).rejects.toThrow()

    // Household should still be in list when archive fails
    expect(useHouseholdStore.getState().households).toHaveLength(1)
  })
})
