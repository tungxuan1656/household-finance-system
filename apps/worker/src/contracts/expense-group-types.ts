import type { z } from 'zod'

import type {
  createExpenseGroupRequestSchema,
  expenseGroupHouseholdQuerySchema,
  expenseGroupPathParamsSchema,
  replaceExpenseGroupsRequestSchema,
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

export type ReplaceExpenseGroupsRequest = z.output<
  ReturnType<typeof replaceExpenseGroupsRequestSchema>
>

export type ExpenseGroupHouseholdQuery = z.output<
  ReturnType<typeof expenseGroupHouseholdQuerySchema>
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
  householdId: string | null
  createdByUserId: string
  createdAt: number
  updatedAt: number
}

export interface MemberContributionDTO {
  userId: string
  displayName: string | null
  totalSpendMinor: number
  expenseCount: number
}

export interface GroupSummaryDTO {
  group: ExpenseGroupDTO
  totalSpendMinor: number
  expenseCount: number
  budgetRemainingMinor: number | null
  memberContributions: MemberContributionDTO[]
}

export type CreateExpenseGroupResponse = ExpenseGroupDTO

export type UpdateExpenseGroupResponse = ExpenseGroupDTO

export interface ArchiveExpenseGroupResponse {
  archived: true
}

export interface ListExpenseGroupsResponse {
  items: ExpenseGroupDTO[]
}
