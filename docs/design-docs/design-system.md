# Design System

> **When to use this file:** When refactoring core components, changing global theme, colors, fonts, shadows, or adding new component variants.  
> **When NOT to use this file:** When building a single page — see `ui-implementation-rules.md` instead.  
> **Single source of truth:** `apps/web/src/index.css` is the only file that defines tokens.

---

## Table of Contents

1. [Philosophy](#1-philosophy)
2. [Single Source of Truth](#2-single-source-of-truth)
3. [Color System](#3-color-system)
4. [Semantic Usage Map](#4-semantic-usage-map)
5. [Border Radius](#5-border-radius)
6. [Shadow System](#6-shadow-system)
7. [Typography](#7-typography)
8. [Spacing Scale](#8-spacing-scale)
9. [Animation Tokens](#9-animation-tokens)
10. [Breakpoints](#10-breakpoints)
11. [Layout Architecture](#11-layout-architecture)
12. [Safe Areas](#12-safe-areas)
13. [Adding Custom Tokens](#13-adding-custom-tokens)
14. [Changing the Theme](#14-changing-the-theme)

---

## 1. Philosophy

This design system powers a **modern, minimal, clean** fintech application for household expense management. It is optimized for **mobile-first** usage while providing a premium desktop experience.

**Principles:**
1. **Content-first**: Data and actions take precedence over decorative elements.
2. **Mobile-native**: Bottom tab navigation, large touch targets, swipe-friendly.
3. **Systematic**: All values derive from a 4px base scale.
4. **Semantic**: Colors, spacing, and typography use tokens, never raw values.
5. **Accessible**: WCAG 2.1 AA compliant, touch-friendly, screen-reader friendly.

**Visual style**: Flat minimal. No glassmorphism or liquid glass (reserved for Auth pages only). Subtle shadows (`sm`/`md`), clean surfaces, generous whitespace (comfortable density).

**Brand colors**: Maia-Mist primary (slate family, `oklch(0.218 0.008 223.9)`) for neutrality and clarity. Subtle accent (`oklch(0.963 0.002 197.1)`) for secondary surfaces. Destructive red for errors.

---

## 2. Single Source of Truth

**All design tokens live in exactly one file:**

```
apps/web/src/index.css
```

**Rules:**
- Never create additional CSS files for tokens.
- Never hardcode color, spacing, radius, or shadow values in `.tsx` files.
- All tokens must define both light mode (`:root`) and dark mode (`.dark`).
- All color tokens must define both base and foreground (`--*-foreground`).

---

## 3. Color System

All colors use the **OKLCH** color space for perceptual uniformity and accessibility.

### 3.1 Light Mode (`:root`)

| Token | OKLCH Value | Purpose |
|-------|-------------|---------|
| `--background` | `oklch(1 0 0)` | Page background (pure white) |
| `--foreground` | `oklch(0.148 0.004 228.8)` | Primary text (slate-900) |
| `--card` | `oklch(1 0 0)` | Card surfaces |
| `--card-foreground` | `oklch(0.148 0.004 228.8)` | Text on cards |
| `--popover` | `oklch(1 0 0)` | Dropdown/popover backgrounds |
| `--popover-foreground` | `oklch(0.148 0.004 228.8)` | Text on popovers |
| `--primary` | `oklch(0.218 0.008 223.9)` | Primary actions, links (slate) |
| `--primary-foreground` | `oklch(0.987 0.002 197.1)` | Text on primary backgrounds |
| `--secondary` | `oklch(0.963 0.002 197.1)` | Secondary backgrounds (mist) |
| `--secondary-foreground` | `oklch(0.218 0.008 223.9)` | Text on secondary backgrounds |
| `--muted` | `oklch(0.963 0.002 197.1)` | Muted/disabled backgrounds |
| `--muted-foreground` | `oklch(0.56 0.021 213.5)` | Secondary text, placeholders |
| `--accent` | `oklch(0.963 0.002 197.1)` | Subtle highlights, hover states |
| `--accent-foreground` | `oklch(0.218 0.008 223.9)` | Text on accent backgrounds |
| `--destructive` | `oklch(0.577 0.245 27.325)` | Errors, delete actions |
| `--destructive-foreground` | `oklch(0.987 0.002 197.1)` | Text on destructive backgrounds |
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
| `--popover` | `oklch(0.218 0.008 223.9)` | Dark popover backgrounds |
| `--popover-foreground` | `oklch(0.987 0.002 197.1)` | Light text on popovers |
| `--primary` | `oklch(0.925 0.005 214.3)` | Lighter slate for dark mode |
| `--primary-foreground` | `oklch(0.218 0.008 223.9)` | Dark text on primary |
| `--secondary` | `oklch(0.275 0.011 216.9)` | Dark secondary |
| `--secondary-foreground` | `oklch(0.987 0.002 197.1)` | Light text |
| `--muted` | `oklch(0.275 0.011 216.9)` | Dark muted |
| `--muted-foreground` | `oklch(0.723 0.014 214.4)` | Lighter secondary text |
| `--accent` | `oklch(0.275 0.011 216.9)` | Dark accent |
| `--accent-foreground` | `oklch(0.987 0.002 197.1)` | Light text |
| `--destructive` | `oklch(0.704 0.191 22.216)` | Brighter red for dark |
| `--destructive-foreground` | `oklch(0.987 0.002 197.1)` | Text on destructive |
| `--border` | `oklch(1 0 0 / 10%)` | Subtle borders |
| `--input` | `oklch(1 0 0 / 15%)` | Input borders |
| `--ring` | `oklch(0.56 0.021 213.5)` | Focus rings |

### 3.3 Chart Colors

| Token | Light Mode | Dark Mode | Purpose |
|-------|------------|-----------|---------|
| `--chart-1` | `oklch(0.55 0.15 174)` | `oklch(0.65 0.12 174)` | Primary data (teal) |
| `--chart-2` | `oklch(0.75 0.12 45)` | `oklch(0.55 0.1 45)` | Secondary data (amber) |
| `--chart-3` | `oklch(0.623 0.214 259.815)` | Same | Tertiary data (blue) |
| `--chart-4` | `oklch(0.488 0.243 264.376)` | Same | Quaternary data (indigo) |
| `--chart-5` | `oklch(0.424 0.199 265.638)` | Same | Quinary data (purple) |

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

## 4. Semantic Usage Map

Quick reference: which semantic token to use for which UI element.

| UI Element | Token | Tailwind Example |
|------------|-------|------------------|
| Primary button | `--primary` / `--primary-foreground` | `bg-primary text-primary-foreground` |
| Secondary button | `--secondary` / `--secondary-foreground` | `bg-secondary text-secondary-foreground` |
| Ghost button hover | `--accent` / `--accent-foreground` | `hover:bg-accent hover:text-accent-foreground` |
| Destructive button | `--destructive` / `--destructive-foreground` | `bg-destructive text-destructive-foreground` |
| Page background | `--background` / `--foreground` | `bg-background text-foreground` |
| Card surface | `--card` / `--card-foreground` | `bg-card text-card-foreground` |
| Form input border | `--input` | `border-input` |
| Focus ring | `--ring` | `focus-visible:ring-ring` |
| Disabled text | `--muted-foreground` | `text-muted-foreground` |
| Income amount | `--primary` | `text-primary` |
| Error message | `--destructive` | `text-destructive` |
| Border/divider | `--border` | `border-border` |
| Badge (default) | `--primary` / `--primary-foreground` | Built-in Badge variant |
| Badge (secondary) | `--secondary` / `--secondary-foreground` | Built-in Badge variant |
| Skeleton loading | `--muted` | Built-in Skeleton variant |

---

## 5. Border Radius

| Token | Formula | Approximate |
|-------|---------|-------------|
| `--radius` | Base | `0.625rem` (~10px) |
| `--radius-sm` | `radius * 0.6` | ~6px |
| `--radius-md` | `radius * 0.8` | ~8px |
| `--radius-lg` | `radius` | ~10px |
| `--radius-xl` | `radius * 1.4` | ~14px |
| `--radius-2xl` | `radius * 1.8` | ~18px |
| `--radius-3xl` | `radius * 2.2` | ~22px |
| `--radius-4xl` | `radius * 2.6` | ~26px |

**Rule:** To change global radius, update only `--radius`. All derived values update automatically.

---

## 6. Shadow System

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

**Mobile note:** Use `shadow-sm` and `shadow-md` primarily. Reserve `shadow-lg`/`shadow-xl` for overlays only.

---

## 7. Typography

### 7.1 Font Family

```tsx
// app/layout.tsx
import { Inter } from "next/font/google"
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
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

### 7.2 Type Scale

| Token | Mobile | Desktop | Line Height | Usage |
|-------|--------|---------|-------------|-------|
| `text-xs` | 12px | 12px | 16px | Captions, badges, timestamps |
| `text-sm` | 14px | 14px | 20px | Secondary text, buttons, labels |
| `text-base` | 16px | 16px | 24px | Body text, inputs, form labels |
| `text-lg` | 18px | 18px | 28px | Section titles, card headings |
| `text-xl` | 20px | 24px | 28px / 32px | Page titles |
| `text-2xl` | 24px | 30px | 32px / 36px | Dashboard stats, hero numbers |
| `text-3xl` | 30px | 36px | 36px / 40px | Welcome messages, large figures |

**Font Weights:**
- `font-normal` (400): Body text, descriptions
- `font-medium` (500): Buttons, labels, tab triggers
- `font-semibold` (600): Headings, card titles, section headers
- `font-bold` (700): Hero numbers, emphasis (rare)

**Rules:**
- Never use arbitrary font sizes like `text-[15px]` or `text-[13px]`.
- Never use `font-thin` (100) or `font-extralight` (200).
- Mobile headings should not exceed `text-2xl`.

### 7.3 Line Height

| Context | Value |
|---------|-------|
| Headings | `leading-tight` (1.25) |
| Body text | `leading-normal` (1.5) |
| Captions | `leading-snug` (1.375) |
| List items | `leading-relaxed` (1.625) |

---

## 8. Spacing Scale

All spacing uses a **4px base unit**.

| Token | Value | Common Usage |
|-------|-------|-------------|
| `1` | 4px | Tight internal gaps |
| `2` | 8px | Icon margins, small gaps |
| `3` | 12px | Medium gaps, compact padding |
| `4` | 16px | Standard padding, section gaps |
| `5` | 20px | Card padding (comfortable) |
| `6` | 24px | Section margins |
| `8` | 32px | Large section gaps |
| `10` | 40px | Page-level spacing |
| `12` | 48px | Major section breaks |
| `16` | 64px | Hero / page breaks |

**Mobile-first rules:**
- Default padding: `p-4` (16px) on mobile, `md:p-6`, `lg:p-8`.
- Section gaps: `gap-4` mobile, `md:gap-6`.
- List items: `py-4` (16px vertical) for comfortable density.

---

## 9. Animation Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--duration-fast` | `150ms` | Hover, focus, opacity changes |
| `--duration-base` | `200ms` | State changes, shadow transitions |
| `--duration-slow` | `300ms` | Dialogs, sheets, drawers, page transitions |
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

**Rules:**
- Never exceed 300ms duration.
- Never use `animate-bounce` or `animate-pulse` for UI elements (use `Skeleton` for loading).
- Respect `prefers-reduced-motion`:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 10. Breakpoints

| Name | Value | Tailwind Prefix | Usage |
|------|-------|-----------------|-------|
| `sm` | 640px | `sm:` | Large phones |
| `md` | 768px | `md:` | Tablets, small laptops (sidebar appears) |
| `lg` | 1024px | `lg:` | Laptops (max-width container) |
| `xl` | 1280px | `xl:` | Desktops |
| `2xl` | 1536px | `2xl:` | Large desktops |

**Strategy:** Mobile-first. Write styles for mobile first, then override with `md:`, `lg:`.

---

## 11. Layout Architecture

### 11.1 App Shell

```
<AppShell>
  ├── <DesktopSidebar>  (md+: sticky, 240-280px)
  ├── <MobileHeader>    (<md: 56px, sticky, blur)
  ├── <MainContent>     (flex-1, scrollable)
  └── <BottomTab>       (<md: fixed, 64px)
```

### 11.2 Desktop Sidebar

- Width: 240–280px
- Position: `sticky top-0`
- Background: `bg-sidebar`
- Contains: Logo, primary navigation links, user avatar

### 11.3 Mobile Header

- Height: 56px
- Position: `sticky top-0 z-40`
- Background: `bg-background/80 backdrop-blur-md`
- Border: `border-b border-border/50`
- Safe area: `pt-safe`
- Contains: Back button (if applicable), page title, action buttons

### 11.4 Bottom Tab Bar

- Height: 64px + `pb-safe`
- Position: `fixed bottom-0 z-50`
- Background: `bg-background/50 backdrop-blur-lg border-t border-border/70`
- Shadow: `shadow-md`
- 5 tabs: Home, Expenses, Budgets, Insights, Profile
- Each tab icon: 24px, label: `text-xs`
- Active tab: `text-primary`
- Inactive tab: `text-muted-foreground`

### 11.5 Main Content Area

| Breakpoint | Padding | Bottom Padding |
|------------|---------|----------------|
| Mobile | `p-4` (16px) | `pb-24` (96px, accounts for bottom tab) |
| md | `p-6` (24px) | `pb-8` (32px) |
| lg | `p-8` (32px) | `pb-0` |
| Max width | — | `max-w-5xl` centered on `lg+` |

### 11.6 Scroll Behavior

- Main content area scrolls independently.
- Mobile header and bottom tab remain fixed.
- Desktop sidebar scrolls independently if content overflows.

---

## 12. Safe Areas

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

**Usage:**
- Apply `pb-safe` to fixed bottom elements (BottomTab).
- Apply `pt-safe` to fixed top elements (MobileHeader).

---

## 13. Adding Custom Tokens

To add a new color (e.g., `--warning`):

### Step 1: Define in `index.css`

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

### Step 2: Register in `@theme inline`

```css
@theme inline {
  --color-warning: var(--warning);
  --color-warning-foreground: var(--warning-foreground);
}
```

### Step 3: Use in components

```tsx
<div className="bg-warning text-warning-foreground">Warning</div>
```

**Rules:**
- New tokens must always define light mode, dark mode, and foreground pair.
- Update the **Semantic Usage Map** (§4) when adding new tokens.
- Never create tokens without documenting their intended usage.

---

## 14. Changing the Theme

### To change primary color:

1. Update `--primary` in `:root` and `.dark` in `index.css`.
2. Update `--chart-1` if needed.
3. Done. All components using `bg-primary` update automatically.

### To change font:

1. Update font import in `app/layout.tsx`.
2. Ensure `--font-sans` variable is set.
3. Done.

### To change border radius:

1. Update `--radius` in `index.css`.
2. All `rounded-lg`, `rounded-xl`, etc. update automatically.

### To add a new semantic token:

Follow the **3-step guide in §13** above.

---

## Appendix A: Token Migration Guide (from old docs)

| Old Token (if any) | New Token | Notes |
|--------------------|-----------|-------|
| `bg-blue-500` | `bg-primary` | Now slate (maia-mist) |
| `text-gray-600` | `text-muted-foreground` | Consistent naming |
| `bg-white` | `bg-background` / `bg-card` | Semantic |
| `bg-white/10` | `bg-card/80` | For glass-like surfaces |
