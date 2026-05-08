'use client'

import { useController } from 'react-hook-form'

import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { t } from '@/lib/i18n/t'
import type { ExpenseGroupDTO } from '@/types/group'

import { GroupPicker } from '../group-picker'
import type { FieldProps } from './shared'

type GroupFieldProps = FieldProps & {
  groups: ExpenseGroupDTO[]
}

export function GroupField({ control, isSubmitting, groups }: GroupFieldProps) {
  const { field, fieldState } = useController({ control, name: 'groupIds' })

  return (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor='expense-groups'>
        {t('expense.groupPicker.label')}
      </FieldLabel>
      <GroupPicker
        disabled={isSubmitting}
        groups={groups}
        id='expense-groups'
        value={field.value ?? []}
        onValueChange={(value) => field.onChange(value)}
      />
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  )
}
