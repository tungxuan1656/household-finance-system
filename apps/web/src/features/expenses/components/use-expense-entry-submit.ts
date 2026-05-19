'use client'

import { useCallback } from 'react'
import { toast } from 'sonner'

import { useUpdateCurrentUserProfileMutation } from '@/hooks/api/use-profile'
import { t } from '@/lib/i18n/t'

import {
  useCreateExpenseMutation,
  useDeleteExpenseMutation,
  useUpdateExpenseMutation,
} from '../hooks/use-expense'
import type { ExpenseDTO } from '../types/expense'
import {
  buildExpenseEntryPayload,
  buildExpenseEntryUpdatePayload,
  type ExpenseEntryFormErrors,
  type ExpenseEntryFormState,
  validateExpenseEntryForm,
} from './expense-entry-form-core'

export type ExpenseEntrySubmitCallbacks = {
  onSuccess?: (expense: ExpenseDTO) => void
  onError?: (error: Error) => void
}

type UseExpenseEntrySubmitOptions = {
  mode: 'create' | 'edit'
  formState: ExpenseEntryFormState
  expenseId?: string
  onCreateClose?: (open: boolean) => void
  editCallbacks?: ExpenseEntrySubmitCallbacks
  setErrors: (errors: ExpenseEntryFormErrors) => void
}

export const useExpenseEntrySubmit = ({
  mode,
  formState,
  expenseId,
  onCreateClose,
  editCallbacks,
  setErrors,
}: UseExpenseEntrySubmitOptions) => {
  const createExpense = useCreateExpenseMutation()
  const updateExpense = useUpdateExpenseMutation()
  const deleteExpense = useDeleteExpenseMutation()
  const updateProfile = useUpdateCurrentUserProfileMutation()

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

        onCreateClose?.(false)

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
    deleteExpense,
    formState,
    onCreateClose,
    setErrors,
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
  }, [editCallbacks, expenseId, formState, setErrors, updateExpense])

  const handleSubmit = useCallback(
    () => (mode === 'create' ? handleCreateSubmit() : handleEditSubmit()),
    [handleCreateSubmit, handleEditSubmit, mode],
  )

  return {
    handleSubmit,
    isSubmitting: createExpense.isPending || updateExpense.isPending,
  }
}
