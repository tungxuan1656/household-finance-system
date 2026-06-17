import { describe, expect, it } from 'vitest'

import {
  formatCurrencyMinor,
  getBudgetProgress,
  getCategoryPresentation,
  getComparisonLabel,
  getHouseholdBudgetLabel,
} from '@/features/home/presentation'

const t = (key: string, options?: Record<string, unknown>): string => {
  const map: Record<string, string> = {
    'categories.food': 'Ăn uống',
    'home.householdBudgetNone': 'Chưa có ngân sách',
    'home.householdBudgetRemaining': 'Còn {{percent}}%',
    'home.householdBudgetOver': 'Vượt {{percent}}%',
    'home.expenseCount': '{{count}} khoản',
    'home.comparisonDelta': '{{delta}}% so với {{period}}',
    'period.granularityMonth': 'tháng trước',
  }
  let result = map[key] ?? key
  if (options) {
    for (const [k, v] of Object.entries(options)) {
      result = result.replace(`{{${k}}}`, String(v))
    }
  }

  return result
}

describe('home presentation helpers', () => {
  it('builds category accents from reference colors when available', () => {
    expect(
      getCategoryPresentation('food', t, [
        {
          color: '#3f7cff',
          iconUrl: 'https://example.com/food.svg',
          key: 'food',
          kind: 'expense',
        },
      ]),
    ).toEqual({
      accent: {
        background: 'rgba(63, 124, 255, 0.1)',
        foreground: '#3f7cff',
      },
      iconUrl: 'https://example.com/food.svg',
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

    expect(getHouseholdBudgetLabel(8_500, budget, t)).toBe('Còn 15%')

    expect(getHouseholdBudgetLabel(12_000, budget, t)).toBe('Vượt 20%')
  })

  it('formats comparison labels with clear fallbacks', () => {
    expect(getComparisonLabel(undefined, 3, 'month', t)).toBe('3 khoản')

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
        'month',
        t,
      ),
    ).toBe('+50% so với tháng trước')
  })

  it('formats minor currency units consistently across repeated calls', () => {
    expect(formatCurrencyMinor(12_345, 'USD')).toBe('123,45\u00a0US$')
    expect(formatCurrencyMinor(12_345, 'USD')).toBe('123,45\u00a0US$')
  })
})
