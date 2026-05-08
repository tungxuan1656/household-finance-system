import { ApiClientError } from '@/api/client'
import type { ExpenseFormInputValues } from '@/lib/forms/expense.schema'
import { t } from '@/lib/i18n/t'
import type { ExpenseDTO, ExpenseVisibility } from '@/types/expense'
import type { CurrentUserProfileDTO } from '@/types/profile'
import type { CategoryKey, SourceKey } from '@/types/reference-data'
import { SOURCE_KEYS } from '@/types/reference-data'

const isSourceKey = (value: string | null): value is SourceKey =>
  value !== null && SOURCE_KEYS.includes(value as SourceKey)

export type QuickAddSubmitError = {
  kind: 'network' | 'permission' | 'generic'
  message: string
  hint: string
}

export function buildQuickAddInitialValues({
  profile,
  recentExpenses,
}: {
  profile?: CurrentUserProfileDTO
  recentExpenses?: ExpenseDTO[]
}): Partial<ExpenseFormInputValues> {
  const profileSourceKey = profile?.quickAddLastSourceKey
  const lastSource =
    profileSourceKey && isSourceKey(profileSourceKey)
      ? profileSourceKey
      : undefined

  return {
    categoryKey: getQuickAddDefaultCategory({
      recentExpenses,
      sourceKey: lastSource,
      visibility: 'private',
    }),
    occurredAt: Date.now(),
    visibility: 'private',
    sourceKey: lastSource,
  }
}

export function getQuickAddDefaultCategory({
  recentExpenses,
  sourceKey,
  visibility,
  householdId,
}: {
  recentExpenses?: ExpenseDTO[]
  sourceKey?: SourceKey
  visibility: ExpenseVisibility
  householdId?: string
}): CategoryKey | undefined {
  if (!recentExpenses || recentExpenses.length === 0) {
    return undefined
  }

  const sameSourceMatch = recentExpenses.find((expense) => {
    if (sourceKey && expense.sourceKey !== sourceKey) {
      return false
    }

    if (expense.visibility !== visibility) {
      return false
    }

    if (visibility === 'household') {
      return expense.householdId === householdId
    }

    return true
  })

  if (sameSourceMatch) {
    return sameSourceMatch.categoryKey
  }

  const fallbackMatch = recentExpenses.find((expense) => {
    if (expense.visibility !== visibility) {
      return false
    }

    if (visibility === 'household') {
      return expense.householdId === householdId
    }

    return true
  })

  return fallbackMatch?.categoryKey
}

export function buildQuickAddSubmitError(error: Error): QuickAddSubmitError {
  if (error instanceof ApiClientError) {
    if (error.code === 'NETWORK_ERROR' || error.status === 0) {
      return {
        kind: 'network',
        message: t('expense.quickAdd.networkError'),
        hint: t('expense.quickAdd.retryHint'),
      }
    }

    if (error.code === 'FORBIDDEN' || error.status === 403) {
      return {
        kind: 'permission',
        message: t('expense.quickAdd.permissionError'),
        hint: t('expense.quickAdd.retryHint'),
      }
    }
  }

  return {
    kind: 'generic',
    message: t('expense.submitError'),
    hint: t('expense.quickAdd.retryHint'),
  }
}
