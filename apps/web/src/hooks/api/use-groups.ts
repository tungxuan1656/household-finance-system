import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { listExpenses } from '@/api/expense'
import {
  archiveExpenseGroup,
  createExpenseGroup,
  getExpenseGroup,
  getGroupSummary,
  listExpenseGroups,
  replaceExpenseGroups,
  updateExpenseGroup,
} from '@/api/group'
import type { ExpenseDTO, ExpenseListResponse } from '@/types/expense'
import type {
  ArchiveExpenseGroupResponse,
  CreateExpenseGroupRequest,
  ExpenseGroupDTO,
  GroupSummaryDTO,
  ListExpenseGroupsResponse,
  ReplaceExpenseGroupsRequest,
  UpdateExpenseGroupMutationInput,
} from '@/types/group'

export const GROUP_KEYS = {
  all: ['groups'] as const,
  lists: () => [...GROUP_KEYS.all, 'list'] as const,
  list: (householdId: string) => [...GROUP_KEYS.lists(), householdId] as const,
  detail: (id: string) => [...GROUP_KEYS.all, id] as const,
  detailSummary: (id: string) => [...GROUP_KEYS.all, id, 'summary'] as const,
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

export const useGroupSummaryQuery = (id: string | undefined) => {
  return useQuery<GroupSummaryDTO, Error>({
    queryKey: GROUP_KEYS.detailSummary(id!),
    queryFn: () => getGroupSummary(id!),
    enabled: !!id,
  })
}

type ReplaceExpenseGroupsMutationInput = {
  expenseId: string
  payload: ReplaceExpenseGroupsRequest
}

export const useReplaceExpenseGroupsMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<ExpenseDTO, Error, ReplaceExpenseGroupsMutationInput>({
    mutationFn: ({ expenseId, payload }) =>
      replaceExpenseGroups(expenseId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GROUP_KEYS.all })
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
    },
  })
}

export const useGroupExpenseListQuery = (
  groupId: string | undefined,
  householdId: string | undefined,
) => {
  return useInfiniteQuery<ExpenseListResponse, Error>({
    queryKey: [
      ...GROUP_KEYS.all,
      'expenses',
      groupId ?? 'unknown',
      householdId ?? 'unknown',
    ],
    queryFn: ({ pageParam }) =>
      listExpenses({
        household_id: householdId,
        group_id: groupId,
        cursor: pageParam as string | undefined,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: !!groupId && !!householdId,
  })
}
