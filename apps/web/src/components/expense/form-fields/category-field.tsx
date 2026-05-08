'use client'

import { useController } from 'react-hook-form'

import { CategoryPicker } from '@/components/expense/category-picker'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { t } from '@/lib/i18n/t'
import type { ReferenceCategoryDTO } from '@/types/reference-data'

import type { FieldProps } from './shared'

type CategoryFieldProps = FieldProps & {
  categories: ReferenceCategoryDTO[]
}

export function CategoryField({
  control,
  isSubmitting,
  categories,
}: CategoryFieldProps) {
  const { field, fieldState } = useController({ control, name: 'categoryKey' })

  return (
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
  )
}
