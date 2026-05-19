# Component Structure Pattern

Feature page orchestrates. Feature components own bounded concerns. Shared components exist only for real reuse.

## Required Rules

- Use named exports: `export const ComponentName = () => {}`.
- Keep route files thin; move page UI orchestration to `features/<domain>/pages/` when useful.
- Feature folder may expose `index.ts` for public components only.
- Internal subcomponents are not exported from folder barrel.
- Split near 200 lines or when 3+ concerns mix.

## Route / Feature Page Pattern

```tsx
export const ExpensesPage = () => {
  return <ExpenseFeedScreen />
}
```

Route/page owns routing glue. Feature page owns top-level composition.

## Feature Smart Component

```tsx
type ExpenseFiltersProps = {
  householdId?: string
}

export const ExpenseFilters = ({ householdId }: ExpenseFiltersProps) => {
  return <section>{householdId}</section>
}
```

Smart component may own local state, query/mutation hooks, handlers, and state rendering for one concern.

## Dumb Component

```tsx
type AmountTextProps = {
  value: string
}

export const AmountText = ({ value }: AmountTextProps) => {
  return <span className="font-mono tabular-nums">{value}</span>
}
```

Dumb component receives data via props. No feature API calls.

## Folder Barrel

```ts
export * from './expense-filters'
export * from './expense-feed'
```

Export only public components. Keep helpers/private subcomponents local.

## Split Triggers

- File exceeds ~200 lines.
- Data wiring, forms, dialogs, tables, danger zone all mix.
- Same UI shape appears in 2+ features.
- Loading/empty/error branches duplicate across widgets.
- Test or review needs too much unrelated context.

## Checklist

- [ ] Named export used.
- [ ] Route/page file thin.
- [ ] One component = one concern.
- [ ] Public barrel exports only public components.
- [ ] Internal subcomponents stay internal.
- [ ] Shared extraction has real reuse.
