import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import type { ReplaceExpenseGroupsRequest } from '@/features/groups/types/group'

import {
  createExpense,
  deleteExpense as deleteExpenseApi,
  getExpenseDetail,
  getExpenseSummary,
  listExpenses,
  replaceExpenseGroups,
  restoreExpense,
  updateExpense,
} from '../api/expense'
import type {
  CreateExpenseRequest,
  CreateExpenseResponse,
  DeleteExpenseResponse,
  ExpenseDTO,
  ExpenseListParams,
  ExpenseListResponse,
  ExpenseSummaryResponse,
  RestoreExpenseResponse,
  UpdateExpenseMutationInput,
  UpdateExpenseResponse,
} from '../types/expense'

export const EXPENSE_KEYS = {
  all: ['expenses'] as const,
  lists: () => [...EXPENSE_KEYS.all, 'list'] as const,
  list: (filters?: ExpenseListParams) =>
    [...EXPENSE_KEYS.lists(), filters].filter(
      (x) => x != null,
    ) as unknown as readonly unknown[],
  summary: (filters?: ExpenseListParams) =>
    [...EXPENSE_KEYS.all, 'summary', filters].filter(
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

export const useUpdateExpenseMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<UpdateExpenseResponse, Error, UpdateExpenseMutationInput>({
    mutationFn: updateExpense,
    onSuccess: (expense) => {
      queryClient.setQueryData(EXPENSE_KEYS.detail(expense.id), expense)
      queryClient.invalidateQueries({ queryKey: EXPENSE_KEYS.all })
    },
  })
}

export const useDeleteExpenseMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<DeleteExpenseResponse, Error, string>({
    mutationFn: deleteExpenseApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXPENSE_KEYS.all })
    },
  })
}

export const useRestoreExpenseMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<RestoreExpenseResponse, Error, string>({
    mutationFn: restoreExpense,
    onSuccess: (expense) => {
      queryClient.setQueryData(EXPENSE_KEYS.detail(expense.id), expense)
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

export const useExpenseSummaryQuery = (params?: ExpenseListParams) => {
  return useQuery<ExpenseSummaryResponse, Error>({
    queryKey: EXPENSE_KEYS.summary(params),
    queryFn: () => getExpenseSummary(params),
  })
}

export const useExpenseDetailQuery = (id: string | undefined) => {
  return useQuery<ExpenseDTO, Error>({
    queryKey: EXPENSE_KEYS.detail(id!),
    queryFn: () => getExpenseDetail(id!),
    enabled: !!id,
  })
}

export const useReplaceExpenseGroupsMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<
    ExpenseDTO,
    Error,
    { expenseId: string; payload: ReplaceExpenseGroupsRequest }
  >({
    mutationFn: ({ expenseId, payload }) =>
      replaceExpenseGroups(expenseId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXPENSE_KEYS.all })
      queryClient.invalidateQueries({ queryKey: ['groups'] })
    },
  })
}
