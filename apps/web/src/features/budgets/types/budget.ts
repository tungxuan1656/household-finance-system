import type { TranslationKey } from '@/lib/i18n/i18n-init'
import type { CategoryKey } from '@/types/reference-data'

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

export type BudgetTotalStatus = 'ok' | 'warning' | 'exceeded'

export type BudgetStatusCategoryKey = BudgetCategoryLimitDTO['categoryKey']

export type BudgetStatusErrorMessage = Extract<
  TranslationKey,
  'budgets.status.error.loadFailed'
>

export type BudgetCategoryStatus = {
  categoryKey: BudgetStatusCategoryKey
  plannedLimitMinor: number
  actualSpendMinor: number
  remainingMinor: number
  percentUsed: number
  status: BudgetTotalStatus
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
  totalStatus: BudgetTotalStatus
  categoryStatuses: BudgetCategoryStatus[]
}

export type CreateBudgetResponse = BudgetDTO
export type UpdateBudgetResponse = BudgetDTO
export type DeleteBudgetResponse = {
  deleted: true
}
export type GetBudgetStatusResponse = BudgetStatusDTO

export type ListBudgetsResponse = {
  items: BudgetDTO[]
}

export type CreateBudgetRequest = {
  scope: BudgetScope
  householdId?: string
  period: string
  totalLimit: number
  currencyCode?: string
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
  scope?: Extract<BudgetScope, 'household' | 'personal'>
  period?: string
}
