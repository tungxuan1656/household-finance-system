# Yellow Finance Protected Pages Refactor

## Purpose / Big Picture

Refactor the protected `apps/web` experience so it matches the approved Yellow Finance mobile-first Stitch screens and the new protected-shell design doc. End users will sign in and land on Expense first, navigate through four consistent top-level tabs (`Expense`, `Analysis`, `Household`, `Settings`), use the new shared page wrappers instead of `PageShell`, and experience the approved add-expense and household flows without the old overview-first shell shape.

This work is frontend-only plus current docs and harness updates. The user-visible outcome is a protected app that behaves like one coherent mobile finance application on narrow screens and keeps the same mental model on desktop with a left navigation rail.

## Scope

- In scope:
  - Protected shell/navigation contract and protected default entry:
    - `apps/web/src/app/(protected)/layout.tsx`
    - `apps/web/src/app/(protected)/home/page.tsx`
    - `apps/web/src/components/layouts/main-layout.tsx`
    - `apps/web/src/components/layouts/app-sidebar.tsx`
    - `apps/web/src/components/layouts/bottom-tab.tsx`
    - `apps/web/src/components/layouts/mobile-header.tsx`
    - `apps/web/src/components/layouts/protected-route.tsx`
    - `apps/web/src/components/layouts/public-route.tsx`
    - `apps/web/src/lib/constants/auth.ts`
    - `apps/web/src/lib/constants/paths.ts`
    - `apps/web/src/lib/constants/navigation.ts`
    - `apps/web/src/app/manifest.ts`
    - auth redirect touchpoints such as `apps/web/src/features/auth/pages/sign-in-page.tsx`
  - New shared protected page wrappers under:
    - `apps/web/src/components/shared/page/`
  - Remove protected-page dependence on:
    - `apps/web/src/components/ui/page-shell.tsx`
  - Top-level protected route surfaces and their feature pages/components:
    - `apps/web/src/features/expenses/**`
    - `apps/web/src/features/insights/**`
    - `apps/web/src/features/households/**`
    - `apps/web/src/features/settings/**`
    - contextual household/group/budget/onboarding routes when the new shell/page rules affect them
  - Add-expense shared flow:
    - `apps/web/src/features/expenses/components/add-expense/**`
  - Current canonical docs and harness:
    - `docs/FRONTEND.md`
    - `docs/references/frontend/protected-page-surface-pattern.md`
    - `docs/references/frontend/responsive-navigation-shell-pattern.md`
    - `docs/references/frontend/frontend-component-architecture-guide.md`
    - `docs/design-docs/mobile-first-protected-shell-and-tab-surfaces.md`
    - `docs/exec-plans/index.md`
    - `harness/feature_index.json`
    - `harness/features/feat-073.json`
    - `harness/progress.md`
- Out of scope:
  - public auth page redesign
  - worker/backend/API contract changes
  - new analytics endpoints or new budget/group domain logic
  - a brand-new design system or replacement of current `components/ui/*` primitives
  - component/page render tests in `apps/web`

## Non-negotiable Requirements

- Implementation must follow the approved Stitch-backed design direction in `docs/design-docs/mobile-first-protected-shell-and-tab-surfaces.md`.
- New protected page work must use shared page wrappers under `apps/web/src/components/shared/page/`.
- No new `PageShell` or `PageSection` usage may be added.
- Route files under `apps/web/src/app/**` must stay thin and defer UI orchestration to `features/<domain>/pages/**`.
- The protected shell must expose only four top-level tabs: `Expense`, `Analysis`, `Household`, `Settings`.
- Protected default entry must move to Expense. Keep `/home` as a compatibility redirect to `/expenses` during the migration unless later product direction explicitly removes it.
- Reuse existing `components/ui/*` primitives. Do not create replacement button/input/card/dialog primitives.
- Preserve loading, empty, error, retry, and success state coverage on touched route surfaces.
- Use pre-edit GitNexus upstream impact checks for every touched code symbol before editing implementation files.
- Verification must rely on `./init.sh <param>` and final `./init.sh`; no completion claim without fresh evidence.

## Progress

- [x] 2026-05-27 Create and approve the execution path for the protected-shell/page refactor. Owner: Orchestrator.
- [ ] Run `gitnexus_impact` on the first-edit shell/page symbols (`MainLayout`, `AppSidebar`, `BottomTab`, `MobileHeader`, `PageShell`, `ExpensesPage`, `InsightsPage`, `HouseholdsPage`, `HouseholdDetailPage`, `SettingsPage`, add-expense provider symbols). Owner: implementation session.
- [ ] Batch 1 — shell foundation and route contract. Owner: implementation session.
- [x] 2026-05-27 Batch 2 — shared page wrappers and `PageShell` migration helpers. Owner: Orchestrator.
- [x] 2026-05-27 Batch 3 — Expense surface and 3-step add-expense flow (partial first pass). Owner: Orchestrator.
- [ ] Batch 4 — Analysis surface. Owner: implementation session.
- [ ] Batch 5 — Household list, add-household sheet, and household detail. Owner: implementation session.
- [ ] Batch 6 — Settings surface plus contextual budgets/groups entry points. Owner: implementation session.
- [ ] Batch 7 — secondary route cleanup, `PageShell` deletion, docs/harness finalization, and repo-wide verification. Owner: implementation session.

## Surprises & Discoveries

- Current repo conventions still route protected default entry through `/home`, and public/auth redirect constants hardcode that path today.
- Current desktop and mobile navigation do not already match the approved four-tab Yellow Finance structure; both route constants and active-label copy must change together.
- Current docs still describe `PageShell` as canonical, so docs must be updated before execution to keep future page work aligned.
- The approved Stitch screens already define stronger screen composition than the current repo state, so shell/page work must be staged before deeper page polish.
- GitNexus `detect_changes(scope: all)` does not currently report the new shared page-wrapper files while they remain untracked, so per-symbol impact evidence and direct file verification are more useful than blast-radius output during this early batch.
- The Expense first pass can improve structural composition and timeline readability without yet rebuilding the full Stitch-style 3-step add-expense drawer; the dialog/provider can stay intact until the dedicated drawer rebuild batch.

## Decision Log

- Decision: Keep `/home` as a compatibility redirect to `/expenses` during the first implementation pass.
  Rationale: It preserves existing external/internal links while still making Expense the protected entry surface.
  Date/Author: 2026-05-27 / Orchestrator
- Decision: Put the new page wrappers in `apps/web/src/components/shared/page/`.
  Rationale: They are cross-feature structural components with no domain knowledge, so they belong in shared components rather than `components/ui` or one feature folder.
  Date/Author: 2026-05-27 / Orchestrator
- Decision: Treat budgets and groups as contextual management routes, not top-level tabs.
  Rationale: The approved Yellow Finance navigation model only supports four top-level surfaces and moves budget/group management under Settings and drill-down flows.
  Date/Author: 2026-05-27 / Orchestrator

## Outcomes & Retrospective

- Pending execution. Expected end state:
  - protected default entry lands on Expense
  - shell navigation is unified across mobile and desktop
  - protected route surfaces use shared page wrappers
  - old `PageShell` is deleted after the last dependent page is migrated

## Context and Orientation

- Protected route group entry:
  - `apps/web/src/app/(protected)/layout.tsx`
- Current protected default route:
  - `apps/web/src/app/(protected)/home/page.tsx`
- Current shell/navigation files:
  - `apps/web/src/components/layouts/main-layout.tsx`
  - `apps/web/src/components/layouts/app-sidebar.tsx`
  - `apps/web/src/components/layouts/bottom-tab.tsx`
  - `apps/web/src/components/layouts/mobile-header.tsx`
- Current page-shell implementation to retire:
  - `apps/web/src/components/ui/page-shell.tsx`
- Current top-level feature pages:
  - `apps/web/src/features/expenses/pages/expenses-page.tsx`
  - `apps/web/src/features/insights/pages/insights-page.tsx`
  - `apps/web/src/features/households/pages/households-page.tsx`
  - `apps/web/src/features/households/pages/household-detail-page.tsx`
  - `apps/web/src/features/settings/pages/settings-page.tsx`
  - contextual routes: `apps/web/src/features/budgets/pages/budgets-page.tsx`, `apps/web/src/features/groups/pages/groups-page.tsx`, `apps/web/src/features/groups/pages/group-detail-page.tsx`, `apps/web/src/features/onboarding/pages/onboarding-page.tsx`
- Current add-expense shared flow host:
  - `apps/web/src/features/expenses/components/add-expense/**`
- Route/nav constants:
  - `apps/web/src/lib/constants/paths.ts`
  - `apps/web/src/lib/constants/navigation.ts`
  - `apps/web/src/lib/constants/auth.ts`
- Layer impact from `ARCHITECTURE.md`:
  - `UI` only
  - no `Types`, `Config`, `Repo`, `Service`, or backend runtime contract changes planned

## Required Standards / Reference Docs

- `docs/FRONTEND.md`
  - protected pages use shared page wrappers
  - route files stay thin
  - no new `PageShell` usage
- `docs/references/frontend/protected-page-surface-pattern.md`
  - `PageContainer` / `PageHeader` / `PageContent` / `PageFooter` ownership
  - route-level blocking states stay inside one page container
- `docs/references/frontend/responsive-navigation-shell-pattern.md`
  - one shell, two nav surfaces
  - four top-level tabs
  - shell-level safe-area and bottom-tab spacing
- `docs/references/frontend/project-folder-structure.md`
  - wrappers in `components/shared`
  - shell pieces in `components/layouts`
  - route pages stay in `features/<domain>/pages`
- `docs/references/frontend/component-structure-pattern.md`
  - feature page orchestration remains thin
  - split smart/presentational concerns where pages grow
- `docs/references/frontend/frontend-component-architecture-guide.md`
  - shared wrappers stay domain-free
  - async-state ownership remains explicit
- `docs/references/frontend/naming-and-conventions-pattern.md`
  - named exports, kebab-case files, `@/` imports
- `docs/references/frontend/form-pattern.md`
  - add-household and expense entry flows keep `react-hook-form` + `zod` structure where forms are touched
- `docs/references/frontend/dialog-and-form-pattern.md`
  - add-expense drawer and add-household sheet maintain accessible form/dialog ownership
- `docs/references/frontend/api-react-query-pattern.md`
  - keep hook-based data access, no direct `api/*` imports in page components
- `docs/references/frontend/zustand-store-pattern.md`
  - global shell/dialog state only when truly cross-surface
- `docs/references/frontend/i18n-label-pattern.md`
  - all new labels/copy go through locale keys
- Companion skills for execution:
  - `executing-plans`
  - `typescript-reviewer`
  - `ui-ux-review`
  - `verification-before-completion`

## Plan of Work (Narrative)

1. **Preflight and impact analysis.**
   - Refresh GitNexus with `./init.sh sync` if needed.
   - Run upstream impact checks before touching the first implementation symbols:
     - `MainLayout`
     - `AppSidebar`
     - `BottomTab`
     - `MobileHeader`
     - `PageShell`
     - `ExpensesPage`
     - `InsightsPage`
     - `HouseholdsPage`
     - `HouseholdDetailPage`
     - `SettingsPage`
     - first add-expense provider/dialog symbols
   - Record blast radius before starting shell edits.

2. **Batch 1 — shell foundation and route contract.**
   - Update `apps/web/src/lib/constants/paths.ts` so the protected default entry points at Expense semantics and `/home` becomes compatibility-only.
   - Update `apps/web/src/lib/constants/auth.ts`, `apps/web/src/components/layouts/public-route.tsx`, `apps/web/src/features/auth/pages/sign-in-page.tsx`, and any other redirect touchpoints so authenticated entry goes to Expense or onboarding as appropriate.
   - Update `apps/web/src/lib/constants/navigation.ts` to the four-tab model and align desktop + mobile route sources.
   - Refactor `apps/web/src/components/layouts/main-layout.tsx`, `app-sidebar.tsx`, `bottom-tab.tsx`, and `mobile-header.tsx` so the shell reflects the approved Yellow Finance structure, safe-area spacing, and shell-level primary action behavior.
   - Convert `apps/web/src/app/(protected)/home/page.tsx` into a redirect/compat route rather than a living top-level dashboard page.

3. **Batch 2 — shared page wrappers and route-surface migration helpers.**
   - Create:
     - `apps/web/src/components/shared/page/page-container.tsx`
     - `apps/web/src/components/shared/page/page-header.tsx`
     - `apps/web/src/components/shared/page/page-content.tsx`
     - `apps/web/src/components/shared/page/page-footer.tsx`
     - `apps/web/src/components/shared/page/index.ts`
   - Migrate shared docs/comments/tests that still point new work toward `PageShell`.
   - Keep `apps/web/src/components/ui/page-shell.tsx` temporarily only as a migration dependency until the last route is converted.

4. **Batch 3 — Expense surface and add-expense flow.**
   - Refactor `apps/web/src/features/expenses/pages/expenses-page.tsx` and its feature-local components to match the approved Expense tab composition:
     - summary card
     - filter chip row
     - timeline feed
     - floating add action
   - Rebuild the add-expense flow under `apps/web/src/features/expenses/components/add-expense/**` into the approved 3-step bottom drawer with shared page/form rules preserved.
   - Verify expense detail/edit/trash pages still fit the new shell/page-wrapper contract even if they remain secondary routes.

5. **Batch 4 — Analysis surface.**
   - Refactor `apps/web/src/features/insights/pages/insights-page.tsx` and supporting components to the approved Analysis hierarchy:
     - segmented time filters
     - allocation chart card
     - compare card
     - ranked categories / breakdown sections
   - Preserve current hook-based analytics access and page-level async state coverage.

6. **Batch 5 — Household list, add, and detail surfaces.**
   - Refactor `apps/web/src/features/households/pages/households-page.tsx`, `households-list-section.tsx`, and `household-detail-page.tsx` to the approved household card and detail compositions.
   - Rebuild add-household as the approved simple bottom sheet with member preview and one primary CTA.
   - Preserve current role-aware invite/delete behavior while moving layout to the new page wrappers.

7. **Batch 6 — Settings and contextual management routes.**
   - Refactor `apps/web/src/features/settings/pages/settings-page.tsx` to the approved profile-hero + management-sections layout.
   - Reframe groups and budgets as contextual management surfaces from Settings while keeping deeper routes available:
     - `apps/web/src/features/groups/pages/groups-page.tsx`
     - `apps/web/src/features/groups/pages/group-detail-page.tsx`
     - `apps/web/src/features/budgets/pages/budgets-page.tsx`
   - Ensure the top-level nav no longer exposes these as primary tabs.

8. **Batch 7 — cleanup and contract removal.**
   - Remove remaining new-work references to `PageShell`.
   - Delete `apps/web/src/components/ui/page-shell.tsx` only after all protected routes stop depending on it.
   - Finalize current docs and harness evidence.

## Concrete Steps (Commands)

Run from repo root `/Users/tungdoan/Projects/Web/household-finance-system` unless stated otherwise.

```bash
./init.sh sync
./init.sh lint
./init.sh typecheck
./init.sh test
./init.sh
```

Expected short outputs:

```text
OK
OK
OK
Done!
```

Focused commands allowed during execution:

```bash
./init.sh lint
./init.sh typecheck
pnpm --filter web exec vitest run <focused-non-render-test-file>
```

Expected focused output:

```text
OK
```

If a dev server/browser verification step is needed during execution:

```bash
./init.sh install
```

Then run the repo’s normal web dev path in a separate execution session and verify the protected flows visually with the available browser skill before the final handoff.

## Validation and Acceptance

- Authenticated entry:
  - after sign-in, users land on Expense-first protected flow instead of Overview-first
  - `/home` still redirects safely to `/expenses`
- Shell:
  - mobile shows `Expense`, `Analysis`, `Household`, `Settings` as bottom tabs
  - desktop shows the same four top-level destinations in the left rail
  - bottom-tab does not cover page content or page footer actions
- Shared page wrappers:
  - all newly refactored protected pages use `PageContainer`, `PageHeader`, `PageContent`, and optional `PageFooter`
  - no newly touched route adds `PageShell`
- Expense:
  - approved summary + filter + timeline structure visible
  - add-expense opens the 3-step drawer flow with back/next/finish actions
- Analysis:
  - approved segmentation and comparison hierarchy visible
- Household:
  - household list, add sheet, and detail page match the approved surface structure
- Settings:
  - profile hero and management sections visible
  - budgets/groups are reachable contextually but no longer top-level tabs
- Regression:
  - onboarding still works
  - household detail invite/delete flows still work
  - expense detail/edit/trash remain reachable and consistent inside the new shell
- Acceptance artifact:
  - full `./init.sh` passes
  - GitNexus final change detection is captured
  - manual/browser evidence exists for Expense, Analysis, Household, Settings, add-expense flow, and add-household sheet

## Idempotence & Recovery

- This is a source-only frontend/docs refactor. Re-running file edits is safe.
- Keep `/home` as a redirect until the new Expense-first entry is stable; this is the primary rollback cushion for route changes.
- Recovery path:
  - revert the touched UI/docs files in Git if a batch regresses
  - restore `PageShell` consumers before deleting `apps/web/src/components/ui/page-shell.tsx`
- No database migration, remote state mutation, or backend rollout is part of this plan.

## Artifacts and Notes

- Design source of truth:
  - `docs/design-docs/mobile-first-protected-shell-and-tab-surfaces.md`
- Approved Stitch project:
  - `18281018757123318855`
- Current local Stitch artifact cache from the design-doc session:
  - `/tmp/yellow-finance-stitch`
- This plan depends on the doc updates that moved canonical frontend guidance away from `PageShell` for new work.

## Interfaces & Dependencies

- Shared shell/navigation modules:
  - `apps/web/src/components/layouts/*`
  - `apps/web/src/lib/constants/paths.ts`
  - `apps/web/src/lib/constants/navigation.ts`
- Shared page-surface modules to create:
  - `apps/web/src/components/shared/page/*`
- Existing UI primitives to reuse:
  - `apps/web/src/components/ui/button.tsx`
  - `apps/web/src/components/ui/card.tsx`
  - `apps/web/src/components/ui/drawer.tsx`
  - `apps/web/src/components/ui/dialog.tsx`
  - `apps/web/src/components/ui/field.tsx`
  - `apps/web/src/components/ui/progress.tsx`
  - `apps/web/src/components/ui/tabs.tsx`
  - `apps/web/src/components/ui/avatar.tsx`
- Existing data/state dependencies that should remain stable:
  - React Query hooks under `apps/web/src/features/**/api/*` and `hooks/*`
  - Zustand stores under `apps/web/src/stores/*.store.ts`
  - shared auth/session helpers under `apps/web/src/lib/auth/*`
