# UI Implementation Rules

> **When to use this file:** When building a new page, shared component, or feature. You only need this file — design tokens are already defined in `design-system.md`.  
> **When NOT to use this file:** When changing global theme colors, fonts, or tokens — see `design-system.md` instead.  
> **Companion file:** `design-system.md` defines all tokens. This file defines how to use them.

---

## Table of Contents

1. [Page Structure](#1-page-structure)
2. [Component Rules](#2-component-rules)
3. [Styling Rules](#3-styling-rules)
4. [Animation & Interaction](#4-animation--interaction)
5. [Icon Rules](#5-icon-rules)
6. [Responsive Rules](#6-responsive-rules)
7. [Accessibility Checklist](#7-accessibility-checklist)
8. [Common Anti-Patterns](#8-common-anti-patterns)

---

## 1. Page Structure

### 1.1 Every Page Must Use `PageShell`

```tsx
export default function SomePage() {
  return (
    <PageShell title="Page Title">
      <PageSection title="Section Title" variant="card">
        {/* content */}
      </PageSection>
    </PageShell>
  )
}
```

**Rule:** Never write layout directly in a page component. Always wrap with `PageShell`.

### 1.2 PageShell Responsibilities

- Renders `MobileHeader` on mobile (`<md`).
- Adds `pb-24 md:pb-8` to avoid bottom tab overlap.
- Provides scrollable container with proper padding.
- Desktop sidebar is handled by parent layout, not `PageShell`.

### 1.3 PageSection Variants

| Variant | Use For | Example |
|---------|---------|---------|
| `default` | Plain grouped content | Settings list, preference toggles |
| `card` | Content in a contained box | Expense detail, budget card |
| `stats` | Dashboard numbers | Budget overview, analytics cards |
| `list` | Scrollable items | Expense feed, transaction list |

**Rules:**
- Choose the closest variant.
- Do not override card styles with inline classes.
- For `stats` variant, use `text-2xl` or `text-3xl` for numbers.

---

## 2. Component Rules

### 2.1 Use shadcn Components First

Before writing custom markup, check if a shadcn component exists.

#### Installed Components (24)

These are available immediately in `components/ui/`:

| Need | Component |
|------|-----------|
| Button / action | `Button`, `ButtonGroup` |
| Text input | `Input` |
| Dropdown select | `Select`, `Combobox`, `NativeSelect` |
| Multi-line text | `Textarea` |
| Boolean toggle | `Switch` |
| Form layout | `FieldGroup` + `Field` + `InputGroup` |
| Date picker | `Calendar` |
| Card container | `Card` + `CardHeader` + `CardContent` + `CardFooter` |
| Status badge | `Badge` |
| User avatar | `Avatar` + `AvatarImage` + `AvatarFallback` |
| Tab navigation | `Tabs` + `TabsList` + `TabsTrigger` |
| Pagination | `Pagination` |
| Modal dialog | `Dialog` |
| Destructive confirmation | `AlertDialog` |
| Toast notification | `sonner` (`toast.success()`, `toast.error()`) |
| Loading skeleton | `Skeleton` |
| Empty state | `Empty` |
| Divider | `Separator` |
| Label | `Label` |
| Item list | `Item` |

#### Available Components (install when needed)

Install via `pnpm dlx shadcn@latest add <component>` when a feature requires it:

| Need | Component | Install Command |
|------|-----------|-----------------|
| Boolean checkbox | `Checkbox` | `pnpm dlx shadcn@latest add checkbox` |
| Single choice | `RadioGroup` | `pnpm dlx shadcn@latest add radio-group` |
| Toggle 2–5 options | `ToggleGroup` | `pnpm dlx shadcn@latest add toggle-group` |
| OTP / verification | `InputOTP` | `pnpm dlx shadcn@latest add input-otp` |
| Range slider | `Slider` | `pnpm dlx shadcn@latest add slider` |
| Data table | `Table` | `pnpm dlx shadcn@latest add table` |
| Breadcrumb | `Breadcrumb` | `pnpm dlx shadcn@latest add breadcrumb` |
| Side navigation | `Sidebar` | `pnpm dlx shadcn@latest add sidebar` |
| Top navigation | `NavigationMenu` | `pnpm dlx shadcn@latest add navigation-menu` |
| Side panel | `Sheet` | `pnpm dlx shadcn@latest add sheet` |
| Mobile bottom panel | `Drawer` | `pnpm dlx shadcn@latest add drawer` |
| Context menu | `DropdownMenu` | `pnpm dlx shadcn@latest add dropdown-menu` |
| Right-click menu | `ContextMenu` | `pnpm dlx shadcn@latest add context-menu` |
| Menu bar | `Menubar` | `pnpm dlx shadcn@latest add menubar` |
| Tooltip | `Tooltip` | `pnpm dlx shadcn@latest add tooltip` |
| Hover card | `HoverCard` | `pnpm dlx shadcn@latest add hover-card` |
| Popover | `Popover` | `pnpm dlx shadcn@latest add popover` |
| Alert / callout | `Alert` | `pnpm dlx shadcn@latest add alert` |
| Progress bar | `Progress` | `pnpm dlx shadcn@latest add progress` |
| Loading spinner | `Spinner` | `pnpm dlx shadcn@latest add spinner` |
| Command palette | `Command` | `pnpm dlx shadcn@latest add command` |
| Charts | `Chart` | `pnpm dlx shadcn@latest add chart` |
| Resizable panels | `Resizable` | `pnpm dlx shadcn@latest add resizable` |
| Scrollable area | `ScrollArea` | `pnpm dlx shadcn@latest add scroll-area` |
| Accordion | `Accordion` | `pnpm dlx shadcn@latest add accordion` |
| Collapsible | `Collapsible` | `pnpm dlx shadcn@latest add collapsible` |

**Rules:**
- Check `components/ui/` before writing a styled `div`.
- Do not install components speculatively. Install only when a feature needs it.
- When installing, the component automatically uses the maia-mist theme.

### 2.2 Button Usage

| Variant | Usage | Limit |
|---------|-------|-------|
| `default` | Primary action | **One per page or form** |
| `outline` | Secondary action | Any number |
| `ghost` | Tertiary action, icon buttons | Any number |
| `destructive` | Delete, remove, irreversible | Must have confirmation |
| `link` | Navigation within text | Inside text only |

**Rules:**
- A page or form can only have **one** primary (`default`) button.
- Primary button in forms must be `type="submit"`.
- Loading state: compose with `Spinner` + `data-icon` + `disabled`. Button has no `isPending` or `isLoading` prop.

```tsx
// Loading button
<Button disabled>
  <Spinner data-icon="inline-start" />
  Saving...
</Button>
```

### 2.3 Form Rules

#### Layout (mandatory)

```tsx
<FieldGroup>
  <Field>
    <FieldLabel htmlFor="email">Email</FieldLabel>
    <Input id="email" type="email" />
    <FieldDescription>Helper text</FieldDescription>
  </Field>
  <Field>
    <FieldLabel htmlFor="password">Password</FieldLabel>
    <Input id="password" type="password" />
  </Field>
</FieldGroup>
```

**Requirements:**
- Always use `FieldGroup` + `Field`. **Never** use raw `div` with `space-y-*` for form layout.
- Always have a `<FieldLabel>`. **Never** use placeholder as label.
- Input height must be `h-12` (48px).
- Input font size must be `text-base` (16px) to prevent iOS zoom.
- Primary form button must be `type="submit"`.

#### Validation States

```tsx
// Invalid
<Field data-invalid>
  <FieldLabel htmlFor="email">Email</FieldLabel>
  <Input id="email" aria-invalid />
  <FieldDescription>Invalid email address.</FieldDescription>
</Field>

// Disabled
<Field data-disabled>
  <FieldLabel htmlFor="email">Email</FieldLabel>
  <Input id="email" disabled />
</Field>
```

- `data-invalid` on `Field` styles the container (label, description).
- `aria-invalid` on the control styles the input itself.
- `data-disabled` on `Field` styles the container.
- `disabled` on the control disables the input.

Works for all controls: `Input`, `Textarea`, `Select`, `Checkbox`, `RadioGroupItem`, `Switch`, `Slider`, `NativeSelect`, `InputOTP`.

#### Input Group

```tsx
import { InputGroup, InputGroupInput, InputGroupAddon } from "@/components/ui/input-group"

<InputGroup>
  <InputGroupInput placeholder="Search..." />
  <InputGroupAddon>
    <Button size="icon">
      <SearchIcon data-icon="inline-start" />
    </Button>
  </InputGroupAddon>
</InputGroup>
```

**Rule:** Never use raw `Input` or `Textarea` inside an `InputGroup`. Always use `InputGroupInput`/`InputGroupTextarea`.

#### Toggle Group (install when needed)

```bash
pnpm dlx shadcn@latest add toggle-group
```

```tsx
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

<ToggleGroup>
  <ToggleGroupItem value="daily">Daily</ToggleGroupItem>
  <ToggleGroupItem value="weekly">Weekly</ToggleGroupItem>
  <ToggleGroupItem value="monthly">Monthly</ToggleGroupItem>
</ToggleGroup>
```

**Rule:** For 2–7 choices, install and use `ToggleGroup` + `ToggleGroupItem`. Don't loop `Button` with manual active state.

#### FieldSet for Groups

```tsx
<FieldSet>
  <FieldLegend variant="label">Preferences</FieldLegend>
  <FieldDescription>Select all that apply.</FieldDescription>
  <FieldGroup className="gap-3">
    <Field orientation="horizontal">
      <Checkbox id="dark" />
      <FieldLabel htmlFor="dark" className="font-normal">Dark mode</FieldLabel>
    </Field>
  </FieldGroup>
</FieldSet>
```

**Rule:** Use `FieldSet` + `FieldLegend` for related checkboxes, radios, or switches. Don't use a `div` with a heading.

#### Horizontal Fields (Settings)

```tsx
<Field orientation="horizontal">
  <FieldLabel>Dark mode</FieldLabel>
  <Switch />
</Field>
```

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

**Rules:**
- Always use full Card composition. Do not dump everything into `CardContent`.
- Base `Card` MUST use Triple Layer classes: `bg-card/65 backdrop-blur-xl border border-white/10 shadow-glass`.

### 2.5 Overlay Components

**Choosing the right overlay:**

| Use Case | Component | Status |
|----------|-----------|--------|
| Focused task that requires input | `Dialog` | Installed |
| Destructive action confirmation | `AlertDialog` | Installed |
| Side panel with details or filters | `Sheet` | Install when needed |
| Mobile-first bottom panel | `Drawer` | Install when needed |
| Quick info on hover | `HoverCard` | Install when needed |
| Small contextual content on click | `Popover` | Install when needed |

**Requirements:**
- Every overlay MUST have a `<Title>` (`DialogTitle`, `SheetTitle`, `DrawerTitle`).
- Use `className="sr-only"` if the title should be visually hidden.
- Backdrop: `bg-background/80 backdrop-blur-sm`.
- **Do not add manual `z-index`**. shadcn handles stacking.

```tsx
<DialogContent>
  <DialogHeader>
    <DialogTitle>Edit Profile</DialogTitle>
    <DialogDescription>Update your profile.</DialogDescription>
  </DialogHeader>
  ...
</DialogContent>
```

### 2.6 Toast Notifications

```tsx
import { toast } from "sonner"

toast.success(t("expense.created"))
toast.error(t("expense.createFailed"))
toast("File deleted.", {
  action: { label: "Undo", onClick: () => undoDelete() },
})
```

**Rule:** Toast messages must be localized. Never hardcode text.

### 2.7 Loading States

**Skeleton (preferred):**
```tsx
<Skeleton className="h-4 w-3/4" />
<Skeleton className="h-12 w-full" />
```

**Spinner (inside buttons) — install when needed:**
```bash
pnpm dlx shadcn@latest add spinner
```

```tsx
<Button disabled>
  <Spinner data-icon="inline-start" />
  Saving...
</Button>
```

**Rule:** Use `Skeleton` for content placeholders. For button loading states, install `Spinner`. Never use custom `animate-pulse` divs.

### 2.8 Empty States

```tsx
<Empty>
  <EmptyHeader>
    <EmptyMedia variant="icon"><FolderIcon /></EmptyMedia>
    <EmptyTitle>No expenses yet</EmptyTitle>
    <EmptyDescription>Get started by adding your first expense.</EmptyDescription>
  </EmptyHeader>
  <EmptyContent>
    <Button>Add Expense</Button>
  </EmptyContent>
</Empty>
```

**Rule:** Use `Empty` component. Don't build custom empty state markup.

### 2.9 Callouts / Alerts (install when needed)

```bash
pnpm dlx shadcn@latest add alert
```

```tsx
<Alert>
  <AlertTitle>Budget Warning</AlertTitle>
  <AlertDescription>You have spent 80% of your monthly budget.</AlertDescription>
</Alert>
```

**Rule:** Install and use `Alert` for callouts. Don't build custom styled `div`s.

### 2.10 Separators

```tsx
<Separator />
```

**Rule:** Use `Separator` instead of `<hr>` or `<div className="border-t">`.

### 2.11 Badges

```tsx
<Badge>Active</Badge>
<Badge variant="secondary">+20.1%</Badge>
<Badge variant="destructive">Overdue</Badge>
```

**Rule:** Use `Badge` instead of custom styled `span`s.

### 2.12 Tabs

```tsx
<Tabs defaultValue="account">
  <TabsList>
    <TabsTrigger value="account">Account</TabsTrigger>
    <TabsTrigger value="password">Password</TabsTrigger>
  </TabsList>
  <TabsContent value="account">...</TabsContent>
</Tabs>
```

**Rule:** `TabsTrigger` must be inside `TabsList`. Never render triggers directly in `Tabs`.

### 2.13 Avatar

```tsx
<Avatar>
  <AvatarImage src="/avatar.png" alt="User" />
  <AvatarFallback>JD</AvatarFallback>
</Avatar>
```

**Rule:** Always include `AvatarFallback` for when the image fails to load.

### 2.14 Group Items

Never render items directly inside the content container. Always wrap in their Group:

| Item | Group |
|------|-------|
| `SelectItem`, `SelectLabel` | `SelectGroup` |
| `DropdownMenuItem`, `DropdownMenuLabel`, `DropdownMenuSub` | `DropdownMenuGroup` |
| `MenubarItem` | `MenubarGroup` |
| `ContextMenuItem` | `ContextMenuGroup` |
| `CommandItem` | `CommandGroup` |

```tsx
// Correct
<SelectContent>
  <SelectGroup>
    <SelectItem value="apple">Apple</SelectItem>
  </SelectGroup>
</SelectContent>
```

### 2.15 Custom Triggers

Use `asChild` (Radix) or `render` (Base) for custom trigger elements:

```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button variant="outline">Open Dialog</Button>
  </DialogTrigger>
</Dialog>
```

---

## 3. Styling Rules

### 3.1 Semantic Tokens Only

| ❌ Never | ✅ Always |
|----------|-----------|
| `bg-blue-500` | `bg-primary` |
| `text-gray-600` | `text-muted-foreground` |
| `bg-white` | `bg-background` or `bg-card` |
| `text-white` | `text-primary-foreground` |
| `border-gray-200` | `border-border` |
| `text-red-600` | `text-destructive` |

### 3.2 Tailwind Scale, Not Arbitrary Values

| ❌ Never | ✅ Always |
|----------|-----------|
| `p-[18px]` | `p-5` (20px) |
| `gap-[14px]` | `gap-3` (12px) or `gap-4` (16px) |
| `text-[15px]` | `text-sm` (14px) |
| `text-[13px]` | `text-xs` (12px) |
| `rounded-[10px]` | `rounded-lg` (~10px base) |
| `w-10 h-10` | `size-10` |
| `space-y-4` | `flex flex-col gap-4` |
| `space-x-4` | `flex gap-4` |
| `overflow-hidden text-ellipsis whitespace-nowrap` | `truncate` |

### 3.3 `className` for Layout Only

Use `className` for layout (`max-w-md`, `mx-auto`, `mt-4`), **not** for overriding component colors or typography.

**Incorrect:**
```tsx
<Card className="bg-blue-100 text-blue-900 font-bold">
  <CardContent>Dashboard</CardContent>
</Card>
```

**Correct:**
```tsx
<Card className="max-w-md mx-auto">
  <CardContent>Dashboard</CardContent>
</Card>
```

**Customization hierarchy:**
1. Built-in variants — `variant="outline"`, `variant="destructive"`, etc.
2. Semantic color tokens — `bg-primary`, `text-muted-foreground`.
3. CSS variables — define custom colors in `index.css` (see `design-system.md` §13).

### 3.4 `cn()` for Conditional Classes

**Incorrect:**
```tsx
<div className={`flex items-center ${isActive ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
```

**Correct:**
```tsx
import { cn } from "@/lib/utils"

<div className={cn("flex items-center", isActive ? "bg-primary text-primary-foreground" : "bg-muted")}>
```

### 3.5 No Manual `dark:` Overrides

Use semantic tokens — they handle light/dark via CSS variables.

**Incorrect:**
```tsx
<div className="bg-white dark:bg-gray-950 text-slate-900 dark:text-slate-100">
```

**Correct:**
```tsx
<div className="bg-background text-foreground">
```

### 3.6 No Manual `z-index` on Overlays

`Dialog`, `Sheet`, `Drawer`, `AlertDialog`, `DropdownMenu`, `Popover`, `Tooltip`, `HoverCard` handle their own stacking.

**Incorrect:**
```tsx
<DialogContent className="z-50">
```

### 3.7 Layout Patterns

**Page padding:**
```tsx
<div className="p-4 md:p-6 lg:p-8">
```

**Section margin:**
```tsx
<section className="mb-6 md:mb-8">
```

**Grid:**
```tsx
// Never use auto-fit (unpredictable on mobile)
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

**Flex column with gap:**
```tsx
<div className="flex flex-col gap-4">
```

**Responsive hide/show:**
```tsx
// Mobile only
<div className="md:hidden">...</div>

// Desktop only
<div className="hidden md:block">...</div>
```

### 3.8 Touch Targets

| Element | Minimum Size | Tailwind |
|---------|-------------|----------|
| Primary button | 48×48px | `h-12 min-w-12` |
| Secondary button | 40×40px | `h-10 min-w-10` |
| Icon button | 44×44px | `size-11` |
| Input | 48px height | `h-12` |
| List item | 56px height | `h-14` |
| Bottom tab tap area | 44×44px | `min-h-11` |
| Checkbox / switch | 44×44px tap | Wrapped in `Field` with padding |

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
| Button (default) | `hover:brightness-110 active:scale-95` |
| Button (outline) | `hover:bg-accent hover:text-accent-foreground active:scale-95` |
| Card | `hover:shadow-glass hover:border-white/20` |
| List item | `hover:bg-accent/50` |
| Link | `hover:underline` |
| Ghost button | `hover:bg-accent hover:text-accent-foreground active:scale-95` |

**Rule:** Hover must not cause layout shift. Buttons MUST use `active:scale-95` and `hover:brightness-110` to create physical interaction feel.

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

### 4.5 Reduced Motion

Respect `prefers-reduced-motion`:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 5. Icon Rules

- **Use Lucide icons only** (check `iconLibrary` from project context).
- Pass icon as component: `icon={PlusIcon}`. Never pass string key.
- Size: `size-4` for inline, `size-5` for buttons, `size-6` for headers.
- Use `size-*` shorthand: `size-4` not `w-4 h-4`.
- In buttons, use `data-icon="inline-start"` or `data-icon="inline-end"`.
- **No sizing classes on icons inside shadcn components**. Components handle icon sizing via CSS.

**Incorrect:**
```tsx
<Button>
  <SearchIcon className="mr-2 size-4" />
  Search
</Button>

<DropdownMenuItem>
  <SettingsIcon className="mr-2 size-4" />
  Settings
</DropdownMenuItem>
```

**Correct:**
```tsx
<Button>
  <SearchIcon data-icon="inline-start" />
  Search
</Button>

<DropdownMenuItem>
  <SettingsIcon />
  Settings
</DropdownMenuItem>
```

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
<p className="text-sm md:text-base">{description}</p>
```

**Rule:** Headings increase by 1 size on desktop. Do not over-scale.

### 6.3 Container Max Width

| Breakpoint | Max Width |
|------------|-----------|
| Mobile | 100% |
| md | 100% |
| lg | `max-w-5xl` (1024px) |
| xl | `max-w-5xl` centered |

**Rule:** Content should not stretch too wide on large screens.

### 6.4 Mobile-First Patterns

```tsx
// Base = mobile, override for larger
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">

// Mobile padding + larger screen padding
<div className="p-4 md:p-6 lg:p-8">

// Hide on mobile, show on desktop
<div className="hidden md:block">

// Show on mobile, hide on desktop
<div className="md:hidden">
```

---

## 7. Accessibility Checklist

Before marking a page as done, verify:

- [ ] All touch targets ≥ 44×44px
- [ ] All inputs have visible labels (not placeholder-only)
- [ ] Input font size ≥ 16px (`text-base`)
- [ ] Focus rings visible on all interactive elements
- [ ] Color contrast ≥ 4.5:1 for text
- [ ] Dialogs have `aria-labelledby` and `aria-describedby`
- [ ] Images have `alt` text
- [ ] No horizontal scroll on mobile (375px viewport)
- [ ] `prefers-reduced-motion` respected
- [ ] All icon-only buttons have `aria-label`
- [ ] Form errors are announced to screen readers

---

## 8. Common Anti-Patterns

| Anti-Pattern | Correct Approach |
|-------------|------------------|
| Custom styled `div` for callout | Install and use `<Alert>` |
| Custom `div` for empty state | Use `<Empty>` |
| Custom `hr` or `border-t` div | Use `<Separator>` |
| Custom `animate-pulse` div | Use `<Skeleton>` |
| Custom styled `span` for status | Use `<Badge>` |
| Manual active state with `useState` + `Button` loop | Install and use `ToggleGroup` |
| Raw `Input` in `div` | Use `FieldGroup` + `Field` |
| Opaque cards (`bg-card`) | Use Triple Layer: `bg-card/65 backdrop-blur-xl border border-white/10 shadow-glass` |
| Plain amounts (`text-base`) | Use Mono font + `tabular-nums font-semibold` |
| Solid gray borders (`border-gray-200`) | Use hairline border `border-white/10` |
| `z-50` on overlay | Let shadcn handle z-index |
| `dark:bg-gray-900` | Use semantic tokens (`bg-background`) |
| `space-y-4` | Use `flex flex-col gap-4` |
| `w-10 h-10` | Use `size-10` |
| `text-[15px]` | Use `text-sm` |
| Manual ternary in `className` | Use `cn()` utility |
| Placeholder as label | Use `<FieldLabel>` |
| `bg-blue-500` | Use `bg-primary` (slate) |
| `text-red-600` | Use `text-destructive` |
| Emoji as icon | Use Lucide SVG icon |
| `hover:scale-105` on cards/buttons | Use color/shadow transitions only |
