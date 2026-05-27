import type { CategoryKey, SourceKey } from '@/types/reference-data'

export type ExpenseDTO = {
  id: string
  amountMinor: number
  currencyCode: string
  categoryKey: CategoryKey
  sourceKey: SourceKey
  title: string
  occurredAt: number
  note: string | null
  householdId: string | null
  spentByUserId: string
  groupIds?: string[]
  createdAt: number
  updatedAt: number
}

export type CreateExpenseRequest = {
  amount: number
  categoryKey: CategoryKey
  sourceKey: SourceKey
  title: string
  occurredAt: number
  note?: string
  householdId?: string
  groupIds?: string[]
}

export type UpdateExpenseRequest = {
  amount?: number
  categoryKey?: CategoryKey
  sourceKey?: SourceKey
  title?: string
  occurredAt?: number
  note?: string
  householdId?: string | null
  groupIds?: string[]
}

// The API client unwraps the envelope, so the response type is just ExpenseDTO
export type CreateExpenseResponse = ExpenseDTO

export type UpdateExpenseResponse = ExpenseDTO

export type DeleteExpenseResponse = {
  deleted: true
}

export type RestoreExpenseResponse = ExpenseDTO

export type ExpenseListParams = {
  cursor?: string
  limit?: number
  household_id?: string
  date_from?: number
  date_to?: number
  category_key?: string
  group_id?: string
  query?: string
  amount_min?: number
  amount_max?: number
  spent_by_user_id?: string
  sort?: 'occurred_at_desc' | 'amount_desc'
}

export type ExpenseListResponse = {
  items: ExpenseDTO[]
  nextCursor: string | null
}

export type ExpenseSummaryResponse = {
  totalSpendMinor: number
  expenseCount: number
  currencyCode: string
}

export type UpdateExpenseMutationInput = {
  id: string
  payload: UpdateExpenseRequest
}
