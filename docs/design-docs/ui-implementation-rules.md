# UI Implementation Rules

> **When to use this file:** When building a new page or refactoring an existing page.  
> **When NOT to use this file:** When changing global theme colors, fonts, or tokens — see `design-system.md` instead.

---

## 1. Page Structure

### 1.1 Every Page Must Use `PageShell`

```tsx
export default function SomePage() {
  return (
    <PageShell title="Page Title">
      <PageSection title="Section Title">
        {/* content */}
      </PageSection>
    </PageShell>
  )
}
```

**Rule:** Never write layout directly in a page component. Always wrap with `PageShell`.

### 1.2 PageShell Responsibilities

- Renders `MobileHeader` on mobile (`<md`)
- Adds `pb-24 md:pb-8` to avoid bottom tab overlap
- Provides scrollable container
- Desktop sidebar is handled by parent layout

### 1.3 PageSection Variants

| Variant | Use For | Example |
|---------|---------|---------|
| `default` | Plain grouped content | Settings list |
| `card` | Content in a contained box | Expense detail |
| `stats` | Dashboard numbers | Budget overview |
| `list` | Scrollable items | Expense feed |

**Rule:** Choose the closest variant. Do not override card styles with inline classes.

---

## 2. Component Rules

### 2.1 Use shadcn Components First

Before writing custom markup, check if a shadcn component exists:

| Need | Use |
|------|-----|
| Button | `Button` with appropriate variant |
| Form input | `Input`, `Select`, `Textarea`, `Switch`, `Checkbox`, `RadioGroup` |
| Form layout | `FieldGroup` + `Field` |
| Toggle 2-5 options | `ToggleGroup` |
| Data display | `Table`, `Card`, `Badge`, `Avatar` |
| Navigation | `Tabs`, `Breadcrumb`, `Pagination` |
| Overlay | `Dialog`, `Sheet`, `Drawer`, `AlertDialog` |
| Feedback | `sonner` (toast), `Alert`, `Progress`, `Skeleton` |
| Empty state | `Empty` |
| Menu | `DropdownMenu`, `ContextMenu` |
| Tooltip | `Tooltip`, `Popover` |

**Rule:** Check `components/ui/` before writing a styled `div`.

### 2.2 Button Usage

| Variant | Usage | Limit |
|---------|-------|-------|
| `default` | Primary action | **One per page/form** |
| `outline` | Secondary action | Any number |
| `ghost` | Tertiary action | Any number |
| `destructive` | Delete, remove | Must have confirmation |
| `link` | Navigation | Inside text only |

**Rule:** A page or form can only have ONE primary (`default`) button.

### 2.3 Form Rules

**Layout:**
```tsx
<FieldGroup>
  <Field>
    <FieldLabel htmlFor="email">Email</FieldLabel>
    <Input id="email" />
    <FieldDescription>Helper text</FieldDescription>
  </Field>
</FieldGroup>
```

**Requirements:**
- Always use `FieldGroup` + `Field`. Never use raw `div` with `space-y-*`.
- Always have a `<FieldLabel>`. Never use placeholder as label.
- Input height must be `h-12` (48px).
- Input font size must be `text-base` (16px) to prevent iOS zoom.
- Validation: `data-invalid` on `Field`, `aria-invalid` on the control.
- Primary form button must be `type="submit"`.

### 2.4 Card Composition

```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>{/* main content */}</CardContent>
  <CardFooter>{/* actions */}</CardFooter>
</Card>
```

**Rule:** Always use full Card composition. Do not dump everything into `CardContent`.

### 2.5 Dialog/Sheet/Drawer Requirements

- Every overlay MUST have a `<Title>` (can be `className="sr-only"`).
- Backdrop: `bg-background/80 backdrop-blur-sm`.
- Do not add manual `z-index`. shadcn handles stacking.

### 2.6 Toast Usage

```tsx
import { toast } from 'sonner'

toast.success(t('expense.created'))
toast.error(t('expense.createFailed'))
```

**Rule:** Toast messages must be localized. Never hardcode text.

---

## 3. Styling Rules

### 3.1 Use Semantic Tokens Only

| ❌ Never | ✅ Always |
|----------|-----------|
| `bg-blue-500` | `bg-primary` |
| `text-gray-600` | `text-muted-foreground` |
| `bg-white` | `bg-background` or `bg-card` |
| `text-white` | `text-primary-foreground` |
| `border-gray-200` | `border-border` |

### 3.2 Use Tailwind Scale, Not Arbitrary Values

| ❌ Never | ✅ Always |
|----------|-----------|
| `p-[18px]` | `p-5` (20px) |
| `gap-[14px]` | `gap-3` (12px) or `gap-4` (16px) |
| `text-[15px]` | `text-sm` (14px) |
| `rounded-[10px]` | `rounded-lg` (12px) |
| `w-10 h-10` | `size-10` |
| `space-y-4` | `flex flex-col gap-4` |
| `space-x-4` | `flex gap-4` |

### 3.3 Layout Patterns

**Spacing:**
```tsx
// Page padding
<div className="p-4 md:p-6 lg:p-8">

// Section margin
<section className="mb-6 md:mb-8">

// Grid gap
<div className="gap-4 md:gap-6">
```

**Responsive hide/show:**
```tsx
// Mobile only
<div className="md:hidden">...</div>

// Desktop only
<div className="hidden md:block">...</div>
```

**Grid:**
```tsx
// Never use auto-fit (unpredictable on mobile)
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

### 3.4 Touch Targets

| Element | Minimum Size | Tailwind |
|---------|-------------|----------|
| Primary button | 48×48px | `h-12 min-w-12` |
| Secondary button | 40×40px | `h-10 min-w-10` |
| Icon button | 44×44px | `size-11` |
| Input | 48px height | `h-12` |
| List item | 56px height | `h-14` |
| Bottom tab | 44×44px tap | `min-h-11` |

---

## 4. Animation & Interaction

### 4.1 Allowed Animations

| Animation | Duration | Use Case |
|-----------|----------|----------|
| `transition-colors` | 150ms | Hover, focus |
| `transition-opacity` | 150ms | Disabled states |
| `transition-transform` | 200ms | Scale on active |
| `transition-shadow` | 200ms | Card hover |
| `animate-in fade-in` | 200ms | Dialogs, sheets |
| `animate-in slide-in` | 300ms | Drawers, toasts |

**Rule:** Never exceed 300ms. Never use `animate-bounce` or `animate-pulse` for UI elements.

### 4.2 Hover States

| Element | Effect |
|---------|--------|
| Button | `hover:bg-primary/90` or `hover:shadow-md` |
| Card | `hover:shadow-md hover:border-primary/20` |
| List item | `hover:bg-accent/50` |
| Link | `hover:underline` |

**Rule:** Hover must not cause layout shift. Do not use `hover:scale-105`.

### 4.3 Focus States

```tsx
focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
```

**Rule:** Focus ring must be visible on all interactive elements.

### 4.4 Active States

```tsx
active:scale-[0.98]
```

**Rule:** Subtle press effect. Max scale 0.98.

---

## 5. Icon Rules

- Use Lucide icons only. Never use emoji as icons.
- Pass icon as component: `icon={PlusIcon}`. Never pass string key.
- Size: `size-4` for inline, `size-5` for buttons, `size-6` for headers.
- Use `size-*` shorthand: `size-4` not `w-4 h-4`.
- In buttons, use `data-icon="inline-start"` on icon.

---

## 6. Responsive Rules

### 6.1 Breakpoints

| Name | Value | Usage |
|------|-------|-------|
| `sm` | 640px | Large phones |
| `md` | 768px | Tablets (switch to desktop sidebar) |
| `lg` | 1024px | Laptops (max-width container) |
| `xl` | 1280px | Desktops |

### 6.2 Typography Responsive

```tsx
<h1 className="text-xl md:text-2xl font-semibold">{title}</h1>
<h2 className="text-lg md:text-xl font-semibold">{title}</h2>
```

**Rule:** Headings increase by 1 size on desktop. Do not over-scale.

### 6.3 Container Max Width

| Breakpoint | Max Width |
|------------|-----------|
| Mobile | 100% |
| md | 100% |
| lg | max-w-5xl (1024px) |
| xl | max-w-5xl centered |

**Rule:** Content should not stretch too wide on large screens.

---

## 7. Accessibility Checklist

Before marking a page as done, verify:

- [ ] All touch targets ≥ 44×44px
- [ ] All inputs have labels
- [ ] Input font size ≥ 16px
- [ ] Focus rings visible on all interactive elements
- [ ] Color contrast ≥ 4.5:1 for text
- [ ] Dialogs have `aria-labelledby` and `aria-describedby`
- [ ] Images have `alt` text
- [ ] No horizontal scroll on mobile (375px)

---

## 8. Common Anti-Patterns

| Anti-Pattern | Correct Approach |
|-------------|------------------|
| Custom styled `div` for callout | Use `<Alert>` |
| Custom `div` for empty state | Use `<Empty>` |
| Custom `hr` | Use `<Separator>` |
| Custom `animate-pulse` div | Use `<Skeleton>` |
| Custom styled `span` | Use `<Badge>` |
| Manual active state with `useState` | Use `ToggleGroup` |
| Raw `Input` in `div` | Use `FieldGroup` + `Field` |
| Inline glassmorphism (`bg-white/10`) | Use token-based `bg-card/80` |
| `z-50` on overlay | Let shadcn handle z-index |
| `dark:bg-gray-900` | Use semantic tokens |
