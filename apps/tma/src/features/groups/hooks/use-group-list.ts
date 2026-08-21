import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import type { QueryLike } from '@/components/shared/query-state'
import { useHouseholdsQuery } from '@/features/home/api'
import type { HouseholdDTO } from '@/features/home/types'

import {
  useHouseholdExpenseGroupQueries,
  usePersonalExpenseGroupListQuery,
} from '../api'
import type { ExpenseGroupDTO, GroupListItem } from '../types'

const buildGroupListItems = (
  personalGroups: ExpenseGroupDTO[],
  householdGroupsByHousehold: Array<{
    groups: ExpenseGroupDTO[]
    household: HouseholdDTO
  }>,
): GroupListItem[] => [
  ...personalGroups.map((group) => ({ group, household: null })),
  ...householdGroupsByHousehold.flatMap(({ groups, household }) =>
    groups.map((group) => ({ group, household })),
  ),
]

export const useGroupList = () => {
  const { t } = useTranslation()
  const householdsQuery = useHouseholdsQuery()
  const households = householdsQuery.data?.items ?? []
  const personalGroupsQuery = usePersonalExpenseGroupListQuery()
  const householdGroupQueries = useHouseholdExpenseGroupQueries(households)

  const rawGroupItems = useMemo(
    () =>
      buildGroupListItems(
        personalGroupsQuery.data?.items ?? [],
        households.map((household, index) => ({
          household,
          groups: householdGroupQueries[index]?.data?.items ?? [],
        })),
      ),
    [households, householdGroupQueries, personalGroupsQuery.data?.items],
  )

  const groupListQuery = useMemo<QueryLike<GroupListItem[]>>(() => {
    const queries = [
      householdsQuery as unknown as QueryLike<unknown>,
      personalGroupsQuery as unknown as QueryLike<unknown>,
      ...(householdGroupQueries as unknown as QueryLike<unknown>[]),
    ]

    const hasError = queries.some((q) => q.status === 'error')
    const isPending = queries.some((q) => q.status === 'pending')
    const isFetching = queries.some((q) => q.fetchStatus === 'fetching')

    const refetchAll = () => {
      void householdsQuery.refetch?.()
      void personalGroupsQuery.refetch?.()

      householdGroupQueries.forEach((q) => {
        void (q.refetch as (() => unknown) | undefined)?.()
      })
    }

    if (hasError) {
      return {
        status: 'error',
        fetchStatus: isFetching ? 'fetching' : 'idle',
        data: undefined,
        refetch: refetchAll,
      }
    }

    if (isPending) {
      return {
        status: 'pending',
        fetchStatus: 'fetching',
        data: undefined,
        refetch: refetchAll,
      }
    }

    return {
      status: 'success',
      fetchStatus: isFetching ? 'fetching' : 'idle',
      data: rawGroupItems,
      refetch: refetchAll,
    }
  }, [
    householdsQuery,
    personalGroupsQuery,
    householdGroupQueries,
    rawGroupItems,
  ])

  const handleRefetch = async () => {
    await Promise.all([
      householdsQuery.refetch(),
      personalGroupsQuery.refetch(),
      ...householdGroupQueries.map((q) => q.refetch()),
    ])
  }

  const totalCount =
    groupListQuery.status === 'success' ? (groupListQuery.data?.length ?? 0) : 0

  return {
    t,
    householdsQuery,
    groupListQuery,
    handleRefetch,
    totalCount,
  }
}
