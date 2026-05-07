'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

import { ApiClientError } from '@/api/client'
import {
  AmountField,
  CategoryField,
  DateField,
  GroupField,
  HouseholdField,
  NoteField,
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
import { reportQuickAddTiming } from '@/lib/metrics/quick-add-metrics'
import type { ExpenseDTO } from '@/types/expense'
import type { ExpenseVisibility } from '@/types/expense'
import type { CurrentUserProfileDTO } from '@/types/profile'
import type { CategoryKey } from '@/types/reference-data'
import { SOURCE_KEYS, type SourceKey } from '@/types/reference-data'

import { useExpenseForm } from './use-expense-form'

const isSourceKey = (value: string | null): value is SourceKey =>
  value !== null && SOURCE_KEYS.includes(value as SourceKey)

type QuickAddExpenseDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const buildQuickAddInitialValues = ({
  profile,
  recentExpenses,
}: {
  profile?: CurrentUserProfileDTO
  recentExpenses?: ExpenseDTO[]
}): Partial<ExpenseFormInputValues> => {
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

export function QuickAddExpenseDialog({
  open,
  onOpenChange,
}: QuickAddExpenseDialogProps) {
  const amountInputRef = useRef<HTMLInputElement | null>(null)
  const openedAtRef = useRef<number | null>(null)
  const wasOpenRef = useRef(false)
  const didApplyInitialDefaultsRef = useRef(false)
  const allowCategoryAutofillRef = useRef(true)
  const previousCategoryKeyRef = useRef<string | undefined>(undefined)
  const deleteExpense = useDeleteExpenseMutation()
  const updateProfile = useUpdateCurrentUserProfileMutation()
  const { data: categoriesResponse } = useReferenceCategoriesQuery()
  const { data: householdsResponse } = useHouseholdsQuery()
  const { data: profile } = useCurrentUserProfileQuery()
  const { data: recentExpensesResponse } = useRecentQuickAddExpensesQuery()
  const [submitError, setSubmitError] = useState<QuickAddSubmitError | null>(
    null,
  )

  const recentExpenses = recentExpensesResponse?.items

  const initialValues = useMemo(
    () =>
      buildQuickAddInitialValues({
        profile,
        recentExpenses,
      }),
    [profile, recentExpenses, open],
  )

  const { form, onSubmit, isSubmitting, watchedVisibility } = useExpenseForm({
    initialValues: initialValues as ExpenseFormInputValues,
    mode: 'create',
    resetOnInitialValuesChange: false,
    onSuccess: (expense, values) => {
      reportTiming({
        openedAt: openedAtRef.current,
        visibility: values.visibility ?? 'private',
      })

      const finishSuccess = () => {
        setSubmitError(null)
        handleOpenChange(false)
        showUndoToast(expense, deleteExpense.mutate)
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

  const watchedHouseholdId = form.watch('householdId')
  const watchedSourceKey = form.watch('sourceKey')
  const watchedCategoryKey = form.watch('categoryKey')
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

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setSubmitError(null)
      openedAtRef.current = null
    }

    onOpenChange(nextOpen)
  }

  const handleSaveAsPrivate = () => {
    form.setValue('visibility', 'private', {
      shouldDirty: true,
      shouldValidate: true,
    })

    form.setValue('householdId', undefined)
    form.setValue('payerUserId', undefined)
    setSubmitError(null)
    void form.handleSubmit(onSubmit)()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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
          {submitError ? (
            <div className='rounded-md border border-border bg-muted/50 p-3 text-sm'>
              <div>{submitError.message}</div>
              <div className='text-muted-foreground'>{submitError.hint}</div>
              {submitError.kind === 'permission' ? (
                <Button
                  className='mt-3'
                  disabled={isSubmitting}
                  type='button'
                  variant='outline'
                  onClick={handleSaveAsPrivate}>
                  {t('expense.quickAdd.saveAsPrivate')}
                </Button>
              ) : null}
            </div>
          ) : null}

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
            <NoteField control={form.control} isSubmitting={isSubmitting} />
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
                <GroupField
                  control={form.control}
                  groups={groups}
                  isSubmitting={isSubmitting}
                />
              </>
            ) : null}
          </FieldGroup>

          <div className='flex items-center justify-end gap-2'>
            <Button
              type='button'
              variant='outline'
              onClick={() => handleOpenChange(false)}>
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

function getQuickAddDefaultCategory({
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

type QuickAddSubmitError = {
  kind: 'network' | 'permission' | 'generic'
  message: string
  hint: string
}

function buildQuickAddSubmitError(error: Error): QuickAddSubmitError {
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

function reportTiming({
  openedAt,
  visibility,
}: {
  openedAt: number | null
  visibility: 'private' | 'household'
}) {
  if (openedAt === null) {
    return
  }

  reportQuickAddTiming({
    durationMs: Math.max(0, performance.now() - openedAt),
    visibility,
    wasHousehold: visibility === 'household',
  })
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
