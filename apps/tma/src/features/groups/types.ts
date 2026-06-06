import type { HouseholdDTO } from '@/features/home/types'

export type ExpenseGroupDTO = {
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

export type CreateExpenseGroupRequest = {
  householdId?: string
  name: string
  description?: string
  startDate?: number
  endDate?: number
  eventBudget?: number
}

export type ListExpenseGroupsResponse = {
  items: ExpenseGroupDTO[]
}

export type MemberContributionDTO = {
  userId: string
  displayName: string | null
  totalSpendMinor: number
  expenseCount: number
}

export type GroupSummaryDTO = {
  group: ExpenseGroupDTO
  totalSpendMinor: number
  expenseCount: number
  budgetRemainingMinor: number | null
  memberContributions: MemberContributionDTO[]
}

export type GroupListItem = {
  group: ExpenseGroupDTO
  household: HouseholdDTO | null
}
