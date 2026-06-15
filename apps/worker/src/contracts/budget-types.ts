import type { z } from 'zod'

import type {
  budgetListQuerySchema,
  budgetPathParamsSchema,
  createBudgetBodySchema,
  updateBudgetRequestSchema,
} from './budget-schemas'

export type CreateBudgetBody = z.output<
  ReturnType<typeof createBudgetBodySchema>
>

export type UpdateBudgetRequest = z.output<
  ReturnType<typeof updateBudgetRequestSchema>
>

export type BudgetPathParams = z.output<
  ReturnType<typeof budgetPathParamsSchema>
>

export type BudgetListQuery = z.output<ReturnType<typeof budgetListQuerySchema>>

export type BudgetScope = 'household' | 'personal'

export interface BudgetCategoryLimitDTO {
  categoryKey: string
  limitMinor: number
}

export interface BudgetDTO {
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

export type BudgetThresholdStatus = 'ok' | 'warning' | 'exceeded'

export interface BudgetCategoryStatusDTO {
  categoryKey: string
  plannedLimitMinor: number
  actualSpendMinor: number
  remainingMinor: number
  percentUsed: number
  status: BudgetThresholdStatus
}

export interface BudgetStatusDTO {
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

export type CreateBudgetResponse = BudgetDTO
export type UpdateBudgetResponse = BudgetDTO
export interface DeleteBudgetResponse {
  deleted: true
}
export type GetBudgetStatusResponse = BudgetStatusDTO

export interface ListBudgetsResponse {
  items: BudgetDTO[]
}
