import type { CategoryKey } from '@/features/home/types'

import type {
  BudgetCategoryLimitDTO,
  BudgetDTO,
  BudgetThresholdStatus,
  CreateBudgetRequest,
  UpdateBudgetRequest,
} from './types'

const PERIOD_PATTERN = /^\d{4}-(?:0[1-9]|1[0-2])$/

export const isValidBudgetPeriod = (value: string): boolean =>
  PERIOD_PATTERN.test(value)

export const parseBudgetAmountInputToMinor = (
  value: string,
): number | undefined => {
  const digits = value.replaceAll(/\D/g, '')

  return digits.length > 0 ? Number(digits) : undefined
}

export const formatBudgetPeriodLabel = (period: string): string => {
  const match = /^(\d{4})-(\d{2})$/.exec(period)

  if (!match) return period

  return `Tháng ${match[2]}/${match[1]}`
}

export const getBudgetProgress = (
  actualMinor: number,
  plannedMinor: number,
) => {
  const percentUsed =
    plannedMinor > 0 ? Math.round((actualMinor / plannedMinor) * 100) : 0

  return {
    isExceeded: actualMinor > plannedMinor,
    percentUsed,
    widthPercent: Math.min(percentUsed, 100),
  }
}

export const getBudgetStatusCopy = (status: BudgetThresholdStatus) => {
  if (status === 'exceeded') {
    return {
      label: 'Đã vượt ngân sách',
      tone: 'warning' as const,
    }
  }

  if (status === 'warning') {
    return {
      label: 'Sắp chạm ngưỡng',
      tone: 'warning' as const,
    }
  }

  return {
    label: 'Đang an toàn',
    tone: 'success' as const,
  }
}

export const getLatestBudget = (budgets: BudgetDTO[]): BudgetDTO | null =>
  budgets.reduce<BudgetDTO | null>(
    (latest, budget) =>
      !latest || budget.period > latest.period ? budget : latest,
    null,
  )

export type BudgetMutationFormValues = {
  categoryLimits: BudgetCategoryLimitDTO[]
  householdId: string
  mode: 'create' | 'edit'
  period: string
  totalLimitMinor: number
}

export const buildBudgetMutationRequest = ({
  categoryLimits,
  householdId,
  mode,
  period,
  totalLimitMinor,
}: BudgetMutationFormValues): CreateBudgetRequest | UpdateBudgetRequest => {
  const activeCategoryLimits = categoryLimits.filter(
    (limit) => limit.limitMinor > 0,
  )

  if (mode === 'create') {
    return {
      householdId,
      period,
      totalLimit: totalLimitMinor,
      ...(activeCategoryLimits.length > 0
        ? { categoryLimits: activeCategoryLimits }
        : {}),
    }
  }

  return {
    totalLimit: totalLimitMinor,
    categoryLimits: activeCategoryLimits,
  }
}

export const buildCategoryLimitMap = (
  limits: BudgetCategoryLimitDTO[],
): Partial<Record<CategoryKey, number>> =>
  Object.fromEntries(
    limits.map((limit) => [limit.categoryKey, limit.limitMinor]),
  ) as Partial<Record<CategoryKey, number>>
