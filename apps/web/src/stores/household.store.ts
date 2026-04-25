import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

import {
  archiveHousehold,
  createHousehold,
  getHousehold,
  listHouseholds,
  updateHousehold,
} from '@/api/household'
import { createSelectors } from '@/stores/types'
import type {
  CreateHouseholdRequest,
  HouseholdDTO,
  UpdateHouseholdRequest,
} from '@/types/household'

type HouseholdState = {
  households: HouseholdDTO[]
  currentHousehold: HouseholdDTO | null
  isLoading: boolean
  error: string | null
}

const initialState: HouseholdState = {
  households: [],
  currentHousehold: null,
  isLoading: false,
  error: null,
}

const _useHouseholdStore = create<HouseholdState>()(
  devtools(() => initialState, {
    name: 'household-store',
  }),
)

const householdActions = {
  createHousehold: async (payload: CreateHouseholdRequest) => {
    _useHouseholdStore.setState({ error: null, isLoading: true })
    try {
      const createdHousehold = await createHousehold(payload)

      _useHouseholdStore.setState((state) => ({
        currentHousehold: createdHousehold,
        households: [...state.households, createdHousehold],
        isLoading: false,
      }))

      return createdHousehold
    } catch (error) {
      _useHouseholdStore.setState({
        error:
          error instanceof Error ? error.message : 'Create household failed',
        isLoading: false,
      })

      throw error
    }
  },
  archiveHousehold: async (householdId: string) => {
    _useHouseholdStore.setState({ error: null, isLoading: true })

    try {
      await archiveHousehold(householdId)

      _useHouseholdStore.setState((state) => ({
        currentHousehold:
          state.currentHousehold?.id === householdId
            ? null
            : state.currentHousehold,
        households: state.households.filter(
          (household) => household.id !== householdId,
        ),
        isLoading: false,
      }))
    } catch (error) {
      _useHouseholdStore.setState({
        error:
          error instanceof Error ? error.message : 'Archive household failed',
        isLoading: false,
      })

      throw error
    }
  },
  fetchHouseholdById: async (householdId: string) => {
    _useHouseholdStore.setState({ error: null, isLoading: true })
    try {
      const household = await getHousehold(householdId)

      _useHouseholdStore.setState({
        currentHousehold: household,
        isLoading: false,
      })

      return household
    } catch (error) {
      _useHouseholdStore.setState({
        currentHousehold: null,
        error: error instanceof Error ? error.message : 'Load household failed',
        isLoading: false,
      })

      throw error
    }
  },
  fetchHouseholds: async () => {
    _useHouseholdStore.setState({ error: null, isLoading: true })
    try {
      const response = await listHouseholds()

      _useHouseholdStore.setState({
        households: response.items,
        isLoading: false,
      })

      return response.items
    } catch (error) {
      _useHouseholdStore.setState({
        error:
          error instanceof Error ? error.message : 'Load households failed',
        isLoading: false,
      })

      throw error
    }
  },
  reset: () => {
    _useHouseholdStore.setState(initialState)
  },
  updateHousehold: async (
    householdId: string,
    payload: UpdateHouseholdRequest,
  ) => {
    _useHouseholdStore.setState({ error: null, isLoading: true })
    try {
      const updatedHousehold = await updateHousehold(householdId, payload)

      _useHouseholdStore.setState((state) => ({
        currentHousehold:
          state.currentHousehold?.id === householdId
            ? updatedHousehold
            : state.currentHousehold,
        households: state.households.map((household) =>
          household.id === householdId ? updatedHousehold : household,
        ),
        isLoading: false,
      }))

      return updatedHousehold
    } catch (error) {
      _useHouseholdStore.setState({
        error:
          error instanceof Error ? error.message : 'Update household failed',
        isLoading: false,
      })

      throw error
    }
  },
}

const useHouseholdStore = createSelectors(_useHouseholdStore)

export { householdActions, useHouseholdStore }
