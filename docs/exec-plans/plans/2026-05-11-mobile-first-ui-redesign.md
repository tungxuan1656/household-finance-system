# ExecPlan: Mobile-First UI Redesign — Shell + Pages

## Purpose / Big Picture

Refactor toàn bộ web UI theo hướng **mobile-first**, sử dụng design system đã định nghĩa (`design-system.md`, `ui-implementation-rules.md`), với shell/layout hoàn hảo trước, sau đó từng page với visual polish cao.

**User-visible outcome:** Ứng dụng web nhìn đẹp, clean, nhất quán trên mobile. Desktop experience cũng premium. Navigation rõ ràng, typography dễ đọc, spacing consistent, hover states mượt.

---

## Scope

**In-scope:**
- Layout shell: `main-layout.tsx`, `app-sidebar.tsx`, `bottom-tab.tsx`
- Shared components: `PageShell`, `PageSection` (create if not exist)
- All app pages under `apps/web/src/views/app/`
- Auth pages: `sign-in-page.tsx`, `sign-up-page.tsx` (liquid glass style preserved)
- Public pages: `landing-page.tsx`

**Out-of-scope:**
- Backend changes
- Business logic / data flow changes
- New feature functionality
- Code logic refactor (only visual/styling)

---

## Non-negotiable Requirements

1. **Mobile-first** — Base styles for mobile, override with `md:` for desktop
2. **Semantic tokens only** — `bg-primary`, `text-muted-foreground`, never raw values
3. **shadcn components first** — Use installed components, not custom markup
4. **Touch targets ≥ 44px** — Buttons `h-12 min-w-12`, list items `h-14`
5. **No layout shift on hover** — Color/shadow transitions only, no scale transforms
6. **Consistent spacing** — 4px base scale (4, 8, 12, 16, 20, 24, 32, 40, 48, 64)
7. **Typography hierarchy** — `text-xl md:text-2xl`, `font-heading`, `font-semibold`

---

## Context and Orientation

### Key Files

**Layout:**
- `apps/web/src/components/layouts/main-layout.tsx` — Desktop/mobile wrapper
- `apps/web/src/components/layouts/app-sidebar.tsx` — Desktop sidebar (240-280px)
- `apps/web/src/components/layouts/bottom-tab.tsx` — Mobile bottom navigation

**Design tokens:**
- `apps/web/src/index.css` — All CSS variables (colors, radius, spacing, animation)

**Design docs (already complete):**
- `docs/design-docs/design-system.md` — Tokens definition
- `docs/design-docs/ui-implementation-rules.md` — Implementation rules

**Pages to refactor:**
- `apps/web/src/views/app/overview-page.tsx` + sub-components
- `apps/web/src/views/app/expenses-page.tsx` + components
- `apps/web/src/views/app/budgets-page.tsx` + components
- `apps/web/src/views/app/insights-page.tsx` + sub-components
- `apps/web/src/views/app/households-page.tsx` + components
- `apps/web/src/views/app/profile-settings-page.tsx`

---

## Progress

### Phase 1: Shell/Layout Polish
- [ ] Audit and fix `main-layout.tsx` — padding, background, max-width
- [ ] Audit and fix `app-sidebar.tsx` — visual polish, hover states, active indicator
- [ ] Audit and fix `bottom-tab.tsx` — height, touch targets, active state
- [ ] Create `PageShell` + `PageSection` components if needed

### Phase 2: Home Page (Overview)
- [ ] Refactor `overview-page.tsx` — header, spacing, layout
- [ ] Refactor `overview-header.tsx` — typography, badge style
- [ ] Refactor `overview-summary-section.tsx` — cards, stats, buttons
- [ ] Refactor `overview-households-section.tsx` — card grid
- [ ] Refactor `overview-budget-card.tsx`, `overview-next-steps-card.tsx`

### Phase 3: Expenses Page
- [ ] Refactor `expenses-page.tsx` — header, filter layout
- [ ] Refactor expense components — feed list, filters, cards

### Phase 4: Budgets Page
- [ ] Refactor `budgets-page.tsx` — header, layout
- [ ] Refactor budget components — status panel, list, cards

### Phase 5: Insights Page
- [ ] Refactor `insights-page.tsx` — header, panels layout
- [ ] Refactor insights components — overview, comparison, groups panels

### Phase 6: Households Page
- [ ] Refactor `households-page.tsx` — header, grid
- [ ] Refactor household components — summary card, create dialog

### Phase 7: Profile/Settings Page
- [ ] Refactor `profile-settings-page.tsx` — cards, sections, shortcuts

### Phase 8: Auth Pages (preserve liquid glass)
- [ ] Review `sign-in-page.tsx` — ensure liquid glass style intact
- [ ] Review `sign-up-page.tsx` — ensure liquid glass style intact

### Phase 9: Landing Page
- [ ] Review `landing-page.tsx` — public marketing page polish

---

## Decision Log

- **Decision:** Use approach 3 (Quick wins first) — Fix shell/layout before pages
  **Rationale:** Shell is reused everywhere; fixing it first gives immediate visual improvement and establishes foundation
  **Date/Author:** 2026-05-11

- **Decision:** Preserve Auth liquid glass style
  **Rationale:** Auth pages (feat-047) already have premium liquid glass design; don't change
  **Date/Author:** 2026-05-11

---

## Plan of Work (Narrative)

### Phase 1: Shell/Layout Polish

**1.1 Fix `main-layout.tsx`**

Current state: Uses `grid-cols-[240px_minmax(0,1fr)]` with manual responsive. 
Target: Clean mobile-first with proper padding scale, max-width container, no horizontal overflow.

Changes:
- Remove `rounded-none border-x` from main content area (too generic)
- Use `p-4 md:p-6 lg:p-8` for content padding
- Add `max-w-5xl mx-auto` on lg+ for content constraint
- Ensure `pb-24 md:pb-8` for bottom tab spacing

**1.2 Fix `app-sidebar.tsx`**

Current state: Basic sidebar with links. 
Target: Premium desktop navigation with clear active states, subtle shadows, proper spacing.

Changes:
- Add `shadow-sm` to sidebar container
- Improve active state: `bg-primary text-primary-foreground` with subtle left border or indicator
- Add hover transitions: `transition-colors duration-150`
- Refine spacing: `gap-2` for nav items, `p-4` container padding
- Add user avatar section at bottom with proper styling

**1.3 Fix `bottom-tab.tsx`**

Current state: Basic fixed bottom nav.
Target: Polished mobile navigation with clear active states, proper height (64px + safe area).

Changes:
- Ensure `h-16` (64px) height
- Add `min-h-11` touch target for each tab
- Refine active state: `text-primary` (slate color, not generic blue)
- Add subtle icon animation on active (optional)
- Ensure `pb-safe` for iOS safe area

**1.4 Create PageShell + PageSection (if not exist)**

Check if these exist. If not, create:
- `PageShell` — wraps page with proper header spacing, scroll container
- `PageSection` — `default | card | stats | list` variants for content grouping

---

### Phase 2: Home Page (Overview) — Visual Refactor

**2.1 `overview-header.tsx`**

```tsx
// Target: Clean, confident header
<header className='space-y-1'>
  <Badge variant='secondary' className='text-xs'>Home</Badge>
  <h1 className='font-heading text-xl md:text-2xl tracking-tight'>
    Welcome back, {name}
  </h1>
  <p className='text-sm text-muted-foreground'>
    Your financial overview
  </p>
</header>
```

**2.2 `overview-summary-section.tsx`**

Changes:
- Use `text-lg md:text-xl` for section titles (not `text-2xl`)
- Cards: `Card` with `CardHeader` (no `CardTitle` for stats — just label), `CardContent` with big number
- Stats numbers: `text-2xl md:text-3xl font-heading font-semibold`
- Buttons: `h-12 min-w-12` for primary, `h-11` for secondary
- Grid: `grid-cols-1 md:grid-cols-3` for stat cards
- Section actions: horizontal scroll on mobile, wrap on desktop

**2.3 `overview-households-section.tsx`**

Changes:
- Section title: `text-lg font-semibold`
- Grid: `grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4`
- Cards: subtle `hover:shadow-md transition-shadow duration-200`

**2.4 `overview-budget-card.tsx`, `overview-next-steps-card.tsx`**

Changes:
- Card composition: full `CardHeader` + `CardContent` + `CardFooter`
- Subtle hover: `hover:border-primary/20 hover:shadow-md`
- No scale transforms

---

### Phase 3-7: Remaining Pages

Follow same pattern for each page:
1. Header: Badge + Title + Description
2. Actions: Primary button right-aligned, secondary buttons grouped
3. Content: Proper Card composition, grid layouts
4. Spacing: `gap-4 md:gap-6`, `p-4 md:p-6`

---

## Concrete Steps (Commands)

```bash
# 1. Verify baseline
./init.sh

# 2. Start with shell audit - check current state
# Edit main-layout.tsx, app-sidebar.tsx, bottom-tab.tsx

# 3. Then page by page refactor
# Use @designer for UI/UX refinement on complex sections
# Use @fixer for implementation after design decisions

# 4. After each phase
pnpm lint:fix
pnpm --filter @app/web type-check
```

---

## Validation and Acceptance

- [ ] No horizontal scroll on mobile (375px viewport)
- [ ] All touch targets ≥ 44×44px
- [ ] Consistent `gap-4 md:gap-6` spacing
- [ ] Typography hierarchy: `text-sm text-base text-lg text-xl text-2xl`
- [ ] Cards use full composition (CardHeader/CardContent/CardFooter)
- [ ] Hover states: color/shadow transitions only, no layout shift
- [ ] Focus rings visible on all interactive elements
- [ ] `pnpm lint:fix && pnpm --filter @app/web type-check` passes

---

## Idempotence & Recovery

Steps are safe to re-run. No destructive operations. Backup by git commit before Phase 1.

---

## Artifacts and Notes

Design reference:
- `docs/design-docs/design-system.md` — Tokens
- `docs/design-docs/ui-implementation-rules.md` — Rules
- `feat-048.json` — Scope definition

Current layout baseline:
- Mobile: Bottom tab (64px) + content `pb-24`
- Desktop: Sidebar (240-280px) + main content grid