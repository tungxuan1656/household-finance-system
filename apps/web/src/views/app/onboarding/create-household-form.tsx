'use client'

import { Controller, type UseFormReturn } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import type { CreateHouseholdFormValues } from '@/lib/forms/household.schema'
import { t } from '@/lib/i18n/t'

interface CreateHouseholdFormProps {
  form: UseFormReturn<CreateHouseholdFormValues>
  isLoading: boolean
  onSubmit: (values: CreateHouseholdFormValues) => Promise<void>
}

function CreateHouseholdForm({
  form,
  isLoading,
  onSubmit,
}: CreateHouseholdFormProps) {
  return (
    <form
      className='rounded-none border border-border/70 bg-background/70 p-4 backdrop-blur sm:p-5'
      onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          control={form.control}
          name='name'
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor='household-name'>
                {t('app.onboarding.fields.householdName.label')}
              </FieldLabel>
              <FieldContent>
                <FieldDescription>
                  {t('app.onboarding.fields.householdName.description')}
                </FieldDescription>
                <Input
                  {...field}
                  aria-invalid={fieldState.invalid}
                  id='household-name'
                  placeholder={t(
                    'app.onboarding.fields.householdName.placeholder',
                  )}
                  size={'sm'}
                />
                {fieldState.invalid ? (
                  <FieldError errors={[fieldState.error]} />
                ) : null}
              </FieldContent>
            </Field>
          )}
        />
      </FieldGroup>

      <div className='mt-5 flex items-center justify-end gap-3'>
        <Button disabled={isLoading} type='submit'>
          {isLoading
            ? t('app.onboarding.actions.creating')
            : t('app.onboarding.actions.create')}
        </Button>
      </div>
    </form>
  )
}

export { CreateHouseholdForm }
