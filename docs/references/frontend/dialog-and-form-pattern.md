# Dialog + Form Field Pattern

Use for dialog composition and field layout only. Form state/validation lives in `form-pattern.md`.

## Rules

- Use built-in UI: `Dialog`, `Field`, `FieldGroup`, `FieldLabel`, `FieldLegend`, `FieldError`, `Button`, `Input`, `Textarea`, `Select`.
- Dialog uses ref pattern. Caller opens with `ref.current?.open(...)`. Dialog owns `open` state.
- Store dialog callbacks in `useRef`, not state.
- `DialogClose asChild` for cancel actions.
- `FieldLabel` is default for 1 clear control.
- `FieldLegend` only for grouped controls on multiple lines, or when explicitly requested.
- Use `FieldGroup > Field > label/legend + control + FieldError`.
- Do not add custom spacing on `DialogContent` unless needed.

## Dialog ref pattern

```tsx
export type ConfirmDeleteModalRef = {
  open: (options: { itemName: string; onConfirm: () => void }) => void
}

const onConfirmRef = useRef<(() => void) | null>(null)

useImperativeHandle(ref, () => ({
  open: ({ itemName, onConfirm }) => {
    setItemName(itemName)
    onConfirmRef.current = onConfirm
    setIsOpen(true)
  },
}))

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogFooter>
      <DialogClose asChild>
        <Button variant='outline'>Cancel</Button>
      </DialogClose>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

## Field layout

```tsx
<FieldGroup>
  <Field>
    <FieldLabel htmlFor='name'>Name</FieldLabel>
    <Input id='name' />
    <FieldError />
  </Field>
</FieldGroup>
```

## Label choice

- `FieldLabel` => one control, use `htmlFor`.
- `FieldLegend` => group of controls, no `htmlFor`.

```tsx
<Field>
  <FieldLabel htmlFor='email'>Email</FieldLabel>
  <Input id='email' type='email' />
</Field>

<Field>
  <FieldLegend>Work Hours</FieldLegend>
  <div className='flex gap-2'>
    <Select />
    <Select />
  </div>
</Field>
```
