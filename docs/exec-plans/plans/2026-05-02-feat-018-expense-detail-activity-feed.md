# feat-018: Expense Detail & Activity Feed

## TL;DR

> **Quick Summary**: Full-stack expense read flows — backend `GET /api/v1/expenses` (cursor-paginated feed with visibility enforcement and basic filters) and `GET /api/v1/expenses/:id` (single expense detail with 403 for unauthorized access), plus frontend Expense Feed page (chronological list with infinite scroll) and Expense Detail page (full metadata display). Does NOT include filter UI controls (feat-021) or edit/delete (feat-019).
> 
> **Deliverables**:
> - Database migration 0004 (new index for personal feed query)
> - Worker: list expenses contract, repository, handler, route; get expense detail handler + route
> - Web: types, API functions, React Query hooks, expense feed page, expense detail page
> - Full test coverage (unit + integration)
> - i18n labels for all new UI strings
> 
> **Estimated Effort**: Large
> **Parallel Execution**: YES - 4 waves
> **Critical Path**: Migration → Contract → Repo → Handler → Web Types → API → Hooks → Feed → Detail

---

## Context

### Original Request
Implement feat-018: Expense detail & activity feed — the next pending feature after feat-017 expense creation.

### Key Decisions
1. **Activity feed = expense feed**: The "activity feed" in feat-018 refers to the chronological expense list, NOT audit_logs. The feed shows expenses in reverse chronological order (newest first).
2. **Backend supports filters but frontend defers filter UI to feat-021**: `GET /expenses` supports `date_from`, `date_to`, `category_key`, `payer_id`, `visibility` as query params, but the frontend feed page has NO filter controls — just a plain chronological list.
3. **Visibility enforcement**: Private expenses visible only to creator; household expenses visible to members of that household. The server enforces this — no client-side filtering.
4. **Cursor-based pagination**: Per expense-querying.md, use cursor pagination (not offset). Cursor = `occurred_at` timestamp + `id` for tie-breaking.
5. **Expense detail**: `GET /expenses/:id` returns 403 if caller cannot see it (not 404, to prevent enumeration).
6. **Personal feed context**: When no `household_id` filter is provided, the API returns the user's personal feed (their private expenses + all household expenses they can see). When `household_id` is provided, only that household's shared expenses are returned.
7. **Soft-delete exclusion**: All queries exclude `deleted_at IS NOT NULL` rows.

### Research Findings
- **Existing indexes**: `idx_expenses_household_occurred_at`, `idx_expenses_household_visibility_occurred_at`, `idx_expenses_created_by_user_id` — but no composite index for personal feed query `(created_by_user_id, visibility, occurred_at DESC)`. Migration 0004 needed.
- **Existing repo**: `findExpenseById` exists but doesn't check visibility — handler must enforce it.
- **Existing contract**: `expensePathParamsSchema` already exists for `:id` param validation.
- **Existing web hooks**: `EXPENSE_KEYS` has `all` and `detail(id)` key factories — need to add `list(filters)` key factory.
- **Existing web types**: `ExpenseDTO` matches backend shape — need to add `ExpenseListResponse` and `ExpenseListParams` types.
- **Placeholder page**: `/expenses` currently renders `PlaceholderPage` — will be replaced with actual feed.
- **PATHS constant**: Has `EXPENSES: '/expenses'` and `ADD_EXPENSE: '/expenses/new'` — need to add `EXPENSE_DETAIL: '/expenses/[id]'`.

---

## Work Objectives

### Core Objective
Enable authenticated users to view their expense feed (personal or household context) and individual expense details, with server-enforced visibility rules ensuring private expenses stay personal and household expenses are only visible to members.

### Concrete Deliverables
- `apps/worker/migrations/0004_expense_feed_index.sql`
- `apps/worker/src/contracts/expense.ts` (updated with list query schema)
- `apps/worker/src/db/repositories/expense-repository.ts` (updated with list + visibility-enforced find)
- `apps/worker/src/handlers/expenses/list-expenses.ts`
- `apps/worker/src/handlers/expenses/get-expense.ts`
- `apps/worker/src/routes/expenses.ts` (updated with GET routes)
- `apps/worker/test/integration/expenses-list.spec.ts`
- `apps/worker/test/integration/expenses-detail.spec.ts`
- `apps/web/src/types/expense.ts` (updated with list types)
- `apps/web/src/api/expense.ts` (updated with list + detail functions)
- `apps/web/src/api/endpoints.ts` (updated with list + detail endpoints)
- `apps/web/src/hooks/api/use-expense.ts` (updated with list + detail hooks)
- `apps/web/src/components/expense/expense-feed-item.tsx`
- `apps/web/src/components/expense/expense-feed-list.tsx`
- `apps/web/src/components/expense/expense-detail-card.tsx`
- `apps/web/src/views/app/expenses-page.tsx`
- `apps/web/src/views/app/expense-detail-page.tsx`
- `apps/web/src/app/(protected)/expenses/page.tsx` (updated from placeholder)
- `apps/web/src/app/(protected)/expenses/[id]/page.tsx` (new)
- `apps/web/src/lib/constants/paths.ts` (updated with EXPENSE_DETAIL)
- `apps/web/src/lib/i18n/locales/vi.json` (updated with feed/detail labels)

### Definition of Done
- [ ] `./init.sh` passes (lint, typecheck, test, build)
- [ ] Migration 0004 applies cleanly
- [ ] Worker unit tests for expense list contract validation pass
- [ ] Worker integration tests for expense list + detail flows pass
- [ ] `GET /api/v1/expenses` returns paginated expenses with visibility enforcement
- [ ] `GET /api/v1/expenses` with `household_id` returns only that household's shared expenses
- [ ] `GET /api/v1/expenses/:id` returns expense detail for authorized users
- [ ] `GET /api/v1/expenses/:id` returns 403 for unauthorized access (not 404)
- [ ] `GET /api/v1/expenses` excludes soft-deleted expenses
- [ ] Expense Feed page renders chronological list with infinite scroll
- [ ] Expense Detail page renders full metadata
- [ ] Harness evidence updated in `feat-018.json` and `feature_index.json`

### Must Have
- Expense list API with cursor-based pagination and visibility enforcement
- Expense detail API with 403 for unauthorized access
- Expense Feed page (chronological list, infinite scroll, no filter UI)
- Expense Detail page (full metadata display)
- Database migration for personal feed index
- Full test coverage (unit + integration)
- Vietnamese i18n labels for all new UI strings

### Must NOT Have (Guardrails)
- Filter UI controls (feat-021 scope)
- Expense edit/delete/restore endpoints (feat-019)
- Quick-add UI or offline queueing (feat-024/025)
- Group assignment display (feat-022/023)
- Full-text search on notes (future enhancement)
- Aggregated totals/summary endpoint (future enhancement)
- `SELECT *` in repository queries
- SQL in route handlers
- Hardcoded secrets or credentials
- Console.log in production code
- AI slop: over-abstraction, excessive JSDoc, generic names, unnecessary wrappers around shadcn primitives

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: YES (Vitest for worker, Vitest for web)
- **Automated tests**: YES (TDD for contracts, integration for handlers, component for feed/detail)
- **Framework**: Vitest (worker + web)
- **If TDD**: Each backend task follows RED (failing test) → GREEN (minimal impl) → REFACTOR

### QA Policy
Every task includes agent-executed QA scenarios with evidence capture.

- **Backend**: Bash (curl) — Send requests, assert status + response fields
- **Frontend**: Bash (pnpm test) — Run component tests, assert rendering and behavior

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately - foundation):
├── Task 1: Database migration 0004 [deep]
├── Task 2: Worker expense list contract (Zod schemas) [quick]
├── Task 3: Web expense list/detail types + API types [quick]
└── Task 4: Web i18n labels for feed/detail [quick]

Wave 2 (After Wave 1 - core backend + API):
├── Task 5: Worker expense repository — list + visibility-enforced find (depends: 1, 2) [deep]
├── Task 6: Worker expense handlers + routes (depends: 1, 2, 5) [deep]
├── Task 7: Web API module + endpoints + hooks (depends: 2, 3) [quick]
└── Task 8: Worker tests + messages (depends: 2, 5, 6) [deep]

Wave 3 (After Wave 2 - frontend UI):
├── Task 9: Expense feed item + list components (depends: 3, 4, 7) [visual-engineering]
├── Task 10: Expense detail card component (depends: 3, 4, 7) [visual-engineering]
└── Task 11: Expense feed page + detail page + routes (depends: 7, 9, 10) [unspecified-high]

Wave FINAL (After ALL tasks — 4 parallel reviews):
├── Task F1: Plan compliance audit (oracle)
├── Task F2: Code quality review (unspecified-high)
├── Task F3: Real manual QA (unspecified-high)
└── Task F4: Scope fidelity check (deep)
-> Present results -> Get explicit user okay

Critical Path: Task 1 → Task 2 → Task 5 → Task 6 → Task 8 → Task 9 → Task 11 → F1-F4 → user okay
Parallel Speedup: ~45% faster than sequential
Max Concurrent: 4 (Wave 1)
```

### Dependency Matrix

| Task | Depends On | Blocks |
|------|-----------|--------|
| 1 (migration) | - | 5, 6 |
| 2 (contract) | - | 5, 6, 7, 8 |
| 3 (web types) | - | 7, 9, 10 |
| 4 (i18n) | - | 9, 10 |
| 5 (repository) | 1, 2 | 6, 8 |
| 6 (handlers+routes) | 1, 2, 5 | 8 |
| 7 (web API+hooks) | 2, 3 | 9, 10, 11 |
| 8 (worker tests) | 2, 5, 6 | - |
| 9 (feed components) | 3, 4, 7 | 11 |
| 10 (detail component) | 3, 4, 7 | 11 |
| 11 (pages+routes) | 7, 9, 10 | - |

### Agent Dispatch Summary

- **Wave 1**: 4 tasks — T1 → `deep`, T2 → `quick`, T3 → `quick`, T4 → `quick`
- **Wave 2**: 4 tasks — T5 → `deep`, T6 → `deep`, T7 → `quick`, T8 → `deep`
- **Wave 3**: 3 tasks — T9 → `visual-engineering`, T10 → `visual-engineering`, T11 → `unspecified-high`
- **FINAL**: 4 tasks — F1 → `oracle`, F2 → `unspecified-high`, F3 → `unspecified-high`, F4 → `deep`

---

## TODOs

- [ ] 1. Database Migration 0004 — personal feed index

  **What to do**:
  - Create `apps/worker/migrations/0004_expense_feed_index.sql`
  - Add composite index `idx_expenses_user_visibility_occurred_at` on `(created_by_user_id, visibility, occurred_at DESC)` — optimizes the personal feed query where a user sees their own private expenses plus household expenses they created
  - Add composite index `idx_expenses_deleted_at` on `(deleted_at)` — optimizes the soft-delete exclusion filter (`WHERE deleted_at IS NULL`)
  - Verify with: `pnpm --filter worker db:migrate:local`

  **Must NOT do**:
  - Do NOT modify existing indexes
  - Do NOT add columns or constraints
  - Do NOT add indexes for filter columns that won't be used in feat-018 (e.g., `amount_minor` for sort — that's feat-021 scope)

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: [`database-reviewer`]

  **Parallelization**:
  - **Can Run In Parallel**: YES — with Tasks 2, 3, 4
  - **Parallel Group**: Wave 1
  - **Blocks**: Tasks 5, 6
  - **Blocked By**: None

  **References**:
  - `apps/worker/migrations/0001_init.sql` — Current `expenses` table schema and existing indexes
  - `apps/worker/migrations/0003_expense_category_key_source_key.sql` — Previous migration for pattern reference
  - `docs/product-specs/data-visibility.md` — Visibility model rules (private vs household)
  - `docs/product-specs/expense-querying.md` — Query parameters and pagination requirements
  - `docs/references/backend/database-pattern.md` — Database naming and integrity rules

  **Acceptance Criteria**:
  - [ ] File `apps/worker/migrations/0004_expense_feed_index.sql` exists with valid D1 SQL
  - [ ] `pnpm --filter worker db:migrate:local` runs without error
  - [ ] After migration, `idx_expenses_user_visibility_occurred_at` index exists
  - [ ] After migration, `idx_expenses_deleted_at` index exists

  **QA Scenarios**:

  ```
  Scenario: Migration applies cleanly to fresh database
    Tool: Bash
    Preconditions: Clean local D1 database
    Steps:
      1. Run `pnpm --filter worker db:migrate:local`
      2. Query D1 to verify indexes: `npx wrangler d1 execute DB --local --command "SELECT name FROM sqlite_master WHERE type='index' AND name LIKE 'idx_expenses%'"`
    Expected Result: Both new indexes appear in the list
    Failure Indicators: Migration error, missing indexes
    Evidence: .sisyphus/evidence/task-1-migration-clean.txt

  Scenario: Migration idempotent on re-run
    Tool: Bash
    Preconditions: Migration already applied
    Steps:
      1. Run `pnpm --filter worker db:migrate:local` again
    Expected Result: No error (migration tracker prevents re-run)
    Failure Indicators: Duplicate index errors
    Evidence: .sisyphus/evidence/task-1-migration-idempotent.txt
  ```

  **Commit**: YES (group with Wave 1)
  - Message: `feat(expense): add database migration 0004 for feed query indexes`
  - Files: `apps/worker/migrations/0004_expense_feed_index.sql`

- [ ] 2. Worker Expense List Contract — Zod query/response schemas

  **What to do**:
  - Update `apps/worker/src/contracts/expense.ts`
  - Add `expenseListQuerySchema` for `GET /expenses` query params:
    - `cursor` (z.string().optional()) — opaque cursor for pagination
    - `limit` (z.coerce.number().int().min(1).max(100).default(20)) — page size
    - `household_id` (z.string().optional()) — filter to a specific household's shared expenses
    - `date_from` (z.coerce.number().int().optional()) — filter start timestamp (ms epoch)
    - `date_to` (z.coerce.number().int().optional()) — filter end timestamp (ms epoch)
    - `category_key` (z.enum(REFERENCE_CATEGORY_KEYS).optional()) — filter by category
    - `payer_id` (z.string().optional()) — filter by payer
    - `visibility` (expenseVisibilitySchema.optional()) — filter by visibility (server still enforces access)
  - Add `ExpenseListResponse` type: `{ items: ExpenseDTO[], nextCursor: string | null }`
  - Add `ExpenseListQuery` type: `z.output<typeof expenseListQuerySchema>`
  - Add `expenseDetailPathParamsSchema` (already exists as `expensePathParamsSchema` — verify it's exported and usable for GET :id)
  - Export new schemas from `apps/worker/src/contracts/index.ts`
  - Create `apps/worker/test/unit/dto-expense-list.spec.ts` with unit tests for list query schema validation

  **Must NOT do**:
  - Do NOT add `sort` parameter (feat-021 scope)
  - Do NOT add `query` full-text search parameter (future scope)
  - Do NOT add `amount_min`/`amount_max` parameters (feat-021 scope)
  - Do NOT add `group_id` parameter (feat-022/023 scope)
  - Do NOT add `creator_id` parameter (not in feat-018 scope — use server-enforced `created_by_user_id`)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`backend-patterns`, `tdd-workflow`]

  **Parallelization**:
  - **Can Run In Parallel**: YES — with Tasks 1, 3, 4
  - **Parallel Group**: Wave 1
  - **Blocks**: Tasks 5, 6, 7, 8
  - **Blocked By**: None

  **References**:
  - `apps/worker/src/contracts/expense.ts` — Existing expense schemas (expenseVisibilitySchema, expensePathParamsSchema, REFERENCE_CATEGORY_KEYS)
  - `apps/worker/src/contracts/household.ts` — Zod schema pattern with locale-aware validation
  - `docs/product-specs/expense-querying.md` — Query parameters specification
  - `docs/product-specs/data-visibility.md` — Visibility enforcement rules
  - `docs/references/backend/api-contract-and-validation.md` — API contract rules

  **Acceptance Criteria**:
  - [ ] `expenseListQuerySchema` validates: valid list query with defaults, cursor pagination, date range filters, category filter, payer filter, visibility filter, household_id filter
  - [ ] `expenseListQuerySchema` rejects: limit > 100, limit < 1, invalid category_key, invalid visibility
  - [ ] `ExpenseListResponse` type defined with items and nextCursor
  - [ ] File `apps/worker/test/unit/dto-expense-list.spec.ts` exists and passes
  - [ ] New schemas exported from `apps/worker/src/contracts/index.ts`

  **QA Scenarios**:

  ```
  Scenario: Schema validates list query correctly
    Tool: Bash
    Preconditions: Contract file and test exist
    Steps:
      1. Run `pnpm --filter worker test -- --grep "expenseListQuerySchema"`
      2. Verify all validation tests pass
    Expected Result: All unit tests pass for list query validation
    Failure Indicators: Any test failure, schema accepting invalid data
    Evidence: .sisyphus/evidence/task-2-contract-tests.txt

  Scenario: Schema applies correct defaults
    Tool: Bash
    Steps:
      1. Run specific test for default limit=20
      2. Assert empty query object parses to { limit: 20 }
    Expected Result: Default limit applied correctly
    Failure Indicators: Default not applied
    Evidence: .sisyphus/evidence/task-2-defaults.txt
  ```

  **Commit**: YES (group with Wave 1)
  - Message: `feat(expense): add expense list query contract schemas`
  - Files: `apps/worker/src/contracts/expense.ts`, `apps/worker/src/contracts/index.ts`, `apps/worker/test/unit/dto-expense-list.spec.ts`

- [ ] 3. Web Expense List/Detail Types + API Types

  **What to do**:
  - Update `apps/web/src/types/expense.ts`
  - Add `ExpenseListParams` type: `{ cursor?: string, limit?: number, household_id?: string, date_from?: number, date_to?: number, category_key?: string, payer_id?: string, visibility?: ExpenseVisibility }`
  - Add `ExpenseListResponse` type: `{ items: ExpenseDTO[], nextCursor: string | null }`
  - Add `ExpenseDetailResponse` type: `ExpenseDTO` (same shape, but semantically distinct for clarity)
  - Update `apps/web/src/api/endpoints.ts` — add `expenses.list` and `expenses.detail` endpoints
  - Update `apps/web/src/api/expense.ts` — add `listExpenses(params)` and `getExpenseDetail(id)` functions

  **Must NOT do**:
  - Do NOT add filter UI types or components (feat-021)
  - Do NOT add sort parameter types (feat-021)
  - Do NOT duplicate types already in `reference-data.ts`

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`frontend-patterns`]

  **Parallelization**:
  - **Can Run In Parallel**: YES — with Tasks 1, 2, 4
  - **Parallel Group**: Wave 1
  - **Blocks**: Tasks 7, 9, 10
  - **Blocked By**: None

  **References**:
  - `apps/web/src/types/expense.ts` — Existing ExpenseDTO, CreateExpenseRequest types
  - `apps/web/src/types/household.ts` — HouseholdDTO type for reference
  - `apps/web/src/api/endpoints.ts` — Existing endpoint pattern
  - `apps/web/src/api/expense.ts` — Existing createExpense function pattern
  - `docs/references/frontend/api-react-query-pattern.md` — API + React Query pattern rules

  **Acceptance Criteria**:
  - [ ] `ExpenseListParams` type defined with all filter params
  - [ ] `ExpenseListResponse` type defined with items and nextCursor
  - [ ] `API_ENDPOINTS.expenses.list` and `API_ENDPOINTS.expenses.detail` exist
  - [ ] `listExpenses` and `getExpenseDetail` functions exist in `api/expense.ts`
  - [ ] `pnpm --filter web typecheck` passes

  **QA Scenarios**:

  ```
  Scenario: Types compile and API functions are correct
    Tool: Bash
    Preconditions: Files updated
    Steps:
      1. Run `pnpm --filter web typecheck`
      2. Verify no type errors
    Expected Result: Clean typecheck with no errors
    Failure Indicators: Type errors in new files
    Evidence: .sisyphus/evidence/task-3-types-typecheck.txt
  ```

  **Commit**: YES (group with Wave 1)
  - Message: `feat(expense): add web expense list/detail types and API functions`
  - Files: `apps/web/src/types/expense.ts`, `apps/web/src/api/endpoints.ts`, `apps/web/src/api/expense.ts`

- [ ] 4. Web i18n Labels — Vietnamese strings for expense feed/detail UI

  **What to do**:
  - Add expense feed/detail Vietnamese labels to `apps/web/src/lib/i18n/locales/vi.json`
  - Feed labels: `expense.feed.title` (Chi tiêu gần đây), `expense.feed.empty` (Chưa có chi tiêu nào), `expense.feed.loadMore` (Tải thêm), `expense.feed.loading` (Đang tải...), `expense.feed.error` (Không thể tải chi tiêu)
  - Detail labels: `expense.detail.title` (Chi tiết chi tiêu), `expense.detail.amount` (Số tiền), `expense.detail.category` (Danh mục), `expense.detail.source` (Nguồn), `expense.detail.date` (Ngày), `expense.detail.note` (Ghi chú), `expense.detail.visibility` (Chế độ hiển thị), `expense.detail.visibility.private` (Riêng tư), `expense.detail.visibility.household` (Chung gia đình), `expense.detail.payer` (Người thanh toán), `expense.detail.creator` (Người tạo), `expense.detail.createdAt` (Tạo lúc), `expense.detail.updatedAt` (Cập nhật lúc), `expense.detail.household` (Gia đình), `expense.detail.notFound` (Không tìm thấy chi tiêu), `expense.detail.forbidden` (Bạn không có quyền xem chi tiêu này)
  - Common labels: `expense.visibilityBadge.private` (Riêng tư), `expense.visibilityBadge.household` (Chung)

  **Must NOT do**:
  - Do NOT add English locale file (only Vietnamese is current locale)
  - Do NOT hardcode strings in components

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`i18n-localization`]

  **Parallelization**:
  - **Can Run In Parallel**: YES — with Tasks 1, 2, 3
  - **Parallel Group**: Wave 1
  - **Blocks**: Tasks 9, 10
  - **Blocked By**: None

  **References**:
  - `apps/web/src/lib/i18n/locales/vi.json` — Existing Vietnamese locale file to add keys to
  - `docs/references/frontend/i18n-label-pattern.md` — i18n key naming conventions

  **Acceptance Criteria**:
  - [ ] All expense feed/detail labels added to `vi.json` with proper nesting under `expense` key
  - [ ] No duplicate keys with existing entries
  - [ ] `pnpm --filter web typecheck` passes

  **QA Scenarios**:

  ```
  Scenario: i18n keys are valid JSON
    Tool: Bash
    Steps:
      1. Run `node -e "JSON.parse(require('fs').readFileSync('apps/web/src/lib/i18n/locales/vi.json', 'utf8')); console.log('Valid JSON')"`
    Expected Result: "Valid JSON" printed, no parse errors
    Failure Indicators: JSON parse error
    Evidence: .sisyphus/evidence/task-4-i18n-valid.txt
  ```

  **Commit**: YES (group with Wave 1)
  - Message: `feat(expense): add Vietnamese i18n labels for expense feed and detail`
  - Files: `apps/web/src/lib/i18n/locales/vi.json`

- [ ] 5. Worker Expense Repository — list + visibility-enforced find

  **What to do**:
  - Update `apps/worker/src/db/repositories/expense-repository.ts`
  - Add `ListExpensesInput` interface: `{ userId: string, householdId?: string, cursor?: string, limit: number, dateFrom?: number, dateTo?: number, categoryKey?: string, payerId?: string, visibility?: 'private' | 'household' }`
  - Implement `listExpenses(db, input)`:
    - **Personal feed** (no householdId): Returns expenses where `created_by_user_id = userId` (includes both private and household expenses the user created). Also includes household expenses where the user is a member of the expense's household. Use UNION or OR condition.
    - **Household feed** (with householdId): Returns expenses where `household_id = householdId AND visibility = 'household'`, but ONLY if the user is an active member of that household (enforce in handler, not repo).
    - Apply filters: `date_from`, `date_to`, `category_key`, `payer_id`, `visibility`
    - Cursor pagination: decode cursor from base64(`occurred_at:id`), apply `WHERE (occurred_at, id) < (cursor_occurred_at, cursor_id)` for reverse chronological
    - Always exclude soft-deleted: `WHERE deleted_at IS NULL`
    - Use explicit column list (no SELECT *)
    - Return `{ items: StoredExpense[], nextCursor: string | null }`
  - Update `findExpenseById(db, expenseId)` to also accept `userId` and enforce visibility:
    - If expense is private: only return if `created_by_user_id === userId`
    - If expense is household: only return if user is member of that household
    - Return null if not found or not visible (handler will differentiate 403 vs 404)
  - Add `findExpenseByIdRaw(db, expenseId)` that returns the expense without visibility check (for handler to first fetch, then check visibility, then return 403 if unauthorized)

  **Must NOT do**:
  - Do NOT use `SELECT *` — follow database-pattern.md, list explicit columns
  - Do NOT put SQL in route handlers
  - Do NOT accept raw user input in repo — handler must validate first
  - Do NOT implement full-text search (future scope)
  - Do NOT implement aggregated totals (future scope)

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: [`backend-patterns`, `database-reviewer`]

  **Parallelization**:
  - **Can Run In Parallel**: NO — depends on Tasks 1 and 2
  - **Parallel Group**: Wave 2
  - **Blocks**: Tasks 6, 8
  - **Blocked By**: Tasks 1 (migration), 2 (contract)

  **References**:
  - `apps/worker/src/db/repositories/expense-repository.ts` — Existing createExpense, findExpenseById, StoredExpense, ExpenseRow, mapRow
  - `apps/worker/src/db/repositories/household-repository.ts` — Repository CRUD pattern with D1
  - `apps/worker/src/db/repositories/household-membership-repository.ts` — Membership queries pattern
  - `docs/references/backend/database-pattern.md` — Explicit column lists, snake_case→camelCase mapping, pagination
  - `docs/product-specs/data-visibility.md` — Visibility enforcement rules
  - `docs/product-specs/expense-querying.md` — Pagination and filter requirements

  **Acceptance Criteria**:
  - [ ] `listExpenses` function uses explicit SELECT column list
  - [ ] `listExpenses` implements cursor-based pagination with tie-breaking on id
  - [ ] `listExpenses` excludes soft-deleted expenses
  - [ ] `listExpenses` applies all filter params (date_from/to, category_key, payer_id, visibility)
  - [ ] `findExpenseByIdRaw` returns expense without visibility check
  - [ ] `pnpm --filter worker typecheck` passes

  **QA Scenarios**:

  ```
  Scenario: Repository functions compile and typecheck
    Tool: Bash
    Steps:
      1. Run `pnpm --filter worker typecheck`
      2. Verify no type errors in expense-repository.ts
    Expected Result: Clean typecheck
    Failure Indicators: Type errors in new/modified file, missing imports
    Evidence: .sisyphus/evidence/task-5-repo-typecheck.txt
  ```

  **Commit**: YES (group with Wave 2)
  - Message: `feat(expense): add expense list repository with cursor pagination and visibility enforcement`
  - Files: `apps/worker/src/db/repositories/expense-repository.ts`

- [ ] 6. Worker Expense Handlers + Routes — GET list + GET detail

  **What to do**:
  - Create `apps/worker/src/handlers/expenses/list-expenses.ts`
    - Handler logic:
      1. Read locale and currentUser from context
      2. Parse query params with `expenseListQuerySchema`
      3. If `household_id` provided: verify user is active member of that household, then call `listExpenses` with household filter
      4. If no `household_id`: call `listExpenses` with userId for personal feed
      5. Map each StoredExpense to ExpenseDTO
      6. Return `success<ExpenseListResponse>(ctx, { items, nextCursor })`
  - Create `apps/worker/src/handlers/expenses/get-expense.ts`
    - Handler logic:
      1. Read locale and currentUser from context
      2. Parse path params with `expensePathParamsSchema`
      3. Call `findExpenseByIdRaw(db, expenseId)` to get the expense
      4. If not found: return 404 (expense doesn't exist)
      5. If found but visibility check fails:
         - Private expense not owned by user: return 403
         - Household expense where user is not member: return 403
      6. Map StoredExpense to ExpenseDTO
      7. Return `success<ExpenseDTO>(ctx, dto)`
  - Update `apps/worker/src/routes/expenses.ts`
    - Add `GET /expenses` → `listExpensesHandler` (with authMiddleware)
    - Add `GET /expenses/:id` → `getExpenseHandler` (with authMiddleware)
  - Add Vietnamese error messages to `apps/worker/src/lib/i18n/messages.vi.ts` for expense list/detail error cases (e.g., `errors.expenseNotFound`, `errors.expenseForbidden`)

  **Must NOT do**:
  - Do NOT return 404 for unauthorized access — use 403 to prevent enumeration
  - Do NOT put SQL in handler — delegate to repository
  - Do NOT skip visibility enforcement — every query must filter by user access
  - Do NOT add filter UI logic — backend supports filters but frontend defers to feat-021

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: [`backend-patterns`, `security-reviewer`]

  **Parallelization**:
  - **Can Run In Parallel**: NO — depends on Tasks 1, 2, 5
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 8
  - **Blocked By**: Tasks 1 (migration), 2 (contract), 5 (repository)

  **References**:
  - `apps/worker/src/handlers/expenses/create-expense.ts` — Handler pattern (thin, calls repository)
  - `apps/worker/src/handlers/households/create-household.ts` — Handler pattern reference
  - `apps/worker/src/routes/expenses.ts` — Existing route registration
  - `apps/worker/src/middlewares/household-membership.ts` — `findActiveHouseholdMembership` for household membership verification
  - `apps/worker/src/lib/permissions/household-policy.ts` — Permission checks
  - `apps/worker/src/lib/response.ts` — `success<T>()`, `errorResponse()` helpers
  - `apps/worker/src/lib/errors.ts` — `forbidden(403)`, `notFound(404)` error helpers
  - `docs/references/backend/security-and-auth-pattern.md` — Auth middleware, ownership checks
  - `docs/product-specs/data-visibility.md` — Visibility enforcement rules

  **Acceptance Criteria**:
  - [ ] File `apps/worker/src/handlers/expenses/list-expenses.ts` exists
  - [ ] File `apps/worker/src/handlers/expenses/get-expense.ts` exists
  - [ ] Routes registered in `apps/worker/src/routes/expenses.ts` for GET list and GET detail
  - [ ] List handler enforces visibility: personal feed shows only user's expenses + household expenses they can see
  - [ ] List handler enforces household membership when household_id filter provided
  - [ ] Detail handler returns 403 for unauthorized access (not 404)
  - [ ] Detail handler returns 404 for non-existent expense
  - [ ] Both handlers exclude soft-deleted expenses
  - [ ] `pnpm --filter worker typecheck` passes

  **QA Scenarios**:

  ```
  Scenario: Worker compiles and routes are registered
    Tool: Bash
    Steps:
      1. Run `pnpm --filter worker typecheck`
      2. Verify no type errors
    Expected Result: Clean typecheck, expense routes registered
    Failure Indicators: Type errors, missing route registration
    Evidence: .sisyphus/evidence/task-6-handler-typecheck.txt
  ```

  **Commit**: YES (group with Wave 2)
  - Message: `feat(expense): add expense list and detail handlers with visibility enforcement`
  - Files: `apps/worker/src/handlers/expenses/list-expenses.ts`, `apps/worker/src/handlers/expenses/get-expense.ts`, `apps/worker/src/routes/expenses.ts`, `apps/worker/src/lib/i18n/messages.vi.ts`

- [ ] 7. Web API Module + Endpoints + React Query Hooks

  **What to do**:
  - Update `apps/web/src/api/endpoints.ts` — add `expenses.list` and `expenses.detail` endpoints
    - `expenses.list` → `/expenses` (with query params)
    - `expenses.detail` → `/expenses/:id`
  - Update `apps/web/src/api/expense.ts`
    - `listExpenses(params: ExpenseListParams)` — GET to `/expenses` with query params, return `ExpenseListResponse`
    - `getExpenseDetail(id: string)` — GET to `/expenses/:id`, return `ExpenseDTO`
  - Update `apps/web/src/hooks/api/use-expense.ts`
    - Update `EXPENSE_KEYS` to add: `lists: () => [...EXPENSE_KEYS.all, 'list'] as const`, `list: (filters?: ExpenseListParams) => [...EXPENSE_KEYS.lists(), filters] as const`
    - Add `useExpenseListQuery(params?: ExpenseListParams)` — `useQuery` calling `listExpenses`, with `getNextPageParam` for infinite scroll
    - Add `useExpenseDetailQuery(id: string)` — `useQuery` calling `getExpenseDetail`
    - Consider `useInfiniteExpenseListQuery(params?: ExpenseListParams)` using `useInfiniteQuery` for infinite scroll pattern

  **Must NOT do**:
  - Do NOT use `select: (data) => data` identity transform in useQuery/useMutation
  - Do NOT create store for expense data — React Query handles caching
  - Do NOT add filter state management — that's feat-021

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`frontend-patterns`]

  **Parallelization**:
  - **Can Run In Parallel**: NO — depends on Tasks 2, 3
  - **Parallel Group**: Wave 2
  - **Blocks**: Tasks 9, 10, 11
  - **Blocked By**: Tasks 2 (contract types), 3 (web types)

  **References**:
  - `apps/web/src/api/endpoints.ts` — Existing endpoint pattern
  - `apps/web/src/api/expense.ts` — Existing createExpense function pattern
  - `apps/web/src/hooks/api/use-expense.ts` — Existing EXPENSE_KEYS and useCreateExpenseMutation
  - `apps/web/src/hooks/api/use-households.ts` — React Query hook pattern
  - `docs/references/frontend/api-react-query-pattern.md` — API + React Query pattern rules

  **Acceptance Criteria**:
  - [ ] `API_ENDPOINTS.expenses.list` and `API_ENDPOINTS.expenses.detail` exist
  - [ ] `listExpenses` function sends GET to `/expenses` with query params
  - [ ] `getExpenseDetail` function sends GET to `/expenses/:id`
  - [ ] `EXPENSE_KEYS` updated with list and list-with-filters key factories
  - [ ] `useInfiniteExpenseListQuery` uses `useInfiniteQuery` with cursor pagination
  - [ ] `useExpenseDetailQuery` calls getExpenseDetail and uses EXPENSE_KEYS.detail
  - [ ] `pnpm --filter web typecheck` passes

  **QA Scenarios**:

  ```
  Scenario: API and hook modules compile
    Tool: Bash
    Steps:
      1. Run `pnpm --filter web typecheck`
    Expected Result: No type errors
    Failure Indicators: Missing imports, type mismatches
    Evidence: .sisyphus/evidence/task-7-api-typecheck.txt
  ```

  **Commit**: YES (group with Wave 2)
  - Message: `feat(expense): add web expense list/detail API and React Query hooks`
  - Files: `apps/web/src/api/expense.ts`, `apps/web/src/api/endpoints.ts`, `apps/web/src/hooks/api/use-expense.ts`

- [ ] 8. Worker Tests — integration tests for expense list + detail

  **What to do**:
  - Create `apps/worker/test/integration/expenses-list.spec.ts`
  - Integration tests for `GET /api/v1/expenses`:
    - List personal expenses (no household_id) → 200 with items array and nextCursor
    - List with cursor → 200 with next page of items
    - List with household_id → 200 with only that household's shared expenses (user must be member)
    - List with household_id where user is not member → 403
    - List with date_from/date_to filter → 200 with filtered results
    - List with category_key filter → 200 with filtered results
    - List with payer_id filter → 200 with filtered results
    - List with visibility filter → 200 with filtered results
    - List excludes soft-deleted expenses → 200 without deleted items
    - List excludes private expenses of other users → 200 without other user's private expenses
    - List without auth → 401
    - List with invalid limit → 400
  - Create `apps/worker/test/integration/expenses-detail.spec.ts`
  - Integration tests for `GET /api/v1/expenses/:id`:
    - Get own private expense → 200 with expense DTO
    - Get household expense where user is member → 200
    - Get private expense of another user → 403 (not 404)
    - Get household expense where user is not member → 403
    - Get non-existent expense → 404
    - Get soft-deleted expense → 404
    - Get without auth → 401

  **Must NOT do**:
  - Do NOT test filter UI (feat-021)
  - Do NOT test edit/delete (feat-019)
  - Do NOT use `SELECT *` in test assertions — validate specific DTO fields

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: [`tdd-workflow`, `backend-patterns`]

  **Parallelization**:
  - **Can Run In Parallel**: NO — depends on Tasks 2, 5, 6
  - **Parallel Group**: Wave 2
  - **Blocks**: None (but needed for verification)
  - **Blocked By**: Tasks 2 (contract), 5 (repository), 6 (handler+route)

  **References**:
  - `apps/worker/test/integration/expenses.spec.ts` — Existing expense creation integration tests
  - `apps/worker/test/integration/households-crud.spec.ts` — Integration test pattern
  - `apps/worker/test/helpers/test-context.ts` — Shared test setup/util context
  - `docs/references/backend/testing-pattern.md` — Backend testing rules

  **Acceptance Criteria**:
  - [ ] File `apps/worker/test/integration/expenses-list.spec.ts` exists
  - [ ] File `apps/worker/test/integration/expenses-detail.spec.ts` exists
  - [ ] All list integration tests pass: personal feed 200, household feed 200, cursor pagination 200, unauthorized household 403, filters 200, soft-delete exclusion, other user private exclusion, no auth 401, invalid limit 400
  - [ ] All detail integration tests pass: own private 200, household member 200, other user private 403, non-member household 403, non-existent 404, soft-deleted 404, no auth 401
  - [ ] `pnpm --filter worker test` passes all tests including new expense tests

  **QA Scenarios**:

  ```
  Scenario: All expense list integration tests pass
    Tool: Bash
    Preconditions: Worker tests configured and running
    Steps:
      1. Run `pnpm --filter worker test`
      2. Verify all expense-related tests pass
    Expected Result: All tests pass, including 12+ integration test cases for expense list
    Failure Indicators: Any test failure, missing test cases
    Evidence: .sisyphus/evidence/task-8-list-tests.txt

  Scenario: All expense detail integration tests pass
    Tool: Bash
    Steps:
      1. Run `pnpm --filter worker test -- --grep "expense detail"`
      2. Verify all detail test cases pass
    Expected Result: All detail tests pass including 403 for unauthorized, 404 for non-existent
    Failure Indicators: 404 returned instead of 403 for unauthorized access
    Evidence: .sisyphus/evidence/task-8-detail-tests.txt
  ```

  **Commit**: YES (group with Wave 2)
  - Message: `feat(expense): add worker integration tests for expense list and detail`
  - Files: `apps/worker/test/integration/expenses-list.spec.ts`, `apps/worker/test/integration/expenses-detail.spec.ts`

- [ ] 9. Expense Feed Item + List Components

  **What to do**:
  - Create `apps/web/src/components/expense/expense-feed-item.tsx` — presentational component for a single expense in the feed
    - Props: `expense: ExpenseDTO`, `onClick?: (id: string) => void`
    - Display: category icon/emoji (from reference data), title, formatted amount (minor units → display), date (relative or formatted), visibility badge (private/household), payer name (if different from creator)
    - Use shadcn Card component for item container
    - Use i18n labels for all visible strings
    - Amount formatting: use `Intl.NumberFormat` for currency display
  - Create `apps/web/src/components/expense/expense-feed-list.tsx` — smart component for the expense feed list
    - Uses `useInfiniteExpenseListQuery` for data fetching
    - Renders list of `ExpenseFeedItem` components
    - Implements infinite scroll with "Load More" button or intersection observer
    - Handles loading state (skeleton), error state, empty state
    - Uses shadcn Skeleton for loading placeholders
    - Uses i18n labels for all visible strings
  - Update `apps/web/src/components/expense/index.ts` to export new components

  **Must NOT do**:
  - Do NOT add filter controls (feat-021)
  - Do NOT add search functionality (future scope)
  - Do NOT create wrapper replacements for shadcn primitives
  - Do NOT hardcode strings — use i18n labels from vi.json
  - Do NOT implement virtual scrolling (use simple infinite scroll for MVP)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`frontend-design`, `shadcn`, `frontend-patterns`]

  **Parallelization**:
  - **Can Run In Parallel**: NO — depends on Tasks 3, 4, 7
  - **Parallel Group**: Wave 3
  - **Blocks**: Task 11
  - **Blocked By**: Tasks 3 (types), 4 (i18n), 7 (API/hooks)

  **References**:
  - `apps/web/src/types/expense.ts` — ExpenseDTO type
  - `apps/web/src/hooks/api/use-expense.ts` — useInfiniteExpenseListQuery
  - `apps/web/src/hooks/api/use-reference-data.ts` — useReferenceCategoriesQuery for category labels
  - `apps/web/src/lib/i18n/locales/vi.json` — Vietnamese labels
  - `apps/web/src/components/expense/expense-form.tsx` — Existing expense component pattern
  - `docs/references/frontend/component-structure-pattern.md` — Component decomposition rules
  - `docs/FRONTEND.md` — Mandatory component decomposition and shadcn-first rules
  - `.agents/skills/shadcn/SKILL.md` — Mandatory shadcn governance (read before UI work)

  **Acceptance Criteria**:
  - [ ] File `apps/web/src/components/expense/expense-feed-item.tsx` exists
  - [ ] File `apps/web/src/components/expense/expense-feed-list.tsx` exists
  - [ ] ExpenseFeedItem displays: category icon, title, formatted amount, date, visibility badge
  - [ ] ExpenseFeedList implements infinite scroll with load-more
  - [ ] ExpenseFeedList handles loading, error, and empty states
  - [ ] All visible strings use i18n keys, no hardcoded text
  - [ ] `pnpm --filter web typecheck` passes

  **QA Scenarios**:

  ```
  Scenario: Feed components render correctly
    Tool: Bash (pnpm test)
    Preconditions: Components created
    Steps:
      1. Run component tests for ExpenseFeedItem and ExpenseFeedList
      2. Verify items render with correct data
    Expected Result: All component tests pass
    Failure Indicators: Missing fields, wrong formatting
    Evidence: .sisyphus/evidence/task-9-feed-components.txt

  Scenario: Infinite scroll loads more items
    Tool: Bash (pnpm test)
    Steps:
      1. Test that load-more triggers next page fetch
      2. Verify nextCursor is passed correctly
    Expected Result: Next page loads when load-more is triggered
    Failure Indicators: Pagination not working, cursor not passed
    Evidence: .sisyphus/evidence/task-9-infinite-scroll.txt
  ```

  **Commit**: YES (group with Wave 3)
  - Message: `feat(expense): add expense feed item and list components with infinite scroll`
  - Files: `apps/web/src/components/expense/expense-feed-item.tsx`, `apps/web/src/components/expense/expense-feed-list.tsx`, `apps/web/src/components/expense/index.ts`

- [ ] 10. Expense Detail Card Component

  **What to do**:
  - Create `apps/web/src/components/expense/expense-detail-card.tsx` — presentational component for expense detail view
    - Props: `expense: ExpenseDTO`
    - Display full metadata: title, amount (formatted), category (with icon/label from reference data), source (with label), date (formatted), note, visibility badge, payer (display name), creator (display name), household name (if shared), created/updated timestamps
    - Use shadcn Card component for layout
    - Use i18n labels for all field labels
    - Amount formatting: use `Intl.NumberFormat` for currency display
    - Date formatting: use date-fns for relative/absolute date display
  - Update `apps/web/src/components/expense/index.ts` to export ExpenseDetailCard

  **Must NOT do**:
  - Do NOT add edit/delete actions (feat-019)
  - Do NOT add share/visibility change actions (future scope)
  - Do NOT create wrapper replacements for shadcn primitives
  - Do NOT hardcode strings — use i18n labels

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`frontend-design`, `shadcn`, `frontend-patterns`]

  **Parallelization**:
  - **Can Run In Parallel**: NO — depends on Tasks 3, 4, 7
  - **Parallel Group**: Wave 3
  - **Blocks**: Task 11
  - **Blocked By**: Tasks 3 (types), 4 (i18n), 7 (API/hooks)

  **References**:
  - `apps/web/src/types/expense.ts` — ExpenseDTO type
  - `apps/web/src/hooks/api/use-expense.ts` — useExpenseDetailQuery
  - `apps/web/src/hooks/api/use-reference-data.ts` — useReferenceCategoriesQuery, useReferenceSourcesQuery for labels
  - `apps/web/src/lib/i18n/locales/vi.json` — Vietnamese labels
  - `docs/references/frontend/component-structure-pattern.md` — Component decomposition rules
  - `docs/FRONTEND.md` — Mandatory component decomposition and shadcn-first rules

  **Acceptance Criteria**:
  - [ ] File `apps/web/src/components/expense/expense-detail-card.tsx` exists
  - [ ] ExpenseDetailCard displays: title, amount, category, source, date, note, visibility, payer, creator, household, timestamps
  - [ ] All visible strings use i18n keys, no hardcoded text
  - [ ] `pnpm --filter web typecheck` passes

  **QA Scenarios**:

  ```
  Scenario: Detail card renders all fields
    Tool: Bash (pnpm test)
    Preconditions: Component created
    Steps:
      1. Run component tests for ExpenseDetailCard
      2. Verify all metadata fields render
    Expected Result: All fields render with correct data
    Failure Indicators: Missing fields, wrong formatting
    Evidence: .sisyphus/evidence/task-10-detail-card.txt
  ```

  **Commit**: YES (group with Wave 3)
  - Message: `feat(expense): add expense detail card component`
  - Files: `apps/web/src/components/expense/expense-detail-card.tsx`, `apps/web/src/components/expense/index.ts`

- [ ] 11. Expense Feed Page + Detail Page + Routes

  **What to do**:
  - Update `apps/web/src/app/(protected)/expenses/page.tsx` — replace PlaceholderPage with actual expense feed
    - Create `apps/web/src/views/app/expenses-page.tsx` — page orchestrator
    - Fetch expenses using `useInfiniteExpenseListQuery()`
    - Compose `ExpenseFeedList` component
    - Handle loading/error states with shadcn Card/Skeleton
    - Page title: "Chi tiêu gần đây" (Recent Expenses)
  - Create `apps/web/src/app/(protected)/expenses/[id]/page.tsx` — expense detail route
    - Create `apps/web/src/views/app/expense-detail-page.tsx` — page orchestrator
    - Fetch expense detail using `useExpenseDetailQuery(id)`
    - Compose `ExpenseDetailCard` component
    - Handle loading/error/403 states
    - Back navigation to expense feed
  - Update `apps/web/src/lib/constants/paths.ts` — add `EXPENSE_DETAIL: '/expenses/[id]'`
  - Ensure both pages are behind auth (protected route)

  **Must NOT do**:
  - Do NOT add filter controls to feed page (feat-021)
  - Do NOT add edit/delete actions to detail page (feat-019)
  - Do NOT embed all logic in page — delegate to smart components
  - Do NOT create a separate store for expense data — React Query handles caching

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`frontend-patterns`]

  **Parallelization**:
  - **Can Run In Parallel**: NO — depends on Tasks 7, 9, 10
  - **Parallel Group**: Wave 3
  - **Blocks**: None (final implementation task)
  - **Blocked By**: Tasks 7 (API/hooks), 9 (feed components), 10 (detail component)

  **References**:
  - `apps/web/src/views/app/add-expense-page.tsx` — Page orchestrator pattern
  - `apps/web/src/views/app/household-detail-page.tsx` — Page with detail view pattern
  - `apps/web/src/app/(protected)/expenses/page.tsx` — Current placeholder to replace
  - `apps/web/src/hooks/api/use-expense.ts` — useInfiniteExpenseListQuery, useExpenseDetailQuery
  - `apps/web/src/lib/constants/paths.ts` — PATHS constant to update
  - `docs/references/frontend/project-folder-structure.md` — Page/view folder structure rules
  - `docs/references/frontend/component-structure-pattern.md` — Page orchestrator → smart component pattern

  **Acceptance Criteria**:
  - [ ] File `apps/web/src/views/app/expenses-page.tsx` exists with page orchestrator
  - [ ] File `apps/web/src/views/app/expense-detail-page.tsx` exists with page orchestrator
  - [ ] Next.js route at `/expenses` serves the Expense Feed page (replaces placeholder)
  - [ ] Next.js route at `/expenses/[id]` serves the Expense Detail page
  - [ ] `PATHS.EXPENSE_DETAIL` exists in paths constant
  - [ ] Feed page fetches expenses with infinite scroll
  - [ ] Detail page fetches single expense and handles 403
  - [ ] Loading and error states handled with shadcn components
  - [ ] `pnpm --filter web typecheck` passes
  - [ ] `pnpm --filter web build` succeeds

  **QA Scenarios**:

  ```
  Scenario: Expense Feed page renders successfully
    Tool: Bash (pnpm test)
    Preconditions: Page and route created
    Steps:
      1. Run `pnpm --filter web test`
      2. Verify Expense Feed page component tests pass
    Expected Result: Page renders with feed list, loading states handled
    Failure Indicators: Build error, rendering failure
    Evidence: .sisyphus/evidence/task-11-feed-page.txt

  Scenario: Expense Detail page renders successfully
    Tool: Bash (pnpm test)
    Steps:
      1. Run `pnpm --filter web test`
      2. Verify Expense Detail page component tests pass
    Expected Result: Page renders with detail card, 403 handling works
    Failure Indicators: Build error, rendering failure
    Evidence: .sisyphus/evidence/task-11-detail-page.txt

  Scenario: Build succeeds
    Tool: Bash
    Steps:
      1. Run `pnpm --filter web build`
      2. Verify build succeeds
    Expected Result: Clean build with no errors
    Failure Indicators: Build failure, missing route
    Evidence: .sisyphus/evidence/task-11-build.txt

  Scenario: Fullstack expense list end-to-end
    Tool: Bash (curl)
    Preconditions: Worker running locally, authenticated session
    Steps:
      1. Start worker dev: `pnpm --filter worker dev`
      2. List personal expenses: `curl -s http://localhost:8787/api/v1/expenses -H "Authorization: Bearer <token>"`
      3. Assert 200 response with items array and nextCursor
    Expected Result: 200 OK with { items: [...], nextCursor: "..." }
    Failure Indicators: 401/500 errors, missing fields
    Evidence: .sisyphus/evidence/task-11-e2e-list.txt

  Scenario: Fullstack expense detail end-to-end
    Tool: Bash (curl)
    Steps:
      1. Get expense detail: `curl -s http://localhost:8787/api/v1/expenses/<id> -H "Authorization: Bearer <token>"`
      2. Assert 200 response with expense DTO
      3. Get another user's private expense: `curl -s http://localhost:8787/api/v1/expenses/<other-id> -H "Authorization: Bearer <token>"`
      4. Assert 403 response
    Expected Result: 200 for own expense, 403 for unauthorized
    Failure Indicators: 404 instead of 403, 500 errors
    Evidence: .sisyphus/evidence/task-11-e2e-detail.txt
  ```

  **Commit**: YES (final commit)
  - Message: `feat(expense): add expense feed and detail pages with routes`
  - Files: `apps/web/src/views/app/expenses-page.tsx`, `apps/web/src/views/app/expense-detail-page.tsx`, `apps/web/src/app/(protected)/expenses/page.tsx`, `apps/web/src/app/(protected)/expenses/[id]/page.tsx`, `apps/web/src/lib/constants/paths.ts`

---

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, curl endpoint, run command). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in harness/features/. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run `pnpm typecheck` + `pnpm lint` + `pnpm test:worker` + `pnpm test:web`. Review all changed files for: `as any`/`@ts-ignore`, empty catches, console.log in prod, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names.
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N pass/N fail] | Files [N clean/N issues] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high`
  Start from clean state. Execute EVERY QA scenario from EVERY task — follow exact steps, capture evidence. Test cross-task integration (feed loads expenses from API, detail page shows expense data, visibility rules enforced end-to-end). Test edge cases: private expense of other user, household expense as non-member, soft-deleted expense, empty feed. Save to `.sisyphus/evidence/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff (git log/diff). Verify 1:1 — everything in spec was built (no missing), nothing beyond spec was built (no creep). Check "Must NOT do" compliance. Detect cross-task contamination. Flag unaccounted changes.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

- **Wave 1**: `feat(expense): add database migration 0004 for feed query indexes and expense list contract schemas` - migration + contract + types + i18n
- **Wave 2**: `feat(expense): add expense list and detail repository, handlers, and routes with visibility enforcement` - repo, handlers, routes, web API
- **Wave 3**: `feat(expense): add expense feed and detail UI components and pages` - components, pages, routes
- **Final**: `feat(expense): complete feat-018 expense detail and activity feed` - harness evidence, docs updates

---

## Success Criteria

### Verification Commands
```bash
./init.sh  # Expected: all steps pass
pnpm --filter worker test  # Expected: all tests pass including new expense list/detail tests
pnpm --filter web test  # Expected: all tests pass including new component tests
pnpm --filter web build  # Expected: successful build
pnpm --filter worker db:migrate:local  # Expected: migration 0004 applied cleanly
```

### Final Checklist
- [ ] All "Must Have" present
- [ ] All "Must NOT Have" absent
- [ ] All tests pass
- [ ] Migration applies cleanly
- [ ] Harness evidence updated
- [ ] Plan index updated

---

## Surprises & Discoveries

_(To be filled during implementation)_

## Decision Log

- Decision: Activity feed = expense chronological list (not audit_logs)
  Rationale: feat-018 description says "activity feed" refers to expense feed, and product spec expense-querying.md defines the feed as a paginated expense list
  Date: 2026-05-02

- Decision: Backend supports filter query params but frontend has no filter UI
  Rationale: feat-018 scope explicitly excludes filter controls (feat-021), but backend should support filters for future use
  Date: 2026-05-02

- Decision: 403 for unauthorized expense detail access (not 404)
  Rationale: Prevents enumeration of expense IDs; per data-visibility.md and feat-018 description
  Date: 2026-05-02

- Decision: Cursor-based pagination using `occurred_at:id` composite cursor
  Rationale: Per expense-querying.md, cursor pagination is preferred; composite cursor ensures stable ordering for ties
  Date: 2026-05-02

- Decision: Personal feed returns user's own expenses (private + household they created) plus household expenses they can see
  Rationale: Per data-visibility.md, personal feed shows expenses where creator_id == user OR household membership grants access
  Date: 2026-05-02

## Outcomes & Retrospective

_(To be filled after completion)_

## Context and Orientation

- Worker routes: `apps/worker/src/routes/*`
- Worker handlers: `apps/worker/src/handlers/expenses/*`
- Worker repository: `apps/worker/src/db/repositories/expense-repository.ts`
- Worker contracts: `apps/worker/src/contracts/expense.ts`
- Worker tests: `apps/worker/test/integration/expenses*.spec.ts`
- Web types: `apps/web/src/types/expense.ts`
- Web API: `apps/web/src/api/expense.ts`
- Web hooks: `apps/web/src/hooks/api/use-expense.ts`
- Web components: `apps/web/src/components/expense/*`
- Web pages: `apps/web/src/views/app/expenses-page.tsx`, `apps/web/src/views/app/expense-detail-page.tsx`
- Web routes: `apps/web/src/app/(protected)/expenses/page.tsx`, `apps/web/src/app/(protected)/expenses/[id]/page.tsx`
- Database migrations: `apps/worker/migrations/0004_expense_feed_index.sql`
- Product specs: `docs/product-specs/expense-querying.md`, `docs/product-specs/data-visibility.md`