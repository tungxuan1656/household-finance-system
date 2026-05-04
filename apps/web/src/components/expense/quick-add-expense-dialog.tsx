'use client'

import { useEffect, useMemo, useRef } from 'react'
import { toast } from 'sonner'

import {
  AmountField,
  CategoryField,
  DateField,
  HouseholdField,
  PayerField,
  SourceField,
  VisibilityField,
} from '@/components/expense/expense-form-fields'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { FieldGroup } from '@/components/ui/field'
import { useDeleteExpenseMutation } from '@/hooks/api/use-expense'
import {
  useHouseholdMembersQuery,
  useHouseholdsQuery,
} from '@/hooks/api/use-households'
import { useCurrentUserProfileQuery } from '@/hooks/api/use-profile'
import { useReferenceCategoriesQuery } from '@/hooks/api/use-reference-data'
import type { ExpenseFormInputValues } from '@/lib/forms/expense.schema'
import { t } from '@/lib/i18n/t'
import {
  readSessionStorageItem,
  writeSessionStorageItem,
} from '@/lib/storages/browser-storage'
import type { ExpenseDTO } from '@/types/expense'
import { SOURCE_KEYS, type SourceKey } from '@/types/reference-data'

import { useExpenseForm } from './use-expense-form'

const QUICK_ADD_LAST_SOURCE_KEY = 'expense-quick-add-last-source'

const isSourceKey = (value: string | null): value is SourceKey =>
  value !== null && SOURCE_KEYS.includes(value as SourceKey)

type QuickAddExpenseDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const buildQuickAddInitialValues = (): Partial<ExpenseFormInputValues> => {
  const storedSource = readSessionStorageItem(QUICK_ADD_LAST_SOURCE_KEY)
  const lastSource = isSourceKey(storedSource) ? storedSource : undefined

  return {
    occurredAt: Date.now(),
    visibility: 'private',
    sourceKey: lastSource,
  }
}

export function QuickAddExpenseDialog({
  open,
  onOpenChange,
}: QuickAddExpenseDialogProps) {
  const amountInputRef = useRef<HTMLInputElement | null>(null)
  const deleteExpense = useDeleteExpenseMutation()
  const { data: categoriesResponse } = useReferenceCategoriesQuery()
  const { data: householdsResponse } = useHouseholdsQuery()
  const { data: profile } = useCurrentUserProfileQuery()

  const initialValues = useMemo(() => buildQuickAddInitialValues(), [open])

  const { form, onSubmit, isSubmitting, watchedVisibility } = useExpenseForm({
    initialValues: initialValues as ExpenseFormInputValues,
    mode: 'create',
    onSuccess: (expense) => {
      const sourceKey = form.getValues('sourceKey')
      if (sourceKey) {
        writeSessionStorageItem(QUICK_ADD_LAST_SOURCE_KEY, sourceKey)
      }

      onOpenChange(false)
      showUndoToast(expense, deleteExpense.mutate)
    },
  })

  const watchedHouseholdId = form.watch('householdId')
  const { data: householdMembersResponse } = useHouseholdMembersQuery(
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

  useEffect(() => {
    if (!open) {
      return
    }

    const focusTimer = window.setTimeout(() => {
      amountInputRef.current?.focus()
    }, 0)

    return () => window.clearTimeout(focusTimer)
  }, [open])

  useEffect(() => {
    if (watchedVisibility !== 'household') {
      form.setValue('householdId', undefined)
      form.setValue('payerUserId', undefined)

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

  useEffect(() => {
    if (watchedVisibility !== 'household' || !watchedHouseholdId) {
      return
    }

    form.clearErrors('payerUserId')
  }, [form, watchedHouseholdId, watchedVisibility])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{t('expense.quickAdd.title')}</DialogTitle>
          <DialogDescription>
            {t('expense.quickAdd.description')}
          </DialogDescription>
        </DialogHeader>

        <form
          className='flex flex-col gap-5'
          onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <AmountField
              control={form.control}
              inputRef={(node) => {
                amountInputRef.current = node
              }}
              isSubmitting={isSubmitting}
            />
            <SourceField control={form.control} isSubmitting={isSubmitting} />
            <CategoryField
              categories={categories}
              control={form.control}
              isSubmitting={isSubmitting}
            />
            <DateField control={form.control} isSubmitting={isSubmitting} />
            <VisibilityField
              control={form.control}
              isSubmitting={isSubmitting}
            />

            {watchedVisibility === 'household' ? (
              <>
                <HouseholdField
                  control={form.control}
                  households={households}
                  isSubmitting={isSubmitting}
                />
                <PayerField
                  control={form.control}
                  isSubmitting={isSubmitting}
                  payerOptions={payerOptions}
                  profile={profile}
                  watchedVisibility={watchedVisibility}
                />
              </>
            ) : null}
          </FieldGroup>

          <div className='flex items-center justify-end gap-2'>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}>
              {t('common.actions.cancel')}
            </Button>
            <Button disabled={isSubmitting} type='submit'>
              {t('expense.quickAdd.submit')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function showUndoToast(
  expense: Pick<ExpenseDTO, 'id'>,
  deleteExpense: (
    expenseId: string,
    options?: { onError?: (error: Error) => void },
  ) => void,
) {
  let hasUndone = false

  toast.success(t('expense.quickAdd.success'), {
    action: {
      label: t('expense.quickAdd.undo'),
      onClick: () => {
        if (hasUndone) {
          return
        }

        hasUndone = true

        deleteExpense(expense.id, {
          onError: () => {
            toast.error(t('expense.quickAdd.undoError'))
          },
        })
      },
    },
    duration: 5000,
  })
}
