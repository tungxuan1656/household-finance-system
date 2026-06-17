# Personal budgets end-to-end

## Title

Ship end-to-end personal (user-owned) budget support so TMA (and web) budget lists render personal and household budgets together, sorted by period, without a household filter.

## Purpose / Big Picture

Today the budget API is household-only: `GET /budgets` requires `household_id`, the create request requires `householdId`, and the DB `CHECK (scope IN ('household', 'category'))` blocks a personal row. The shared spec (`docs/product-specs/shared/budget-management.md:12-15`) already lists Personal / Household / Group as budget scopes, and the repo already has a "personal expenses" path (nullable `expenses.household_id` + `expense-query-scope.ts:28-31`). After this plan, an authenticated user can create a personal monthly budget (their own spend, no household required), see it alongside household budgets in a single list sorted by `budget_month DESC`, and view planned-vs-actual status aggregated only from that user's own expenses. TMA renders the unified list, dropping the household dropdown; web gets the same treatment.

## Scope

In scope:

- D1 migration: widen `budgets` to support `scope='personal'` + nullable `household_id` + `owner_user_id`, plus scope-aware partial unique indexes.
- Worker contracts: extend `BudgetDTO`, `BudgetStatusDTO`, `ListBudgetsResponse`, `CreateBudgetRequest`, `CreateBudgetBodySchema`, `BudgetListQuerySchema` for the 2-scope model.
- Worker repository: `createBudget`, `listBudgetsForUser` (replaces `listBudgetsByHousehold` for the API), `findBudgetById`, `getBudgetSpendSummary` (branches on scope).
- Worker handlers: `listBudgetsHandler` (no `household_id` required), `createBudgetHandler`, `getBudgetHandler`, `getBudgetStatusHandler`, `updateBudgetHandler`, `deleteBudgetHandler`. Auth gate changes: household budgets still require active admin membership; personal budgets require `currentUser.id == ownerUserId`.
- TMA: update `BudgetDTO`/`useBudgetListQuery` for the new shape; refactor `budget-list-page.tsx` to a merged list sorted by `period DESC` with a `Cá nhân` / `Household` chip; refactor `create-budget-page.tsx` to add a scope toggle (Cá nhân vs Household) and a currency input for personal scope.
- Web: parity — same contract change, `budgets-page.tsx` and `create-budget-dialog.tsx` adopt the union list and scope toggle.
- Integration tests: `apps/worker/test/integration/budgets-*.spec.ts` cover personal scope happy path, list-merge, status aggregate (filters by `spent_by_user_id`), 403/404/409 paths.
- TMA unit tests: presentation helpers for the new scope chip, latest-budget pick across scopes, scope-aware form payload.
- Harness: new `feat-100` record + index update + `progress.md` entry; ExecPlan index update.
- Spec: tighten `docs/product-specs/shared/budget-management.md` acceptance criteria for personal scope (currency, list-merge, status aggregate, ownership gate).

Out of scope (explicit):

- Group event budgets (still group-owned, no new API).
- Cross-currency conversion. Personal budgets accept a `currencyCode`; the user picks the same currency for every personal budget (default VND).
- Push/email notifications.
- Budget templates, rollover, or recurring budgets.
- TMA visual smoke in a real Telegram WebView (env cannot provide authenticated launch).
- An admin policy change: `household-policy.ts` keeps `manageBudgets = admin`; personal budget does not introduce a new permission.
- Removing existing household `idx_budgets_household_scope_month`; we keep it and add a second partial unique index for personal scope.

## Non-negotiable Requirements

- The plan must keep household budgets fully working with no contract breakage (api-contract-and-validation.md: widening, not breaking).
- Personal expenses aggregate rule is identical to the existing personal-expense path (`expense-query-scope.ts:28-31`): `e.spent_by_user_id = ? AND e.household_id IS NULL`.
- Personal budget ownership: `currentUser.id == ownerUserId`. Any other user gets `notFound` (no information leak about existence), matching the existing get/delete pattern.
- Monthly budget semantics remain: `period` is still `YYYY-MM`. No weekly/yearly personal budgets.
- All budget category limits still key by the global expense category catalog (`docs/product-specs/shared/budget-management.md:31`).
- TMA must not import from `apps/web`. Web must not import from `apps/tma` or `apps/worker`.
- Validation/refine rules: a `CreateBudgetRequest` must satisfy exactly one of `{householdId}` (scope household) or `{ownerUserId}` (scope personal), never both and never neither. Both `householdId` and `ownerUserId` may be omitted on list — default returns both scopes for the current user.
- Use `./init.sh <param>` for verification; full `./init.sh` only at the end.

## Standards and Reference Docs

Backend:

- `docs/BACKEND.md`
- `docs/references/backend/architecture-and-boundaries.md`
- `docs/references/backend/api-contract-and-validation.md`
- `docs/references/backend/database-pattern.md`
- `docs/references/backend/security-and-auth-pattern.md`
- `docs/references/shared/type-naming-pattern.md`

Frontend (TMA + web):

- `docs/TMA.md`
- `docs/references/frontend/tma/app-structure-and-client-rules.md`
- `docs/references/frontend/tma/native-ui-and-navigation-pattern.md`
- `docs/WEB.md`
- `docs/references/frontend/web/api-react-query-pattern.md`
- `docs/references/frontend/web/dialog-and-form-pattern.md` (web create dialog)
- `docs/references/frontend/web/naming-and-conventions-pattern.md`

Product truth to update:

- `docs/product-specs/shared/budget-management.md` (acceptance criteria for personal scope)
- `docs/exec-plans/index.md` (active entry)

Harness:

- `harness/feature_index.json`
- `harness/features/feat-100.json` (new record)
- `harness/progress.md`

## Context and Orientation

Key files to know before editing:

- DB schema: `apps/worker/migrations/0001_init.sql:169-189` (`budgets` table and CHECK) and `:295-316` (indexes).
- Worker routes: `apps/worker/src/routes/budgets.ts:26-31` (list endpoint).
- Worker contracts: `apps/worker/src/contracts/budget-types.ts`, `budget-schemas.ts`.
- Worker handlers: `apps/worker/src/handlers/budgets/{list,create,get,get-status,update,delete}-budget.ts`.
- Worker repository: `apps/worker/src/db/repositories/budget-repository.ts`, `budget-row-mapper.ts`, `budget-spend-summary-repository.ts`, `expense-query-scope.ts`.
- Permissions: `apps/worker/src/lib/permissions/household-policy.ts:29` (`canManageBudgets = admin`).
- Audit log: `apps/worker/src/db/repositories/audit-log-repository.ts:4` (`householdId` is already nullable; pass `null` for personal events).
- TMA budget feature: `apps/tma/src/features/budgets/{api.ts, types.ts, presentation.ts, pages/budget-list-page.tsx, pages/create-budget-page.tsx}`.
- TMA test references: `apps/tma/src/test/budget-presentation.test.ts`, `budget-detail-page.test.tsx`.
- Web budget feature: `apps/web/src/features/budgets/{types/budget.ts, hooks/use-budgets.ts, pages/budgets-page.tsx, components/create-budget-dialog.tsx}`.
- Worker integration test layout: `apps/worker/test/integration/budgets-*.spec.ts` and helpers in `apps/worker/test/helpers/test-context.ts`.
- TMA currency: `apps/tma/src/lib/formatters.ts` and the household currency selector already used in `CreateBudgetDialog` (web).

Current behaviour to keep:

- TMA list page already sorts by `period DESC` (`apps/tma/src/features/budgets/pages/budget-list-page.tsx:105-107`). Sort logic stays; the household dropdown drops.
- `getLatestBudget` in `presentation.ts:67-72` is scope-agnostic by `period` string and works as-is.

## Plan of Work (Narrative)

### Step 1 — D1 migration `0003_personal_budgets.sql`

Create `apps/worker/migrations/0003_personal_budgets.sql`:

1. Widen `budgets.scope` CHECK to `('household', 'category', 'personal')`.
2. Make `budgets.household_id` nullable; add `CHECK ((scope = 'household' AND household_id IS NOT NULL) OR (scope = 'personal' AND household_id IS NULL))`. Mirror the existing pattern at `0001_init.sql:145-148` for `expenses`.
3. Add `owner_user_id TEXT` with `FOREIGN KEY(owner_user_id) REFERENCES users(id) ON DELETE RESTRICT`. Add `CHECK ((scope = 'personal' AND owner_user_id IS NOT NULL) OR (scope = 'household' AND owner_user_id IS NULL))`.
4. Add a partial unique index `idx_budgets_personal_owner_month` on `(owner_user_id, budget_month) WHERE scope = 'personal' AND archived_at IS NULL` so a user has at most one personal budget per month. The existing `idx_budgets_household_scope_month` (line 295) stays.
5. Add `idx_budgets_owner_user_id` for list-by-user.

Re-create the migration runner output; no D1 reset.

### Step 2 — Worker contracts

`apps/worker/src/contracts/budget-types.ts`:

- Add `BudgetScope = 'household' | 'personal'` to the file. Keep `'category'` only inside the row mapper (the type union narrows for the API surface; row mapper stays loose).
- Extend `BudgetDTO` with `scope: BudgetScope` and `ownerUserId: string | null`.
- Extend `BudgetStatusDTO` with `scope: BudgetScope`, `ownerUserId: string | null`.
- No rename — keep the `DTO` suffix per `docs/references/shared/type-naming-pattern.md`.

`apps/worker/src/contracts/budget-schemas.ts`:

- `createBudgetBodySchema`: drop `householdId` from the body shape; the handler now reads `scope` and the matching identifier from the top-level body and validates the discriminated union via a `.refine`. Add a sibling exported factory `createBudgetDiscriminatedBodySchema()` returning a Zod discriminated union: `{ scope: 'household', householdId: string, period, totalLimit, categoryLimits? }` or `{ scope: 'personal', ownerUserId: string, currencyCode: string, period, totalLimit, categoryLimits? }`. `currencyCode` for personal is required (e.g., VND, USD) and must match `/^[A-Z]{3}$/`. Per-category `limitMinor` still must be `<= totalLimit` (mirror existing constraint, see `create-budget-page.tsx:123`).
- `budgetListQuerySchema`: make `household_id` optional; add optional `scope` (`'household' | 'personal' | 'all'`), optional `owner_user_id`, optional `period`. Validate at most one of `household_id` / `owner_user_id` is present (a refine rule).
- `updateBudgetRequestSchema` is unchanged (only mutates `totalLimit` + `categoryLimits`).

### Step 3 — Worker repository

`apps/worker/src/db/repositories/budget-row-mapper.ts`:

- Widen `StoredBudget.scope` to `'household' | 'category' | 'personal'`. Add `ownerUserId: string | null`. Update `mapBudgetRow` and the column list to include `owner_user_id`.

`apps/worker/src/db/repositories/budget-repository.ts`:

- `CreateBudgetInput` adds `scope: 'household' | 'personal'`, `ownerUserId: string | null`, accepts `currencyCode` from the caller (no longer derived from household when personal).
- `createBudget` writes the new columns, binds `ownerUserId` (or `null`), and uses the input `currencyCode` directly.
- Add `listBudgetsForUser(db, { userId, scope?, period? })` returning all active budgets the user can see. SQL: when `scope = 'household'`, list every active budget where the user has an active `household_membership` on `b.household_id`; when `scope = 'personal'`, list every active budget where `b.owner_user_id = ?`; when omitted, union the two with `UNION ALL`, ordered by `budget_month DESC`. Pattern: see `expense-query-scope.ts:13-31` for the active-membership predicate.
- Add `findPersonalBudgetByPeriod(db, ownerUserId, period)` so the create handler can do the personal-scope conflict check.
- Keep `listBudgetsByHousehold` (used by the seeded budget-read tests / analytics helpers) but mark it internal; the handler stops using it.

`apps/worker/src/db/repositories/budget-spend-summary-repository.ts`:

- Branch on scope:
  - household: unchanged path (`e.household_id = ?`).
  - personal: `e.spent_by_user_id = ? AND e.household_id IS NULL`.
- Keep the function signature `getBudgetSpendSummary(db, { householdId, startDate, endDate, categoryKeys })` for the household path, and add a sibling `getPersonalBudgetSpendSummary(db, { ownerUserId, startDate, endDate, categoryKeys })`. Handler picks the right one based on `budget.scope`.

### Step 4 — Worker handlers

`apps/worker/src/handlers/budgets/list-budgets.ts`:

- After the existing query parse, if no filter is supplied, call `listBudgetsForUser(db, currentUser.id)`; otherwise narrow: `household_id` only → list household budgets where the user is an active member; `owner_user_id` only → list personal budgets owned by that user (verify `owner_user_id === currentUser.id` else `notFound`); `scope` only → narrow.
- The DTO mapping now includes `scope` and `ownerUserId`.

`apps/worker/src/handlers/budgets/create-budget.ts`:

- Read top-level `scope` from `raw`. If `scope === 'household'`, require `householdId` (existing behavior, membership + admin gate, currency from household). If `scope === 'personal'`, require `ownerUserId === currentUser.id` and `currencyCode`; run `findPersonalBudgetByPeriod` for the conflict check; no household membership needed.
- Audit log: pass `householdId: null` for personal events, `householdId` for household events; `actorUserId = currentUser.id`.

`apps/worker/src/handlers/budgets/get-budget.ts`:

- After `findBudgetById`, branch: if `budget.scope === 'household'`, run the existing household membership check; if `'personal'`, compare `budget.ownerUserId === currentUser.id` (else `notFound`).
- Return `scope` and `ownerUserId` in the DTO.

`apps/worker/src/handlers/budgets/get-budget-status.ts`:

- Same ownership gate as get.
- Aggregate via the personal-spend helper when `scope === 'personal'`.
- Include `scope` and `ownerUserId` in the response.

`apps/worker/src/handlers/budgets/update-budget.ts` and `delete-budget.ts`:

- Apply the same ownership gate. `canManageBudgets(membership.role)` only when `scope === 'household'`. Personal update/delete are allowed when the caller is the owner. Audit log: `householdId: null` for personal.

### Step 5 — TMA contracts and API

`apps/tma/src/features/budgets/types.ts`:

- Mirror the worker `BudgetDTO` extension: add `scope: 'household' | 'personal'`, `ownerUserId: string | null`. Same for `BudgetStatusDTO`.

`apps/tma/src/features/budgets/api.ts`:

- `listBudgets`: keep the call signature but drop the required `householdId`; accept an optional `query: { householdId?, scope?, period? }`. Query key becomes `BUDGET_KEYS.list(scope, period, ownerUserId)` to align with the unioned fetch.
- `useBudgetListQuery`: signature becomes `useBudgetListQuery(input?: { householdId?: string; scope?: 'household' | 'personal' | 'all'; period?: string })`. Default `scope = 'all'`, no required args. The list-page calls it with no args for the unified view.

### Step 6 — TMA presentation and list page

`apps/tma/src/features/budgets/presentation.ts`:

- Add `getBudgetScopeLabel(scope)` returning `Cá nhân` or `Household`.
- Add `getBudgetScopeTone(scope)` returning `'primary' | 'neutral'` for the chip.
- `getLatestBudget` is already period-agnostic; keep it.

`apps/tma/src/features/budgets/pages/budget-list-page.tsx`:

- Drop the household `<select>` and the `useHouseholdsQuery` budget-hub section that depends on it.
- Call `useBudgetListQuery({ scope: 'all' })` and sort by `period DESC` (already in place).
- Header chip in `BudgetListCard` shows the scope label and tone. Card subtitle distinguishes the source: `Cá nhân · user display name` or `Household · {household name}`. Resolve display name via `useHouseholdsQuery` only for the household cards.
- "Tạo mới" button is always visible (no role gate at the list level — the create page gates by scope). Empty state copy says "Tạo ngân sách tháng đầu tiên cho cá nhân hoặc household."

### Step 7 — TMA create page

`apps/tma/src/features/budgets/pages/create-budget-page.tsx`:

- Add a scope toggle (`Cá nhân` | `Household`) at the top of the form. Use existing TMA UI primitives (`SegmentedControl` if present, else a custom pair of buttons).
- When scope = `household`: keep the current household `<select>` (admin only, with existing UX). Currency hidden (uses household default).
- When scope = `personal`: hide the household `<select>`. Show a `Currency` selector (VND default, allow USD/EUR etc. for future). Owner = current user (derived from auth, not shown).
- Submission passes `{ scope, householdId?, ownerUserId?, currencyCode?, period, totalLimit, categoryLimits? }` to the worker. Use the existing `buildBudgetMutationRequest` and extend it (or add `buildPersonalBudgetMutationRequest`) to also map scope-aware fields.

### Step 8 — TMA tests

- Extend `apps/tma/src/test/budget-presentation.test.ts` with cases for `getBudgetScopeLabel`, `getBudgetScopeTone`, and a multi-scope `getLatestBudget` test.
- Add `apps/tma/src/test/budget-list-page.test.tsx` asserting the merged list renders cards for both scopes and the "Cá nhân" / "Household" chips.
- Add `apps/tma/src/test/budget-create-page.test.tsx` asserting the scope toggle hides/shows household vs currency fields and produces the right payload.

### Step 9 — Web parity

- `apps/web/src/features/budgets/types/budget.ts`: mirror `scope` + `ownerUserId` on `BudgetDTO` and `BudgetStatusDTO`.
- `apps/web/src/features/budgets/hooks/use-budgets.ts`: `useBudgetListQuery` becomes unified (no required `householdId`); the budgets page calls it with no arg to get the merged list, sorts by `period DESC`, and renders a scope badge per card. `CreateBudgetDialog` gets the same scope toggle and currency selector pattern. `useCreateBudgetMutation` payload updates to send `{ scope, householdId?, ownerUserId?, currencyCode?, period, totalLimit, categoryLimits? }`.
- `apps/web/src/features/budgets/components/budget-list.tsx`, `budget-card.tsx`, `budget-summary-card.tsx`, `create-budget-dialog.tsx`, `edit-budget-dialog.tsx`: render scope chip; gate admin-only on household scope; gate owner-only on personal scope.

### Step 10 — Worker integration tests

- New `apps/worker/test/integration/budgets-personal-scope.spec.ts`:
  - Creates a personal budget; second attempt same period → 409.
  - `GET /budgets` returns the personal budget alongside the household budget (if the test user also belongs to a household).
  - `GET /budgets?scope=personal` filters to personal only; `GET /budgets?scope=household` filters to household only.
  - `GET /budgets/:id/status` for a personal budget returns `totalActualMinor` aggregated only from the owner's personal expenses (seed at least 2 expenses for the owner — 1 personal, 1 household — and assert household expense is excluded).
  - User A cannot get/update/delete user B's personal budget (404).
- Extend `apps/worker/test/integration/budgets-create-list.spec.ts` to assert the unioned list shape: `items[i].scope` is present and equals `'household' | 'personal'`.

### Step 11 — Spec and harness

- Tighten `docs/product-specs/shared/budget-management.md` (add an "Acceptance Criteria" row for personal scope, list-merge behaviour, currency rule, ownership gate). Surface-agnostic.
- Create `harness/features/feat-100.json` with status `in_progress`, dependencies `[feat-007, feat-026, feat-027, feat-083, feat-098]`, and `evidence.planned` mirroring the 11 steps above.
- Add the new feature to `harness/feature_index.json`.
- Add the active plan entry to `docs/exec-plans/index.md` (Active list, top of list).
- Append a `harness/progress.md` entry dated 2026-06-12 summarizing the migration + contract widening, with a "still in progress" note until the verification step finishes.

## Concrete Steps (Commands)

Run from repo root. Use focused runs for slice work; full `./init.sh` only at final verification.

```bash
# 1. D1 local migration
pnpm --filter worker db:migrate:local

# 2. Worker unit + focused integration after each handler slice
pnpm --filter worker exec vitest run test/integration/budgets-create-list.spec.ts
pnpm --filter worker exec vitest run test/integration/budgets-personal-scope.spec.ts

# 3. TMA focused tests after presentation/list/create work
pnpm --filter tma exec vitest run src/test/budget-presentation.test.ts src/test/budget-list-page.test.tsx src/test/budget-create-page.test.tsx src/test/budget-detail-page.test.tsx

# 4. Web focused tests after parity slice
pnpm --filter web exec vitest run --reporter=default src/features/budgets

# 5. Typecheck + lint per app
pnpm --filter worker typecheck
pnpm --filter worker lint
pnpm --filter tma typecheck
pnpm --filter tma lint
pnpm --filter web typecheck
pnpm --filter web lint

# 6. Final verification
./init.sh test
./init.sh build
./init.sh
```

Expected short outputs:

- Migration step: `Migrations: 0003_personal_budgets.sql` applied; no errors.
- TMA focused tests pass with the new tests included.
- `./init.sh test`, `./init.sh build` print `OK`.
- Final `./init.sh` prints `Done!`.

## Validation and Acceptance

- `curl -sSf -X POST -H "Authorization: Bearer $TOKEN" -H "content-type: application/json" -d '{"scope":"personal","ownerUserId":"<me>","currencyCode":"VND","period":"2026-06","totalLimit":1500000}' http://localhost:8787/api/v1/budgets` returns HTTP 201 and a `BudgetDTO` with `scope: "personal"`, `ownerUserId: "<me>"`, `householdId: null`.
- Second POST same period returns 409 conflict.
- `GET /api/v1/budgets` returns a unioned list (personal + household) sorted by `budget_month DESC`.
- `GET /api/v1/budgets?scope=personal` returns only personal budgets; `GET /api/v1/budgets?scope=household` returns only household.
- `GET /api/v1/budgets/<personalId>/status` aggregates only the owner's personal expenses (assert via integration test that mixes 1 personal + 1 household expense in the same month).
- A different authenticated user calling `GET /api/v1/budgets/<personalId>` receives 404.
- TMA `/budgets` renders both personal and household cards in one scroll, sorted newest period first, with a "Cá nhân"/"Household" chip on each card. The household dropdown is gone.
- TMA `/budgets/new` has a scope toggle. Choosing `Cá nhân` hides the household selector and shows a currency selector; choosing `Household` reverses the field set.
- Web `/budgets` mirrors the same list view and the create dialog mirrors the same scope toggle.
- `./init.sh` final run prints `Done!`.

## Idempotence & Recovery

- Migration `0003_personal_budgets.sql` is additive: widens a CHECK, makes a column nullable, adds a column and two indexes. Re-running the migration locally applies the new schema; on remote D1, deploy via the standard wrangler migration flow.
- If a CHECK widening fails on remote D1 because the existing data violates `scope IN (..., 'personal')`, the migration will fail. Today the column already only contains `'household' | 'category'`, so widening is safe. To roll back: re-deploy the previous migration version. Personal budget rows can be archived via `softDeleteBudget` before rollback.
- No destructive data changes.

## Artifacts and Notes

- New files: `apps/worker/migrations/0003_personal_budgets.sql`, `apps/worker/test/integration/budgets-personal-scope.spec.ts`, `apps/tma/src/test/budget-list-page.test.tsx`, `apps/tma/src/test/budget-create-page.test.tsx`, `harness/features/feat-100.json`.
- Updated files: `apps/worker/src/contracts/budget-types.ts`, `budget-schemas.ts`; `apps/worker/src/db/repositories/{budget-repository,budget-row-mapper,budget-spend-summary-repository}.ts`; `apps/worker/src/handlers/budgets/{list,create,get,get-status,update,delete}-budget.ts`; `apps/worker/test/integration/budgets-create-list.spec.ts`; `apps/tma/src/features/budgets/{api,types,presentation}.ts`; `apps/tma/src/features/budgets/pages/{budget-list-page,create-budget-page}.tsx`; `apps/tma/src/test/budget-presentation.test.ts`; `apps/web/src/features/budgets/{types/budget.ts,hooks/use-budgets.ts,pages/budgets-page.tsx,components/budget-list.tsx,components/budget-card.tsx,components/budget-summary-card.tsx,components/create-budget-dialog.tsx,components/edit-budget-dialog.tsx}`; `docs/product-specs/shared/budget-management.md`; `docs/exec-plans/index.md`; `harness/feature_index.json`; `harness/progress.md`.
- Reuse: the TMA `BudgetDetailPage` (`apps/tma/src/features/budgets/pages/budget-detail-page.tsx`) keeps working with the new DTO because it consumes `BudgetDTO` and `BudgetStatusDTO` generically; verify the new fields don't break it.
- No GitNexus detect_changes call is required for this plan's *writing* phase. Detect-change evidence will be added to `harness/features/feat-100.json` after the final `./init.sh` run.

## Interfaces & Dependencies

- Worker D1: only the new migration.
- Worker Zod: `zod` (already in `apps/worker/package.json`).
- TMA: `@/lib/api/client` (`apps/tma/src/lib/api/client.ts`), `@/features/home/api` for `useHouseholdsQuery`.
- Web: `@/api/client`, `@/stores/household.store` (used for households list).
- No new third-party packages.

## Open Decisions / Decision Log

- Decision: Widen the DB `budgets.scope` to add `'personal'`, keep the existing `idx_budgets_household_scope_month` partial index, and add a sibling partial unique index for personal scope.
  Rationale: additive, no rename, mirrors the existing `expenses` CHECK + index pattern at `0001_init.sql:145-148, :265-275`.
  Date/Author: 2026-06-12 / Codex
- Decision: `currencyCode` is required on personal create, optional/default-from-household on household create.
  Rationale: `users` has no `default_currency_code`; accepting it on the request keeps the personal budget self-describing and avoids inventing a user-level currency default.
  Date/Author: 2026-06-12 / Codex
- Decision: Personal budget ownership gate uses `notFound` (not `forbidden`) on cross-user access, matching the existing get/delete behaviour at `get-budget.ts:44-46`.
  Rationale: avoids leaking existence of a budget owned by another user.
  Date/Author: 2026-06-12 / Codex
- Decision: List endpoint widens to return both scopes by default; an explicit `scope` query narrows it.
  Rationale: this is the user-visible ask ("list budget theo period, không filter theo household"). Per `api-contract-and-validation.md` the widening is additive, no field is renamed.
  Date/Author: 2026-06-12 / Codex
- Decision: No new `HouseholdPermission` value. Personal budget admin is `currentUser.id == ownerUserId`, gated inline in the handler.
  Rationale: `household-policy.ts` only models household role permissions; personal budget is user-scoped and does not need to participate in that enum.
  Date/Author: 2026-06-12 / Codex

## Progress

- [x] 2026-06-12 Grilled with docs; direction locked.
- [x] 2026-06-12 ExecPlan written.
- [ ] 2026-06-12 Step 1: D1 migration `0003_personal_budgets.sql`.
- [ ] 2026-06-12 Step 2: Worker contracts widened.
- [ ] 2026-06-12 Step 3: Worker repository updates.
- [ ] 2026-06-12 Step 4: Worker handlers updated.
- [ ] 2026-06-12 Step 5: TMA contracts and API.
- [ ] 2026-06-12 Step 6: TMA list page refactor.
- [ ] 2026-06-12 Step 7: TMA create page refactor.
- [ ] 2026-06-12 Step 8: TMA tests.
- [ ] 2026-06-12 Step 9: Web parity.
- [ ] 2026-06-12 Step 10: Worker integration tests.
- [ ] 2026-06-12 Step 11: Spec + harness.
- [ ] 2026-06-12 Final `./init.sh` and evidence in `harness/features/feat-100.json`.

## Outcomes & Retrospective

(Filled at completion.)
