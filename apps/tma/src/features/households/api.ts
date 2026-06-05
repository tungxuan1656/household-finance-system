import {
  queryOptions,
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { deleteRequest, get, patch, post } from '@/lib/api/client'

import type {
  AnalyticsOverviewDTO,
  AnalyticsOverviewParams,
  CreateHouseholdRequest,
  DeleteHouseholdResponse,
  ExpenseListParams,
  ExpenseListResponse,
  HouseholdDTO,
  LeaveHouseholdResponse,
  ListBudgetsResponse,
  ListHouseholdMembersResponse,
  ListHouseholdsResponse,
  ListReferenceCategoriesResponse,
  RemoveMemberResponse,
  UpdateHouseholdMemberRoleRequest,
  UpdateHouseholdMemberRoleResponse,
  UpdateHouseholdRequest,
} from './types'

type AnalyticsOverviewScopeParams =
  | { period: string }
  | {
      date_from: number
      date_to: number
    }

const withHouseholdAnalyticsParams = (
  householdId: string,
  params: AnalyticsOverviewScopeParams,
): AnalyticsOverviewParams =>
  'period' in params
    ? { household_id: householdId, period: params.period }
    : {
        household_id: householdId,
        date_from: params.date_from,
        date_to: params.date_to,
      }

const getHousehold = (householdId: string) =>
  get<HouseholdDTO>(`/households/${householdId}`)

const listHouseholds = () => get<ListHouseholdsResponse>('/households')

const createHousehold = (payload: CreateHouseholdRequest) =>
  post<HouseholdDTO>('/households', payload)

const updateHousehold = (
  householdId: string,
  payload: UpdateHouseholdRequest,
) => patch<HouseholdDTO>(`/households/${householdId}`, payload)

const archiveHousehold = (householdId: string) =>
  deleteRequest<DeleteHouseholdResponse>(`/households/${householdId}`)

const leaveHousehold = (householdId: string) =>
  deleteRequest<LeaveHouseholdResponse>(`/households/${householdId}/members/me`)

const getHouseholdMembers = (householdId: string) =>
  get<ListHouseholdMembersResponse>(`/households/${householdId}/members`)

const removeHouseholdMember = (householdId: string, userId: string) =>
  deleteRequest<RemoveMemberResponse>(
    `/households/${householdId}/members/${userId}`,
  )

const updateHouseholdMemberRole = (
  householdId: string,
  userId: string,
  payload: UpdateHouseholdMemberRoleRequest,
) =>
  patch<UpdateHouseholdMemberRoleResponse>(
    `/households/${householdId}/members/${userId}`,
    payload,
  )

const getAnalyticsOverview = (params: AnalyticsOverviewParams) =>
  get<AnalyticsOverviewDTO>('/analytics/overview', { params })

const listBudgets = (householdId: string, period: string) =>
  get<ListBudgetsResponse>('/budgets', {
    params: { household_id: householdId, period },
  })

const listExpenses = (params?: ExpenseListParams) =>
  get<ExpenseListResponse>('/expenses', { params })

const getReferenceCategories = () =>
  get<ListReferenceCategoriesResponse>('/categories', {
    authenticated: false,
  })

export const HOUSEHOLD_KEYS = {
  all: ['households'] as const,
  list: () => [...HOUSEHOLD_KEYS.all, 'list'] as const,
  detail: (householdId: string) =>
    [...HOUSEHOLD_KEYS.all, 'detail', householdId] as const,
  members: (householdId: string) =>
    [...HOUSEHOLD_KEYS.all, 'members', householdId] as const,
}

export const ANALYTICS_KEYS = {
  all: ['analytics'] as const,
  overview: (params: AnalyticsOverviewParams) =>
    [...ANALYTICS_KEYS.all, 'overview', params] as const,
}

export const BUDGET_KEYS = {
  all: ['budgets'] as const,
  list: (householdId: string, period: string) =>
    [...BUDGET_KEYS.all, 'list', householdId, period] as const,
}

export const EXPENSE_KEYS = {
  all: ['expenses'] as const,
  list: (params?: ExpenseListParams) =>
    [...EXPENSE_KEYS.all, 'list', params] as const,
}

export const REFERENCE_DATA_KEYS = {
  all: ['reference-data'] as const,
  categories: () => [...REFERENCE_DATA_KEYS.all, 'categories'] as const,
}

export const householdListQueryOptions = () =>
  queryOptions({
    queryKey: HOUSEHOLD_KEYS.list(),
    queryFn: listHouseholds,
  })

export const householdDetailQueryOptions = (householdId: string) =>
  queryOptions({
    queryKey: HOUSEHOLD_KEYS.detail(householdId),
    queryFn: () => getHousehold(householdId),
  })

export const householdMembersQueryOptions = (householdId: string) =>
  queryOptions({
    queryKey: HOUSEHOLD_KEYS.members(householdId),
    queryFn: () => getHouseholdMembers(householdId),
  })

export const analyticsOverviewQueryOptions = (
  params: AnalyticsOverviewParams,
) =>
  queryOptions({
    queryKey: ANALYTICS_KEYS.overview(params),
    queryFn: () => getAnalyticsOverview(params),
  })

export const budgetListQueryOptions = (householdId: string, period: string) =>
  queryOptions({
    queryKey: BUDGET_KEYS.list(householdId, period),
    queryFn: () => listBudgets(householdId, period),
  })

export const expenseListQueryOptions = (params?: ExpenseListParams) =>
  queryOptions({
    queryKey: EXPENSE_KEYS.list(params),
    queryFn: () => listExpenses(params),
  })

export const referenceCategoriesQueryOptions = () =>
  queryOptions({
    queryKey: REFERENCE_DATA_KEYS.categories(),
    queryFn: getReferenceCategories,
  })

export const useHouseholdListQuery = () => useQuery(householdListQueryOptions())

export const useHouseholdDetailQuery = (householdId: string | undefined) =>
  useQuery({
    ...householdDetailQueryOptions(householdId ?? 'unknown'),
    enabled: Boolean(householdId),
  })

export const useHouseholdMembersQuery = (householdId: string | undefined) =>
  useQuery({
    ...householdMembersQueryOptions(householdId ?? 'unknown'),
    enabled: Boolean(householdId),
  })

export const useHouseholdOverviewQuery = (
  householdId: string | undefined,
  params: AnalyticsOverviewScopeParams,
) =>
  useQuery({
    ...analyticsOverviewQueryOptions(
      householdId ? withHouseholdAnalyticsParams(householdId, params) : params,
    ),
    enabled: Boolean(householdId),
  })

export const useHouseholdBudgetListQuery = (
  householdId: string | undefined,
  period: string | null,
) =>
  useQuery({
    ...budgetListQueryOptions(householdId ?? 'unknown', period ?? 'unknown'),
    enabled: Boolean(householdId && period),
  })

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

export const useReferenceCategoriesQuery = () =>
  useQuery(referenceCategoriesQueryOptions())

const invalidateHouseholdSurfaceQueries = async (
  queryClient: ReturnType<typeof useQueryClient>,
) => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: HOUSEHOLD_KEYS.all }),
    queryClient.invalidateQueries({ queryKey: ANALYTICS_KEYS.all }),
    queryClient.invalidateQueries({ queryKey: BUDGET_KEYS.all }),
    queryClient.invalidateQueries({ queryKey: EXPENSE_KEYS.all }),
  ])
}

export const useCreateHouseholdMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createHousehold,
    onSuccess: async () => {
      await invalidateHouseholdSurfaceQueries(queryClient)
    },
  })
}

export const useUpdateHouseholdMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      householdId,
      payload,
    }: {
      householdId: string
      payload: UpdateHouseholdRequest
    }) => updateHousehold(householdId, payload),
    onSuccess: async () => {
      await invalidateHouseholdSurfaceQueries(queryClient)
    },
  })
}

export const useArchiveHouseholdMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: archiveHousehold,
    onSuccess: async () => {
      await invalidateHouseholdSurfaceQueries(queryClient)
    },
  })
}

export const useLeaveHouseholdMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: leaveHousehold,
    onSuccess: async () => {
      await invalidateHouseholdSurfaceQueries(queryClient)
    },
  })
}

export const useRemoveHouseholdMemberMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      householdId,
      userId,
    }: {
      householdId: string
      userId: string
    }) => removeHouseholdMember(householdId, userId),
    onSuccess: async () => {
      await invalidateHouseholdSurfaceQueries(queryClient)
    },
  })
}

export const useUpdateHouseholdMemberRoleMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      householdId,
      payload,
      userId,
    }: {
      householdId: string
      payload: UpdateHouseholdMemberRoleRequest
      userId: string
    }) => updateHouseholdMemberRole(householdId, userId, payload),
    onSuccess: async () => {
      await invalidateHouseholdSurfaceQueries(queryClient)
    },
  })
}

export const useHouseholdOverviewQueries = (
  households: HouseholdDTO[],
  params: AnalyticsOverviewScopeParams,
) =>
  useQueries({
    queries: households.map((household) =>
      analyticsOverviewQueryOptions(
        withHouseholdAnalyticsParams(household.id, params),
      ),
    ),
  })

export const useHouseholdBudgetQueries = (
  households: HouseholdDTO[],
  period: string | null,
) =>
  useQueries({
    queries: households.map(
      (household) =>
        ({
          ...budgetListQueryOptions(household.id, period ?? 'unknown'),
          enabled: Boolean(period),
        }) as ReturnType<typeof budgetListQueryOptions> & { enabled: boolean },
    ),
  })

export const useHouseholdMemberQueries = (households: HouseholdDTO[]) =>
  useQueries({
    queries: households.map((household) =>
      householdMembersQueryOptions(household.id),
    ),
  })
