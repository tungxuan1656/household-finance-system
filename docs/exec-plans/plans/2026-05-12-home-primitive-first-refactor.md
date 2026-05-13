# Home Primitive-First Refactor

## Title

Refactor protected `/home` into a primitive-first premium mobile dashboard.

## Purpose / Big Picture

This change upgrades the authenticated home dashboard so it looks intentionally premium on mobile while remaining truthful to the current spending, budget, household, and recent-activity data model. End users will observe cleaner glass surfaces, stronger financial typography, more consistent controls, and less visually bespoke UI across the home page, without changes to backend behavior or navigation structure.

## Scope

- Files, modules, and areas expected to change:
  - `docs/design-docs/2026-05-12-home-primitive-first-refactor-design.md`
  - `docs/exec-plans/index.md`
  - `apps/web/src/views/app/overview-page.tsx`
  - `apps/web/src/components/home/lens-selector.tsx`
  - `apps/web/src/components/home/group-filter-bar.tsx`
  - `apps/web/src/components/home/hero-stats-card.tsx`
  - `apps/web/src/components/home/recent-expenses.tsx`
  - `apps/web/src/components/home/category-breakdown.tsx`
  - `apps/web/src/components/home/household-cards-section.tsx`
  - `apps/web/src/components/home/empty-state.tsx`
  - bounded shared primitives under `apps/web/src/components/ui/*` as required by actual migration blockers
  - touched locale files under the frontend i18n structure
  - relevant tests under `apps/web/src/**/__tests__/*` or colocated test files if present
- Explicitly out of scope:
  - any `apps/worker/*` code or API contract changes
  - database migrations, seed changes, or analytics contract changes
  - broad redesign of unrelated protected routes
  - speculative primitive redesign beyond additive changes required by this migration
  - hidden active-household behavior or lens logic changes

## Non-negotiable Requirements

- The plan must be self-contained and executable without the original conversation.
- The implementation must preserve current `/home` data truthfulness and route behavior.
- All touched UI should use shadcn components as the baseline.
- Before editing any function, class, or method, run GitNexus upstream impact analysis for the symbols being changed and warn if risk is `HIGH` or `CRITICAL`.
- Because this is TypeScript/TSX work, use the TypeScript reviewer workflow before merge.
- Run `pnpm lint:fix` from repo root after code changes as required by `AGENTS.md`.

## Progress

- [x] 2026-05-12 Write design spec for the home primitive-first refactor in `docs/design-docs/2026-05-12-home-primitive-first-refactor-design.md`.
- [x] 2026-05-12 Create this ExecPlan and register it in `docs/exec-plans/index.md`.
- [x] 2026-05-12 Run GitNexus impact checks for the home symbols and shared primitives selected for modification; all required checks returned `LOW` risk.
- [x] 2026-05-12 Capture current primitive APIs and decide the minimum additive extensions required by real `/home` blockers.
- [x] 2026-05-12 Refactor the home page composition in `apps/web/src/views/app/overview-page.tsx`, preserving layout-only page concerns and converting budget/loading surfaces to shared cards.
- [x] 2026-05-12 Refactor `lens-selector.tsx` to use primitive-owned segmented/pill selector visuals.
- [x] 2026-05-12 Refactor `group-filter-bar.tsx` to use primitive-owned dismissible filter chips and shared trigger styling.
- [x] 2026-05-12 Refactor `hero-stats-card.tsx` onto `Card` composition, semantic status tokens, and finance typography.
- [x] 2026-05-12 Refactor `recent-expenses.tsx`, `category-breakdown.tsx`, `household-cards-section.tsx`, and `empty-state.tsx` to use primitive-owned surfaces and touched i18n labels.
- [x] 2026-05-12 Add and keep focused primitive tests for new toggle-group/progress behavior only; removed component render test coverage per user instruction.
- [x] 2026-05-12 Run `pnpm lint:fix`, targeted tests, `pnpm --filter web test`, and full `./init.sh` verification.
- [x] 2026-05-12 Update plan status, harness evidence, and progress tracking for the completed implementation.

## Surprises & Discoveries

- Discovery: `apps/web/src/views/app/overview-page.tsx` still contains inline placeholder components (`BudgetCardsPlaceholder`, `CategoryBreakdownPlaceholder`) plus TODO seams, which weakens the current page/component boundary.
- Discovery: the runtime account used during inspection exposes only the `Personal` lens, so mobile-first verification must not assume household-lens visibility in the baseline acceptance path.
- Discovery: current home components still mix hardcoded English and Vietnamese copy despite the existing frontend i18n foundation.

## Decision Log

- Decision: keep this rollout frontend-only and preserve existing hooks, contracts, and dashboard truthfulness.
  Rationale: the user asked for current-home inspection and a beautification/refactor plan, not a backend behavior change.
  Date/Author: 2026-05-12 / OpenCode orchestrator
- Decision: use Structured Primitive Expansion rather than a patch-only swap or a domain-specific dashboard kit.
  Rationale: `/home` has real primitive gaps, but a dashboard-specific abstraction layer would overfit and conflict with the primitive-first contract.
  Date/Author: 2026-05-12 / OpenCode orchestrator

## Outcomes & Retrospective

- Completed as a frontend-only `/home` hardening pass that preserved the existing dashboard data model. The most valuable additive primitive changes were small and reusable (`Badge` filter variant, chart tones on `Progress`, pill support across the toggle-group family), while touched home sections improved financial typography and localized copy. Inline placeholders in `overview-page.tsx` remain acceptable but could still be extracted later if the page grows again.

## Context and Orientation

- Protected `/home` entry: `apps/web/src/app/(protected)/home/page.tsx`
- Main home composition: `apps/web/src/views/app/overview-page.tsx`
- Home feature components:
  - `apps/web/src/components/home/lens-selector.tsx`
  - `apps/web/src/components/home/group-filter-bar.tsx`
  - `apps/web/src/components/home/hero-stats-card.tsx`
  - `apps/web/src/components/home/recent-expenses.tsx`
  - `apps/web/src/components/home/category-breakdown.tsx`
  - `apps/web/src/components/home/household-cards-section.tsx`
  - `apps/web/src/components/home/empty-state.tsx`
- Shared layout/shell support:
  - `apps/web/src/components/ui/page-shell.tsx`
  - `apps/web/src/components/layouts/mobile-header.tsx`
- Shared primitive ownership zone:
  - `apps/web/src/components/ui/*`
- UI guidance:
  - `docs/design-docs/shadcn-first-ui-web-guide.md`
- Required frontend implementation references:
  - `docs/references/frontend/project-folder-structure.md`
  - `docs/references/frontend/component-structure-pattern.md`
  - `docs/references/frontend/naming-and-conventions-pattern.md`
  - `docs/references/frontend/api-react-query-pattern.md`
  - `docs/references/frontend/i18n-label-pattern.md`

Layer impact check using `ARCHITECTURE.md` layering (`Types -> Config -> Repo -> Service -> Runtime -> UI`):

- Primary impact is **UI layer only**.
- No lower-layer dependency inversion is allowed.
- UI must continue consuming existing runtime/query/store contracts instead of bypassing them.
- If shared primitive changes are required, they must stay inside the UI layer and remain generic.

## Plan of Work (Narrative)

1. **Safety analysis before edits**
   - Run `gitnexus_impact` upstream on each directly edited symbol or component and on any shared primitive symbol chosen for extension.
   - Candidate symbols include `OverviewPage`, `LensSelector`, `GroupFilterBar`, `HeroStatsCard`, `RecentExpenses`, `CategoryBreakdown`, `HouseholdCardsSection`, `EmptyState`, plus targeted primitive exports such as `Card`, `ToggleGroupItem`, `Badge`, and `Progress` if modified.
   - If any impact report is `HIGH` or `CRITICAL`, pause and warn before proceeding.

2. **Lock minimal primitive changes**
   - Inspect current implementations in `apps/web/src/components/ui` and choose the smallest additive API set required by the real home migration.
   - Expected likely changes:
     - segmented or pill selector support on the toggle-group primitive family
     - dismissible filter-chip support via `Badge` or a tiny generic chip primitive
     - chart `tone` support on `Progress`
     - optional featured card surface if the hero cannot use the existing glass surface cleanly
   - Reject any change that is speculative or page-specific.

3. **Refactor home composition first, preserving behavior**
   - Update `apps/web/src/views/app/overview-page.tsx` to use clearer mobile-first layout rhythm (`gap-6` mobile, `gap-8` desktop) while keeping layout-only classes.
   - Reduce or extract inline placeholder components if they materially improve clarity and primitive compliance.
   - Keep current queries, lens logic, empty-state behavior, and route-level behavior unchanged.

4. **Refactor home sections onto shared primitives**
   - `apps/web/src/components/home/lens-selector.tsx`: remove call-site active styling and use primitive-owned selector visuals.
   - `apps/web/src/components/home/group-filter-bar.tsx`: remove bespoke chip styling and use the shared filter-chip treatment.
   - `apps/web/src/components/home/hero-stats-card.tsx`: rebuild with `CardHeader`/`CardContent`, `font-mono tabular-nums`, semantic status colors, and i18n labels.
   - `apps/web/src/components/home/recent-expenses.tsx`: use shared card shell, badges, and non-bespoke row affordances.
   - `apps/web/src/components/home/category-breakdown.tsx`: replace progress selector hacks with primitive tone props and standard card framing.
   - `apps/web/src/components/home/household-cards-section.tsx` and `apps/web/src/components/home/empty-state.tsx`: move to standard card composition.

5. **Align touched copy with i18n rules**
   - For every touched user-facing string in these components, route labels through the project i18n pattern and update locale resources in the existing frontend structure.
   - Do not attempt a broad sweep outside touched files.

6. **Test and verify**
   - Add or update focused tests for any new primitive prop behavior.
   - Do not add component render tests for touched home components; the user explicitly disallowed that category of test.
   - Run repo-required verification, including `pnpm lint:fix` and `./init.sh`.

7. **Harness updates**
   - Update the relevant harness feature entry or create a new one if this work is tracked as a distinct follow-up feature.
   - Record evidence in the per-feature JSON and add a newest-first progress log entry in `harness/progress.md`.

## Concrete Steps (Commands)

Run all commands from repo root `/Users/tungdoan/Projects/Web/household-finance-system` unless noted otherwise.

1. Safety analysis and current-state inspection:

```bash
# inspect blast radius before editing
# symbol names may be adjusted to exact exported names after source inspection
```

Expected short outputs:

- GitNexus returns `risk: LOW|MEDIUM|HIGH|CRITICAL` plus direct callers/importers and affected processes.
- If any target returns `HIGH` or `CRITICAL`, stop and record a warning before code changes.

2. After edits are implemented:

```bash
pnpm lint:fix
pnpm --filter @app/web test
./init.sh
```

Expected short outputs:

- `pnpm lint:fix`: completes with no remaining lint errors.
- `pnpm --filter @app/web test`: shows passing tests for the touched frontend scope.
- `./init.sh`: completes the workspace verification path successfully, including install/harness checks/lint/type-check/tests/web build.

3. Before commit / final review:

```bash
# detect overall change impact
```

Expected short outputs:

- GitNexus change detection lists changed symbols and affected processes with acceptable risk notes for the submitted diff.

## Validation and Acceptance

Happy-path acceptance:

- Signing in and navigating to `http://127.0.0.1:3000/home` still loads the home page successfully.
- For the inspected account, the personal-lens home still shows current overview data, recent expenses, category breakdown, and quick-add entry point.
- Home sections now present consistent glass surfaces and stronger spacing rhythm on mobile.
- Hero amount uses finance typography (`font-mono tabular-nums`) and semantic status styling.
- Lens selector, filter chips, and category progress colors are driven by primitive APIs instead of feature-level override classes.

Validation/error/regression checks:

- Empty dashboard state still renders the expected empty-state experience without visual regressions.
- The home route remains usable when budget data is absent.
- If only one lens is available, the page still renders correctly without broken selector behavior.
- Touched localized labels resolve correctly instead of showing raw keys.

Acceptance artifacts:

- passing frontend tests for touched components/primitives
- successful `pnpm lint:fix`
- successful `./init.sh`
- optional browser snapshot or screenshot of the updated `/home` state as evidence in harness notes

## Idempotence & Recovery

- The plan is safe to re-run because it is frontend-only and does not include destructive data operations.
- Verification commands are idempotent.
- If a primitive API extension causes widespread regressions, revert the additive primitive change first, then re-apply the home migration with a smaller scope.
- Because no schema or backend changes are involved, rollback is standard git revert of the touched frontend files.

## Artifacts and Notes

- Design spec for this effort: `docs/design-docs/2026-05-12-home-primitive-first-refactor-design.md`
- Prior continuity plans/features:
  - `docs/exec-plans/plans/2026-05-08-feat-045-home-overview-dashboard-unification.md`
  - `harness/features/feat-051.json`
- Browser-inspection baseline already established in this session with a successful sign-in to `/home` for the provided account.

## Interfaces & Dependencies

- UI/runtime consumers already used by the page:
  - `useAnalyticsOverviewQuery(...)`
  - `useAnalyticsComparisonQuery(...)`
  - `useBudgetListQuery(...)`
  - `useExpenseSummaryQuery(...)`
  - `useInfiniteExpenseListQuery(...)`
  - `useExpenseGroupListQuery(...)`
  - `useHouseholdStore(...)`
- Shared primitive families likely involved:
  - `Card`, `CardHeader`, `CardContent`
  - `ToggleGroup`, `ToggleGroupItem`
  - `Badge`
  - `Progress`
  - possibly a tiny generic icon/avatar-like primitive if current options cannot express the category badge affordance cleanly
- Companion skills required during execution and review:
  - `test-driven-development` before implementation
  - `typescript-reviewer` for TypeScript/TSX review
  - `requesting-code-review` after implementation
  - `verification-before-completion` before claiming completion
  - `subagent-driven-development` if implementation is split across independent UI/primitive tasks in the same session
