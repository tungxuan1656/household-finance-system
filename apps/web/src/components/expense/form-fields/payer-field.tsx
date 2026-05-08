'use client'

import { useController } from 'react-hook-form'

import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { t } from '@/lib/i18n/t'
import type { HouseholdMemberDTO } from '@/types/household'
import type { CurrentUserProfileDTO } from '@/types/profile'

import type { FieldProps } from './shared'

type PayerFieldProps = FieldProps & {
  profile: CurrentUserProfileDTO | undefined
  payerOptions: HouseholdMemberDTO[]
  watchedVisibility: string | undefined
}

export function PayerField({
  control,
  isSubmitting,
  profile,
  payerOptions,
  watchedVisibility,
}: PayerFieldProps) {
  const { field, fieldState } = useController({ control, name: 'payerUserId' })
  const payerFieldId = 'expense-payer'

  return (
    <Field>
      <FieldLabel htmlFor={payerFieldId}>{t('expense.payer')}</FieldLabel>
      {watchedVisibility === 'household' && payerOptions.length > 0 ? (
        <Field data-invalid={fieldState.invalid}>
          <NativeSelect
            aria-invalid={fieldState.invalid}
            disabled={isSubmitting}
            id={payerFieldId}
            value={field.value ?? profile?.id ?? ''}
            onChange={(event) => {
              field.onChange(event.target.value || undefined)
            }}>
            {payerOptions.map((member) => (
              <NativeSelectOption key={member.userId} value={member.userId}>
                {member.name}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          {fieldState.invalid ? (
            <FieldError errors={[fieldState.error]} />
          ) : null}
        </Field>
      ) : (
        <Input
          readOnly
          className='cursor-default bg-muted'
          id={payerFieldId}
          value={profile?.displayName ?? ''}
        />
      )}
    </Field>
  )
}
