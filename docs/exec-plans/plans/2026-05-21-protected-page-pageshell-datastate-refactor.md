# Protected page PageShell/DataState refactor

## Purpose / Big Picture

Refactor eight protected web route surfaces so they follow the canonical `PageShell` and `DataState` rules in `docs/FRONTEND.md`. End users will see consistent page titles, shell padding, and loading/error/empty treatment across Settings, Expense Trash, Group Detail, Budgets, Groups, Insights, Onboarding, and Home empty-state flows without changing the underlying product behavior, queries, mutations, or store semantics.

## Scope

- Change protected frontend route orchestrators under `apps/web/src/features/**/pages/`:
  - `apps/web/src/features/settings/pages/settings-page.tsx`
  - `apps/web/src/features/expenses/pages/expense-trash-page.tsx`
  - `apps/web/src/features/groups/pages/group-detail-page.tsx`
  - `apps/web/src/features/budgets/pages/budgets-page.tsx`
  - `apps/web/src/features/groups/pages/groups-page.tsx`
  - `apps/web/src/features/insights/pages/insights-page.tsx`
  - `apps/web/src/features/onboarding/pages/onboarding-page.tsx`
  - `apps/web/src/features/overview/pages/overview-page.tsx`
- Change child feature components where route-shell compliance depends on widget async-state normalization:
  - `apps/web/src/features/budgets/components/budget-list.tsx`
  - `apps/web/src/features/budgets/components/budget-status-panel.tsx`
  - `apps/web/src/features/groups/components/group-list.tsx`
  - `apps/web/src/features/groups/components/group-expense-feed-list.tsx`
  - `apps/web/src/features/insights/components/insights-header.tsx`
- Update `apps/web/src/lib/i18n/locales/vi.json` only if touched fallback copy cannot reuse existing keys.
- Update plan/harness tracking files:
  - `docs/exec-plans/index.md`
  - `harness/feature_index.json`
  - `harness/features/feat-067.json`
  - `harness/progress.md`
- Out of scope:
  - Public auth and invitation routes: `apps/web/src/features/auth/pages/sign-in-page.tsx`, `apps/web/src/features/auth/pages/sign-up-page.tsx`, `apps/web/src/features/invitations/pages/accept-invitation-page.tsx`
  - `apps/web/src/features/more/pages/more-page.tsx` and optional `apps/web/src/features/expenses/pages/expenses-page.tsx`
  - Backend/API/store contract changes, new shared primitives, new design-system work, or new analytics/onboarding product behavior
  - Component/page render tests that conflict with `docs/FRONTEND.md`

## Non-negotiable Requirements

- Protected route pages in scope must render through `PageShell` from `apps/web/src/components/ui/page-shell.tsx`.
- `PageShell` owns route title, route-level `<h1>`, and outer page padding; touched pages must remove duplicated route `<header>/<h1>` wrappers and duplicate `px-*` shell padding.
- Loading, empty, error, forbidden, and success states that belong to one route must stay inside the same `PageShell`.
- Use `DataState` from `apps/web/src/components/shared/data-state.tsx` for blocking or card-shaped async states when its shape fits.
- Do not force `DataState` onto layouts that need custom chart/grid skeletons or specialized centered-card flows; preserve custom async markup for Insights panels and non-blocking Onboarding sections where `DataState` would reduce clarity.
- Preserve all current query hooks, mutation hooks, dialog flows, form validation, and Zustand action semantics. This is a UI orchestration refactor, not a behavior rewrite.
- Do not introduce direct `api/*` calls into UI components; UI continues to consume existing hooks/stores only.
- All visible text must stay on `t(...)` keys; add locale keys only when existing copy cannot express the refactor.
- No new npm packages, shadcn installs, or backend changes.

## Progress

- [x] 2026-05-21: Audited `docs/FRONTEND.md`, frontend reference docs, and the eight target pages plus their key child components.
- [x] 2026-05-21: Ran GitNexus upstream impact checks for `SettingsPage`, `ExpenseTrashPage`, `GroupDetailPage`, `BudgetsPage`, `GroupsPage`, `InsightsPage`, `OnboardingPage`, and `OverviewPage`; all returned LOW risk with 0 affected processes.
- [ ] 2026-05-21: Execute Batch 1 (current step) — normalize `settings-page.tsx`, `expense-trash-page.tsx`, and `overview-page.tsx`.
- [ ] 2026-05-21: Execute Batch 2 — normalize `budgets-page.tsx`, `groups-page.tsx`, `group-detail-page.tsx`, and the touched budget/group list widgets.
- [ ] 2026-05-21: Execute Batch 3 — normalize `insights-page.tsx`, `onboarding-page.tsx`, and the touched `InsightsHeader` composition.
- [ ] 2026-05-21: Run final verification, update harness evidence, and record `gitnexus_detect_changes(scope: all)` before any done/ready claim.

## Surprises & Discoveries

- `PageShell.actions` currently feeds `MobileHeader` only and does not give a built-in desktop action row, so Budgets, Groups, and Insights should keep action/filter controls in a body toolbar directly under the shell title instead of overloading `PageShell.actions`.
- `InsightsOverviewPanel`, `InsightsComparisonPanel`, and `InsightsGroupsPanel` already own custom chart/grid skeletons and retry affordances; route refactor should target the page shell and title ownership first instead of flattening those panel-level layouts into generic cards.
- `OnboardingPage` mixes create, join, invite preview, invite accept, and completion concerns in one file. The shell refactor can proceed without changing that product flow, but it may justify small local extraction if the file becomes harder to review.

## Decision Log

- Decision: Keep this plan frontend-only and limited to protected app-shell routes.
  Rationale: The canonical `PageShell` rule applies to protected app pages, while public auth and invitation pages intentionally use different centered/public layouts.
  Date/Author: 2026-05-21 / Orchestrator + User
- Decision: Implement in three batches instead of touching all eight pages in one pass.
  Rationale: Batch sequencing keeps verification and regression review smaller while still sharing one durable ExecPlan.
  Date/Author: 2026-05-21 / Orchestrator
- Decision: Use `DataState` where it improves blocking-state consistency, but preserve custom panel skeletons for Insights and non-blocking centered-card flow for Onboarding.
  Rationale: `docs/FRONTEND.md` requires state coverage, while `frontend-component-architecture-guide.md` allows custom async markup when `DataState` cannot express the shape cleanly.
  Date/Author: 2026-05-21 / Orchestrator

## Outcomes & Retrospective

- Plan created from completed research and impact analysis; no implementation edits have been made yet.
- Expected end state: all eight protected pages follow one route-shell convention, duplicated page headers/padding are removed, and touched async states use either `DataState` or an explicitly justified custom layout.

## Context and Orientation

- Route/page reference patterns already in-tree:
  - `apps/web/src/features/households/pages/households-page.tsx` — canonical `PageShell` + blocking `DataState` wrapper for a list route.
  - `apps/web/src/features/expenses/pages/expense-detail-page.tsx` — canonical `PageShell` + `DataState` pattern with back navigation, retry logic, and custom actions.
- Shared primitives:
  - `apps/web/src/components/ui/page-shell.tsx` — owns title, mobile header, and outer shell padding.
  - `apps/web/src/components/shared/data-state.tsx` — reusable loading/error/empty card state wrapper with `retryAction` and optional `customAction`.
- Existing route surfaces to normalize:
  - Settings / Expenses trash / Groups detail / Budgets / Groups / Insights / Onboarding / Overview under `apps/web/src/features/**/pages/`.
- Layer impact (`Types -> Config -> Repo -> Service -> Runtime -> UI` from `ARCHITECTURE.md`):
  - This plan changes the `UI` layer only.
  - No changes are planned for `Types`, `Config`, `Repo`, `Service`, or runtime contracts.
  - UI will continue to consume existing feature hooks and Zustand actions rather than bypassing them.
  - No new dependencies are justified or planned.

## Required Standards / Reference Docs

- `docs/FRONTEND.md`
  - Protected app routes use `PageShell`.
  - Route-level loading/empty/error/success states stay inside one shell.
  - Do not duplicate route header or shell padding.
- `docs/references/frontend/project-folder-structure.md`
  - Route files stay thin; feature page orchestration remains under `apps/web/src/features/**/pages/`.
  - Do not move feature logic into shared folders unless real reuse is proven.
- `docs/references/frontend/component-structure-pattern.md`
  - Split mixed concerns when files drift near 200 lines or mix 3+ concerns.
  - Keep page files focused on orchestration and push bounded widget concerns to feature components.
- `docs/references/frontend/naming-and-conventions-pattern.md`
  - Keep named exports, kebab-case files, absolute `@/` imports, and proper import grouping.
- `docs/references/frontend/api-react-query-pattern.md`
  - Preserve hook-based UI data access; no direct `api/*` imports in components.
  - Do not create redundant queries when existing hooks/store data already serve the page.
- `docs/references/frontend/zustand-store-pattern.md`
  - Preserve `householdActions` and selector-based store usage; do not move transient UI flags into persisted store state.
- `docs/references/frontend/form-pattern.md`
  - Preserve existing `react-hook-form` + `zod` form wiring in Onboarding and dialog-backed flows.
- `docs/references/frontend/dialog-and-form-pattern.md`
  - Preserve dialog ownership and existing accessible trigger/cancel semantics in budget/group dialogs.
- `docs/references/frontend/i18n-label-pattern.md`
  - No hardcoded user-facing text; any new copy must be added through locale keys.
- `docs/references/frontend/frontend-component-architecture-guide.md`
  - Prefer `DataState` for card-shaped widgets and preserve retry affordances.
  - Keep custom async markup only when `DataState` cannot express the layout.

## Plan of Work (Narrative)

1. **Lock the route-shell contract using existing in-tree examples.** Use `apps/web/src/features/households/pages/households-page.tsx` and `apps/web/src/features/expenses/pages/expense-detail-page.tsx` as the route-level patterns. No change is planned for `PageShell` or `DataState` APIs themselves.

2. **Batch 1 — low-risk route normalization.**
   - Update `apps/web/src/features/settings/pages/settings-page.tsx` so the page keeps one `PageShell` and routes loading/error branches through one `DataState` with retry behavior. Keep the success card stack and profile mutation behavior unchanged.
   - Update `apps/web/src/features/expenses/pages/expense-trash-page.tsx` to wrap the page in `PageShell`, derive admin-forbidden/loading/error/empty/success state booleans, and render those states through one `DataState` where appropriate. Preserve restore mutation, toast behavior, and trash item cards.
   - Update `apps/web/src/features/overview/pages/overview-page.tsx` to keep the existing `PageShell` but remove duplicated `px-*` wrappers from the empty branch so the shell exclusively owns outer padding. Keep widget-level `DataState` handling in `HeroStatsCard`, `RecentExpenses`, and `CategoryBreakdown` unchanged.

3. **Batch 2 — page shell plus widget-state normalization for budgets/groups.**
   - Update `apps/web/src/features/budgets/pages/budgets-page.tsx` to use `PageShell`, remove the custom route `<header>/<h1>`, and keep create-dialog controls in an in-body toolbar below the shell title. If no household is available, show a shell-contained blocking empty state instead of a bare paragraph.
   - Refactor `apps/web/src/features/budgets/components/budget-list.tsx` and `apps/web/src/features/budgets/components/budget-status-panel.tsx` to use `DataState` where the loading/error/empty card shape fits, while preserving retry, empty copy, and the existing summary/status card success markup.
   - Update `apps/web/src/features/groups/pages/groups-page.tsx` with the same route-shell treatment as Budgets: `PageShell`, no duplicate route header, in-body create toolbar, and shell-contained no-household blocking state.
   - Refactor `apps/web/src/features/groups/components/group-list.tsx` to use `DataState` for loading/error/empty states while keeping group-card success rendering and create/edit/archive flows unchanged.
   - Update `apps/web/src/features/groups/pages/group-detail-page.tsx` to use `PageShell` with back navigation, derive blocking loading/error/not-found state props, and keep summary + expense-list sections as success content. If needed, update `apps/web/src/features/groups/components/group-expense-feed-list.tsx` to use `DataState` for its own list-card async states without changing pagination behavior.

4. **Batch 3 — preserve specialized layouts while normalizing shell ownership.**
   - Update `apps/web/src/features/insights/pages/insights-page.tsx` to use `PageShell` and move route title ownership into the shell. Strip title/description markup from `apps/web/src/features/insights/components/insights-header.tsx` so that component becomes a filter/export toolbar only. Keep existing panel-level loading/error/empty shapes unless a specific panel can adopt `DataState` without losing chart/grid fidelity.
   - Update `apps/web/src/features/onboarding/pages/onboarding-page.tsx` so both setup and completion branches render inside the same `PageShell`. Keep the centered `max-w-2xl` content wrapper, preserve create/join mode switching, deep-link invite-token autofill, invite preview/accept flow, and completion CTA behavior. Only introduce `DataState` if a truly blocking route-level card state appears during refactor; otherwise keep the current specialized card composition.

5. **Verification and cleanup.** After each batch, run targeted lint/typecheck/test commands as needed. At the end, run the full repo verification path, update `harness/feature_index.json`, `harness/features/feat-067.json`, and `harness/progress.md`, then run `gitnexus_detect_changes(scope: all)` before any completion claim.

## Concrete Steps (Commands)

Run from repo root `/Users/tungdoan/Projects/Web/household-finance-system` unless noted.

```bash
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

If GitNexus context is stale before implementation, refresh it first:

```bash
./init.sh sync
```

Expected short output:

```text
OK
```

When a batch needs focused debugging, a one-file manual verification command is allowed, but final completion still requires the explicit repo checks above.

## Validation and Acceptance

- **Settings page:** `/settings` renders one `PageShell`; initial loading and blocking error render through `DataState`; retry still refetches the current user profile; avatar/details/password/account cards stay unchanged in success state.
- **Expense trash page:** `/expenses/deleted` renders one `PageShell`; admin-forbidden, loading, error, empty, and success states all remain inside that shell; restore button and toasts still work; no custom route `<h1>` remains in success markup.
- **Group detail page:** `/groups/[id]` renders one `PageShell` with back navigation; loading/error/not-found are shell-contained; success still shows summary plus expense feed; back-to-groups action remains available when content is unavailable.
- **Budgets page:** `/budgets` renders through `PageShell`; no route-level duplicated header remains; create dialog still opens/submits; no-household blocking state is shell-contained; `BudgetList` and `BudgetStatusPanel` preserve retry and success rendering while normalizing their async state cards.
- **Groups page:** `/groups` renders through `PageShell`; create/edit/archive flows remain unchanged; `GroupList` preserves group cards in success state and uses normalized blocking states.
- **Insights page:** `/insights` title comes from `PageShell`; `InsightsHeader` becomes controls-only; export and period switch still work; panel skeletons/charts remain visually truthful and retry actions still function.
- **Onboarding page:** `/onboarding` setup and completion flows both render inside one `PageShell` with centered inner content; create-household and invite-preview/accept behavior stay unchanged; existing redirect behavior for users who already have households remains intact.
- **Overview page:** `/home` empty branch no longer adds duplicate shell padding; tabs and empty state still render in the same order.
- **Regression guard:** no touched page imports `api/*` directly, no backend contracts change, no new hardcoded strings are introduced, and no public-route layouts are modified.
- **Acceptance artifact:** manual browser walkthrough or equivalent UI evidence for `/settings`, `/expenses/deleted`, `/groups`, `/groups/[id]`, `/budgets`, `/insights`, `/onboarding`, and `/home` after full verification.

## Idempotence & Recovery

- This is a source-only frontend refactor. Re-running the edits is safe because no migrations, generated files, or remote side effects are involved.
- Recovery is standard Git rollback of touched files.
- If a batch expands unexpectedly, stop after the current page group, keep the plan updated, and resume from the next unchecked batch item rather than mixing incomplete page refactors across all eight routes.

## Artifacts and Notes

- Pre-edit GitNexus impact evidence already gathered for this plan:
  - `SettingsPage`: LOW risk, 0 impacted symbols/processes.
  - `ExpenseTrashPage`: LOW risk, 0 impacted symbols/processes.
  - `GroupDetailPage`: LOW risk, 0 impacted symbols/processes.
  - `BudgetsPage`: LOW risk, 0 impacted symbols/processes.
  - `GroupsPage`: LOW risk, 0 impacted symbols/processes.
  - `InsightsPage`: LOW risk, 0 impacted symbols/processes.
  - `OnboardingPage`: LOW risk, 0 impacted symbols/processes.
  - `OverviewPage`: LOW risk, 0 impacted symbols/processes.
- Existing reference behavior to preserve:
  - `householdActions.fetchHouseholds()` bootstrap behavior in Budgets, Groups, Insights, and Onboarding.
  - Existing mutation-driven toast flows in Settings, Expense Trash, Budgets, Groups, and Onboarding.
  - Existing chart/export behavior in Insights.

## Interfaces & Dependencies

- Internal UI primitives:
  - `PageShell({ title, showBack?, onBack?, actions?, children })`
  - `DataState({ isLoading?, isEmpty?, isError?, title?, emptyTitle?, emptyDescription?, errorTitle?, errorDescription?, retryAction?, customAction?, children })`
- Internal dependencies that remain unchanged:
  - React Query hooks in `apps/web/src/features/**/hooks/*` and `apps/web/src/features/insights/api/use-analytics.ts`
  - Zustand selectors/actions from `apps/web/src/stores/household.store.ts`
  - Existing budget/group dialog components and onboarding forms/cards
- No external libraries or backend interfaces are added or modified by this plan.
