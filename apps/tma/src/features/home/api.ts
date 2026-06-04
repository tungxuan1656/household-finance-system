import { queryOptions, useQuery } from '@tanstack/react-query'

import { useAuthStore } from '@/features/auth/store'

import type {
  AnalyticsComparisonDTO,
  AnalyticsComparisonParams,
  AnalyticsOverviewDTO,
  AnalyticsOverviewParams,
  ExpenseListParams,
  ExpenseListResponse,
  ListBudgetsResponse,
  ListHouseholdMembersResponse,
  ListHouseholdsResponse,
  ListReferenceCategoriesResponse,
} from './types'

const API_BASE_PATH = (import.meta.env.VITE_WORKER_URL ?? '/api/v1').replace(
  /\/$/,
  '',
)

type ApiEnvelope<T> =
  | {
      success: true
      data: T
      error: null
      meta: { requestId: string }
    }
  | {
      success: false
      data: null
      error: {
        code: string
        message: string
        details?: unknown
      }
      meta: { requestId: string }
    }

export class ApiClientError extends Error {
  public readonly code: string
  public readonly details?: unknown
  public readonly requestId?: string
  public readonly status: number

  public constructor(input: {
    code: string
    message: string
    status: number
    details?: unknown
    requestId?: string
  }) {
    super(input.message)
    this.name = 'ApiClientError'
    this.code = input.code
    this.details = input.details
    this.requestId = input.requestId
    this.status = input.status
  }
}

type RequestOptions = {
  authenticated?: boolean
  params?: Record<string, number | string | undefined>
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const toApiClientError = (
  status: number,
  payload: unknown,
  fallbackMessage: string,
): ApiClientError => {
  if (
    isRecord(payload) &&
    payload.success === false &&
    isRecord(payload.error) &&
    typeof payload.error.code === 'string'
  ) {
    return new ApiClientError({
      code: payload.error.code,
      details: payload.error.details,
      message:
        typeof payload.error.message === 'string'
          ? payload.error.message
          : fallbackMessage,
      requestId:
        isRecord(payload.meta) && typeof payload.meta.requestId === 'string'
          ? payload.meta.requestId
          : undefined,
      status,
    })
  }

  return new ApiClientError({
    code: status === 0 ? 'NETWORK_ERROR' : 'HTTP_ERROR',
    message: fallbackMessage,
    requestId:
      isRecord(payload) &&
      isRecord(payload.meta) &&
      typeof payload.meta.requestId === 'string'
        ? payload.meta.requestId
        : undefined,
    status,
  })
}

const buildUrl = (
  path: string,
  params?: Record<string, number | string | undefined>,
): string => {
  const search = new URLSearchParams()

  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined) {
      search.set(key, String(value))
    }
  }

  const query = search.toString()

  return `${API_BASE_PATH}${path}${query.length > 0 ? `?${query}` : ''}`
}

const request = async <TResponse>(
  path: string,
  options: RequestOptions = {},
): Promise<TResponse> => {
  const headers = new Headers({ accept: 'application/json' })

  if (options.authenticated ?? true) {
    const accessToken = useAuthStore.getState().accessToken

    if (accessToken) {
      headers.set('authorization', `Bearer ${accessToken}`)
    }
  }

  let response: Response

  try {
    response = await fetch(buildUrl(path, options.params), {
      headers,
      method: 'GET',
    })
  } catch {
    throw toApiClientError(0, null, 'Network request failed.')
  }

  let payload: ApiEnvelope<TResponse> | null = null

  try {
    payload = (await response.json()) as ApiEnvelope<TResponse>
  } catch {
    payload = null
  }

  if (!response.ok) {
    throw toApiClientError(
      response.status,
      payload,
      `Request failed with status ${response.status}.`,
    )
  }

  if (!payload || payload.success !== true) {
    throw toApiClientError(
      response.status,
      payload,
      'Response did not match the API envelope contract.',
    )
  }

  return payload.data
}

const getAnalyticsOverview = (params: AnalyticsOverviewParams) =>
  request<AnalyticsOverviewDTO>('/analytics/overview', { params })

const getAnalyticsComparison = (params: AnalyticsComparisonParams) =>
  request<AnalyticsComparisonDTO>('/analytics/comparison', { params })

const listExpenses = (params?: ExpenseListParams) =>
  request<ExpenseListResponse>('/expenses', { params })

const listHouseholds = () => request<ListHouseholdsResponse>('/households')

const getHouseholdMembers = (householdId: string) =>
  request<ListHouseholdMembersResponse>(`/households/${householdId}/members`)

const listBudgets = (householdId: string, period: string) =>
  request<ListBudgetsResponse>('/budgets', {
    params: { household_id: householdId, period },
  })

const getReferenceCategories = () =>
  request<ListReferenceCategoriesResponse>('/categories', {
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
  list: (householdId: string, period: string) =>
    [...BUDGET_KEYS.all, 'list', householdId, period] as const,
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

export const budgetListQueryOptions = (householdId: string, period: string) =>
  queryOptions({
    queryKey: BUDGET_KEYS.list(householdId, period),
    queryFn: () => listBudgets(householdId, period),
  })

export const referenceCategoriesQueryOptions = () =>
  queryOptions({
    queryKey: REFERENCE_DATA_KEYS.categories(),
    queryFn: getReferenceCategories,
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
