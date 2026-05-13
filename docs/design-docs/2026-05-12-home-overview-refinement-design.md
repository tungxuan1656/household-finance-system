# Home Overview Refinement Design

Date: 2026-05-12
Status: Proposed
Related features: `feat-045`, `feat-048`, `feat-049`, `feat-050`, `feat-051`
Related plans completed: `docs/exec-plans/plans/2026-05-12-home-primitive-first-refactor.md`, `docs/exec-plans/plans/2026-05-08-feat-045-home-overview-dashboard-unification.md`

## 1. Objective

Refine the protected `/home` screen so the lens selector, category presentation, household section, and budget section feel materially more polished in live use while preserving the truthfulness and mobile-first direction established in the previous home refactor.

Users should observe a cleaner segmented lens control, correct category names/icons/colors sourced from the existing catalog, more intentional household and budget cards, and correct household lens availability immediately after entering `/home`.

## 2. Problem Statement

The prior primitive-first hardening pass restored contract compliance, but the user is still dissatisfied with several visible product details.

Validated issues from screenshot plus live runtime inspection:

- the lens selector pill geometry and radius still feel visually off
- home category display still exposes raw keys such as `family` and `transport` instead of the existing catalog metadata
- recent-expense category visuals still use generic icon treatment instead of category-specific icon/color
- household summary cards look structurally plain and underdesigned
- budget mini-cards still read like placeholders rather than polished dashboard cards
- entering `/home` does not proactively load household lens data from the household store, so household lenses can be missing until the user visits another page first

The category problem is not a data-availability issue. The frontend already has:

- `ReferenceCategoryDTO` with `key`, `iconUrl`, and `color`
- `useReferenceCategoriesQuery()` for fetching the catalog
- `getCategoryLabel(...)` for category naming

This means the current home rendering is underusing an existing reusable data source.

## 3. Goals

### Primary goals

1. Make the lens selector feel like a polished segmented control with correct geometry and spacing.
2. Standardize category presentation through a reusable helper or small shared component that resolves label, icon, and color from the reference catalog.
3. Apply that reusable category presentation in the home screen at least for recent expenses and category breakdown.
4. Improve household and budget card presentation within `/home` using reusable, bounded presentation patterns.
5. Fix the household-lens loading bug so `/home` shows available household lenses on first entry.

### Secondary goals

1. Keep the refinement frontend-only.
2. Avoid introducing large new dashboard-specific primitive systems.
3. Preserve the user’s testing constraint: no component render tests.

## 4. Non-Goals

This refinement does **not** include:

- backend API changes for categories, budgets, or households
- redesign of unrelated routes outside `/home`
- a broad global category UI migration across the whole app in the same pass
- speculative extraction of a full dashboard design framework
- component render test coverage for home sections

## 5. Scope

### In scope

1. `apps/web/src/views/app/overview-page.tsx`
2. `apps/web/src/components/home/lens-selector.tsx`
3. `apps/web/src/components/home/recent-expenses.tsx`
4. `apps/web/src/components/home/category-breakdown.tsx`
5. `apps/web/src/components/home/household-cards-section.tsx`
6. budget presentation code used by `/home`, including current inline placeholder/presentation components in `overview-page.tsx`
7. `apps/web/src/stores/household.store.ts` consumers on `/home` as needed for correct fetch timing
8. `apps/web/src/hooks/api/use-reference-data.ts` consumers on `/home`
9. one reusable category presentation helper and/or tiny shared UI component in an appropriate shared frontend location
10. touched locale labels if any new user-facing copy is needed
11. focused non-render tests for new reusable logic or shared primitive behavior if required

### Out of scope

- worker files under `apps/worker/*`
- household domain behavior beyond loading the existing list on `/home`
- replacing category presentation everywhere in the app during this pass
- new broad feature work for budgets or households beyond visual and data-loading refinement

## 6. Recommended Approach

Use **bounded reusable refinement**.

### Why not a `/home`-only patch

The user explicitly chose reusable category handling. A home-local mapping would fix the symptom while leaving the app with duplicated category logic.

### Why not a strong dashboard re-architecture

The current issues are specific and fixable with small shared abstractions. A larger dashboard kit would increase churn and review cost without clear product benefit.

### Why bounded reusable refinement is preferred

This direction solves the real issues while staying disciplined:

1. reusable category resolution is added once and reused in the touched home sections
2. lens, budget, and household visuals improve through bounded UI composition changes
3. the home lens bug is fixed at the page’s store-loading boundary
4. the work stays frontend-only and aligned with the design-system rules

## 7. Design Rules for This Refinement

### 7.1 Reusable category rule

Any touched home category display must derive its label, icon, and color from the existing reference category catalog, not from raw keys or home-local hardcoded mappings.

### 7.2 Bounded shared abstraction rule

New shared category presentation code must be generic enough for reuse, but small enough to avoid turning this refinement into a broad UI framework effort.

### 7.3 Home fetch truthfulness rule

`/home` must fetch households only to populate existing lens data truthfully. It must not invent hidden selection state or change lens semantics.

### 7.4 Testing rule

The user explicitly disallowed component render tests. Verification must therefore rely on focused logic/primitive tests plus browser validation and full workspace verification.

## 8. Section-by-Section Design

### 8.1 Lens selector geometry

Keep the `ToggleGroup`-based approach, but refine the segmented control presentation so the track and selected pill feel consistent with the design system.

Expected outcome:

- tighter visual geometry between container and active item
- improved horizontal padding and truncation for longer household names
- better selected/inactive contrast without over-accenting the control

### 8.2 Category presentation reusable layer

Add a small shared helper and/or reusable presentational component that accepts a category key and resolved category catalog data, then exposes:

- localized category label
- category icon URL
- category accent color
- safe fallback behavior when metadata is unavailable

This reusable layer should then be used by:

- `recent-expenses.tsx`
- `category-breakdown.tsx`
- budget presentation in `/home` where category metadata meaningfully improves the UI

### 8.3 Recent expenses

Replace the current generic category visual treatment with catalog-based category presentation.

Expected outcome:

- category icon displays the real icon asset
- category name displays the proper label instead of the raw key
- category accent color is used subtly and consistently

### 8.4 Category breakdown

Replace raw category keys and generic chart-tone-only presentation with category-aware rows.

Expected outcome:

- row labels are localized labels
- color identity comes from category metadata when available
- progress/fill treatment remains visually coherent with the shared design system

### 8.5 Household section

Keep the section within shared card primitives, but improve visual hierarchy and summary quality.

Expected outcome:

- clearer title/meta/summary grouping
- stronger emphasis on key numeric values
- better spacing and more intentional card composition

### 8.6 Budget mini-cards

Refine the compact budget cards so they no longer feel like temporary placeholders.

Expected outcome:

- stronger information hierarchy for limit values
- better density and spacing
- more deliberate supporting copy treatment
- optional use of category-aware accents where appropriate without overstylizing the cards

### 8.7 Household lens loading on first entry

`overview-page.tsx` should proactively trigger household-store loading when the store is empty and not already loading.

Expected outcome:

- after login, `/home` can show household lenses without requiring a visit to `/households`
- the fetch path remains idempotent and store-driven

## 9. Acceptance Criteria

This design is successful when all of the following are true:

1. The lens selector looks visibly cleaner and more balanced than the current state in mobile screenshots/runtime.
2. Recent expenses and category breakdown no longer display raw category keys when catalog data is available.
3. Category name, icon, and color all come from reusable category presentation logic rather than home-local ad-hoc mapping.
4. The household section and budget mini-cards look more deliberate and less placeholder-like.
5. Entering `/home` on a fresh authenticated session shows household lenses after the normal home data load path, without requiring the user to visit `/households` first.
6. Verification passes without adding component render tests.

## 10. Risks and Mitigations

### Risk 1 — Category abstraction grows too large

If the reusable layer tries to solve every category presentation case in the app, scope will drift.

**Mitigation:** keep the shared layer narrowly focused on metadata resolution and small reusable presentation pieces.

### Risk 2 — Household fetch introduces duplicate or repeated requests

Adding home-driven fetch logic can create noisy request loops if loading guards are weak.

**Mitigation:** gate the fetch on current store state and loading flags.

### Risk 3 — Budget and household cards become overdesigned

Trying too hard to make the cards “special” could violate the current primitive-first rules.

**Mitigation:** keep improvements within shared `Card` composition and layout/presentation hierarchy, not page-level bespoke surface styling.

## 11. Expected Deliverables

1. One refinement ExecPlan.
2. A reusable category presentation helper and/or tiny shared component.
3. Updated home sections using category metadata correctly.
4. Improved lens, household, and budget presentation on `/home`.
5. A fix for household lens loading on initial `/home` entry.

## 12. Recommendation

Proceed with a frontend-only refinement pass for:

**Reusable category presentation + home overview visual and lens-loading corrections**
