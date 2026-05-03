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

function NameField({ control, isSubmitting }: BaseFieldProps) {
  return (
    <Controller
      control={control}
      name='name'
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor='group-name'>
            {t('groups.fields.name.label')}
          </FieldLabel>
          <FieldContent>
            <Input
              {...field}
              aria-invalid={fieldState.invalid}
              disabled={isSubmitting}
              id='group-name'
              placeholder={t('groups.fields.name.placeholder')}
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

export { NameField }
