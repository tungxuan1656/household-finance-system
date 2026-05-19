# Frontend Component Architecture Guide

Split by responsibility. Not line count alone.

## Layer Order

```text
Next.js route/page
  -> feature page / route orchestrator
  -> feature smart component
  -> feature presentational component
  -> shared component / shared hook
  -> shadcn ui primitive
```

## Import Direction

Allowed:

```text
app route/page -> features/<domain>/pages/* -> feature-local components -> shared components -> components/ui
component/page -> hooks/api or hooks/shared -> api/*
component/page -> stores/*.store.ts only for global app state
```

Forbidden:

```text
components/ui -> domain/shared components
shared generic component -> feature component
api/* -> components/*
stores/* -> components/*
```

## Route / Page

Owns route-level concerns only:

- route params/search params
- public/protected route decision
- page layout composition
- top-level empty guard when whole page cannot render

Rules:

- Keep `app/**/page.tsx` thin.
- Put reusable UI outside `app/`.
- If page mixes 3+ concerns, move sections to feature smart components under the owning `features/<domain>/` tree.

## Feature Smart Component

Owns one feature concern.

May own:

- API/query/mutation hook
- filters and local UI state
- loading/error/empty/success state
- form submit or dialog state
- feature-specific DTO reads, copy, actions

Keep under feature folder. Do not promote to shared unless truly cross-feature.

## Presentational Component

UI-only. Props in, JSX out.

- No feature API calls.
- No mutations.
- No global store writes.
- Good for reusable rendering shape or pure helper under smart component.
- Do not extract only because a file is long.

## Shared Component

Reusable across multiple features.

- No domain knowledge.
- Generic behavior allowed.
- Examples: `DataState`, form field controller wrappers.
- If it knows `expense`, `budget`, `household`, `group`, `invitation`, or `analytics`, it is not shared.

## UI Primitive

`components/ui/` is shadcn-first base UI only.

- No business logic.
- No API calls.
- No project domain copy.
- Prefer primitive props before custom wrappers/classes.

## Async State

Every user-facing async widget handles:

```text
loading -> error/retry -> empty -> success
```

- Card-shaped widgets should use `DataState` when it fits.
- Preserve retry action.
- Use custom async markup only when `DataState` cannot express the shape.

## DTO Rule

- Prefer direct DTO reads at UI boundary.
- Map data only for real derived value, shape change, or non-trivial calculation.
- Do not add mirror UI types that drop fields without need.

## Naming / Exports

- Files: `kebab-case`.
- Components: `PascalCase` named exports.
- Name by domain meaning or responsibility.
- Use folder `index.ts` barrels for public components only.
- Keep internal subcomponents module-private.

Good: `ExpenseFeedItem`, `BudgetStatusPanel`, `RecentExpenses`.
Bad: `ComponentA`, `LeftSection`, `TopArea`, `CardWrapper2`.

## Extraction Checklist

1. Which layer owns it: route page, feature page, feature, shared, or UI primitive?
2. Does it know a domain? Keep feature-local.
3. Does it need API/query/mutation/store logic? Make smart feature component.
4. Is extraction for reuse or concern boundary? Extract.
5. Is extraction only for line count? Prefer clearer section split, not tiny fragments.
6. Does mapping add derived shape or rerender surface? Avoid unless needed.

## Golden Rules

- Pages compose route flow and layout.
- Feature smart components orchestrate bounded feature work.
- Presentational components render props only.
- Shared components stay domain-free.
- UI primitives stay shadcn-first.
- Async surfaces cover loading, empty, error/retry, success.
- New folder convention requires updating canonical reference docs first.
