# feat-017: Expense Entry Create Flow (incl. Visibility Rules)

## TL;DR

> **Quick Summary**: Full-stack expense creation — backend `POST /api/v1/expenses` endpoint with visibility rules and validation, plus frontend "Add Expense" form page with category/source pickers, visibility toggle, and conditional household selection. Database migration adds `category_key`/`source_key` columns aligning with global static catalogs from feat-016.
> 
> **Deliverables**:
> - Database migration 0003 (category_key, source_key, constraint changes)
> - Worker: contracts, repository, handler, route for expense creation
> - Web: types, API, hooks, form schema, form component, page orchestrator
> - Full test coverage (unit + integration)
> - i18n labels for all new UI strings
> 
> **Estimated Effort**: Large
> **Parallel Execution**: YES - 4 waves
> **Critical Path**: Migration → Contract → Repo → Handler → Web Types → API → Hooks → Form → Page

---

## Context

### Original Request
Create work plan for feat-017: Expense entry create flow (incl. visibility rules) — the next pending feature after feat-016 global static reference data.

### Interview Summary
**Key Discussions**:
- Route design: User-scoped `POST /api/v1/expenses` (not household-scoped) because private expenses have no household context
- Schema migration: Must add `category_key`/`source_key` and modify CHECK constraint to allow private expenses with categories (tech debt flagged before feat-017)
- Payer: Defaults to current user only (MVP), household member selection deferred
- Currency: Auto-defaults to household `default_currency_code` or `VND`, no picker in form
- Title: Required by schema, auto-populated from category label as smart default
- group_ids: Excluded entirely (feat-022/023 scope)

**Research Findings**:
- `expenses` table exists with legacy `category_id` FK to household-scoped `expense_categories` — must migrate to `category_key`
- feat-016 provides: GET /categories, GET /sources, CategoryPicker, SourcePicker, REFERENCE_CATEGORY_KEYS, REFERENCE_SOURCE_KEYS
- Permission policy: `canCreateExpense(role)` exists in `household-policy.ts` — both admin and member can create
- Household membership middleware: `resolveHouseholdMembership`, `requireRole` — reuse conditionally for household expenses
- Form pattern: RHF + zod + shadcn per `form-pattern.md`
- API pattern: React Query with `*_KEYS` per `api-react-query-pattern.md`

### Metis Review
**Identified Gaps** (addressed):
- Schema migration strategy: resolved — add `category_key`/`source_key`, keep `category_id` nullable, modify CHECK constraint
- `title` field ambiguity: resolved — required, auto-populated from category label
- `currency_code` source: resolved — household default for household expenses, `VND` for private
- Payer scope: resolved — current user only (MVP)
- `group_ids` scope: resolved — excluded entirely, not in payload
- Private expense category constraint: resolved — migration modifies CHECK to allow category_key on private expenses

---

## Work Objectives

### Core Objective
Enable authenticated users to create expense entries with proper visibility rules, category/source selection from global catalogs, and conditional household assignment for shared expenses.

### Concrete Deliverables
- `apps/worker/migrations/0003_expense_category_key_source_key.sql`
- `apps/worker/src/contracts/expense.ts`
- `apps/worker/src/db/repositories/expense-repository.ts`
- `apps/worker/src/handlers/expenses/create-expense.ts`
- `apps/worker/src/routes/expenses.ts`
- `apps/worker/test/unit/dto-expense.spec.ts`
- `apps/worker/test/integration/expenses.spec.ts`
- `apps/web/src/types/expense.ts`
- `apps/web/src/api/expense.ts`
- `apps/web/src/hooks/api/use-expense.ts`
- `apps/web/src/lib/forms/expense.schema.ts`
- `apps/web/src/components/expense/expense-form.tsx`
- `apps/web/src/views/app/add-expense-page.tsx`
- Next.js route for `/expenses/new`

### Definition of Done
- [ ] `./init.sh` passes (lint, typecheck, test, build)
- [ ] Migration 0003 applies cleanly
- [ ] Worker unit tests for expense contract validation pass
- [ ] Worker integration tests for expense creation flow pass
- [ ] Web component tests for expense form pass
- [ ] `POST /api/v1/expenses` creates private expense (201)
- [ ] `POST /api/v1/expenses` creates household expense with membership (201)
- [ ] `POST /api/v1/expenses` rejects household expense without householdId (400)
- [ ] `POST /api/v1/expenses` rejects household expense without membership (403)
- [ ] `POST /api/v1/expenses` rejects income/transfer categories (400)
- [ ] Add Expense form renders with category picker, source picker, visibility toggle
- [ ] Harness evidence updated in `feat-017.json` and `feature_index.json`

### Must Have
- Expense creation API with all visibility and validation rules
- Add Expense form page with category/source pickers from feat-016
- Visibility toggle with conditional household picker
- Database migration for category_key/source_key columns
- Full test coverage (unit + integration)
- Vietnamese i18n labels for all new UI strings

### Must NOT Have (Guardrails)
- Expense edit/delete/restore endpoints (feat-019)
- Expense list/search/filter/pagination (feat-021)
- Quick-add UI or offline queueing (feat-024/025)
- Group assignment in create payload (feat-022/023)
- Household member list as payer options (deferred enhancement)
- Currency picker in form (auto-defaulted)
- Modification of CategoryPicker or SourcePicker (use as-is from feat-016)
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
- **Automated tests**: YES (TDD for contracts, integration for handler, component for form)
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
├── Task 1: Database migration 0003 [deep]
├── Task 2: Worker expense contract (Zod schemas) [quick]
├── Task 3: Web expense types + form schema [quick]
└── Task 4: Web i18n labels [quick]

Wave 2 (After Wave 1 - core backend + API):
├── Task 5: Worker expense repository (depends: 1, 2) [deep]
├── Task 6: Worker expense handler + route (depends: 1, 2, 5) [deep]
├── Task 7: Web API module + endpoints + hooks (depends: 2, 3) [quick]
└── Task 8: Worker tests + messages (depends: 2, 5, 6) [deep]

Wave 3 (After Wave 2 - frontend UI):
├── Task 9: Expense form component + visibility toggle (depends: 3, 4, 7) [visual-engineering]
└── Task 10: Add Expense page + route (depends: 7, 9) [unspecified-high]

Wave FINAL (After ALL tasks — 4 parallel reviews):
├── Task F1: Plan compliance audit (oracle)
├── Task F2: Code quality review (unspecified-high)
├── Task F3: Real manual QA (unspecified-high)
└── Task F4: Scope fidelity check (deep)
-> Present results -> Get explicit user okay

Critical Path: Task 1 → Task 2 → Task 5 → Task 6 → Task 8 → Task 9 → Task 10 → F1-F4 → user okay
Parallel Speedup: ~50% faster than sequential
Max Concurrent: 4 (Wave 1)
```

### Dependency Matrix

| Task | Depends On | Blocks |
|------|-----------|--------|
| 1 (migration) | - | 5, 6 |
| 2 (contract) | - | 5, 6, 7, 8 |
| 3 (web types/schema) | - | 7, 9 |
| 4 (i18n) | - | 9 |
| 5 (repository) | 1, 2 | 6, 8 |
| 6 (handler+route) | 1, 2, 5 | 8 |
| 7 (web API+hooks) | 2, 3 | 9, 10 |
| 8 (worker tests) | 2, 5, 6 | - |
| 9 (form component) | 3, 4, 7 | 10 |
| 10 (page+route) | 7, 9 | - |

### Agent Dispatch Summary

- **Wave 1**: 4 tasks — T1 → `deep`, T2 → `quick`, T3 → `quick`, T4 → `quick`
- **Wave 2**: 4 tasks — T5 → `deep`, T6 → `deep`, T7 → `quick`, T8 → `deep`
- **Wave 3**: 2 tasks — T9 → `visual-engineering`, T10 → `unspecified-high`
- **FINAL**: 4 tasks — F1 → `oracle`, F2 → `unspecified-high`, F3 → `unspecified-high`, F4 → `deep`

---

## TODOs

- [x] 1. Database Migration 0003 — category_key, source_key, and constraint changes

  **What to do**:
  - Create `apps/worker/migrations/0003_expense_category_key_source_key.sql`
  - Add `category_key TEXT` column to `expenses` (nullable for backward compat, new writes should always set it)
  - Add `source_key TEXT NOT NULL DEFAULT 'other'` column to `expenses`, then ALTER to drop default (since no existing rows exist, this is safe)
  - Drop existing CHECK constraint `(household_id IS NULL AND category_id IS NULL) OR household_id IS NOT NULL` (identified by name or recreate table constraints)
  - Add new CHECK constraint allowing private expenses with `category_key`: visibility must be 'private' or 'household'; if visibility is 'household' then household_id must not be null
  - Add index `idx_expenses_category_key` on `category_key`
  - Add index `idx_expenses_source_key` on `source_key`
  - Verify with: `pnpm --filter worker db:migrate:local`

  **Must NOT do**:
  - Do NOT drop `category_id` column (legacy FK, kept nullable for backward compat — cleanup is tech debt)
  - Do NOT modify `expense_categories` table
  - Do NOT add `group_ids` column or any group-related column

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: [`database-reviewer`]

  **Parallelization**:
  - **Can Run In Parallel**: YES — with Tasks 2, 3, 4
  - **Parallel Group**: Wave 1
  - **Blocks**: Tasks 5, 6
  - **Blocked By**: None

  **References**:
  - `apps/worker/migrations/0001_init.sql:113-140` — Current `expenses` table schema with `category_id` FK and CHECK constraints
  - `apps/worker/migrations/0002_household_invitations.sql` — Previous migration for pattern reference
  - `docs/product-specs/data-visibility.md` — Visibility model rules (private vs household)
  - `docs/product-specs/expense-categorization.md` — Global static category catalog specification
  - `docs/references/backend/database-pattern.md` — Database naming and integrity rules

  **Acceptance Criteria**:
  - [ ] File `apps/worker/migrations/0003_expense_category_key_source_key.sql` exists with valid D1 SQL
  - [ ] `pnpm --filter worker db:migrate:local` runs without error
  - [ ] After migration, `expenses` table has `category_key TEXT` and `source_key TEXT NOT NULL` columns
  - [ ] CHECK constraint allows private expenses with non-null `category_key`
  - [ ] Indexes `idx_expenses_category_key` and `idx_expenses_source_key` exist

  **QA Scenarios**:

  ```
  Scenario: Migration applies cleanly to fresh database
    Tool: Bash
    Preconditions: Clean local D1 database
    Steps:
      1. Run `pnpm --filter worker db:migrate:local`
      2. Query D1 to verify columns: `npx wrangler d1 execute DB --local --command "PRAGMA table_info(expenses)"`
    Expected Result: Columns include category_key (TEXT, nullable) and source_key (TEXT, not null)
    Failure Indicators: Migration error, missing columns, wrong nullability
    Evidence: .sisyphus/evidence/task-1-migration-clean.txt

  Scenario: Migration idempotent on re-run
    Tool: Bash
    Preconditions: Migration already applied
    Steps:
      1. Run `pnpm --filter worker db:migrate:local` again
    Expected Result: No error (migration tracker prevents re-run)
    Failure Indicators: Duplicate column errors
    Evidence: .sisyphus/evidence/task-1-migration-idempotent.txt
  ```

  **Commit**: YES (group with Wave 1)
  - Message: `feat(expense): add database migration 0003 for category_key and source_key`
  - Files: `apps/worker/migrations/0003_expense_category_key_source_key.sql`
  - Pre-commit: `pnpm --filter worker db:migrate:local`

- [x] 2. Worker Expense Contract — Zod request/response schemas

  **What to do**:
  - Create `apps/worker/src/contracts/expense.ts`
  - Define `expenseVisibilitySchema = z.enum(['private', 'household'])`
  - Define `createExpenseRequestSchema(locale)` with: `amount` (z.number().positive()), `categoryKey` (z.enum(REFERENCE_CATEGORY_KEYS)), `sourceKey` (z.enum(REFERENCE_SOURCE_KEYS)), `title` (z.string().min(1).max(200)), `occurredAt` (z.number().int().positive()), `note` (z.string().max(1000).optional()), `visibility` (expenseVisibilitySchema.default('private')), `householdId` (z.string().optional()), `payerUserId` (z.string().optional())
  - Add `.refine()` to enforce householdId when visibility=household
  - Add `.refine()` to enforce categoryKey maps to kind=expense in static catalog (reject 'money-in', 'lending')
  - Define `ExpenseDTO` response type mapping DB columns to camelCase
  - Define `CreateExpenseResponse` type
  - Export from `apps/worker/src/contracts/index.ts`
  - Create `apps/worker/test/unit/dto-expense.spec.ts` with unit tests for schema validation

  **Must NOT do**:
  - Do NOT accept `createdByUserId` from request body (always from auth context)
  - Do NOT accept `groupIds` in create schema (out of scope)
  - Do NOT use `category_id` in the new contract (use `category_key`)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`backend-patterns`, `tdd-workflow`]

  **Parallelization**:
  - **Can Run In Parallel**: YES — with Tasks 1, 3, 4
  - **Parallel Group**: Wave 1
  - **Blocks**: Tasks 5, 6, 7, 8
  - **Blocked By**: None

  **References**:
  - `apps/worker/src/contracts/household.ts` — Zod schema pattern with locale-aware validation and `.strict()`
  - `apps/worker/src/contracts/reference-data.ts` — REFERENCE_CATEGORY_KEYS and REFERENCE_SOURCE_KEYS constants to import and validate against
  - `apps/worker/src/lib/reference-data/catalog.ts` — Static catalog with category kind filtering (must reject kind=income, kind=transfer)
  - `docs/references/backend/api-contract-and-validation.md` — API contract rules (camelCase, JSON-only, explicit validation)
  - `docs/references/shared/type-naming-pattern.md` — DTO/Request/Response naming conventions

  **Acceptance Criteria**:
  - [ ] File `apps/worker/src/contracts/expense.ts` exists with Zod schemas
  - [ ] `createExpenseRequestSchema` validates: valid private expense, valid household expense with householdId, rejects household without householdId, rejects income category, rejects transfer category, rejects invalid source, rejects zero/negative amount, rejects empty title
  - [ ] File `apps/worker/test/unit/dto-expense.spec.ts` exists and passes
  - [ ] Contract exported from `apps/worker/src/contracts/index.ts`

  **QA Scenarios**:

  ```
  Scenario: Schema validates private expense correctly
    Tool: Bash
    Preconditions: Contract file and test exist
    Steps:
      1. Run `pnpm --filter worker test -- --grep "createExpenseRequestSchema"`
      2. Verify all validation tests pass
    Expected Result: All unit tests pass for private expense, household expense, and rejection cases
    Failure Indicators: Any test failure, schema accepting invalid data
    Evidence: .sisyphus/evidence/task-2-contract-tests.txt

  Scenario: Schema rejects income and transfer categories
    Tool: Bash
    Steps:
      1. Run specific test for category kind rejection
      2. Assert 'money-in' (income) is rejected with INVALID_INPUT
      3. Assert 'lending' (transfer) is rejected with INVALID_INPUT
    Expected Result: Both categories rejected
    Failure Indicators: Schema accepts non-expense category
    Evidence: .sisyphus/evidence/task-2-category-rejection.txt
  ```

  **Commit**: YES (group with Wave 1)
  - Message: `feat(expense): add expense contract schemas and validation`
  - Files: `apps/worker/src/contracts/expense.ts`, `apps/worker/src/contracts/index.ts`, `apps/worker/test/unit/dto-expense.spec.ts`

- [x] 3. Web Expense Types + Form Schema

  **What to do**:
  - Create `apps/web/src/types/expense.ts`
  - Define `ExpenseVisibility = 'private' | 'household'`
  - Define `ExpenseDTO` matching worker response shape (id, householdId, createdByUserId, payerUserId, categoryKey, sourceKey, amountMinor, currencyCode, occurredAt, visibility, title, note, createdAt, updatedAt)
  - Define `CreateExpenseRequest` with amount (decimal), categoryKey, sourceKey, title, occurredAt, note?, visibility?, householdId?, payerUserId?
  - Define `CreateExpenseResponse` wrapping expense data
  - Create `apps/web/src/lib/forms/expense.schema.ts`
  - Define `expenseFormSchema` using Zod with i18n messages: amount (positive number), categoryKey (enum), sourceKey (enum), title (string 1-200), occurredAt (number), note (string max 1000, optional), visibility (enum default 'private'), householdId (string optional, required when visibility=household)
  - Export `type ExpenseFormValues = z.infer<typeof expenseFormSchema>`

  **Must NOT do**:
  - Do NOT duplicate type names from `reference-data.ts` — import CategoryKey, SourceKey from there
  - Do NOT include `groupIds` in the form schema

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`frontend-patterns`]

  **Parallelization**:
  - **Can Run In Parallel**: YES — with Tasks 1, 2, 4
  - **Parallel Group**: Wave 1
  - **Blocks**: Tasks 7, 9
  - **Blocked By**: None

  **References**:
  - `apps/web/src/types/reference-data.ts` — CategoryKey, SourceKey, ReferenceCategoryDTO, ReferenceSourceDTO types to import
  - `apps/web/src/types/household.ts` — HouseholdDTO type for household list
  - `apps/web/src/lib/forms/household.schema.ts` — Zod form schema pattern to follow
  - `docs/references/frontend/form-pattern.md` — Form pattern (RHF + zod + shadcn)
  - `docs/references/shared/type-naming-pattern.md` — Type naming conventions

  **Acceptance Criteria**:
  - [ ] File `apps/web/src/types/expense.ts` exists with ExpenseDTO, CreateExpenseRequest, CreateExpenseResponse
  - [ ] File `apps/web/src/lib/forms/expense.schema.ts` exists with expenseFormSchema
  - [ ] Schema validates form fields with proper error messages
  - [ ] Types import CategoryKey and SourceKey from reference-data types
  - [ ] `pnpm --filter web typecheck` passes

  **QA Scenarios**:

  ```
  Scenario: Types compile and schema validates
    Tool: Bash
    Preconditions: Files created
    Steps:
      1. Run `pnpm --filter web typecheck`
      2. Verify no type errors
    Expected Result: Clean typecheck with no errors
    Failure Indicators: Type errors in new files
    Evidence: .sisyphus/evidence/task-3-types-typecheck.txt

  Scenario: Form schema rejects invalid data
    Tool: Bash
    Preconditions: Schema file exists
    Steps:
      1. Write a small test or use Node REPL to validate schema with invalid data (negative amount, missing category, household visibility without householdId)
      2. Assert validation errors for each invalid case
    Expected Result: Schema returns structured errors for each invalid case
    Failure Indicators: Schema accepts invalid data
    Evidence: .sisyphus/evidence/task-3-schema-validation.txt
  ```

  **Commit**: YES (group with Wave 1)
  - Message: `feat(expense): add web expense types and form schema`
  - Files: `apps/web/src/types/expense.ts`, `apps/web/src/lib/forms/expense.schema.ts`

- [x] 4. Web i18n Labels — Vietnamese strings for expense UI

  **What to do**:
  - Add expense-related Vietnamese labels to `apps/web/src/lib/i18n/locales/vi.json`
  - Labels needed: `expense.addTitle` (Thêm chi tiêu), `expense.amount` (Số tiền), `expense.category` (Danh mục), `expense.source` (Nguồn), `expense.date` (Ngày), `expense.note` (Ghi chú), `expense.visibility` (Chế độ hiển thị), `expense.visibility.private` (Riêng tư), `expense.visibility.household` (Chung gia đình), `expense.selectHousehold` (Chọn gia đình), `expense.payer` (Người thanh toán), `expense.title` (Tiêu đề), `expense.success` (Đã thêm chi tiêu thành công)
  - Error labels: `expense.error.amountRequired` (Vui lòng nhập số tiền), `expense.error.categoryRequired` (Vui lòng chọn danh mục), `expense.error.sourceRequired` (Vui lòng chọn nguồn), `expense.error.householdRequired` (Cần chọn gia đình khi chia sẻ chi tiêu), `expense.error.titleRequired` (Vui lòng nhập tiêu đề)

  **Must NOT do**:
  - Do NOT add English locale file (only Vietnamese is current locale)
  - Do NOT hard-code strings in components

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`i18n-localization`]

  **Parallelization**:
  - **Can Run In Parallel**: YES — with Tasks 1, 2, 3
  - **Parallel Group**: Wave 1
  - **Blocks**: Task 9
  - **Blocked By**: None

  **References**:
  - `apps/web/src/lib/i18n/locales/vi.json` — Existing Vietnamese locale file to add keys to
  - `docs/references/frontend/i18n-label-pattern.md` — i18n key naming conventions
  - `apps/web/src/lib/reference-data/labels.ts` — Reference data label mapping pattern

  **Acceptance Criteria**:
  - [ ] All expense form labels added to `vi.json` with proper nesting under `expense` key
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
  - Message: `feat(expense): add Vietnamese i18n labels for expense form`
  - Files: `apps/web/src/lib/i18n/locales/vi.json`

- [x] 5. Worker Expense Repository — createExpense + findExpenseById

  **What to do**:
  - Create `apps/worker/src/db/repositories/expense-repository.ts`
  - Define `StoredExpense` interface mapping DB columns to TypeScript: id, household_id, created_by_user_id, payer_user_id, category_key, source_key, category_id (nullable), amount_minor, currency_code, occurred_at, visibility, title, note, deleted_at, created_at, updated_at
  - Define `CreateExpenseInput` with typed fields matching the handler's processed output
  - Implement `createExpense(db, input)` — INSERT into expenses with explicit column list (no SELECT *), return mapped StoredExpense
  - Implement `findExpenseById(db, expenseId)` — SELECT with explicit columns by id, return StoredExpense | null
  - Use parameterized D1 prepared statements, not string interpolation
  - Use `newId()` for ULID generation (called in handler, passed to repo)
  - Map DB snake_case columns to camelCase in TypeScript types

  **Must NOT do**:
  - Do NOT use `SELECT *` — follow database-pattern.md, list explicit columns
  - Do NOT put SQL in route handlers
  - Do NOT accept raw user input in repo — handler must validate first
  - Do NOT generate IDs in the repository — IDs come from handler via `newId()`

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: [`backend-patterns`, `database-reviewer`]

  **Parallelization**:
  - **Can Run In Parallel**: NO — depends on Tasks 1 and 2
  - **Parallel Group**: Wave 2
  - **Blocks**: Tasks 6, 8
  - **Blocked By**: Tasks 1 (migration), 2 (contract)

  **References**:
  - `apps/worker/src/db/repositories/household-repository.ts` — Repository CRUD pattern with D1, row mappers, explicit columns
  - `apps/worker/src/db/repositories/household-membership-repository.ts` — Membership queries and role checks pattern
  - `apps/worker/migrations/0001_init.sql:113-140` — Current `expenses` table schema (reference for column names)
  - `docs/references/backend/database-pattern.md` — Explicit column lists, snake_case→camelCase mapping, pagination
  - `apps/worker/src/lib/reference-data/catalog.ts` — For understanding category_key and source_key validation in handler layer

  **Acceptance Criteria**:
  - [ ] File `apps/worker/src/db/repositories/expense-repository.ts` exists
  - [ ] `createExpense` function uses explicit INSERT column list
  - [ ] `findExpenseById` function uses explicit SELECT column list
  - [ ] StoredExpense interface maps all expense table columns
  - [ ] `pnpm --filter worker typecheck` passes

  **QA Scenarios**:

  ```
  Scenario: Repository functions compile and typecheck
    Tool: Bash
    Steps:
      1. Run `pnpm --filter worker typecheck`
      2. Verify no type errors in expense-repository.ts
    Expected Result: Clean typecheck
    Failure Indicators: Type errors in new file, missing imports
    Evidence: .sisyphus/evidence/task-5-repo-typecheck.txt
  ```

  **Commit**: YES (group with Wave 2)
  - Message: `feat(expense): add expense repository with create and find operations`
  - Files: `apps/worker/src/db/repositories/expense-repository.ts`

- [x] 6. Worker Expense Handler + Route — POST /api/v1/expenses

  **What to do**:
  - Create `apps/worker/src/handlers/expenses/create-expense.ts`
  - Handler logic:
    1. Read locale from context
    2. Parse body with `readJsonBody<CreateExpenseRequest>(ctx, createExpenseRequestSchema(locale))`
    3. Validate `categoryKey` maps to `kind === 'expense'` in static catalog (reject 'money-in', 'lending')
    4. Validate `sourceKey` against static catalog
    5. If `visibility === 'household'`: verify `householdId` provided, call `findActiveHouseholdMembership`, check `canCreateExpense(role)`, fetch household for currency default
    6. Set `createdByUserId` from `ctx.get('currentUser').id` (never from body)
    7. Default `payerUserId` to current user if not provided
    8. Resolve `currencyCode`: household's `default_currency_code` for household expenses, 'VND' for private
    9. Convert decimal `amount` to `amount_minor` (for VND: 1:1 since VND has no minor units; multiply by 100 for future currency support)
    10. Generate ULID via `newId()` for expense id
    11. Call `createExpense(db, input)` repository
    12. Map stored row to ExpenseDTO
    13. Return `success<ExpenseDTO>(ctx, dto, 201)`
  - Add Vietnamese error messages to `apps/worker/src/lib/i18n/messages.vi.ts` for expense error cases
  - Create `apps/worker/src/routes/expenses.ts`
    - `new Hono<AppBindings>()`
    - Apply `authMiddleware` to all routes
    - Register `POST /` → `createExpenseHandler`
    - For private expenses: auth middleware only (no household membership check)
    - For household expenses: handler conditionally resolves membership (not middleware, since private expenses don't need it)
  - Register route in `apps/worker/src/index.ts` under `/api/v1/expenses`

  **Must NOT do**:
  - Do NOT accept `createdByUserId` from request body
  - Do NOT accept `groupIds` — not in scope
  - Do NOT use household middleware globally — private expenses don't need household context
  - Do NOT put SQL in handler — delegate to repository
  - Do NOT hardcode currency — resolve from household or default to VND

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: [`backend-patterns`, `security-reviewer`]

  **Parallelization**:
  - **Can Run In Parallel**: NO — depends on Tasks 1, 2, 5
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 8
  - **Blocked By**: Tasks 1 (migration), 2 (contract), 5 (repository)

  **References**:
  - `apps/worker/src/handlers/households/create-household.ts` — Handler pattern (thin, calls repository)
  - `apps/worker/src/handlers/invitations/create-household-invitation.ts` — Handler with audit logging pattern
  - `apps/worker/src/routes/households.ts` — Route registration with middleware composition
  - `apps/worker/src/middlewares/household-membership.ts` — `validateHouseholdIdParam`, `resolveHouseholdMembership`, `requireRole` — use conditionally in handler
  - `apps/worker/src/lib/permissions/household-policy.ts` — `canCreateExpense(role)` for authorization
  - `apps/worker/src/lib/response.ts` — `success<T>()`, `errorResponse()` helpers
  - `apps/worker/src/lib/validation.ts` — `readJsonBody<T>()` helper
  - `apps/worker/src/utils/id.ts` — `newId()` ULID generation
  - `apps/worker/src/types/app.ts` — `AppBindings`, `Variables` (currentUser, etc.)
  - `docs/references/backend/security-and-auth-pattern.md` — Auth middleware, ownership checks, input validation

  **Acceptance Criteria**:
  - [ ] File `apps/worker/src/handlers/expenses/create-expense.ts` exists
  - [ ] File `apps/worker/src/routes/expenses.ts` exists
  - [ ] Route registered in `apps/worker/src/index.ts`
  - [ ] Handler validates category kind (rejects income/transfer)
  - [ ] Handler sets createdByUserId from auth context
  - [ ] Handler defaults payerUserId to current user
  - [ ] Handler resolves currency from household or defaults to VND
  - [ ] Handler conditionally verifies household membership for household expenses
  - [ ] `pnpm --filter worker typecheck` passes

  **QA Scenarios**:

  ```
  Scenario: Worker compiles and route is registered
    Tool: Bash
    Steps:
      1. Run `pnpm --filter worker typecheck`
      2. Verify no type errors
    Expected Result: Clean typecheck, expense route registered
    Failure Indicators: Type errors, missing route registration
    Evidence: .sisyphus/evidence/task-6-handler-typecheck.txt
  ```

  **Commit**: YES (group with Wave 2)
  - Message: `feat(expense): add expense create handler and route`
  - Files: `apps/worker/src/handlers/expenses/create-expense.ts`, `apps/worker/src/routes/expenses.ts`, `apps/worker/src/index.ts`, `apps/worker/src/lib/i18n/messages.vi.ts`

- [x] 7. Web API Module + Endpoints + React Query Hooks

  **What to do**:
  - Update `apps/web/src/api/endpoints.ts` — add `expenses: { create: '/expenses' }`
  - Create `apps/web/src/api/expense.ts`
    - `createExpense(payload: CreateExpenseRequest)` — POST to `API_ENDPOINTS.expenses.create`, return `ExpenseDTO`
    - Use `client.post<ExpenseDTO>(API_ENDPOINTS.expenses.create, payload)`
  - Create `apps/web/src/hooks/api/use-expense.ts`
    - Define `EXPENSE_KEYS = { all: ['expenses'] as const, detail: (id: string) => [...EXPENSE_KEYS.all, id] as const }`
    - `useCreateExpenseMutation()` — `useMutation` calling `createExpense`, with `onSuccess` invalidating `EXPENSE_KEYS.all`
  - Ensure types are imported from `@/types/expense`

  **Must NOT do**:
  - Do NOT use `select: (data) => data` identity transform in useQuery/useMutation
  - Do NOT create store for expense data — React Query handles caching
  - Do NOT add mock data — backend is already built in this feature

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`frontend-patterns`]

  **Parallelization**:
  - **Can Run In Parallel**: NO — depends on Tasks 2, 3
  - **Parallel Group**: Wave 2
  - **Blocks**: Tasks 9, 10
  - **Blocked By**: Tasks 2 (contract types), 3 (web types)

  **References**:
  - `apps/web/src/api/endpoints.ts` — Existing endpoint pattern to add expenses to
  - `apps/web/src/api/household.ts` — API function pattern (client.post, return response.data)
  - `apps/web/src/hooks/api/use-households.ts` — React Query hook pattern (*_KEYS, useMutation with invalidateQueries)
  - `apps/web/src/hooks/api/use-reference-data.ts` — Reference data query hooks pattern
  - `docs/references/frontend/api-react-query-pattern.md` — API + React Query pattern rules

  **Acceptance Criteria**:
  - [ ] `API_ENDPOINTS.expenses.create` exists in endpoints.ts
  - [ ] `createExpense` function sends POST to `/expenses`
  - [ ] `EXPENSE_KEYS` defined with all/detail key factories
  - [ ] `useCreateExpenseMutation` calls createExpense and invalidates EXPENSE_KEYS.all on success
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
  - Message: `feat(expense): add web API module, endpoints, and React Query hooks`
  - Files: `apps/web/src/api/expense.ts`, `apps/web/src/api/endpoints.ts`, `apps/web/src/hooks/api/use-expense.ts`

- [x] 8. Worker Tests — unit + integration for expense creation

  **What to do**:
  - Create `apps/worker/test/integration/expenses.spec.ts`
  - Integration tests for `POST /api/v1/expenses`:
    - Create private expense → 201 with expense DTO (verify categoryKey, sourceKey, visibility='private', householdId=null, createdByUserId from auth, payerUserId defaulted to current user)
    - Create household expense with valid membership → 201 with visibility='household'
    - Create household expense without householdId → 400 INVALID_INPUT
    - Create household expense without membership → 403 FORBIDDEN
    - Create with income category key ('money-in') → 400 INVALID_INPUT
    - Create with transfer category key ('lending') → 400 INVALID_INPUT
    - Create with invalid source key → 400 INVALID_INPUT
    - Create without auth → 401 UNAUTHENTICATED
    - Create with zero/negative amount → 400
    - Create with missing required fields → 400
  - Ensure Vietnamese error messages are present in `apps/worker/src/lib/i18n/messages.vi.ts` for all expense error cases

  **Must NOT do**:
  - Do NOT test expense listing/detail/edit/delete — out of scope
  - Do NOT use `SELECT *` in test assertions — validate specific DTO fields
  - Do NOT skip auth middleware in happy path tests

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: [`tdd-workflow`, `backend-patterns`]

  **Parallelization**:
  - **Can Run In Parallel**: NO — depends on Tasks 2, 5, 6
  - **Parallel Group**: Wave 2
  - **Blocks**: None (but needed for verification)
  - **Blocked By**: Tasks 2 (contract), 5 (repository), 6 (handler+route)

  **References**:
  - `apps/worker/test/integration/households-crud.spec.ts` — Integration test pattern for household CRUD
  - `apps/worker/test/integration/households-members.spec.ts` — Membership authorization test pattern
  - `apps/worker/test/helpers/test-context.ts` — Shared test setup/util context
  - `docs/references/backend/testing-pattern.md` — Backend testing rules

  **Acceptance Criteria**:
  - [ ] File `apps/worker/test/integration/expenses.spec.ts` exists
  - [ ] All integration tests pass: private expense 201, household expense 201, missing householdId 400, no membership 403, income category 400, invalid source 400, no auth 401, zero amount 400
  - [ ] `pnpm --filter worker test` passes all tests including new expense tests
  - [ ] Error messages in Vietnamese for all expense error cases

  **QA Scenarios**:

  ```
  Scenario: All expense integration tests pass
    Tool: Bash
    Preconditions: Worker tests configured and running
    Steps:
      1. Run `pnpm --filter worker test`
      2. Verify all expense-related tests pass
    Expected Result: All tests pass, including 10+ integration test cases for expense creation
    Failure Indicators: Any test failure, missing test cases
    Evidence: .sisyphus/evidence/task-8-worker-tests.txt

  Scenario: Error responses include correct Vietnamese messages
    Tool: Bash
    Steps:
      1. Run `pnpm --filter worker test -- --grep "expense"`
      2. Check test output for Vietnamese error messages in 400/403 responses
    Expected Result: Error responses contain Vietnamese messages from messages.vi.ts
    Failure Indicators: English-only error messages, missing i18n keys
    Evidence: .sisyphus/evidence/task-8-i18n-messages.txt
  ```

  **Commit**: YES (group with Wave 2)
  - Message: `feat(expense): add worker integration tests for expense creation`
  - Files: `apps/worker/test/integration/expenses.spec.ts`, `apps/worker/src/lib/i18n/messages.vi.ts`

- [x] 9. Expense Form Component + Visibility Toggle

  **What to do**:
  - Create `apps/web/src/components/expense/expense-form.tsx` — smart component composing the expense entry form
  - Use `useForm<ExpenseFormValues>` with `zodResolver(expenseFormSchema)` from form-pattern.md
  - Compose existing `CategoryPicker` (from feat-016) filtered by `kind === 'expense'`
  - Compose existing `SourcePicker` (from feat-016) for source selection
  - Amount input (shadcn Input, numeric type, amount-first UX — large prominent field)
  - Date picker for `occurredAt` — use shadcn-compatible date picker
  - Title input with smart default populated from selected category label
  - Note textarea (optional, shadcn Textarea)
  - Visibility toggle: `private` / `household` radio group or Switch component
  - Conditional household picker: appears only when `visibility === 'household'`, uses household list from `useHouseholds` hook
  - Hidden currency field (auto-resolved from household default or VND)
  - Payer display: read-only showing current user name (MVP — no member selector)
  - Submit handler: transform form values to `CreateExpenseRequest`, call `useCreateExpenseMutation`
  - Follow component decomposition: ExpenseForm is the smart component, individual field groups are presentational children
  - Follow form-pattern.md: Controller for Select/Switch, data-invalid, aria-invalid, FieldError
  - Follow dialog-and-form-pattern.md: FieldGroup > Field > FieldLabel structure
  - Update `apps/web/src/components/expense/index.ts` to export ExpenseForm

  **Must NOT do**:
  - Do NOT create wrapper replacements for shadcn primitives (Button, Input, Card, etc.)
  - Do NOT modify CategoryPicker or SourcePicker — use them as-is
  - Do NOT hardcode strings — use i18n labels from vi.json
  - Do NOT include group assignment UI — out of scope
  - Do NOT create a separate payer selector component — MVP uses read-only display
  - Do NOT add currency picker — auto-resolved

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`frontend-design`, `shadcn`, `frontend-patterns`]

  **Parallelization**:
  - **Can Run In Parallel**: NO — depends on Tasks 3, 4, 7
  - **Parallel Group**: Wave 3
  - **Blocks**: Task 10
  - **Blocked By**: Tasks 3 (types/schema), 4 (i18n), 7 (API/hooks)

  **References**:
  - `apps/web/src/components/expense/category-picker.tsx` — CategoryPicker to compose (props: categories, value, onValueChange)
  - `apps/web/src/components/expense/source-picker.tsx` — SourcePicker to compose (props: value, onValueChange)
  - `apps/web/src/hooks/api/use-reference-data.ts` — useReferenceCategoriesQuery (filter by kind=expense), useReferenceSourcesQuery
  - `apps/web/src/hooks/api/use-households.ts` — useHouseholds for household picker
  - `apps/web/src/hooks/api/use-expense.ts` — useCreateExpenseMutation
  - `apps/web/src/lib/forms/expense.schema.ts` — expenseFormSchema
  - `apps/web/src/lib/i18n/locales/vi.json` — Vietnamese labels
  - `docs/references/frontend/form-pattern.md` — RHF + zod + shadcn form pattern
  - `docs/references/frontend/dialog-and-form-pattern.md` — FieldGroup > Field > FieldLabel, data-invalid, aria-invalid, FieldError
  - `.agents/skills/shadcn/SKILL.md` — Mandatory shadcn governance (read before UI work)
  - `.agents/skills/shadcn/rules/forms.md` — Form composition rules
  - `.agents/skills/shadcn/rules/composition.md` — Component composition rules
  - `docs/FRONTEND.md` — Mandatory component decomposition and shadcn-first rules

  **Acceptance Criteria**:
  - [ ] File `apps/web/src/components/expense/expense-form.tsx` exists
  - [ ] CategoryPicker renders with `kind=expense` filtered categories
  - [ ] SourcePicker renders all source options
  - [ ] Form validates required fields (amount, category, source) with error messages
  - [ ] Household picker appears only when visibility=household
  - [ ] Form submits correct payload to `POST /api/v1/expenses`
  - [ ] Title auto-populates from selected category label
  - [ ] All visible strings use i18n keys, no hardcoded text
  - [ ] `pnpm --filter web typecheck` passes

  **QA Scenarios**:

  ```
  Scenario: Form renders all fields and pickers
    Tool: Bash (pnpm test)
    Preconditions: Form component created with test
    Steps:
      1. Run component tests for ExpenseForm
      2. Verify CategoryPicker receives expense-filtered categories
      3. Verify SourcePicker renders
      4. Verify visibility toggle renders
    Expected Result: All form fields render correctly
    Failure Indicators: Missing fields, wrong category filter
    Evidence: .sisyphus/evidence/task-9-form-render.txt

  Scenario: Form validates required fields and shows errors
    Tool: Bash (pnpm test)
    Steps:
      1. Submit empty form
      2. Assert error messages for amount, category, source
      3. Select household visibility without selecting a household
      4. Assert error message for missing household
    Expected Result: Validation errors shown for each missing required field
    Failure Indicators: Form submits without required fields
    Evidence: .sisyphus/evidence/task-9-form-validation.txt

  Scenario: Household picker appears only when visibility=household
    Tool: Bash (pnpm test)
    Steps:
      1. Render form with visibility='private'
      2. Assert household picker NOT visible
      3. Toggle visibility to 'household'
      4. Assert household picker IS visible
      5. Toggle back to 'private'
      6. Assert household picker NOT visible
    Expected Result: Household picker conditionally rendered based on visibility
    Failure Indicators: Picker always shown or never shown
    Evidence: .sisyphus/evidence/task-9-visibility-toggle.txt
  ```

  **Commit**: YES (group with Wave 3)
  - Message: `feat(expense): add expense form component with visibility toggle`
  - Files: `apps/web/src/components/expense/expense-form.tsx`, `apps/web/src/components/expense/index.ts`

- [x] 10. Add Expense Page + Route — page orchestrator

  **What to do**:
  - Create `apps/web/src/views/app/add-expense-page.tsx` — page orchestrator
    - Fetch reference data (categories filtered by kind=expense, sources) using `useReferenceCategoriesQuery` and `useReferenceSourcesQuery`
    - Fetch households using `useHouseholds` for household picker
    - Handle loading/error states with shadcn Card/Skeleton
    - Compose `ExpenseForm` with fetched data as props
    - Handle success callback (e.g., navigate to expense feed or show toast)
  - Add Next.js App Router route in `apps/web/src/app/(app)/expenses/new/page.tsx` (follow existing route pattern for protected pages)
  - Ensure page is behind auth (protected route)
  - Navigate from main layout: add "Thêm chi tiêu" / "Add Expense" entry to navigation pointing to `/expenses/new`

  **Must NOT do**:
  - Do NOT create expense list/feed view — that's feat-021
  - Do NOT embed all form logic in the page — delegate to ExpenseForm smart component
  - Do NOT create a separate store for expense data — React Query handles caching

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`frontend-patterns`]

  **Parallelization**:
  - **Can Run In Parallel**: NO — depends on Tasks 7, 9
  - **Parallel Group**: Wave 3
  - **Blocks**: None (final implementation task)
  - **Blocked By**: Tasks 7 (API/hooks), 9 (form component)

  **References**:
  - `apps/web/src/views/app/household-detail-page.tsx` — Page orchestrator pattern (fetch data, handle loading/error, compose components)
  - `apps/web/src/app/(app)/` — Next.js App Router route pattern
  - `apps/web/src/hooks/api/use-reference-data.ts` — useReferenceCategoriesQuery, useReferenceSourcesQuery
  - `apps/web/src/hooks/api/use-households.ts` — useHouseholds
  - `apps/web/src/hooks/api/use-expense.ts` — useCreateExpenseMutation
  - `docs/references/frontend/project-folder-structure.md` — Page/view folder structure rules
  - `docs/references/frontend/component-structure-pattern.md` — Page orchestrator → smart component pattern

  **Acceptance Criteria**:
  - [ ] File `apps/web/src/views/app/add-expense-page.tsx` exists with page orchestrator
  - [ ] Next.js route at `/expenses/new` serves the Add Expense page
  - [ ] Page fetches reference data (categories, sources) and households
  - [ ] Loading and error states handled with shadcn components
  - [ ] ExpenseForm composed with correct props
  - [ ] Navigation includes "Add Expense" entry
  - [ ] `pnpm --filter web typecheck` passes
  - [ ] `pnpm --filter web build` succeeds

  **QA Scenarios**:

  ```
  Scenario: Add Expense page renders successfully
    Tool: Bash (pnpm test)
    Preconditions: Page and route created
    Steps:
      1. Run `pnpm --filter web test`
      2. Verify Add Expense page component tests pass
    Expected Result: Page renders with form, loading states handled
    Failure Indicators: Build error, rendering failure
    Evidence: .sisyphus/evidence/task-10-page-render.txt

  Scenario: Navigation includes expense entry point
    Tool: Bash
    Steps:
      1. Run `pnpm --filter web build`
      2. Verify build succeeds
    Expected Result: Clean build with no errors
    Failure Indicators: Build failure, missing route
    Evidence: .sisyphus/evidence/task-10-build.txt

  Scenario: Fullstack expense creation end-to-end
    Tool: Bash (curl)
    Preconditions: Worker running locally, authenticated session
    Steps:
      1. Start worker dev: `pnpm --filter worker dev`
      2. Create private expense: `curl -X POST http://localhost:8787/api/v1/expenses -H "Authorization: Bearer <token>" -H "Content-Type: application/json" -d '{"amount":50000,"categoryKey":"food","sourceKey":"cash","title":"Ăn trưa","occurredAt":1746000000000}'`
      3. Assert 201 response with expense DTO
    Expected Result: 201 Created with valid expense DTO including categoryKey, sourceKey, visibility='private'
    Failure Indicators: 400/401/500 errors, missing fields in response
    Evidence: .sisyphus/evidence/task-10-e2e-private-expense.txt

  Scenario: Household expense creation with membership
    Tool: Bash (curl)
    Steps:
      1. Create household expense: `curl -X POST http://localhost:8787/api/v1/expenses -H "Authorization: Bearer <token>" -H "Content-Type: application/json" -d '{"amount":100000,"categoryKey":"transport","sourceKey":"card","title":"Xăng","occurredAt":1746000000000,"visibility":"household","householdId":"<household-id>"}'`
      2. Assert 201 response
    Expected Result: 201 Created with visibility='household', householdId populated, currencyCode from household default
    Failure Indicators: 400/403/500 errors
    Evidence: .sisyphus/evidence/task-10-e2e-household-expense.txt
  ```

  **Commit**: YES (final commit)
  - Message: `feat(expense): add Add Expense page with route and navigation`
  - Files: `apps/web/src/views/app/add-expense-page.tsx`, `apps/web/src/app/(app)/expenses/new/page.tsx`

---

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.

- [x] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, curl endpoint, run command). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in harness/features/. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [x] F2. **Code Quality Review** — `unspecified-high`
  Run `pnpm typecheck` + `pnpm lint` + `pnpm test:worker` + `pnpm test:web`. Review all changed files for: `as any`/`@ts-ignore`, empty catches, console.log in prod, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names.
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N pass/N fail] | Files [N clean/N issues] | VERDICT`

- [x] F3. **Real Manual QA** — `unspecified-high`
  Start from clean state. Execute EVERY QA scenario from EVERY task — follow exact steps, capture evidence. Test cross-task integration (form submission creates expense via API, visibility rules enforced end-to-end). Test edge cases: private expense, household expense, invalid category, missing fields. Save to `.sisyphus/evidence/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [x] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff (git log/diff). Verify 1:1 — everything in spec was built (no missing), nothing beyond spec was built (no creep). Check "Must NOT do" compliance. Detect cross-task contamination. Flag unaccounted changes.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

- **Wave 1**: `feat(expense): add database migration 0003 for category_key and source_key columns` - migration file + contract + types
- **Wave 2**: `feat(expense): add worker create expense handler, repository, and route` - handler, repo, route, web API
- **Wave 3**: `feat(expense): add expense form UI with visibility toggle and page route` - form, page, route
- **Final**: `feat(expense): complete feat-017 expense entry create flow` - harness evidence, docs updates

---

## Success Criteria

### Verification Commands
```bash
./init.sh  # Expected: all steps pass
pnpm --filter worker test  # Expected: all tests pass including new expense tests
pnpm --filter web test  # Expected: all tests pass including new component tests
pnpm --filter web build  # Expected: successful build
pnpm --filter worker db:migrate:local  # Expected: migration 0003 applied cleanly
```

### Final Checklist
- [ ] All "Must Have" present
- [ ] All "Must NOT Have" absent
- [ ] All tests pass
- [ ] Migration applies cleanly
- [ ] Harness evidence updated
- [ ] Plan index updated