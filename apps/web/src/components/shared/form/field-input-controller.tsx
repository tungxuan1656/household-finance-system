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
import { Input } from '@/components/ui/input'

type FieldInputControllerProps<TFieldValues extends FieldValues> = {
  ariaInvalid?: boolean
  control: Control<TFieldValues>
  id: string
  label: string
  maxLength?: number
  name: FieldPath<TFieldValues>
  placeholder?: string
  description?: string
  readOnly?: boolean
}

export const FieldInputController = <TFieldValues extends FieldValues>({
  ariaInvalid,
  control,
  description,
  id,
  label,
  maxLength,
  name,
  placeholder,
  readOnly = false,
}: FieldInputControllerProps<TFieldValues>) => (
  <Controller
    control={control}
    name={name}
    render={({ field, fieldState }) => (
      <Field data-invalid={fieldState.invalid}>
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
        <FieldContent>
          <Input
            {...field}
            aria-invalid={ariaInvalid ?? fieldState.invalid}
            id={id}
            maxLength={maxLength}
            placeholder={placeholder}
            readOnly={readOnly}
          />
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
