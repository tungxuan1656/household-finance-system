'use client'

import { useEffect, useRef, useState } from 'react'
import type { UseFormReturn } from 'react-hook-form'

import type { ExpenseFormInputValues } from '@/lib/forms/expense.schema'
import type { ExpenseDTO } from '@/types/expense'

import {
  getQuickAddDefaultCategory,
  type QuickAddSubmitError,
} from './quick-add-defaults'

type UseQuickAddDialogStateParams = {
  amountInputRef: React.RefObject<HTMLInputElement | null>
  form: UseFormReturn<ExpenseFormInputValues>
  initialValues: Partial<ExpenseFormInputValues>
  open: boolean
  recentExpenses?: ExpenseDTO[]
}

export function useQuickAddDialogState({
  amountInputRef,
  form,
  initialValues,
  open,
  recentExpenses,
}: UseQuickAddDialogStateParams) {
  const openedAtRef = useRef<number | null>(null)
  const wasOpenRef = useRef(false)
  const didApplyInitialDefaultsRef = useRef(false)
  const allowCategoryAutofillRef = useRef(true)
  const previousCategoryKeyRef = useRef<string | undefined>(undefined)
  const [submitError, setSubmitError] = useState<QuickAddSubmitError | null>(
    null,
  )

  const watchedVisibility = form.watch('visibility')
  const watchedHouseholdId = form.watch('householdId')
  const watchedSourceKey = form.watch('sourceKey')
  const watchedCategoryKey = form.watch('categoryKey')

  useEffect(() => {
    if (!open) {
      wasOpenRef.current = false
      didApplyInitialDefaultsRef.current = false
      allowCategoryAutofillRef.current = true
      previousCategoryKeyRef.current = undefined

      return
    }

    if (wasOpenRef.current) {
      return
    }

    wasOpenRef.current = true
    openedAtRef.current = performance.now()
    setSubmitError(null)
    didApplyInitialDefaultsRef.current = false
    allowCategoryAutofillRef.current = true
    form.reset(initialValues as ExpenseFormInputValues)

    const focusTimer = window.setTimeout(() => {
      amountInputRef.current?.focus()
    }, 0)

    return () => window.clearTimeout(focusTimer)
  }, [form, initialValues, open])

  useEffect(() => {
    if (!open || didApplyInitialDefaultsRef.current || form.formState.isDirty) {
      return
    }

    form.reset(initialValues as ExpenseFormInputValues)

    if (initialValues.sourceKey || initialValues.categoryKey) {
      didApplyInitialDefaultsRef.current = true
    }
  }, [form, form.formState.isDirty, initialValues, open])

  useEffect(() => {
    if (watchedVisibility !== 'household') {
      form.setValue('householdId', undefined)
      form.setValue('payerUserId', undefined)
    }
  }, [form, watchedVisibility])

  useEffect(() => {
    const nextCategoryKey = getQuickAddDefaultCategory({
      recentExpenses,
      sourceKey: watchedSourceKey,
      visibility: watchedVisibility ?? 'private',
      householdId: watchedHouseholdId,
    })

    if (
      !allowCategoryAutofillRef.current ||
      !nextCategoryKey ||
      form.getValues('categoryKey')
    ) {
      return
    }

    form.setValue('categoryKey', nextCategoryKey, {
      shouldDirty: false,
      shouldValidate: false,
    })
  }, [
    form,
    recentExpenses,
    watchedHouseholdId,
    watchedSourceKey,
    watchedVisibility,
  ])

  useEffect(() => {
    if (!open) {
      return
    }

    const previousCategoryKey = previousCategoryKeyRef.current

    if (
      form.formState.dirtyFields.categoryKey &&
      previousCategoryKey &&
      !watchedCategoryKey
    ) {
      allowCategoryAutofillRef.current = false
    }

    previousCategoryKeyRef.current = watchedCategoryKey
  }, [form.formState.dirtyFields.categoryKey, open, watchedCategoryKey])

  useEffect(() => {
    if (watchedVisibility !== 'household' || !watchedHouseholdId) {
      return
    }

    form.clearErrors('payerUserId')
  }, [form, watchedHouseholdId, watchedVisibility])

  const handleOpenChange = (
    nextOpen: boolean,
    onOpenChange: (open: boolean) => void,
  ) => {
    if (!nextOpen) {
      setSubmitError(null)
      openedAtRef.current = null
    }

    onOpenChange(nextOpen)
  }

  const handleSaveAsPrivate = (onSubmit: () => void | Promise<void>) => {
    form.setValue('visibility', 'private', {
      shouldDirty: true,
      shouldValidate: true,
    })

    form.setValue('householdId', undefined)
    form.setValue('payerUserId', undefined)
    setSubmitError(null)
    void onSubmit()
  }

  return {
    handleOpenChange,
    handleSaveAsPrivate,
    openedAtRef,
    setSubmitError,
    submitError,
    watchedHouseholdId,
    watchedVisibility,
  }
}
