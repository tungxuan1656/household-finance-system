'use client'

import { type Control, Controller } from 'react-hook-form'

import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { t } from '@/lib/i18n/t'

import type { BudgetFormValues } from './schema'

type CurrencyCodeFieldProps = {
  control: Control<BudgetFormValues>
  isSubmitting: boolean
}

function CurrencyCodeField({ control, isSubmitting }: CurrencyCodeFieldProps) {
  return (
    <Controller
      control={control}
      name='currencyCode'
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor='budget-currency-code'>
            {t('budgets.fields.currencyCode.label')}
          </FieldLabel>
          <FieldContent>
            <Input
              aria-invalid={fieldState.invalid}
              disabled={isSubmitting}
              id='budget-currency-code'
              maxLength={3}
              placeholder={t('budgets.fields.currencyCode.placeholder')}
              type='text'
              value={field.value ?? ''}
              onBlur={field.onBlur}
              onChange={(e) => field.onChange(e.target.value.toUpperCase())}
            />
            {fieldState.invalid ? (
              <FieldError errors={[fieldState.error]} />
            ) : null}
          </FieldContent>
        </Field>
      )}
    />
  )
}

export { CurrencyCodeField }
