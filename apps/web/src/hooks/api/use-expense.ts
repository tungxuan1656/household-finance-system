import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createExpense } from '@/api/expense'
import type { CreateExpenseRequest, ExpenseDTO } from '@/types/expense'

export const EXPENSE_KEYS = {
  all: ['expenses'] as const,
  detail: (id: string) => [...EXPENSE_KEYS.all, id] as const,
}

export const useCreateExpenseMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<ExpenseDTO, Error, CreateExpenseRequest>({
    mutationFn: createExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXPENSE_KEYS.all })
    },
  })
}
