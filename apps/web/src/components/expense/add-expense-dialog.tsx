'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import {
  useCreateExpenseMutation,
  useDeleteExpenseMutation,
} from '@/hooks/api/use-expense'
import { useExpenseGroupListQuery } from '@/hooks/api/use-groups'
import { useHouseholdsQuery } from '@/hooks/api/use-households'
import {
  useCurrentUserProfileQuery,
  useUpdateCurrentUserProfileMutation,
} from '@/hooks/api/use-profile'
import { useReferenceCategoriesQuery } from '@/hooks/api/use-reference-data'
import { t } from '@/lib/i18n/t'
import type { CreateExpenseRequest } from '@/types/expense'
import type { ExpenseGroupDTO } from '@/types/group'
import type { CategoryKey, SourceKey } from '@/types/reference-data'

import { Button } from '../ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { Field, FieldError, FieldGroup, FieldLabel } from '../ui/field'
import { Input } from '../ui/input'
import { NativeSelect, NativeSelectOption } from '../ui/native-select'
import { CategoryPicker } from './category-picker'
import {
  formatDialogAmountDisplay,
  parseDialogAmountSubmitMinor,
} from './dialog-amount-helper'
import {
  formatOccurredAtDate,
  getExpenseTitlePlaceholder,
  parseOccurredAtDate,
} from './form-fields/field-helpers'
import { SourcePicker } from './source-picker'

export type AddExpenseDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type AddExpenseFormState = {
  amountInput: string
  categoryKey: CategoryKey | null
  sourceKey: SourceKey | ''
  title: string
  occurredOn: string
  householdId: string
  groupId: string
}

type AddExpenseFormErrors = Partial<Record<keyof AddExpenseFormState, string>>

const sanitizeDigits = (value: string) => value.replace(/\D+/g, '')

const buildInitialState = (
  lastSourceKey: SourceKey | null,
): AddExpenseFormState => ({
  amountInput: '',
  categoryKey: null,
  sourceKey: lastSourceKey ?? 'cash',
  title: '',
  occurredOn: formatOccurredAtDate(Date.now()),
  householdId: '',
  groupId: '',
})

const mergeGroups = (
  personalGroups: ExpenseGroupDTO[],
  householdGroups: ExpenseGroupDTO[],
) => {
  const deduped = new Map<string, ExpenseGroupDTO>()

  for (const group of [...personalGroups, ...householdGroups]) {
    deduped.set(group.id, group)
  }

  return [...deduped.values()]
}

export function AddExpenseDialog({
  open,
  onOpenChange,
}: AddExpenseDialogProps) {
  const createExpense = useCreateExpenseMutation()
  const deleteExpense = useDeleteExpenseMutation()
  const updateProfile = useUpdateCurrentUserProfileMutation()
  const { data: categoriesResponse } = useReferenceCategoriesQuery()
  const { data: householdsResponse } = useHouseholdsQuery()
  const { data: profile } = useCurrentUserProfileQuery()
  const { data: personalGroupsResponse } = useExpenseGroupListQuery(undefined)

  const [formState, setFormState] = useState<AddExpenseFormState>(() =>
    buildInitialState(null),
  )
  const [errors, setErrors] = useState<AddExpenseFormErrors>({})

  useEffect(() => {
    if (!open) {
      return
    }

    setFormState(buildInitialState(profile?.quickAddLastSourceKey ?? null))
    setErrors({})
  }, [open])

  const selectedHouseholdId = formState.householdId || undefined
  const { data: householdGroupsResponse } =
    useExpenseGroupListQuery(selectedHouseholdId)

  const categories = useMemo(
    () =>
      (categoriesResponse?.items ?? []).filter(
        (category) => category.kind === 'expense',
      ),
    [categoriesResponse?.items],
  )
  const households = householdsResponse?.items ?? []
  const groups = useMemo(
    () =>
      mergeGroups(
        personalGroupsResponse?.items ?? [],
        selectedHouseholdId ? (householdGroupsResponse?.items ?? []) : [],
      ),
    [
      householdGroupsResponse?.items,
      personalGroupsResponse?.items,
      selectedHouseholdId,
    ],
  )

  const isSubmitting = createExpense.isPending
  const amountDisplay = formatDialogAmountDisplay(formState.amountInput)
  const titlePlaceholder = getExpenseTitlePlaceholder(
    formState.categoryKey ?? undefined,
  )

  const setField = <K extends keyof AddExpenseFormState>(
    key: K,
    value: AddExpenseFormState[K],
  ) => {
    setFormState((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: undefined }))
  }

  const validate = () => {
    const nextErrors: AddExpenseFormErrors = {}
    const amount = parseDialogAmountSubmitMinor(formState.amountInput)

    if (amount === null || amount <= 0) {
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

    setErrors(nextErrors)

    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) {
      return
    }

    const amount = parseDialogAmountSubmitMinor(formState.amountInput)
    const occurredAt = parseOccurredAtDate(formState.occurredOn)

    if (
      amount === null ||
      !occurredAt ||
      !formState.categoryKey ||
      !formState.sourceKey
    ) {
      return
    }

    const payload: CreateExpenseRequest = {
      amount,
      categoryKey: formState.categoryKey,
      sourceKey: formState.sourceKey,
      title: formState.title.trim(),
      occurredAt,
      visibility: formState.householdId ? 'household' : 'private',
      ...(formState.householdId ? { householdId: formState.householdId } : {}),
      ...(formState.groupId ? { groupIds: [formState.groupId] } : {}),
    }

    createExpense.mutate(payload, {
      onError: () => {
        toast.error(t('expense.submitError'))
      },
      onSuccess: (expense) => {
        updateProfile.mutate(
          { quickAddLastSourceKey: payload.sourceKey },
          { onError: () => undefined },
        )

        onOpenChange(false)

        toast.success(t('expense.success'), {
          action: {
            label: t('expense.quickAdd.undo'),
            onClick: () => {
              deleteExpense.mutate(expense.id, {
                onError: () => {
                  toast.error(t('expense.quickAdd.undoError'))
                },
              })
            },
          },
          duration: 5000,
        })
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>{t('expense.addTitle')}</DialogTitle>
          <DialogDescription>
            {t('expense.createDialog.description')}
          </DialogDescription>
        </DialogHeader>

        <FieldGroup className='grid gap-4 md:grid-cols-2'>
          <Field data-invalid={!!errors.amountInput}>
            <FieldLabel htmlFor='add-expense-amount'>
              {t('expense.amount')}
            </FieldLabel>
            <Input
              aria-invalid={!!errors.amountInput}
              className='font-mono tabular-nums'
              disabled={isSubmitting}
              id='add-expense-amount'
              inputMode='numeric'
              placeholder='0 đ'
              size='sm'
              type='text'
              value={amountDisplay}
              onChange={(event) => {
                setField('amountInput', sanitizeDigits(event.target.value))
              }}
            />
            <FieldError>{errors.amountInput}</FieldError>
          </Field>

          <Field data-invalid={!!errors.occurredOn}>
            <FieldLabel htmlFor='add-expense-date'>
              {t('expense.date')}
            </FieldLabel>
            <Input
              aria-invalid={!!errors.occurredOn}
              disabled={isSubmitting}
              id='add-expense-date'
              size='sm'
              type='date'
              value={formState.occurredOn}
              onChange={(event) => {
                setField('occurredOn', event.target.value)
              }}
            />
            <FieldError>{errors.occurredOn}</FieldError>
          </Field>

          <Field data-invalid={!!errors.sourceKey}>
            <FieldLabel htmlFor='add-expense-source'>
              {t('expense.source')}
            </FieldLabel>
            <SourcePicker
              disabled={isSubmitting}
              id='add-expense-source'
              size='sm'
              value={formState.sourceKey || undefined}
              onValueChange={(value) => {
                setField('sourceKey', value)
              }}
            />
            <FieldError>{errors.sourceKey}</FieldError>
          </Field>

          <Field data-invalid={!!errors.categoryKey}>
            <FieldLabel htmlFor='add-expense-category'>
              {t('expense.category')}
            </FieldLabel>
            <CategoryPicker
              categories={categories}
              disabled={isSubmitting}
              id='add-expense-category'
              portal={false}
              value={formState.categoryKey}
              onValueChange={(value) => {
                setField('categoryKey', value)
              }}
            />
            <FieldError>{errors.categoryKey}</FieldError>
          </Field>

          <Field className='md:col-span-2' data-invalid={!!errors.title}>
            <FieldLabel htmlFor='add-expense-title'>
              {t('expense.content')}
            </FieldLabel>
            <Input
              aria-invalid={!!errors.title}
              disabled={isSubmitting}
              id='add-expense-title'
              placeholder={titlePlaceholder}
              size='sm'
              value={formState.title}
              onChange={(event) => {
                setField('title', event.target.value)
              }}
            />
            <FieldError>{errors.title}</FieldError>
          </Field>

          <Field>
            <FieldLabel htmlFor='add-expense-household'>
              {t('expense.household')}
            </FieldLabel>
            <NativeSelect
              disabled={isSubmitting}
              id='add-expense-household'
              size='sm'
              value={formState.householdId}
              onChange={(event) => {
                setField('householdId', event.target.value)
              }}>
              <NativeSelectOption value=''>
                {t('expense.none')}
              </NativeSelectOption>
              {households.map((household) => (
                <NativeSelectOption key={household.id} value={household.id}>
                  {household.name}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </Field>

          <Field>
            <FieldLabel htmlFor='add-expense-group'>
              {t('expense.group')}
            </FieldLabel>
            <NativeSelect
              disabled={isSubmitting}
              id='add-expense-group'
              size='sm'
              value={formState.groupId}
              onChange={(event) => {
                setField('groupId', event.target.value)
              }}>
              <NativeSelectOption value=''>
                {t('expense.none')}
              </NativeSelectOption>
              {groups.map((group) => (
                <NativeSelectOption key={group.id} value={group.id}>
                  {group.name}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </Field>
        </FieldGroup>

        <DialogFooter>
          <Button
            disabled={isSubmitting}
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}>
            {t('common.actions.cancel')}
          </Button>
          <Button disabled={isSubmitting} type='button' onClick={handleSubmit}>
            {isSubmitting ? t('expense.submitting') : t('expense.addTitle')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
