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

import { dateStringToTimestamp, timestampToDateString } from './date-helpers'
import type { GroupFormValues } from './schema'

type BaseFieldProps = {
  control: Control<GroupFormValues>
  isSubmitting: boolean
}

function EndDateField({ control, isSubmitting }: BaseFieldProps) {
  return (
    <Controller
      control={control}
      name='endDate'
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor='group-end-date'>
            {t('groups.fields.endDate.label')}
          </FieldLabel>
          <FieldContent>
            <Input
              aria-invalid={fieldState.invalid}
              disabled={isSubmitting}
              id='group-end-date'
              type='date'
              value={timestampToDateString(field.value)}
              onBlur={field.onBlur}
              onChange={(e) => {
                field.onChange(dateStringToTimestamp(e.target.value))
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

export { EndDateField }
