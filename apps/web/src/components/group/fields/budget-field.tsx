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

import type { GroupFormValues } from './schema'

type BaseFieldProps = {
  control: Control<GroupFormValues>
  isSubmitting: boolean
}

function BudgetField({ control, isSubmitting }: BaseFieldProps) {
  return (
    <Controller
      control={control}
      name='eventBudget'
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor='group-budget'>
            {t('groups.fields.eventBudget.label')}
          </FieldLabel>
          <FieldContent>
            <Input
              aria-invalid={fieldState.invalid}
              disabled={isSubmitting}
              id='group-budget'
              placeholder={t('groups.fields.eventBudget.placeholder')}
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

export { BudgetField }
