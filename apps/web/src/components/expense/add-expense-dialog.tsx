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
import { useIsMobile } from '@/hooks/shared/use-mobile'
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
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '../ui/drawer'
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
type CategoryOption = {
  key: CategoryKey
  kind: 'expense'
  iconUrl: string
  color: string
}
type HouseholdOption = { id: string; name: string }

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
) => [
  ...new Map(
    [...personalGroups, ...householdGroups].map((group) => [group.id, group]),
  ).values(),
]

function FieldRow({
  label,
  htmlFor,
  children,
}: {
  label: string
  htmlFor: string
  children: React.ReactNode
}) {
  return (
    <Field className='flex-row items-start gap-3'>
      <FieldLabel className='w-24 shrink-0 pt-2 sm:w-32' htmlFor={htmlFor}>
        {label}
      </FieldLabel>
      <div className='flex-1'>{children}</div>
    </Field>
  )
}

function FormBody({
  formState,
  setField,
  errors,
  isSubmitting,
  amountDisplay,
  categories,
  households,
  groups,
  titlePlaceholder,
  onSubmit,
}: {
  formState: AddExpenseFormState
  setField: <K extends keyof AddExpenseFormState>(
    key: K,
    value: AddExpenseFormState[K],
  ) => void
  errors: AddExpenseFormErrors
  isSubmitting: boolean
  amountDisplay: string
  categories: CategoryOption[]
  households: HouseholdOption[]
  groups: ExpenseGroupDTO[]
  titlePlaceholder: string
  onSubmit: () => void
}) {
  return (
    <form
      className='flex min-h-0 flex-1 flex-col'
      id='add-expense-form'
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}>
      <div className='min-h-0 flex-1 overflow-y-auto px-5 pb-4'>
        <FieldGroup className='flex flex-col gap-4'>
          <FieldRow htmlFor='add-expense-amount' label={t('expense.amount')}>
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
              onChange={(event) =>
                setField('amountInput', sanitizeDigits(event.target.value))
              }
            />
            <FieldError>{errors.amountInput}</FieldError>
          </FieldRow>
          <FieldRow htmlFor='add-expense-title' label={t('expense.content')}>
            <Input
              aria-invalid={!!errors.title}
              disabled={isSubmitting}
              id='add-expense-title'
              placeholder={titlePlaceholder}
              size='sm'
              value={formState.title}
              onChange={(event) => setField('title', event.target.value)}
            />
            <FieldError>{errors.title}</FieldError>
          </FieldRow>
          <FieldRow htmlFor='add-expense-date' label={t('expense.date')}>
            <Input
              aria-invalid={!!errors.occurredOn}
              disabled={isSubmitting}
              id='add-expense-date'
              size='sm'
              type='date'
              value={formState.occurredOn}
              onChange={(event) => setField('occurredOn', event.target.value)}
            />
            <FieldError>{errors.occurredOn}</FieldError>
          </FieldRow>
          <FieldRow
            htmlFor='add-expense-category'
            label={t('expense.category')}>
            <CategoryPicker
              categories={categories}
              disabled={isSubmitting}
              id='add-expense-category'
              size='sm'
              value={formState.categoryKey}
              onValueChange={(value) => setField('categoryKey', value)}
            />
            <FieldError>{errors.categoryKey}</FieldError>
          </FieldRow>
          <FieldRow htmlFor='add-expense-source' label={t('expense.source')}>
            <SourcePicker
              disabled={isSubmitting}
              id='add-expense-source'
              size='sm'
              value={formState.sourceKey || undefined}
              onValueChange={(value) => setField('sourceKey', value)}
            />
            <FieldError>{errors.sourceKey}</FieldError>
          </FieldRow>
          <FieldRow
            htmlFor='add-expense-household'
            label={t('expense.household')}>
            <NativeSelect
              disabled={isSubmitting}
              id='add-expense-household'
              size='sm'
              value={formState.householdId}
              onChange={(event) => setField('householdId', event.target.value)}>
              <NativeSelectOption value=''>
                {t('expense.none')}
              </NativeSelectOption>
              {households.map((household) => (
                <NativeSelectOption key={household.id} value={household.id}>
                  {household.name}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </FieldRow>
          <FieldRow htmlFor='add-expense-group' label={t('expense.group')}>
            <NativeSelect
              disabled={isSubmitting}
              id='add-expense-group'
              size='sm'
              value={formState.groupId}
              onChange={(event) => setField('groupId', event.target.value)}>
              <NativeSelectOption value=''>
                {t('expense.none')}
              </NativeSelectOption>
              {groups.map((group) => (
                <NativeSelectOption key={group.id} value={group.id}>
                  {group.name}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </FieldRow>
        </FieldGroup>
      </div>
    </form>
  )
}

export function AddExpenseDialog({
  open,
  onOpenChange,
}: AddExpenseDialogProps) {
  const isMobile = useIsMobile()
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
    if (open) {
      setFormState(buildInitialState(profile?.quickAddLastSourceKey ?? null))
      setErrors({})
    }
  }, [open, profile?.quickAddLastSourceKey])

  const selectedHouseholdId = formState.householdId || undefined
  const { data: householdGroupsResponse } =
    useExpenseGroupListQuery(selectedHouseholdId)
  const categories = useMemo<CategoryOption[]>(
    () =>
      (categoriesResponse?.items ?? []).filter(
        (category): category is CategoryOption => category.kind === 'expense',
      ),
    [categoriesResponse?.items],
  )
  const households = (householdsResponse?.items ?? []) as HouseholdOption[]
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
    setErrors(nextErrors)

    return Object.keys(nextErrors).length === 0
  }
  const handleSubmit = () => {
    if (!validate()) return

    const amount = parseDialogAmountSubmitMinor(formState.amountInput)
    const occurredAt = parseOccurredAtDate(formState.occurredOn)
    if (
      amount == null ||
      amount <= 0 ||
      !occurredAt ||
      !formState.categoryKey ||
      !formState.sourceKey
    )
      return

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

  return isMobile ? (
    <Drawer direction='bottom' open={open} onOpenChange={onOpenChange}>
      <DrawerContent className='max-h-[80vh]'>
        <DrawerHeader>
          <DrawerTitle>{t('expense.addTitle')}</DrawerTitle>
          <DrawerDescription>
            {t('expense.createDialog.description')}
          </DrawerDescription>
        </DrawerHeader>
        <FormBody
          amountDisplay={amountDisplay}
          categories={categories}
          errors={errors}
          formState={formState}
          groups={groups}
          households={households}
          isSubmitting={createExpense.isPending}
          setField={setField}
          titlePlaceholder={titlePlaceholder}
          onSubmit={handleSubmit}
        />
        <DrawerFooter>
          <DrawerClose asChild>
            <Button type='button' variant='outline'>
              {t('common.actions.cancel')}
            </Button>
          </DrawerClose>
          <Button
            disabled={createExpense.isPending}
            form='add-expense-form'
            type='submit'>
            {createExpense.isPending
              ? t('expense.submitting')
              : t('expense.addTitle')}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ) : (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>{t('expense.addTitle')}</DialogTitle>
          <DialogDescription>
            {t('expense.createDialog.description')}
          </DialogDescription>
        </DialogHeader>
        <FormBody
          amountDisplay={amountDisplay}
          categories={categories}
          errors={errors}
          formState={formState}
          groups={groups}
          households={households}
          isSubmitting={createExpense.isPending}
          setField={setField}
          titlePlaceholder={titlePlaceholder}
          onSubmit={handleSubmit}
        />
        <DialogFooter>
          <Button
            disabled={createExpense.isPending}
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}>
            {t('common.actions.cancel')}
          </Button>
          <Button
            disabled={createExpense.isPending}
            form='add-expense-form'
            type='submit'>
            {createExpense.isPending
              ? t('expense.submitting')
              : t('expense.addTitle')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
