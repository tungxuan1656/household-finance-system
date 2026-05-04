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

export type CreateBudgetResponse = BudgetDTO
export type UpdateBudgetResponse = BudgetDTO

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
