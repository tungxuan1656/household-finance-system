'use client'

import { t } from '@/lib/i18n/t'
import type { CategoryKey, SourceKey } from '@/types/reference-data'

import type {
  CreateExpenseRequest,
  ExpenseDTO,
  UpdateExpenseMutationInput,
} from '../types/expense'
import {
  formatDialogAmountDisplay,
  parseDialogAmountRawFromStoredMinor,
  parseDialogAmountSubmitMinor,
} from './dialog-amount-helper'
import {
  formatOccurredAtDate,
  getExpenseTitlePlaceholder,
  parseOccurredAtDate,
} from './expense-entry-helpers'

export type ExpenseEntryFormState = {
  amountInput: string
  categoryKey: CategoryKey | null
  sourceKey: SourceKey | ''
  title: string
  occurredOn: string
  householdId: string
  groupId: string
}

export type ExpenseEntryFormErrors = Partial<
  Record<keyof ExpenseEntryFormState, string>
>

export type ExpenseEntryMode = 'create' | 'edit'

export type ExpenseEntryInitialStateInput =
  | {
      mode: 'create'
      lastSourceKey: SourceKey | null
      currentTime?: number
    }
  | {
      mode: 'edit'
      expense: ExpenseDTO
      currentTime?: number
    }

export const EMPTY_EXPENSE_ENTRY_FORM_STATE: ExpenseEntryFormState = {
  amountInput: '',
  categoryKey: null,
  sourceKey: '',
  title: '',
  occurredOn: '',
  householdId: '',
  groupId: '',
}

export const sanitizeDigits = (value: string) => value.replace(/\D+/g, '')

export const hydrateExpenseEntryAmountInput = (amountMinor: number) =>
  parseDialogAmountRawFromStoredMinor(amountMinor)

export const buildExpenseEntryInitialState = (
  input: ExpenseEntryInitialStateInput,
): ExpenseEntryFormState => {
  const currentTime = input.currentTime ?? Date.now()

  if (input.mode === 'edit') {
    return {
      amountInput: hydrateExpenseEntryAmountInput(input.expense.amountMinor),
      categoryKey: input.expense.categoryKey,
      sourceKey: input.expense.sourceKey,
      title: input.expense.title,
      occurredOn: formatOccurredAtDate(input.expense.occurredAt ?? currentTime),
      householdId: input.expense.householdId ?? '',
      groupId: input.expense.groupIds?.[0] ?? '',
    }
  }

  return {
    amountInput: '',
    categoryKey: null,
    sourceKey: input.lastSourceKey ?? 'cash',
    title: '',
    occurredOn: formatOccurredAtDate(currentTime),
    householdId: '',
    groupId: '',
  }
}

export const validateExpenseEntryForm = (
  formState: ExpenseEntryFormState,
): ExpenseEntryFormErrors => {
  const nextErrors: ExpenseEntryFormErrors = {}
  const amount = parseDialogAmountSubmitMinor(formState.amountInput)

  if (amount == null || amount <= 0)
    nextErrors.amountInput = t('expense.error.amountRequired')
  if (!formState.categoryKey)
    nextErrors.categoryKey = t('expense.error.categoryRequired')
  if (!formState.sourceKey)
    nextErrors.sourceKey = t('expense.error.sourceRequired')
  if (!formState.title.trim())
    nextErrors.title = t('expense.error.titleRequired')
  if (!parseOccurredAtDate(formState.occurredOn))
    nextErrors.occurredOn = t('expense.error.dateRequired')

  return nextErrors
}

export const buildExpenseEntryPayload = (
  formState: ExpenseEntryFormState,
): CreateExpenseRequest | null => {
  const amount = parseDialogAmountSubmitMinor(formState.amountInput)
  const occurredAt = parseOccurredAtDate(formState.occurredOn)

  if (
    !amount ||
    amount <= 0 ||
    !occurredAt ||
    !formState.categoryKey ||
    !formState.sourceKey
  ) {
    return null
  }

  return {
    amount,
    categoryKey: formState.categoryKey,
    sourceKey: formState.sourceKey,
    title: formState.title.trim(),
    occurredAt,
    ...(formState.householdId ? { householdId: formState.householdId } : {}),
    ...(formState.groupId ? { groupIds: [formState.groupId] } : {}),
  }
}

export const buildExpenseEntryUpdatePayload = (
  expenseId: string,
  formState: ExpenseEntryFormState,
): UpdateExpenseMutationInput | null => {
  const payload = buildExpenseEntryPayload(formState)

  if (!payload) {
    return null
  }

  return {
    id: expenseId,
    payload: {
      ...payload,
      householdId: formState.householdId || null,
    },
  }
}

export const getExpenseEntryTitlePlaceholder = (
  categoryKey: CategoryKey | null,
) => getExpenseTitlePlaceholder(categoryKey ?? undefined)

export const getExpenseEntryAmountDisplay = (amountInput: string) =>
  formatDialogAmountDisplay(amountInput)
