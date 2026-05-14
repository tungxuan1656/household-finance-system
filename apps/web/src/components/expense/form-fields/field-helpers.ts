'use client'

import type { ExpenseFormInputValues } from '@/lib/forms/expense.schema'
import { t } from '@/lib/i18n/t'
import { getCategoryLabel } from '@/lib/reference-data/labels'
import {
  localDateToTimestamp,
  timestampToLocalDate,
} from '@/utils/datetime/helpers'

export function formatOccurredAtDate(value: number | undefined) {
  return value ? timestampToLocalDate(value) : ''
}

export function parseOccurredAtDate(value: string) {
  return value ? localDateToTimestamp(value) : undefined
}

export function getExpenseTitlePlaceholder(
  categoryKey: ExpenseFormInputValues['categoryKey'] | undefined,
) {
  return categoryKey ? getCategoryLabel(categoryKey) : t('expense.title')
}
