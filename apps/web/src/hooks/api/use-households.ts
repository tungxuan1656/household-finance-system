import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { createHousehold, getHousehold, listHouseholds } from '@/api/household'
import type { CreateHouseholdRequest } from '@/types/household'

export const HOUSEHOLD_KEYS = {
  all: ['households'] as const,
  detail: (householdId: string) =>
    [...HOUSEHOLD_KEYS.all, 'detail', householdId] as const,
  list: () => [...HOUSEHOLD_KEYS.all, 'list'] as const,
}

export const useHouseholdsQuery = () =>
  useQuery({
    queryFn: listHouseholds,
    queryKey: HOUSEHOLD_KEYS.list(),
  })

export const useHouseholdQuery = (householdId: string | null) =>
  useQuery({
    enabled: householdId !== null,
    queryFn: () => getHousehold(householdId ?? ''),
    queryKey: HOUSEHOLD_KEYS.detail(householdId ?? 'none'),
  })

export const useCreateHouseholdMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateHouseholdRequest) => createHousehold(payload),
    onSuccess: (household) => {
      queryClient.setQueryData(HOUSEHOLD_KEYS.detail(household.id), household)
      void queryClient.invalidateQueries({ queryKey: HOUSEHOLD_KEYS.all })
    },
  })
}
