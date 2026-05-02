import type { CategoryKey, SourceKey } from './reference-data'

export type ExpenseVisibility = 'private' | 'household'

export type ExpenseDTO = {
  id: string
  amountMinor: number
  categoryKey: CategoryKey
  sourceKey: SourceKey
  title: string
  occurredAt: number
  note: string | null
  visibility: ExpenseVisibility
  householdId: string | null
  payerUserId: string
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
}

// The API client unwraps the envelope, so the response type is just ExpenseDTO
export type CreateExpenseResponse = ExpenseDTO
