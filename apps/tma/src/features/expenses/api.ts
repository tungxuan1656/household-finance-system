import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import type { CategoryKey, ExpenseDTO, SourceKey } from '@/features/home/types'
import { deleteRequest, get, patch, post } from '@/lib/api/client'
import { notification } from '@/lib/telegram/haptics'

export interface CreateExpenseRequest {
  amount: number
  categoryKey: CategoryKey
  sourceKey: SourceKey
  title: string
  occurredAt: number
  note?: string
  householdId?: string
  groupIds?: string[]
}

export interface UpdateExpenseRequest {
  title?: string
  amount?: number
  occurredAt?: number
  note?: string | null
  categoryKey?: CategoryKey
  sourceKey?: SourceKey
  householdId?: string | null
  groupIds?: string[]
}

const getExpense = (id: string) => get<ExpenseDTO>(`/expenses/${id}`)

const createExpense = (payload: CreateExpenseRequest) =>
  post<ExpenseDTO>('/expenses', payload)

const updateExpense = (id: string, payload: UpdateExpenseRequest) =>
  patch<ExpenseDTO>(`/expenses/${id}`, payload)

const deleteExpense = (id: string) =>
  deleteRequest<{ success: boolean }>(`/expenses/${id}`)

export const EXPENSE_DETAILS_KEYS = {
  all: ['expense-details'] as const,
  detail: (id: string) => [...EXPENSE_DETAILS_KEYS.all, id] as const,
}

const invalidateExpenseSurfaces = async (
  queryClient: ReturnType<typeof useQueryClient>,
) => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ['expenses'] }),
    queryClient.invalidateQueries({ queryKey: ['expense-details'] }),
    queryClient.invalidateQueries({ queryKey: ['analytics'] }),
    queryClient.invalidateQueries({ queryKey: ['budgets'] }),
    queryClient.invalidateQueries({ queryKey: ['households'] }),
  ])
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

export const useCreateExpenseMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createExpense,
    onSuccess: async (expense) => {
      queryClient.setQueryData(EXPENSE_DETAILS_KEYS.detail(expense.id), expense)
      await invalidateExpenseSurfaces(queryClient)
    },
  })
}

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
      queryClient.invalidateQueries({
        queryKey: EXPENSE_DETAILS_KEYS.detail(variables.id),
      })

      await invalidateExpenseSurfaces(queryClient)
    },
  })
}

export const useDeleteExpenseMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteExpense(id),
    onSuccess: async () => {
      await invalidateExpenseSurfaces(queryClient)
    },
    onError: (error) => {
      console.error(error)
      notification('error')
    },
  })
}
