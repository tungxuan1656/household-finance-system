export type BudgetCategoryLimitDTO = {
  categoryKey: string
  limitMinor: number
}

export type BudgetDTO = {
  id: string
  householdId: string
  period: string
  totalLimitMinor: number
  currencyCode: string
  categoryLimits: BudgetCategoryLimitDTO[]
  createdByUserId: string
  createdAt: number
  updatedAt: number
}

export type BudgetTotalStatus = 'ok' | 'warning' | 'exceeded'

export type BudgetCategoryStatus = {
  categoryKey: string
  plannedLimitMinor: number
  actualSpendMinor: number
  remainingMinor: number
  percentUsed: number
  status: BudgetTotalStatus
}

export type BudgetStatusDTO = {
  budgetId: string
  householdId: string
  period: string
  currencyCode: string
  totalPlannedMinor: number
  totalActualMinor: number
  totalRemainingMinor: number
  totalPercentUsed: number
  totalStatus: BudgetTotalStatus
  categoryStatuses: BudgetCategoryStatus[]
}

export type CreateBudgetResponse = BudgetDTO
export type UpdateBudgetResponse = BudgetDTO
export type GetBudgetStatusResponse = BudgetStatusDTO

export type ListBudgetsResponse = {
  items: BudgetDTO[]
}

export type CreateBudgetRequest = {
  householdId: string
  period: string
  totalLimit: number
  categoryLimits?: BudgetCategoryLimitDTO[]
}

export type UpdateBudgetRequest = {
  totalLimit?: number
  categoryLimits?: BudgetCategoryLimitDTO[]
}

export type UpdateBudgetMutationInput = {
  id: string
  payload: UpdateBudgetRequest
}
