# ExecPlan: Full repo TypeScript file-size architecture refactor

## Title

Full repo TypeScript file-size architecture refactor (frontend, backend, and test decomposition)

## Purpose / Big Picture

Reduce architecture risk caused by oversized TypeScript and TSX files across `apps/web` and `apps/worker` without changing product behavior. Users should not see new features from this work; instead, they should continue to see same app behavior while code becomes easier to verify, safer to extend, and less likely to regress when future features land.

This plan is architecture-first, not threshold-first. Success is not merely pushing line counts under script limits; success is splitting large files along real ownership boundaries so pages become orchestrators, repositories separate query families and mapping concerns, and large tests are broken into focused contract coverage that remains trustworthy.

## Scope

### In Scope

**Planning / governance**
- `scripts/check_ts_length.sh` as reporting authority for oversized TypeScript files
- `docs/exec-plans/plans/2026-05-08-full-repo-typescript-file-size-architecture-refactor.md`
- `docs/exec-plans/index.md`
- `harness/progress.md`
- `harness/session-handoff.md` only if execution pauses mid-stream

**Frontend (`apps/web`) refactor targets**
- Large feature views/components/hooks/tests identified by `./scripts/check_ts_length.sh`
- First-wave targets:
  - `apps/web/src/components/expense/expense-form-fields.tsx`
  - `apps/web/src/components/expense/quick-add-expense-dialog.tsx`
  - `apps/web/src/components/expense/quick-add-expense-dialog.test.tsx`
  - `apps/web/src/views/app/overview-page.tsx`
  - `apps/web/src/views/app/overview-page.test.tsx`
  - `apps/web/src/views/app/onboarding-page.tsx`
  - `apps/web/src/views/app/households-page.test.tsx`
  - `apps/web/src/views/app/insights-page.tsx`
  - `apps/web/src/views/app/insights-page.test.tsx`
  - `apps/web/src/views/app/profile-settings-page.test.tsx`
- Near-threshold follow-up files if touched by same decomposition:
  - `apps/web/src/components/ui/combobox.tsx`
  - `apps/web/src/hooks/api/use-expense.ts`
  - `apps/web/src/views/app/onboarding-page.test.tsx`

**Backend (`apps/worker`) refactor targets**
- Large repositories and integration tests identified by `./scripts/check_ts_length.sh`
- First-wave targets:
  - `apps/worker/src/db/repositories/user-repository.ts`
  - `apps/worker/src/db/repositories/budget-repository.ts`
  - `apps/worker/src/db/repositories/expense-group-repository.ts`
  - `apps/worker/src/db/repositories/expense-query-repository.ts`
  - `apps/worker/test/integration/analytics-overview.spec.ts`
  - `apps/worker/test/integration/budgets-crud.spec.ts`
  - `apps/worker/test/integration/budgets-status.spec.ts`
  - `apps/worker/test/integration/expenses-lifecycle.spec.ts`
  - `apps/worker/test/integration/expenses-list.spec.ts`
  - `apps/worker/test/integration/households-crud.spec.ts`
  - `apps/worker/test/integration/media-profile.spec.ts`
- Near-threshold follow-up files if same test helpers/query modules make split cheap:
  - `apps/worker/src/db/repositories/expense-repository.ts`
  - `apps/worker/src/db/repositories/household-repository.ts`
  - `apps/worker/test/integration/auth-session.spec.ts`
  - `apps/worker/test/integration/expenses-detail.spec.ts`

**Allowed additive files/folders created during refactor**
- Feature-local component folders and `index.ts` barrels under `apps/web/src/components/<feature>/`
- Feature-local hook helpers under `apps/web/src/hooks/` when state/effect logic must leave page/component files
- Repository helper/query mapper files under `apps/worker/src/db/repositories/`
- Shared test fixtures/builders/helpers under existing test-local structure when more than one spec needs them

### Out of Scope

- New user-facing product capabilities
- API contract changes unless required to preserve behavior during internal split and proven additive/non-breaking
- Database schema migrations
- Visual redesign beyond layout-preserving extraction needed to split components safely
- Unrelated cleanup in already-compliant files
- Replacing existing architecture with new framework or state-management approach

## Non-negotiable Requirements

- Keep user-visible behavior unchanged; this is refactor, not feature work.
- Every touched area must preserve existing acceptance behavior through focused tests before broad cleanup continues.
- `ARCHITECTURE.md` layer model stays intact: `Types -> Config -> Repo -> Service -> Runtime -> UI`.
- Frontend pages must follow orchestrator-first decomposition from `docs/FRONTEND.md`.
- Worker routes/handlers must not gain SQL or repository-leaking abstractions.
- Repository splits must follow use-case/query-family boundaries, not generic `utils.ts` dumping.
- Test splits must preserve behavior coverage: happy path, validation, unauthorized/forbidden, and regressions where relevant.
- No new dependency unless current repo tooling cannot support focused decomposition.
- All new labels/copy introduced during UI extraction must remain i18n-backed.
- Final acceptance must include rerunning `./scripts/check_ts_length.sh` plus normal repository verification.

## Progress

- [x] (2026-05-08) Ran `./scripts/check_ts_length.sh` and captured current oversized-file inventory: 20 errors, 8 warnings. Owner: Orchestrator.
- [x] (2026-05-08) Chose architecture-first full-repo plan instead of threshold-first sweep. Owner: User + Orchestrator.
- [x] (2026-05-08) Read architecture, plans, harness state, and reference docs required to author repo-wide ExecPlan. Owner: Orchestrator.
- [x] (2026-05-08) Created and registered active ExecPlan for repo-wide TypeScript file-size refactor. Owner: Orchestrator.
- [x] Phase 0: Capture baseline verification and map each oversized file to one target split pattern before editing. Owner: Implementation agent.
- [x] Phase 1: Refactor frontend architecture hot spots into orchestrator pages/components + bounded helpers/components. Owner: Implementation agent.
- [x] Phase 2: Refactor backend repositories into smaller query-family modules and explicit mappers without changing route/handler contracts. Owner: Implementation agent.
- [x] Phase 3: Refactor oversized tests into focused specs plus shared test helpers/builders. Owner: Implementation agent.
- [x] Phase 4: Re-run length script, fix remaining warn/error outliers created or exposed by earlier phases, and record residual tech debt if any. Owner: Implementation agent.
- [x] Phase 5: Run final verification, update progress evidence, and move plan to Completed. Owner: Implementation agent.

## Surprises & Discoveries

- `scripts/check_ts_length.sh` classifies any `*.tsx` file as `COMPONENT` before `/app/` or `/views/` path matching, so several page/view files currently report under `COMPONENT` rather than `PAGE`.
- Biggest single hot spot is backend read repository `apps/worker/src/db/repositories/expense-query-repository.ts` at 1208 lines; biggest frontend hot spots are `quick-add-expense-dialog.tsx` at 541 lines and `overview-page.tsx` at 513 lines.
- Oversized tests are not isolated to one domain; expense, analytics, budgets, households, media-profile, and onboarding all carry test-structure debt.
- Refactor risk is spread across both runtime code and tests, so threshold-only shrinking would likely create shallow splits and unstable ownership.

## Decision Log

- **Decision**: Plan scope is repo-wide and phased rather than limited to one feature area.
  - Rationale: User asked for full repo plan, and current oversized files span web UI, worker repositories, and tests.
  - Date/Author: 2026-05-08 / Orchestrator

- **Decision**: Order work by architecture safety first, not by largest line count alone.
  - Rationale: User selected safer architecture as main goal; threshold-first splitting would risk fake modularization.
  - Date/Author: 2026-05-08 / Orchestrator

- **Decision**: Frontend splits should favor orchestrator pages, feature-local smart components, and internal non-barreled subcomponents.
  - Rationale: Matches `docs/FRONTEND.md` and frontend reference rules while keeping files focused and discoverable.
  - Date/Author: 2026-05-08 / Orchestrator

- **Decision**: Backend repository splits should separate query families, row mappers, and domain-specific helper functions instead of introducing generic repository base classes.
  - Rationale: Simpler, more explicit, and aligned with existing route/handler/repository boundaries.
  - Date/Author: 2026-05-08 / Orchestrator

- **Decision**: Oversized integration/component tests should be split by behavior/contract family and share builders/setup only when duplication is proven.
  - Rationale: Preserves test readability without turning helpers into hidden mini-frameworks.
  - Date/Author: 2026-05-08 / Orchestrator

- **Decision**: Near-threshold files should be cleaned after high-risk errors unless earlier splits already make them cheap to fix.
  - Rationale: Keeps plan focused on architecture risk first and avoids churn on compliant files.
  - Date/Author: 2026-05-08 / Orchestrator

## Outcomes & Retrospective

- Target outcome: oversized TS/TSX inventory drops materially, high-risk files gain clear ownership boundaries, and future feature work can proceed on smaller files that agents and humans can reason about whole.
- Acceptance target: `./scripts/check_ts_length.sh` shows no remaining `ERROR` entries or logs explicit deferred exceptions in `docs/exec-plans/tech-debt-tracker.md` with rationale if any file cannot safely be completed in this pass.
- Verification target: focused test runs for each edited area, workspace typechecks/build/tests via `./init.sh`, and unchanged product behavior in touched flows.
- Expected follow-up: if any giant file reveals hidden product/contract ambiguity that cannot be resolved as pure refactor, stop that slice and log smaller follow-up plan instead of broadening this one.

## Completion Notes

- Final `./scripts/check_ts_length.sh` result: `Errors: 0`, `Warnings: 10`, `✅ All good`.
- Frontend oversized orchestrators and tests were split into feature-local setup/spec modules while preserving existing import/runtime contracts.
- Backend oversized repositories and integration suites were reduced by extracting query-family helpers, repository submodules, and focused test files with compatibility re-exports where needed.
- Remaining warning-level files were intentionally left as warnings because plan acceptance required eliminating `ERROR` entries first; no deferred `ERROR` exceptions remain.

## Context and Orientation

- Length-check authority: `scripts/check_ts_length.sh`
- Repository rules: `AGENTS.md`, `ARCHITECTURE.md`, `docs/PLANS.md`
- Plan template/index: `docs/exec-plans/__plan-template__.md`, `docs/exec-plans/index.md`
- Harness continuity: `harness/feature_index.json`, `harness/progress.md`
- Frontend architectural rules: `docs/FRONTEND.md`, `docs/references/frontend/project-folder-structure.md`, `docs/references/frontend/component-structure-pattern.md`, `docs/references/frontend/naming-and-conventions-pattern.md`, `docs/references/frontend/api-react-query-pattern.md`, `docs/references/frontend/dialog-and-form-pattern.md`
- Backend architectural rules: `docs/BACKEND.md`, `docs/references/backend/architecture-and-boundaries.md`, `docs/references/backend/database-pattern.md`, `docs/references/backend/testing-pattern.md`
- Shared naming rules: `docs/references/shared/type-naming-pattern.md`
- Recent related feature plans that likely contain patterns worth preserving during splits:
  - `docs/exec-plans/plans/2026-05-08-feat-045-home-overview-dashboard-unification.md`
  - `docs/exec-plans/plans/2026-05-08-feat-044-analytics-export-path-and-product-hardening-follow-up.md`
  - `docs/exec-plans/plans/2026-05-06-feat-030-new-user-onboarding-flow.md`
  - `docs/exec-plans/plans/2026-05-04-feat-024-quick-add-expense-basic-flow.md`
  - `docs/exec-plans/plans/2026-05-04-feat-028-analytics-overview-dashboard.md`
  - `docs/exec-plans/plans/2026-05-05-feat-029-analytics-comparisons-breakdowns.md`

## Standards Enforcement

### Scope Classification

- Target domain: `fullstack`
- Layer impact: `Types -> Repo -> Runtime -> UI` for some slices, but many frontend-only and test-only steps can stay narrower
- New dependency risk: none expected

### Required References and Concrete Constraints

**Shared**
- `docs/references/shared/type-naming-pattern.md`
  - Any additive shared types created during extraction must use `DTO` / `Request` / `Response` naming rules when they represent API boundaries.
  - Internal view-models or helper types must remain explicit and non-generic.

**Frontend**
- `docs/FRONTEND.md`
  - Page files own route/query/store wiring and high-level flow only.
  - Record loading, empty, success, error, and retry states in touched regressions.
- `docs/references/frontend/project-folder-structure.md`
  - Keep feature-specific extracted pieces in `components/<feature>` or `hooks/<feature>` instead of `lib` dumping.
  - Only move code to `lib` if reused across multiple features.
- `docs/references/frontend/component-structure-pattern.md`
  - Files over 200 lines must be split by clear concern.
  - Public child components export through folder `index.ts`; internal-only subcomponents stay private.
- `docs/references/frontend/naming-and-conventions-pattern.md`
  - Use kebab-case file names, named exports, `@/...` imports, grouped imports, English comments only.
- `docs/references/frontend/api-react-query-pattern.md`
  - UI keeps calling hooks, not raw API modules.
  - Before new hook/helper, confirm data cannot already be derived from existing query/store.
- `docs/references/frontend/dialog-and-form-pattern.md`
  - Dialog refactors should prefer bounded internal dialog state and field-group composition.
  - Field sections should be split into reusable feature-local child components when form files grow beyond one responsibility.

**Backend**
- `docs/BACKEND.md`
  - Preserve route -> handler -> repo boundaries and current auth/validation behavior.
  - Add regression tests whenever refactor fixes or exposes real bugs.
- `docs/references/backend/architecture-and-boundaries.md`
  - No SQL in routes; avoid god helpers while splitting repositories.
- `docs/references/backend/database-pattern.md`
  - Keep mapping explicit, bind params, preserve stable ordering/pagination, avoid repeated query loops.
- `docs/references/backend/testing-pattern.md`
  - When test files split, preserve minimum endpoint coverage across resulting files.

## Implementation Notes

- Mandatory split patterns by file type:
  - **Frontend page/view**: thin page orchestrator + feature sections/cards + state/derived-data helpers when needed.
  - **Frontend dialog/form**: shell/dialog controller + field groups/sections + submit/mutation helper + internal presentational pieces.
  - **React Query hook**: key registry + queries/mutations remain together only if still focused; otherwise split derived helper functions into adjacent modules without bypassing hook boundary.
  - **Repository**: group by read/list/detail/summary/mutation family; keep row mapping explicit and local to repository area.
  - **Integration spec**: one endpoint/behavior family per file; shared setup extracted only when reused.
- Avoid these anti-patterns:
  - `helpers.ts` dumping grounds
  - `common.ts` with mixed concerns
  - base repository abstractions that hide SQL behavior
  - moving logic into shared components that still only one feature uses
  - splitting tests so far that behavior flow becomes impossible to understand
- Companion skills recommended during implementation:
  - `test-driven-development`
  - `frontend-patterns`
  - `backend-patterns`
  - `typescript-reviewer`
  - `requesting-code-review`
  - `verification-before-completion`

## Interfaces & Dependencies

- Script dependency: `git ls-files -z "*.ts" "*.tsx"` inside `scripts/check_ts_length.sh` defines scan scope.
- Frontend runtime dependencies likely touched during splits:
  - `apps/web/src/hooks/api/*`
  - `apps/web/src/stores/*`
  - `apps/web/src/components/ui/*`
  - `apps/web/src/lib/i18n/locales/vi.json`
- Backend runtime dependencies likely touched during splits:
  - `apps/worker/src/routes/*`
  - `apps/worker/src/handlers/*`
  - `apps/worker/src/db/repositories/*`
  - `apps/worker/test/integration/*`
- Verification dependency: `./init.sh` remains canonical whole-repo check.

## Plan of Work (Narrative)

### Phase 0 — Baseline and slice mapping

Run `./init.sh` and `./scripts/check_ts_length.sh` from repo root to confirm current baseline before editing. For each oversized file, record one intended split pattern: page orchestrator, dialog shell + sections, repository query-family split, or behavior-focused spec split. Do not start editing until each file has one named target shape; this avoids ad hoc fragmentation.

### Phase 1 — Frontend architecture hot spots

Refactor large web files first where architecture boundaries are most visible to future product work.

- `apps/web/src/components/expense/quick-add-expense-dialog.tsx`
  - Keep one top-level dialog orchestrator.
  - Extract internal field groups, footer/actions, household-specific conditional sections, and any derived display logic into adjacent feature-local modules.
  - Ensure public imports stay clean via `apps/web/src/components/expense/index.ts` or folder-local barrel when appropriate.
- `apps/web/src/components/expense/expense-form-fields.tsx`
  - Split large form field composition by responsibility: core amount/details, category/source, visibility/household controls, optional notes/meta.
  - Keep form-state ownership in one place; child pieces stay controlled via props.
- `apps/web/src/views/app/overview-page.tsx`, `apps/web/src/views/app/onboarding-page.tsx`, `apps/web/src/views/app/insights-page.tsx`
  - Keep each page file as orchestration-only layer.
  - Move feature sections/cards/loading and error blocks into `components/overview/*`, `components/onboarding/*`, or `components/analytics/*` as feature-local pieces.
- Near-threshold hook/component files touched by same refactor should be cleaned only when split reduces complexity naturally.

After each page/dialog split, run focused frontend tests for touched files before moving to next frontend slice.

### Phase 2 — Backend repository decomposition

Tackle large worker repositories after frontend splits establish pattern discipline.

- `apps/worker/src/db/repositories/expense-query-repository.ts`
  - Split by read use-case family such as list, detail, summary, analytics/export helpers, or row mapping helpers depending on actual current contents.
  - Keep explicit SQL and row mapping close to each query family.
  - Avoid generic repository inheritance or hidden shared helper layers.
- `apps/worker/src/db/repositories/expense-group-repository.ts`, `budget-repository.ts`, `user-repository.ts`
  - Separate write operations from read/report helpers where doing so clarifies ownership.
  - Extract repeated mapping logic or query fragments only when reused.
- Near-threshold repositories (`expense-repository.ts`, `household-repository.ts`) may be cleaned if shared helper extraction makes boundaries clearer.

After each repository split, run targeted worker integration tests covering its dependent routes before starting next repository.

### Phase 3 — Test refactor wave

Refactor giant test files after production structure stabilizes.

- Web tests:
  - Split `quick-add-expense-dialog.test.tsx`, `overview-page.test.tsx`, `households-page.test.tsx`, `insights-page.test.tsx`, `profile-settings-page.test.tsx` by behavior family or screen state.
  - Extract shared render/setup helpers only when reused across at least two resulting spec files.
- Worker tests:
  - Split `analytics-overview.spec.ts`, `expenses-lifecycle.spec.ts`, `expenses-list.spec.ts`, `budgets-*.spec.ts`, `households-crud.spec.ts`, `media-profile.spec.ts` by endpoint/behavior family.
  - Preserve explicit contract coverage across happy path, validation, auth, forbidden, not found, and regression flows.

After each test split, run only affected test files, then broader package-level tests once a domain batch finishes.

### Phase 4 — Warn-level cleanup and residual review

Re-run `./scripts/check_ts_length.sh`. For any remaining warnings or errors, decide case-by-case:

- If remaining issue has obvious bounded split with no new behavior risk, fix in same session.
- If remaining issue would require broad behavior rethinking, log it to `docs/exec-plans/tech-debt-tracker.md` with rationale and affected file path.

### Phase 5 — Final verification and documentation

Run full verification from repo root. Update `harness/progress.md` with work summary, files changed summary, commands run, blockers, and next steps. Move plan entry from Active to Completed in `docs/exec-plans/index.md` only after verification and evidence are complete.

## Concrete Steps (Commands)

Run from repository root `/Users/tungdoan/Projects/Web/household-finance-system` unless noted.

### Baseline

```bash
./init.sh
./scripts/check_ts_length.sh
```

Expected short transcript examples:

```text
... test/typecheck/build output ...

Summary:
  Errors: 20
  Warnings: 8
❌ Refactor required
```

### Frontend-focused verification during Phase 1

```bash
pnpm --filter web exec vitest run src/components/expense/quick-add-expense-dialog.test.tsx
pnpm --filter web exec vitest run src/views/app/overview-page.test.tsx src/views/app/onboarding-page.test.tsx src/views/app/insights-page.test.tsx
pnpm --filter web typecheck
```

Expected short transcript examples:

```text
PASS ...quick-add-expense-dialog.test.tsx
PASS ...overview-page.test.tsx
PASS ...onboarding-page.test.tsx
PASS ...insights-page.test.tsx

Type check passed
```

### Backend-focused verification during Phase 2

```bash
pnpm --filter worker test -- --run test/integration/analytics-overview.spec.ts test/integration/expenses-list.spec.ts test/integration/expenses-lifecycle.spec.ts test/integration/budgets-crud.spec.ts test/integration/budgets-status.spec.ts
pnpm --filter worker typecheck
```

Expected short transcript examples:

```text
PASS test/integration/analytics-overview.spec.ts
PASS test/integration/expenses-list.spec.ts
PASS test/integration/expenses-lifecycle.spec.ts

Type check passed
```

### Final verification

```bash
./scripts/check_ts_length.sh
./init.sh
```

Expected short transcript examples:

```text
Summary:
  Errors: 0
  Warnings: 0
✅ All good

... init script completes with no failures ...
```

## Validation and Acceptance

- **Architecture acceptance**
  - Touched frontend pages are orchestration-only and no longer mix multiple unrelated concerns in one file.
  - Touched repositories are split by query/use-case families with explicit mapping and no route leakage.
  - Touched tests are readable by behavior and preserve existing contract coverage.
- **Mechanical acceptance**
  - `./scripts/check_ts_length.sh` no longer reports `ERROR` for completed scope.
  - Any deferred remaining file is explicitly logged in `docs/exec-plans/tech-debt-tracker.md` with reason.
- **Verification acceptance**
  - Focused touched tests pass after each slice.
  - `pnpm --filter web typecheck` and `pnpm --filter worker typecheck` pass when their areas are touched.
  - Final `./init.sh` passes.
- **Behavior acceptance**
  - Existing user journeys for quick-add, onboarding, home overview, insights, budgets, analytics, household CRUD, and media/profile remain unchanged except for bug fixes discovered and locked by regression tests.

## Idempotence & Recovery

- Script and verification steps are safe to re-run.
- Refactor should proceed in small commits per slice so rollback can happen with standard git revert or branch reset before merge.
- If one slice reveals hidden behavior breakage, stop further phases, restore last known-good state for that slice, and narrow plan to smaller file subset before continuing.
- No schema or irreversible data migration work is in scope.

## Artifacts and Notes

- Baseline evidence already captured from `./scripts/check_ts_length.sh`:
  - `Errors: 20`
  - `Warnings: 8`
- Highest-priority files by current scan:
  - `apps/worker/src/db/repositories/expense-query-repository.ts` — `1208`
  - `apps/worker/test/integration/analytics-overview.spec.ts` — `1165`
  - `apps/worker/test/integration/expenses-lifecycle.spec.ts` — `960`
  - `apps/web/src/components/expense/quick-add-expense-dialog.test.tsx` — `834`
  - `apps/web/src/components/expense/quick-add-expense-dialog.tsx` — `541`
  - `apps/web/src/views/app/overview-page.tsx` — `513`
- Use these as early checkpoints; if they do not shrink safely, stop and reassess boundary choice before touching lower-priority files.
