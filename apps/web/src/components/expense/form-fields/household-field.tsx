'use client'

import { useController } from 'react-hook-form'

import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { t } from '@/lib/i18n/t'
import type { HouseholdDTO } from '@/types/household'

import type { FieldProps } from './shared'

type HouseholdFieldProps = FieldProps & {
  households: HouseholdDTO[]
}

export function HouseholdField({
  control,
  isSubmitting,
  households,
}: HouseholdFieldProps) {
  const { field, fieldState } = useController({ control, name: 'householdId' })

  return (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor='expense-household'>
        {t('expense.selectHousehold')}
      </FieldLabel>
      <NativeSelect
        aria-invalid={fieldState.invalid}
        disabled={isSubmitting}
        id='expense-household'
        value={field.value ?? ''}
        onChange={(e) => {
          field.onChange(e.target.value || undefined)
        }}>
        <NativeSelectOption value=''>
          {t('expense.selectHousehold')}
        </NativeSelectOption>
        {households.map((household) => (
          <NativeSelectOption key={household.id} value={household.id}>
            {household.name}
          </NativeSelectOption>
        ))}
      </NativeSelect>
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  )
}
