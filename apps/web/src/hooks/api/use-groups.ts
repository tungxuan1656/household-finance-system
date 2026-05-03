import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  archiveExpenseGroup,
  createExpenseGroup,
  getExpenseGroup,
  listExpenseGroups,
  updateExpenseGroup,
} from '@/api/group'
import type {
  ArchiveExpenseGroupResponse,
  CreateExpenseGroupRequest,
  ExpenseGroupDTO,
  ListExpenseGroupsResponse,
  UpdateExpenseGroupMutationInput,
} from '@/types/group'

export const GROUP_KEYS = {
  all: ['groups'] as const,
  lists: () => [...GROUP_KEYS.all, 'list'] as const,
  list: (householdId: string) => [...GROUP_KEYS.lists(), householdId] as const,
  detail: (id: string) => [...GROUP_KEYS.all, id] as const,
}

export const useCreateExpenseGroupMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<ExpenseGroupDTO, Error, CreateExpenseGroupRequest>({
    mutationFn: createExpenseGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GROUP_KEYS.all })
    },
  })
}

export const useUpdateExpenseGroupMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<ExpenseGroupDTO, Error, UpdateExpenseGroupMutationInput>({
    mutationFn: updateExpenseGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GROUP_KEYS.all })
    },
  })
}

export const useArchiveExpenseGroupMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<ArchiveExpenseGroupResponse, Error, string>({
    mutationFn: archiveExpenseGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GROUP_KEYS.all })
    },
  })
}

export const useExpenseGroupListQuery = (householdId: string | undefined) => {
  return useQuery<ListExpenseGroupsResponse, Error>({
    queryKey: GROUP_KEYS.list(householdId ?? 'unknown'),
    queryFn: () => listExpenseGroups(householdId!),
    enabled: !!householdId,
  })
}

export const useExpenseGroupDetailQuery = (id: string | undefined) => {
  return useQuery<ExpenseGroupDTO, Error>({
    queryKey: GROUP_KEYS.detail(id!),
    queryFn: () => getExpenseGroup(id!),
    enabled: !!id,
  })
}
