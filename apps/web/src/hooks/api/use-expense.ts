import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { createExpense, getExpenseDetail, listExpenses } from '@/api/expense'
import type {
  CreateExpenseRequest,
  CreateExpenseResponse,
  ExpenseListParams,
  ExpenseListResponse,
} from '@/types/expense'
import type { ExpenseDTO } from '@/types/expense'

export const EXPENSE_KEYS = {
  all: ['expenses'] as const,
  lists: () => [...EXPENSE_KEYS.all, 'list'] as const,
  list: (filters?: ExpenseListParams) =>
    [...EXPENSE_KEYS.lists(), filters].filter(
      (x) => x != null,
    ) as unknown as readonly unknown[],
  detail: (id: string) => [...EXPENSE_KEYS.all, id] as const,
}

export const useCreateExpenseMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<CreateExpenseResponse, Error, CreateExpenseRequest>({
    mutationFn: createExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXPENSE_KEYS.all })
    },
  })
}

export const useInfiniteExpenseListQuery = (params?: ExpenseListParams) => {
  return useInfiniteQuery<ExpenseListResponse, Error>({
    queryKey: EXPENSE_KEYS.list(params),
    queryFn: ({ pageParam }) =>
      listExpenses({ ...params, cursor: pageParam as string | undefined }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  })
}

export const useExpenseDetailQuery = (id: string | undefined) => {
  return useQuery<ExpenseDTO, Error>({
    queryKey: EXPENSE_KEYS.detail(id!),
    queryFn: () => getExpenseDetail(id!),
    enabled: !!id,
  })
}
