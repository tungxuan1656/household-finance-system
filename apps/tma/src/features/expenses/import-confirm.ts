import type { CategoryKey, SourceKey } from '@/features/home/types'

import type { CreateExpenseRequest } from './api'
import type { ImportItemDraft } from './import-store'

export interface ConfirmImportResult {
  succeeded: string[]
  failed: Array<{ id: string; error: string }>
}

export const confirmImport = async (
  items: ImportItemDraft[],
  createFn: (payload: CreateExpenseRequest) => Promise<unknown>,
): Promise<ConfirmImportResult> => {
  const succeeded: string[] = []
  const failed: Array<{ id: string; error: string }> = []

  for (const item of items) {
    if (!item.include || item.status === 'success') continue

    try {
      await createFn({
        amount: item.parsed.amount,
        categoryKey: item.parsed.categoryKey as CategoryKey,
        sourceKey: item.parsed.sourceKey as SourceKey,
        title: item.parsed.title,
        occurredAt: new Date(`${item.parsed.occurredAt}T00:00:00`).getTime(),
        ...(item.householdId ? { householdId: item.householdId } : {}),
        ...(item.groupId ? { groupIds: [item.groupId] } : {}),
      })

      succeeded.push(item.id)
    } catch (error) {
      failed.push({
        id: item.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  return { succeeded, failed }
}
