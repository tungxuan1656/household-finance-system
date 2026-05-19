import { useQuery } from '@tanstack/react-query'

import {
  getHouseholdMembers,
  listHouseholds,
} from '@/features/households/api/household'

export const HOUSEHOLD_KEYS = {
  all: ['households'] as const,
  list: () => [...HOUSEHOLD_KEYS.all, 'list'] as const,
  members: (householdId: string) =>
    [...HOUSEHOLD_KEYS.all, 'members', householdId] as const,
}

export const useHouseholdsQuery = () =>
  useQuery({
    queryKey: HOUSEHOLD_KEYS.list(),
    queryFn: listHouseholds,
  })

export const useHouseholdMembersQuery = (householdId: string | undefined) =>
  useQuery({
    queryKey: HOUSEHOLD_KEYS.members(householdId ?? 'unknown'),
    queryFn: () => getHouseholdMembers(householdId!),
    enabled: !!householdId,
  })
