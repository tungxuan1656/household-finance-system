import { Field, FieldError, FieldLabel } from '@/components/ui/field'

export const AuthField = ({
  children,
  errors,
  id,
  invalid = false,
  label,
}: {
  children: React.ReactNode
  errors?: Array<{ message?: string } | undefined>
  id: string
  invalid?: boolean
  label: string
}) => {
  return (
    <Field data-invalid={invalid}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      {children}
      {invalid ? <FieldError errors={errors} /> : null}
    </Field>
  )
}
