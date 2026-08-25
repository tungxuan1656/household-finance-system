import { useMutation } from '@tanstack/react-query'

import { PARSE_TIMEOUT_MS, post } from '@/lib/api/client'

// Mirror of worker's MAX_PARSE_TEXT_LENGTH in contracts/expense-parse-schemas
export const MAX_PARSE_TEXT_LENGTH = 4000

export interface ParsedExpenseItem {
  amount: number
  categoryKey: string
  sourceKey: string
  title: string
  occurredAt: string // YYYY-MM-DD
}

export interface ParseExpensesResponse {
  expenses: ParsedExpenseItem[]
  droppedCount?: number
  message?: string
}

export interface ParseExpensesPayload {
  text: string
  defaultOccurredAt: string
}

export const parseExpenses = (payload: ParseExpensesPayload) =>
  post<ParseExpensesResponse>('/expenses/parse', payload, {
    timeoutMs: PARSE_TIMEOUT_MS,
  })

export const useParseExpensesMutation = () =>
  useMutation({
    mutationFn: parseExpenses,
    retry: false,
  })
