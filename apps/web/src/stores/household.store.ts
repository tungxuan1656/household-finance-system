import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

import {
  archiveHousehold,
  createHousehold,
  getHousehold,
  getHouseholdMembers,
  leaveHousehold,
  listHouseholds,
  removeHouseholdMember,
  updateHousehold,
  updateHouseholdMemberRole,
} from '@/features/households/api/household'
import type {
  CreateHouseholdRequest,
  HouseholdDTO,
  HouseholdMemberDTO,
  HouseholdRoleDTO,
  UpdateHouseholdRequest,
} from '@/features/households/types/household'
import { createSelectors } from '@/stores/types'

type HouseholdState = {
  households: HouseholdDTO[]
  currentHousehold: HouseholdDTO | null
  members: HouseholdMemberDTO[]
  isLoading: boolean
  error: string | null
}

const initialState: HouseholdState = {
  households: [],
  currentHousehold: null,
  members: [],
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
  fetchHouseholdMembers: async (householdId: string) => {
    _useHouseholdStore.setState({ error: null, isLoading: true })
    try {
      const response = await getHouseholdMembers(householdId)

      _useHouseholdStore.setState({
        members: response.items,
        isLoading: false,
      })

      return response.items
    } catch (error) {
      _useHouseholdStore.setState({
        error: error instanceof Error ? error.message : 'Load members failed',
        isLoading: false,
      })

      throw error
    }
  },
  removeHouseholdMember: async (householdId: string, userId: string) => {
    _useHouseholdStore.setState({ error: null, isLoading: true })
    try {
      await removeHouseholdMember(householdId, userId)

      _useHouseholdStore.setState((state) => ({
        members: state.members.filter((m) => m.userId !== userId),
        isLoading: false,
      }))
    } catch (error) {
      _useHouseholdStore.setState({
        error: error instanceof Error ? error.message : 'Remove member failed',
        isLoading: false,
      })

      throw error
    }
  },
  leaveHousehold: async (householdId: string) => {
    _useHouseholdStore.setState({ error: null, isLoading: true })
    try {
      await leaveHousehold(householdId)

      _useHouseholdStore.setState({
        members: [],
        currentHousehold: null,
        isLoading: false,
      })
    } catch (error) {
      _useHouseholdStore.setState({
        error:
          error instanceof Error ? error.message : 'Leave household failed',
        isLoading: false,
      })

      throw error
    }
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
  updateHouseholdMemberRole: async (
    householdId: string,
    userId: string,
    role: HouseholdRoleDTO,
  ) => {
    _useHouseholdStore.setState({ error: null, isLoading: true })
    try {
      await updateHouseholdMemberRole(householdId, userId, { role })

      _useHouseholdStore.setState((state) => ({
        members: state.members.map((m) =>
          m.userId === userId ? { ...m, role } : m,
        ),
        isLoading: false,
      }))
    } catch (error) {
      _useHouseholdStore.setState({
        error:
          error instanceof Error ? error.message : 'Update member role failed',
        isLoading: false,
      })

      throw error
    }
  },
}

const useHouseholdStore = createSelectors(_useHouseholdStore)

export { householdActions, useHouseholdStore }
