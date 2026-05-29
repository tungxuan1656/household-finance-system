import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
  archiveHousehold,
  createHousehold,
  leaveHousehold,
  removeHouseholdMember,
  updateHousehold,
  updateHouseholdMemberRole,
} from '@/features/households/api/household'
import type {
  CreateHouseholdRequest,
  DeleteHouseholdResponse,
  HouseholdDTO,
  HouseholdRoleDTO,
  LeaveHouseholdResponse,
  RemoveMemberResponse,
  UpdateHouseholdMemberRoleResponse,
  UpdateHouseholdRequest,
} from '@/features/households/types/household'
import { ANALYTICS_KEYS } from '@/features/insights/api/use-analytics'

import { HOUSEHOLD_KEYS } from './use-households'

export const useCreateHouseholdMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<HouseholdDTO, Error, CreateHouseholdRequest>({
    mutationFn: createHousehold,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HOUSEHOLD_KEYS.all })
      queryClient.invalidateQueries({ queryKey: ANALYTICS_KEYS.all })
    },
  })
}

export const useUpdateHouseholdMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<
    HouseholdDTO,
    Error,
    { householdId: string; payload: UpdateHouseholdRequest }
  >({
    mutationFn: ({ householdId, payload }) =>
      updateHousehold(householdId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HOUSEHOLD_KEYS.all })
      queryClient.invalidateQueries({ queryKey: ANALYTICS_KEYS.all })
    },
  })
}

export const useArchiveHouseholdMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<DeleteHouseholdResponse, Error, string>({
    mutationFn: archiveHousehold,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HOUSEHOLD_KEYS.all })
      queryClient.invalidateQueries({ queryKey: ANALYTICS_KEYS.all })
    },
  })
}

export const useRemoveHouseholdMemberMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<
    RemoveMemberResponse,
    Error,
    { householdId: string; userId: string }
  >({
    mutationFn: ({ householdId, userId }) =>
      removeHouseholdMember(householdId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HOUSEHOLD_KEYS.all })
      queryClient.invalidateQueries({ queryKey: ANALYTICS_KEYS.all })
    },
  })
}

export const useLeaveHouseholdMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<LeaveHouseholdResponse, Error, string>({
    mutationFn: leaveHousehold,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HOUSEHOLD_KEYS.all })
      queryClient.invalidateQueries({ queryKey: ANALYTICS_KEYS.all })
    },
  })
}

export const useUpdateHouseholdMemberRoleMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<
    UpdateHouseholdMemberRoleResponse,
    Error,
    { householdId: string; userId: string; role: HouseholdRoleDTO }
  >({
    mutationFn: ({ householdId, userId, role }) =>
      updateHouseholdMemberRole(householdId, userId, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HOUSEHOLD_KEYS.all })
      queryClient.invalidateQueries({ queryKey: ANALYTICS_KEYS.all })
    },
  })
}
