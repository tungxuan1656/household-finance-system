import type { ExpenseDTO } from '@/features/home/types'
import { rawFromMinor } from '@/lib/formatters'

import type { EditExpenseDraft } from './store'

export const createEditExpenseDraft = (
  expense: ExpenseDTO,
): EditExpenseDraft => ({
  id: expense.id,
  title: expense.title,
  amount: rawFromMinor(expense.amountMinor),
  occurredAt: expense.occurredAt,
  categoryKey: expense.categoryKey,
  sourceKey: expense.sourceKey,
  householdId: expense.householdId,
  groupId: expense.groupIds?.[0] ?? null,
})
