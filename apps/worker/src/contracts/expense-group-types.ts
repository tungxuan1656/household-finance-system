import type { z } from 'zod'

import type {
  createExpenseGroupRequestSchema,
  expenseGroupPathParamsSchema,
  updateExpenseGroupRequestSchema,
} from './expense-group-schemas'

export type CreateExpenseGroupRequest = z.output<
  ReturnType<typeof createExpenseGroupRequestSchema>
>

export type UpdateExpenseGroupRequest = z.output<
  ReturnType<typeof updateExpenseGroupRequestSchema>
>

export type ExpenseGroupPathParams = z.output<
  ReturnType<typeof expenseGroupPathParamsSchema>
>

export interface ExpenseGroupDTO {
  id: string
  name: string
  description: string | null
  status: 'active' | 'archived'
  startDate: number | null
  endDate: number | null
  eventBudgetMinor: number | null
  totalSpendMinor: number
  householdId: string
  createdByUserId: string
  createdAt: number
  updatedAt: number
}

export type CreateExpenseGroupResponse = ExpenseGroupDTO

export type UpdateExpenseGroupResponse = ExpenseGroupDTO

export interface ArchiveExpenseGroupResponse {
  archived: true
}

export interface ListExpenseGroupsResponse {
  items: ExpenseGroupDTO[]
}
