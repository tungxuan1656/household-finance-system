'use client'

import { useController, useWatch } from 'react-hook-form'

import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { t } from '@/lib/i18n/t'

import { getExpenseTitlePlaceholder } from './field-helpers'
import type { FieldProps } from './shared'

export function TitleField({ control, isSubmitting }: FieldProps) {
  const { field, fieldState } = useController({ control, name: 'title' })
  const watchedCategoryKey = useWatch({ control, name: 'categoryKey' })
  const placeholder =
    getExpenseTitlePlaceholder(watchedCategoryKey) || t('expense.title')

  return (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor='expense-title'>{t('expense.title')}</FieldLabel>
      <Input
        {...field}
        aria-invalid={fieldState.invalid}
        disabled={isSubmitting}
        id='expense-title'
        placeholder={placeholder}
      />
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  )
}
