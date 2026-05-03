# ExecPlan: feat-022 Expense Group Management

## Purpose / Big Picture

Enable users to create, view, edit, and archive expense groups (events/projects) within a household so they can later assign expenses to named groups and track event-level budgets. After this plan, users will see a "Groups" section in the app with a list of active groups, each showing its name, total spend, and budget progress when applicable. Users can create new groups with optional dates and budgets, edit existing groups, and archive groups they no longer need.

## Scope

### In-scope

- **Backend (apps/worker):**
  - Database: no schema migration needed (`expense_groups` table exists in `0001_init.sql`)
  - Contracts: request/response schemas and DTO types for group operations
  - Repository: `expense-group-repository.ts` with CRUD + archive operations
  - Handlers: create, list, get, update, archive group handlers
  - Routes: register `/groups` sub-router under the protected API prefix
  - Middleware: household membership + role checks for group-scoped operations
  - Tests: unit tests for contracts, integration tests for all endpoints

- **Frontend (apps/web):**
  - API module: `api/groups.ts` with typed HTTP calls
  - React Query hooks: `hooks/api/use-groups.ts` with list/create/update/archive mutations
  - Types: `types/group.ts` with DTO/Request types
  - i18n keys: Vietnamese labels for group UI copy
  - Components: `components/group/group-card.tsx`, `components/group/group-list.tsx`, `components/group/group-form.tsx`
  - Views: `views/app/groups-page.tsx`
  - App Router pages: `app/(protected)/groups/page.tsx`
  - Navigation: add Groups to `PATHS`, `APP_MENU_ITEMS`, and `BOTTOM_TAB_ITEMS`

### Out-of-scope

- Assigning expenses to groups (covered by feat-023)
- Group-level analytics or breakdowns (covered by feat-028/feat-029)
- Bulk expense assignment during reconciliation
- Permanent deletion of groups (archive only, matching household pattern)
- Household settings to allow members to edit groups (defer to household settings extension)

## Non-negotiable Requirements

- The plan must be self-contained: all file paths, commands, and expected outputs are listed below.
- Every endpoint must have integration test coverage for happy path, validation failure, unauthorized, forbidden, and not-found.
- Frontend forms must use `zod` + `react-hook-form` with `Field`, `FieldLabel`, `FieldError`, and `aria-invalid`.
- All user-facing text must use i18n keys; no hardcoded Vietnamese or English strings in JSX.
- The repository already contains the `expense_groups` table; no new migration is required.

## Progress

- [ ] Step 1: Backend contracts, repository, handlers, routes, and tests
- [ ] Step 2: Frontend API, hooks, types, components, views, routes, and tests
- [ ] Step 3: Integration verification (`./init.sh` passes)
- [ ] Step 4: Harness evidence update and plan completion

## Surprises & Discoveries

- (TBD during implementation)

## Decision Log

- (TBD during implementation)

## Outcomes & Retrospective

- (To be filled on completion)

## Context and Orientation

- Worker app source: `apps/worker/src/`
- Worker tests: `apps/worker/test/`
- Web app source: `apps/web/src/`
- Web tests: `apps/web/src/**/*.test.tsx`
- Project verification script: `init.sh` at repo root
- Agent routing guidance: `AGENTS.md` at repo root
- Database schema baseline: `apps/worker/migrations/0001_init.sql` (already includes `expense_groups`)

## Scope Map and Layer Impact

Layer impact following `Types -> Config -> Repo -> Service -> Runtime -> UI`:

1. **Types**: New shared-fe DTOs and backend contracts for group CRUD.
2. **Config**: No wrangler or env changes.
3. **Repo**: New `expense-group-repository.ts` for group data access.
4. **Service**: New handlers for group business logic (permission checks, mapping).
5. **Runtime**: New `/api/v1/groups*` route registration in worker index.
6. **UI**: New Groups page, navigation updates, group list/form components.

Hard dependency checks:
- Lower layers do not depend on higher layers (repo has no handler imports, handlers have no UI imports).
- UI does not bypass runtime contracts (all group data flows through API hooks).
- Data access enters through the repository boundary.

## Standards Enforcement

### Frontend References (required)

- `docs/references/frontend/project-folder-structure.md`:
  - Feature code lives in `api/groups.ts`, `hooks/api/use-groups.ts`, `components/group/*`, `views/app/groups-page.tsx`.
  - Stores: no global group store needed; React Query cache is sufficient.
- `docs/references/frontend/component-structure-pattern.md`:
  - Page component uses `export const GroupsPage = () => {}`.
  - Child components in `components/group/` have `index.ts` barrel exporting public components only.
  - Split any file exceeding ~200 lines by concern (list vs form vs card).
- `docs/references/frontend/naming-and-conventions-pattern.md`:
  - File names: `groups.ts`, `use-groups.ts`, `group-card.tsx`, `groups-page.tsx`.
  - Query keys: `GROUP_KEYS` with `all`, `list`, `detail`.
  - Import order: third-party → blank line → `@/` aliases.
- `docs/references/frontend/form-pattern.md`:
  - Use `zodResolver`, `useForm`, `Controller`, `Field`, `FieldLabel`, `FieldError`.
  - `defaultValues` must be complete.
  - `id` + `htmlFor` mapping required.
- `docs/references/frontend/dialog-and-form-pattern.md`:
  - Create/Edit forms may be rendered in dialogs or standalone pages; prefer dialog for create/edit to keep list context.
  - Dialog uses `ref` pattern (`useImperativeHandle`) if modal state is managed externally.
- `docs/references/frontend/api-react-query-pattern.md`:
  - Endpoints added to `API_ENDPOINTS`.
  - Hooks use `*_KEYS`, `invalidateQueries` on mutations.
  - UI calls hooks only; no direct `api/*` calls from components.
- `docs/references/frontend/i18n-label-pattern.md`:
  - Keys added to `vi.json` (and `en.json` if it exists).
  - Semantic nested keys: `groups.list.title`, `groups.form.name.label`, etc.

### Backend References (required)

- `docs/references/backend/architecture-and-boundaries.md`:
  - Routes contain no SQL; handlers contain business logic; repository contains queries.
- `docs/references/backend/api-contract-and-validation.md`:
  - Base path `/api/v1`; JSON-only; camelCase fields.
  - Validate body/params explicitly.
- `docs/references/backend/error-handling-pattern.md`:
  - Use correct 4xx/5xx status codes; never return 200 for failures.
- `docs/references/backend/security-and-auth-pattern.md`:
  - Enforce ownership/membership checks; validate input.
- `docs/references/backend/testing-pattern.md`:
  - Minimum endpoint coverage: happy path, validation failure, unauthorized, forbidden, not found.
- `docs/references/backend/database-pattern.md`:
  - No `SELECT *`; bind all parameters; map DB columns explicitly.
  - DB columns are `snake_case`; API payloads are `camelCase`.
- `docs/references/backend/cloudflare-workers.md`:
  - Run `wrangler types` if bindings change (not expected here).

### Shared References (required)

- `docs/references/shared/type-naming-pattern.md`:
  - DTO: `GroupDTO`
  - Request: `CreateGroupRequest`, `UpdateGroupRequest`, `ArchiveGroupRequest`
  - Response: wrapped in `ApiResponse<...>`

## Plan of Work (Narrative)

### Backend

1. **Contracts** (`apps/worker/src/contracts/expense-group.ts` and update `index.ts`):
   - `CreateGroupRequest` schema: `name` (string, 1-100), `description` (optional string, max 500), `eventBudgetMinor` (optional positive integer), `startDate` (optional ISO date string), `endDate` (optional ISO date string, must be >= startDate if both present).
   - `UpdateGroupRequest` schema: same fields all optional; at least one must be provided.
   - `GroupDTO` type: `id`, `householdId`, `name`, `description`, `status`, `startDate`, `endDate`, `eventBudgetMinor`, `totalSpendMinor` (computed), `createdByUserId`, `createdAt`, `updatedAt`.

2. **Repository** (`apps/worker/src/db/repositories/expense-group-repository.ts`):
   - `createExpenseGroup(db, input)` → insert and return mapped row.
   - `listActiveExpenseGroups(db, householdId)` → select active groups for household, ordered by `created_at DESC`.
   - `findExpenseGroupById(db, groupId)` → select by id (any status).
   - `updateExpenseGroup(db, input)` → patch mutable fields, return updated row.
   - `archiveExpenseGroup(db, groupId)` → set `status = 'archived'`, `archived_at = now`.
   - Include a `totalSpendMinor` subquery or helper that sums `expenses.amount_minor` joined through `expense_group_items` for the group.

3. **Handlers** (one file per handler under `apps/worker/src/handlers/groups/`):
   - `create-group.ts`: parse body, validate household membership, require `admin` or `member` role (open to all active members for MVP), create group, return `GroupDTO`.
   - `list-groups.ts`: read `household_id` query param (required), validate active membership, list active groups with computed `totalSpendMinor`.
   - `get-group.ts`: read `:id` param, validate membership, return group.
   - `update-group.ts`: read `:id` + body, validate membership, allow update by admin or by member if they created the group (MVP: admin only to keep simple; record decision if changed).
   - `archive-group.ts`: read `:id`, validate admin membership, archive group.

4. **Routes** (`apps/worker/src/routes/groups.ts`):
   - Register under `/groups` with `authMiddleware`.
   - `POST /groups` → create
   - `GET /groups?household_id=...` → list
   - `GET /groups/:id` → get
   - `PATCH /groups/:id` → update
   - `POST /groups/:id/archive` → archive

5. **Index registration** (`apps/worker/src/index.ts`):
   - Import and mount `groupsRoutes` under `/api/v1`.

6. **Tests**:
   - Unit: `apps/worker/test/unit/dto-expense-group.spec.ts` for schema validation edge cases.
   - Integration: `apps/worker/test/integration/expense-groups.spec.ts` covering all endpoints and permission paths.

### Frontend

1. **Types** (`apps/web/src/types/group.ts`):
   - Mirror backend DTOs: `GroupDTO`, `CreateGroupRequest`, `UpdateGroupRequest`.

2. **API module** (`apps/web/src/api/groups.ts`):
   - `getGroups(householdId)`, `createGroup(payload)`, `updateGroup(id, payload)`, `archiveGroup(id)`.

3. **Endpoints** (`apps/web/src/api/endpoints.ts`):
   - Add `groups` section with `list`, `create`, `detail(id)`, `update(id)`, `archive(id)`.

4. **Hooks** (`apps/web/src/hooks/api/use-groups.ts`):
   - `GROUP_KEYS` with `all`, `list(householdId)`, `detail(id)`.
   - `useGroups(householdId)` query.
   - `useCreateGroup()`, `useUpdateGroup()`, `useArchiveGroup()` mutations with invalidation.

5. **i18n** (`apps/web/src/lib/i18n/locales/vi.json`):
   - Add `groups.*` keys for list title, empty state, form labels, buttons, toasts.

6. **Components** (`apps/web/src/components/group/`):
   - `group-card.tsx`: display name, date range, budget progress bar (if budget set), total spend.
   - `group-list.tsx`: render list of cards with empty state.
   - `group-form.tsx`: reusable create/edit form using `zod` + `react-hook-form`, dialog-capable.
   - `index.ts`: barrel export public components.

7. **View** (`apps/web/src/views/app/groups-page.tsx`):
   - Orchestrator page: header with title and "Create Group" button, `GroupList`, dialog trigger for form.

8. **App Router page** (`apps/web/src/app/(protected)/groups/page.tsx`):
   - Re-export `GroupsPage`.

9. **Navigation updates**:
   - `PATHS`: add `GROUPS: '/groups'`.
   - `APP_MENU_ITEMS`: add Groups entry with `Tags` icon (or `FolderOpen` if available).
   - `BOTTOM_TAB_ITEMS`: add Groups entry.

10. **Tests**:
    - Component tests for `group-card`, `group-form`, `group-list`.
    - Hook tests for `use-groups` (mock API).

## Concrete Steps (Commands)

All commands assume repo root as working directory unless noted.

```bash
# Baseline verification
./init.sh

# Worker tests (after backend implementation)
pnpm --filter @app/worker test

# Web tests (after frontend implementation)
pnpm --filter @app/web test

# Full verification
./init.sh
```

### Expected transcripts

- `./init.sh` should complete with no errors (lint, type-check, tests, build).
- `pnpm --filter @app/worker test` should show all new integration tests passing.
- `pnpm --filter @app/web test` should show all new component/hook tests passing.

## Validation and Acceptance

### Backend

- `POST /api/v1/groups` with valid payload returns 201 and `GroupDTO`.
- `POST /api/v1/groups` without `name` returns 400 with validation error.
- `GET /api/v1/groups?household_id=<id>` returns 200 and list of active groups with `totalSpendMinor`.
- `GET /api/v1/groups?household_id=<id>` without auth returns 401.
- `GET /api/v1/groups?household_id=<id>` as non-member returns 403.
- `PATCH /api/v1/groups/:id` updates name/description/budget/dates and returns updated group.
- `POST /api/v1/groups/:id/archive` as admin returns 200 and archived group; as member returns 403.
- `GET /api/v1/groups/:id` for non-existent group returns 404.

### Frontend

- `/groups` renders list of groups with correct navigation item highlighted.
- Clicking "Create Group" opens form dialog; submitting creates group and invalidates list.
- Group card shows budget progress bar when `eventBudgetMinor` is set.
- Empty state shows i18n message when no groups exist.
- Edit form pre-fills existing values and updates on submit.
- Archive action removes group from active list (via mutation + invalidation).

## Idempotence & Recovery

- All implementation steps are additive; re-running tests or builds is safe.
- No destructive database operations (archive only).
- If a test fails, fix and re-run `./init.sh`.

## Artifacts and Notes

- Evidence snippets should include passing worker integration test output and web component test output.
- Keep harness feature file evidence field updated with test file paths.

## Interfaces & Dependencies

- **External libraries**: No new dependencies expected.
- **Internal modules**:
  - Worker reuses `authMiddleware`, household membership repository, household policy utilities.
  - Web reuses `client.ts`, shadcn UI primitives, `useHouseholds` hook for household selection context.

## Implementation Notes

### Scope-specific patterns that are mandatory

- Backend handlers must check household membership before any group operation.
- Archive is admin-only; create/list/get are available to any active household member.
- Update permission: MVP defaults to admin-only for simplicity. If product wants member self-editing, record a decision to relax in the policy.
- Frontend list query requires an explicit `householdId` param; do not assume a global active household.

### Skill recommendations for the implementation phase

- `tdd-workflow`: write contract unit tests and route integration tests before handlers.
- `security-review`: audit membership checks and role guards on archive/update.
- `frontend-patterns`: apply component decomposition early (card, list, form, page).
- `verification-loop`: run `./init.sh` after each major backend/frontend milestone.

### Common pitfalls to avoid

- Do not use `SELECT *` in repository queries.
- Do not forget `invalidateQueries` after create/update/archive mutations.
- Do not hardcode strings; add i18n keys before merging.
- Do not couple group form to expense assignment logic (out of scope).
- Do not create a new DB migration — the `expense_groups` table already exists.

## Harness Integration

- Update `harness/features/feat-022.json`:
  - Set `status` to `in_progress` when implementation starts.
  - Set `status` to `done` and fill `evidence` when `./init.sh` passes.
- Update `harness/feature_index.json`:
  - Move `feat-022` status from `pending` to `in_progress` / `done`.
- Update `harness/progress.md`:
  - Log each session with summary, files changed, blockers, and next steps.
- If any work is deferred (e.g., member-editable groups), add to `docs/exec-plans/tech-debt-tracker.md`.
