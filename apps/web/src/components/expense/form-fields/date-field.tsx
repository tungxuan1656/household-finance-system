'use client'

import { useController } from 'react-hook-form'

import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { t } from '@/lib/i18n/t'

import { formatOccurredAtDate, parseOccurredAtDate } from './field-helpers'
import type { FieldProps } from './shared'

export function DateField({ control, isSubmitting }: FieldProps) {
  const { field, fieldState } = useController({ control, name: 'occurredAt' })

  return (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor='expense-date'>{t('expense.date')}</FieldLabel>
      <Input
        aria-invalid={fieldState.invalid}
        disabled={isSubmitting}
        id='expense-date'
        type='date'
        value={formatOccurredAtDate(field.value)}
        onChange={(e) => {
          field.onChange(parseOccurredAtDate(e.target.value))
        }}
      />
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  )
}
