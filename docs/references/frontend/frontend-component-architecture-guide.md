# Frontend Component Architecture Guide

## Core Principle

> Split components by responsibility, not by line count.

A component should:
- Have one clear responsibility
- Have meaningful naming
- Be easy to reuse and maintain

---

# Architecture Layers

```txt
app/page
  ↓
feature container
  ↓
feature component
  ↓
shared component
  ↓
ui primitive
```

---

# 1. UI Primitive

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
shared/ui/
```

---

# 2. Shared Component

Reusable UI patterns.

Examples:
```tsx
<DataState />
<PageHeader />
<ConfirmDialog />
```

Rules:
- No domain knowledge
- Reusable across features
- Can contain generic behavior

Folder:
```txt
shared/components/
```

---

# 3. Feature Component

Domain-specific components.

Examples:
```tsx
<ExpenseItem />
<OverviewStats />
<BudgetChart />
```

Rules:
- Knows business/domain
- Can contain feature logic
- Belongs to a specific feature

Folder:
```txt
features/{feature}/components/
```

---

# 4. Feature Container

Handles data orchestration.

Responsibilities:
- API calls
- Hooks
- Data mapping
- Loading/error state

Example:
```tsx
function RecentExpenses() {
  const { data, isLoading } = useRecentExpenses()

  return (
    <DataState isLoading={isLoading}>
      <ExpenseList expenses={data} />
    </DataState>
  )
}
```

---

# 5. Page Component

Composes the page layout.

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

Rules:
- Minimal business logic
- Mostly layout composition

---

# Dependency Rules

Dependencies flow downward only.

```txt
app
 ↓
features
 ↓
shared
 ↓
ui
```

Never:
```txt
shared → feature ❌
ui → feature/shared ❌
```

---

# Naming Rules

Use meaningful names.

Good:
```tsx
<ExpenseItem />
<UserProfileCard />
<RecentExpenses />
```

Bad:
```tsx
<ComponentA />
<LeftSection />
<TopArea />
```

Do not name by position/layout.

Name by responsibility or domain meaning.

---

# Smart vs Dumb Components

## Dumb Component

UI only.

Example:
```tsx
function ExpenseItem({ expense }) {
  return <div>{expense.title}</div>
}
```

Rules:
- Receives props
- No API calls
- Highly reusable

---

## Smart Component

Handles data and state.

Example:
```tsx
function RecentExpenses() {
  const { data } = useRecentExpenses()

  return <ExpenseList expenses={data} />
}
```

Rules:
- Uses hooks/API
- Handles async state
- Passes data to dumb components

---

# Async State Pattern

Use shared async state wrappers.

Example:
```tsx
<DataState
  isLoading={isLoading}
  isError={isError}
  isEmpty={!data?.length}
>
  <ExpenseList expenses={data} />
</DataState>
```

Priority:
```txt
loading
→ error
→ empty
→ success
```

---

# Recommended Structure

```txt
app/
  overview/
    page.tsx

features/
  overview/
    components/
    hooks/
    services/
    types/

  expenses/
    components/

shared/
  ui/
  components/
  hooks/
  lib/
```

---

# Golden Rules

## Rule 1
Shared components must not know business logic.

## Rule 2
Pages should mostly compose layout.

## Rule 3
Feature components should own domain logic.

## Rule 4
Prefer many dumb components.

## Rule 5
Only move components to shared if truly generic.

## Rule 6
If a component knows `expense`, `user`, or `budget`,
it belongs to a feature.

## Rule 7
Reusable UI patterns belong to shared.
