import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/i18n/t', () => ({
  t: (key: string) => key,
}))

vi.mock('@/lib/reference-data/labels', () => ({
  getCategoryLabel: (key: string) => `category.${key}`,
  getSourceLabel: (key: string) => `source.${key}`,
}))

import {
  canAdvanceAddExpenseCategoryStep,
  canAdvanceAddExpenseInfoStep,
  filterAddExpenseCategories,
  getAddExpenseQuickAmounts,
  getAddExpenseQuickSources,
  getAddExpenseTitleSuggestions,
} from './add-expense-flow-helpers'
import type { ExpenseEntryCategoryOption } from './expense-entry-options'

describe('add-expense-flow-helpers', () => {
  it('returns the approved quick amount presets', () => {
    expect(getAddExpenseQuickAmounts()).toEqual(['35', '45', '50', '100'])
  })

  it('returns the preferred quick sources for the info step', () => {
    expect(getAddExpenseQuickSources()).toEqual([
      { key: 'cash', label: 'source.cash' },
      { key: 'bank-transfer', label: 'source.bank-transfer' },
      { key: 'momo', label: 'source.momo' },
    ])
  })

  it('filters categories by localized label text', () => {
    const categories: ExpenseEntryCategoryOption[] = [
      { key: 'food', kind: 'expense', iconUrl: '', color: '#000' },
      { key: 'transport', kind: 'expense', iconUrl: '', color: '#111' },
    ]

    expect(filterAddExpenseCategories(categories, 'transport')).toEqual([
      categories[1],
    ])
  })

  it('returns localized title suggestions by category', () => {
    expect(getAddExpenseTitleSuggestions('food')).toEqual([
      'expense.quickAdd.suggestions.food.rice',
      'expense.quickAdd.suggestions.food.noodleSoup',
      'expense.quickAdd.suggestions.food.coffee',
    ])
  })

  it('checks step progression guards from form state', () => {
    expect(
      canAdvanceAddExpenseCategoryStep({
        amountInput: '',
        categoryKey: 'food',
        sourceKey: '',
        title: '',
        occurredOn: '2026-05-27',
        householdId: '',
        groupId: '',
      }),
    ).toBe(true)

    expect(
      canAdvanceAddExpenseInfoStep({
        amountInput: '35',
        categoryKey: 'food',
        sourceKey: 'cash',
        title: 'Com',
        occurredOn: '2026-05-27',
        householdId: '',
        groupId: '',
      }),
    ).toBe(true)
  })
})
