import type { ExpenseDTO } from '@/contracts'
import { REFERENCE_CATEGORY_KEYS, REFERENCE_SOURCE_KEYS } from '@/contracts'
import type { StoredExpense } from '@/db/repositories/expense-repository'

const CATEGORY_KEYS = new Set<string>(REFERENCE_CATEGORY_KEYS)
const SOURCE_KEYS = new Set<string>(REFERENCE_SOURCE_KEYS)

export const getCurrencyFractionDigits = (currencyCode: string): number => {
  try {
    return (
      new Intl.NumberFormat('en', {
        style: 'currency',
        currency: currencyCode,
      }).resolvedOptions().maximumFractionDigits ?? 2
    )
  } catch {
    return 2
  }
}

export const getMinorUnits = (amount: number, currencyCode: string): number => {
  const decimals = getCurrencyFractionDigits(currencyCode)
  const factor = 10 ** decimals

  return Math.round(amount * factor)
}

export const mapStoredExpenseToDto = (
  expense: StoredExpense,
  groupIds: string[] = [],
): ExpenseDTO => ({
  id: expense.id,
  title: expense.title,
  amountMinor: expense.amountMinor,
  currencyCode: expense.currencyCode,
  categoryKey: CATEGORY_KEYS.has(expense.categoryKey)
    ? (expense.categoryKey as ExpenseDTO['categoryKey'])
    : 'other',
  sourceKey: SOURCE_KEYS.has(expense.sourceKey)
    ? (expense.sourceKey as ExpenseDTO['sourceKey'])
    : 'cash',
  occurredAt: expense.occurredAt,
  visibility: expense.visibility,
  householdId: expense.householdId,
  payerUserId: expense.payerUserId,
  note: expense.note,
  groupIds,
  createdByUserId: expense.createdByUserId,
  createdAt: expense.createdAt,
  updatedAt: expense.updatedAt,
})

export const buildExpenseChangeSet = (
  before: StoredExpense,
  after: StoredExpense,
): Array<{ field: string; before: unknown; after: unknown }> => {
  const fields: Array<keyof StoredExpense> = [
    'title',
    'amountMinor',
    'currencyCode',
    'categoryKey',
    'sourceKey',
    'occurredAt',
    'visibility',
    'householdId',
    'payerUserId',
    'note',
  ]

  return fields.flatMap((field) => {
    if (before[field] === after[field]) {
      return []
    }

    return [{ field, before: before[field], after: after[field] }]
  })
}
