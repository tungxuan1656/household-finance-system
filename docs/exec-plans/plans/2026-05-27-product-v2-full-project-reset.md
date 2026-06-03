# Product V2 full project reset

## Purpose / Big Picture

This plan resets the project so the whole product matches Product Direction V2. Users should experience the app as a personal expense tracker that can optionally attach expenses to a household and independently tag expenses into groups/events.

The old product model must be removed from current behavior: no `payer` vs `creator` expense split, no `private/public` visibility mode, no household-first positioning, no household-dependent group model, and no lens model that makes household sharing the center of the product.

This project has not launched publicly, so the implementation may rewrite database migrations, remove stale docs, and clean harness records where that is the simplest way to reach a coherent V2 product.

## Scope

In scope:

- Product specs under `docs/product-specs/`.
- Product direction docs under `docs/PRODUCT.md`, `docs/PRODUCT.vi.md`, and `docs/design-docs/shared/product-direction-v2.md`.
- Database migrations under `apps/worker/migrations/`.
- Worker contracts, handlers, routes, repositories, permissions, i18n, and integration/unit tests under `apps/worker/src/` and `apps/worker/test/`.
- Web API types, feature APIs, hooks, forms, pages, components, stores, i18n, and tests under `apps/web/src/`.
- Harness and plan artifacts under `harness/`, `docs/exec-plans/`, and `docs/design-docs/`.
- Removal or rewrite of docs and code that still describe old product truth.

Out of scope:

- Commit creation.
- Production data migration compatibility.
- Launch hardening beyond the V2 reset.
- Bank integrations, split bill, debt tracking, advanced AI, recurring automation, or notification delivery.
- Rebranding or visual redesign unrelated to V2 semantics.

## Non-negotiable Requirements

- Expense product model:
  - One expense is recorded by the user who spent the money.
  - Use `spentByUserId` / `spent_by_user_id` as the canonical expense owner field.
  - Do not expose `payer`, `payerUserId`, `payer_id`, `creator`, or `creator_id` as expense product concepts.
- Household semantics:
  - `householdId` / `household_id` is nullable.
  - No household attached means personal expense.
  - Household attached means every active member of that household can see it.
  - No `visibility` enum exists for expenses.
- Group semantics:
  - Groups/events are independent from households.
  - Groups are user-created contexts and can tag personal expenses, household expenses, or both.
  - Expense-group assignment does not require the group and expense to share a household.
- Create flow defaults:
  - New expense defaults to no household and no group.
  - User attaches household and/or group only when needed.
- Personal dashboard:
  - Shows expenses where `spentByUserId` is the current user, including the user's own household-attached expenses.
- Household dashboard:
  - Shows expenses attached to the selected household, visible to all active household members.
- Current docs and code must not contain old model terms except where explicitly allowed:
  - `docs/design-docs/shared/product-direction-v2.md` may mention old terms only to explain the V1 -> V2 change.
  - Language runtime words such as TypeScript `private`, package `private`, and `public` route/layout naming are not product-model violations.

## Progress

- [x] 2026-05-27 Inventory stale V1 product-model references across docs, app code, tests, migrations, and harness.
- [x] 2026-05-27 Create this ExecPlan.
- [x] 2026-05-27 Phase 0: Run pre-edit impact checks and freeze the V2 contract map.
- [x] 2026-05-27 Phase 1: Rewrite current product specs and remove stale spec docs.
- [ ] Phase 2: Reset D1 migrations to a single canonical V2 schema.
- [ ] Phase 3: Refactor worker contracts, repositories, handlers, analytics, budgets, and tests.
- [x] 2026-05-27 Phase 3 milestone: remove household `defaultVisibility` from worker/web contracts, handlers, store types, i18n, tests, and `0001_init.sql`.
- [x] 2026-05-27 Phase 3 milestone: move the public expense CRUD/query contract to V2 (`householdId` + `spentByUserId`) across worker contracts, expense handlers, query helpers, web expense types, and expense-entry/detail surfaces.
- [x] 2026-05-27 Phase 3 milestone: migrate the worker expense integration/test matrix to V2 and restore green full worker verification.
- [ ] Phase 4: Refactor web API types, forms, filters, pages, analytics views, copy, and tests.
- [ ] Phase 5: Clean current docs, exec-plan index, harness feature records, and progress artifacts.
- [ ] Phase 6: Run final verification and GitNexus change detection.

## Surprises & Discoveries

- `docs/PRODUCT.md`, `docs/PRODUCT.vi.md`, and `docs/design-docs/shared/product-direction-v2.md` already define the V2 product truth.
- `docs/product-specs/expense-tracking.md` partially matches V2 but still says scope defaults to `private` and payer is derived.
- `docs/product-specs/expense-ownership.md` and `docs/product-specs/data-visibility.md` are V1-centric and should be deleted or replaced.
- `apps/worker/migrations/0008_independent_groups.sql` already started decoupling groups from households, but the canonical schema still contains household-coupled group fields and expense visibility.
- Current `createExpenseHandler` already makes payer equal creator, which confirms the app has drifted toward V2 behavior while retaining V1 field names.
- Current personal feed logic returns the caller's private expenses plus all household expenses for memberships. V2 requires personal views to use the current user's own spending, while household views use household membership.
- Initial stale-term scan found about 160 `payer` hits, 437 `visibility/private` hits, 41 lens hits, and 150 creator-related hits across current apps/docs/harness search scope.
- After Phase 1 rewrites, `docs/product-specs/` no longer matches the stale-term scan for `payer|creator|visibility|private|public|lens|defaultVisibility`.
- Household `defaultVisibility` was removed cleanly from worker/web slices with focused tests green, which confirms the household settings surface can move to pure name/currency/timezone semantics before the broader expense contract reset.
- The public expense contract can move ahead of the full storage reset because worker handlers can still bridge from current DB columns to V2 DTOs while the deeper analytics/budget/group internals are being refactored.
- A large portion of the worker failures after the public contract switch came from stale test fixtures and expectations rather than runtime logic; once those were migrated to V2 semantics, worker analytics, budget, group, restore/delete, and scenario suites all converged quickly.

## Decision Log

## Decision Log

- Decision: Reset migrations instead of layering more migrations.
  Rationale: The product is not launched, and the user explicitly allowed deleting and rewriting migrations. A single canonical schema is clearer and removes V1 constraints cleanly.
  Date/Author: 2026-05-27 / Orchestrator

- Decision: Use `spentByUserId` / `spent_by_user_id` for the canonical expense owner.
  Rationale: It expresses the V2 product rule "ai chi thi nguoi do ghi" without reintroducing payer/creator language.
  Date/Author: 2026-05-27 / Orchestrator

- Decision: Keep technical audit fields such as `actor_user_id` for audit logs.
  Rationale: Audit metadata is not the old expense ownership model. It remains necessary for security and history.
  Date/Author: 2026-05-27 / Orchestrator

- Decision: Replace current `visibility` semantics with nullable `household_id`.
  Rationale: The V2 rule has exactly two real states: no household attached or household attached.
  Date/Author: 2026-05-27 / Orchestrator

- Decision: Make expense groups user-created and household-independent.
  Rationale: Groups answer "what event/context is this expense in?" and must not depend on household.
  Date/Author: 2026-05-27 / Orchestrator

- Decision: Preserve `product-direction-v2.md` as the only doc allowed to describe old V1 terms intentionally.
  Rationale: The user requested a V1 -> V2 difference document, so that one file must retain contrast language.
  Date/Author: 2026-05-27 / Orchestrator

- Decision: Remove household `defaultVisibility` before the broader expense contract reset.
  Rationale: It is a bounded V1 artifact with limited blast radius, and removing it first reduces future noise in contracts, i18n, tests, and settings UI before the much larger expense refactor.
  Date/Author: 2026-05-27 / Orchestrator

- Decision: Migrate the public expense contract before fully rewriting storage and analytics internals.
  Rationale: This lets worker/web CRUD surfaces and form/query semantics move to V2 while internal repositories still bridge through legacy columns temporarily, reducing front-to-back contract drift without requiring one giant atomic rewrite.
  Date/Author: 2026-05-27 / Orchestrator

- Decision: Keep temporary repository bridges from legacy storage fields to V2 DTOs while migrating tests and downstream worker flows.
  Rationale: This keeps the repo verifiable after each chunk instead of forcing a schema-and-runtime big bang.
  Date/Author: 2026-05-27 / Orchestrator

## Outcomes & Retrospective

Target final outcome:

- Fresh database schema with no expense `visibility`, no `payer_user_id`, and no household-dependent group assignment.
- Worker API accepts and returns V2 contracts.
- Web forms, filters, dashboards, insights, budgets, copy, and tests use V2 terminology and data shape.
- Current docs and harness explain only V2 product truth, except the accepted V1 -> V2 contrast doc.
- `./init.sh` finishes with `Done!`.
- `gitnexus_detect_changes(scope: "all")` is reviewed and recorded.

## Context and Orientation

Current high-level product truth:

- `docs/PRODUCT.vi.md`
- `docs/PRODUCT.md`
- `docs/design-docs/shared/product-direction-v2.md`

Current V1-heavy areas:

- Product specs: `docs/product-specs/expense-ownership.md`, `docs/product-specs/data-visibility.md`, `docs/product-specs/expense-querying.md`, `docs/product-specs/analytics-overview.md`, `docs/product-specs/budget-management.md`, `docs/product-specs/household-management.md`, `docs/product-specs/web/quick-add-experience.md`.
- Migrations: `apps/worker/migrations/0001_init.sql` through `apps/worker/migrations/0008_independent_groups.sql`.
- Worker contracts: `apps/worker/src/contracts/expense-schemas.ts`, `apps/worker/src/contracts/expense-types.ts`, `apps/worker/src/contracts/analytics-types.ts`, `apps/worker/src/contracts/household.ts`.
- Worker repositories: `apps/worker/src/db/repositories/expense-*`, `apps/worker/src/db/repositories/budget-*`, `apps/worker/src/db/repositories/household-*`.
- Worker handlers: `apps/worker/src/handlers/expenses/*`, `apps/worker/src/handlers/analytics/*`, `apps/worker/src/handlers/budgets/*`, `apps/worker/src/handlers/expense-groups/*`, `apps/worker/src/handlers/households/*`.
- Web expense feature: `apps/web/src/features/expenses/**`.
- Web overview/insights features: `apps/web/src/features/overview/**`, `apps/web/src/features/insights/**`.
- Web household feature: `apps/web/src/features/households/**`.
- Web i18n: `apps/web/src/lib/i18n/locales/vi.json`.
- Worker i18n: `apps/worker/src/lib/i18n/messages.vi.ts`.
- Harness current records: `harness/feature_index.json`, `harness/features/*.json`, `harness/progress.md`.

Layer rules from `ARCHITECTURE.md`:

- Types -> Config -> Repo -> Service -> Runtime -> UI.
- UI must not bypass runtime/service contracts.
- Data access enters through repositories/adapters.
- Routes contain no SQL.
- New dependencies require plan/design justification.

## Required Standards / Reference Docs

Apply these docs during implementation:

- `ARCHITECTURE.md`
- `docs/PRODUCT.md`
- `docs/PRODUCT.vi.md`
- `docs/design-docs/shared/product-direction-v2.md`
- `docs/references/backend/architecture-and-boundaries.md`
- `docs/references/backend/api-contract-and-validation.md`
- `docs/references/backend/database-pattern.md`
- `docs/references/backend/security-and-auth-pattern.md`
- `docs/references/backend/testing-pattern.md`
- `docs/references/backend/error-handling-pattern.md`
- `docs/references/backend/cloudflare-workers.md`
- `docs/references/frontend/web/project-folder-structure.md`
- `docs/references/frontend/web/component-structure-pattern.md`
- `docs/references/frontend/web/naming-and-conventions-pattern.md`
- `docs/references/frontend/web/form-pattern.md`
- `docs/references/frontend/web/dialog-and-form-pattern.md`
- `docs/references/frontend/web/api-react-query-pattern.md`
- `docs/references/frontend/web/i18n-label-pattern.md`
- `docs/references/shared/type-naming-pattern.md`
- `docs/SECURITY.md`
- `docs/RELIABILITY.md`

Concrete constraints from the references:

- Worker API fields stay `camelCase`.
- DB columns stay `snake_case`.
- Query dynamic values are always bound.
- No `SELECT *` in production endpoints.
- Protected endpoints must pass auth middleware.
- Ownership and membership checks remain server-enforced.
- Frontend UI imports API hooks, not raw API clients.
- Domain-local frontend code remains under `apps/web/src/features/<domain>`.
- Shared data exchange types use `DTO`, API inputs use `Request`, and business outputs use `Response`.
- Use `./init.sh <param>` for repo verification commands.

## V2 Contract Map

### Expense API

`CreateExpenseRequest`:

```ts
type CreateExpenseRequest = {
  amount: number
  categoryKey: CategoryKey
  sourceKey: SourceKey
  title: string
  occurredAt: number
  note?: string
  householdId?: string
  groupIds?: string[]
}
```

`UpdateExpenseRequest`:

```ts
type UpdateExpenseRequest = Partial<CreateExpenseRequest>
```

`ExpenseDTO`:

```ts
type ExpenseDTO = {
  id: string
  title: string
  amountMinor: number
  currencyCode: string
  categoryKey: CategoryKey
  sourceKey: SourceKey
  occurredAt: number
  householdId: string | null
  spentByUserId: string
  note: string | null
  groupIds: string[]
  createdAt: number
  updatedAt: number
}
```

`ExpenseListParams`:

```ts
type ExpenseListParams = {
  cursor?: string
  limit?: number
  household_id?: string
  date_from?: number
  date_to?: number
  category_key?: string
  group_id?: string
  query?: string
  amount_min?: number
  amount_max?: number
  spent_by_user_id?: string
  sort?: 'occurred_at_desc' | 'amount_desc'
}
```

Rules:

- No `visibility`.
- No `payerUserId`.
- No `createdByUserId` in user-facing expense DTOs.
- `spentByUserId` always equals the authenticated user during create.
- Updating `spentByUserId` is not supported in MVP.
- If `householdId` is present, the user must be an active member and allowed to create expenses in that household.
- If `householdId` is absent, the expense is personal.

### Expense Query Scope

Personal query:

```sql
e.deleted_at IS NULL
AND e.spent_by_user_id = ?
```

Household query:

```sql
e.deleted_at IS NULL
AND e.household_id = ?
AND EXISTS (
  SELECT 1
    FROM household_memberships hm
   WHERE hm.household_id = e.household_id
     AND hm.user_id = ?
     AND hm.state = 'active'
)
```

Group filter:

```sql
EXISTS (
  SELECT 1
    FROM expense_group_items egi
   WHERE egi.expense_id = e.id
     AND egi.group_id = ?
)
```

### Household API

Remove from contracts, schema, DTOs, UI, tests:

- `defaultVisibility`
- `default_visibility`

Household remains:

- name
- slug
- description
- default currency
- timezone
- member roles
- archive/delete lifecycle

### Group API

Group is independent:

```ts
type ExpenseGroupDTO = {
  id: string
  name: string
  description: string | null
  status: 'active' | 'archived'
  startDate: string | null
  endDate: string | null
  eventBudgetMinor: number | null
  ownerUserId: string
  createdAt: number
  updatedAt: number
}
```

Rules:

- No required `householdId`.
- Group CRUD is owner-scoped.
- Group assignment may attach the group to any expense the current user can mutate.
- Group detail lists only expenses visible to the current user.

### Budget API

Budget scopes:

```ts
type BudgetScopeType = 'personal' | 'household' | 'group'
```

Rules:

- Personal budget aggregates expenses where `spentByUserId` is current user.
- Household budget aggregates expenses attached to the household.
- Group budget aggregates visible expenses tagged with the group.
- Category limits continue to use global category keys.

### Analytics API

Remove:

- `payerAttribution`
- payer labels and payer percentage charts

Replace with:

- `memberSpending` for household context, derived from `spent_by_user_id`.
- personal dashboard totals based on `spent_by_user_id`.
- household dashboard totals based on `household_id`.
- group summaries based on `expense_group_items`.

## Plan of Work (Narrative)

### Phase 0: Pre-edit impact and contract freeze

Run impact checks before editing shared symbols:

- `gitnexus_impact({ target: "createExpenseHandler", direction: "upstream" })`
- `gitnexus_impact({ target: "buildVisibleExpenseConditions", direction: "upstream" })`
- `gitnexus_impact({ target: "ExpenseDTO", direction: "upstream" })`
- `gitnexus_impact({ target: "ExpenseEntryFormState", direction: "upstream" })`
- `gitnexus_impact({ target: "OverviewPage", direction: "upstream" })`

Expected result:

- Risk will likely be HIGH because this is a fullstack contract reset.
- Proceed because the user explicitly approved resetting the project before launch.
- Record the blast radius in `harness/features/feat-071.json`.

### Phase 1: Rewrite product specs and current docs

Rewrite or remove current specs:

- Rewrite `docs/product-specs/expense-tracking.md` around optional `householdId`, optional groups, and `spentByUserId`.
- Delete `docs/product-specs/expense-ownership.md` or replace it with `docs/product-specs/expense-spender-model.md`.
- Delete `docs/product-specs/data-visibility.md` or replace it with `docs/product-specs/expense-household-context.md`.
- Rewrite `docs/product-specs/expense-querying.md` to remove `visibility`, `payer_id`, and `creator_id` filters.
- Rewrite `docs/product-specs/expense-management.md` to remove payer edits and visibility transitions.
- Rewrite `docs/product-specs/expense-grouping.md` so group CRUD and assignment are user-owned and household-independent.
- Rewrite `docs/product-specs/budget-management.md` around personal, household, and group budget scopes.
- Rewrite `docs/product-specs/analytics-overview.md` to remove payer attribution and use personal/household/group summaries.
- Rewrite `docs/product-specs/household-management.md` to remove default visibility.
- Rewrite `docs/product-specs/web/quick-add-experience.md` to default to no household and no group.
- Update `docs/product-specs/index.md` to remove deleted specs and link replacement specs.

Acceptance:

- `rg -n "payer|creator|visibility|private|public|lens" docs/product-specs` returns no V1 product-truth references.
- Allowed language runtime words are not relevant in product specs.

### Phase 2: Reset migrations

Delete these files:

- `apps/worker/migrations/0002_household_invitations.sql`
- `apps/worker/migrations/0003_expense_category_key_source_key.sql`
- `apps/worker/migrations/0004_expense_feed_index.sql`
- `apps/worker/migrations/0005_audit_logs_nullable_household.sql`
- `apps/worker/migrations/0006_budget_category_key.sql`
- `apps/worker/migrations/0007_user_quick_add_last_source.sql`
- `apps/worker/migrations/0008_independent_groups.sql`

Rewrite `apps/worker/migrations/0001_init.sql` as the single canonical V2 schema.

Canonical schema changes:

- `households`: remove `default_visibility`.
- `expenses`: remove `visibility`, `payer_user_id`, and `created_by_user_id`; add `spent_by_user_id`.
- `expense_groups`: remove required household ownership; add `owner_user_id`.
- `expense_group_items`: remove required `household_id`; keep `expense_id`, `group_id`, `assigned_by_user_id`.
- `budgets`: support `scope_type` in `personal | household | group`; allow nullable `owner_user_id`, `household_id`, and `group_id` with checks.
- `budget_limits`: use `category_key` instead of legacy category IDs.
- `audit_logs`: keep `actor_user_id` and nullable `household_id`.
- Keep auth, users, sessions, memberships, invitations, profile quick-add source, and reference-data-compatible fields.

Indexing requirements:

- `idx_expenses_spent_by_occurred_at` on `(spent_by_user_id, occurred_at DESC)`.
- `idx_expenses_household_occurred_at` on `(household_id, occurred_at DESC)`.
- `idx_expenses_category_occurred_at` on `(category_key, occurred_at DESC)`.
- `idx_expense_group_items_expense_id`.
- `idx_expense_group_items_group_id`.
- `idx_budgets_scope_period` on `(scope_type, budget_month)`.

Acceptance:

- `rg -n "visibility|payer_user_id|default_visibility|created_by_user_id" apps/worker/migrations` returns no expense V1 schema references. `created_by_user_id` may remain only for non-expense records if intentionally kept; prefer `owner_user_id` for groups and `actor_user_id` for audit.
- `./init.sh test` can apply migrations in the test helper.

### Phase 3: Refactor worker

Contracts:

- Update `apps/worker/src/contracts/expense-schemas.ts`.
- Update `apps/worker/src/contracts/expense-types.ts`.
- Update `apps/worker/src/contracts/analytics-types.ts`.
- Update `apps/worker/src/contracts/budget-schemas.ts`.
- Update `apps/worker/src/contracts/budget-types.ts`.
- Update `apps/worker/src/contracts/expense-group-schemas.ts`.
- Update `apps/worker/src/contracts/expense-group-types.ts`.
- Update `apps/worker/src/contracts/household.ts`.

Repositories:

- Replace expense row fields in `apps/worker/src/db/repositories/expense-repository.ts`.
- Replace DTO mapping in `apps/worker/src/db/repositories/expense-row-mapper.ts`.
- Replace query scoping in `apps/worker/src/db/repositories/expense-query-scope.ts`.
- Replace list filters in `apps/worker/src/db/repositories/expense-query-repository.ts`.
- Replace summary filters in `apps/worker/src/db/repositories/expense-summary-repository.ts`.
- Replace analytics queries in `apps/worker/src/db/repositories/expense-analytics-*`.
- Replace group ownership and assignment queries in `apps/worker/src/db/repositories/expense-group-*`.
- Replace budget aggregation in `apps/worker/src/db/repositories/budget-*`.
- Remove household default visibility mapping in `apps/worker/src/db/repositories/household-*`.

Handlers:

- `createExpenseHandler`: derive `spentByUserId` from current user; validate optional `householdId`; assign optional groups after creation.
- `updateExpenseHandler`: allow amount/category/source/title/date/note/household/group changes; disallow owner change.
- `authorizeExpenseAccess`: personal if `spentByUserId` matches current user; household if active household member.
- `authorizeExpenseMutation`: owner can mutate own expense; household admin/member rules apply only when mutating household-attached expenses according to role policy.
- `listExpensesHandler`: support personal default, explicit household query, optional group filter.
- `getExpenseSummaryHandler`: use same V2 scope logic.
- `deleteExpenseHandler` and `restoreExpenseHandler`: use V2 scope/role logic.
- Analytics handlers: replace payer attribution with `memberSpending`.
- Budget handlers: support personal, household, and group scopes.
- Group handlers: owner-scoped CRUD and visible-expense summary.
- Household handlers: remove `defaultVisibility`.

Worker tests:

- Rewrite unit tests for expense DTO validation.
- Rewrite integration tests for expense create/list/detail/update/delete/restore.
- Rewrite analytics tests to remove payer attribution.
- Rewrite budget tests for personal/household/group scope.
- Rewrite group tests for user-owned independent groups.
- Rewrite household tests to remove default visibility.
- Rewrite data integrity tests for new schema checks.

Acceptance:

- `./init.sh test` passes for worker tests.
- No worker API contract exposes `visibility`, `payer`, `payerUserId`, `payer_id`, `creator_id`, or `createdByUserId` for expenses.

### Phase 4: Refactor web

Shared/API types:

- Update `apps/web/src/features/expenses/types/expense.ts`.
- Update `apps/web/src/types/analytics.ts`.
- Update budget/group/household types as needed.

Expense forms:

- Update `apps/web/src/features/expenses/lib/forms/expense.schema.ts`.
- Update `apps/web/src/features/expenses/components/expense-entry-form-core.ts`.
- Update `apps/web/src/features/expenses/components/use-expense-entry-form.ts`.
- Remove payload construction of `visibility` and `payerUserId`.
- Keep `householdId` and `groupIds` optional.

Expense pages/components:

- Update `expense-detail-card.tsx` to show household context only when attached, not visibility badges.
- Update `expense-feed-filters.tsx` and `expense-active-filter-summary.tsx` to remove visibility/payer/creator filters.
- Update list/detail/edit/trash pages to use V2 DTOs.

Overview/home:

- Rename `Lens` terminology to `DashboardScope` or `ViewScope`.
- Keep personal and household tabs if useful, but do not use lens language in types, tests, or copy.
- Personal scope queries use current user's own expenses.
- Household scope queries use selected household ID.

Insights:

- Remove payer attribution UI from `insights-comparison-section.tsx`.
- Add household `memberSpending` UI if backend returns it.
- Ensure group summaries remain independent from household.

Households:

- Remove `DefaultVisibility`, `defaultVisibility`, labels, schema fields, tests, and copy.
- Household settings should manage name/currency/timezone/member settings only.

Groups:

- Ensure group create/edit/list/detail do not require household context.
- Group detail shows visible expenses tagged to the group.

i18n:

- Remove V1 copy from `apps/web/src/lib/i18n/locales/vi.json`.
- Remove V1 validation copy from `apps/worker/src/lib/i18n/messages.vi.ts`.

Web tests:

- Rewrite expense entry tests for V2 payloads.
- Rewrite overview tests to remove lens assertions.
- Rewrite household label/store tests to remove default visibility.
- Rewrite insights tests to remove payer attribution.

Acceptance:

- `./init.sh typecheck` passes.
- `./init.sh lint` passes.
- `./init.sh test` passes.
- Targeted stale-term scan across `apps/web/src` returns no V1 product model terms except language/runtime false positives.

### Phase 5: Clean current docs, plans, and harness

Docs cleanup:

- Keep `docs/PRODUCT.md`, `docs/PRODUCT.vi.md`, and `docs/design-docs/shared/product-direction-v2.md`.
- Keep this ExecPlan.
- Update `docs/design-docs/index.md`.
- Update `docs/product-specs/index.md`.
- Remove or rewrite current docs that still describe V1 behavior.

Exec-plan cleanup:

- Move stale active plan `2026-05-19-expense-entry-form-unification.md` from `Active` to `Completed` in `docs/exec-plans/index.md` because feature `feat-061` is already done.
- Keep historical completed plans unless they are referenced as current product truth.
- If the user wants literal no old-term matches even in historical completed plans, archive historical plans under `harness/archive/` and remove them from active current-doc scanning in a separate cleanup pass.

Harness cleanup:

- Add `feat-071` for this V2 reset.
- Mark old V1-specific feature records as `superseded` or rewrite their descriptions:
  - `feat-017`
  - `feat-018`
  - `feat-019`
  - `feat-020`
  - `feat-021`
  - `feat-024`
  - `feat-027`
  - `feat-028`
  - `feat-029`
  - `feat-043`
  - `feat-045`
  - `feat-060`
  - `feat-061`
- Keep foundational features such as auth, reference data, household CRUD, worker foundation, and web foundation.
- Update `harness/progress.md` with each completed phase.
- Use `harness/session-handoff.md` only if the reset spans sessions.

Acceptance:

- `python3 -m json.tool harness/feature_index.json` passes.
- `python3 -m json.tool harness/features/feat-071.json` passes.
- Current docs and harness active records do not present V1 behavior as current truth.

### Phase 6: Final verification and review

Run:

```bash
./init.sh lint
./init.sh typecheck
./init.sh test
./init.sh
```

Expected:

```text
OK
OK
OK
Done!
```

Run final stale-term scans:

```bash
rg -n "payer|payerUserId|payer_id|payer_user_id|payerAttribution" apps docs harness --glob '!docs/design-docs/shared/product-direction-v2.md'
rg -n "visibility|defaultVisibility|default_visibility|private|public" apps docs harness --glob '!docs/design-docs/shared/product-direction-v2.md'
rg -n "\\blens\\b|lenses|activeLens" apps docs harness
rg -n "creator_id|createdByUserId|created_by_user_id|creator" apps docs harness --glob '!docs/design-docs/shared/product-direction-v2.md'
```

Expected:

- No expense product-model matches.
- Runtime false positives are reviewed and documented.
- `private` may remain only for TypeScript class fields, package metadata, or non-product route naming.
- `public` may remain only for route/layout/cache naming.
- `actor_user_id` may remain for audit logs.

Run:

```bash
./init.sh sync
```

Expected:

```text
OK
```

Run:

```text
gitnexus_detect_changes(scope: "all")
```

Expected:

- Risk likely `HIGH` or `CRITICAL` because this is a fullstack reset.
- Affected processes are reviewed before declaring completion.
- Final evidence is recorded in `harness/features/feat-071.json` and `harness/progress.md`.

## Concrete Steps (Commands)

Run from repo root unless noted.

Pre-edit inventory:

```bash
rg -l "\\b(payer|payerId|payer_id|payer_user_id|payerAttribution|visibility|defaultVisibility|default_visibility|private|public|lens|lenses|activeLens|creator_id|createdByUserId|created_by_user_id|creator)\\b" apps docs harness
```

Expected:

```text
prints stale files to remove/rewrite
```

Focused verification after docs phase:

```bash
python3 -m json.tool harness/feature_index.json
python3 -m json.tool harness/features/feat-071.json
```

Expected:

```text
valid JSON, no output
```

Focused verification after backend phase:

```bash
./init.sh test
./init.sh typecheck
```

Expected:

```text
OK
OK
```

Focused verification after frontend phase:

```bash
./init.sh lint
./init.sh typecheck
./init.sh test
```

Expected:

```text
OK
OK
OK
```

Final verification:

```bash
./init.sh
```

Expected:

```text
Done!
```

## Validation and Acceptance

### Expense create acceptance

- Creating an expense with no `householdId` creates a personal expense with `spentByUserId = currentUser.id`.
- Creating an expense with `householdId` requires active household membership and makes the expense visible to all active household members.
- Creating an expense with `groupIds` works whether or not `householdId` is present.
- Request body containing `visibility`, `payerUserId`, or `createdByUserId` is rejected.

### Expense query acceptance

- Personal expense list returns the current user's own expenses, including those attached to households.
- Household expense list returns expenses attached to that household and requires active membership.
- Group filter narrows the current visible scope and does not depend on household ownership.

### Group acceptance

- User can create a group without choosing a household.
- User can tag a personal expense into a group.
- User can tag a household expense into the same group.
- Group summary counts only expenses visible to the current user.

### Budget acceptance

- Personal budget aggregates the user's own expenses.
- Household budget aggregates household-attached expenses.
- Group budget aggregates visible group-tagged expenses.
- Category limits use global category keys.

### Analytics acceptance

- Personal analytics use `spentByUserId`.
- Household analytics use `householdId`.
- Group analytics use group assignments.
- No payer attribution is displayed or returned.

### Docs/harness acceptance

- Product specs match V2.
- Current docs do not describe V1 as current truth.
- Harness records either reflect V2 or mark old V1 features as superseded.
- The only intentional V1 contrast doc is `docs/design-docs/shared/product-direction-v2.md`.

## Idempotence & Recovery

Docs and code edits:

- Safe to re-run in normal git workflow.
- Use `git diff -- <path>` to inspect local changes.
- Do not use destructive git commands unless explicitly requested.

Migration reset:

- Safe because the product is not launched and the user approved deleting migrations.
- Before deleting migrations, capture current migration inventory:

```bash
ls -1 apps/worker/migrations
```

- If implementation needs to recover old schema while still in the same working tree, use git to inspect the previous version:

```bash
git show HEAD:apps/worker/migrations/0001_init.sql
```

Test DB recovery:

- Test databases are recreated by test helpers that apply migrations.
- If local D1 state becomes stale during manual testing, run the repo's standard sync/init path:

```bash
./init.sh sync
```

## Artifacts and Notes

Create/update these artifacts during execution:

- `docs/exec-plans/plans/2026-05-27-product-v2-full-project-reset.md`
- `harness/features/feat-071.json`
- `harness/feature_index.json`
- `harness/progress.md`
- `harness/session-handoff.md` only if unfinished work must be handed off

Current execution status:

- Phase 0 complete.
- Phase 1 complete.
- Phase 2 intentionally not started yet in this session because rewriting migrations before the backend contract refactor would leave the repo temporarily broken between phases.

Minimum final evidence:

- `./init.sh lint` result
- `./init.sh typecheck` result
- `./init.sh test` result
- final `./init.sh` result
- stale-term scan result with allowed false positives documented
- final `gitnexus_detect_changes(scope: "all")` result

## Interfaces & Dependencies

External dependencies:

- Firebase Auth remains the identity provider.
- Cloudflare Workers and D1 remain the backend/runtime/database.
- No new external dependency is planned.

Internal dependencies:

- Expense APIs feed budget and analytics aggregates.
- Group APIs depend on expense access rules.
- Household APIs provide membership and role checks.
- Web React Query hooks depend on worker DTO contracts.
- i18n catalogs must match all user-facing labels and validation errors.

## Risks / Blockers

- This is a high-blast-radius reset. Expect many tests to fail until backend and frontend contracts are updated together.
- Removing `visibility` changes query semantics and can break analytics/budget calculations if any repository keeps old filters.
- Removing `payer` changes analytics and labels; all payer attribution UI/tests must be rewritten, not patched cosmetically.
- Rewriting migrations can invalidate local development D1 databases; reset local state through repo-supported commands during execution.
- Historical docs and harness records contain old terms. The implementation must distinguish historical records from current truth, then clean or supersede according to the acceptance scans.

## Open Decisions

- No blocking product decision remains at plan time.
- Implementation may record follow-up decisions in the Decision Log if code reveals a hidden dependency between groups, budgets, and household access.
