'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import {
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
} from '@/hooks/api/use-expense'
import {
  type ExpenseFormInputValues,
  expenseFormSchema,
} from '@/lib/forms/expense.schema'
import { t } from '@/lib/i18n/t'
import { getCategoryLabel } from '@/lib/reference-data/labels'
import type { ExpenseDTO } from '@/types/expense'
import type { CreateExpenseRequest } from '@/types/expense'
import type { UpdateExpenseMutationInput } from '@/types/expense'

export function timestampToLocalDate(ts: number): string {
  const d = new Date(ts)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function localDateToTimestamp(dateStr: string): number {
  const [year, month, day] = dateStr.split('-').map(Number)

  return new Date(year, month - 1, day).getTime()
}

export function buildDefaultValues(
  initialValues?: ExpenseFormInputValues,
): Partial<ExpenseFormInputValues> {
  return {
    amount: initialValues?.amount,
    categoryKey: initialValues?.categoryKey,
    sourceKey: initialValues?.sourceKey,
    title: initialValues?.title ?? '',
    occurredAt: initialValues?.occurredAt ?? Date.now(),
    note: initialValues?.note ?? '',
    payerUserId: initialValues?.payerUserId,
    visibility: initialValues?.visibility ?? 'private',
    householdId: initialValues?.householdId,
  }
}

type UseExpenseFormOptions = {
  initialValues?: ExpenseFormInputValues
  mode: 'create' | 'edit'
  expenseId?: string
  onSuccess?: (expense: ExpenseDTO) => void
  onError?: (error: Error) => void
}

export function useExpenseForm({
  initialValues,
  mode,
  expenseId,
  onSuccess,
  onError,
}: UseExpenseFormOptions) {
  const createExpense = useCreateExpenseMutation()
  const updateExpense = useUpdateExpenseMutation()

  const defaultValues = useMemo(
    () => buildDefaultValues(initialValues),
    [initialValues],
  )

  const form = useForm<ExpenseFormInputValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues,
    mode: 'onSubmit',
  })

  useEffect(() => {
    form.reset(defaultValues)
  }, [defaultValues, form])

  const watchedCategoryKey = form.watch('categoryKey')
  const watchedVisibility = form.watch('visibility')
  const watchedTitle = form.watch('title')

  const categoryLabel = useMemo(() => {
    if (!watchedCategoryKey) return ''

    return getCategoryLabel(watchedCategoryKey)
  }, [watchedCategoryKey])

  useEffect(() => {
    if (mode === 'create' && categoryLabel && !watchedTitle) {
      form.setValue('title', categoryLabel, { shouldValidate: true })
    }
  }, [categoryLabel, watchedTitle, form, mode])

  const onSubmit = useCallback(
    (values: ExpenseFormInputValues) => {
      const parsedValues = expenseFormSchema.safeParse(values)

      if (!parsedValues.success) {
        return
      }

      const payload: CreateExpenseRequest = {
        amount: parsedValues.data.amount,
        categoryKey: parsedValues.data.categoryKey,
        sourceKey: parsedValues.data.sourceKey,
        title: parsedValues.data.title,
        occurredAt: parsedValues.data.occurredAt,
        ...(parsedValues.data.note ? { note: parsedValues.data.note } : {}),
        visibility: parsedValues.data.visibility,
        ...(parsedValues.data.visibility === 'household' &&
        parsedValues.data.payerUserId
          ? { payerUserId: parsedValues.data.payerUserId }
          : {}),
        ...(parsedValues.data.visibility === 'household' &&
        parsedValues.data.householdId
          ? { householdId: parsedValues.data.householdId }
          : {}),
      }

      if (mode === 'edit' && expenseId) {
        const input: UpdateExpenseMutationInput = {
          id: expenseId,
          payload,
        }

        updateExpense.mutate(input, {
          onSuccess: (expense) => {
            onSuccess?.(expense)
          },
          onError: (error) => {
            toast.error(t('expense.updateError'))
            onError?.(error)
          },
        })

        return
      }

      createExpense.mutate(payload, {
        onSuccess: (expense) => {
          form.reset(buildDefaultValues())
          onSuccess?.(expense)
        },
        onError: (error) => {
          toast.error(t('expense.submitError'))
          onError?.(error)
        },
      })
    },
    [createExpense, expenseId, form, mode, onError, onSuccess, updateExpense],
  )

  const isSubmitting = createExpense.isPending || updateExpense.isPending

  return { form, onSubmit, isSubmitting, watchedVisibility, defaultValues }
}
