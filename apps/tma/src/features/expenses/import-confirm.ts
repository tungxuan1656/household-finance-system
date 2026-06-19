import type { CategoryKey, SourceKey } from '@/features/home/types'

import type { CreateExpenseRequest } from './api'
import type { ImportItemDraft } from './import-store'

export interface ConfirmImportResult {
  succeeded: string[]
  failed: Array<{ id: string; error: string }>
}

/**
 * Convert a YYYY-MM-DD date string to a UTC-midnight epoch timestamp.
 * Avoids browser-local Date parsing that would shift the date by the
 * local timezone offset.
 */
const toUtcDateOnly = (dateStr: string): number => {
  const [year, month, day] = dateStr.split('-').map(Number)

  // month is 0-indexed in Date.UTC
  return Date.UTC(year, month - 1, day)
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
        occurredAt: toUtcDateOnly(item.parsed.occurredAt),
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
