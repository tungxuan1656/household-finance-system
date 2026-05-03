'use client'

import { type Control, Controller } from 'react-hook-form'

import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import { t } from '@/lib/i18n/t'

import type { GroupFormValues } from './schema'

type BaseFieldProps = {
  control: Control<GroupFormValues>
  isSubmitting: boolean
}

function DescriptionField({ control, isSubmitting }: BaseFieldProps) {
  return (
    <Controller
      control={control}
      name='description'
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor='group-description'>
            {t('groups.fields.description.label')}
          </FieldLabel>
          <FieldContent>
            <Textarea
              {...field}
              aria-invalid={fieldState.invalid}
              disabled={isSubmitting}
              id='group-description'
              placeholder={t('groups.fields.description.placeholder')}
              value={field.value ?? ''}
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

export { DescriptionField }
