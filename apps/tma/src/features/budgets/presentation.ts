import type { HouseholdDTO } from '@/features/home/types'

import type {
  BudgetDTO,
  BudgetScope,
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

export const getBudgetScopeLabel = (
  scope: BudgetScope,
  household?: HouseholdDTO,
): string => {
  if (scope === 'personal') return 'Cá nhân'
  if (scope === 'household') return household?.name ?? 'Household'

  return 'Danh mục'
}

export type BudgetMutationFormValues = {
  currencyCode?: string
  householdId?: string
  mode: 'create' | 'edit'
  period: string
  scope: BudgetScope
  totalLimitMinor: number
}

export const buildBudgetMutationRequest = ({
  currencyCode,
  householdId,
  mode,
  period,
  scope,
  totalLimitMinor,
}: BudgetMutationFormValues): CreateBudgetRequest | UpdateBudgetRequest => {
  if (mode === 'create') {
    if (scope === 'category') {
      throw new Error('Ngân sách danh mục chưa được hỗ trợ.')
    }

    if (scope === 'personal') {
      if (!currencyCode || !/^[A-Z]{3}$/.test(currencyCode)) {
        throw new Error(
          'Mã tiền tệ không hợp lệ. Vui lòng nhập 3 ký tự in hoa (ví dụ: VND).',
        )
      }

      return {
        scope: 'personal',
        period,
        totalLimit: totalLimitMinor,
        currencyCode,
      }
    }

    if (!householdId) {
      throw new Error('Household ID là bắt buộc cho ngân sách household.')
    }

    return {
      scope: 'household',
      householdId,
      period,
      totalLimit: totalLimitMinor,
    }
  }

  return {
    totalLimit: totalLimitMinor,
  }
}
