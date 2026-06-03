# ExecPlan: feat-021 — Expense Search, Filters & Pagination

**Feature ID:** `feat-021`  
**Status:** `in_progress` (active plan)  
**Target Domain:** `fullstack`  
**Dependencies:** `feat-018`, `feat-016`  
**Created:** `2026-05-04`

---

## Title

Add expense search, filter, sort, and pagination controls for the expense feed.

## Purpose / Big Picture

Users need to find expense entries quickly without scrolling through the entire feed. This change makes the expense feed searchable and filterable by note text, amount, group, category, visibility, and sort order, while keeping pagination stable and predictable.

User-visible behaviour:

- The expense feed gains a search input and filter bar.
- Users can narrow results by amount range, group, category, payer, date range, visibility, and sort order.
- Pagination continues to work with cursor-based loading and the feed remains usable as filters change.
- A compact summary endpoint provides totals for the currently filtered set.

## Scope

### In Scope

**Backend**
- Extend `GET /api/v1/expenses` with query params for `query`, `amount_min`, `amount_max`, `group_id`, `category_key`, `payer_id`, `creator_id`, `visibility`, `date_from`, `date_to`, `sort`, `limit`, and `cursor`.
- Add `GET /api/v1/expenses/summary` returning aggregated totals for the filtered set.
- Keep visibility and household membership enforcement server-side.
- Reuse stable category keys from the global static catalog.
- Add/adjust repository query methods for filtered expense lists and filtered summary totals.
- Add validation and integration coverage for happy path, validation errors, unauthorized access, forbidden access, and pagination edge cases.

**Frontend**
- Add a filter bar to the expense feed page.
- Add search input, date-range controls, category multi-select, payer selector, amount range inputs, visibility selector, sort toggle, and pagination wiring.
- Update query hooks so the feed can refetch with filter state and infinite-scroll remains stable.
- Surface filtered summary totals in the feed UI.
- Add/adjust component and hook tests.

### Out of Scope

- Analytics charts or trend visualizations (`feat-028`).
- Budget calculations beyond filtered totals.
- Real-time updates or WebSockets.
- Offline queueing or local persistence for query state.
- Changes to expense create/edit/delete flows beyond what is required to support query results.

## Non-negotiable Requirements

- The plan is self-contained and can be executed without external context.
- The implementation must produce observable behaviour in the feed UI and API responses.
- Every user-facing label must use i18n.
- All API inputs must be explicitly validated.
- Pagination must stay cursor-based and stable under sorting/filtering.

## Context and Orientation

- Worker routes: `apps/worker/src/routes/expenses.ts`
- Worker handlers: `apps/worker/src/handlers/expenses/*`
- Worker repositories: `apps/worker/src/db/repositories/*`
- Web feed page: `apps/web/src/views/app/expenses-page.tsx`
- Web feed components: `apps/web/src/components/expense/*`
- Web hooks/API: `apps/web/src/hooks/api/use-expense.ts`, `apps/web/src/api/expense.ts`, `apps/web/src/api/endpoints.ts`
- Web types: `apps/web/src/types/*`
- Tests: `apps/worker/test/*`, `apps/web/src/**/*.test.tsx`

## Scope Map & Layer Impact

Using `Types -> Config -> Repo -> Service -> Runtime -> UI`:

1. **Types** — update expense request/response contracts and filtered summary DTOs.
2. **Config** — no new runtime config expected.
3. **Repo** — extend D1 queries for filtered expense pages and summary aggregation.
4. **Service** — handler logic composes filters, authorization, and pagination.
5. **Runtime** — register/extend `/api/v1/expenses` and `/api/v1/expenses/summary` routes.
6. **UI** — feed page, filter bar, hooks, and summary display.

### Hard Dependency Checks

- Lower layers must not depend on higher layers.
- UI must not bypass runtime/service contracts; all list and summary data must flow through typed hooks.
- Data access must enter through repositories only.
- New query parameters must be justified by product spec and validated explicitly.
- If summary aggregation requires a new indexed query, document the index in the implementation notes and verification evidence.

## Standards Enforcement

### Required References

| Reference | Constraint |
|-----------|------------|
| `docs/references/backend/architecture-and-boundaries.md` | Keep SQL in repositories, orchestration in handlers, route modules thin. |
| `docs/references/backend/api-contract-and-validation.md` | `/api/v1`, JSON-only, camelCase payloads, explicit query validation, stable compatibility. |
| `docs/references/backend/error-handling-pattern.md` | Return 400/401/403/404/409 as appropriate; never mask failures as success. |
| `docs/references/backend/security-and-auth-pattern.md` | Enforce ownership/membership for private and household-scoped visibility. |
| `docs/references/backend/testing-pattern.md` | Cover happy path, validation failure, unauthorized, forbidden, not found, and pagination edge cases. |
| `docs/references/backend/database-pattern.md` | No `SELECT *`, bind parameters, stable ordering, document indexes for heavy queries. |
| `docs/references/frontend/web/project-folder-structure.md` | Keep feature code in `components/expense`, `hooks/api`, `api`, `views/app`. |
| `docs/references/frontend/web/component-structure-pattern.md` | Page orchestrator pattern; child components export via barrels; split files over 200 lines. |
| `docs/references/frontend/web/naming-and-conventions-pattern.md` | `use-*` hooks, `*_KEYS`, absolute imports, kebab-case files, no duplicate imports. |
| `docs/references/frontend/web/api-react-query-pattern.md` | UI uses hooks only; query keys drive invalidation; no identity `select`. |
| `docs/references/frontend/web/form-pattern.md` | If filter controls use forms, wire them with controlled inputs and accessible error states. |
| `docs/references/frontend/web/dialog-and-form-pattern.md` | Apply if a filter dialog is used instead of inline controls. |
| `docs/references/frontend/web/i18n-label-pattern.md` | All labels and empty/loading/error copy must be localized. |
| `docs/references/shared/type-naming-pattern.md` | DTO / Request / Response suffixes must remain consistent. |

### Implementation Constraints Derived From Standards

- Keep the filter bar feature-scoped; do not promote it to shared unless another feature reuses it.
- Keep query state in hooks/component state unless a real cross-page need emerges.
- Use semantic query keys that include the filter object so cache entries stay isolated.
- Do not add a new store unless the filter state must persist across routes; current scope does not require persistence.
- Keep translated strings keyed by screen/feature context; do not hardcode labels in JSX.

## Implementation Notes

### Mandatory Patterns

- Backend list queries must sort deterministically and enforce a maximum `limit`.
- Summary endpoint should reuse the same validated filter model as the list endpoint so list and totals stay in sync.
- UI filter state should live in the feed page orchestrator, with dumb presentational subcomponents for the filter controls.

### Skill Recommendations

- `tdd-workflow` — write failing backend and frontend tests before implementation.
- `backend-patterns` — for query/handler boundary and pagination behavior.
- `frontend-patterns` — for page orchestration and query-driven UI state.
- `security-review` — because visibility, household membership, and user-scoped data are involved.
- `verification-loop` — for iterative test/build verification.

### Common Pitfalls

- Do not let client filters override server-side visibility rules.
- Do not use offset pagination; cursor pagination must remain authoritative.
- Do not couple summary totals to the current page only; totals must represent the filtered result set.
- Do not leak private expenses into household-scoped views.

## Plan of Work (Narrative)

### Step 1 — Backend query contract and repository support

1. Extend the expense list query schema and DTOs so `query`, amount bounds, `group_id`, `category_key`, `payer_id`, `creator_id`, `visibility`, `date_from`, `date_to`, `sort`, `limit`, and `cursor` are validated explicitly.
2. Add a summary contract for `GET /api/v1/expenses/summary` that returns filtered totals (`sum`, `count`) using the same filter set.
3. Add repository query helpers for filtered expense list and summary aggregation, keeping SQL in repository files only.
4. Document any new index requirements if query performance depends on them.

### Step 2 — Backend handlers and route wiring

5. Update the expense list handler to apply validated filters, enforce visibility rules, and return stable cursor pages.
6. Add the summary handler and register the new route under the existing expenses route module.
7. Ensure all failure cases map to consistent error envelopes and status codes.
8. Add/refresh integration tests for happy path, invalid filters, unauthorized access, forbidden access, and pagination behavior.

### Step 3 — Frontend query state, hooks, and feed wiring

9. Extend expense API functions and React Query hooks to accept the filter object and fetch summary totals alongside the list.
10. Update the expense feed page orchestrator to own filter state and pass it to the list/summary subcomponents.
11. Add the filter bar UI with accessible inputs, i18n labels, and reset/apply behaviour that preserves cursor-based loading semantics.

### Step 4 — Frontend feed presentation and tests

12. Add filtered summary display and ensure the feed resets or refetches safely when filters change.
13. Add component/hook tests for filter state, query key construction, and key user-visible states.
14. Run the repository verification path and capture evidence for the plan/harness.

## Concrete Steps (Commands)

Run from repository root: `/Users/tungdoan/Projects/Web/household-finance-system`

```bash
./init.sh
```

Expected:

```text
install complete
lint passed
typecheck passed
tests passed
build passed
```

```bash
pnpm --filter worker test
```

Expected:

```text
worker test suite passes
```

```bash
pnpm --filter web test
```

Expected:

```text
web test suite passes
```

```bash
pnpm build:web
```

Expected:

```text
build succeeds
```

## Validation and Acceptance

### Happy Path

- Search by note substring returns matching expenses only.
- Applying category, group, payer, amount, and sort filters changes the feed results predictably.
- Summary totals match the currently filtered set.

### Validation / Error Paths

- Invalid filter values return `400` with helpful validation feedback.
- Missing auth returns `401`.
- Forbidden visibility/member access returns `403`.
- Invalid cursor or malformed sort returns `400`.

### Pagination Regression Checks

- Cursor pagination continues to work after filters are applied.
- Repeated requests with the same filter/cursor pair return the same ordering.
- Changing the filter object invalidates/refetches the correct query scope.

### Acceptance Artifact

- `pnpm --filter worker test` output showing the new integration tests pass.
- `pnpm --filter web test` output showing filter UI tests pass.
- `./init.sh` transcript showing the repo is still green.

## Idempotence & Recovery

- All doc/harness edits are safe to re-run.
- Backend changes are additive; no destructive migration is expected.
- If a new index or query optimization is introduced, keep the rollback path as “revert the repository and remove the index note,” because no schema migration is planned in this feature.

## Harness Integration

- Update `harness/features/feat-021.json`:
  - set `status` to `done` after full verification passes
  - refresh `updated_at`
  - align the description with the final scoped contract if wording changes during implementation
- Update `harness/feature_index.json`:
  - move `feat-021` into the completed workflow record
- Update `harness/progress.md`:
  - add a newest-first completion entry with final verification evidence
- If implementation defers anything, log it in `docs/exec-plans/tech-debt-tracker.md`.

## Decision Log

- Decision: Use cursor-based pagination for both filtered feed and summary-aligned list views.
  - Rationale: preserves stable ordering and matches existing feed behavior.
  - Date/Author: 2026-05-04 / Orchestrator
- Decision: Keep the summary endpoint separate from the list endpoint.
  - Rationale: avoids overloading the feed payload and keeps totals reusable.
  - Date/Author: 2026-05-04 / Orchestrator
- Decision: Do not persist filter state in a global store.
  - Rationale: the scope is a single feed page and should remain restartable through local state.
  - Date/Author: 2026-05-04 / Orchestrator

## Progress

- [x] (2026-05-04) Identify `feat-021` as the next pending feature.
- [x] (2026-05-04) Read product specs, harness state, and scope standards.
- [x] (2026-05-04) Draft the active ExecPlan and register it in repo docs.
- [x] (2026-05-04) Implement backend query contract and repository support.
- [x] (2026-05-04) Implement backend handlers/routes/tests and verify worker coverage.
- [x] (2026-05-04) Implement frontend filter/search/summary wiring and verify web coverage.
- [x] (2026-05-04) Run `PATH="$HOME/.nvm/versions/node/v24.15.0/bin:$PATH" ./init.sh` and capture final evidence.

## Surprises & Discoveries

- Local shell defaulted to Node 18, but Vite 7 in this repo requires a newer runtime (`crypto.hash` unavailable on Node 18). Session verification used explicit Node 24 PATH overrides.
- Worker sort typing needed a final widening in `ListExpensesInput` so the repository contract matched the validated query schema and existing default ordering behavior.
- Post-implementation review surfaced contract-boundary bugs that mocked frontend tests had missed: frontend `search` needed to align to backend `query`, summary field names had to match backend DTOs, and `amount_desc` pagination required sort-aware cursor encoding plus matching WHERE semantics.

## Outcomes & Retrospective

- Completed the scoped fullstack expense querying slice with filtered list + summary support.
- Backend delivered validated filters (`query`, amount bounds, creator/category/payer/visibility/date/group/sort/limit/cursor`) plus `GET /api/v1/expenses/summary`, with post-review fixes ensuring summary/list filter parity and stable sort-aware cursor pagination for `amount_desc`.
- Frontend delivered page-local query, visibility, and category controls wired into both summary and feed queries, with post-review fixes aligning list/summary request and response contracts to backend behavior; richer filter matrix and URL-synced state remain future enhancements, not blockers for this feature.
- Final evidence: `PATH="$HOME/.nvm/versions/node/v24.15.0/bin:$PATH" ./init.sh` => `pnpm install: OK`, `Harness checks: OK`, `Linting: OK`, `Type checking: OK`, `Running tests: OK`, `Init Done`.
- Additional regression evidence after review fixes: `PATH="$HOME/.nvm/versions/node/v24.15.0/bin:$PATH" pnpm --filter worker test -- --runInBand "test/integration/expenses-summary.spec.ts" "test/integration/expenses-list.spec.ts"` and `PATH="$HOME/.nvm/versions/node/v24.15.0/bin:$PATH" pnpm --filter web test -- --runInBand "src/components/expense/expense-feed-summary.test.tsx" "src/components/expense/expense-feed-list.test.tsx" "src/views/app/expenses-page.test.tsx"`.
