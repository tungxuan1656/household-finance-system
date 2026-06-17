import type { HouseholdDTO } from '@/features/home/types'

import type {
  BudgetDTO,
  BudgetScope,
  BudgetThresholdStatus,
  CreateBudgetRequest,
  UpdateBudgetRequest,
} from './types'

export class BudgetMutationError extends Error {
  constructor(
    public code:
      | 'categoryNotSupported'
      | 'invalidCurrency'
      | 'householdRequired',
  ) {
    super(code)
    this.name = 'BudgetMutationError'
  }
}

const PERIOD_PATTERN = /^\d{4}-(?:0[1-9]|1[0-2])$/

export const isValidBudgetPeriod = (value: string): boolean =>
  PERIOD_PATTERN.test(value)

export const parseBudgetAmountInputToMinor = (
  value: string,
): number | undefined => {
  const digits = value.replaceAll(/\D/g, '')

  return digits.length > 0 ? Number(digits) : undefined
}

export const formatBudgetPeriodLabel = (
  period: string,
  t: (key: string, options?: Record<string, unknown>) => string,
): string => {
  const match = /^(\d{4})-(\d{2})$/.exec(period)

  if (!match) return period

  return t('period.monthPeriod', { month: match[2], year: match[1] })
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

export const getBudgetStatusCopy = (
  status: BudgetThresholdStatus,
  t: (key: string, options?: Record<string, unknown>) => string,
) => {
  if (status === 'exceeded') {
    return {
      label: t('budgets.statusExceeded'),
      tone: 'warning' as const,
    }
  }

  if (status === 'warning') {
    return {
      label: t('budgets.statusWarning'),
      tone: 'warning' as const,
    }
  }

  return {
    label: t('budgets.statusSafe'),
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
  household: HouseholdDTO | undefined,
  t: (key: string, options?: Record<string, unknown>) => string,
): string => {
  if (scope === 'personal') return t('budgets.scopePersonal')
  if (scope === 'household')
    return household?.name ?? t('budgets.scopeHouseholdFallback')

  return t('budgets.scopeCategory')
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
      throw new BudgetMutationError('categoryNotSupported')
    }

    if (scope === 'personal') {
      if (!currencyCode || !/^[A-Z]{3}$/.test(currencyCode)) {
        throw new BudgetMutationError('invalidCurrency')
      }

      return {
        scope: 'personal',
        period,
        totalLimit: totalLimitMinor,
        currencyCode,
      }
    }

    if (!householdId) {
      throw new BudgetMutationError('householdRequired')
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
