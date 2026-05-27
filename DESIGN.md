---
name: Vàng Finance
colors:
  primary: "#D4A03D"
  secondary: "#3E3E4A"
  surface: "#252525"
  on-surface: "#FBFBFB"
  error: "#E5534A"
typography:
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 400
rounded:
  md: 10px
---

# Design System

## Overview
A warm, accessible personal-finance interface with dual light/dark modes. Gold-primary accents convey prosperity and clarity. Generous border radius (26px on key surfaces) creates a friendly, approachable feel. Tailwind CSS v4 with OKLCH color space for perceptual uniformity.

## Colors
All tokens defined in OKLCH in `src/index.css`, consumed via CSS custom properties. Both light (`:root`) and dark (`.dark`) modes.

- **Primary** — Gold-amber (`oklch(0.795 0.184 86.047)` dark / `oklch(0.852 0.199 91.936)` light): Buttons, toggles (pill), badges, active states, chart-2
- **Background** — Near-black (`oklch(0.145 0 0)` dark) / white (`oklch(1 0 0)` light)
- **Foreground** — Near-white (`oklch(0.985 0 0)` dark) / near-black (`oklch(0.145 0 0)` light)
- **Card/Popover** — Dark gray (`oklch(0.205 0 0)` dark) / white (`oklch(1 0 0)` light)
- **Muted** — Gray (`oklch(0.269 0 0)` dark) / light gray (`oklch(0.97 0 0)` light) for secondary surfaces
- **Destructive** — Red (`oklch(0.704 0.191 22.216)` dark / `oklch(0.577 0.245 27.325)` light)
- **Border** — White 10% opacity (dark) / light gray (`oklch(0.922 0 0)` light)
- **Status success** — Green (`oklch(0.55 0.15 154)` dark / `oklch(0.72 0.19 154)` light)
- **Status warning** — Amber (`oklch(0.6 0.15 55)` dark / `oklch(0.78 0.18 70)` light)
- **Charts** — 5-step gold-to-orange gradient (chart-1 brightest to chart-5 darkest)

## Typography
- **Sans** — Inter (Next.js font, 400–900 weight): Body text, headings, labels
- **Mono** — JetBrains Mono: Code, numbers, financial figures
- **Headings** — Inter, `font-heading` alias. Section titles: `text-lg font-semibold`. Page titles: `text-2xl tracking-tight`
- **Body** — Inter, `text-sm` (14px) default, `text-base` (16px) on mobile buttons
- **Labels** — Inter, `text-xs font-medium`, uppercase for stat section headers (`tracking-wide`)
- **Descriptions** — `text-sm text-muted-foreground`

## Rounded
Base radius: `0.625rem` (10px). Scaled variants: sm (6px), md (8px), lg (10px), xl (14px), 2xl (18px), 3xl (22px), 4xl (26px). Key surfaces use **4xl (26px)** — buttons, cards, dialogs, dropdowns, comboboxes, drawers. Switch and progress use `rounded-full` (pill). Avatar uses `rounded-full` (circle).

## Components

### Button
Pill-shaped (`rounded-4xl`). 6 variants: default (primary fill), secondary, outline, ghost, destructive, link. 7 sizes including xs, sm, default (h-11→sm:h-9), lg, xl, icon. Pressed state translates down 1px. Disabled: opacity-50 no-pointer.

### Card
`rounded-4xl` with `shadow-md` and subtle `ring-1 ring-foreground/5`. Two sizes: default (gap-6 py-5) and sm. Image-as-first-child pattern rounds top corners to match card radius.

### Input / Select / Textarea
`rounded-3xl` (22px). Focus ring: `focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30`. Invalid: `aria-invalid:border-destructive` with red ring. Transition targets color, box-shadow, background-color. InputGroup wraps controls in a single styled container with `rounded-4xl`.

### Dialog / Alert Dialog / Drawer
`rounded-4xl` (26px) content surface. `shadow-xl` elevation. Overlay: `bg-black/30` with `backdrop-blur-sm`. Animated entry (fade-in + zoom-in-95). Drawer uses Vaul library with drag handle for mobile.

### Badge
`rounded-3xl` (22px), `h-5`, `text-xs font-medium`. 7 variants mirroring button variants plus filter and ghost.

### Toggle
`rounded-3xl` (22px). 3 variants: default, outline (`border-input`), pill (`bg-muted data-[state=on]:bg-primary`). 3 sizes.

### Select / Dropdown / Combobox
Content: `rounded-3xl` with `shadow-lg`. Items: `rounded-2xl`. Combobox supports multi-select with `rounded-3xl` chips. Dropdown includes destructive variant.

### Tabs
Two variants: default (pill-shaped `rounded-full` list) and line (flat underline). Triggers are `rounded-full`.

### Switch
`rounded-full` pill. Two sizes: default (h-5 w-11) and sm (h-4 w-7). Thumb has `shadow-sm`.

### Progress
Pill-shaped (`rounded-full`). 3 tones: default (primary), warning (status-warning), danger (destructive).

### Skeleton
`rounded-2xl` (18px) with `animate-pulse`.

### Page Shell
Two-section layout: PageShell + PageSection. Sections have 4 variants: default, narrow, wide, full.

### Field
Form field system with FieldSet, FieldGroup, FieldLabel, FieldTitle, FieldDescription, FieldError, FieldSeparator. Consistent gap-3 vertical spacing.

## Animations
CSS custom properties: `--duration-fast` (150ms), `--duration-base` (200ms), `--duration-slow` (300ms). `--ease-out: cubic-bezier(0,0,0.2,1)`, `--ease-in-out: cubic-bezier(0.4,0,0.2,1)`. `tw-animate-css` provides enter/exit keyframes with fade, zoom, and slide variants.

## Do's and Don'ts
- Do use primary gold for the single most important action per view
- Do maintain pill-shaped (rounded-4xl) consistency on cards, buttons, dialogs — this is the system's strongest visual signature
- Don't mix rounded-4xl with small radii in the same surface layer
- Do stack fields vertically with gap-3 for form consistency
- Do use destructive variant (never raw red) for delete/danger actions
- Don't add custom shadows — use the predefined shadow-md/lg/xl/glass tokens
- Do use `aria-invalid` + `data-[state]` selectors — never override interactive states with !important
- Don't disable pinch-zoom (`maximumScale: 1`) on content-heavy pages
- Do respect safe-area utilities (`pb-safe`, `pt-safe`) on iOS-bottom-positioned elements
- Don't bypass the theme provider; use `next-themes` with `class` attribute for dark mode
