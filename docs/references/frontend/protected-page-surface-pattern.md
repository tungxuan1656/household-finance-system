# Protected Page Surface Pattern

One protected shell. One page-surface contract.

## Contract

New protected app pages use shared page wrappers:

- `PageContainer`
- `PageHeader`
- `PageContent`
- `PageFooter`

Canonical home for these wrappers:

```text
apps/web/src/components/shared/page/
```

## Ownership

### Shell layout owns

- auth/session gating
- desktop left rail
- mobile bottom-tab navigator
- global drawers, dialogs, toasts
- shell-level safe-area and bottom-nav spacing

### `PageContainer` owns

- one page surface frame
- page min height
- vertical spacing between header, content, and footer

### `PageHeader` owns

- page title
- subtitle/summary
- back affordance
- trailing actions

Do not duplicate route title outside `PageHeader`.

### `PageContent` owns

- main page body
- cards, lists, forms, charts, empty states

### `PageFooter` owns

- page-specific trailing actions
- sticky bottom action row when the page flow needs it

`PageFooter` is not the bottom-tab navigator.

## Route / Feature Page Pattern

```tsx
export const ExpensesPage = () => {
  return (
    <PageContainer>
      <PageHeader title='Chi tiêu' />
      <PageContent>{/* screen body */}</PageContent>
    </PageContainer>
  )
}
```

Rules:

- `app/**/page.tsx` stays thin.
- `features/<domain>/pages/**` owns top-level route composition.
- Route-level blocking states stay inside the same `PageContainer`.

## Async State Rules

- loading, empty, error, retry, and success states for one route stay inside one `PageContainer`
- use `DataState` when the blocking state shape fits
- preserve custom markup when the screen needs richer chart/list skeletons

## Composition Rules

- Use existing `components/ui/*` primitives.
- Shared page wrappers are structure only, not visual replacement primitives.
- Put domain widgets in feature-local components under `features/<domain>/components/**`.
- Extract shared page subcomponents only after real cross-feature reuse appears.

## Mobile-First Rules

- Build mobile shape first.
- Header, content, and footer must still work with the bottom-tab visible.
- Floating actions and bottom drawers must not be covered by the bottom-tab.
- Desktop keeps the same page composition and only relocates navigation to the left rail.

## Do Not

- Do not duplicate outer `px-*` page padding around `PageContent`.
- Do not let page-specific action bars fight with shell navigation.
- Do not put auth or nav logic inside page wrappers.

## Checklist

- [ ] Route file stays thin.
- [ ] Protected page uses shared page wrappers.
- [ ] Title lives in `PageHeader`.
- [ ] Blocking route states stay inside one `PageContainer`.
- [ ] Footer actions are page-specific, not shell-specific.
