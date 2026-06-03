# ExecPlan: feat-028 — Analytics Overview Dashboard

## Title

Analytics overview dashboard (fullstack)

## Purpose / Big Picture

Enable signed-in users to open `/insights`, pick monthly period, and see core expense analytics for that period without leaving app. Users will observe total spend hero metric, spend-by-day chart, top-5 category breakdown chart plus ranked list, and total expense count, all filtered by current household context and visibility rules so private expenses never leak into household analytics.

## Scope

### In Scope

**Backend (apps/worker):**
- Add dedicated analytics overview contracts for `GET /api/v1/analytics/overview?period=YYYY-MM&household_id=...`.
- Add repository aggregation support for period total spend, total expense count, daily spend series, and top-5 expense categories by spend.
- Enforce existing auth + household membership rules and visibility semantics: personal view includes caller-visible personal expenses; household view excludes private expenses from household totals.
- Resolve category analytics by stable global catalog key, not expense-local labels.
- Add integration/unit coverage for happy path, validation failure, unauthorized, forbidden, and empty-period behavior.

**Frontend (apps/web):**
- Replace placeholder `/insights` route with analytics page orchestrator.
- Add period selector defaulting to current month.
- Add hero summary cards for total spend and expense count.
- Add spend-over-time chart section and top-categories breakdown section with ranked list.
- Add typed API transport + React Query hook for analytics overview.
- Add i18n keys and component/view tests for loading, empty, success, and error states.

**Planning / Harness:**
- Register this ExecPlan in `docs/exec-plans/index.md` under `Active`.
- Mark `feat-028` as `in_progress` in harness state when plan is created.
- Add plan creation evidence in `harness/progress.md`.

### Out of Scope

- Month-over-month comparison, payer attribution, group/event breakdowns, or group analytics (`feat-029`).
- Budget data joins or budget-status dependencies; analytics is pure expense aggregation.
- CSV export even though `docs/product-specs/analytics-overview.md` mentions it.
- Arbitrary date-range analytics beyond monthly `YYYY-MM` input for MVP.
- Background jobs, precomputed rollups, or caching layers unless implementation evidence proves live query path is too slow.
- New household-selection UX patterns beyond current app conventions.

## Non-negotiable Requirements

- Plan remains self-contained: exact files, commands, contracts, and acceptance artifacts named in-place.
- Observable success must include at least one backend acceptance artifact and one frontend acceptance artifact.
- All user-facing copy must flow through i18n keys.
- Implementation must preserve `ARCHITECTURE.md` layer model: `Types -> Config -> Repo -> Service -> Runtime -> UI`.
- Routes must not contain SQL; handlers orchestrate validation/auth/mapping only; repository owns D1 aggregation queries.
- Any chart library addition must be justified in-file before install because repo currently has no chart dependency.

## Progress

- [x] (2026-05-04) Create and register ExecPlan for `feat-028`; mark harness feature `in_progress`.
- [ ] (owner: implementation agent) Confirm existing expense query/repository helpers that can be reused for analytics aggregation.
- [ ] (owner: implementation agent) Decide chart rendering approach and document dependency choice before code edits.
- [ ] (owner: implementation agent) Add backend contracts, repository aggregations, handler, route, and tests for analytics overview.
- [ ] (owner: implementation agent) Add frontend types, API function, React Query hook, and `/insights` page orchestrator.
- [ ] (owner: implementation agent) Add analytics UI components, i18n keys, and frontend tests.
- [ ] (owner: implementation agent) Run focused verification, full `./init.sh`, and capture evidence in harness artifacts.

## Surprises & Discoveries

- `apps/web/src/app/(protected)/insights/page.tsx` is still pure placeholder route, so feat-028 can replace it without migration risk.
- Repo currently has no charting library and no existing chart components. Implementation must include a short research/decision step before UI work.
- `docs/product-specs/analytics-overview.md` is broader than `harness/features/feat-028.json` and mentions group summary, month-over-month, payer attribution, and CSV export. This plan treats harness feature record as scope authority for MVP delivery.
- `feat-027` progress note says analytics can build on budget status surface, but `harness/features/feat-028.json` explicitly says budget is not dependency. Do not couple analytics to budget data.

## Decision Log

- **Decision**: Scope authority for implementation is `harness/features/feat-028.json`, with `docs/product-specs/analytics-overview.md` used only for supporting behavior details that do not expand scope.
  - Rationale: Feature record is narrower and matches current roadmap slicing; product spec includes later-phase items that belong to `feat-029` or later.
  - Date/Author: 2026-05-04 / Orchestrator

- **Decision**: Backend contract uses dedicated endpoint `GET /api/v1/analytics/overview` rather than extending `GET /api/v1/expenses/summary`.
  - Rationale: Analytics response includes multiple read models (hero metrics, daily series, top categories) and should not overload simpler summary semantics from `feat-021`.
  - Date/Author: 2026-05-04 / Orchestrator

- **Decision**: MVP period input stays monthly `YYYY-MM` only.
  - Rationale: Harness feature defines this exact API shape; broader ranges add validation and chart complexity without roadmap need.
  - Date/Author: 2026-05-04 / Orchestrator

- **Decision**: Category presentation must resolve from global static catalog by `categoryKey`.
  - Rationale: Existing product and feat records already standardized on global catalog keys from `feat-016`; analytics must not reintroduce expense-local labels.
  - Date/Author: 2026-05-04 / Orchestrator

- **Open decision placeholder**: Chart dependency choice (`recharts` vs alternative vs minimal SVG/custom rendering) must be locked after short implementation research.
  - Rationale: Repo has zero chart stack today; choice affects client rendering, bundle size, testability, and accessibility.
  - Date/Author: 2026-05-04 / Orchestrator

## Outcomes & Retrospective

- Pending implementation.
- Expected acceptance artifacts:
  - Worker integration test transcript for analytics overview endpoint.
  - Web test transcript for insights page states/components.
  - Full `./init.sh` transcript.

## Context and Orientation

- Feature record: `harness/features/feat-028.json`
- Feature dependency: `harness/features/feat-021.json`
- Product spec: `docs/product-specs/analytics-overview.md`
- Existing expense query baseline: `docs/exec-plans/plans/2026-05-04-feat-021-expense-search-filters-pagination.md`
- Placeholder route to replace: `apps/web/src/app/(protected)/insights/page.tsx`
- Web API/hook patterns: `apps/web/src/api/expense.ts`, `apps/web/src/hooks/api/use-expense.ts`, `apps/web/src/hooks/api/use-reference-data.ts`
- Web budget page as orchestration reference: `apps/web/src/views/app/budgets-page.tsx`
- Worker expense routes/summary patterns: `apps/worker/src/routes/expenses.ts`, `apps/worker/src/handlers/expenses/get-expense-summary.ts`, `apps/worker/src/db/repositories/expense-query-repository.ts`
- Worker reference catalog: `apps/worker/src/lib/reference-data/catalog.ts`
- Navigation path already exists: `apps/web/src/lib/constants/navigation.ts`, `apps/web/src/lib/constants/paths.ts`

## Standards Enforcement

### Scope Classification

- Target domain: `fullstack`
- Layer impact: `Types -> Repo -> Runtime -> UI`
- New dependency risk: likely yes on frontend for chart rendering; if added, must record why existing shadcn/React stack cannot cover chart need with acceptable effort.

### Required References and Concrete Constraints

**Shared**
- `docs/references/shared/type-naming-pattern.md`
  - Use explicit names such as `AnalyticsOverviewDTO`, `AnalyticsDailySpendPointDTO`, `AnalyticsTopCategoryDTO`, `GetAnalyticsOverviewRequest`, `GetAnalyticsOverviewResponse`.
  - Do not introduce ambiguous `Payload`, `Result`, or unlabeled data bags.

**Backend**
- `docs/references/backend/architecture-and-boundaries.md`
  - Create dedicated analytics route module/handler or extend route registry minimally; keep aggregation logic in repository layer only.
  - Avoid route-level business logic and avoid “god helper” utility files.
- `docs/references/backend/api-contract-and-validation.md`
  - Endpoint stays under `/api/v1`, validates `period` and optional `household_id` explicitly, and preserves consistent envelope semantics.
  - Do not silently coerce malformed period strings.
- `docs/references/backend/error-handling-pattern.md`
  - Use `400` for bad period/query, `401` for unauthenticated, `403` for non-member household access, `500` for unexpected failures.
- `docs/references/backend/security-and-auth-pattern.md`
  - Protected endpoint must use auth middleware and repository-backed membership checks.
  - Never trust `household_id` without verifying active membership.
- `docs/references/backend/testing-pattern.md`
  - Add endpoint coverage for happy path, validation failure, unauthorized, forbidden, and empty result path.
- `docs/references/backend/database-pattern.md`
  - No `SELECT *`; bind all params; map snake_case to camelCase explicitly; document any index need if daily aggregation query is slow.
- `docs/references/backend/cloudflare-workers.md`
  - If runtime/API behavior or limits matter for implementation, use `documentation-lookup` before relying on memory.

**Frontend**
- `docs/references/frontend/web/project-folder-structure.md`
  - Keep analytics-specific API/hooks/components within analytics feature folders; do not dump single-feature chart code in `lib`.
- `docs/references/frontend/web/component-structure-pattern.md`
  - Keep `/insights` page as orchestrator; split cards/charts/lists into feature-bounded child components with barrel exports.
- `docs/references/frontend/web/naming-and-conventions-pattern.md`
  - New files use kebab-case; hooks use `use-analytics.ts` or equivalent; imports prefer `@/...`; comments stay English.
- `docs/references/frontend/web/api-react-query-pattern.md`
  - Add endpoint in `API_ENDPOINTS`, add `ANALYTICS_KEYS`, and ensure UI reads through hooks only.
  - Avoid parallel query duplication if one overview response can power whole page.
- `docs/references/frontend/web/i18n-label-pattern.md`
  - No hardcoded labels in cards, empty states, chart legends, or errors; all new keys added consistently to locale files.

**Frontend governance from `docs/FRONTEND.md` + shadcn pre-read**
- Follow orchestrator-first composition: page handles household/period/query wiring only.
- Use shadcn primitives directly for shells and states: `Card`, `Alert`, `Skeleton`, buttons/selects, and empty/error surfaces.
- Record loading, empty, success, and error states explicitly in tests and plan evidence.
- Before implementation, read `.agents/skills/shadcn/SKILL.md`, `.agents/skills/shadcn/rules/styling.md`, `.agents/skills/shadcn/rules/forms.md`, `.agents/skills/shadcn/rules/composition.md`.

## Implementation Notes

- Mandatory patterns during implementation:
  - Keep backend response as single overview DTO so page can fetch once per period/household.
  - Reuse existing visibility-filtering semantics from expense list/summary flows rather than inventing analytics-only rules.
  - Resolve category icon/color/label from global catalog on web; backend should return category keys and numeric stats, not presentation labels.
  - Prefer additive analytics components under `apps/web/src/components/analytics/` or `apps/web/src/components/insights/` rather than overloading budget or expense components.
- Companion skills for implementation:
  - `tdd-workflow`
  - `security-review`
  - `documentation-lookup`
  - `frontend-patterns`
  - `backend-patterns`
  - `verification-loop`
- Common pitfalls to avoid:
  - Mixing private personal expenses into household totals.
  - Expanding scope into comparisons/export/group breakdowns from product spec.
  - Returning localized category names from backend instead of stable keys.
  - Creating multiple frontend queries when one overview payload is enough.
  - Adding chart dependency without documenting rationale and client-rendering constraints.

## Interfaces & Dependencies

### Planned Backend Interface

- `GET /api/v1/analytics/overview?period=YYYY-MM&household_id=<id?>`
  - Auth required.
  - `household_id` optional for personal view; required only when viewing household analytics under current UX conventions.
  - Suggested response shape:

```ts
type AnalyticsDailySpendPointDTO = {
  date: string
  totalSpendMinor: number
}

type AnalyticsTopCategoryDTO = {
  categoryKey: string
  totalSpendMinor: number
  percentOfTotal: number
  expenseCount: number
}

type AnalyticsOverviewDTO = {
  period: string
  householdId: string | null
  currencyCode: string
  totalSpendMinor: number
  expenseCount: number
  dailySpend: AnalyticsDailySpendPointDTO[]
  topCategories: AnalyticsTopCategoryDTO[]
}
```

- Candidate internal helpers:
  - `getAnalyticsOverview(db, { userId, householdId, period })`
  - `listAnalyticsDailySpend(db, filters)`
  - `listAnalyticsTopCategories(db, filters)`
  - `getAnalyticsPeriodBounds(period: string)`

### Expected Existing Dependencies

- Expense persistence/query layer from `feat-017`, `feat-019`, and `feat-021`.
- Household membership repository for access control.
- Global reference catalog from `feat-016`.
- Existing app household selection store and protected navigation shell.

## Scope Map and Dependency Checks

### Files Expected to Change

**Worker**
- `apps/worker/src/contracts/analytics-types.ts` (new preferred)
- `apps/worker/src/contracts/analytics-schemas.ts` (new preferred)
- `apps/worker/src/contracts/index.ts`
- `apps/worker/src/db/repositories/expense-query-repository.ts` and/or new `apps/worker/src/db/repositories/analytics-repository.ts`
- `apps/worker/src/handlers/analytics/get-analytics-overview.ts` (new)
- `apps/worker/src/routes/analytics.ts` (new)
- `apps/worker/src/index.ts`
- `apps/worker/test/unit/dto-analytics.spec.ts` (new preferred)
- `apps/worker/test/integration/analytics-overview.spec.ts` (new)

**Web**
- `apps/web/src/app/(protected)/insights/page.tsx`
- `apps/web/src/views/app/insights-page.tsx` (new preferred)
- `apps/web/src/components/analytics/*` or `apps/web/src/components/insights/*` (new feature-bounded components)
- `apps/web/src/components/analytics/index.ts` or equivalent barrel
- `apps/web/src/types/analytics.ts` (new)
- `apps/web/src/api/endpoints.ts`
- `apps/web/src/api/analytics.ts` (new)
- `apps/web/src/hooks/api/use-analytics.ts` (new)
- `apps/web/src/lib/i18n/locales/vi.json`
- Related tests under component/view folders
- `apps/web/package.json` if chart dependency added

**Harness / Docs**
- `docs/exec-plans/index.md`
- `harness/features/feat-028.json`
- `harness/feature_index.json`
- `harness/progress.md`
- `docs/exec-plans/tech-debt-tracker.md` only if research uncovers deferred items

### Layer Checks

- **Types**: define analytics DTOs and request schema before endpoint logic.
- **Repo**: aggregation queries and date-bound calculations stay in repository/helpers.
- **Runtime**: handler validates/authenticates/authorizes/maps repository result.
- **UI**: page consumes analytics hook and reference-category hook; child components remain presentational or feature-bounded smart components without direct API calls.

### Hard Dependency Enforcement

- Lower layers do not depend on higher layers.
- UI must not bypass runtime/service contracts.
- Data access enters through repository boundaries only.
- New dependency allowed only with explicit plan note and implementation-time rationale.

## Plan of Work (Narrative)

1. **Lock scope and chart approach first.** Before writing feature code, compare harness scope against product spec and record any deferred extras in tech debt if needed. Then run a short dependency decision step for charts. If a library is added, prefer one dependency that covers line/bar/pie needs without bespoke wrappers.

2. **Define analytics contracts before behavior.** Add worker schemas/types and matching web types for overview response. Keep backend payload numeric and presentation-agnostic except for stable identifiers like `categoryKey` and `period`.

3. **Add repository aggregation path.** Implement period-bound aggregation helpers using existing expense visibility and filter semantics. Prefer reusing `feat-021` query primitives if they already enforce personal-vs-household visibility correctly; otherwise add minimal analytics-specific repository logic. Daily series should return one row per day with spend > 0 unless UI explicitly needs zero-filled gaps.

4. **Add runtime endpoint.** Create analytics handler and route under `/api/v1/analytics/overview`, protect with auth middleware, validate `period`, verify `household_id` membership when present, and return overview DTO in standard success envelope.

5. **Add backend verification.** Create dedicated integration tests covering personal analytics, household analytics excluding private expenses, invalid period `400`, unauthenticated `401`, and forbidden non-member household access `403`. Add focused unit/schema tests for period parsing and percent calculation if helper logic exists.

6. **Add frontend transport/cache layer.** Add `API_ENDPOINTS.analytics.overview`, create `getAnalyticsOverview`, and add `ANALYTICS_KEYS.overview(filters)` hook. Reuse one overview request per page state instead of separate chart/card calls.

7. **Replace placeholder with insights orchestrator.** Create `InsightsPage` that owns current household context, period state, overview query, and reference-category query. Keep route file thin and page file focused on orchestration only.

8. **Add analytics UI components.** Create focused components for period selector, overview hero cards, daily spend chart, top-category chart, and ranked list. Use shadcn primitives for section shells and state surfaces. Resolve category icon/color/label from static catalog in UI layer.

9. **Add i18n and frontend tests.** Add analytics labels, empty states, error copy, and chart legends to locale files. Add tests for loading, empty-period result, success rendering, and API error state. If chart library makes DOM-heavy assertions brittle, validate textual summaries and key labels while keeping chart smoke assertions minimal.

10. **Close with full verification and harness evidence.** Update plan progress, feature evidence, and progress log. Run focused worker/web tests, typecheck/lint/build as needed, then run `./init.sh` from repo root before marking feature done.

## Concrete Steps (Commands)

Run from repo root unless noted.

```bash
# 1. Baseline verification before implementation
./init.sh

# 2. Inspect worker analytics tests during backend work
pnpm --filter worker test -- analytics-overview

# 3. Inspect web analytics tests during frontend work
pnpm --filter web test -- insights analytics

# 4. Re-run targeted type checks after frontend/backend edits
pnpm --filter worker typecheck
pnpm --filter web typecheck

# 5. Full verification before completion
./init.sh
```

Expected short outputs:

- `./init.sh` → lint, type-check, tests, and web build complete without failures.
- `pnpm --filter worker test -- analytics-overview` → analytics spec passes, e.g. `x passed, 0 failed`.
- `pnpm --filter web test -- insights analytics` → insights-related specs pass, e.g. `x passed, 0 failed`.
- `pnpm --filter web typecheck` / `pnpm --filter worker typecheck` → no TypeScript errors.

## Validation and Acceptance

### Happy Path

- Authenticated user opens `/insights` and sees current-month analytics for selected personal or household context.
- Backend returns total spend, expense count, non-empty daily series when expenses exist, and top 5 categories ranked by spend.
- Frontend shows hero metrics, chart sections, and ranked category list with catalog-derived icon/color/label.

### Validation / Error Paths

- Invalid `period` query such as `2026-13` or malformed string returns `400` with validation envelope.
- Unauthenticated analytics request returns `401`.
- Authenticated user requesting analytics for household without active membership returns `403`.
- Empty-period analytics returns `200` with zero totals and empty arrays, and UI renders explicit empty state rather than broken chart.

### Regression Checks

- Household analytics still exclude private expenses after feature lands.
- Existing `GET /api/v1/expenses` and `GET /api/v1/expenses/summary` behavior remains unchanged.
- `/insights` nav path still resolves from protected shell without placeholder copy.

### Acceptance Artifacts

- Backend: integration test output proving personal + household analytics behavior and visibility exclusion.
- Frontend: test output proving `/insights` loading/success/empty/error states.
- Final: `./init.sh` transcript.

## Idempotence & Recovery

- Plan creation and most code/test steps are safe to re-run.
- No DB migration is planned by default. If implementation later adds indexes for analytics performance, update this section with backup/rollback commands before applying migration.
- If chart dependency is added and later rejected, rollback is standard package manifest revert plus lockfile update.

## Artifacts and Notes

- Minimum evidence to capture when feature completes:
  - worker analytics integration test transcript
  - web insights test transcript
  - `./init.sh` transcript
  - updated `harness/features/feat-028.json` evidence string
- If implementation defers CSV export, comparisons, or performance rollups, log them in `docs/exec-plans/tech-debt-tracker.md` with feat-028 reference.

## Harness Integration

- `harness/features/feat-028.json`
  - Set status to `in_progress` on plan creation.
  - On completion, set status to `done`, update `evidence`, and refresh `updated_at`.
- `harness/feature_index.json`
  - Mirror feat-028 status changes.
- `harness/progress.md`
  - Add newest-first entry for plan creation now.
  - Add completion entry with files changed, verification commands, blockers, and next steps when implementation ends.
- `harness/session-handoff.md`
  - Update only if implementation stops mid-stream and handoff is needed.

## Open Decisions

- Which chart approach best fits repo constraints: `recharts`, another library, or custom minimal rendering?
- Should daily series API zero-fill missing days in backend or should UI pad gaps client-side?
- Should household selector behavior reuse current household store only, or expose explicit scope switch on `/insights` if no household selected?

## Risks and Blockers

- **Dependency risk**: adding first charting dependency can increase bundle/test complexity. Mitigation: short research spike, one-library max, document rationale.
- **Scope creep risk**: product spec includes post-MVP analytics items. Mitigation: keep harness feature as source of truth and log extras as tech debt.
- **Visibility correctness risk**: analytics aggregates can leak private data if repository logic diverges from feat-021 semantics. Mitigation: explicit integration tests for household exclusion.
- **Performance risk**: daily/category aggregation over thousands of rows may expose slow queries. Mitigation: start with indexed/live queries; only add index or rollup follow-up with evidence.
