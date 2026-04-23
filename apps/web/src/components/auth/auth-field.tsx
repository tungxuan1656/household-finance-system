import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from '@/components/ui/field'

export const AuthField = ({
  children,
  description,
  id,
  label,
}: {
  children: React.ReactNode
  description: string
  id: string
  label: string
}) => {
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <FieldContent>
        <FieldDescription>{description}</FieldDescription>
        {children}
      </FieldContent>
    </Field>
  )
}
