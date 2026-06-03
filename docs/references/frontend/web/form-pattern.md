# Form Pattern

Use `zod` + `react-hook-form` + shadcn field primitives.

## Hard Rules

- One `zod` schema per form.
- Bind with `useForm<FormValues>({ resolver: zodResolver(schema) })`.
- `defaultValues` covers full schema.
- Submit type is `z.infer<typeof schema>`.
- Use `Controller` for controlled inputs: `Select`, `Switch`, `Checkbox`, `RadioGroup`.
- Set `Field data-invalid={fieldState.invalid}`.
- Set control `aria-invalid={fieldState.invalid}`.
- Match `FieldLabel htmlFor` with control `id`.
- Render `FieldError` for validation errors.
- Map API validation errors to `form.setError`.
- Multi-section forms keep one root `useForm`; split sections into child components.

## Skeleton

```tsx
const schema = z.object({
  name: z.string().min(1),
})

type FormValues = z.infer<typeof schema>

export function ExampleForm(): React.JSX.Element {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '' },
  })

  const onSubmit = (values: FormValues): void => {
    // mutation.mutate(values)
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          name='name'
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor='name'>Name</FieldLabel>
              <Input {...field} id='name' aria-invalid={fieldState.invalid} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>
    </form>
  )
}
```

## Field Bindings

| Control | Binding |
| --- | --- |
| `Input`, `Textarea` | spread `...field` |
| `Select` | `value={field.value}` + `onValueChange={field.onChange}` |
| `Checkbox`, `Switch` | `checked={field.value}` + `onCheckedChange={field.onChange}` |
| `RadioGroup` | `value={field.value}` + `onValueChange={field.onChange}` |

For checkbox arrays, update value with `includes`, `filter`, spread append.

## Placement

- Feature schema: colocate per `project-folder-structure.md`.
- Shared schema only when reused across features.
- Validation copy follows `i18n-label-pattern.md`.

## Checklist

- [ ] Schema + `zodResolver`
- [ ] Complete `defaultValues`
- [ ] `data-invalid`, `aria-invalid`, `FieldError`
- [ ] Loading/disabled submit state
- [ ] API errors mapped to `setError`
- [ ] Type-safe with `z.infer`
