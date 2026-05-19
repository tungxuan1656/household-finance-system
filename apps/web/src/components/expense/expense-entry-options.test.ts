import { describe, expect, it } from 'vitest'

import {
  filterExpenseEntryCategories,
  mergeExpenseEntryGroups,
} from '@/components/expense/expense-entry-options'

describe('expense-entry-options', () => {
  it('filters expense categories only', () => {
    expect(
      filterExpenseEntryCategories([
        { key: 'food', kind: 'expense', iconUrl: '/food.svg', color: '#f00' },
        { key: 'money-in', kind: 'income', iconUrl: '/in.svg', color: '#0f0' },
      ]),
    ).toEqual([
      { key: 'food', kind: 'expense', iconUrl: '/food.svg', color: '#f00' },
    ])
  })

  it('merges groups with household groups overriding duplicate ids', () => {
    expect(
      mergeExpenseEntryGroups(
        [
          {
            id: 'g-1',
            name: 'Personal 1',
            description: null,
            status: 'active',
            startDate: null,
            endDate: null,
            eventBudgetMinor: null,
            totalSpendMinor: 0,
            householdId: null,
            createdByUserId: 'u-1',
            createdAt: 1,
            updatedAt: 1,
          },
          {
            id: 'g-2',
            name: 'Personal 2',
            description: null,
            status: 'active',
            startDate: null,
            endDate: null,
            eventBudgetMinor: null,
            totalSpendMinor: 0,
            householdId: null,
            createdByUserId: 'u-1',
            createdAt: 1,
            updatedAt: 1,
          },
        ],
        [
          {
            id: 'g-2',
            name: 'Household 2',
            description: null,
            status: 'active',
            startDate: null,
            endDate: null,
            eventBudgetMinor: null,
            totalSpendMinor: 0,
            householdId: 'h-1',
            createdByUserId: 'u-1',
            createdAt: 2,
            updatedAt: 2,
          },
          {
            id: 'g-3',
            name: 'Household 3',
            description: null,
            status: 'active',
            startDate: null,
            endDate: null,
            eventBudgetMinor: null,
            totalSpendMinor: 0,
            householdId: 'h-1',
            createdByUserId: 'u-1',
            createdAt: 2,
            updatedAt: 2,
          },
        ],
      ),
    ).toEqual([
      expect.objectContaining({ id: 'g-1', name: 'Personal 1' }),
      expect.objectContaining({ id: 'g-2', name: 'Household 2' }),
      expect.objectContaining({ id: 'g-3', name: 'Household 3' }),
    ])
  })
})
