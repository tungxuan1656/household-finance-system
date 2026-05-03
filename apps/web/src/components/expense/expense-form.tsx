'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useEffect, useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { CategoryPicker } from '@/components/expense/category-picker'
import { SourcePicker } from '@/components/expense/source-picker'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
} from '@/hooks/api/use-expense'
import { useCurrentUserProfileQuery } from '@/hooks/api/use-profile'
import {
  type ExpenseFormInputValues,
  expenseFormSchema,
} from '@/lib/forms/expense.schema'
import { t } from '@/lib/i18n/t'
import { getCategoryLabel } from '@/lib/reference-data/labels'
import type { ExpenseDTO, UpdateExpenseMutationInput } from '@/types/expense'
import type { CreateExpenseRequest } from '@/types/expense'
import type { HouseholdDTO, HouseholdMemberDTO } from '@/types/household'
import type { ReferenceCategoryDTO } from '@/types/reference-data'

function timestampToLocalDate(ts: number): string {
  const d = new Date(ts)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function localDateToTimestamp(dateStr: string): number {
  const [year, month, day] = dateStr.split('-').map(Number)

  return new Date(year, month - 1, day).getTime()
}

type ExpenseFormMode = 'create' | 'edit'

type ExpenseFormProps = {
  categories: ReferenceCategoryDTO[]
  households: HouseholdDTO[]
  expenseId?: string
  initialValues?: ExpenseFormInputValues
  mode?: ExpenseFormMode
  onCancel?: () => void
  onError?: (error: Error) => void
  payerOptions?: HouseholdMemberDTO[]
  onSuccess?: (expense: ExpenseDTO) => void
}

const buildDefaultValues = (
  initialValues?: ExpenseFormInputValues,
): Partial<ExpenseFormInputValues> => ({
  amount: initialValues?.amount,
  categoryKey: initialValues?.categoryKey,
  sourceKey: initialValues?.sourceKey,
  title: initialValues?.title ?? '',
  occurredAt: initialValues?.occurredAt ?? Date.now(),
  note: initialValues?.note ?? '',
  payerUserId: initialValues?.payerUserId,
  visibility: initialValues?.visibility ?? 'private',
  householdId: initialValues?.householdId,
})

export function ExpenseForm({
  categories,
  households,
  expenseId,
  initialValues,
  mode = 'create',
  onCancel,
  onError,
  payerOptions = [],
  onSuccess,
}: ExpenseFormProps) {
  const { data: profile } = useCurrentUserProfileQuery()
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

  return (
    <form
      className='flex flex-col gap-6'
      onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          control={form.control}
          name='amount'
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor='expense-amount'>
                {t('expense.amount')}
              </FieldLabel>
              <Input
                {...field}
                aria-invalid={fieldState.invalid}
                className='h-12 text-2xl font-semibold'
                disabled={isSubmitting}
                id='expense-amount'
                inputMode='decimal'
                min='0'
                placeholder='0'
                step='0.01'
                type='number'
                value={field.value ?? ''}
                onChange={(e) => {
                  const val = e.target.value
                  field.onChange(val === '' ? undefined : parseFloat(val))
                }}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name='categoryKey'
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor='expense-category'>
                {t('expense.category')}
              </FieldLabel>
              <CategoryPicker
                categories={categories}
                disabled={isSubmitting}
                id='expense-category'
                value={field.value}
                onValueChange={(value) => field.onChange(value)}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name='sourceKey'
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor='expense-source'>
                {t('expense.source')}
              </FieldLabel>
              <SourcePicker
                disabled={isSubmitting}
                id='expense-source'
                value={field.value}
                onValueChange={(value) => field.onChange(value)}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name='title'
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor='expense-title'>
                {t('expense.title')}
              </FieldLabel>
              <Input
                {...field}
                aria-invalid={fieldState.invalid}
                disabled={isSubmitting}
                id='expense-title'
                placeholder={categoryLabel || t('expense.title')}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name='occurredAt'
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor='expense-date'>
                {t('expense.date')}
              </FieldLabel>
              <Input
                aria-invalid={fieldState.invalid}
                disabled={isSubmitting}
                id='expense-date'
                type='date'
                value={field.value ? timestampToLocalDate(field.value) : ''}
                onChange={(e) => {
                  const val = e.target.value
                  field.onChange(val ? localDateToTimestamp(val) : undefined)
                }}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name='note'
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor='expense-note'>
                {t('expense.note')}
              </FieldLabel>
              <Textarea
                {...field}
                aria-invalid={fieldState.invalid}
                disabled={isSubmitting}
                id='expense-note'
                placeholder={t('expense.note')}
                value={field.value ?? ''}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name='visibility'
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} orientation='horizontal'>
              <FieldLabel htmlFor='expense-visibility'>
                {t('expense.visibilityLabel')}
              </FieldLabel>
              <Switch
                aria-invalid={fieldState.invalid}
                checked={field.value === 'household'}
                disabled={isSubmitting}
                id='expense-visibility'
                onCheckedChange={(checked) => {
                  field.onChange(checked ? 'household' : 'private')
                }}
              />
              <FieldDescription>
                {field.value === 'household'
                  ? t('expense.visibility.household')
                  : t('expense.visibility.private')}
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {watchedVisibility === 'household' && (
          <Controller
            control={form.control}
            name='householdId'
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor='expense-household'>
                  {t('expense.selectHousehold')}
                </FieldLabel>
                <NativeSelect
                  aria-invalid={fieldState.invalid}
                  disabled={isSubmitting}
                  id='expense-household'
                  value={field.value ?? ''}
                  onChange={(e) => {
                    field.onChange(e.target.value || undefined)
                  }}>
                  <NativeSelectOption value=''>
                    {t('expense.selectHousehold')}
                  </NativeSelectOption>
                  {households.map((household) => (
                    <NativeSelectOption key={household.id} value={household.id}>
                      {household.name}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        )}

        <Field>
          <FieldLabel>{t('expense.payer')}</FieldLabel>
          {watchedVisibility === 'household' && payerOptions.length > 0 ? (
            <Controller
              control={form.control}
              name='payerUserId'
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <NativeSelect
                    aria-invalid={fieldState.invalid}
                    disabled={isSubmitting}
                    value={field.value ?? profile?.id ?? ''}
                    onChange={(event) => {
                      field.onChange(event.target.value || undefined)
                    }}>
                    {payerOptions.map((member) => (
                      <NativeSelectOption
                        key={member.userId}
                        value={member.userId}>
                        {member.name}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                  {fieldState.invalid ? (
                    <FieldError errors={[fieldState.error]} />
                  ) : null}
                </Field>
              )}
            />
          ) : (
            <Input
              readOnly
              className='cursor-default bg-muted'
              value={profile?.displayName ?? ''}
            />
          )}
        </Field>
      </FieldGroup>

      <div className='flex items-center gap-2'>
        <Button
          disabled={isSubmitting}
          type='button'
          variant='outline'
          onClick={() => {
            if (onCancel) {
              onCancel()

              return
            }

            form.reset(defaultValues)
          }}>
          {t('common.actions.cancel')}
        </Button>
        <Button disabled={isSubmitting} type='submit'>
          {mode === 'edit'
            ? isSubmitting
              ? t('expense.updating')
              : t('expense.saveChanges')
            : isSubmitting
              ? t('expense.submitting')
              : t('expense.addTitle')}
        </Button>
      </div>
    </form>
  )
}
