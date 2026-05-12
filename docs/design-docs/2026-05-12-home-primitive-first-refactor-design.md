# Home Primitive-First Refactor Design

Date: 2026-05-12
Status: Proposed
Related features: `feat-045`, `feat-048`, `feat-049`, `feat-050`, `feat-051`
Related plans completed: `docs/exec-plans/plans/2026-05-08-feat-045-home-overview-dashboard-unification.md`, `docs/exec-plans/plans/2026-05-12-design-system-contract-hardening.md`, `docs/exec-plans/plans/2026-05-12-base-primitive-expansion.md`

## 1. Objective

Refactor the protected `/home` experience into a premium minimal, mobile-first dashboard that fully complies with `docs/design-docs/design-system.md` and `docs/design-docs/ui-implementation-rules.md`.

Users should observe a cleaner, more premium home screen with better breathing room, consistent glass surfaces, stronger financial typography, and more coherent controls, without changing the underlying dashboard truthfulness, data sources, or navigation model.

## 2. Problem Statement

The current `/home` route is functionally correct, but it no longer satisfies the strengthened V2.1 design contract.

Observed contract and UX problems:

- home sections still render many hand-rolled surfaces instead of composing shared primitives from `apps/web/src/components/ui`
- `HeroStatsCard` uses raw card styling, proportional number typography, and hardcoded status colors
- `LensSelector` and `GroupFilterBar` still express active/inactive visuals at the call site instead of through primitive APIs
- `CategoryBreakdown` pierces primitive internals with chart color classes instead of a semantic `tone` or `variant` prop
- multiple user-facing strings remain hardcoded rather than following the frontend i18n pattern
- `overview-page.tsx` still contains inline placeholder components and TODO seams, which weakens page/component boundaries

The result is a dashboard that feels flatter and more bespoke than the rest of the V2.1 system, especially on mobile.

## 3. Goals

### Primary goals

1. Bring `/home` back into strict compliance with the primitive-first visual contract.
2. Improve mobile-first visual quality toward a premium minimal dashboard with more breathing room.
3. Ensure all major home surfaces route visual ownership through shared primitives.
4. Fix finance-specific typography and semantic status styling on the hero summary.
5. Replace current ad-hoc selector, chip, and progress styling with reusable primitive APIs.

### Secondary goals

1. Remove inline placeholder UI seams from `overview-page.tsx` where practical.
2. Leave behind reusable primitive extensions that other app screens can adopt later.
3. Align home user-facing copy with the project i18n pattern where touched.

## 4. Non-Goals

This refactor does **not** include:

- changing backend API contracts or analytics calculations
- changing the truthful lens model introduced by `feat-045` and `feat-050`
- introducing new dashboard widgets or new product flows
- redesigning the landing page or other protected routes in the same pass
- broad speculative primitive redesign unrelated to real `/home` migration blockers
- adding hidden active-household behavior or implicit household switching

## 5. Scope

### In scope

Frontend-only work for `/home` and the minimum shared primitive changes required to migrate it cleanly:

1. `apps/web/src/views/app/overview-page.tsx`
2. `apps/web/src/components/home/lens-selector.tsx`
3. `apps/web/src/components/home/group-filter-bar.tsx`
4. `apps/web/src/components/home/hero-stats-card.tsx`
5. `apps/web/src/components/home/recent-expenses.tsx`
6. `apps/web/src/components/home/category-breakdown.tsx`
7. `apps/web/src/components/home/household-cards-section.tsx`
8. `apps/web/src/components/home/empty-state.tsx`
9. relevant shared primitives under `apps/web/src/components/ui/*`
10. touched i18n labels under the existing frontend locale structure
11. tests directly affected by those UI and primitive changes

### Out of scope

- worker routes, repositories, services, or database migrations
- unrelated page-shell redesign beyond bounded layout adjustments needed by `/home`
- new cross-app dashboard primitive kits that abstract domain widgets too aggressively
- non-home copy migration sweep outside components touched by this refactor

## 6. Recommended Approach

Use **Structured Primitive Expansion**, then refactor `/home` to consume those primitives with layout-only call-site styling.

### Why not a conservative swap-only patch

Simple primitive swaps would remove some obvious violations, but they would likely leave `/home` dependent on visual override classes for its lens selector, filter chips, hero treatment, and category progress colors.

### Why not a full domain-specific dashboard kit

A large set of dashboard-specific primitives would overfit the current home composition and risk violating the existing rule that reusable visual primitives should stay generic and additive.

### Why Structured Primitive Expansion is preferred

This direction keeps the migration focused on real blockers found in `/home`:

1. extend shared primitives only where the current APIs cannot express a repeated need
2. route all home visual intent through `variant`, `size`, `surface`, or `tone`
3. keep page and feature files responsible for layout, data flow, and visibility only
4. improve mobile polish without changing product behavior

## 7. Design Rules for This Refactor

### 7.1 Primitive ownership rule

All card surfaces, chip styles, segmented selector states, progress fill colors, and semantic status styles must be owned by shared primitives in `apps/web/src/components/ui`.

### 7.2 Allowed call-site styling

Home call sites may use `className` only for layout concerns such as:

- flex/grid structure
- width and min/max width constraints
- responsive gaps
- overflow and snap behavior for horizontal lists
- placement, order, visibility, and alignment

### 7.3 Disallowed outcome

The refactor is incomplete if touched home consumers still rely on ad-hoc visual classes for common surface or control styling, including:

- `bg-*`
- `border-*`
- `rounded-*`
- `shadow-*`
- `backdrop-blur-*`
- active-state color classes on selector items
- primitive-internal selector hacks such as `[&>div]:bg-*`

### 7.4 Finance typography rule

Primary monetary values on `/home` must use `font-mono tabular-nums` and retain strong numeric hierarchy across mobile and desktop breakpoints.

## 8. Section-by-Section Design

### 8.1 Page root and spacing rhythm

`apps/web/src/views/app/overview-page.tsx` should move from the current tight `space-y-4` stacking toward a more breathable mobile-first rhythm using `gap-6` on mobile and `gap-8` on larger screens.

This remains layout-only styling and is therefore valid at the page level.

### 8.2 Lens selector

`apps/web/src/components/home/lens-selector.tsx` should stop styling active/inactive pills manually.

Recommended outcome:

- extend `ToggleGroup` / `ToggleGroupItem` with a segmented or pill variant that fully owns the selector visuals
- use the same primitive family for both mobile and desktop states where possible
- remove all direct active-state background, foreground, and radius classes from the call site

### 8.3 Hero summary

`apps/web/src/components/home/hero-stats-card.tsx` should be rebuilt around `Card`, `CardHeader`, and `CardContent`.

Recommended outcome:

- use a shared glass card surface, optionally with a small additive featured surface preset if the highlight treatment cannot be expressed cleanly today
- convert amount typography to `font-mono tabular-nums`
- replace hardcoded trend colors with semantic status tokens
- preserve current dashboard truthfulness and comparison meaning

### 8.4 Budget mini-cards

The inline budget placeholders currently inside `apps/web/src/views/app/overview-page.tsx` should become standard compact cards in a layout-owned horizontal scroll container.

Recommended outcome:

- reuse `Card size="sm"` if the existing compact density is sufficient
- keep scroll, snap, and width constraints at the call site as layout concerns
- move all surface, padding, radius, and border decisions into the primitive

### 8.5 Recent expenses

`apps/web/src/components/home/recent-expenses.tsx` should use shared card framing and primitive-based badges/tags.

Recommended outcome:

- section shell becomes `Card`
- group labels become `Badge` variants rather than raw spans
- category/avatar visuals should route through an existing or tiny new generic UI primitive if needed
- avoid hand-rolled surface styling in the list container and row affordances

### 8.6 Category breakdown

`apps/web/src/components/home/category-breakdown.tsx` should stop piercing `Progress` internals with selector hacks.

Recommended outcome:

- `Progress` gains a small additive `tone` prop for chart semantics
- category rows render inside a shared `Card`
- chart colors remain token-driven and reusable elsewhere

### 8.7 Household cards section

`apps/web/src/components/home/household-cards-section.tsx` should migrate to standard card composition and remove direct surface classes.

### 8.8 Group filter bar

`apps/web/src/components/home/group-filter-bar.tsx` should express dismissible filters through a reusable primitive-level solution.

Recommended outcome:

- add `Badge variant="filter"` or a tiny generic `FilterChip` primitive
- use a shared small button treatment for the filter trigger
- remove all bespoke chip radius, border, and background styling from the feature file

### 8.9 Empty state

`apps/web/src/components/home/empty-state.tsx` should migrate to `Card` and standard content spacing rather than a hand-rolled container.

### 8.10 Inline placeholders and seams

`apps/web/src/views/app/overview-page.tsx` should stop carrying production UI placeholders inline when extraction improves readability and contract clarity.

This refactor should remove or reduce current inline placeholder seams without expanding scope into unrelated feature work.

## 9. Primitive Follow-Up Guardrails

Allowed primitive changes in this refactor must remain:

- additive
- small
- compatibility-safe
- justified by a concrete `/home` migration blocker

Allowed examples:

- one segmented selector variant on `ToggleGroup`
- one dismissible filter-chip-style `Badge` or generic chip primitive
- one chart `tone` prop on `Progress`
- one featured card surface preset if the hero needs it after review

Not allowed:

- reopening primitive architecture broadly
- adding speculative dashboard-only primitive APIs
- introducing page-specific primitives into `components/ui`

## 10. Acceptance Criteria

This design is successful when all of the following are true:

1. Touched `/home` consumers no longer own card/chip/progress/selector visuals with ad-hoc classes.
2. The home dashboard feels more premium and breathable on mobile while preserving current product behavior and data truthfulness.
3. Hero amounts use financial typography rules from the design system.
4. Touched status and chart visuals use semantic primitive APIs or tokens rather than hardcoded Tailwind colors and selector hacks.
5. Touched user-facing copy follows the frontend i18n pattern instead of remaining hardcoded.
6. Full required verification passes before completion.

## 11. Risks and Mitigations

### Risk 1 — Primitive follow-ups grow too large

If multiple components each request custom APIs, the refactor can drift into another primitive redesign.

**Mitigation:** only allow additive changes tied directly to a real `/home` migration blocker.

### Risk 2 — Behavior regressions while restyling a live dashboard

The home route composes several data hooks and state combinations.

**Mitigation:** keep the refactor frontend-only, preserve current data flow, and verify empty, populated, and single-lens states.

### Risk 3 — Incomplete i18n migration

Partial copy updates can leave mixed hardcoded and localized labels.

**Mitigation:** any touched home copy must be routed through the existing i18n label pattern in the same pass.

### Risk 4 — Over-extraction from `overview-page.tsx`

Trying to perfect all composition boundaries at once can widen the scope.

**Mitigation:** only extract seams that materially improve readability, primitive compliance, or testability.

## 12. Expected Deliverables

1. One ExecPlan for the home rollout.
2. Shared primitive follow-ups required by the real `/home` migration.
3. Refactored `/home` feature components with layout-only call-site styling.
4. Updated localized labels for touched home copy.
5. Verification evidence and harness updates aligned with the implemented scope.

## 13. Recommendation

Proceed with a frontend-only execution plan for:

**Protected home primitive-first refactor with bounded shared primitive follow-ups**
