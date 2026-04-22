import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from '@/components/ui/field'

function AuthField({
  children,
  description,
  id,
  label,
}: {
  children: React.ReactNode
  description: string
  id: string
  label: string
}) {
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

export { AuthField }
