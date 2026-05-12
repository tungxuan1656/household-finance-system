# UI Implementation Rules

> **Purpose:** Consumption contract for page authors and shared feature-component authors.
> **Aesthetic source:** `docs/design-docs/design-system-v2-spec.md`.
> **System contract:** `docs/design-docs/design-system.md`.
> **Core rule:** Build UI from `apps/web/src/components/ui` and keep visual styling inside those primitives.

---

## 1. What Call Sites May Control

Page and feature call sites may use `className` for layout only.

Allowed layout-only customization:

- Width and height constraints: `w-*`, `h-*`, `min-w-*`, `max-w-*`, `min-h-*`, `max-h-*`
- Responsive layout: `grid-*`, `flex-*`, `basis-*`, `grow`, `shrink`
- Placement: `col-span-*`, `row-span-*`, `justify-*`, `items-*`, `self-*`, `place-*`
- Margins used for layout placement: `m-*`, `mx-*`, `my-*`, `mt-*`, `mb-*`, `ml-*`, `mr-*`
- Positioning: `relative`, `absolute`, `sticky`, `fixed`, `top-*`, `right-*`, `bottom-*`, `left-*`, `inset-*`
- Order and visibility: `order-*`, `hidden`, `block`, `inline-flex`, `md:hidden`, `lg:block`

These are allowed because they place a primitive in the page. They do not restyle the primitive.

---

## 2. What Call Sites May Not Control

Call sites must not use `className` to change primitive visuals.

Disallowed visual customization at primitive call sites:

- Background or surface color: `bg-*`
- Text color: `text-*` when used on a primitive root or primitive-defined slot to restyle primitive-owned content
- Border color or border opacity: `border-*`, `border-white/10`, `border-black/10`
- Radius: `rounded-*`
- Shadow or elevation: `shadow-*`
- Blur or backdrop treatment: `blur-*`, `backdrop-blur-*`
- Surface opacity: `opacity-*` when used to restyle the primitive itself
- Primitive-internal spacing intended to restyle appearance: `p-*`, `px-*`, `py-*`, `gap-*`, `space-*`
- One-off visual typography overrides that create a new primitive look: `font-*`, `tracking-*`, `leading-*`, arbitrary `text-[...]`

If you need any item from the list above, stop and extend the primitive API.

---

## 3. Allowed vs Disallowed Matrix

| Call-site class category | Allowed? | Notes |
| --- | --- | --- |
| Width / height / min / max | Yes | Layout sizing only |
| Grid / flex placement | Yes | Use to place primitives in page composition |
| Margins for placement | Yes | Use margins to separate sections or position elements |
| Position / inset | Yes | Layout behavior only |
| Order / visibility | Yes | Layout behavior only |
| `bg-*` | No | Visual ownership belongs to the primitive |
| `text-*` on primitive roots or primitive-defined slots | No | Use primitive props for primitive-owned text treatment |
| `border-*` color or opacity | No | Border treatment is primitive-owned |
| `rounded-*` | No | Radius is primitive-owned |
| `shadow-*` | No | Elevation is primitive-owned |
| `backdrop-blur-*` / `blur-*` | No | Glass treatment is primitive-owned |
| `opacity-*` for primitive surface styling | No | Surface transparency is primitive-owned |
| `p-*` / `gap-*` used to restyle primitive internals | No | Primitive density belongs in primitive API |

Reviewer shortcut:

- If the class would change the primitive's look rather than its placement, reject it.
- `text-*` utilities remain allowed on raw page content only when they do not override a primitive root or primitive-defined role/slot.

---

## 4. Escalation Rule

When the desired visual treatment is unavailable, do not patch the page.

Required escalation path:

1. Check whether the primitive already exposes `variant`, `size`, `tone`, or `surface`.
2. If yes, use the prop.
3. If no, extend the primitive in `apps/web/src/components/ui`.
4. If the primitive cannot support the new treatment with existing tokens, update tokens through the design-system contract.

Forbidden shortcut:

```tsx
<Card className="bg-primary/10 border-primary/30 rounded-3xl shadow-xl">
```

Required direction:

```tsx
<Card surface="highlighted">...</Card>
```

Missing visual treatments must be expressed through primitive API extensions named `variant`, `size`, `tone`, or `surface`, not through page-level visual classes.

---

## 5. Primitive-First Usage Rules

### 5.1 Buttons

Use button props for visual intent.

Preferred:

```tsx
<Button variant="default" size="lg">Save</Button>
<Button variant="outline">Cancel</Button>
<Button variant="ghost" size="icon" aria-label="Open filters">
  <FilterIcon />
</Button>
```

Reject:

```tsx
<Button className="bg-primary text-primary-foreground rounded-full shadow-lg">
  Save
</Button>
```

Interaction rule:

- Button hover and active styling are owned by the primitive.
- The canonical active rule is `active:scale-95`.

### 5.2 Cards

Use card composition and primitive surface props.

Preferred:

```tsx
<Card className="max-w-md">
  <CardHeader>
    <CardTitle>Monthly summary</CardTitle>
    <CardDescription>Current household snapshot</CardDescription>
  </CardHeader>
  <CardContent>...</CardContent>
</Card>
```

Preferred when a visual treatment is needed and supported:

```tsx
<Card surface="default" className="md:col-span-2">
  <CardContent>...</CardContent>
</Card>
```

Reject:

```tsx
<Card className="bg-card/90 backdrop-blur-sm border-white/20 p-8">
  <CardContent>...</CardContent>
</Card>
```

Rules:

- Glass treatment belongs to the `Card` primitive.
- Card padding and internal gaps belong to card slots and card variants.
- Call sites may size and place cards, not restyle them.

### 5.3 Badges and Status UI

Preferred:

```tsx
<Badge variant="secondary">Pending</Badge>
<Badge variant="destructive">Over budget</Badge>
```

Reject:

```tsx
<span className="rounded-full bg-yellow-500/20 px-2 py-1 text-yellow-100">
  Pending
</span>
```

### 5.4 Dialogs, Popovers, Sheets, Drawers

Preferred:

```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button variant="outline">Edit profile</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Edit profile</DialogTitle>
      <DialogDescription>Update your account details.</DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>
```

Reject:

```tsx
<DialogContent className="backdrop-blur-sm bg-background/80 border-white/20 shadow-2xl">
  ...
</DialogContent>
```

Rules:

- Overlay backdrop and surface styling are primitive-owned.
- Do not add manual `z-index` on overlay primitives or their surface slots.
- Do not lower blur guidance below the canonical V2 glass rule.

---

## 6. Financial Typography Rules

Financial UI is stricter than generic app UI.

Required:

- Amounts, balances, totals, subtotals, deltas, and ledger rows use monospace.
- Financial numbers use `tabular-nums`.
- Numeric emphasis should be `font-semibold` or stronger when visually important.

Preferred examples:

```tsx
<p className="font-mono tabular-nums font-semibold">$1,284.50</p>
<span className="font-mono tabular-nums">-42.00</span>
```

Reject:

```tsx
<p className="text-lg">$1,284.50</p>
```

Additional rules:

- Titles and captions should follow the hierarchy in `design-system.md`.
- Do not use arbitrary text sizes such as `text-[15px]`.
- Do not restyle primitive-owned text containers with one-off typography classes to create new visual variants.

---

## 7. Spacing Rules For Page Authors

Page authors compose sections using layout spacing, but they do not redefine primitive internals.

Canonical composition targets:

| Placement | Mobile | Desktop |
| --- | --- | --- |
| Page margin | `1rem` | `2.5rem` |
| Section gap | `1.5rem` | `3rem` |
| Card padding | owned by primitive | owned by primitive |
| Element gap inside cards | owned by primitive | owned by primitive |

Allowed examples:

```tsx
<main className="mx-auto max-w-5xl p-4 lg:p-10">
  {/* Page container spacing is layout composition, not primitive call-site restyling. */}
  <section className="grid grid-cols-1 gap-6 lg:gap-12">
    <Card className="max-w-md" />
    <Card className="md:col-span-2" />
  </section>
</main>
```

Reject:

```tsx
<Card className="p-8 gap-6 rounded-3xl">
  ...
</Card>
```

---

## 8. Overlay, Blur, and Active-State Rules

These rules are intentionally repeated here because reviewers must enforce them at call sites.

- Overlays must not receive call-site blur or surface overrides.
- The canonical glass guidance is backdrop blur at `backdrop-blur-xl` minimum with translucent surfaces and a hairline edge highlight.
- Buttons and other pressable primitives must not receive competing page-level active-scale rules.
- The canonical active-state rule is `active:scale-95`.

If you find `backdrop-blur-sm`, `active:scale-[0.98]`, or similar alternatives on a primitive call site, treat that as a contract violation.

---

## 9. Page Review Checklist

Use this before merging page or feature UI work.

- [ ] The page is built from `components/ui` primitives where a primitive exists.
- [ ] Primitive call sites use `className` only for layout placement and sizing.
- [ ] No primitive call site uses `bg-*`, `text-*`, `border-*`, `rounded-*`, `shadow-*`, `backdrop-blur-*`, or surface opacity classes to restyle visuals.
- [ ] Missing visual treatments are routed to primitive API changes, not page patches.
- [ ] Cards and overlays rely on primitive-owned glass styling.
- [ ] Buttons rely on primitive-owned hover and active styling.
- [ ] Financial amounts use monospace and `tabular-nums`.
- [ ] Primitive-internal spacing is not overridden from the page.
- [ ] Responsive classes change layout, not visual identity.

---

## 10. Fast Review Matrix

| Example | Accept? | Why |
| --- | --- | --- |
| `<Card className="max-w-md mx-auto" />` | Yes | Layout only |
| `<Card className="md:col-span-2" />` | Yes | Layout only |
| `<Button variant="outline" className="w-full md:w-auto" />` | Yes | Prop owns visuals; class owns width |
| `<Button className="bg-primary text-white" />` | No | Call site is styling visuals |
| `<DialogContent className="backdrop-blur-sm" />` | No | Overlay blur belongs to primitive |
| `<Badge className="rounded-full bg-green-500/20" />` | No | Badge visuals belong to primitive |
| `<Card className="p-8" />` | No | Restyles primitive internals |
| `<p className="font-mono tabular-nums">$245.00</p>` | Yes | Required financial typography |

---

## 11. Summary

For page and feature authors, the rule is simple:

- Choose the right primitive.
- Use primitive props for visual intent.
- Use `className` only for placement and layout.
- Escalate missing visuals into primitive API changes.
- Keep financial typography and V2 glass rules consistent.
