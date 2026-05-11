# Design System

> **When to use this file:** When changing global theme, colors, fonts, shadows, or adding new component variants.  
> **When NOT to use this file:** When building a single page — see `ui-implementation-rules.md` instead.

---

## 1. Philosophy

This design system powers a **modern, minimal, clean** fintech application for household expense management. It is optimized for **mobile-first** usage while providing a premium desktop experience.

**Principles:**
1. **Content-first**: Data and actions take precedence over decorative elements.
2. **Mobile-native**: Bottom tab navigation, large touch targets, swipe-friendly.
3. **Systematic**: All values derive from a 4px base scale.
4. **Semantic**: Colors, spacing, and typography use tokens, never raw values.
5. **Accessible**: WCAG 2.1 AA compliant, touch-friendly, screen-reader friendly.

---

## 2. Single Source of Truth

**All design tokens live in exactly one file:**

```
apps/web/src/index.css
```

**Rule:** Never create additional CSS files for tokens. Never hardcode values in `.tsx` files.

---

## 3. Color System

### 3.1 Light Mode (`:root`)

| Token | OKLCH Value | Purpose |
|-------|-------------|---------|
| `--background` | `oklch(0.98 0.002 240)` | Page background (warm white) |
| `--foreground` | `oklch(0.148 0.004 228.8)` | Primary text |
| `--card` | `oklch(1 0 0)` | Card surfaces |
| `--card-foreground` | `oklch(0.148 0.004 228.8)` | Text on cards |
| `--popover` | `oklch(1 0 0)` | Dropdown/popover backgrounds |
| `--popover-foreground` | `oklch(0.148 0.004 228.8)` | Text on popovers |
| `--primary` | `oklch(0.55 0.15 174)` | Primary actions, links (teal) |
| `--primary-foreground` | `oklch(0.987 0.002 197.1)` | Text on primary backgrounds |
| `--secondary` | `oklch(0.963 0.002 197.1)` | Secondary backgrounds |
| `--secondary-foreground` | `oklch(0.218 0.008 223.9)` | Text on secondary backgrounds |
| `--muted` | `oklch(0.963 0.002 197.1)` | Muted/disabled backgrounds |
| `--muted-foreground` | `oklch(0.56 0.021 213.5)` | Secondary text, placeholders |
| `--accent` | `oklch(0.75 0.12 45)` | Highlights, badges, tips (amber) |
| `--accent-foreground` | `oklch(0.218 0.008 223.9)` | Text on accent backgrounds |
| `--destructive` | `oklch(0.577 0.245 27.325)` | Errors, delete actions |
| `--border` | `oklch(0.925 0.005 214.3)` | Borders, dividers |
| `--input` | `oklch(0.925 0.005 214.3)` | Input borders |
| `--ring` | `oklch(0.723 0.014 214.4)` | Focus rings |

### 3.2 Dark Mode (`.dark`)

| Token | OKLCH Value | Purpose |
|-------|-------------|---------|
| `--background` | `oklch(0.148 0.004 228.8)` | Dark page background |
| `--foreground` | `oklch(0.987 0.002 197.1)` | Light text |
| `--card` | `oklch(0.218 0.008 223.9)` | Dark card surfaces |
| `--card-foreground` | `oklch(0.987 0.002 197.1)` | Light text on cards |
| `--primary` | `oklch(0.65 0.12 174)` | Lighter teal for dark mode |
| `--primary-foreground` | `oklch(0.148 0.004 228.8)` | Dark text on primary |
| `--secondary` | `oklch(0.275 0.011 216.9)` | Dark secondary |
| `--secondary-foreground` | `oklch(0.987 0.002 197.1)` | Light text |
| `--muted` | `oklch(0.275 0.011 216.9)` | Dark muted |
| `--muted-foreground` | `oklch(0.723 0.014 214.4)` | Lighter secondary text |
| `--accent` | `oklch(0.55 0.1 45)` | Darker amber |
| `--accent-foreground` | `oklch(0.987 0.002 197.1)` | Light text |
| `--destructive` | `oklch(0.704 0.191 22.216)` | Brighter red for dark |
| `--border` | `oklch(1 0 0 / 10%)` | Subtle borders |
| `--input` | `oklch(1 0 0 / 15%)` | Input borders |
| `--ring` | `oklch(0.56 0.021 213.5)` | Focus rings |

### 3.3 Chart Colors

| Token | Light Mode | Dark Mode |
|-------|------------|-----------|
| `--chart-1` | `oklch(0.55 0.15 174)` | `oklch(0.65 0.12 174)` |
| `--chart-2` | `oklch(0.75 0.12 45)` | `oklch(0.55 0.1 45)` |
| `--chart-3` | `oklch(0.623 0.214 259.815)` | Same |
| `--chart-4` | `oklch(0.488 0.243 264.376)` | Same |
| `--chart-5` | `oklch(0.424 0.199 265.638)` | Same |

### 3.4 Sidebar Colors

| Token | Light Mode | Dark Mode |
|-------|------------|-----------|
| `--sidebar` | `oklch(0.987 0.002 197.1)` | `oklch(0.218 0.008 223.9)` |
| `--sidebar-foreground` | `oklch(0.148 0.004 228.8)` | `oklch(0.987 0.002 197.1)` |
| `--sidebar-primary` | `oklch(0.218 0.008 223.9)` | `oklch(0.488 0.243 264.376)` |
| `--sidebar-primary-foreground` | `oklch(0.987 0.002 197.1)` | `oklch(0.987 0.002 197.1)` |
| `--sidebar-accent` | `oklch(0.963 0.002 197.1)` | `oklch(0.275 0.011 216.9)` |
| `--sidebar-accent-foreground` | `oklch(0.218 0.008 223.9)` | `oklch(0.987 0.002 197.1)` |
| `--sidebar-border` | `oklch(0.925 0.005 214.3)` | `oklch(1 0 0 / 10%)` |
| `--sidebar-ring` | `oklch(0.723 0.014 214.4)` | `oklch(0.56 0.021 213.5)` |

---

## 4. Border Radius

| Token | Formula | Approximate |
|-------|---------|-------------|
| `--radius` | Base | 12px |
| `--radius-sm` | `radius × 0.6` | 7px |
| `--radius-md` | `radius × 0.8` | 10px |
| `--radius-lg` | `radius` | 12px |
| `--radius-xl` | `radius × 1.4` | 17px |
| `--radius-2xl` | `radius × 1.8` | 22px |
| `--radius-3xl` | `radius × 2.2` | 26px |
| `--radius-4xl` | `radius × 2.6` | 31px |

**Rule:** To change global radius, update only `--radius`. All derived values update automatically.

---

## 5. Shadow System

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` | Subtle elevation |
| `--shadow-md` | `0 4px 6px -1px rgb(0 0 0 / 0.1)` | Cards, dropdowns |
| `--shadow-lg` | `0 10px 15px -3px rgb(0 0 0 / 0.1)` | Modals, drawers |
| `--shadow-xl` | `0 20px 25px -5px rgb(0 0 0 / 0.1)` | Overlays |

**Registration in Tailwind:**
```css
@theme inline {
  --shadow-sm: var(--shadow-sm);
  --shadow-md: var(--shadow-md);
  --shadow-lg: var(--shadow-lg);
  --shadow-xl: var(--shadow-xl);
}
```

---

## 6. Typography

### 6.1 Font Family

```tsx
// app/layout.tsx
import { Inter } from 'next/font/google'
const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-sans',
  display: 'swap',
})
```

**Registration:**
```css
@theme inline {
  --font-sans: var(--font-sans);
  --font-heading: var(--font-sans);
}
```

**Rule:** To change font, update `layout.tsx` (1 line) and ensure `--font-sans` is registered. No other files need changes.

### 6.2 Type Scale

| Token | Mobile | Desktop | Line Height | Usage |
|-------|--------|---------|-------------|-------|
| `text-xs` | 12px | 12px | 16px | Captions, badges |
| `text-sm` | 14px | 14px | 20px | Secondary text, buttons |
| `text-base` | 16px | 16px | 24px | Body, inputs |
| `text-lg` | 18px | 18px | 28px | Section titles |
| `text-xl` | 20px | 24px | 28px/32px | Page titles |
| `text-2xl` | 24px | 30px | 32px/36px | Dashboard stats |
| `text-3xl` | 30px | 36px | 36px/40px | Hero numbers |

**Font Weights:**
- `font-normal` (400): Body text
- `font-medium` (500): Buttons, labels
- `font-semibold` (600): Headings

**Rule:** Never use arbitrary font sizes like `text-[15px]` or `text-[13px]`.

---

## 7. Spacing Scale

All spacing uses a 4px base unit.

| Token | Value | Common Usage |
|-------|-------|-------------|
| `1` | 4px | Tight gaps |
| `2` | 8px | Icon margins, small gaps |
| `3` | 12px | Medium gaps |
| `4` | 16px | Standard padding, section gaps |
| `5` | 20px | Card padding |
| `6` | 24px | Section margins |
| `8` | 32px | Large sections |
| `10` | 40px | Page-level spacing |
| `12` | 48px | Major sections |
| `16` | 64px | Hero/page breaks |

---

## 8. Animation Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--duration-fast` | 150ms | Hover, focus |
| `--duration-base` | 200ms | State changes |
| `--duration-slow` | 300ms | Page transitions |
| `--ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | Elements entering |
| `--ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` | State switching |

**Registration:**
```css
@theme inline {
  --transition-duration-fast: var(--duration-fast);
  --transition-duration-base: var(--duration-base);
  --transition-duration-slow: var(--duration-slow);
  --ease-out: var(--ease-out);
  --ease-in-out: var(--ease-in-out);
}
```

---

## 9. Breakpoints

| Name | Value | Tailwind Prefix | Usage |
|------|-------|-----------------|-------|
| `sm` | 640px | `sm:` | Large phones |
| `md` | 768px | `md:` | Tablets, small laptops |
| `lg` | 1024px | `lg:` | Laptops |
| `xl` | 1280px | `xl:` | Desktops |
| `2xl` | 1536px | `2xl:` | Large desktops |

**Strategy:** Mobile-first. Write styles for mobile, then override with `md:`, `lg:`.

---

## 10. Layout Architecture

### 10.1 App Shell

```
<AppShell>
  ├── <DesktopSidebar>  (md+: sticky, 240-280px)
  ├── <MobileHeader>    (<md: 56px, sticky, blur)
  ├── <MainContent>     (flex-1, scrollable)
  └── <BottomTab>       (<md: fixed, 64px)
```

### 10.2 Mobile Header

- Height: 56px
- Position: `sticky top-0 z-40`
- Background: `bg-background/80 backdrop-blur-md`
- Border: `border-b border-border/50`
- Safe area: `pt-safe`

### 10.3 Bottom Tab

- Height: 64px + `pb-safe`
- Position: `fixed bottom-0 z-50`
- Background: `bg-background/50 backdrop-blur-lg border-t border-border/70`
- Shadow: `shadow-md`
- 5 tabs: Home, Expenses, Budgets, Insights, Profile

### 10.4 Main Content

| Breakpoint | Padding | Bottom Padding |
|------------|---------|----------------|
| Mobile | `p-4` | `pb-24` (account for bottom tab) |
| md | `p-6` | `pb-8` |
| lg | `p-8` | `pb-0` |
| Max width | — | `max-w-5xl` centered on lg+ |

---

## 11. Adding Custom Tokens

To add a new color (e.g., `--warning`):

**Step 1: Define in `index.css`**
```css
:root {
  --warning: oklch(0.84 0.16 84);
  --warning-foreground: oklch(0.28 0.07 46);
}
.dark {
  --warning: oklch(0.41 0.11 46);
  --warning-foreground: oklch(0.99 0.02 95);
}
```

**Step 2: Register in `@theme inline`**
```css
@theme inline {
  --color-warning: var(--warning);
  --color-warning-foreground: var(--warning-foreground);
}
```

**Step 3: Use in components**
```tsx
<div className="bg-warning text-warning-foreground">Warning</div>
```

**Rule:** New tokens must always define light mode, dark mode, and foreground pair.

---

## 12. Changing the Theme

To change primary color:

1. Update `--primary` in `:root` and `.dark` in `index.css`
2. Done. All components using `bg-primary` update automatically.

To change font:

1. Update font import in `app/layout.tsx`
2. Ensure `--font-sans` variable is set
3. Done.

To change border radius:

1. Update `--radius` in `index.css`
2. All `rounded-lg`, `rounded-xl`, etc. update automatically.

---

## 13. Safe Areas

Pre-defined utilities in `index.css`:

```css
@utility pb-safe { padding-bottom: env(safe-area-inset-bottom); }
@utility pt-safe { padding-top: env(safe-area-inset-top); }
@utility pl-safe { padding-left: env(safe-area-inset-left); }
@utility pr-safe { padding-right: env(safe-area-inset-right); }
@utility p-safe {
  padding: env(safe-area-inset-top) env(safe-area-inset-right)
    env(safe-area-inset-bottom) env(safe-area-inset-left);
}
```

**Usage:** Apply `pb-safe` to fixed bottom elements. Apply `pt-safe` to fixed top elements.
