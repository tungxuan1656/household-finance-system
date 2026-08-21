import {
  queryOptions,
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useMemo } from 'react'

import type { QueryLike } from '@/components/shared/query-state'
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

export const useExpenseGroupAggregateQuery = (
  households: HouseholdDTO[],
): QueryLike<ListExpenseGroupsResponse> => {
  const personalGroupsQuery = usePersonalExpenseGroupListQuery()
  const householdGroupQueries = useHouseholdExpenseGroupQueries(households)

  const allGroups = useMemo(() => {
    const groups = [...(personalGroupsQuery.data?.items ?? [])]

    householdGroupQueries.forEach((query) => {
      if (query.data?.items) {
        groups.push(...query.data.items)
      }
    })

    return groups
  }, [personalGroupsQuery.data, householdGroupQueries])

  return useMemo<QueryLike<ListExpenseGroupsResponse>>(() => {
    const queries = [
      personalGroupsQuery,
      ...householdGroupQueries,
    ] as unknown as QueryLike<unknown>[]
    const isPending = queries.some((q) => q.status === 'pending')
    const hasError = queries.some((q) => q.status === 'error')
    const isFetching = queries.some((q) => q.fetchStatus === 'fetching')

    const refetch = () => {
      void personalGroupsQuery.refetch?.()

      householdGroupQueries.forEach((q) => {
        void (q.refetch as (() => unknown) | undefined)?.()
      })
    }

    if (isPending) {
      return {
        status: 'pending',
        fetchStatus: 'fetching',
        data: undefined,
        refetch,
      }
    }

    if (hasError) {
      return {
        status: 'error',
        fetchStatus: isFetching ? 'fetching' : 'idle',
        data: undefined,
        refetch,
      }
    }

    return {
      status: 'success',
      fetchStatus: isFetching ? 'fetching' : 'idle',
      data: { items: allGroups },
      refetch,
    }
  }, [personalGroupsQuery, householdGroupQueries, allGroups])
}

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
