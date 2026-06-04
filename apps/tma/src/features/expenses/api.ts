import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import type { CategoryKey, ExpenseDTO, SourceKey } from '@/features/home/types'
import { deleteRequest, get, patch } from '@/lib/api/client'

export interface UpdateExpenseRequest {
  title?: string
  amount?: number
  occurredAt?: number
  note?: string | null
  categoryKey?: CategoryKey
  sourceKey?: SourceKey
  householdId?: string | null
}

const getExpense = (id: string) => get<ExpenseDTO>(`/expenses/${id}`)

const updateExpense = (id: string, payload: UpdateExpenseRequest) =>
  patch<ExpenseDTO>(`/expenses/${id}`, payload)

const deleteExpense = (id: string) =>
  deleteRequest<{ success: boolean }>(`/expenses/${id}`)

export const EXPENSE_DETAILS_KEYS = {
  all: ['expense-details'] as const,
  detail: (id: string) => [...EXPENSE_DETAILS_KEYS.all, id] as const,
}

export const expenseDetailQueryOptions = (id: string) =>
  queryOptions({
    queryKey: EXPENSE_DETAILS_KEYS.detail(id),
    queryFn: () => getExpense(id),
  })

export const useExpenseDetailQuery = (
  id: string,
  options?: { enabled?: boolean },
) =>
  useQuery({
    ...expenseDetailQueryOptions(id),
    enabled: options?.enabled ?? true,
  })

export const useUpdateExpenseMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: UpdateExpenseRequest
    }) => updateExpense(id, payload),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: EXPENSE_DETAILS_KEYS.detail(variables.id),
        }),
        queryClient.invalidateQueries({ queryKey: ['expenses'] }),
        queryClient.invalidateQueries({ queryKey: ['analytics'] }),
        queryClient.invalidateQueries({ queryKey: ['budgets'] }),
      ])
    },
  })
}

export const useDeleteExpenseMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteExpense(id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['expenses'] }),
        queryClient.invalidateQueries({ queryKey: ['analytics'] }),
        queryClient.invalidateQueries({ queryKey: ['budgets'] }),
      ])
    },
  })
}
