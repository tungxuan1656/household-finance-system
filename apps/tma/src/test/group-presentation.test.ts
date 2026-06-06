import { describe, expect, it } from 'vitest'

import {
  getGroupBudgetLabel,
  getGroupContextLabel,
  getGroupDateRangeLabel,
  getGroupProgress,
  parseBudgetInputToMinor,
} from '@/features/groups/presentation'

describe('group presentation helpers', () => {
  it('formats context, budget, date range, and progress labels', () => {
    expect(
      getGroupContextLabel({
        group: {
          createdAt: 0,
          createdByUserId: 'user-1',
          description: null,
          endDate: Date.UTC(2026, 5, 30),
          eventBudgetMinor: 1_000_000,
          householdId: 'household-1',
          id: 'group-1',
          name: 'Đà Lạt',
          startDate: Date.UTC(2026, 5, 1),
          status: 'active',
          totalSpendMinor: 250_000,
          updatedAt: 0,
        },
        household: {
          avatarUrl: null,
          createdAt: 0,
          defaultCurrencyCode: 'VND',
          id: 'household-1',
          name: 'Gia đình',
          role: 'admin',
          slug: 'gia-dinh',
          timezone: 'Asia/Ho_Chi_Minh',
        },
      }),
    ).toBe('Gia đình')

    expect(getGroupBudgetLabel({ eventBudgetMinor: 1_000_000 })).toBe(
      '1.000.000 ₫',
    )

    expect(
      getGroupDateRangeLabel({
        endDate: Date.UTC(2026, 5, 30),
        startDate: Date.UTC(2026, 5, 1),
      }),
    ).toBe('01/06/26 - 30/06/26')

    expect(getGroupProgress(250_000, 1_000_000)).toEqual({
      isOverBudget: false,
      percentUsed: 25,
      widthPercent: 25,
    })
  })

  it('parses formatted VND budget input as minor units', () => {
    expect(parseBudgetInputToMinor('3.000.000')).toBe(3_000_000)
    expect(parseBudgetInputToMinor('')).toBeUndefined()
  })
})
