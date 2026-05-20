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

type TotalLimitFieldProps = {
  control: Control<BudgetFormValues>
  isSubmitting: boolean
}

function TotalLimitField({ control, isSubmitting }: TotalLimitFieldProps) {
  return (
    <Controller
      control={control}
      name='totalLimit'
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor='budget-total-limit'>
            {t('budgets.fields.totalLimit.label')}
          </FieldLabel>
          <FieldContent>
            <Input
              aria-invalid={fieldState.invalid}
              disabled={isSubmitting}
              id='budget-total-limit'
              placeholder={t('budgets.fields.totalLimit.placeholder')}
              type='number'
              value={field.value ?? ''}
              onBlur={field.onBlur}
              onChange={(e) => {
                const val = e.target.value
                field.onChange(val === '' ? undefined : Number(val))
              }}
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

export { TotalLimitField }
