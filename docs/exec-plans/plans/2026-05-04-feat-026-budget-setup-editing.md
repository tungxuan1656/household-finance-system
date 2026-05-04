# ExecPlan: feat-026 — Budget Setup & Editing

## Title

Budget setup & editing (fullstack)

## Purpose / Big Picture

Allow household admins to create and edit monthly budgets with a total spending limit and optional per-category sub-budgets (keyed by the global expense category catalog from feat-016). Users will see a Budget Setup page with a period selector (year-month), a total budget input, and expandable per-category budget rows populated from the global expense-category catalog. A Budget Summary card on the household dashboard will show the current period and total. Spend tracking and threshold alerts are explicitly out of scope (feat-027).

## Scope

### In Scope

**Backend (apps/worker):**
- Migration 0006: add `category_key` to `budget_limits`, update constraints, simplify `budgets` scope usage
- Contracts: `budget-schemas.ts` (create/update request schemas, path params, query params), `budget-types.ts` (DTO types)
- Repository: `budget-repository.ts` (CRUD for household-level budgets + per-category limits keyed by global category key)
- Handlers: `create-budget.ts`, `get-budget.ts`, `list-budgets.ts` (by period), `update-budget.ts`
- Routes: `budgets.ts` (POST, GET by period, GET :id, PATCH :id)
- Audit logging for budget changes
- Admin-only enforcement via household membership middleware
- Unit tests for schemas, integration tests for all endpoints

**Frontend (apps/web):**
- Types: `budget.ts` (BudgetDTO, CreateBudgetRequest, UpdateBudgetRequest, BudgetLimitDTO, etc.)
- API: `budget.ts` (endpoint functions), `endpoints.ts` (budget endpoints)
- Hooks: `use-budgets.ts` (React Query hooks for CRUD + list by period)
- Components: `budget/budget-form.tsx`, `budget/budget-form-fields.tsx`, `budget/budget-period-selector.tsx`, `budget/budget-category-row.tsx`, `budget/budget-summary-card.tsx`
- Views: `budgets-page.tsx` (replace placeholder)
- i18n: Vietnamese labels for budget UI
- Component tests

### Out of Scope

- Spend tracking and threshold alerts (feat-027)
- Budget analytics charts (feat-028/029)
- Recurring budget rules or budget start-day customization
- Budget deletion/archival (can be added later)
- Currency conversion (uses household default currency)
- Notification delivery (email/push)

## Non-negotiable Requirements

- The plan must be self-contained (include definitions and commands needed to complete it).
- The plan must produce observable behaviour or tests demonstrating success.
- Every technical term must be defined in-place.

## Progress

- [ ] Step 1: Migration 0006 — add `category_key` to `budget_limits`, update constraints
- [ ] Step 2: Backend contracts — `budget-schemas.ts`, `budget-types.ts`
- [ ] Step 3: Backend repository — `budget-repository.ts`
- [ ] Step 4: Backend handlers — create, get, list-by-period, update
- [ ] Step 5: Backend routes — `budgets.ts`, register in `index.ts`
- [ ] Step 6: Backend tests — unit schema tests, integration tests
- [ ] Step 7: Frontend types — `budget.ts`
- [ ] Step 8: Frontend API + endpoints — `budget.ts`, `endpoints.ts`
- [ ] Step 9: Frontend hooks — `use-budgets.ts`
- [ ] Step 10: Frontend components — budget form, period selector, category rows, summary card
- [ ] Step 11: Frontend views — replace `budgets/page.tsx` placeholder
- [ ] Step 12: Frontend i18n — Vietnamese labels
- [ ] Step 13: Frontend tests — component tests
- [ ] Step 14: Full verification — `./init.sh`

## Surprises & Discoveries

_(To be filled during implementation)_

## Decision Log

- **Decision**: Use `category_key` (global catalog key) instead of `category_id` (FK to `expense_categories`) for per-category budget limits, consistent with the expense model from feat-016/017.
  - Rationale: The global static category catalog is the source of truth for categories. The `expense_categories` table is legacy and will be removed. Per-category budget limits must reference the same global keys that expenses use.
  - Date/Author: 2026-05-04 / Orchestrator

- **Decision**: Use existing `budgets` table with `scope='household'` only. Per-category limits go in `budget_limits` with `category_key`. Do not create per-category budget rows in `budgets`.
  - Rationale: The feat-026 description specifies "optional per-category sub-budgets array keyed by global category key" as part of the household budget, not as separate budget records. This simplifies the model to one budget per household per month with optional per-category breakdowns.
  - Date/Author: 2026-05-04 / Orchestrator

- **Decision**: Budget period uses `YYYY-MM` format (e.g., `2026-05`). The `budget_month` column already exists as TEXT in the `budgets` table.
  - Rationale: Matches the existing schema and is the natural format for monthly budgets.
  - Date/Author: 2026-05-04 / Orchestrator

- **Decision**: Only household admins can create/edit budgets. Members can view.
  - Rationale: Matches the product spec entry condition ("User is an Admin or Member with budgeting rights") and the existing role enforcement pattern from feat-015a.
  - Date/Author: 2026-05-04 / Orchestrator

- **Decision**: Budget changes are audit-logged via the existing `audit_logs` table.
  - Rationale: Product spec requires "Budget changes are auditable." The `audit_logs` table already exists and is used for expense lifecycle events.
  - Date/Author: 2026-05-04 / Orchestrator

- **Decision**: `start_date` and `end_date` in `budgets` table will be derived from `budget_month` (first day and last day of the month). They remain in the schema for future flexibility but are auto-computed, not user-specified.
  - Rationale: Simplifies the user experience — users only select a month, not arbitrary date ranges. The columns exist in the schema and can be used for custom date ranges in a future phase.
  - Date/Author: 2026-05-04 / Orchestrator

## Outcomes & Retrospective

_(To be filled after completion)_

## Context and Orientation

- Worker source: `apps/worker/src/`
- Worker contracts: `apps/worker/src/contracts/`
- Worker handlers: `apps/worker/src/handlers/`
- Worker repositories: `apps/worker/src/db/repositories/`
- Worker routes: `apps/worker/src/routes/`
- Worker middlewares: `apps/worker/src/middlewares/`
- Worker tests: `apps/worker/test/`
- Worker migrations: `apps/worker/migrations/`
- Web source: `apps/web/src/`
- Web types: `apps/web/src/types/`
- Web API: `apps/web/src/api/`
- Web hooks: `apps/web/src/hooks/api/`
- Web components: `apps/web/src/components/`
- Web views: `apps/web/src/views/app/`
- Web pages: `apps/web/src/app/(protected)/`
- Web i18n: `apps/web/src/lib/i18n/locales/vi.json`
- Reference data catalog: `apps/worker/src/lib/reference-data/catalog.ts`
- Existing budget placeholder page: `apps/web/src/app/(protected)/budgets/page.tsx`
- Existing DB schema: `budgets` and `budget_limits` tables in `apps/worker/migrations/0001_init.sql`

## Plan of Work (Narrative)

### Step 1: Migration 0006 — Budget schema update for category_key

Create `apps/worker/migrations/0006_budget_category_key.sql`:

The existing `budgets` and `budget_limits` tables use `category_id` (FK to `expense_categories`), but feat-016 introduced global static categories keyed by string keys. This migration aligns budget limits with the global catalog pattern.

Changes:
1. Add `category_key TEXT` column to `budget_limits` (nullable, references global catalog key).
2. Make `category_id` in `budget_limits` nullable (legacy, no longer required).
3. Drop the unique constraint `(budget_id, category_id)` on `budget_limits` and add a new unique constraint `(budget_id, category_key)` where `category_key IS NOT NULL`.
4. Add index on `budget_limits(category_key)`.
5. Drop the CHECK constraint on `budgets` that requires `category_id` when `scope='category'` (we only use `scope='household'`).
6. Drop the unique index `idx_budgets_category_scope_month` (no longer needed since we don't use `scope='category'`).

### Step 2: Backend contracts — `budget-schemas.ts`, `budget-types.ts`

Create `apps/worker/src/contracts/budget-schemas.ts`:
- `createBudgetRequestSchema()`: validates `householdId` (string, required), `period` (YYYY-MM format, required), `totalLimit` (positive integer, required), `categoryLimits` (optional array of `{ categoryKey: ReferenceCategoryKey, limitMinor: positive integer }`). Validates that all `categoryKey` values have `kind='expense'` in the catalog.
- `updateBudgetRequestSchema()`: validates `totalLimit` (optional positive integer), `categoryLimits` (optional array, replaces all category limits). At least one field must be provided.
- `budgetPathParamsSchema()`: validates `id` (string, required).
- `budgetListQuerySchema()`: validates `household_id` (string, required), `period` (YYYY-MM, optional).

Create `apps/worker/src/contracts/budget-types.ts`:
- `BudgetDTO`: id, householdId, period (YYYY-MM), totalLimitMinor, currencyCode, categoryLimits (BudgetCategoryLimitDTO[]), createdByUserId, createdAt, updatedAt
- `BudgetCategoryLimitDTO`: categoryKey, limitMinor
- `CreateBudgetRequest`, `UpdateBudgetRequest` (inferred from schemas)
- `ListBudgetsResponse`: items (BudgetDTO[])
- `CreateBudgetResponse = BudgetDTO`
- `UpdateBudgetResponse = BudgetDTO`

Update `apps/worker/src/contracts/index.ts` to export new contracts.

### Step 3: Backend repository — `budget-repository.ts`

Create `apps/worker/src/db/repositories/budget-repository.ts`:

Define `StoredBudget` and `StoredBudgetLimit` interfaces mapping DB columns (snake_case) to camelCase.

Implement:
- `createBudget(db, input)`: Insert into `budgets` (scope='household', auto-compute start_date/end_date from budget_month, currency_code from household default). If `categoryLimits` provided, batch-insert into `budget_limits` with `category_key`. Return full `StoredBudget` with limits.
- `findBudgetById(db, id)`: Fetch budget + its category limits. Return null if not found or archived.
- `findBudgetByPeriod(db, householdId, period)`: Fetch household budget for a specific month. Return null if not found.
- `listBudgetsByHousehold(db, householdId)`: Fetch all active budgets for a household, ordered by period desc.
- `updateBudget(db, id, input)`: Update total_limit_minor and/or replace all category limits. Uses transaction (batch) for atomicity. Returns updated budget.
- `deleteBudgetLimits(db, budgetId)`: Delete all category limits for a budget (used before re-insert on update).

### Step 4: Backend handlers

Create `apps/worker/src/handlers/budgets/` directory:

- `create-budget.ts`: Admin-only. Validate request, check household membership + admin role, check no existing budget for same household+period, create budget with category limits, write audit log, return BudgetDTO.
- `get-budget.ts`: Validate path params, check household membership, fetch budget by ID, return BudgetDTO. Return 404 if not found or not member of household.
- `list-budgets.ts`: Validate query params (household_id required, period optional), check household membership, fetch budgets, return list.
- `update-budget.ts`: Admin-only. Validate request, check household membership + admin role, update budget total and/or category limits (atomic: delete old limits, insert new ones), write audit log, return BudgetDTO.

### Step 5: Backend routes — `budgets.ts`

Create `apps/worker/src/routes/budgets.ts`:
- `POST /api/v1/budgets` → createBudgetHandler
- `GET /api/v1/budgets` → listBudgetsHandler (query: household_id, period)
- `GET /api/v1/budgets/:id` → getBudgetHandler
- `PATCH /api/v1/budgets/:id` → updateBudgetHandler

All routes require `authMiddleware`.

Register in `apps/worker/src/index.ts`.

### Step 6: Backend tests

Create `apps/worker/test/unit/dto-budget.spec.ts`:
- Schema validation tests for create, update, path params, query params.

Create `apps/worker/test/integration/budgets-crud.spec.ts`:
- Happy path: create budget, get budget, list budgets, update budget (total + category limits)
- Validation: invalid period format, negative total, non-expense category key, duplicate period
- Authorization: 401 unauthenticated, 403 non-admin create/update, 404 non-member get
- Category limit validation: duplicate category keys, non-expense kind category keys

### Step 7: Frontend types — `budget.ts`

Create `apps/web/src/types/budget.ts`:
- `BudgetDTO`: id, householdId, period, totalLimitMinor, currencyCode, categoryLimits (BudgetCategoryLimitDTO[]), createdByUserId, createdAt, updatedAt
- `BudgetCategoryLimitDTO`: categoryKey, limitMinor
- `CreateBudgetRequest`: householdId, period, totalLimit, categoryLimits?
- `UpdateBudgetRequest`: totalLimit?, categoryLimits?
- `ListBudgetsResponse`: items (BudgetDTO[])
- `CreateBudgetResponse = BudgetDTO`
- `UpdateBudgetResponse = BudgetDTO`

### Step 8: Frontend API + endpoints

Update `apps/web/src/api/endpoints.ts`:
- Add `budgets: { create: '/budgets', list: '/budgets', detail: (id: string) => '/budgets/${id}' }`

Create `apps/web/src/api/budget.ts`:
- `createBudget(payload)`: POST to budgets endpoint
- `listBudgets(householdId, period?)`: GET with query params
- `getBudget(id)`: GET budget detail
- `updateBudget({ id, payload })`: PATCH budget

### Step 9: Frontend hooks — `use-budgets.ts`

Create `apps/web/src/hooks/api/use-budgets.ts`:
- `BUDGET_KEYS`: all, lists, list(householdId, period?), detail(id)
- `useBudgetListQuery(householdId, period?)`: query for listing budgets
- `useBudgetDetailQuery(id)`: query for budget detail
- `useCreateBudgetMutation()`: mutation with invalidation
- `useUpdateBudgetMutation()`: mutation with invalidation

### Step 10: Frontend components

Create `apps/web/src/components/budget/` directory:

- `budget-period-selector.tsx`: Month/year picker (dropdown or input for YYYY-MM)
- `budget-form-fields.tsx`: Form fields for total budget amount + expandable per-category rows
- `budget-category-row.tsx`: Single category row with category label/icon (from global catalog), limit input, and remove button
- `budget-form.tsx`: Main form component combining period selector, total input, and category rows. Uses react-hook-form + zod.
- `budget-summary-card.tsx`: Card showing period, total budget, and per-category breakdown (for household dashboard)
- `create-budget-dialog.tsx`: Dialog wrapper for creating a new budget
- `edit-budget-dialog.tsx`: Dialog wrapper for editing an existing budget
- `index.ts`: Barrel exports

### Step 11: Frontend views — replace budgets placeholder

Replace `apps/web/src/app/(protected)/budgets/page.tsx`:
- Remove placeholder, wire `BudgetsPage` view
- Create `apps/web/src/views/app/budgets-page.tsx`: Orchestrator page that fetches current household, loads budget list, renders budget cards with create/edit actions

### Step 12: Frontend i18n

Add Vietnamese labels to `apps/web/src/lib/i18n/locales/vi.json`:
- Budget page title, period labels, total budget label, category budget labels, create/edit/delete actions, empty states, error messages

### Step 13: Frontend tests

- `apps/web/src/components/budget/budget-form.test.tsx`: Form rendering, validation, submission
- `apps/web/src/components/budget/budget-summary-card.test.tsx`: Card rendering with budget data
- `apps/web/src/views/app/budgets-page.test.tsx`: Page rendering, budget list, create/edit flow

### Step 14: Full verification

Run `./init.sh` from repo root and verify all checks pass.

## Concrete Steps (Commands)

```bash
# From repo root

# Step 1: Create migration
# (manual file creation)

# Step 2-6: Backend implementation
# (manual file creation)

# Verify backend
pnpm --filter worker test

# Step 7-13: Frontend implementation
# (manual file creation)

# Full verification
./init.sh
```

Expected outputs:
- `pnpm --filter worker test`: All tests pass including new budget tests
- `./init.sh`: Lint, type-check, tests, and build all pass

## Validation and Acceptance

### Happy Path
- `POST /api/v1/budgets` with `{ householdId, period: "2026-05", totalLimit: 5000000, categoryLimits: [{ categoryKey: "food", limitMinor: 2000000 }] }` returns 201 with BudgetDTO
- `GET /api/v1/budgets?household_id=xxx&period=2026-05` returns budget with category limits
- `PATCH /api/v1/budgets/:id` with `{ totalLimit: 6000000 }` returns updated BudgetDTO
- Budget Setup page renders period selector, total input, and category rows from global catalog

### Validation/Error Paths
- POST with invalid period format (e.g., "2026-5") returns 400
- POST with non-expense category key (e.g., "money-in") returns 400
- POST with duplicate period for same household returns 409
- PATCH with empty body returns 400
- Non-admin POST/PATCH returns 403
- Unauthenticated request returns 401

### Regression Checks
- Existing expense, group, household, and auth endpoints continue to work
- Existing budget-related DB constraints remain valid
- `./init.sh` passes cleanly

## Idempotence & Recovery

- Migration 0006 is idempotent (uses `ALTER TABLE ADD COLUMN` which is safe to re-run with `IF NOT EXISTS` patterns in D1)
- Budget creation checks for existing budget before insert (409 on duplicate period)
- Budget update uses atomic batch (delete old limits + insert new limits) for consistency
- No destructive data operations; all changes are additive

## Artifacts and Notes

_(To be filled during implementation with evidence snippets)_

## Interfaces & Dependencies

### External Dependencies
- Global category catalog (`apps/worker/src/lib/reference-data/catalog.ts`): Used to validate `categoryKey` values and filter to `kind='expense'` categories
- Household membership middleware (`apps/worker/src/middlewares/household-membership.ts`): Used for auth + role checks
- Audit log repository (`apps/worker/src/db/repositories/audit-log-repository.ts`): Used for budget change audit entries

### Internal Dependencies
- feat-015a (role & permission backend enforcement): Admin-only budget creation/editing
- feat-016 (global static expense reference data): Category catalog for per-category budget rows
- feat-021 (expense search, filters & pagination): Expense query patterns for future spend tracking (feat-027)

### API Contracts
- `POST /api/v1/budgets` → 201 BudgetDTO | 400 | 401 | 403 | 409
- `GET /api/v1/budgets?household_id=xxx&period=YYYY-MM` → 200 ListBudgetsResponse | 401
- `GET /api/v1/budgets/:id` → 200 BudgetDTO | 401 | 404
- `PATCH /api/v1/budgets/:id` → 200 BudgetDTO | 400 | 401 | 403 | 404

## Implementation Notes

### Scope-Specific Patterns (Mandatory)

**Backend patterns** (from `docs/references/backend/`):
- Route → Handler → Repository separation (no SQL in routes)
- Zod schema validation for all request inputs
- `newId()` for ULID generation
- `success()` response envelope helper
- Admin-only guard via `requireRole('admin')` middleware
- Audit log entries for create/update operations

**Frontend patterns** (from `docs/references/frontend/`):
- React Query hooks with `BUDGET_KEYS` query key factory
- `zodResolver` + `useForm` for budget form
- `Controller` for controlled field types (Select, etc.)
- Feature components in `src/components/budget/`
- View orchestrator in `src/views/app/budgets-page.tsx`
- i18n keys in `vi.json` under `budget.*` namespace

**Shared patterns** (from `docs/references/shared/`):
- DTO suffix for data exchange types
- Request suffix for API input types
- Response suffix for API output types

### Skill Recommendations

- `tdd-workflow`: Write backend schema tests and integration tests before/alongside implementation
- `security-review`: Budget creation/editing involves admin-only authorization — verify role enforcement
- `frontend-patterns`: Follow established React Query + form patterns
- `verification-loop`: Run `./init.sh` after each major step

### Common Pitfalls

1. **Category key validation**: Must filter to `kind='expense'` only. The catalog includes `kind='income'` and `kind='transfer'` categories that must be rejected.
2. **Duplicate period**: Only one budget per household per period. Enforce via unique index and 409 response.
3. **Atomic category limit updates**: When updating category limits, delete all existing limits and insert new ones in a single batch to avoid partial state.
4. **Budget month format**: Must validate `YYYY-MM` format strictly (e.g., reject "2026-5" — must be "2026-05").
5. **Currency code**: Use household's `default_currency_code` for the budget, not user-specified.
6. **Audit logging**: Budget create and update must write audit log entries with action_type and payload.