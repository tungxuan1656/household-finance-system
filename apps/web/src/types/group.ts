export type ExpenseGroupDTO = {
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

export type CreateExpenseGroupRequest = {
  householdId: string
  name: string
  description?: string
  startDate?: number
  endDate?: number
  eventBudget?: number
}

export type UpdateExpenseGroupRequest = {
  name?: string
  description?: string
  startDate?: number
  endDate?: number
  eventBudget?: number
}

export type ListExpenseGroupsResponse = {
  items: ExpenseGroupDTO[]
}

export type ArchiveExpenseGroupResponse = {
  archived: true
}

export type UpdateExpenseGroupMutationInput = {
  id: string
  payload: UpdateExpenseGroupRequest
}
