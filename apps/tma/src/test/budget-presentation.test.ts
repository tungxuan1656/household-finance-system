import { describe, expect, it } from 'vitest'

import {
  buildBudgetMutationRequest,
  getBudgetProgress,
  getBudgetStatusCopy,
  getLatestBudget,
  isValidBudgetPeriod,
  parseBudgetAmountInputToMinor,
} from '@/features/budgets/presentation'
import type { BudgetDTO } from '@/features/budgets/types'

const t = (key: string, options?: Record<string, unknown>): string => {
  const map: Record<string, string> = {
    'budgets.statusExceeded': 'Đã vượt ngân sách',
    'budgets.statusWarning': 'Sắp chạm ngưỡng',
    'budgets.statusSafe': 'Đang an toàn',
  }
  let result = map[key] ?? key
  if (options) {
    for (const [k, v] of Object.entries(options)) {
      result = result.replace(`{{${k}}}`, String(v))
    }
  }

  return result
}

const makeBudget = (overrides: Partial<BudgetDTO>): BudgetDTO => ({
  categoryLimits: [],
  createdAt: 0,
  createdByUserId: 'user-1',
  currencyCode: 'VND',
  householdId: 'household-1',
  id: 'budget-1',
  ownerUserId: null,
  period: '2026-06',
  scope: 'household',
  totalLimitMinor: 1_000_000,
  updatedAt: 0,
  ...overrides,
})

describe('budget presentation helpers', () => {
  it('parses VND input and validates monthly budget periods', () => {
    expect(parseBudgetAmountInputToMinor('3.500.000')).toBe(3_500_000)
    expect(parseBudgetAmountInputToMinor('')).toBeUndefined()
    expect(isValidBudgetPeriod('2026-06')).toBe(true)
    expect(isValidBudgetPeriod('2026-6')).toBe(false)
    expect(isValidBudgetPeriod('2026-13')).toBe(false)
  })

  it('normalizes create and update requests from form values', () => {
    expect(
      buildBudgetMutationRequest({
        currencyCode: 'VND',
        householdId: 'household-1',
        mode: 'create',
        period: '2026-06',
        scope: 'household',
        totalLimitMinor: 2_000_000,
      }),
    ).toEqual({
      scope: 'household',
      householdId: 'household-1',
      period: '2026-06',
      totalLimit: 2_000_000,
    })

    expect(
      buildBudgetMutationRequest({
        currencyCode: 'VND',
        householdId: 'household-1',
        mode: 'edit',
        period: '2026-06',
        scope: 'household',
        totalLimitMinor: 2_000_000,
      }),
    ).toEqual({
      totalLimit: 2_000_000,
    })

    expect(
      buildBudgetMutationRequest({
        currencyCode: 'VND',
        mode: 'create',
        period: '2026-06',
        scope: 'personal',
        totalLimitMinor: 1_000_000,
      }),
    ).toEqual({
      scope: 'personal',
      period: '2026-06',
      totalLimit: 1_000_000,
      currencyCode: 'VND',
    })
  })

  it('throws BudgetMutationError for invalid personal budget currency code', () => {
    expect(() =>
      buildBudgetMutationRequest({
        mode: 'create',
        period: '2026-06',
        scope: 'personal',
        totalLimitMinor: 1_000_000,
      }),
    ).toThrow('invalidCurrency')

    expect(() =>
      buildBudgetMutationRequest({
        currencyCode: 'vn',
        mode: 'create',
        period: '2026-06',
        scope: 'personal',
        totalLimitMinor: 1_000_000,
      }),
    ).toThrow('invalidCurrency')
  })

  it('derives status copy, latest budget, and clamped progress', () => {
    expect(getBudgetStatusCopy('warning', t)).toEqual({
      label: 'Sắp chạm ngưỡng',
      tone: 'warning',
    })

    expect(getBudgetProgress(1_250_000, 1_000_000)).toEqual({
      isExceeded: true,
      percentUsed: 125,
      widthPercent: 100,
    })

    expect(
      getLatestBudget([
        makeBudget({ id: 'old', period: '2026-05' }),
        makeBudget({ id: 'new', period: '2026-06' }),
      ])?.id,
    ).toBe('new')
  })
})
