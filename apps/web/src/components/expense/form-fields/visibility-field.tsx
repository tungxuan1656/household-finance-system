'use client'

import { useController } from 'react-hook-form'

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field'
import { Switch } from '@/components/ui/switch'
import { t } from '@/lib/i18n/t'

import type { FieldProps } from './shared'

export function VisibilityField({ control, isSubmitting }: FieldProps) {
  const { field, fieldState } = useController({ control, name: 'visibility' })

  return (
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
  )
}
