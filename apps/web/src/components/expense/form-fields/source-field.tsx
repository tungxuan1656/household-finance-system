'use client'

import { useController } from 'react-hook-form'

import { SourcePicker } from '@/components/expense/source-picker'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { t } from '@/lib/i18n/t'

import type { FieldProps } from './shared'

export function SourceField({ control, isSubmitting }: FieldProps) {
  const { field, fieldState } = useController({ control, name: 'sourceKey' })

  return (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor='expense-source'>{t('expense.source')}</FieldLabel>
      <SourcePicker
        disabled={isSubmitting}
        id='expense-source'
        value={field.value}
        onValueChange={(value) => field.onChange(value)}
      />
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  )
}
