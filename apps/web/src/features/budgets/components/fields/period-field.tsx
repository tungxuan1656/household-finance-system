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

type PeriodFieldProps = {
  control: Control<BudgetFormValues>
  isSubmitting: boolean
}

function PeriodField({ control, isSubmitting }: PeriodFieldProps) {
  return (
    <Controller
      control={control}
      name='period'
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor='budget-period'>
            {t('budgets.fields.period.label')}
          </FieldLabel>
          <FieldContent>
            <Input
              aria-invalid={fieldState.invalid}
              disabled={isSubmitting}
              id='budget-period'
              placeholder={t('budgets.fields.period.placeholder')}
              type='month'
              value={field.value ?? ''}
              onBlur={field.onBlur}
              onChange={(e) => field.onChange(e.target.value)}
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

export { PeriodField }
