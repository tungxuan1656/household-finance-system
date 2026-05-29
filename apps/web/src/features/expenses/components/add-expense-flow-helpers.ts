import { t } from '@/lib/i18n/t'
import { getCategoryLabel, getSourceLabel } from '@/lib/reference-data/labels'
import type { SourceKey } from '@/types/reference-data'

import type { ExpenseEntryCategoryOption } from './expense-entry-options'
import type { ExpenseEntryFormState } from './use-expense-entry-form'

export const ADD_EXPENSE_STEP_TOTAL = 3

export type AddExpenseStep = 1 | 2 | 3

const TITLE_SUGGESTION_KEYS = {
  family: [
    'expense.quickAdd.suggestions.family.groceries',
    'expense.quickAdd.suggestions.family.snacks',
    'expense.quickAdd.suggestions.family.supplies',
  ],
  food: [
    'expense.quickAdd.suggestions.food.rice',
    'expense.quickAdd.suggestions.food.noodleSoup',
    'expense.quickAdd.suggestions.food.coffee',
  ],
  'living-costs': [
    'expense.quickAdd.suggestions.livingCosts.electricity',
    'expense.quickAdd.suggestions.livingCosts.water',
    'expense.quickAdd.suggestions.livingCosts.rent',
  ],
  shopping: [
    'expense.quickAdd.suggestions.shopping.essentials',
    'expense.quickAdd.suggestions.shopping.household',
    'expense.quickAdd.suggestions.shopping.personal',
  ],
  transport: [
    'expense.quickAdd.suggestions.transport.gas',
    'expense.quickAdd.suggestions.transport.parking',
    'expense.quickAdd.suggestions.transport.rideHailing',
  ],
} as const

const QUICK_SOURCE_KEYS: SourceKey[] = ['cash', 'bank-transfer', 'momo']

export const getAddExpenseQuickAmounts = () => ['35', '45', '50', '100']

export const getAddExpenseQuickSources = () =>
  QUICK_SOURCE_KEYS.map((key) => ({
    key,
    label: getSourceLabel(key),
  }))

export const filterAddExpenseCategories = (
  categories: ExpenseEntryCategoryOption[],
  search: string,
): ExpenseEntryCategoryOption[] => {
  const normalizedSearch = search.trim().toLowerCase()

  if (!normalizedSearch) {
    return categories
  }

  return categories.filter((category) =>
    getCategoryLabel(category.key).toLowerCase().includes(normalizedSearch),
  )
}

export const getAddExpenseTitleSuggestions = (
  categoryKey: string | null,
): string[] => {
  if (!categoryKey) {
    return []
  }

  const keys =
    TITLE_SUGGESTION_KEYS[categoryKey as keyof typeof TITLE_SUGGESTION_KEYS] ??
    TITLE_SUGGESTION_KEYS.food

  return keys.map((key) => t(key))
}

export const canAdvanceAddExpenseCategoryStep = (
  formState: ExpenseEntryFormState,
) => Boolean(formState.categoryKey && formState.occurredOn)

export const canAdvanceAddExpenseInfoStep = (
  formState: ExpenseEntryFormState,
) =>
  Boolean(
    formState.amountInput.trim() &&
    formState.sourceKey &&
    formState.title.trim() &&
    formState.occurredOn,
  )
