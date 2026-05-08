# ExecPlan: feat-044 — Analytics export path and product hardening follow-up

## Title

Analytics export path and product hardening follow-up (fullstack)

## Purpose / Big Picture

Enable signed-in users to export a truthful CSV snapshot from `/insights` for selected month and household context, so analytics can be used for reporting outside app without re-entering or screen-copying data. Users will observe an explicit export action, a downloaded CSV that matches current analytics visibility rules, and a more trustworthy analytics surface with clearer failure handling around partial/empty/error states.

## Scope

### In Scope

**Backend (`apps/worker`):**
- Add dedicated authenticated analytics export endpoint under `/api/v1/analytics` for monthly CSV export using same `period` and optional `household_id` query shape as current analytics endpoints.
- Reuse current membership and visibility rules so household exports never include private expenses and personal exports remain scoped to caller-visible data.
- Produce CSV output that covers current analytics surface truthfully: overview aggregates, comparison aggregates, group breakdown aggregates, and supporting raw expense rows for same selected period/context.
- Add integration coverage for happy path, validation failure, unauthorized, forbidden, and empty-period export behavior, including response headers.

**Frontend (`apps/web`):**
- Add explicit export action to `/insights` using current selected period and household context.
- Add bounded export/download client logic without bypassing current typed API boundary.
- Harden `/insights` user experience where current three-query surface is brittle: keep existing analytics sections truthful, improve export gating/messages for loading, empty, and partial-failure conditions, and avoid offering export when page state cannot produce a reliable snapshot.
- Add i18n keys and targeted page/component tests for export states and hardened analytics messaging.

**Planning / Harness:**
- Register this ExecPlan in `docs/exec-plans/index.md` under `Active`.
- Mark `feat-044` as `in_progress` in harness state when plan is created.
- Add plan creation evidence in `harness/progress.md`.

### Out of Scope

- Forecasting, analytics health scores, arbitrary date ranges, background rollups, caching, or async export jobs.
- New dashboard surfaces outside `/insights`.
- PDF/XLSX export, zip bundles, or multi-format export selector.
- Reworking analytics architecture into a new service layer unless implementation reveals a focused need.
- Changes to feat-045 home dashboard unification beyond preserving future compatibility.
- Broad redesign of analytics charts or household-selection UX unrelated to export/hardening.

## Non-negotiable Requirements

- Plan remains self-contained: exact files, commands, contracts, and acceptance artifacts named in-place.
- Observable success must include backend and frontend acceptance artifacts plus one downloaded-file assertion.
- All user-facing copy must flow through i18n keys.
- Implementation must preserve `ARCHITECTURE.md` layer model: `Types -> Config -> Repo -> Service -> Runtime -> UI`.
- Routes must not contain SQL; handlers orchestrate validation/auth/serialization only; repository owns D1 reads.
- Export must preserve current analytics visibility and membership boundaries exactly; no private household-member spend may leak indirectly through raw rows or aggregates.
- CSV must stay spreadsheet-friendly: numeric columns remain machine-readable values, not localized currency-formatted strings.

## Progress

- [x] (2026-05-08) Create and register ExecPlan for `feat-044`; mark harness feature `in_progress`.
- [ ] (owner: implementation agent) Lock export contract shape and filename strategy, including whether one CSV contains multi-section rows plus raw expenses.
- [ ] (owner: implementation agent) Add backend schema/handler/repository support for export query and CSV serialization.
- [ ] (owner: implementation agent) Add worker integration coverage for export headers, auth, validation, visibility, and empty-period behavior.
- [ ] (owner: implementation agent) Add web export trigger, download helper, and truthful gating/error UX on `/insights`.
- [ ] (owner: implementation agent) Add or update i18n keys and frontend tests for export availability and hardened analytics states.
- [ ] (owner: implementation agent) Run focused verification, full `./init.sh`, and capture evidence in harness artifacts.

## Surprises & Discoveries

- Current analytics stack already spans three endpoints (`overview`, `comparison`, `groups`) and `/insights` loads all three in parallel. Export can extend this existing slice instead of inventing a second analytics surface.
- No export endpoint, browser download utility, or analytics export UI exists today.
- Product spec explicitly requires CSV snapshot export and says export should contain both aggregates and raw rows subject to visibility.
- Existing analytics page currently blocks whole-page success on any one query failure; feat-044 should harden this enough that export remains trustworthy and clearly gated.
- `docs/exec-plans/index.md` still lists old active plans for completed features (`feat-041`, `feat-029`). Keep update surgical for this request; do not clean unrelated plan-index drift here.

## Decision Log

- **Decision**: Scope authority for implementation is `harness/features/feat-044.json`, with `docs/product-specs/analytics-overview.md` used to fill exact export expectations that align with the feature description.
  - Rationale: Harness feature defines roadmap slice; product spec adds precise CSV acceptance language without forcing unrelated future analytics scope.
  - Date/Author: 2026-05-08 / Orchestrator

- **Decision**: Export ships as additive endpoint `GET /api/v1/analytics/export` rather than extending existing JSON endpoints with alternate response mode.
  - Rationale: Keeps current overview/comparison/groups contracts stable and avoids mixing CSV transport concerns into typed JSON endpoints.
  - Date/Author: 2026-05-08 / Orchestrator

- **Decision**: First pass export should be synchronous CSV download for selected month only.
  - Rationale: Current roadmap asks for deliberate export path, not background jobs or large-report orchestration.
  - Date/Author: 2026-05-08 / Orchestrator

- **Decision**: CSV should include both analytics aggregates and raw expense rows for selected context, encoded in one deterministic flat file format.
  - Rationale: Product spec says export contains same aggregates and raw rows as presented; one file keeps UX simple and avoids multi-file ambiguity.
  - Date/Author: 2026-05-08 / Orchestrator

- **Open decision placeholder**: Exact CSV row model must be locked during implementation (`section`-tagged flat rows vs other single-file encoding) before tests and serializer finalize.
  - Rationale: One-file requirement is clear, but implementation should choose smallest readable format that stays spreadsheet-safe and testable.
  - Date/Author: 2026-05-08 / Orchestrator

## Outcomes & Retrospective

- Pending implementation.
- Expected acceptance artifacts:
  - Worker integration test transcript for `GET /api/v1/analytics/export`.
  - Web test transcript covering export button availability/gating and hardened analytics states.
  - Evidence that downloaded CSV content/header matches selected month and context.
  - Full `./init.sh` transcript.

## Context and Orientation

- Feature record: `harness/features/feat-044.json`
- Blocking successor feature: `harness/features/feat-045.json`
- Product spec: `docs/product-specs/analytics-overview.md`
- Existing analytics plans: `docs/exec-plans/plans/2026-05-04-feat-028-analytics-overview-dashboard.md`, `docs/exec-plans/plans/2026-05-05-feat-029-analytics-comparisons-breakdowns.md`
- Worker route baseline: `apps/worker/src/routes/analytics.ts`
- Worker handlers baseline: `apps/worker/src/handlers/analytics/get-analytics-overview.ts`, `apps/worker/src/handlers/analytics/get-analytics-comparison.ts`, `apps/worker/src/handlers/analytics/get-analytics-groups.ts`, `apps/worker/src/handlers/analytics/period.ts`
- Worker contracts baseline: `apps/worker/src/contracts/analytics-schemas.ts`, `apps/worker/src/contracts/analytics-types.ts`, `apps/worker/src/contracts/index.ts`
- Worker aggregation layer: `apps/worker/src/db/repositories/expense-query-repository.ts`
- Web route/page baseline: `apps/web/src/app/(protected)/insights/page.tsx`, `apps/web/src/views/app/insights-page.tsx`
- Web analytics components: `apps/web/src/components/analytics/index.ts`, `apps/web/src/components/analytics/insights-summary-cards.tsx`, `apps/web/src/components/analytics/insights-comparison-section.tsx`, `apps/web/src/components/analytics/insights-charts-section.tsx`, `apps/web/src/components/analytics/insights-groups-section.tsx`, `apps/web/src/components/analytics/insights-loading-state.tsx`
- Web analytics transport/types: `apps/web/src/api/endpoints.ts`, `apps/web/src/api/analytics.ts`, `apps/web/src/hooks/api/use-analytics.ts`, `apps/web/src/types/analytics.ts`
- Supporting web dependencies: `apps/web/src/hooks/api/use-reference-data.ts`, `apps/web/src/lib/reference-data/labels.ts`, `apps/web/src/stores/household.store.ts`, `apps/web/src/lib/i18n/locales/vi.json`
- Existing tests: `apps/worker/test/integration/analytics-overview.spec.ts`, `apps/worker/test/unit/dto-analytics.spec.ts`, `apps/web/src/views/app/insights-page.test.tsx`

## Standards Enforcement

### Scope Classification

- Target domain: `fullstack`
- Layer impact: `Types -> Repo -> Runtime -> UI`
- New dependency risk: none expected; if implementation adds CSV helper library, document why built-in string serialization is insufficient.

### Required References and Concrete Constraints

**Shared**
- `docs/references/shared/type-naming-pattern.md`
  - Use explicit names such as `ExportAnalyticsRequest`, `AnalyticsExportRowDTO`, or `AnalyticsExportResponse` only where type boundary truly exists.
  - Avoid ambiguous names like `ExportPayload`, `CsvResult`, or unlabeled row bags.

**Backend**
- `docs/references/backend/architecture-and-boundaries.md`
  - Keep endpoint definition in `src/routes/analytics.ts`, orchestration in new handler file under `src/handlers/analytics/`, and data reads/row shaping in repository/helper layer.
  - Do not embed CSV-building business logic inside route definitions.
- `docs/references/backend/api-contract-and-validation.md`
  - Endpoint stays under `/api/v1`; validate `period` and optional `household_id` explicitly; do not silently coerce malformed periods.
  - Preserve existing JSON error envelope behavior for failure responses even if success returns `text/csv`.
- `docs/references/backend/error-handling-pattern.md`
  - Use `400` for bad query input, `401` for missing auth, `403` for non-member household access, `500` for unexpected failures.
- `docs/references/backend/security-and-auth-pattern.md`
  - Protected export endpoint must verify auth and membership before any aggregation or row export runs.
  - Never trust `household_id`; raw row export must still enforce visibility exclusions.
- `docs/references/backend/testing-pattern.md`
  - Add endpoint coverage for happy path, validation failure, unauthorized, forbidden, and empty result export.
  - Include regression coverage that private expenses do not appear in household CSV.
- `docs/references/backend/database-pattern.md`
  - No `SELECT *`; bind all params; keep snake_case-to-camelCase mapping explicit; avoid repeated queries inside loops when assembling export sections.
  - If raw-row export needs new query shape, keep ordering stable and document index needs if query becomes heavy.
- `docs/references/backend/cloudflare-workers.md`
  - If implementation depends on Worker response/body limits or stream behavior, verify current Cloudflare docs before locking serializer approach.

**Frontend**
- `docs/references/frontend/project-folder-structure.md`
  - Keep analytics export transport in analytics files (`src/api/analytics.ts`, `src/hooks/api/use-analytics.ts`) and feature UI under `src/components/analytics/*`.
  - Do not push one-feature export logic into generic `lib` unless it is clearly reusable beyond analytics.
- `docs/references/frontend/component-structure-pattern.md`
  - Keep `InsightsPage` as orchestrator only; export button/banner/state helpers should live in bounded analytics child components if page grows too large.
  - Maintain barrel exports for public analytics components.
- `docs/references/frontend/naming-and-conventions-pattern.md`
  - Use kebab-case file names, named exports, `@/...` imports, English comments only, and consolidated imports per path.
- `docs/references/frontend/api-react-query-pattern.md`
  - Add export endpoint to `API_ENDPOINTS.analytics`; keep API layer HTTP-only.
  - Check whether export should be direct API helper or hook-backed mutation; avoid duplicate data queries if current page state already proves export eligibility.
- `docs/references/frontend/i18n-label-pattern.md`
  - No hardcoded labels for export CTA, disabled explanation, error states, or CSV-related helper text; add synchronized locale keys.

**Frontend governance from `docs/FRONTEND.md` + shadcn pre-read**
- Follow orchestrator-first composition: route/page owns period + household + query wiring only.
- Use shadcn primitives directly for cards, alerts, buttons, skeletons, and empty/error surfaces.
- Record loading, empty, success, and error states explicitly in tests and plan evidence.
- Before implementation, read `.agents/skills/shadcn/SKILL.md`, `.agents/skills/shadcn/rules/styling.md`, `.agents/skills/shadcn/rules/forms.md`, `.agents/skills/shadcn/rules/composition.md`.

## Implementation Notes

- Mandatory patterns during implementation:
  - Reuse current analytics repository helpers where possible; add only focused new raw-row/export helpers instead of duplicating full aggregation logic.
  - Keep CSV numeric values raw (`12345`), and include explicit section/type columns rather than localized presentation strings.
  - Export action must derive period and household context from same state already driving visible analytics page.
  - Harden `/insights` truthfulness first: if one required dataset is missing or failed, export affordance must explain why rather than silently downloading partial truth.
  - Preserve current future compatibility with `feat-045` by keeping export scoped to analytics slice, not home dashboard.
- Companion skills for implementation:
  - `test-driven-development`
  - `security-reviewer`
  - `frontend-patterns`
  - `backend-patterns`
  - `verification-before-completion`
  - `typescript-reviewer`
- Common pitfalls to avoid:
  - Leaking private household expenses through raw rows.
  - Exporting localized currency strings that break spreadsheet math.
  - Offering export during partial/failed analytics load without warning.
  - Encoding overlapping group totals without labels that explain section semantics.
  - Expanding scope into async jobs, PDF/XLSX, or broader dashboard redesign.

## Interfaces & Dependencies

### Planned Backend Interface

- `GET /api/v1/analytics/export?period=YYYY-MM&household_id=<id?>`
  - Auth required.
  - `household_id` optional for personal export; when present, caller must be active household member.
  - Success response:
    - `Content-Type: text/csv; charset=utf-8`
    - `Content-Disposition: attachment; filename="analytics-<period>-<scope>.csv"`
  - Failure response:
    - existing JSON error envelope with standard status codes.

- Suggested flat export row shape before CSV serialization:

```ts
type AnalyticsExportRowDTO = {
  section:
    | 'overview'
    | 'dailySpend'
    | 'topCategory'
    | 'comparisonCategoryDelta'
    | 'payerAttribution'
    | 'groupSpend'
    | 'expenseRow'
  period: string
  householdId: string | null
  key: string | null
  label: string | null
  date: string | null
  amountMinor: number | null
  secondaryAmountMinor: number | null
  percent: number | null
  count: number | null
  visibility: string | null
  payerUserId: string | null
  groupId: string | null
  expenseId: string | null
  note: string | null
}
```

- Candidate internal helpers:
  - `getAnalyticsExportData(db, { userId, householdId, period })`
  - `listAnalyticsExportExpenseRows(db, filters)`
  - `serializeAnalyticsExportCsv(rows)`

### Expected Existing Dependencies

- Current analytics aggregation helpers in `apps/worker/src/db/repositories/expense-query-repository.ts`
- Household membership checks from `apps/worker/src/db/repositories/household-membership-repository.ts`
- Household metadata lookup from `apps/worker/src/db/repositories/household-repository.ts` if filename/scope labels need it
- Web analytics hooks and page orchestration from existing `/insights` slice

## Scope Map and Dependency Checks

### Files Expected to Change

**Worker**
- `apps/worker/src/routes/analytics.ts`
- `apps/worker/src/handlers/analytics/get-analytics-export.ts` (new)
- `apps/worker/src/handlers/analytics/period.ts` (if shared helper changes are needed)
- `apps/worker/src/contracts/analytics-schemas.ts`
- `apps/worker/src/contracts/analytics-types.ts` (only if explicit export DTO typing is useful)
- `apps/worker/src/contracts/index.ts`
- `apps/worker/src/db/repositories/expense-query-repository.ts`
- `apps/worker/test/integration/analytics-export.spec.ts` (new preferred) or extend existing analytics spec
- `apps/worker/test/unit/dto-analytics.spec.ts` (if row/serializer mapping gets unit coverage)

**Web**
- `apps/web/src/views/app/insights-page.tsx`
- `apps/web/src/components/analytics/index.ts`
- `apps/web/src/components/analytics/*` (one new or updated bounded export/hardening component)
- `apps/web/src/api/endpoints.ts`
- `apps/web/src/api/analytics.ts`
- `apps/web/src/hooks/api/use-analytics.ts`
- `apps/web/src/types/analytics.ts`
- `apps/web/src/lib/i18n/locales/vi.json`
- `apps/web/src/views/app/insights-page.test.tsx`

**Harness / Docs**
- `docs/exec-plans/index.md`
- `harness/features/feat-044.json`
- `harness/feature_index.json`
- `harness/progress.md`

### Layer Checks

- `Types`: analytics request/row/export types stay explicit and naming-compliant.
- `Repo`: D1 aggregation + raw-row queries remain in repository layer.
- `Runtime`: route + handler validate/auth/serialize response only.
- `UI`: page + feature components trigger export and surface trustworthy states; UI does not bypass hooks/API boundary.

- Dependency rule checks:
  - Lower layers do not depend on higher layers.
  - UI does not bypass runtime/service contracts.
  - Data access enters through repository boundaries only.
  - No new dependency should be added unless serializer needs exceed current built-in platform support.

## Plan of Work (Narrative)

1. Extend analytics worker route surface with dedicated export endpoint that reuses current auth, query validation, month-range calculation, and membership enforcement.
2. Add focused repository support for export assembly: reuse current overview/comparison/groups aggregations where possible, add one raw expense-row query for selected period/context, and normalize all sections into deterministic flat export rows before CSV serialization.
3. Add backend tests proving selected month export works for personal and household contexts and does not leak private household rows.
4. Extend web analytics transport with export helper and add export action in `/insights` bound to current period/household state.
5. Harden `/insights` UX around export eligibility and analytics truthfulness so loading/error/empty/partial states explain whether export is available.
6. Update harness artifacts with plan creation now, then implementation evidence later after delivery.

## Concrete Steps (Commands)

Run from repo root unless noted otherwise.

```bash
# baseline full-workspace verification before implementation
./init.sh

# focused worker analytics tests during implementation
pnpm --filter worker test -- --run test/integration/analytics-export.spec.ts test/integration/analytics-overview.spec.ts test/unit/dto-analytics.spec.ts

# focused web analytics test during implementation
pnpm --filter web test -- --run src/views/app/insights-page.test.tsx

# type checks for touched apps
pnpm --filter worker typecheck
pnpm --filter web typecheck

# full workspace verification before completion
./init.sh
```

Expected short transcript examples:

```text
... analytics export spec ... passed
... insights page test ... passed
... typecheck ... 0 errors
```

## Validation and Acceptance

### Happy Path

- Authenticated user on `/insights` sees export action for selected month/context once required analytics data is ready.
- Triggering export downloads `analytics-<period>-<scope>.csv`.
- CSV contains rows for selected period only and includes both aggregate sections and raw expense rows.

### Validation / Error Paths

- Invalid `period` query to export endpoint returns `400` JSON error envelope.
- Unauthenticated export request returns `401`.
- Non-member household export request returns `403`.
- Empty-period export still returns valid CSV header/rows structure or intentionally documented empty-file behavior; test must assert exact contract.
- Frontend export action is disabled or blocked with clear message when analytics page is still loading or required dataset failed.

### Regression / Privacy Checks

- Household export excludes private expenses owned by other members.
- Aggregate CSV values align with visible analytics metrics already shown on page for same selected month.
- Group export labeling makes overlap semantics explicit enough to avoid misleading totals.

### Acceptance Artifacts

- Worker integration test transcript showing export endpoint pass.
- Small CSV fixture/assertion snippet proving filename/content-type and at least one aggregate row plus one raw expense row.
- Web test transcript proving export CTA state and hardened messaging.
- `./init.sh` transcript.

## Idempotence & Recovery

- Plan-writing and code-edit steps are safe to re-run.
- Export endpoint is additive and non-destructive.
- No DB migration expected.
- If implementation adds helper files or plan-index entries incorrectly, rollback is standard git revert of touched files.

## Artifacts and Notes

- Initial planning evidence belongs in:
  - `docs/exec-plans/plans/2026-05-08-feat-044-analytics-export-path-and-product-hardening-follow-up.md`
  - `docs/exec-plans/index.md`
  - `harness/features/feat-044.json`
  - `harness/feature_index.json`
  - `harness/progress.md`
- Implementation evidence should later record exact test commands and any decisions on CSV row schema.

## Harness Integration

- `harness/feature_index.json`: set `feat-044` status to `in_progress` when this plan is created; later set to `done` only after verification and commit.
- `harness/features/feat-044.json`: update status to `in_progress`, refresh `updated_at`, and replace empty evidence with plan-registration evidence now; append implementation evidence later.
- `harness/progress.md`: add newest-first entry for plan creation with scope, blockers, and next steps.

## Risks and Blockers

- Biggest scope risk: defining single-file CSV encoding that includes aggregates and raw rows without becoming confusing.
- Truthfulness risk: raw-row export could accidentally leak private household data if repository filter reuse is incomplete.
- UX risk: current `/insights` page treats any query failure as page-wide failure; hardening should stay disciplined and not drift into full analytics redesign.
- Potential blocker: if current Worker/platform response-size limits make synchronous all-in-one CSV unsafe for household-sized datasets, implementation must stop, verify current Cloudflare docs, and record narrowed fallback decision in plan before proceeding.

## Open Decisions

- Exact CSV row schema and column names.
- Whether empty export returns header-only CSV or one explicit `overview` row with zero values.
- Whether export trigger should live in page header or inside summary section component after file-size review.
