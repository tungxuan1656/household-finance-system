'use client'

import { useController } from 'react-hook-form'

import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import { t } from '@/lib/i18n/t'

import type { FieldProps } from './shared'

export function NoteField({ control, isSubmitting }: FieldProps) {
  const { field, fieldState } = useController({ control, name: 'note' })

  return (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor='expense-note'>{t('expense.note')}</FieldLabel>
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
  )
}
