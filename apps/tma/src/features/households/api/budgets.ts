import { queryOptions, useQueries, useQuery } from '@tanstack/react-query'

import { get } from '@/lib/api/client'

import type { HouseholdDTO, ListBudgetsResponse } from '../types'

// ---------------------------------------------------------------------------
// Fetcher
// ---------------------------------------------------------------------------

const listBudgets = (householdId: string, period: string) =>
  get<ListBudgetsResponse>('/budgets', {
    params: { household_id: householdId, period },
  })

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

export const BUDGET_KEYS = {
  all: ['budgets'] as const,
  list: (householdId: string, period: string) =>
    [...BUDGET_KEYS.all, 'list', householdId, period] as const,
}

// ---------------------------------------------------------------------------
// Query options
// ---------------------------------------------------------------------------

export const budgetListQueryOptions = (householdId: string, period: string) =>
  queryOptions({
    queryKey: BUDGET_KEYS.list(householdId, period),
    queryFn: () => listBudgets(householdId, period),
  })

// ---------------------------------------------------------------------------
// Query hooks
// ---------------------------------------------------------------------------

export const useHouseholdBudgetListQuery = (
  householdId: string | undefined,
  period: string | null,
) =>
  useQuery({
    ...budgetListQueryOptions(householdId ?? 'unknown', period ?? 'unknown'),
    enabled: Boolean(householdId && period),
  })

export const useHouseholdBudgetQueries = (
  households: HouseholdDTO[],
  period: string,
) =>
  useQueries({
    queries: households.map((household) =>
      budgetListQueryOptions(household.id, period),
    ),
  })
