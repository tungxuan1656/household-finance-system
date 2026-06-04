import { describe, expect, it } from 'vitest'

import {
  getBudgetProgress,
  getCategoryPresentation,
  getComparisonLabel,
  getHouseholdBudgetLabel,
} from '@/features/home/presentation'

describe('home presentation helpers', () => {
  it('builds category accents from reference colors when available', () => {
    expect(
      getCategoryPresentation('food', [
        {
          color: '#3f7cff',
          iconUrl: 'https://example.com/food.svg',
          key: 'food',
          kind: 'expense',
        },
      ]),
    ).toEqual({
      accent: {
        background: 'rgba(63, 124, 255, 0.14)',
        foreground: '#3f7cff',
      },
      label: 'Ăn uống',
      symbol: 'AU',
    })
  })

  it('reports remaining or exceeded household budget truthfully', () => {
    const budget = {
      categoryLimits: [],
      createdAt: 0,
      createdByUserId: 'user-1',
      currencyCode: 'USD',
      householdId: 'household-1',
      id: 'budget-1',
      period: '2026-06',
      totalLimitMinor: 10_000,
      updatedAt: 0,
    }

    expect(getBudgetProgress(8_500, budget)).toEqual({
      budgetLimitMinor: 10_000,
      isOverBudget: false,
      percentUsed: 85,
      remainingMinor: 1_500,
    })

    expect(getHouseholdBudgetLabel(8_500, budget)).toBe('Còn 15%')

    expect(getHouseholdBudgetLabel(12_000, budget)).toBe('Vượt 20%')
  })

  it('formats comparison labels with clear fallbacks', () => {
    expect(getComparisonLabel(undefined, 3)).toBe('3 khoản')

    expect(
      getComparisonLabel(
        {
          currencyCode: 'USD',
          currentPeriod: {
            expenseCount: 4,
            period: '2026-06',
            totalSpendMinor: 12_000,
          },
          householdId: 'household-1',
          previousPeriod: {
            expenseCount: 2,
            period: '2026-05',
            totalSpendMinor: 8_000,
          },
          topCategoryDeltas: [],
          totalDeltaPercent: 50,
          totalDeltaSpendMinor: 4_000,
        },
        4,
      ),
    ).toBe('+50% so với tháng trước')
  })
})
