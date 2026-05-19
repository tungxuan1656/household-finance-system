'use client'

import { t } from '@/lib/i18n/t'
import { getCategoryLabel } from '@/lib/reference-data/labels'
import type { CategoryKey } from '@/types/reference-data'
import {
  localDateToTimestamp,
  timestampToLocalDate,
} from '@/utils/datetime/helpers'

export function formatOccurredAtDate(value: number | undefined): string {
  return value ? timestampToLocalDate(value) : ''
}

export function parseOccurredAtDate(value: string): number | undefined {
  return value ? localDateToTimestamp(value) : undefined
}

export function getExpenseTitlePlaceholder(
  categoryKey: CategoryKey | undefined,
): string {
  return categoryKey ? getCategoryLabel(categoryKey) : t('expense.title')
}
