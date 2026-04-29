import {
  type Control,
  Controller,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form'

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'

type SelectOption = {
  label: string
  value: string
}

type FieldSelectControllerProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>
  id: string
  label: string
  name: FieldPath<TFieldValues>
  onValueChange?: (value: string) => string | undefined
  options: SelectOption[]
  valueFallback?: string
  description?: string
}

export const FieldSelectController = <TFieldValues extends FieldValues>({
  control,
  description,
  id,
  label,
  name,
  onValueChange,
  options,
  valueFallback = '',
}: FieldSelectControllerProps<TFieldValues>) => (
  <Controller
    control={control}
    name={name}
    render={({ field, fieldState }) => (
      <Field data-invalid={fieldState.invalid}>
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
        <FieldContent>
          <NativeSelect
            aria-invalid={fieldState.invalid}
            id={id}
            value={(field.value as string | undefined) ?? valueFallback}
            onChange={(event) => {
              const nextValue = event.target.value

              field.onChange(
                onValueChange ? onValueChange(nextValue) : nextValue,
              )
            }}>
            {options.map((option) => (
              <NativeSelectOption key={option.value} value={option.value}>
                {option.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          {description ? (
            <FieldDescription>{description}</FieldDescription>
          ) : null}
          {fieldState.invalid ? (
            <FieldError errors={[fieldState.error]} />
          ) : null}
        </FieldContent>
      </Field>
    )}
  />
)
