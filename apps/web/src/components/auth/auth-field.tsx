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
      <FieldLabel
        className='text-xs font-semibold tracking-wider text-muted-foreground uppercase'
        htmlFor={id}>
        {label}
      </FieldLabel>
      {children}
      {invalid ? <FieldError className='mt-1 text-xs' errors={errors} /> : null}
    </Field>
  )
}
