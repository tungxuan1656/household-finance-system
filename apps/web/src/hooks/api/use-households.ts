import { useQuery } from '@tanstack/react-query'

import { listHouseholds } from '@/api/household'

export const HOUSEHOLD_KEYS = {
  all: ['households'] as const,
  list: () => [...HOUSEHOLD_KEYS.all, 'list'] as const,
}

export const useHouseholdsQuery = () =>
  useQuery({
    queryKey: HOUSEHOLD_KEYS.list(),
    queryFn: listHouseholds,
  })
