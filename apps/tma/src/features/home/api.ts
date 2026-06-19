import { queryOptions, useQuery } from '@tanstack/react-query'

import { get } from '@/lib/api/client'

import type {
  AnalyticsComparisonDTO,
  AnalyticsComparisonParams,
  AnalyticsOverviewDTO,
  AnalyticsOverviewParams,
  ExpenseListParams,
  ExpenseListResponse,
  ListBudgetsParams,
  ListBudgetsResponse,
  ListHouseholdMembersResponse,
  ListHouseholdsResponse,
  ListReferenceCategoriesResponse,
} from './types'

const getAnalyticsOverview = (params: AnalyticsOverviewParams) =>
  get<AnalyticsOverviewDTO>('/analytics/overview', { params })

const getAnalyticsComparison = (params: AnalyticsComparisonParams) =>
  get<AnalyticsComparisonDTO>('/analytics/comparison', { params })

const listExpenses = (params?: ExpenseListParams) =>
  get<ExpenseListResponse>('/expenses', { params })

const listHouseholds = () => get<ListHouseholdsResponse>('/households')

const getHouseholdMembers = (householdId: string) =>
  get<ListHouseholdMembersResponse>(`/households/${householdId}/members`)

const listBudgets = (params: ListBudgetsParams) =>
  get<ListBudgetsResponse>('/budgets', {
    params: {
      household_id: params.householdId,
      scope: params.scope,
      period: params.period,
    },
  })

const getReferenceCategories = () =>
  get<ListReferenceCategoriesResponse>('/categories', {
    authenticated: false,
  })

export const ANALYTICS_KEYS = {
  all: ['analytics'] as const,
  overview: (params: AnalyticsOverviewParams) =>
    [...ANALYTICS_KEYS.all, 'overview', params] as const,
  comparison: (params: AnalyticsComparisonParams) =>
    [...ANALYTICS_KEYS.all, 'comparison', params] as const,
}

export const EXPENSE_KEYS = {
  all: ['expenses'] as const,
  list: (params?: ExpenseListParams) =>
    [...EXPENSE_KEYS.all, 'list', params] as const,
}

export const HOUSEHOLD_KEYS = {
  all: ['households'] as const,
  list: () => [...HOUSEHOLD_KEYS.all, 'list'] as const,
  members: (householdId: string) =>
    [...HOUSEHOLD_KEYS.all, 'members', householdId] as const,
}

export const BUDGET_KEYS = {
  all: ['budgets'] as const,
  list: (params: ListBudgetsParams) =>
    [...BUDGET_KEYS.all, 'list', params] as const,
}

export const REFERENCE_DATA_KEYS = {
  all: ['reference-data'] as const,
  categories: () => [...REFERENCE_DATA_KEYS.all, 'categories'] as const,
}

export const analyticsOverviewQueryOptions = (
  params: AnalyticsOverviewParams,
) =>
  queryOptions({
    queryKey: ANALYTICS_KEYS.overview(params),
    queryFn: () => getAnalyticsOverview(params),
  })

export const analyticsComparisonQueryOptions = (
  params: AnalyticsComparisonParams,
) =>
  queryOptions({
    queryKey: ANALYTICS_KEYS.comparison(params),
    queryFn: () => getAnalyticsComparison(params),
  })

export const expenseListQueryOptions = (params?: ExpenseListParams) =>
  queryOptions({
    queryKey: EXPENSE_KEYS.list(params),
    queryFn: () => listExpenses(params),
  })

export const householdListQueryOptions = () =>
  queryOptions({
    queryKey: HOUSEHOLD_KEYS.list(),
    queryFn: listHouseholds,
  })

export const householdMembersQueryOptions = (householdId: string) =>
  queryOptions({
    queryKey: HOUSEHOLD_KEYS.members(householdId),
    queryFn: () => getHouseholdMembers(householdId),
  })

export const budgetListQueryOptions = (params: ListBudgetsParams) =>
  queryOptions({
    queryKey: BUDGET_KEYS.list(params),
    queryFn: () => listBudgets(params),
  })

export const referenceCategoriesQueryOptions = () =>
  queryOptions({
    queryKey: REFERENCE_DATA_KEYS.categories(),
    queryFn: getReferenceCategories,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

type QueryToggle = { enabled?: boolean }

export const useAnalyticsOverviewQuery = (
  params: AnalyticsOverviewParams,
  options?: QueryToggle,
) =>
  useQuery({
    ...analyticsOverviewQueryOptions(params),
    enabled: options?.enabled,
  })

export const useAnalyticsComparisonQuery = (
  params: AnalyticsComparisonParams,
  options?: QueryToggle,
) =>
  useQuery({
    ...analyticsComparisonQueryOptions(params),
    enabled: options?.enabled,
  })

export const useExpenseListQuery = (params?: ExpenseListParams) =>
  useQuery(expenseListQueryOptions(params))

export const useHouseholdsQuery = () => useQuery(householdListQueryOptions())

export const useReferenceCategoriesQuery = () =>
  useQuery(referenceCategoriesQueryOptions())
