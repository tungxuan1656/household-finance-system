import type { ExpenseDTO } from '@/features/home/types'

import type { EditExpenseDraft } from './store'

export const createEditExpenseDraft = (
  expense: ExpenseDTO,
): EditExpenseDraft => ({
  id: expense.id,
  title: expense.title,
  amount: expense.amountMinor / 100,
  occurredAt: expense.occurredAt,
  categoryKey: expense.categoryKey,
  sourceKey: expense.sourceKey,
  householdId: expense.householdId,
  note: expense.note ?? '',
})
