# ExecPlan: feat-029 — Analytics comparisons & breakdowns

## Title

Analytics comparisons and breakdowns (fullstack)

## Purpose / Big Picture

Enable signed-in users to open `/insights` and move beyond overview-only analytics into comparison and attribution views for selected month. Users will observe month-over-month spend comparison with delta/trend indicators, payer attribution showing who contributed most to visible spend, and group spend breakdown in dedicated tab, all using same visibility and household membership rules as existing analytics so private expenses never leak into household-level metrics.

## Scope

### In Scope

**Backend (apps/worker):**
- Add dedicated comparison contracts for `GET /api/v1/analytics/comparison?period=YYYY-MM&household_id=...`.
- Add dedicated group-breakdown contracts for `GET /api/v1/analytics/groups?period=YYYY-MM&household_id=...`.
- Extend repository aggregation support for current-month vs previous-month totals, total delta, category deltas keyed by global static category catalog, payer attribution totals/percentages, and per-group spend aggregation for selected month.
- Reuse existing auth, membership, and visibility rules from analytics overview so household analytics exclude private expenses while personal analytics remain scoped to caller-visible personal expenses.
- Add backend tests for happy path, validation failure, unauthorized, forbidden, and empty-result behavior for both endpoints.

**Frontend (apps/web):**
- Extend `/insights` page orchestration to load comparison and groups datasets for selected month and selected household context.
- Add month-over-month comparison section with current total, previous total, delta badge, and trend direction affordance.
- Add payer attribution chart/list showing visible spend share by member.
- Add Groups tab showing per-group spend totals for selected month.
- Add typed API transport + React Query hooks for comparison and group breakdown endpoints.
- Add i18n keys and page/component tests for loading, empty, success, and error states across new sections.

**Planning / Harness:**
- Register this ExecPlan in `docs/exec-plans/index.md` under `Active`.
- Mark `feat-029` as `in_progress` in harness state when plan is created.
- Add plan creation evidence in `harness/progress.md`.

### Out of Scope

- CSV export from `docs/product-specs/analytics-overview.md`.
- Arbitrary date-range comparisons beyond monthly `YYYY-MM` input.
- Trend forecasting, health scores, caching layers, background rollups, or precomputation jobs.
- New household-selection UX patterns beyond current `/insights` conventions.
- Changes to existing `GET /api/v1/analytics/overview` payload except minimal shared helper extraction needed to support new endpoints.
- Budget joins or threshold status coupling.
- Group-detail analytics beyond selected-month spend totals for current dashboard tab.

## Non-negotiable Requirements

- Plan remains self-contained: exact files, commands, contracts, and acceptance artifacts named in-place.
- Observable success must include backend and frontend acceptance artifacts.
- All user-facing copy must flow through i18n keys.
- Implementation must preserve `ARCHITECTURE.md` layer model: `Types -> Config -> Repo -> Service -> Runtime -> UI`.
- Routes must not contain SQL; handlers orchestrate validation/auth/mapping only; repository owns D1 aggregation queries.
- UI must not call API modules directly; page/components consume React Query hooks only.
- New aggregation logic must preserve current household visibility semantics from feat-028; private expenses must not appear in household comparison, payer attribution, or group totals.
- Category presentation must stay keyed by global static catalog keys; backend must not emit localized labels or colors.

## Progress

- [x] (2026-05-05) Create and register ExecPlan for `feat-029`; mark harness feature `in_progress`.
- [ ] (owner: implementation agent) Confirm existing `expense-query-repository` helpers and decide whether new analytics-specific repository module is warranted.
- [ ] (owner: implementation agent) Add worker contracts/schemas for comparison and groups endpoints, plus shared period-range helpers if needed.
- [ ] (owner: implementation agent) Add repository aggregations and backend handlers/routes for month comparison, payer attribution, and per-group totals.
- [ ] (owner: implementation agent) Add backend tests for comparison/groups endpoints including visibility and membership edge cases.
- [ ] (owner: implementation agent) Extend web types/API/hooks and insights page orchestration for parallel comparison + groups data loading.
- [ ] (owner: implementation agent) Add comparison, payer attribution, and group-tab UI components with i18n coverage.
- [ ] (owner: implementation agent) Add/extend frontend tests for new loading, empty, success, and error states.
- [ ] (owner: implementation agent) Run focused verification, full `./init.sh`, and capture evidence in harness artifacts.

## Surprises & Discoveries

- `feat-028` already created analytics shell files: `apps/worker/src/contracts/analytics-types.ts`, `apps/worker/src/contracts/analytics-schemas.ts`, `apps/worker/src/routes/analytics.ts`, `apps/worker/src/handlers/analytics/get-analytics-overview.ts`, `apps/web/src/api/analytics.ts`, `apps/web/src/hooks/api/use-analytics.ts`, `apps/web/src/types/analytics.ts`, `apps/web/src/views/app/insights-page.tsx`, and `apps/web/src/components/analytics/*`. `feat-029` should extend this surface rather than invent parallel structure.
- Existing `/insights` page already owns household + period orchestration and current analytics loading/error/empty states, so new work can stay additive with same route and state model.
- `docs/product-specs/analytics-overview.md` is broader than harness slice and mentions CSV export. Harness feature record remains scope authority.
- GitNexus query for analytics flow returned no ranked processes in current index query, so plan relies on direct file inspection plus harness continuity for current architecture map.

## Decision Log

- **Decision**: Scope authority for implementation is `harness/features/feat-029.json`, with `docs/product-specs/analytics-overview.md` used only for supporting behavior details that do not expand scope.
  - Rationale: Feature record names exact new endpoints and UI surfaces; product spec includes CSV export and broader future analytics.
  - Date/Author: 2026-05-05 / Orchestrator

- **Decision**: New analytics behavior ships as additive endpoints `GET /api/v1/analytics/comparison` and `GET /api/v1/analytics/groups` instead of expanding `GET /api/v1/analytics/overview`.
  - Rationale: Harness feature record already defines dedicated endpoint split; keeping separate read models avoids overloading overview contract and allows incremental UI fetching/testing.
  - Date/Author: 2026-05-05 / Orchestrator

- **Decision**: Month-over-month comparison uses selected `period` as current month and derives previous month server-side.
  - Rationale: Prevents client-side date math drift and keeps comparison contract deterministic.
  - Date/Author: 2026-05-05 / Orchestrator

- **Decision**: Payer attribution and group totals follow same visibility boundary as overview endpoint.
  - Rationale: Users must not see private household-member spend surfaced indirectly through attribution or group sums.
  - Date/Author: 2026-05-05 / Orchestrator

- **Open decision placeholder**: Whether comparison and groups queries should be fetched in parallel as separate hooks or combined behind page-level coordination with shared enabled conditions.
  - Rationale: Existing `InsightsPage` already performs one query; adding two more can create duplicate loading states and inconsistent partial rendering if not designed deliberately.
  - Date/Author: 2026-05-05 / Orchestrator

## Outcomes & Retrospective

- Pending implementation.
- Expected acceptance artifacts:
  - Worker integration test transcript for `analytics-comparison` and `analytics-groups` endpoints.
  - Web test transcript covering comparison section, payer attribution, and groups tab rendering/states.
  - Full `./init.sh` transcript.

## Context and Orientation

- Feature record: `harness/features/feat-029.json`
- Feature dependencies: `harness/features/feat-023.json`, `harness/features/feat-028.json`
- Product spec: `docs/product-specs/analytics-overview.md`
- Existing analytics ExecPlan: `docs/exec-plans/plans/2026-05-04-feat-028-analytics-overview-dashboard.md`
- Worker analytics route baseline: `apps/worker/src/routes/analytics.ts`
- Worker analytics handler baseline: `apps/worker/src/handlers/analytics/get-analytics-overview.ts`
- Worker analytics contract baseline: `apps/worker/src/contracts/analytics-types.ts`, `apps/worker/src/contracts/analytics-schemas.ts`
- Existing aggregation layer: `apps/worker/src/db/repositories/expense-query-repository.ts`
- Existing web analytics types/API/hooks: `apps/web/src/types/analytics.ts`, `apps/web/src/api/analytics.ts`, `apps/web/src/hooks/api/use-analytics.ts`
- Existing insights page orchestration: `apps/web/src/views/app/insights-page.tsx`
- Existing analytics components: `apps/web/src/components/analytics/index.ts`, `apps/web/src/components/analytics/insights-summary-cards.tsx`, `apps/web/src/components/analytics/insights-charts-section.tsx`, `apps/web/src/components/analytics/insights-loading-state.tsx`
- Group data domain already exists from feat-022/023: worker `apps/worker/src/db/repositories/expense-group-repository.ts`; web `apps/web/src/api/group.ts`, `apps/web/src/hooks/api/use-groups.ts`

## Standards Enforcement

### Scope Classification

- Target domain: `fullstack`
- Layer impact: `Types -> Repo -> Runtime -> UI`
- New dependency risk: none expected if current chart stack from feat-028 already covers new visualizations; if implementation adds tab, chart, or formatting dependency, record justification first.

### Required References and Concrete Constraints

**Shared**
- `docs/references/shared/type-naming-pattern.md`
  - Use explicit names like `AnalyticsComparisonDTO`, `AnalyticsComparisonResponse`, `AnalyticsPayerAttributionDTO`, `AnalyticsGroupSpendDTO`, `AnalyticsGroupsResponse`, `AnalyticsComparisonParams` or `GetAnalyticsComparisonRequest` where layer-appropriate.
  - Do not introduce ambiguous `Result`, `Payload`, `Metrics`, or unlabeled nested objects.

**Backend**
- `docs/references/backend/architecture-and-boundaries.md`
  - Keep endpoint definitions in `src/routes/analytics.ts`, orchestration in `src/handlers/analytics/*`, and SQL/aggregation in repository layer.
  - Avoid embedding month math, permission checks, and aggregation mapping together in route files.
- `docs/references/backend/api-contract-and-validation.md`
  - Keep endpoints under `/api/v1`; validate `period` and optional `household_id` explicitly; preserve camelCase response fields.
  - Do not silently coerce malformed periods or missing IDs.
- `docs/references/backend/error-handling-pattern.md`
  - Use `400` for bad query input, `401` for missing auth, `403` for non-member household access, `404` only if explicit dependent entity lookup requires it, `500` for unexpected failures.
- `docs/references/backend/security-and-auth-pattern.md`
  - Protected endpoints must pass auth middleware and verify household membership before any household aggregation runs.
  - Never trust `household_id`, `payer_user_id`, or group joins from client without repository-enforced visibility boundaries.
- `docs/references/backend/testing-pattern.md`
  - Add tests for both new endpoints: happy path, validation failure, unauthorized, forbidden, and empty results; include regression coverage that private expenses are excluded from household attribution and group totals.
- `docs/references/backend/database-pattern.md`
  - No `SELECT *`; bind all params; keep snake_case-to-camelCase mapping explicit; avoid repeated per-payer/per-group queries inside loops; document index need if month comparison queries scan too broadly.
- `docs/references/backend/cloudflare-workers.md`
  - If implementation touches Worker runtime limits or D1 behavior assumptions for aggregation, use `documentation-lookup` before locking behavior.

**Frontend**
- `docs/references/frontend/web/project-folder-structure.md`
  - Keep analytics feature transport in `src/api/analytics.ts`, hooks in `src/hooks/api/use-analytics.ts`, and new UI under `src/components/analytics/*`; do not push single-feature logic into `src/lib`.
- `docs/references/frontend/web/component-structure-pattern.md`
  - Keep `InsightsPage` as orchestrator only; split comparison card, payer attribution, groups tab/table/chart, and state helpers into feature-bounded child components with barrel exports.
  - Split files early if any analytics component exceeds ~200 lines.
- `docs/references/frontend/web/naming-and-conventions-pattern.md`
  - Use kebab-case file names, named exports, `ANALYTICS_KEYS` query keys, `@/...` imports, and English code comments only.
- `docs/references/frontend/web/api-react-query-pattern.md`
  - Extend `API_ENDPOINTS.analytics`, add query-key helpers for comparison and groups, and keep UI consumption hook-only.
  - Check whether comparison/groups data can share existing query params/key structures before creating redundant state.
- `docs/references/frontend/web/i18n-label-pattern.md`
  - No hardcoded labels for tabs, trend badges, empty states, legends, or error copy; add synchronized locale keys.

**Frontend governance from `docs/FRONTEND.md` + shadcn pre-read**
- Follow orchestrator-first composition: route/page own selected household, period, and enabled-query state only.
- Use shadcn primitives directly for tabs, cards, alerts, skeletons, and empty/error surfaces.
- Record loading, empty, success, and error states explicitly in tests and plan evidence.
- Before implementation, read `.agents/skills/shadcn/SKILL.md`, `.agents/skills/shadcn/rules/styling.md`, `.agents/skills/shadcn/rules/forms.md`, `.agents/skills/shadcn/rules/composition.md`.

## Implementation Notes

- Mandatory patterns during implementation:
  - Reuse existing period selection and selected-household orchestration from `InsightsPage`; do not add parallel store state for analytics filters.
  - Keep backend payloads presentation-agnostic: stable ids/keys, totals, percentages, and deltas only.
  - Resolve payer labels from existing household/member data already available to UI or from explicit response fields only if required by current page contract; avoid hidden extra fetches unless justified.
  - Prefer extending existing analytics contract files over creating second naming system for analytics domain.
  - Treat `groupId = null` / ungrouped expenses explicitly during design step; if excluded from endpoint by contract, document that choice in Decision Log.
- Companion skills for implementation:
  - `tdd-workflow`
  - `security-review`
  - `documentation-lookup`
  - `frontend-patterns`
  - `backend-patterns`
  - `verification-loop`
- Common pitfalls to avoid:
  - Counting private expenses in household comparison deltas.
  - Returning group names or payer labels from unstable/localized sources when stable identifiers should drive mapping.
  - Creating three independent page-level loading spinners that flicker and fight each other.
  - Building group analytics by bypassing existing repository boundaries.
  - Expanding scope into export, forecasting, or arbitrary ranges.

## Interfaces & Dependencies

### Planned Backend Interfaces

- `GET /api/v1/analytics/comparison?period=YYYY-MM&household_id=<id?>`
  - Auth required.
  - `household_id` optional for personal analytics; when present, caller must be active household member.
  - Suggested response shape:

```ts
type AnalyticsPeriodSpendDTO = {
  period: string
  totalSpendMinor: number
  expenseCount: number
}

type AnalyticsCategoryDeltaDTO = {
  categoryKey: ReferenceCategoryKey
  currentTotalSpendMinor: number
  previousTotalSpendMinor: number
  deltaSpendMinor: number
  deltaPercent: number | null
}

type AnalyticsPayerAttributionDTO = {
  payerUserId: string
  totalSpendMinor: number
  percentOfTotal: number
  expenseCount: number
}

type AnalyticsComparisonDTO = {
  householdId: string | null
  currencyCode: string
  currentPeriod: AnalyticsPeriodSpendDTO
  previousPeriod: AnalyticsPeriodSpendDTO
  totalDeltaSpendMinor: number
  totalDeltaPercent: number | null
  topCategoryDeltas: AnalyticsCategoryDeltaDTO[]
  payerAttribution: AnalyticsPayerAttributionDTO[]
}
```

- `GET /api/v1/analytics/groups?period=YYYY-MM&household_id=<id?>`
  - Auth required.
  - For household view, same active membership requirement.
  - Suggested response shape:

```ts
type AnalyticsGroupSpendDTO = {
  groupId: string
  groupName: string
  totalSpendMinor: number
  expenseCount: number
  percentOfTotal: number
}

type AnalyticsGroupsResponse = {
  period: string
  householdId: string | null
  currencyCode: string
  totalGroupedSpendMinor: number
  groups: AnalyticsGroupSpendDTO[]
}
```

- Candidate internal helpers:
  - `getAnalyticsComparison(db, { userId, householdId, period, currentPeriodStart, currentPeriodEnd, previousPeriodStart, previousPeriodEnd })`
  - `listAnalyticsPayerAttribution(db, filters)`
  - `listAnalyticsCategoryDeltas(db, filters)`
  - `getAnalyticsGroups(db, { userId, householdId, period, periodStart, periodEnd })`
  - shared period helper for current/previous month bounds

### Expected Existing Dependencies

- Expense aggregation/query layer from feat-021 and feat-028.
- Group assignment/group summary domain from feat-022 and feat-023.
- Household membership repository for access control.
- Global reference catalog from feat-016.
- Existing `/insights` route and analytics components from feat-028.

## Scope Map and Dependency Checks

### Files Expected to Change

**Worker**
- `apps/worker/src/contracts/analytics-types.ts`
- `apps/worker/src/contracts/analytics-schemas.ts`
- `apps/worker/src/contracts/index.ts`
- `apps/worker/src/db/repositories/expense-query-repository.ts` and/or extracted `apps/worker/src/db/repositories/analytics-repository.ts` if current file becomes too mixed
- `apps/worker/src/handlers/analytics/get-analytics-comparison.ts` (new)
- `apps/worker/src/handlers/analytics/get-analytics-groups.ts` (new)
- `apps/worker/src/handlers/analytics/get-analytics-overview.ts` only if shared helper extraction reduces duplication
- `apps/worker/src/routes/analytics.ts`
- `apps/worker/src/index.ts` only if route registration shape changes
- `apps/worker/test/unit/dto-analytics.spec.ts`
- `apps/worker/test/integration/analytics-comparison.spec.ts` (new)
- `apps/worker/test/integration/analytics-groups.spec.ts` (new)

**Web**
- `apps/web/src/types/analytics.ts`
- `apps/web/src/api/endpoints.ts`
- `apps/web/src/api/analytics.ts`
- `apps/web/src/hooks/api/use-analytics.ts`
- `apps/web/src/views/app/insights-page.tsx`
- `apps/web/src/views/app/insights-page.test.tsx`
- `apps/web/src/components/analytics/*` (new comparison/attribution/groups child components plus barrel updates)
- `apps/web/src/lib/i18n/locales/vi.json`
- Other locale files if present

**Harness / Docs**
- `docs/exec-plans/plans/2026-05-05-feat-029-analytics-comparisons-breakdowns.md`
- `docs/exec-plans/index.md`
- `harness/features/feat-029.json`
- `harness/feature_index.json`
- `harness/progress.md`
- `docs/exec-plans/tech-debt-tracker.md` only if deferred follow-up discovered

### Layer Checks

- **Types**: define comparison/groups DTOs and query schemas before handler work.
- **Repo**: own month-window math helpers and aggregation queries in repository/helper layer, not in route.
- **Runtime**: handlers validate, authenticate, authorize, derive period bounds, and map repository results to contracts.
- **UI**: `InsightsPage` coordinates query params and state; child analytics components remain presentational or feature-bounded smart components without direct HTTP calls.

### Hard Dependency Enforcement

- Lower layers do not depend on higher layers.
- UI must not bypass runtime/service contracts.
- Data access enters through repository boundaries only.
- New dependency allowed only with explicit plan note and implementation-time rationale.

## Plan of Work (Narrative)

1. **Lock response boundaries first.** Compare `feat-029` feature record with existing `feat-028` contracts and decide exact DTOs for comparison and group breakdown endpoints before changing repository code. Keep contracts additive and avoid mutating overview payload unless shared helper extraction is strictly needed.

2. **Normalize month math and visibility reuse.** Extract or reuse helper logic for current/previous month UTC bounds and shared household-membership validation so comparison and groups handlers do not each invent date/permission logic.

3. **Add repository aggregation path.** Extend analytics aggregation in repository layer to compute: current/previous totals, top category deltas by `categoryKey`, payer attribution totals/percentages, and grouped expense totals by `groupId`. Reuse existing visibility predicates from overview/expense summary flows. If `expense-query-repository.ts` becomes too broad, extract analytics-specific repository file with same boundaries.

4. **Add runtime endpoints.** Create `get-analytics-comparison.ts` and `get-analytics-groups.ts`, validate query params via schema, enforce auth + membership checks, derive period windows, and return DTOs under standard success envelope. Extend `apps/worker/src/routes/analytics.ts` with protected routes.

5. **Add backend verification.** Add unit/schema coverage for new query shapes and integration tests for personal analytics, household analytics excluding private expenses, invalid period `400`, unauthenticated `401`, forbidden non-member `403`, and empty groups/attribution behavior when no expenses exist for month.

6. **Extend frontend transport/cache layer.** Add `API_ENDPOINTS.analytics.comparison` and `.groups`, extend `apps/web/src/api/analytics.ts`, and add `ANALYTICS_KEYS.comparison(params)` plus `ANALYTICS_KEYS.groups(params)` in `use-analytics.ts`. Maintain hook-level typing and plain-data return.

7. **Evolve `/insights` orchestration carefully.** Keep `InsightsPage` route orchestration thin. Add shared `analyticsParams` once, then coordinate overview/comparison/groups queries with same `enabled` condition. Decide whether groups tab data is always fetched or fetched lazily when tab opens; record choice in Decision Log during implementation.

8. **Add comparison + attribution UI.** Introduce focused child components under `apps/web/src/components/analytics/` for comparison summary, trend badge, payer attribution panel, and groups tab content. Reuse current currency formatter and shadcn card shells. If current chart stack from feat-028 can render payer bars/group bars, reuse it rather than adding dependency.

9. **Add i18n and frontend tests.** Extend locale keys for section titles, delta labels, increase/decrease/no-change states, payer attribution labels, groups tab labels, and empty/error messaging. Update `insights-page.test.tsx` plus focused component tests to cover loading, empty, partial/combined success, and error states.

10. **Close with harness evidence and full verification.** Update plan progress, `harness/features/feat-029.json`, `harness/feature_index.json`, and `harness/progress.md`. Run focused tests/typechecks first, then full `./init.sh`. Only mark feature done after evidence shows backend and frontend acceptance paths passing.

## Concrete Steps (Commands)

Run from repo root unless noted.

```bash
# 1. Baseline verification before implementation
./init.sh

# 2. Focused worker tests during backend work
pnpm --filter worker test -- analytics-comparison analytics-groups analytics-overview

# 3. Focused web tests during frontend work
pnpm --filter web test -- insights-page analytics

# 4. Re-run type checks after edits
pnpm --filter worker typecheck
pnpm --filter web typecheck

# 5. Final full verification
./init.sh
```

Expected short outputs:

- `./init.sh` → install/harness/lint/typecheck/tests/build complete with no failures.
- `pnpm --filter worker test -- analytics-comparison analytics-groups analytics-overview` → new analytics suites pass, `0 failed`.
- `pnpm --filter web test -- insights-page analytics` → updated insights tests pass, `0 failed`.
- `pnpm --filter worker typecheck` / `pnpm --filter web typecheck` → complete without TypeScript errors.

## Validation and Acceptance

### Happy Path

- Household insights page shows:
  - existing overview cards/charts,
  - comparison section with current/previous totals and delta,
  - payer attribution ordered by highest spend,
  - groups tab with per-group totals for selected month.
- Worker integration test proves household response excludes private expenses from totals and payer attribution.
- Web test proves selected period change refreshes comparison/groups data using same params shape as overview.

### Validation / Error Paths

- `GET /api/v1/analytics/comparison?period=2026-13&household_id=...` returns `400` with validation error.
- `GET /api/v1/analytics/groups?period=bad` returns `400` with validation error.
- When worker returns API error, `/insights` shows error surface instead of partial crash.

### Unauthorized / Forbidden

- Unauthenticated requests to either new endpoint return `401`.
- Authenticated non-member household access returns `403`.

### Empty / Regression Checks

- Month with zero visible expenses returns zero totals and empty arrays, and UI shows defined empty state instead of broken chart.
- Regression: household-private expenses stay excluded from comparison delta, payer attribution, and group totals.
- Regression: overview endpoint behavior remains unchanged for feat-028 tests unless explicitly updated for harmless shared helper extraction.

### Acceptance Artifacts

- Backend artifact: passing `apps/worker/test/integration/analytics-comparison.spec.ts` and `apps/worker/test/integration/analytics-groups.spec.ts` transcript.
- Frontend artifact: passing `apps/web/src/views/app/insights-page.test.tsx` transcript covering comparison/groups states.
- Workspace artifact: passing `./init.sh` transcript.

## Idempotence & Recovery

- Plan creation and most implementation steps are safe to re-run.
- No schema migration expected for feat-029. If implementation discovers missing index need, stop and record explicit migration/rollback plan before applying DB changes.
- If repository extraction from `expense-query-repository.ts` starts causing broad diff churn, back out extraction and keep changes additive in existing file; do not refactor unrelated query code.
- If frontend query coordination causes unstable partial rendering, disable new sections behind same shared `enabled` condition temporarily and restore once tests pass; do not ship inconsistent stale-period panels.

## Artifacts and Notes

- Required evidence snippets at completion:
  - worker test output summary (`passed/failed` counts),
  - web test output summary,
  - final `./init.sh` success summary,
  - harness feature evidence string summarizing exact commands.
- If deferred work emerges (for example ungrouped-expense treatment, performance indexing, or lazy-tab loading follow-up), record it in `docs/exec-plans/tech-debt-tracker.md` instead of expanding feat-029 scope silently.

## Interfaces & Dependencies

- Internal modules expected during implementation:
  - `apps/worker/src/db/repositories/household-membership-repository.ts` for access control.
  - `apps/worker/src/lib/reference-data/catalog.ts` for category key semantics.
  - `apps/web/src/hooks/api/use-reference-data.ts` for category labels/icons/colors.
  - existing household selection store `apps/web/src/stores/household.store.ts`.
- External libraries already in play:
  - React Query for caching/query coordination.
  - existing analytics chart stack from feat-028 for charts.
- No new service dependencies expected.
