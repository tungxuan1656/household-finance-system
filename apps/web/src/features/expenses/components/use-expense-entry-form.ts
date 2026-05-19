'use client'

import { useCallback, useEffect, useState } from 'react'

import type { SourceKey } from '@/types/reference-data'

import type { ExpenseDTO } from '../types/expense'
import {
  buildExpenseEntryInitialState,
  buildExpenseEntryPayload,
  buildExpenseEntryUpdatePayload,
  EMPTY_EXPENSE_ENTRY_FORM_STATE,
  type ExpenseEntryFormErrors,
  type ExpenseEntryFormState,
  getExpenseEntryAmountDisplay,
  getExpenseEntryTitlePlaceholder,
  hydrateExpenseEntryAmountInput,
  sanitizeDigits,
  validateExpenseEntryForm,
} from './expense-entry-form-core'
import {
  type ExpenseEntrySubmitCallbacks,
  useExpenseEntrySubmit,
} from './use-expense-entry-submit'

export {
  buildExpenseEntryInitialState,
  buildExpenseEntryPayload,
  buildExpenseEntryUpdatePayload,
  hydrateExpenseEntryAmountInput,
  validateExpenseEntryForm,
}
export type { ExpenseEntryFormErrors, ExpenseEntryFormState }

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
  const { handleSubmit, isSubmitting } = useExpenseEntrySubmit({
    mode,
    formState,
    expenseId,
    onCreateClose: createOnOpenChange,
    editCallbacks,
    setErrors,
  })

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

  return {
    amountDisplay: getExpenseEntryAmountDisplay(formState.amountInput),
    errors,
    formState,
    isSubmitting,
    setField,
    titlePlaceholder: getExpenseEntryTitlePlaceholder(formState.categoryKey),
    handleSubmit,
  }
}
