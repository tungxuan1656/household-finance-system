# Frontend Component Architecture Guide

## Core Principle

> Split components by responsibility, not by line count.

A component should:
- Have one clear responsibility
- Have meaningful naming
- Be easy to reuse and maintain

---

## Architecture Layers

```txt
Next.js App Router page
  ↓
page composition / route orchestrator
  ↓
feature smart component
  ↓
feature presentational component
  ↓
shared component / shared hook
  ↓
shadcn ui primitive
```

Dependency direction must stay downward and generic:

```txt
app route/page → components/<feature> → components/shared → components/ui
page/component → hooks/api or hooks/shared → api/*
page/component → stores/*.store.ts when global app state is required
```

Never allow:

```txt
components/shared → components/<feature> ❌
components/ui → components/shared or components/<feature> ❌
api/* → components/* ❌
stores/* → components/* ❌
```

---

## 1. UI Primitive

Base UI components.

Examples:
```tsx
<Button />
<Input />
<Card />
```

Rules:
- No business logic
- No API calls
- Pure UI only

Folder:

```txt
components/ui/
```

---

## 2. Shared Component

Shared components are reusable patterns that work across multiple features.

Examples:

```tsx
<DataState />
<FieldInputController />
<FieldSelectController />
```

Rules:
- No domain knowledge
- Reusable across features
- Can contain generic behavior

Folder:

```txt
components/shared/
```

---

## 3. Feature Component

Feature components are domain-specific components owned by one feature area.

Examples:

```tsx
<RecentExpenses />
<BudgetStatusPanel />
<ExpenseFeedItem />
<InsightsChartsSection />
```

Rules:

- May know domain DTOs, copy, filters, feature actions, and feature-specific UI state.
- Belongs to exactly one feature folder under `components/<feature>`.
- May be smart or presentational, but must keep one clear responsibility.
- Export public child components from `components/<feature>/index.ts`; keep internal subcomponents module-private.
- Prefer direct DTO usage at UI boundaries. Map data only when the UI needs a real derived value, shape change, or non-trivial calculation.

Folder:

```txt
components/<feature>/
```

---

## 4. Smart Feature Component

Smart feature components own bounded orchestration for one UI concern.

Responsibilities:
- API calls
- Hooks
- Data mapping
- Loading/error state

Example:

```tsx
type RecentExpensesProps = {
  householdId?: string
}

export const RecentExpenses = ({ householdId }: RecentExpensesProps) => {
  const { data, isError, isLoading, refetch } = useExpenseFeed({ householdId })
  const expenses = data?.items ?? []

  return (
    <DataState
      isEmpty={expenses.length === 0}
      isError={isError}
      isLoading={isLoading}
      onRetry={() => void refetch()}
    >
      <ExpenseList expenses={expenses} />
    </DataState>
  )
}
```

Use smart feature components to split pages when a section owns its own query, filters, async states, form submission, dialog state, or retry behavior.

---

## 5. Page Component / Route Orchestrator

Next.js route files compose the page and own route-level concerns.

Responsibilities:

- Route params/search params.
- Top-level protected/public route decisions.
- High-level layout composition.
- Global store sync when multiple sections depend on it.
- Top-level empty guards when the whole page cannot render meaningfully.

Rules:

- Keep pages thin and orchestration-focused.
- Do not keep child widget query wiring in the page unless multiple sibling sections must coordinate from the same query result.
- Do not place reusable UI under `app/`; route files should import components from `components/*`.
- Page files should stay readable; when they mix 3+ concerns, split into feature smart components.

Example:

```tsx
function OverviewPage() {
  return (
    <>
      <OverviewTabs />
      <OverviewStats />
      <RecentExpenses />
    </>
  )
}
```

Folder:

```txt
app/**/page.tsx
```

---

## Smart vs Presentational Components

### Presentational Component

UI-only rendering controlled by props.

```tsx
type ExpenseFeedItemProps = {
  expense: ExpenseDto
}

export const ExpenseFeedItem = ({ expense }: ExpenseFeedItemProps) => {
  return <article>{expense.title}</article>
}
```

Rules:

- Receives data and callbacks through props.
- No feature API calls or mutations.
- Useful when multiple callers need the same rendering shape or a smart component needs a small pure helper.
- Does not need to be extracted merely because it reduces line count.

### Smart Component

Data/state orchestration for one feature concern.

```tsx
export const CreateBudgetDialog = () => {
  const createBudget = useCreateBudgetMutation()

  return <BudgetForm onSubmit={(input) => createBudget.mutate(input)} />
}
```

Rules:

- Uses hooks/API/store where needed.
- Handles async state and user actions.
- Passes simple props to presentational children.
- Stays feature-scoped unless its behavior is truly generic.

---

## Async State Pattern

Every user-facing async widget must account for:

```txt
loading → error/retry → empty → success
```

For card-shaped widgets, use `DataState`:

```tsx
<DataState isEmpty={!items.length} isError={isError} isLoading={isLoading} onRetry={retry}>
  <Card>
    <CardHeader>
      <CardTitle>Recent expenses</CardTitle>
    </CardHeader>
    <CardContent>
      <ExpenseList expenses={items} />
    </CardContent>
  </Card>
</DataState>
```

Rules:

- Use `DataState` from `@/components/shared/data-state` for standard card loading/empty/error handling.
- Preserve useful retry actions through `DataState` action props.
- Use one-off async markup only when the widget shape is not card-like or `DataState` cannot represent the interaction.

---

## Naming and Export Rules

- Files use `kebab-case`.
- Components use `PascalCase` and named exports: `export const ComponentName = (...) => {}`.
- Name by domain meaning or responsibility, not visual position.
- Use `index.ts` barrel files in feature/shared component folders to export only public components.
- Import public child components from the folder barrel when available.

Good:

```tsx
<ExpenseFeedItem />
<BudgetStatusPanel />
<RecentExpenses />
<HouseholdCardsSection />
```

Bad:

```tsx
<ComponentA />
<LeftSection />
<TopArea />
<CardWrapper2 />
```

---

## Extraction Decision Checklist

Before creating or moving a component, answer:

1. Which layer owns this responsibility: page, feature, shared, or UI primitive?
2. Does it know a project domain such as expenses, budgets, households, invitations, auth, or analytics?
   - Yes → keep it under `components/<feature>`.
   - No → it may be shared only if it is reused across features.
3. Does it need API/query/mutation/store logic?
   - Yes → make it a smart feature component unless the logic is generic.
4. Is the extraction for reuse or just line count?
   - Reuse/clear concern boundary → extract.
   - Line count only → prefer a smart feature section over many tiny dumb single-use pieces.
5. Will a new mapped type or memoized data shape drop DTO fields or add rerender surfaces?
   - Yes → avoid it unless the derived shape is necessary.

---

## Golden Rules

1. Pages should mostly compose route-level flow and layout.
2. Feature smart components should own bounded feature orchestration.
3. Shared components must not know business logic.
4. UI primitives must remain shadcn-first and domain-free.
5. Prefer direct DTO reads over unnecessary mirror types and mapping layers.
6. Only move components to shared when the abstraction is truly cross-feature.
7. If a component knows `expense`, `budget`, `household`, `group`, `invitation`, or `analytics`, it belongs to a feature folder.
8. Every async surface needs clear loading, empty, error/retry, and success states.
9. Keep files focused; split when a file trends beyond ~200 lines or mixes 3+ concerns.
10. Do not introduce new frontend folder conventions without updating the canonical reference docs first.
