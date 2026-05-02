import type { CategoryKey, SourceKey } from './reference-data'

export type ExpenseVisibility = 'private' | 'household'

export type ExpenseDTO = {
  id: string
  amount: number
  categoryKey: CategoryKey
  sourceKey: SourceKey
  title: string
  occurredAt: number
  note: string | null
  visibility: ExpenseVisibility
  householdId: string | null
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

export type CreateExpenseResponse = {
  data: ExpenseDTO
}
