import type { CategoryKey, SourceKey } from './reference-data'

export type ExpenseVisibility = 'private' | 'household'

export type ExpenseDTO = {
  id: string
  amountMinor: number
  currencyCode: string
  categoryKey: CategoryKey
  sourceKey: SourceKey
  title: string
  occurredAt: number
  note: string | null
  visibility: ExpenseVisibility
  householdId: string | null
  payerUserId: string | null
  groupIds?: string[]
  createdByUserId: string
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
  visibility: ExpenseVisibility
  householdId?: string
  payerUserId?: string
  groupIds?: string[]
}

// The API client unwraps the envelope, so the response type is just ExpenseDTO
export type CreateExpenseResponse = ExpenseDTO

export type UpdateExpenseRequest = CreateExpenseRequest

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
  payer_id?: string
  visibility?: ExpenseVisibility
  group_id?: string
  query?: string
  amount_min?: number
  amount_max?: number
  creator_id?: string
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
