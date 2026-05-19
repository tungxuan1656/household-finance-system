'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

import {
  useCreateExpenseMutation,
  useDeleteExpenseMutation,
  useUpdateExpenseMutation,
} from '@/hooks/api/use-expense'
import { useUpdateCurrentUserProfileMutation } from '@/hooks/api/use-profile'
import { t } from '@/lib/i18n/t'
import type {
  CreateExpenseRequest,
  ExpenseDTO,
  UpdateExpenseMutationInput,
} from '@/types/expense'
import type { CategoryKey, SourceKey } from '@/types/reference-data'

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

const EMPTY_EXPENSE_ENTRY_FORM_STATE: ExpenseEntryFormState = {
  amountInput: '',
  categoryKey: null,
  sourceKey: '',
  title: '',
  occurredOn: '',
  householdId: '',
  groupId: '',
}

const sanitizeDigits = (value: string) => value.replace(/\D+/g, '')

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
    visibility: formState.householdId ? 'household' : 'private',
    ...(formState.householdId ? { householdId: formState.householdId } : {}),
    ...(formState.groupId ? { groupIds: [formState.groupId] } : {}),
  }
}

export const buildExpenseEntryUpdatePayload = (
  expenseId: string,
  formState: ExpenseEntryFormState,
): UpdateExpenseMutationInput | null => {
  const payload = buildExpenseEntryPayload(formState)

  return payload ? { id: expenseId, payload } : null
}

type ExpenseEntrySubmitCallbacks = {
  onSuccess?: (expense: ExpenseDTO) => void
  onError?: (error: Error) => void
}

export type UseExpenseEntryFormCreateOptions = {
  mode: 'create'
  open: boolean
  lastSourceKey: SourceKey | null
  onOpenChange: (open: boolean) => void
}

export type UseExpenseEntryFormEditOptions = {
  mode: 'edit'
  open: boolean
  expense?: ExpenseDTO
  expenseId: string
  callbacks?: ExpenseEntrySubmitCallbacks
}

export type UseExpenseEntryFormOptions =
  | UseExpenseEntryFormCreateOptions
  | UseExpenseEntryFormEditOptions

export const useExpenseEntryForm = (options: UseExpenseEntryFormOptions) => {
  const createExpense = useCreateExpenseMutation()
  const updateExpense = useUpdateExpenseMutation()
  const deleteExpense = useDeleteExpenseMutation()
  const updateProfile = useUpdateCurrentUserProfileMutation()
  const { mode, open } = options
  const lastSourceKey = mode === 'create' ? options.lastSourceKey : null
  const createOnOpenChange =
    mode === 'create' ? options.onOpenChange : undefined
  const expense = mode === 'edit' ? options.expense : undefined
  const expenseId = mode === 'edit' ? options.expenseId : undefined
  const editCallbacks = mode === 'edit' ? options.callbacks : undefined
  const [formState, setFormState] = useState<ExpenseEntryFormState>(() =>
    mode === 'create'
      ? buildExpenseEntryInitialState({ mode: 'create', lastSourceKey })
      : expense
        ? buildExpenseEntryInitialState({ mode: 'edit', expense })
        : EMPTY_EXPENSE_ENTRY_FORM_STATE,
  )
  const [errors, setErrors] = useState<ExpenseEntryFormErrors>({})

  useEffect(() => {
    if (!open) return

    if (mode === 'edit') {
      if (!expense) return

      setFormState(buildExpenseEntryInitialState({ mode: 'edit', expense }))
      setErrors({})

      return
    }

    setFormState(
      buildExpenseEntryInitialState({ mode: 'create', lastSourceKey }),
    )

    setErrors({})
  }, [expense, lastSourceKey, mode, open])

  const setField = useCallback(
    <K extends keyof ExpenseEntryFormState>(
      key: K,
      value: ExpenseEntryFormState[K],
    ) => {
      const nextValue =
        key === 'amountInput' && typeof value === 'string'
          ? sanitizeDigits(value)
          : value
      setFormState((current) => ({ ...current, [key]: nextValue }))
      setErrors((current) => ({ ...current, [key]: undefined }))
    },
    [],
  )

  const handleCreateSubmit = useCallback((): void => {
    const nextErrors = validateExpenseEntryForm(formState)
    if (Object.keys(nextErrors).length > 0) return void setErrors(nextErrors)

    const payload = buildExpenseEntryPayload(formState)
    if (!payload) return

    createExpense.mutate(payload, {
      onError: () => toast.error(t('expense.submitError')),
      onSuccess: (expense) => {
        updateProfile.mutate(
          { quickAddLastSourceKey: payload.sourceKey },
          { onError: () => undefined },
        )

        createOnOpenChange?.(false)

        toast.success(t('expense.success'), {
          action: {
            label: t('expense.quickAdd.undo'),
            onClick: () =>
              deleteExpense.mutate(expense.id, {
                onError: () => toast.error(t('expense.quickAdd.undoError')),
              }),
          },
          duration: 5000,
        })
      },
    })
  }, [
    createExpense,
    createOnOpenChange,
    deleteExpense,
    formState,
    updateProfile,
  ])

  const handleEditSubmit = useCallback((): void => {
    const nextErrors = validateExpenseEntryForm(formState)
    if (Object.keys(nextErrors).length > 0) return void setErrors(nextErrors)

    if (!expenseId) return

    const input = buildExpenseEntryUpdatePayload(expenseId, formState)
    if (!input) return

    updateExpense.mutate(input, {
      onSuccess: (expense) => editCallbacks?.onSuccess?.(expense),
      onError: (error) => {
        editCallbacks?.onError?.(error)
      },
    })
  }, [editCallbacks, expenseId, formState, updateExpense])

  const handleSubmit = useCallback(
    () => (mode === 'create' ? handleCreateSubmit() : handleEditSubmit()),
    [handleCreateSubmit, handleEditSubmit, mode],
  )

  return {
    amountDisplay: formatDialogAmountDisplay(formState.amountInput),
    errors,
    formState,
    isSubmitting: createExpense.isPending || updateExpense.isPending,
    setField,
    titlePlaceholder: getExpenseTitlePlaceholder(
      formState.categoryKey ?? undefined,
    ),
    handleSubmit,
  }
}
