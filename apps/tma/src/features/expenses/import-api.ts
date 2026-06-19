import { useMutation } from '@tanstack/react-query'

import { post } from '@/lib/api/client'

export interface ParsedExpenseItem {
  amount: number
  categoryKey: string
  sourceKey: string
  title: string
  occurredAt: string // YYYY-MM-DD
}

export interface ParseExpensesResponse {
  expenses: ParsedExpenseItem[]
  message?: string
}

export interface ParseExpensesPayload {
  text: string
  defaultOccurredAt: string
}

export const parseExpenses = (payload: ParseExpensesPayload) =>
  post<ParseExpensesResponse>('/expenses/parse', payload)

export const useParseExpensesMutation = () =>
  useMutation({
    mutationFn: parseExpenses,
  })
