import type { CategoryKey } from '@/features/home/types'

export type BudgetScope = 'household' | 'personal' | 'category'

export type BudgetCategoryLimitDTO = {
  categoryKey: CategoryKey
  limitMinor: number
}

export type BudgetDTO = {
  id: string
  scope: BudgetScope
  householdId: string | null
  ownerUserId: string | null
  period: string
  totalLimitMinor: number
  currencyCode: string
  categoryLimits: BudgetCategoryLimitDTO[]
  createdByUserId: string
  createdAt: number
  updatedAt: number
}

export type BudgetThresholdStatus = 'exceeded' | 'ok' | 'warning'

export type BudgetCategoryStatusDTO = {
  categoryKey: CategoryKey
  plannedLimitMinor: number
  actualSpendMinor: number
  remainingMinor: number
  percentUsed: number
  status: BudgetThresholdStatus
}

export type BudgetStatusDTO = {
  budgetId: string
  scope: BudgetScope
  householdId: string | null
  ownerUserId: string | null
  period: string
  currencyCode: string
  totalPlannedMinor: number
  totalActualMinor: number
  totalRemainingMinor: number
  totalPercentUsed: number
  totalStatus: BudgetThresholdStatus
  categoryStatuses: BudgetCategoryStatusDTO[]
}

export type ListBudgetsResponse = {
  items: BudgetDTO[]
}

export type DeleteBudgetResponse = {
  deleted: true
}

export type CreateBudgetRequest =
  | {
      scope: 'household'
      householdId: string
      period: string
      totalLimit: number
      categoryLimits?: BudgetCategoryLimitDTO[]
    }
  | {
      scope: 'personal'
      period: string
      totalLimit: number
      currencyCode: string
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

export type ListBudgetsParams = {
  householdId?: string
  scope?: 'household' | 'personal'
  period?: string
}
