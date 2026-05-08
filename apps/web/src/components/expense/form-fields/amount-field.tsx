'use client'

import { useController } from 'react-hook-form'

import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { t } from '@/lib/i18n/t'

import type { FieldProps } from './shared'

export function AmountField({ control, isSubmitting, inputRef }: FieldProps) {
  const { field, fieldState } = useController({ control, name: 'amount' })

  return (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor='expense-amount'>{t('expense.amount')}</FieldLabel>
      <Input
        {...field}
        ref={(node) => {
          field.ref(node)
          inputRef?.(node)
        }}
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
  )
}
