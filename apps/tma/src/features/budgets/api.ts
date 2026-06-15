import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { deleteRequest, get, patch, post } from '@/lib/api/client'

import type {
  BudgetDTO,
  CreateBudgetRequest,
  DeleteBudgetResponse,
  ListBudgetsParams,
  ListBudgetsResponse,
  UpdateBudgetMutationInput,
} from './types'
import type { BudgetStatusDTO } from './types'

const listBudgets = (params: ListBudgetsParams) =>
  get<ListBudgetsResponse>('/budgets', {
    params: {
      household_id: params.householdId,
      scope: params.scope,
      period: params.period,
    },
  })

const createBudget = (payload: CreateBudgetRequest) =>
  post<BudgetDTO>('/budgets', payload)

const getBudget = (budgetId: string) => get<BudgetDTO>(`/budgets/${budgetId}`)

const getBudgetStatus = (budgetId: string) =>
  get<BudgetStatusDTO>(`/budgets/${budgetId}/status`)

const updateBudget = ({ id, payload }: UpdateBudgetMutationInput) =>
  patch<BudgetDTO>(`/budgets/${id}`, payload)

const deleteBudget = (budgetId: string) =>
  deleteRequest<DeleteBudgetResponse>(`/budgets/${budgetId}`)

export const BUDGET_KEYS = {
  all: ['budgets'] as const,
  list: (params: ListBudgetsParams) =>
    [...BUDGET_KEYS.all, 'list', params] as const,
  detail: (budgetId: string) =>
    [...BUDGET_KEYS.all, 'detail', budgetId] as const,
  status: (budgetId: string) =>
    [...BUDGET_KEYS.all, 'status', budgetId] as const,
}

export const budgetListQueryOptions = (params: ListBudgetsParams) =>
  queryOptions({
    queryKey: BUDGET_KEYS.list(params),
    queryFn: () => listBudgets(params),
  })

export const budgetDetailQueryOptions = (budgetId: string) =>
  queryOptions({
    queryKey: BUDGET_KEYS.detail(budgetId),
    queryFn: () => getBudget(budgetId),
  })

export const budgetStatusQueryOptions = (budgetId: string) =>
  queryOptions({
    queryKey: BUDGET_KEYS.status(budgetId),
    queryFn: () => getBudgetStatus(budgetId),
  })

export const useBudgetListQuery = (params: ListBudgetsParams | undefined) =>
  useQuery({
    ...budgetListQueryOptions(params ?? {}),
    enabled: Boolean(params),
  })

export const useBudgetDetailQuery = (budgetId: string | undefined) =>
  useQuery({
    ...budgetDetailQueryOptions(budgetId ?? 'unknown'),
    enabled: Boolean(budgetId),
  })

export const useBudgetStatusQuery = (budgetId: string | undefined) =>
  useQuery({
    ...budgetStatusQueryOptions(budgetId ?? 'unknown'),
    enabled: Boolean(budgetId),
  })

const invalidateBudgetDependents = async (
  queryClient: ReturnType<typeof useQueryClient>,
) => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: BUDGET_KEYS.all }),
    queryClient.invalidateQueries({ queryKey: ['analytics'] }),
    queryClient.invalidateQueries({ queryKey: ['households'] }),
  ])
}

export const useCreateBudgetMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createBudget,
    onSuccess: async (budget) => {
      queryClient.setQueryData(BUDGET_KEYS.detail(budget.id), budget)
      await invalidateBudgetDependents(queryClient)
    },
  })
}

export const useUpdateBudgetMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateBudget,
    onSuccess: async (budget) => {
      queryClient.setQueryData(BUDGET_KEYS.detail(budget.id), budget)
      await invalidateBudgetDependents(queryClient)
    },
  })
}

export const useDeleteBudgetMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteBudget,
    onSuccess: async () => {
      await invalidateBudgetDependents(queryClient)
    },
  })
}
