import { queryOptions, useQuery } from '@tanstack/react-query'

import { get } from '@/lib/api/client'

import type { ExpenseListParams, ExpenseListResponse } from '../types'

// ---------------------------------------------------------------------------
// Fetcher
// ---------------------------------------------------------------------------

const listExpenses = (params?: ExpenseListParams) =>
  get<ExpenseListResponse>('/expenses', { params })

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

export const EXPENSE_KEYS = {
  all: ['expenses'] as const,
  list: (params?: ExpenseListParams) =>
    [...EXPENSE_KEYS.all, 'list', params] as const,
}

// ---------------------------------------------------------------------------
// Query options
// ---------------------------------------------------------------------------

export const expenseListQueryOptions = (params?: ExpenseListParams) =>
  queryOptions({
    queryKey: EXPENSE_KEYS.list(params),
    queryFn: () => listExpenses(params),
  })

// ---------------------------------------------------------------------------
// Query hooks
// ---------------------------------------------------------------------------

export const useHouseholdRecentExpensesQuery = (
  householdId: string | undefined,
) =>
  useQuery({
    ...expenseListQueryOptions(
      householdId
        ? {
            household_id: householdId,
            limit: 5,
            sort: 'occurred_at_desc',
          }
        : undefined,
    ),
    enabled: Boolean(householdId),
  })
