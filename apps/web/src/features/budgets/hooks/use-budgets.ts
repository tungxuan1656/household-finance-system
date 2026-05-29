import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createBudget,
  deleteBudget,
  getBudget,
  getBudgetStatus,
  listBudgets,
  updateBudget,
} from '@/api/budget'
import type {
  BudgetDTO,
  CreateBudgetRequest,
  DeleteBudgetResponse,
  GetBudgetStatusResponse,
  ListBudgetsResponse,
  UpdateBudgetMutationInput,
} from '@/features/budgets/types/budget'
import { ANALYTICS_KEYS } from '@/features/insights/api/use-analytics'

export const BUDGET_KEYS = {
  all: ['budgets'] as const,
  lists: () => [...BUDGET_KEYS.all, 'list'] as const,
  list: (householdId: string, period?: string) =>
    [...BUDGET_KEYS.lists(), householdId, period].filter(
      (x) => x != null,
    ) as unknown as readonly unknown[],
  detail: (id: string) => [...BUDGET_KEYS.all, id] as const,
  status: (id: string) => [...BUDGET_KEYS.detail(id), 'status'] as const,
}

export const useCreateBudgetMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<BudgetDTO, Error, CreateBudgetRequest>({
    mutationFn: createBudget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUDGET_KEYS.all })
      queryClient.invalidateQueries({ queryKey: ANALYTICS_KEYS.all })
    },
  })
}

export const useUpdateBudgetMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<BudgetDTO, Error, UpdateBudgetMutationInput>({
    mutationFn: updateBudget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUDGET_KEYS.all })
      queryClient.invalidateQueries({ queryKey: ANALYTICS_KEYS.all })
    },
  })
}

export const useDeleteBudgetMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<DeleteBudgetResponse, Error, string>({
    mutationFn: deleteBudget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUDGET_KEYS.all })
      queryClient.invalidateQueries({ queryKey: ANALYTICS_KEYS.all })
    },
  })
}

export const useBudgetListQuery = (
  householdId: string | undefined,
  period?: string,
) => {
  return useQuery<ListBudgetsResponse, Error>({
    queryKey: BUDGET_KEYS.list(householdId ?? 'unknown', period),
    queryFn: () => listBudgets(householdId!, period),
    enabled: !!householdId,
  })
}

export const useBudgetDetailQuery = (id: string | undefined) => {
  return useQuery<BudgetDTO, Error>({
    queryKey: BUDGET_KEYS.detail(id!),
    queryFn: () => getBudget(id!),
    enabled: !!id,
  })
}

export const useBudgetStatusQuery = (id: string | undefined) => {
  return useQuery<GetBudgetStatusResponse, Error>({
    queryKey: BUDGET_KEYS.status(id!),
    queryFn: () => getBudgetStatus(id!),
    enabled: !!id,
  })
}
