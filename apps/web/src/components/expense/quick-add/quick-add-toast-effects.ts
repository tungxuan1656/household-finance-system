import { toast } from 'sonner'

import { t } from '@/lib/i18n/t'
import { reportQuickAddTiming } from '@/lib/metrics/quick-add-metrics'
import type { ExpenseDTO } from '@/types/expense'

export function reportQuickAddSuccessTiming({
  openedAt,
  visibility,
}: {
  openedAt: number | null
  visibility: 'private' | 'household'
}) {
  if (openedAt === null) {
    return
  }

  reportQuickAddTiming({
    durationMs: Math.max(0, performance.now() - openedAt),
    visibility,
    wasHousehold: visibility === 'household',
  })
}

export function showQuickAddUndoToast(
  expense: Pick<ExpenseDTO, 'id'>,
  deleteExpense: (
    expenseId: string,
    options?: { onError?: (error: Error) => void },
  ) => void,
) {
  let hasUndone = false

  toast.success(t('expense.quickAdd.success'), {
    action: {
      label: t('expense.quickAdd.undo'),
      onClick: () => {
        if (hasUndone) {
          return
        }

        hasUndone = true

        deleteExpense(expense.id, {
          onError: () => {
            toast.error(t('expense.quickAdd.undoError'))
          },
        })
      },
    },
    duration: 5000,
  })
}
