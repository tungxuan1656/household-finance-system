'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useEffect, useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { type z } from 'zod'

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
import { useCreateExpenseMutation } from '@/hooks/api/use-expense'
import { useCurrentUserProfileQuery } from '@/hooks/api/use-profile'
import { expenseFormSchema } from '@/lib/forms/expense.schema'
import { t } from '@/lib/i18n/t'
import { getCategoryLabel } from '@/lib/reference-data/labels'
import type { CreateExpenseRequest } from '@/types/expense'
import type { HouseholdDTO } from '@/types/household'
import type {
  CategoryKey,
  ReferenceCategoryDTO,
  SourceKey,
} from '@/types/reference-data'

type ExpenseFormInput = z.input<typeof expenseFormSchema>

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

type ExpenseFormProps = {
  categories: ReferenceCategoryDTO[]
  households: HouseholdDTO[]
  onSuccess?: () => void
}

export function ExpenseForm({
  categories,
  households,
  onSuccess,
}: ExpenseFormProps) {
  const { data: profile } = useCurrentUserProfileQuery()
  const createExpense = useCreateExpenseMutation()

  const form = useForm<ExpenseFormInput>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      amount: undefined as unknown as number,
      categoryKey: undefined as unknown as CategoryKey,
      sourceKey: undefined as unknown as SourceKey,
      title: '',
      occurredAt: Date.now(),
      note: '',
      visibility: 'private',
      householdId: undefined,
    },
    mode: 'onSubmit',
  })

  const watchedCategoryKey = form.watch('categoryKey')
  const watchedVisibility = form.watch('visibility')
  const watchedTitle = form.watch('title')

  const categoryLabel = useMemo(() => {
    if (!watchedCategoryKey) return ''

    return getCategoryLabel(watchedCategoryKey)
  }, [watchedCategoryKey])

  // Smart default: populate title from category label when title is empty
  useEffect(() => {
    if (categoryLabel && !watchedTitle) {
      form.setValue('title', categoryLabel, { shouldValidate: true })
    }
  }, [categoryLabel, watchedTitle, form])

  const onSubmit = useCallback(
    (values: ExpenseFormInput) => {
      const payload: CreateExpenseRequest = {
        amount: values.amount,
        categoryKey: values.categoryKey,
        sourceKey: values.sourceKey,
        title: values.title,
        occurredAt: values.occurredAt,
        ...(values.note ? { note: values.note } : {}),
        visibility: values.visibility ?? 'private',
        ...(values.visibility === 'household' && values.householdId
          ? { householdId: values.householdId }
          : {}),
      }

      createExpense.mutate(payload, {
        onSuccess: () => {
          form.reset()
          onSuccess?.()
        },
      })
    },
    [createExpense, form, onSuccess],
  )

  const isSubmitting = createExpense.isPending

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
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value)
                }}
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
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value)
                }}
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
          <Input
            readOnly
            className='cursor-default bg-muted'
            value={profile?.displayName ?? ''}
          />
        </Field>
      </FieldGroup>

      <div className='flex items-center gap-2'>
        <Button
          disabled={isSubmitting}
          type='button'
          variant='outline'
          onClick={() => form.reset()}>
          {t('common.actions.cancel')}
        </Button>
        <Button disabled={isSubmitting} type='submit'>
          {isSubmitting ? t('expense.addTitle') : t('expense.addTitle')}
        </Button>
      </div>
    </form>
  )
}
