'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import {
  useCreateExpenseMutation,
  useDeleteExpenseMutation,
} from '@/hooks/api/use-expense'
import { useUpdateCurrentUserProfileMutation } from '@/hooks/api/use-profile'
import { t } from '@/lib/i18n/t'
import type { CreateExpenseRequest } from '@/types/expense'
import type { CategoryKey, SourceKey } from '@/types/reference-data'

import {
  formatDialogAmountDisplay,
  parseDialogAmountSubmitMinor,
} from './dialog-amount-helper'
import {
  formatOccurredAtDate,
  getExpenseTitlePlaceholder,
  parseOccurredAtDate,
} from './form-fields/field-helpers'

export type AddExpenseFormState = {
  amountInput: string
  categoryKey: CategoryKey | null
  sourceKey: SourceKey | ''
  title: string
  occurredOn: string
  householdId: string
  groupId: string
}

export type AddExpenseFormErrors = Partial<
  Record<keyof AddExpenseFormState, string>
>

const sanitizeDigits = (value: string) => value.replace(/\D+/g, '')

export const buildAddExpenseInitialState = (
  lastSourceKey: SourceKey | null,
  currentTime = Date.now(),
): AddExpenseFormState => ({
  amountInput: '',
  categoryKey: null,
  sourceKey: lastSourceKey ?? 'cash',
  title: '',
  occurredOn: formatOccurredAtDate(currentTime),
  householdId: '',
  groupId: '',
})

export const validateAddExpenseForm = (
  formState: AddExpenseFormState,
): AddExpenseFormErrors => {
  const nextErrors: AddExpenseFormErrors = {}
  const amount = parseDialogAmountSubmitMinor(formState.amountInput)

  if (amount == null || amount <= 0) {
    nextErrors.amountInput = t('expense.error.amountRequired')
  }

  if (!formState.categoryKey) {
    nextErrors.categoryKey = t('expense.error.categoryRequired')
  }

  if (!formState.sourceKey) {
    nextErrors.sourceKey = t('expense.error.sourceRequired')
  }

  if (!formState.title.trim()) {
    nextErrors.title = t('expense.error.titleRequired')
  }

  if (!parseOccurredAtDate(formState.occurredOn)) {
    nextErrors.occurredOn = t('expense.error.dateRequired')
  }

  return nextErrors
}

export const buildAddExpensePayload = (
  formState: AddExpenseFormState,
): CreateExpenseRequest | null => {
  const amount = parseDialogAmountSubmitMinor(formState.amountInput)
  const occurredAt = parseOccurredAtDate(formState.occurredOn)

  if (
    amount == null ||
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

type UseAddExpenseFormOptions = {
  open: boolean
  lastSourceKey: SourceKey | null
  onOpenChange: (open: boolean) => void
}

export const useAddExpenseForm = ({
  open,
  lastSourceKey,
  onOpenChange,
}: UseAddExpenseFormOptions) => {
  const createExpense = useCreateExpenseMutation()
  const deleteExpense = useDeleteExpenseMutation()
  const updateProfile = useUpdateCurrentUserProfileMutation()
  const [formState, setFormState] = useState<AddExpenseFormState>(() =>
    buildAddExpenseInitialState(null),
  )
  const [errors, setErrors] = useState<AddExpenseFormErrors>({})

  useEffect(() => {
    if (!open) {
      return
    }

    setFormState(buildAddExpenseInitialState(lastSourceKey))
    setErrors({})
  }, [lastSourceKey, open])

  const setField = <K extends keyof AddExpenseFormState>(
    key: K,
    value: AddExpenseFormState[K],
  ) => {
    const nextValue =
      key === 'amountInput' && typeof value === 'string'
        ? sanitizeDigits(value)
        : value

    setFormState((current) => ({ ...current, [key]: nextValue }))
    setErrors((current) => ({ ...current, [key]: undefined }))
  }

  const handleSubmit = () => {
    const nextErrors = validateAddExpenseForm(formState)

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)

      return
    }

    const payload = buildAddExpensePayload(formState)

    if (!payload) {
      return
    }

    createExpense.mutate(payload, {
      onError: () => toast.error(t('expense.submitError')),
      onSuccess: (expense) => {
        updateProfile.mutate(
          { quickAddLastSourceKey: payload.sourceKey },
          { onError: () => undefined },
        )

        onOpenChange(false)

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
  }

  return {
    amountDisplay: formatDialogAmountDisplay(formState.amountInput),
    errors,
    formState,
    isSubmitting: createExpense.isPending,
    setField,
    titlePlaceholder: getExpenseTitlePlaceholder(
      formState.categoryKey ?? undefined,
    ),
    handleSubmit,
  }
}
