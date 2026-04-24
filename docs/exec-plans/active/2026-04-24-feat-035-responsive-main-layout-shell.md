# feat-035: Responsive main layout shell for web frontend

## Purpose / Big Picture

Build a production-ready responsive application shell for authenticated web routes with a desktop sidebar and mobile bottom tab bar. Users should get stable navigation behavior across route transitions, consistent active-state highlighting, and a mobile layout where fixed navigation does not cover actionable content. This feature creates the long-lived main layout foundation so upcoming household, expense, budget, and analytics features can focus on page behavior rather than shell rewrites.

## Scope

- In scope:
  - `apps/web/src/router.tsx` (normalize protected app route topology to `/` base, add `/more`)
  - `apps/web/src/components/layouts/main-layout.tsx` (compose responsive shell and `Outlet`)
  - `apps/web/src/components/layouts/app-sidebar.tsx` (new desktop sidebar navigation component)
  - `apps/web/src/components/layouts/bottom-tab.tsx` (new mobile bottom tab component rendered by portal)
  - `apps/web/src/components/layouts/app-back.tsx` (new shared back-navigation helper for non-tab app routes)
  - `apps/web/src/hooks/shared/use-mobile.ts` (new mobile breakpoint hook for `< 768px`)
  - `apps/web/src/lib/constants/paths.ts` (new canonical app route constants)
  - `apps/web/src/lib/constants/navigation.ts` (new shared navigation model for sidebar + tabs)
  - `apps/web/src/lib/constants/auth.ts` (remove `/app` assumptions from redirects)
  - `apps/web/src/index.css` (safe-area spacing utilities for fixed mobile tabs)
  - `apps/web/src/lib/i18n/locales/vi.json` (navigation/tab/more labels and aria copy)
  - `apps/web/src/app.test.tsx` and/or focused layout-routing tests (route + responsive shell behavior coverage)
  - `harness/features/feat-035.json`, `harness/feature_index.json`, `harness/progress.md`
- Out of scope:
  - Household switcher and active-household context (`feat-011`)
  - Expense/budget/analytics business screens (`feat-016+`)
  - Backend contract or data model changes
  - New design system primitives under `apps/web/src/components/ui/*`

## Non-negotiable Requirements

- Plan remains self-contained and executable from repository context.
- Behavior must be observable:
  - desktop shows sidebar and hides bottom tabs;
  - mobile shows bottom tabs and hides sidebar;
  - active route state is correct for root and nested routes;
  - page content is not occluded by fixed mobile tabs.
- Terms:
  - `app shell`: persistent layout wrapper around protected routes that keeps navigation mounted.
  - `bottom tab`: fixed mobile navigation at viewport bottom for primary destinations.
  - `safe area`: iOS/modern-device inset (`env(safe-area-inset-bottom)`) needed to avoid clipped UI.

## Progress

- [x] 2026-04-24: Drafted execution plan for `feat-035` and registered feature in harness as `in_progress`.
- [ ] Run GitNexus impact analysis for symbols that will be edited (`MainLayout`, `AppRoutes`, auth path constants) and report blast radius before code edits.
- [ ] Introduce canonical app path/navigation constants and refactor router to one protected shell tree rooted at `/`.
- [ ] Split layout responsibilities into desktop sidebar + mobile bottom tabs with shared active-state rule.
- [ ] Add safe-area spacing utility and shell-level content bottom padding guarantees.
- [ ] Add/update layout-routing tests for responsive visibility, active states, and `/more` route behavior.
- [ ] Run verification commands and update harness evidence.
- [ ] Archive completed plan to `docs/exec-plans/completed/` after implementation.

## Surprises & Discoveries

- Current `apps/web` still keeps duplicated protected route trees (`/` and `/app`) and inlined navigation items directly inside `MainLayout`, which increases active-state drift risk for responsive navigation.

## Decision Log

- Decision: Standardize protected app routes to `/` base path (remove `/app/*` topology for main app flows).
  Rationale: One canonical route model is required so sidebar and bottom tabs always resolve the same active destination.
  Date/Author: 2026-04-24 / Codex + user

- Decision: Use mobile `5 primary tabs + More` and model `More` as a dedicated route (`/more`) in phase 1.
  Rationale: Keeps bottom tab footprint readable on small screens and avoids introducing extra overlay-state complexity during shell foundation work.
  Date/Author: 2026-04-24 / Codex + user

## Outcomes & Retrospective

- Pending implementation.

## Context and Orientation

- Protected/public routing entry: `apps/web/src/router.tsx`
- Current authenticated shell: `apps/web/src/components/layouts/main-layout.tsx`
- Auth redirect constants: `apps/web/src/lib/constants/auth.ts`
- Frontend standards:
  - `docs/FRONTEND.md`
  - `docs/design-docs/shadcn-first-ui-web-guide.md`
  - `.agents/skills/shadcn/rules/styling.md`
  - `.agents/skills/shadcn/rules/forms.md`
  - `.agents/skills/shadcn/rules/composition.md`
- Responsive shell reference:
  - `docs/references/frontend/responsive-navigation-shell-pattern.md`

## Plan of Work (Narrative)

1. Lock route model and navigation source of truth:
   - Add canonical route constants (`PATHS`) and navigation descriptors (`APP_MENU_ITEMS`, `BOTTOM_TAB_ITEMS`) under `apps/web/src/lib/constants`.
   - Refactor `router.tsx` to keep one protected route tree under `MainLayout` at `/` and add `/more`.
   - Update auth default redirect constants to align with `/` base.
2. Refactor shell composition:
   - Extract desktop navigation into `app-sidebar.tsx` and mobile navigation into `bottom-tab.tsx`.
   - Keep active-route calculation centralized so both surfaces behave identically (home exact match, non-home prefix match).
   - Render bottom tabs through portal to `document.body` to avoid clipping and stacking issues.
3. Add spacing and safe-area guarantees:
   - Update `index.css` with safe-area utility classes.
   - Ensure shell content container reserves bottom spacing on mobile and uses lighter desktop spacing.
4. Route-level UX and accessibility:
   - Add `/more` page routing using existing placeholder pattern and i18n copy.
   - Ensure nav landmarks and labels are i18n-backed; tab targets remain touch-friendly.
5. Tests and acceptance evidence:
   - Extend route/layout tests to assert protected shell rendering, `/more` navigation, and auth redirect behavior.
   - Validate responsive behavior at representative viewport sizes and route active-state correctness.
6. Harness sync after implementation:
   - Update feature evidence/status in `harness/features/feat-035.json`.
   - Reflect status/evidence in `harness/feature_index.json` and `harness/progress.md`.

## Concrete Steps (Commands)

Run from repo root:

```bash
# baseline verification before changes
./init.sh

# app-level verification while implementing shell
pnpm --filter web lint
pnpm --filter web typecheck
pnpm --filter web test
pnpm --filter web build

# final repository verification
./init.sh
```

Expected short transcripts:

- `pnpm --filter web test` => all web tests pass, no failing suites.
- `pnpm --filter web build` => Vite build succeeds without TypeScript errors.
- `./init.sh` => lint/typecheck/test/build workflow completes successfully.

## Validation and Acceptance

- Routing acceptance:
  - Authenticated user can navigate `/`, `/onboarding`, `/expenses`, `/budgets`, `/insights`, `/settings`, `/more` inside one protected shell.
  - Unauthenticated access still redirects to `/sign-in`.
- Responsive acceptance:
  - `< 768px`: bottom tab visible, sidebar hidden.
  - `>= 768px`: sidebar visible, bottom tab hidden.
- Active-state acceptance:
  - Home is active only on exact `/`.
  - Non-home menu item remains active for nested paths (e.g., `/expenses/*`).
- Spacing/layer acceptance:
  - Mobile content CTA is never hidden under bottom tabs.
  - Dialogs/sheets/toasts appear above tabs as intended.
- i18n acceptance:
  - All new nav labels/aria strings are sourced from locale keys in `vi.json`.

## Idempotence & Recovery

- File edits and verification commands are safe to re-run.
- If route normalization causes regressions, rollback strategy:
  - temporarily reintroduce alias redirects from legacy `/app/*` paths;
  - keep canonical `PATHS` constants unchanged to avoid repeated refactors.
- No DB migrations or destructive operations are part of this feature.

## Artifacts and Notes

- Required completion artifacts:
  - Updated responsive shell components and route constants.
  - Passing `pnpm --filter web lint/typecheck/test/build` and root `./init.sh`.
  - Harness records updated with evidence and `feat-035` status.

## Interfaces & Dependencies

- Internal interfaces:
  - Route constants contract in `paths.ts` consumed by router and navigation components.
  - Navigation item contract in `navigation.ts` consumed by sidebar and bottom tabs.
  - Auth redirect constants in `auth.ts` must remain compatible with `PublicRoute`/`ProtectedRoute`.
- External/runtime dependencies:
  - React Router (`NavLink`, `Outlet`, route tree) for navigation state.
  - `createPortal` for viewport-level mobile tab rendering.
- Companion implementation skills:
  - `frontend-patterns`
  - `design-system`
  - `typescript-reviewer`
  - `verification-loop`

## Risks and Blockers

- Risk: Route normalization from `/app/*` to `/` may break existing deep links if no transition handling is added.
- Risk: Responsive behavior tests can be brittle if viewport assumptions are not explicit.
- Blocker to check before edits: GitNexus CLI command compatibility in local environment for mandatory impact-analysis workflow.

## Open Decisions

- None at plan creation time. Any new compatibility requirement discovered during implementation must be logged in `Decision Log` before coding beyond routing layer.
