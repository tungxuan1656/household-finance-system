'use client'

import { useEffect, useMemo, useRef } from 'react'
import { toast } from 'sonner'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  useDeleteExpenseMutation,
  useRecentQuickAddExpensesQuery,
} from '@/hooks/api/use-expense'
import { useExpenseGroupListQuery } from '@/hooks/api/use-groups'
import {
  useHouseholdMembersQuery,
  useHouseholdsQuery,
} from '@/hooks/api/use-households'
import {
  useCurrentUserProfileQuery,
  useUpdateCurrentUserProfileMutation,
} from '@/hooks/api/use-profile'
import { useReferenceCategoriesQuery } from '@/hooks/api/use-reference-data'
import type { ExpenseFormInputValues } from '@/lib/forms/expense.schema'
import { t } from '@/lib/i18n/t'

import {
  buildQuickAddInitialValues,
  buildQuickAddSubmitError,
} from './quick-add/quick-add-defaults'
import { QuickAddExpenseForm } from './quick-add/quick-add-expense-form'
import {
  reportQuickAddSuccessTiming,
  showQuickAddUndoToast,
} from './quick-add/quick-add-toast-effects'
import { useQuickAddDialogState } from './quick-add/use-quick-add-dialog-state'
import { useExpenseForm } from './use-expense-form'

type QuickAddExpenseDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function QuickAddExpenseDialog({
  open,
  onOpenChange,
}: QuickAddExpenseDialogProps) {
  const deleteExpense = useDeleteExpenseMutation()
  const updateProfile = useUpdateCurrentUserProfileMutation()
  const { data: categoriesResponse } = useReferenceCategoriesQuery()
  const { data: householdsResponse } = useHouseholdsQuery()
  const { data: profile } = useCurrentUserProfileQuery()
  const { data: recentExpensesResponse } = useRecentQuickAddExpensesQuery()

  const recentExpenses = recentExpensesResponse?.items

  const initialValues = useMemo(
    () =>
      buildQuickAddInitialValues({
        profile,
        recentExpenses,
      }),
    [profile, recentExpenses, open],
  )

  const { form, onSubmit, isSubmitting } = useExpenseForm({
    initialValues: initialValues as ExpenseFormInputValues,
    mode: 'create',
    resetOnInitialValuesChange: false,
    onSuccess: (expense, values) => {
      reportQuickAddSuccessTiming({
        openedAt: openedAtRef.current,
        visibility: values.visibility ?? 'private',
      })

      const finishSuccess = () => {
        setSubmitError(null)
        handleOpenChange(false, onOpenChange)
        showQuickAddUndoToast(expense, deleteExpense.mutate)
      }

      const sourceKey = values.sourceKey
      if (sourceKey) {
        updateProfile.mutate(
          { quickAddLastSourceKey: sourceKey },
          {
            onError: () => {
              toast.error(t('expense.quickAdd.retryHint'))
            },
            onSettled: finishSuccess,
          },
        )

        return
      }

      finishSuccess()
    },
    onError: (error) => {
      setSubmitError(buildQuickAddSubmitError(error))
    },
    suppressCreateErrorToast: true,
  })

  const amountInputRef = useRef<HTMLInputElement | null>(null)

  const {
    handleOpenChange,
    handleSaveAsPrivate,
    openedAtRef,
    setSubmitError,
    submitError,
    watchedHouseholdId,
    watchedVisibility,
  } = useQuickAddDialogState({
    amountInputRef,
    form,
    initialValues,
    open,
    recentExpenses,
  })

  const isSaving = isSubmitting || updateProfile.isPending

  const { data: householdMembersResponse } = useHouseholdMembersQuery(
    watchedVisibility === 'household' ? watchedHouseholdId : undefined,
  )
  const { data: groupListResponse } = useExpenseGroupListQuery(
    watchedVisibility === 'household' ? watchedHouseholdId : undefined,
  )

  const categories = useMemo(
    () =>
      (categoriesResponse?.items ?? []).filter(
        (item) => item.kind === 'expense',
      ),
    [categoriesResponse?.items],
  )
  const households = householdsResponse?.items ?? []
  const payerOptions = householdMembersResponse?.items ?? []
  const groups = groupListResponse?.items ?? []

  useEffect(() => {
    if (watchedVisibility !== 'household') {
      return
    }

    const payerUserId = form.getValues('payerUserId')
    const hasMatchingPayer = payerOptions.some(
      (member) => member.userId === payerUserId,
    )

    if (hasMatchingPayer) {
      return
    }

    const defaultPayerUserId = payerOptions.some(
      (member) => member.userId === profile?.id,
    )
      ? profile?.id
      : payerOptions[0]?.userId

    form.setValue('payerUserId', defaultPayerUserId, {
      shouldDirty: true,
      shouldValidate: true,
    })
  }, [form, payerOptions, profile?.id, watchedVisibility])

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => handleOpenChange(nextOpen, onOpenChange)}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{t('expense.quickAdd.title')}</DialogTitle>
          <DialogDescription>
            {t('expense.quickAdd.description')}
          </DialogDescription>
        </DialogHeader>

        <QuickAddExpenseForm
          categories={categories}
          control={form.control}
          groups={groups}
          handleSubmit={form.handleSubmit}
          households={households}
          inputRef={(node) => {
            amountInputRef.current = node
          }}
          isSaving={isSaving}
          isSubmitting={isSubmitting}
          payerOptions={payerOptions}
          profile={profile}
          submitError={submitError}
          watchedVisibility={watchedVisibility}
          onCancel={() => handleOpenChange(false, onOpenChange)}
          onSaveAsPrivate={() =>
            handleSaveAsPrivate(form.handleSubmit(onSubmit))
          }
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  )
}
