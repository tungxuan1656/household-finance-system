import { Field, FieldLabel } from '@/components/ui/field'

export const AuthField = ({
  children,
  id,
  label,
}: {
  children: React.ReactNode
  id: string
  label: string
}) => {
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      {children}
    </Field>
  )
}
