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
        categoryLimits: [
          { categoryKey: 'food', limitMinor: 500_000 },
          { categoryKey: 'transport', limitMinor: 0 },
        ],
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
      categoryLimits: [{ categoryKey: 'food', limitMinor: 500_000 }],
    })

    expect(
      buildBudgetMutationRequest({
        categoryLimits: [],
        currencyCode: 'VND',
        householdId: 'household-1',
        mode: 'edit',
        period: '2026-06',
        scope: 'household',
        totalLimitMinor: 2_000_000,
      }),
    ).toEqual({
      totalLimit: 2_000_000,
      categoryLimits: [],
    })

    expect(
      buildBudgetMutationRequest({
        categoryLimits: [],
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

  it('throws for invalid personal budget currency code', () => {
    expect(() =>
      buildBudgetMutationRequest({
        categoryLimits: [],
        mode: 'create',
        period: '2026-06',
        scope: 'personal',
        totalLimitMinor: 1_000_000,
      }),
    ).toThrow('Mã tiền tệ không hợp lệ')

    expect(() =>
      buildBudgetMutationRequest({
        categoryLimits: [],
        currencyCode: 'vn',
        mode: 'create',
        period: '2026-06',
        scope: 'personal',
        totalLimitMinor: 1_000_000,
      }),
    ).toThrow('Mã tiền tệ không hợp lệ')
  })

  it('derives status copy, latest budget, and clamped progress', () => {
    expect(getBudgetStatusCopy('warning')).toEqual({
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
