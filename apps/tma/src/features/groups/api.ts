import {
  queryOptions,
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import type { HouseholdDTO } from '@/features/home/types'
import { get, post } from '@/lib/api/client'
import { notification } from '@/lib/telegram/haptics'

import type {
  CreateExpenseGroupRequest,
  ExpenseGroupDTO,
  GroupSummaryDTO,
  ListExpenseGroupsResponse,
} from './types'

const listExpenseGroups = (householdId?: string) =>
  get<ListExpenseGroupsResponse>('/groups', {
    params: householdId ? { household_id: householdId } : undefined,
  })

const createExpenseGroup = (payload: CreateExpenseGroupRequest) =>
  post<ExpenseGroupDTO>('/groups', payload)

const getExpenseGroup = (groupId: string) =>
  get<ExpenseGroupDTO>(`/groups/${groupId}`)

const getGroupSummary = (groupId: string) =>
  get<GroupSummaryDTO>(`/groups/${groupId}/summary`)

export const GROUP_KEYS = {
  all: ['groups'] as const,
  list: (householdId?: string) =>
    [...GROUP_KEYS.all, 'list', householdId ?? 'personal'] as const,
  detail: (groupId: string) => [...GROUP_KEYS.all, 'detail', groupId] as const,
  summary: (groupId: string) =>
    [...GROUP_KEYS.all, 'summary', groupId] as const,
}

export const expenseGroupListQueryOptions = (householdId?: string) =>
  queryOptions({
    queryKey: GROUP_KEYS.list(householdId),
    queryFn: () => listExpenseGroups(householdId),
  })

export const expenseGroupDetailQueryOptions = (groupId: string) =>
  queryOptions({
    queryKey: GROUP_KEYS.detail(groupId),
    queryFn: () => getExpenseGroup(groupId),
  })

export const groupSummaryQueryOptions = (groupId: string) =>
  queryOptions({
    queryKey: GROUP_KEYS.summary(groupId),
    queryFn: () => getGroupSummary(groupId),
  })

export const usePersonalExpenseGroupListQuery = () =>
  useQuery(expenseGroupListQueryOptions())

export const useHouseholdExpenseGroupQueries = (households: HouseholdDTO[]) =>
  useQueries({
    queries: households.map((household) =>
      expenseGroupListQueryOptions(household.id),
    ),
  })

export const useExpenseGroupDetailQuery = (groupId: string | undefined) =>
  useQuery({
    ...expenseGroupDetailQueryOptions(groupId ?? 'unknown'),
    enabled: Boolean(groupId),
  })

export const useGroupSummaryQuery = (groupId: string | undefined) =>
  useQuery({
    ...groupSummaryQueryOptions(groupId ?? 'unknown'),
    enabled: Boolean(groupId),
  })

export const useCreateExpenseGroupMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createExpenseGroup,
    onSuccess: async (group) => {
      queryClient.setQueryData(GROUP_KEYS.detail(group.id), group)

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: GROUP_KEYS.all }),
        queryClient.invalidateQueries({ queryKey: ['expenses'] }),
        queryClient.invalidateQueries({ queryKey: ['analytics'] }),
      ])
    },
    onError: (error) => {
      console.error(error)
      notification('error')
    },
  })
}
