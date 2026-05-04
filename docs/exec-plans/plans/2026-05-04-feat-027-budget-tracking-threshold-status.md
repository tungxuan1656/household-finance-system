# ExecPlan: feat-027 — Budget Tracking & Threshold Status

## Title

Budget tracking & threshold status (fullstack)

## Purpose / Big Picture

Enable household members to see whether the current budget is on track by comparing planned budget limits against actual spend for the selected monthly period. Users will observe a Budget Tracking page that shows total planned vs actual spend, remaining amount, threshold state (`ok`, `warning`, `exceeded`), per-category progress bars, and an inline warning banner once total usage reaches or exceeds 80%. This plan covers in-app warning/status visibility only; push/email notifications remain out of scope.

## Scope

### In Scope

**Backend (apps/worker):**
- Extend budget contracts with a status read model for planned-vs-actual tracking.
- Add repository support to aggregate actual spend for a budget period from expenses, filtered by household and visibility rules.
- Add `GET /api/v1/budgets/:id/status` for budget status detail.
- Add budget-threshold calculation helpers for total and per-category states using fixed MVP thresholds: warning at `>= 80%`, exceeded at `>= 100%`.
- Add integration/unit coverage for happy path, validation, membership/auth rules, and threshold edge cases.

**Frontend (apps/web):**
- Extend budget types/API/hooks with a budget-status transport.
- Refactor the budgets page from setup/list-only into a tracking view that can render the current-period budget status for the selected household.
- Add status UI components for total summary, warning banner, and per-category progress rows/cards that resolve category label/icon/color from the global static catalog.
- Add i18n keys for tracking states, remaining/actual/planned labels, and warning copy.
- Add component/view tests for loading, empty, warning, exceeded, and category rendering states.

**Harness / Planning:**
- Register this ExecPlan in `docs/exec-plans/index.md`.
- Mark `feat-027` as `in_progress` in harness state when the plan is created.
- Add progress evidence in `harness/progress.md`.

### Out of Scope

- Push/email/SMS notification delivery or user-configurable notification preferences (`docs/product-specs/budget-notification.md`).
- Budget start-day customization, recurring budget rules, or non-monthly periods.
- Spend timeline charts or analytics drill-downs (`feat-028`/`feat-029`).
- Background pre-aggregation jobs or caching layers unless implementation evidence proves the live query is too slow.
- Changes to expense creation/edit flows beyond what is necessary to read existing expense data.
- New permission models beyond existing household membership and budget-view/admin-edit rules.

## Non-negotiable Requirements

- The plan is self-contained and names the exact files, contracts, commands, and evidence expected.
- Observable success must include at least one backend acceptance artifact and one frontend acceptance artifact.
- All new user-facing text must use i18n keys.
- The implementation must preserve the layer model from `ARCHITECTURE.md`: `Types -> Config -> Repo -> Service -> Runtime -> UI`.
- Data access must remain inside repositories or explicit helpers called by handlers; routes must not contain aggregation SQL.

## Progress

- [ ] (2026-05-04) Create and register ExecPlan for `feat-027`; mark harness feature `in_progress`.
- [ ] (2026-05-04) Confirm budget status contract shape and threshold semantics from existing budget + expense flows.
- [ ] (2026-05-04) Add backend contract/repository support for planned-vs-actual aggregates and threshold calculation.
- [ ] (2026-05-04) Add `GET /api/v1/budgets/:id/status` handler, route, and tests.
- [ ] (2026-05-04) Add frontend types/API/hooks for budget status and current-period fetch orchestration.
- [ ] (2026-05-04) Add budget tracking UI states: total summary, warning banner, per-category progress, loading/empty/error.
- [ ] (2026-05-04) Add or update i18n + frontend tests.
- [ ] (2026-05-04) Run full verification (`./init.sh`) and capture evidence in harness artifacts.

## Surprises & Discoveries

- The current `apps/web/src/views/app/budgets-page.tsx` is still a setup/list view from `feat-026`; `feat-027` should extend it instead of creating a second budgets entry point.
- The current budget summary UI shows planned values only. Status work should prefer additive status-specific components rather than overloading setup/edit components.
- `docs/product-specs/budget-management.md` mentions a spend timeline, but `harness/features/feat-027.json` does not. This plan treats timeline/chart work as deferred to analytics follow-ups.

## Decision Log

- **Decision**: The feature will use a dedicated read endpoint `GET /api/v1/budgets/:id/status` rather than overloading `GET /api/v1/budgets/:id`.
  - Rationale: Keeps the existing setup/edit DTO stable and separates planned-only configuration from computed status fields, matching the contract rule against changing field meaning in place.
  - Date/Author: 2026-05-04 / Orchestrator

- **Decision**: Thresholds are fixed in MVP: `warning` at `>= 80%` and `exceeded` at `>= 100%`.
  - Rationale: This is explicitly defined in `harness/features/feat-027.json`; configurable thresholds belong to later notification work.
  - Date/Author: 2026-05-04 / Orchestrator

- **Decision**: Household actual spend must exclude expenses outside the same household and must respect existing visibility enforcement when aggregating shared budget status.
  - Rationale: The feature record explicitly requires filtering by household and visibility; this avoids leaking private spend into household budget status.
  - Date/Author: 2026-05-04 / Orchestrator

- **Decision**: The budgets page remains the primary UI surface for tracking, with the latest/current-period budget status shown first.
  - Rationale: Reuses the existing route and feature investment from `feat-026` while keeping navigation simple for MVP.
  - Date/Author: 2026-05-04 / Orchestrator

- **Open decision placeholder**: If multiple budgets exist for a household and no explicit period filter is selected, use the latest budget month as the default tracked period unless implementation discovery finds an existing “active period” rule.
  - Rationale: Current web code already defaults to `budgetsData?.items[0]`; verify this remains correct during implementation.
  - Date/Author: 2026-05-04 / Orchestrator

## Outcomes & Retrospective

_(Fill after implementation completion.)_

## Context and Orientation

- Product spec: `docs/product-specs/budget-management.md`
- Feature records: `harness/features/feat-026.json`, `harness/features/feat-027.json`, `harness/features/feat-019.json`
- Existing budget plan: `docs/exec-plans/plans/2026-05-04-feat-026-budget-setup-editing.md`
- Worker contracts: `apps/worker/src/contracts/budget-schemas.ts`, `apps/worker/src/contracts/budget-types.ts`
- Worker repositories: `apps/worker/src/db/repositories/budget-repository.ts`, `apps/worker/src/db/repositories/expense-repository.ts`, `apps/worker/src/db/repositories/expense-query-repository.ts`
- Worker handlers/routes: `apps/worker/src/handlers/budgets/*`, `apps/worker/src/routes/budgets.ts`, `apps/worker/src/index.ts`
- Worker tests: `apps/worker/test/unit/dto-budget.spec.ts`, `apps/worker/test/integration/budgets-crud.spec.ts`
- Web types/API/hooks: `apps/web/src/types/budget.ts`, `apps/web/src/api/budget.ts`, `apps/web/src/hooks/api/use-budgets.ts`
- Web views/components: `apps/web/src/views/app/budgets-page.tsx`, `apps/web/src/components/budget/*`
- Category catalog access pattern: `apps/web/src/hooks/api/use-reference-data.ts`, `apps/worker/src/lib/reference-data/catalog.ts`
- Household selection: `apps/web/src/stores/household.store.ts`

## Standards Enforcement

### Scope Classification

- Target domain: `fullstack`
- Layer impact: `Types -> Repo -> Runtime -> UI`
- No new third-party dependency is planned by default. If implementation later requires a new dependency, record why existing Intl / shadcn / React Query / current worker utilities are insufficient before adding it.

### Required References and Concrete Constraints

**Shared**
- `docs/references/shared/type-naming-pattern.md`
  - Use `BudgetStatusDTO`, `BudgetCategoryStatusDTO`, `GetBudgetStatusResponse` style names.
  - Request/response naming must stay explicit; do not introduce generic `Result` or `Payload` types.

**Backend**
- `docs/references/backend/architecture-and-boundaries.md`
  - Keep aggregation SQL in repository code only.
  - Handlers orchestrate validation, membership, and DTO mapping only.
- `docs/references/backend/api-contract-and-validation.md`
  - New route stays under `/api/v1` and validates params/query/body explicitly.
  - Do not change existing `GET /budgets/:id` payload semantics in place.
- `docs/references/backend/error-handling-pattern.md`
  - Use `400/401/403/404/409/500` deliberately; never return a success envelope on failure.
- `docs/references/backend/security-and-auth-pattern.md`
  - Protected route must use existing auth middleware and membership checks.
  - Never trust budget/household/category identifiers without repository-backed verification.
- `docs/references/backend/testing-pattern.md`
  - Add tests for happy path, validation failure, unauthorized/forbidden, not found, and threshold regression edges.
- `docs/references/backend/database-pattern.md`
  - Avoid `SELECT *`, bind all params, keep explicit snake_case-to-camelCase mapping, and document any added indexes if aggregate queries need them.
- `docs/references/backend/cloudflare-workers.md`
  - If any worker runtime/API uncertainty appears during implementation, use `documentation-lookup` before relying on memory.

**Frontend**
- `docs/references/frontend/project-folder-structure.md`
  - Keep budget-specific API/hooks/components within the budget feature folders; do not push single-feature logic into `lib`.
- `docs/references/frontend/component-structure-pattern.md`
  - Keep `budgets-page.tsx` as the orchestrator and split tracking UI into feature-bounded child components with barrel exports.
- `docs/references/frontend/naming-and-conventions-pattern.md`
  - New files use kebab-case; hooks live in `use-budgets.ts`; prefer absolute `@/...` imports.
- `docs/references/frontend/api-react-query-pattern.md`
  - Declare all new endpoints in `API_ENDPOINTS`, add `BUDGET_KEYS` scopes for status queries, and drive UI through hooks only.
- `docs/references/frontend/i18n-label-pattern.md`
  - No hardcoded warning/status copy; add synchronized locale keys for all new labels.

**Frontend governance from `docs/FRONTEND.md` + shadcn pre-read**
- Keep the page orchestrator-first and split status display into smart feature components.
- Use shadcn primitives directly (`Alert`, `Card`, `Progress`, `Badge`, `Skeleton`, `Empty`) rather than custom status markup when those primitives fit.
- Use semantic status styling and `gap-*`, not raw color classes or `space-y-*`.
- Warning banner must use `Alert`; loading placeholders must use `Skeleton`; empty states must use `Empty`.

## Implementation Notes

- Mandatory patterns during implementation:
  - Separate planned configuration DTOs from computed status DTOs.
  - Reuse the existing reference-category lookup path instead of duplicating catalog resolution logic.
  - Prefer a pure threshold helper for deterministic backend + frontend test fixtures.
- Companion skills for implementation:
  - `tdd-workflow`
  - `security-review`
  - `documentation-lookup`
  - `frontend-patterns`
  - `backend-patterns`
  - `verification-loop`
- Common pitfalls to avoid:
  - Mixing private expenses into household aggregates.
  - Duplicating period-selection logic between page, hook, and component layers.
  - Hardcoding category labels instead of resolving from the catalog.
  - Overwriting existing budget setup/edit DTOs with computed fields that belong only to the status read model.

## Interfaces & Dependencies

### Planned Backend Interface Additions

- `GET /api/v1/budgets/:id/status`
  - Auth required.
  - Membership required.
  - Response shape should be explicit and stable, for example:

```ts
type BudgetThresholdStatus = 'ok' | 'warning' | 'exceeded'

type BudgetCategoryStatusDTO = {
  categoryKey: string
  plannedLimitMinor: number
  actualSpendMinor: number
  remainingMinor: number
  percentUsed: number
  status: BudgetThresholdStatus
}

type BudgetStatusDTO = {
  budgetId: string
  householdId: string
  period: string
  currencyCode: string
  totalPlannedMinor: number
  totalActualMinor: number
  totalRemainingMinor: number
  totalPercentUsed: number
  totalStatus: BudgetThresholdStatus
  categoryStatuses: BudgetCategoryStatusDTO[]
}
```

- Internal helper candidates:
  - `calculateBudgetThresholdStatus(percentUsed: number): BudgetThresholdStatus`
  - `getBudgetActualSpendSummary(db, { budgetId | householdId, period })`

### Expected Existing Dependencies

- Expense data from the expense persistence layer introduced in `feat-017`/`feat-019`.
- Household membership lookup via existing repository/middleware patterns.
- Reference category catalog from `feat-016`.
- Existing `BudgetDTO` and budget list/detail APIs from `feat-026`.

## Scope Map and Dependency Checks

### Files Expected to Change

**Worker**
- `apps/worker/src/contracts/budget-schemas.ts`
- `apps/worker/src/contracts/budget-types.ts`
- `apps/worker/src/contracts/index.ts`
- `apps/worker/src/db/repositories/budget-repository.ts`
- `apps/worker/src/db/repositories/expense-repository.ts` or `apps/worker/src/db/repositories/expense-query-repository.ts` (only if existing aggregate helpers are missing)
- `apps/worker/src/handlers/budgets/get-budget-status.ts` (new)
- `apps/worker/src/routes/budgets.ts`
- `apps/worker/src/index.ts` (only if route registration shape needs a touch)
- `apps/worker/test/unit/dto-budget.spec.ts`
- `apps/worker/test/integration/budgets-status.spec.ts` (new preferred) or `budgets-crud.spec.ts` if extension is smaller and stays readable

**Web**
- `apps/web/src/types/budget.ts`
- `apps/web/src/api/endpoints.ts`
- `apps/web/src/api/budget.ts`
- `apps/web/src/hooks/api/use-budgets.ts`
- `apps/web/src/views/app/budgets-page.tsx`
- `apps/web/src/components/budget/budget-summary-card.tsx` (if repurposed for tracking)
- `apps/web/src/components/budget/budget-list.tsx` (if current-period selection remains embedded here)
- New status-focused components, likely under `apps/web/src/components/budget/`:
  - `budget-status-overview.tsx`
  - `budget-warning-alert.tsx`
  - `budget-category-progress-list.tsx`
  - `budget-category-progress-row.tsx`
  - `budget-status-card.tsx`
- `apps/web/src/components/budget/index.ts`
- `apps/web/src/lib/i18n/locales/vi.json`
- Related frontend tests under the same feature folder / `views/app`

**Harness / Docs**
- `docs/exec-plans/index.md`
- `harness/features/feat-027.json`
- `harness/feature_index.json`
- `harness/progress.md`

### Layer Checks

- **Types**: status DTOs defined first and exported from worker/web type layers.
- **Repo**: actual-spend aggregation lives in repository helpers with explicit SQL and mappings.
- **Runtime**: handler validates + authorizes + maps repository output to DTO; route wraps handler in success envelope.
- **UI**: page/view uses hooks only; components receive data via props and should not bypass API layers.

### Hard Dependency Enforcement

- Lower layers do not depend on higher layers: repository code must not import handler or UI utilities.
- UI does not bypass runtime/service contracts: web components must consume `use-budgets` hooks, not call `client` directly.
- Data access enters through repository boundaries: no SQL or D1 access in routes/handlers.
- No new dependency is justified yet; use existing React Query, Intl formatting, and shadcn primitives first.

## Plan of Work (Narrative)

1. **Lock the status contract before editing behavior.** Extend worker/web budget types with status DTOs and add path/query validation for the status endpoint. Keep `BudgetDTO` unchanged so `feat-026` setup/edit flows remain stable.

2. **Add aggregate read support in the worker repository layer.** Extend `apps/worker/src/db/repositories/budget-repository.ts` with read helpers that load a budget and compute actual spend totals for the budget month using expense records already filtered to the same household and allowed visibilities. If the aggregate needs expense-query-specific helpers, add the minimal shared repository function rather than embedding SQL in the budget handler.

3. **Add deterministic threshold calculation.** Implement a small pure helper or repository-local utility that converts percent used into `ok | warning | exceeded` using fixed thresholds. Cover exact edges `79.99`, `80`, `99.99`, and `100` in tests.

4. **Add the runtime endpoint.** Create `apps/worker/src/handlers/budgets/get-budget-status.ts`, validate `:id`, fetch the budget, enforce membership, gather actual spend totals, map the result to `BudgetStatusDTO`, and wire `GET /api/v1/budgets/:id/status` into `apps/worker/src/routes/budgets.ts`.

5. **Add backend verification.** Prefer a dedicated `apps/worker/test/integration/budgets-status.spec.ts` so the status behavior stays isolated from CRUD coverage. Use scenario data from existing budget + expense helpers to prove total tracking, category tracking, empty actual-spend behavior, unauthorized access, non-member access, and threshold transitions.

6. **Extend web transport and cache layers.** Add a new endpoint entry, new API function `getBudgetStatus`, and new hook/query key branch such as `BUDGET_KEYS.status(id)`. Avoid duplicating the current list/detail query logic.

7. **Refactor the budgets page into a tracking-oriented orchestrator.** Keep `apps/web/src/views/app/budgets-page.tsx` responsible for household selection, loading current/latest budget, fetching status for the selected budget, and coordinating dialog/edit actions. Do not bury page-wide data wiring inside summary or list child components.

8. **Add status-specific UI components.** Introduce focused child components for the total summary, warning alert, and category progress list/rows. Each row should show category identity from the global catalog, planned vs actual or remaining values, and a progress indicator/status badge. Reuse shadcn `Alert`, `Card`, `Badge`, `Progress`, `Skeleton`, and `Empty` patterns.

9. **Add i18n and frontend tests.** Add tracking-specific labels and feedback text to `vi.json`, then add component/view tests for warning/exceeded states, empty category budget states, and category metadata rendering from the reference catalog.

10. **Finish with full harness updates and verification evidence.** Once implementation is complete, update plan progress, feature evidence, and `harness/progress.md`, then run `./init.sh` from repo root before marking the feature done.

## Concrete Steps (Commands)

Run from repo root unless noted.

```bash
# 1. Baseline repo verification before implementation
./init.sh

# 2. Worker unit + integration tests while building budget status
pnpm --filter worker test -- budget

# 3. Focused web tests for budget UI if new tests are added
pnpm --filter web test -- budget

# 4. Full worker suite after backend changes stabilize
pnpm --filter worker test

# 5. Full web verification after UI changes stabilize
pnpm --filter web lint
pnpm --filter web typecheck
pnpm --filter web test
pnpm --filter web build

# 6. Final full-workspace verification
./init.sh
```

### Expected Short Outputs

- `./init.sh` → includes successful lint, type-check, tests, and web build; no failing step.
- `pnpm --filter worker test -- budget` → budget-related suites pass; e.g. `x passed, 0 failed`.
- `pnpm --filter web test -- budget` → budget component/view suites pass; e.g. `x passed, 0 failed`.
- `pnpm --filter web build` → Next.js production build completes without type/runtime contract errors.

## Validation and Acceptance

### Happy Path

- Budget with total and category limits returns `GET /api/v1/budgets/:id/status` payload containing:
  - total planned amount
  - total actual spend
  - remaining amount
  - percent used
  - `ok | warning | exceeded`
  - per-category status rows
- Budgets page shows the selected/current budget with:
  - overall summary card
  - inline warning alert when total usage `>= 80%`
  - category progress rows with label/icon/color from the catalog

### Validation / Error Paths

- Invalid budget id/path params return `400` with validation details.
- Missing budget or budget outside visible membership returns `404`.
- Unauthenticated requests return `401`.
- Frontend error state renders retry UI rather than a blank section.

### Unauthorized / Forbidden

- Non-member cannot fetch budget status for another household.
- Member can view budget status if they can view the underlying budget; admin-only rules remain limited to create/edit, not read.

### Regression Checks

- Existing `GET /api/v1/budgets/:id` contract remains unchanged.
- Existing create/edit/list budget flows from `feat-026` still pass their prior tests.
- Budget status does not include private expenses from other households or periods.
- Warning threshold behavior is correct at exactly `80%` and exactly `100%`.

### Acceptance Artifacts

- Backend artifact: integration test output for the new status endpoint.
- Frontend artifact: view/component test output proving warning alert + category progress rendering.
- Full-workspace artifact: final `./init.sh` transcript snippet showing success.

## Idempotence & Recovery

- This feature should be code-only and safe to re-run; there is no planned migration in scope.
- Re-running tests and `./init.sh` is safe.
- If implementation temporarily destabilizes the budgets page, recover by reverting only the in-session budget tracking edits; no data rollback should be required.
- If performance exploration suggests schema/index work is necessary, stop and record that as a decision or follow-up instead of silently adding a migration outside this plan.

## Artifacts and Notes

- Capture at least one short test transcript for the worker status endpoint.
- Capture at least one short web test/build transcript for the tracking UI.
- Update this plan’s `Progress`, `Surprises & Discoveries`, and `Decision Log` during implementation, not only at the end.

## Risks and Blockers

- **Visibility-rule ambiguity**: The feature record requires household + visibility filtering, but the exact aggregate rule must match existing expense visibility behavior. Confirm via existing expense repository tests before coding.
- **Current-period selection ambiguity**: There is no explicit “active budget period” abstraction yet. Implementation should either use the latest budget month or a page-selected period and record the decision.
- **Performance risk**: Live aggregation over expenses may be acceptable for MVP, but if query shape is expensive, note index or aggregation follow-up work explicitly instead of expanding scope silently.
- **UI scope creep risk**: Product spec mentions spend timeline; keep charts out unless the feature record is updated.

## Harness Integration

- On plan creation:
  - Add this file to `docs/exec-plans/plans/`.
  - Add an `Active` entry in `docs/exec-plans/index.md`.
  - Update `harness/features/feat-027.json` to `in_progress` with refreshed `updated_at`.
  - Update `harness/feature_index.json` to `in_progress` for `feat-027`.
  - Add a progress log entry to `harness/progress.md` summarizing the plan and next steps.
- On implementation completion:
  - Move the plan entry from `Active` to `Completed` in `docs/exec-plans/index.md` without moving the file.
  - Update `harness/features/feat-027.json` evidence with verification results.
  - Append final completion evidence to `harness/progress.md`.

## Open Decisions

- Should the page default to the latest budget month or expose an explicit month selector immediately?
- Should categories without a configured per-category limit but with actual spend appear in the status UI for visibility, or only configured budget categories?
- Is there an existing repository helper that already encodes the correct visibility filter for household expense aggregates, or must feat-027 define it explicitly?

## Multi-session Execution Checklist

- Owner: Orchestrator
- Current step: Plan creation and registration
- Current status: in_progress

- [ ] Step 1 owner: Orchestrator — finalize contract + aggregate approach.
- [ ] Step 2 owner: Orchestrator or delegated fixer — backend repository + handler + tests.
- [ ] Step 3 owner: Orchestrator or delegated fixer/designer — frontend hooks + tracking UI + tests.
- [ ] Step 4 owner: Orchestrator — full verification, harness evidence, plan status updates.
