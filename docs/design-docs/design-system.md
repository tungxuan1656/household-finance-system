# Design System

> **Purpose:** Operational contract for tokens and primitive-owned visuals.
> **Use this file when:** Updating tokens, primitive defaults, or primitive APIs in `apps/web/src/components/ui`.
> **Do not use this file for:** Page-level visual styling decisions. Page and feature authors must follow `ui-implementation-rules.md`.

---

## 1. Contract Boundaries

This repository has one visual ownership rule:

- `docs/design-docs/design-system.md` defines the operational token and primitive contract.
- `docs/design-docs/ui-implementation-rules.md` defines how pages and shared feature components may consume primitives.
- `apps/web/src/components/ui` owns visual styling.
- Page, route, and feature call sites may control layout only.

If these documents disagree, resolve them in this order:

1. `design-system.md`
2. `ui-implementation-rules.md`

Non-negotiable rules:

- Do not hardcode hex colors or ad hoc visual values in app code.
- Do not add page-level visual overrides to compensate for missing primitive variants.
- If the needed visual treatment does not exist, extend the primitive API with `variant`, `size`, `tone`, or `surface`.

---

## 2. Token Ownership

All tokens live in exactly one file:

```text
apps/web/src/index.css
```

Rules:

- Tokens must be semantic, not page-specific.
- Tokens must support both light and dark modes when applicable.
- Tokens are introduced only to support reusable primitive behavior, not a one-off page request.
- Visual decisions must flow from tokens into primitives, then from primitives into pages.

Decision path:

1. Can the existing primitive API express the desired UI?
2. If no, can an existing token support a new primitive `variant`, `tone`, `size`, or `surface`?
3. If no, add or revise tokens in `index.css`, then expose the result through the primitive.
4. Never skip directly to page-level `className` visual overrides.

---

## 3. V2.1 Core Visual Rules

These rules operationalize V2.1 and are the canonical values and semantics for this repository.

### 3.1 Color System

All colors use OKLCH.

| Token | Dark Mode | Light Mode | Meaning |
| --- | --- | --- | --- |
| `--background` | `oklch(0.14 0.02 250)` | `oklch(0.98 0.01 250)` | Lowest page surface, Midnight Slate in dark mode. |
| `--card` | `oklch(0.20 0.03 250 / 0.65)` | `oklch(1 0 0 / 0.8)` | Glass content surface, never opaque. |
| `--primary` | `oklch(0.70 0.15 250)` | `oklch(0.60 0.18 250)` | Maia Blue brand/action color. |
| `--border` | `oklch(1 0 0 / 0.1)` | `oklch(0 0 0 / 0.08)` | Hairline reflective border. |
| `--foreground` | `oklch(0.98 0.01 250)` | `oklch(0.25 0.02 250)` | Primary text. |
| `--muted` | `oklch(0.85 0.02 250 / 0.6)` | `oklch(0.4 0.02 250)` | Secondary text and muted content. |

Operational notes:

- `--background` is the page foundation, not pure black or pure white.
- `--card` is a translucent glass layer, not a solid panel token.
- `--border` is a subtle edge highlight, not a heavy divider color.
- `--primary` is reserved for brand emphasis and key actions.

### 3.2 Glass Surface Anatomy

All block primitives that present as glass surfaces must follow the same three-part rule:

1. Backdrop blur: `backdrop-blur-xl` minimum.
2. Surface opacity: `65% - 80%` effective opacity.
3. Edge highlight: thin reflective border using the border token semantics.

Applies to:

- `Card`
- `DialogContent`
- `PopoverContent`
- `SheetContent` when visually treated as a floating surface

This is a single-source rule. Do not define alternate blur tiers in other docs unless the V2 spec changes.

### 3.3 Radius System

| Surface Type | Value | Intended Owner |
| --- | --- | --- |
| Page card / main container | `1.5rem` (24px) | Primitive default for large containers |
| Interactive element | `0.75rem` (12px) | Primitive default for button/input/card internals |
| Small element | `0.375rem` (6px) | Primitive default for checkbox/tag/badge |

Call sites must not change these values with `rounded-*` classes unless the primitive API explicitly exposes a supported size or surface option.

### 3.4 Shadow System

Standard glass elevation:

```css
0 0 0 1px oklch(1 0 0 / 0.05), 0 20px 40px -12px rgba(0, 0, 0, 0.4)
```

Rules:

- Use one canonical glass shadow system for elevated surfaces.
- Do not swap shadows at page call sites.
- Hover/elevation behavior belongs inside primitives.

### 3.5 Typography System

#### Typefaces

- UI text: modern sans (`Geist`, `Inter`, or system equivalent already used by the app).
- Financial data: monospace is mandatory.

#### Financial UI requirements

- Every currency amount, balance, total, subtotal, trend value, and ledger-like numeric column must use monospace.
- Financial numbers must use `tabular-nums`.
- Amount emphasis should use at least `font-semibold`.

#### Hierarchy rules

| Content Type | Required Treatment |
| --- | --- |
| Titles (`H1`, `H2`) | `font-bold tracking-tighter text-foreground` |
| Amounts | monospace + `tabular-nums` + `font-semibold` |
| Labels / captions | `font-medium` with muted text token semantics, `text-xs` or `text-sm` |

Disallowed:

- Proportional fonts for financial amounts.
- Arbitrary one-off type sizes for routine UI.
- Page-level typography overrides that restyle primitive content containers into a new visual system.

### 3.6 Spacing System

The design system uses a 4px base scale, but V2.1 defines the operational spacing targets below.

| Placement | Mobile | Desktop |
| --- | --- | --- |
| Page margin | `1rem` (16px) | `2.5rem` (40px) |
| Section gap | `1.5rem` (24px) | `3rem` (48px) |
| Card padding | `1.25rem` (20px) | `1.5rem` (24px) |
| Element gap inside cards | `0.75rem` (12px) | `1rem` (16px) |

Rules:

- These values are the canonical mobile/desktop spacing targets for financial UI.
- Primitive-internal spacing is owned by the primitive.
- Page authors may compose primitives within layout containers, but may not tighten or loosen primitive internals to create a new visual style.

### 3.7 Interaction Rules

Interaction guidance must be consistent across all docs.

- Buttons use `hover:brightness-110`.
- Buttons use `active:scale-95`.
- Do not publish or implement a competing active-scale rule such as `active:scale-[0.98]` unless V2 changes.
- Overlay backdrops follow the V2 glass rule and must not downgrade to weaker blur guidance elsewhere.

---

## 4. Primitive Ownership Rules

Visual ownership belongs to `apps/web/src/components/ui`.

Primitive-owned concerns:

- Surface color and opacity
- Text color semantics that belong to the primitive state
- Border treatment and border opacity
- Radius
- Shadow and elevation
- Blur and backdrop treatment
- Hover, focus, and active visuals
- Primitive-internal padding and gaps that define the primitive's look
- Typography decisions baked into primitive roles or slots

Call-site-owned concerns:

- Width and height constraints
- Min/max constraints
- Grid/flex placement
- Responsive layout changes
- Container margins used for placement
- Positioning and stacking within page layout
- Order and visibility

If a primitive exposes a prop for a visual decision, use that prop. If it does not, add the prop at the primitive layer instead of overriding with page classes.

---

## 5. Token Changes Are Escalations, Not First-Line Work

Adding tokens is allowed only when all of the following are true:

1. The V2.1 aesthetic requires a reusable visual concept that existing tokens cannot express.
2. The concept will be owned by one or more primitives.
3. The need cannot be satisfied by adding a primitive `variant`, `size`, `tone`, or `surface` backed by existing tokens.
4. The new token has a stable semantic meaning beyond one screen.

Do not use custom tokens as the first-line answer to feature work.

Bad escalation path:

1. Page needs a special card.
2. Engineer adds `bg-report-card`, `rounded-[20px]`, `shadow-[...]`.
3. Page now owns visuals.

Required escalation path:

1. Page needs a special card.
2. Evaluate `Card` API.
3. Add `surface="report"` or `variant="report"` to `Card` if the treatment is valid and reusable.
4. Only add tokens if the primitive cannot represent the new surface with existing tokens.

---

## 6. Primitive API Guidance

Preferred primitive extension points:

- `variant`: role or interaction style
- `size`: dimension and internal density
- `tone`: semantic emphasis
- `surface`: container or glass treatment

Examples:

```tsx
<Button variant="default" size="lg">Save changes</Button>

<Badge variant="destructive">Over budget</Badge>

<Card surface="default">...</Card>
```

Avoid this pattern:

```tsx
<Button className="bg-primary text-white rounded-full shadow-lg">Save changes</Button>
```

If the desired API does not exist yet, the primitive should be extended before the page is considered complete.

---

## 7. Reviewer Checklist

Use this checklist when reviewing token or primitive changes.

- [ ] The doc change still defers aesthetic authority to `design-system-v2-spec.md`.
- [ ] Token values and semantics match V2.1 for background, card, primary, border, foreground, and muted.
- [ ] Glass surfaces still require blur + translucency + edge highlight.
- [ ] Overlay blur guidance is consistent with the glass rule.
- [ ] Button active-state guidance is consistently `active:scale-95`.
- [ ] Financial amounts require monospace and `tabular-nums`.
- [ ] Spacing guidance matches the canonical mobile and desktop values.
- [ ] No section encourages page-owned visual styling.
- [ ] No section treats custom tokens as a default feature-level solution.
- [ ] Any new visual need is routed through primitive API expansion.

---

## 8. Quick Violation Matrix

| If you see this | It means | Required fix |
| --- | --- | --- |
| Page asks for new `bg-*`, `text-*`, `border-*`, `rounded-*`, `shadow-*`, or `backdrop-blur-*` on a primitive | Visual ownership leaked to the call site | Move styling into the primitive or add a primitive prop |
| New token added for one page only | Token layer is being used as a workaround | Remove token or justify it as reusable primitive support |
| Opaque card guidance | Drift from V2.1 glass spec | Restore translucent card treatment |
| Overlay doc says weaker blur than cards | Contradictory glass rules | Use the canonical glass rule |
| Financial amounts shown in proportional font | Readability regression for finance UI | Use monospace + `tabular-nums` |

---

## 9. Summary

The visual system is centralized on purpose:

- V2.1 defines the look.
- Tokens encode reusable semantics.
- `components/ui` owns visuals.
- Pages compose primitives and control layout only.
- Missing visuals are solved by extending primitives, not patching pages.
