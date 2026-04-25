import { act } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  archiveHousehold,
  createHousehold,
  getHousehold,
  listHouseholds,
  updateHousehold,
} from '@/api/household'
import { householdActions, useHouseholdStore } from '@/stores/household.store'

vi.mock('@/api/household', () => ({
  archiveHousehold: vi.fn(async () => ({ archived: true })),
  createHousehold: vi.fn(async () => ({
    createdAt: Date.now(),
    defaultCurrencyCode: 'USD',
    id: 'h-1',
    name: 'Family One',
    role: 'admin',
    slug: 'family-one',
    timezone: 'UTC',
  })),
  getHousehold: vi.fn(async () => ({
    createdAt: Date.now(),
    defaultCurrencyCode: 'USD',
    id: 'h-1',
    name: 'Family One',
    role: 'admin',
    slug: 'family-one',
    timezone: 'UTC',
  })),
  listHouseholds: vi.fn(async () => ({
    items: [
      {
        createdAt: Date.now(),
        defaultCurrencyCode: 'USD',
        id: 'h-1',
        name: 'Family One',
        role: 'admin',
        slug: 'family-one',
        timezone: 'UTC',
      },
    ],
  })),
  updateHousehold: vi.fn(async () => ({
    createdAt: Date.now(),
    defaultCurrencyCode: 'EUR',
    id: 'h-1',
    name: 'Family One Updated',
    role: 'admin',
    slug: 'family-one',
    timezone: 'UTC',
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
})
