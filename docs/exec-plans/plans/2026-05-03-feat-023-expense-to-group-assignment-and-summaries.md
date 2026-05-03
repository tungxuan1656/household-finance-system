# ExecPlan: feat-023 — Expense-to-Group Assignment & Summaries

**Feature ID:** `feat-023`  
**Status:** `in_progress` (active plan)  
**Target Domain:** `fullstack`  
**Dependencies:** `feat-018`, `feat-022`  
**Created:** `2026-05-03`

---

## Title

Add expense-to-group assignment and group summary views so users can tag expenses to events/projects and see aggregated spend, budget remaining, and member contribution breakdowns.

## Purpose / Big Picture

Users create expense groups (e.g., "Vacation", "Tet shopping") in `feat-022`. This feature wires those groups to actual expenses and surfaces group-level insights. End-user observable behaviour:

- When creating or editing an expense, the user can assign it to one or more groups.
- A group detail page shows total spend, expense count, remaining budget, and a per-member contribution breakdown.
- A bulk-assign modal lets users retroactively tag multiple existing expenses to a group.
- The expense list feed can indicate which groups an expense belongs to.

## Scope

### In Scope

**Backend:**
- Add `groupIds` (string array) to expense create/update request schemas and types.
- Update `create-expense` handler to write `expense_group_items` rows when `groupIds` is provided.
- Create `PATCH /api/v1/expenses/:id/groups` endpoint — bulk replace group assignments for an existing expense (dedicated endpoint so group mutations are explicit and auditable).
- Create `GET /api/v1/groups/:id/summary` endpoint — total spend, expense count, budget remaining, member contribution breakdown.
- Repository methods in `expense-group-repository.ts`:
  - `replaceExpenseGroupAssignments(db, expenseId, groupIds[])` — transactional delete+insert for the junction table.
  - `getGroupSummary(db, groupId)` — aggregated metrics and member breakdown.
  - `listExpensesByGroup(db, groupId, options)` — paginated expenses belonging to a group.
- New contracts/schemas: `ReplaceExpenseGroupsRequest`, `GroupSummaryDTO`, validation schemas.
- Unit tests for new schemas.
- Integration tests for both new endpoints (happy path, auth, validation, not-found, conflict).

**Frontend:**
- Update `ExpenseDTO`, `CreateExpenseRequest`, `UpdateExpenseRequest` to include `groupIds?: string[]`.
- Add `replaceExpenseGroups` and `getGroupSummary` API functions in `api/group.ts` (or `api/expense.ts` where semantically appropriate).
- Add React Query hooks: `useReplaceExpenseGroupsMutation`, `useGroupSummaryQuery`, `useGroupExpenseListQuery`.
- Add a group multi-select field to the expense form (`expense-form-fields.tsx`) using the existing group list hook.
- Create `GroupDetailPage` view component and Next.js route at `/groups/[id]`.
- Create `GroupSummaryCard` component showing aggregates and member breakdown.
- Wire group cards in `GroupList` to navigate to `/groups/[id]`.
- i18n keys for all new UI copy (`vi.json`).
- Component and hook tests.

### Out of Scope

- Group analytics charts/trends (feat-028/029).
- Real-time updates or WebSockets for group summaries.
- Bulk expense creation with group assignment.
- Group-level budget editing (already in feat-022).
- Notification/alerts when group budget is exceeded.
- Advanced filtering/sorting inside the group expense list beyond chronological order.
- Bulk-assign modal for tagging multiple existing expenses to a group (de-scoped; can be added later as a dedicated UX enhancement).
- Permanent delete of group-item assignments (assignments are junction rows; removing the expense or archiving the group cascades via FK).
- Offline queueing for group assignment mutations.

### Files and Modules Expected to Change

**Backend:**
- `apps/worker/src/contracts/expense-schemas.ts` — add `groupIds` to create/update schemas.
- `apps/worker/src/contracts/expense-types.ts` — add `groupIds` to `ExpenseDTO` and request types.
- `apps/worker/src/contracts/expense-group-schemas.ts` — add `replaceExpenseGroupsRequestSchema`.
- `apps/worker/src/contracts/expense-group-types.ts` — add `GroupSummaryDTO`.
- `apps/worker/src/db/repositories/expense-group-repository.ts` — add assignment and summary methods.
- `apps/worker/src/handlers/expenses/create-expense.ts` — write group assignments when `groupIds` present.
- `apps/worker/src/handlers/expenses/update-expense.ts` — optionally wire group assignment updates (documented as deferred to dedicated endpoint).
- `apps/worker/src/handlers/expense-groups/replace-expense-groups.ts` — new handler.
- `apps/worker/src/handlers/expense-groups/get-group-summary.ts` — new handler.
- `apps/worker/src/routes/expenses.ts` — register `PATCH /expenses/:id/groups`.
- `apps/worker/src/routes/groups.ts` — register `GET /groups/:id/summary`.
- `apps/worker/src/lib/i18n/messages.vi.ts` — new error messages.
- `apps/worker/test/unit/dto-expense.spec.ts` — schema tests for `groupIds`.
- `apps/worker/test/unit/dto-expense-group.spec.ts` — schema tests for replace/summary.
- `apps/worker/test/integration/groups-crud.spec.ts` — extend with summary and assignment tests.

**Frontend:**
- `apps/web/src/types/expense.ts` — add `groupIds`.
- `apps/web/src/types/group.ts` — add `GroupSummaryDTO`, `MemberContributionDTO`.
- `apps/web/src/api/endpoints.ts` — add new endpoint paths.
- `apps/web/src/api/group.ts` — add `replaceExpenseGroups`, `getGroupSummary`.
- `apps/web/src/hooks/api/use-groups.ts` — add new query/mutation hooks.
- `apps/web/src/components/expense/expense-form-fields.tsx` — add group multi-select.
- `apps/web/src/components/group/group-card.tsx` — add navigation to detail.
- `apps/web/src/components/group/group-summary-card.tsx` — new component.
- `apps/web/src/components/group/bulk-assign-expenses-modal.tsx` — new component.
- `apps/web/src/components/group/index.ts` — export new components.
- `apps/web/src/views/app/group-detail-page.tsx` — new view.
- `apps/web/src/app/(protected)/groups/[id]/page.tsx` — new route.
- `apps/web/src/lib/i18n/locales/vi.json` — new keys.
- `apps/web/src/components/group/group-summary-card.test.tsx` — new test.
- `apps/web/src/components/group/bulk-assign-expenses-modal.test.tsx` — new test.

## Scope Map & Layer Impact

Using `Types -> Config -> Repo -> Service -> Runtime -> UI`:

1. **Types** — New DTOs/Request/Response types in shared contracts (`ExpenseDTO.groupIds`, `GroupSummaryDTO`, `ReplaceExpenseGroupsRequest`).
2. **Config** — No new environment variables or runtime config.
3. **Repo** — New D1 queries in `expense-group-repository.ts` for junction-table writes and aggregated reads.
4. **Service** — New handlers for group assignment replacement and summary aggregation.
5. **Runtime** — Route registration in `groups.ts` and `expenses.ts`; auth middleware already covers these paths.
6. **UI** — New page, components, hooks, and form field updates in `apps/web`.

### Hard Dependency Checks

- Lower layers do not depend on higher layers: repository stays pure SQL/mapping; handlers orchestrate; UI consumes hooks only.
- UI does not bypass runtime/service contracts: all data flows through typed API hooks and `client.ts`.
- Data access enters through repository: all D1 access for group items goes through `expense-group-repository.ts`.
- No new dependencies expected. If a UI multi-select primitive is needed beyond existing shadcn components, justify in the decision log.

## Standards Enforcement

### Required References (Fullstack Scope)

| Reference | Applied Constraint |
|-----------|-------------------|
| `docs/references/backend/architecture-and-boundaries.md` | Routes contain no SQL; handlers own business orchestration; new handlers live in `src/handlers/expense-groups/`. |
| `docs/references/backend/api-contract-and-validation.md` | Base path `/api/v1`; camelCase fields; explicit validation for params, query, body; correct 4xx status codes. |
| `docs/references/backend/error-handling-pattern.md` | 400 for bad input, 401 unauthenticated, 403 forbidden, 404 not found, 409 conflict. No silent swallowing. |
| `docs/references/backend/security-and-auth-pattern.md` | Enforce household membership and expense ownership for all write paths. |
| `docs/references/backend/testing-pattern.md` | Happy path, validation failure, unauthorized, not-found, conflict coverage for new endpoints. |
| `docs/references/backend/database-pattern.md` | No `SELECT *`; bind all params; snake_case DB columns mapped to camelCase DTOs; document indexes if heavy queries added. |
| `docs/references/frontend/project-folder-structure.md` | Feature components in `components/group/`, API in `api/group.ts`, hooks in `hooks/api/use-groups.ts`, views in `views/app/`. |
| `docs/references/frontend/component-structure-pattern.md` | Page exports as `export const`; child components use `export const`; `index.ts` barrel exports public components only; split files over 200 lines. |
| `docs/references/frontend/naming-and-conventions-pattern.md` | Kebab-case files; `use-*` hooks; `*_KEYS` query keys; absolute `@/` imports; merged imports from same path; English comments only. |
| `docs/references/frontend/api-react-query-pattern.md` | Endpoints in `API_ENDPOINTS`; `*_KEYS` for cache keys; mutations invalidate correct scopes; UI calls hooks only, never `api/*` directly. |
| `docs/references/frontend/form-pattern.md` | If group multi-select is added to expense form, use `Controller`, `zodResolver`, `aria-invalid`, `FieldError`, complete `defaultValues`. |
| `docs/references/frontend/dialog-and-form-pattern.md` | Bulk-assign modal uses ref pattern (`useImperativeHandle`); `DialogClose asChild` for Cancel; `FieldGroup > Field > FieldLabel`. |
| `docs/references/frontend/i18n-label-pattern.md` | All new labels added to `vi.json` (and `en.json` if present); nested semantic keys; interpolation for dynamic values; no hardcoded strings. |
| `docs/references/shared/type-naming-pattern.md` | DTO suffix for data objects; `Request` suffix for API input; `Response` suffix for API output; common wrapper `ApiResponse<T>`. |

## Implementation Notes

### Scope-Specific Patterns Mandatory

- **Junction table writes must be transactional.** `replaceExpenseGroupAssignments` must delete existing rows for the expense+household, then insert new ones, inside a D1 batch/transaction where possible.
- **Group summary computes on-demand.** Use SQL aggregation (`SUM`, `COUNT`, `GROUP BY payer_user_id`) rather than materialized columns. The `expense_group_items` join is small-to-medium for MVP households.
- **Expense form group field is optional.** `groupIds` is optional in create/update; omitting it leaves existing assignments untouched on the general expense update endpoint.
- **Dedicated group assignment endpoint.** `PATCH /expenses/:id/groups` is the canonical way to change group assignments for an expense. This keeps the general `PATCH /expenses/:id` focused on expense metadata.

### Skill Recommendations for Implementation Phase

- `tdd-workflow` — write integration tests for `GET /groups/:id/summary` and `PATCH /expenses/:id/groups` before handlers.
- `security-review` — review ownership checks on group assignment writes (user must own the expense or be admin; groups must belong to the same household).
- `documentation-lookup` — if D1 batch transaction syntax is unclear for the junction replace.
- `verification-loop` — iterative verification after backend, then after frontend, then full `./init.sh`.

### Common Pitfalls to Avoid

- **Do not** allow assigning an expense to a group in a different household. Validate `group.household_id == expense.household_id`.
- **Do not** return 404 when a group has no expenses; return the summary with zeros.
- **Do not** leak private expenses into group summaries unless the requesting user is the owner or an admin of the household.
- **Do not** use `SELECT *` in the summary query; name columns explicitly.
- **Do not** forget to invalidate both `expense` and `group` query keys after a successful group assignment mutation.

## Plan of Work (Narrative)

### Step 1 — Backend Contracts & Repository

1. **Update expense schemas** (`apps/worker/src/contracts/expense-schemas.ts`):
   - Add `groupIds: z.array(z.string().trim().min(1)).optional()` to both `createExpenseRequestSchema` and `updateExpenseRequestSchema`.
2. **Update expense types** (`apps/worker/src/contracts/expense-types.ts`):
   - Add `groupIds?: string[]` to `ExpenseDTO`.
3. **Add group assignment schema** (`apps/worker/src/contracts/expense-group-schemas.ts`):
   - Add `replaceExpenseGroupsRequestSchema` with `groupIds: z.array(z.string().trim().min(1))`.
4. **Add summary types** (`apps/worker/src/contracts/expense-group-types.ts`):
   - Add `GroupSummaryDTO` and `MemberContributionDTO`.
5. **Update repository** (`apps/worker/src/db/repositories/expense-group-repository.ts`):
   - Add `replaceExpenseGroupAssignments(db, expenseId, groupIds[])` — delete existing items for this expense, then insert new rows. Include `household_id` in the junction rows (look up from expense or validate caller provides it).
   - Add `getGroupSummary(db, groupId)` — return `totalSpendMinor`, `expenseCount`, `budgetRemainingMinor`, and `memberContributions[]` (each with `userId`, `displayName` from joined `users`, `totalSpendMinor`, `expenseCount`).
   - Add `listExpensesByGroup(db, groupId, { cursor?, limit? })` — paginated list of non-deleted expenses in the group, ordered by `occurred_at DESC`.

### Step 2 — Backend Handlers & Routes

6. **Update create-expense handler** (`apps/worker/src/handlers/expenses/create-expense.ts`):
   - After inserting the expense, if `groupIds` is non-empty, call `replaceExpenseGroupAssignments`.
7. **Create replace-expense-groups handler** (`apps/worker/src/handlers/expense-groups/replace-expense-groups.ts`):
   - Validate expense exists and caller has permission (owner or admin).
   - Validate all `groupIds` belong to the same household as the expense.
   - Call `replaceExpenseGroupAssignments`.
   - Return updated `ExpenseDTO` (including `groupIds`).
8. **Create get-group-summary handler** (`apps/worker/src/handlers/expense-groups/get-group-summary.ts`):
   - Resolve group by ID; return 404 if not found or archived.
   - Enforce household membership (404 for non-member, 403 for non-admin if privacy rules apply — default to member can view).
   - Call `getGroupSummary` and return `GroupSummaryDTO`.
9. **Register routes**:
   - `apps/worker/src/routes/expenses.ts` — add `PATCH /expenses/:id/groups`.
   - `apps/worker/src/routes/groups.ts` — add `GET /groups/:id/summary`.
10. **Add error messages** to `apps/worker/src/lib/i18n/messages.vi.ts` for new failure states.

### Step 3 — Backend Tests

11. **Unit tests** (`apps/worker/test/unit/dto-expense.spec.ts`):
   - Assert `groupIds` validation accepts array of IDs and rejects empty strings.
12. **Unit tests** (`apps/worker/test/unit/dto-expense-group.spec.ts`):
   - Assert `replaceExpenseGroupsRequestSchema` validates correctly.
13. **Integration tests** (`apps/worker/test/integration/groups-crud.spec.ts`):
   - `PATCH /expenses/:id/groups` — happy path replace, 401 unauthenticated, 404 expense not found, 403 forbidden (other user's private expense), 400 invalid groupIds, 409 group belongs to different household.
   - `GET /groups/:id/summary` — happy path with computed totals and member breakdown, 401 unauthenticated, 404 group not found, 403 non-member.

### Step 4 — Frontend Types & API

14. **Update types** (`apps/web/src/types/expense.ts`):
   - Add `groupIds?: string[]` to `ExpenseDTO`, `CreateExpenseRequest`, `UpdateExpenseRequest`.
15. **Update types** (`apps/web/src/types/group.ts`):
   - Add `GroupSummaryDTO`, `MemberContributionDTO`.
16. **Update endpoints** (`apps/web/src/api/endpoints.ts`):
   - Add `groups.summary`, `expenses.replaceGroups`.
17. **Update API** (`apps/web/src/api/group.ts`):
   - Add `getGroupSummary(groupId)` and `replaceExpenseGroups(expenseId, groupIds)`.

### Step 5 — Frontend Hooks

18. **Update hooks** (`apps/web/src/hooks/api/use-groups.ts`):
   - Add `GROUP_KEYS.detailSummary(id)`.
   - Add `useGroupSummaryQuery(groupId)`.
   - Add `useReplaceExpenseGroupsMutation()` with invalidation of `EXPENSE_KEYS.all` and `GROUP_KEYS.all`.
   - Add `useGroupExpenseListQuery(groupId)` (infinite query wrapper over existing expense list with `group_id` filter, or a dedicated hook if API supports it).

### Step 6 — Frontend Components & Views

19. **Update expense form** (`apps/web/src/components/expense/expense-form-fields.tsx`):
   - Add a multi-select field for groups using existing `useExpenseGroupListQuery` hook.
   - Field is optional; default to empty array.
20. **Create GroupSummaryCard** (`apps/web/src/components/group/group-summary-card.tsx`):
   - Display total spend, expense count, budget remaining (with progress bar if budget set), and a list/table of member contributions.
21. **Create GroupDetailPage** (`apps/web/src/views/app/group-detail-page.tsx`):
    - Load group detail and summary via hooks.
    - Render `GroupSummaryCard`.
    - Render filtered expense list for the group (reuse expense list components if possible).
22. **Update GroupCard** (`apps/web/src/components/group/group-card.tsx`):
   - Wrap card in a link/button that navigates to `/groups/${group.id}`.
24. **Create route** (`apps/web/src/app/(protected)/groups/[id]/page.tsx`):
   - Render `GroupDetailPage`.

### Step 7 — Frontend i18n & Tests

25. **Add i18n keys** (`apps/web/src/lib/i18n/locales/vi.json`):
    - Keys for summary labels, member contributions, form field label, empty states.
26. **Add component tests**:
    - `group-summary-card.test.tsx` — renders aggregates and member list.
    - Update `expense-form-fields.test.tsx` if it exists, or add assertions in `expense-form.test.tsx` for group field.

### Step 8 — Verification & Harness

27. Run `./init.sh` from repo root.
28. Capture evidence: test counts, build success, and any integration test transcripts.
29. Update harness artifacts.

## Concrete Steps (Commands)

Run from repository root (`/Users/tungdoan/Projects/Web/household-finance-system`):

```bash
# Baseline verification
./init.sh
```

Expected: install passes, lint passes, type-check passes, tests pass, web build succeeds.

```bash
# Run worker tests after backend implementation
pnpm --filter @app/worker test
```

Expected: all existing tests pass + new integration tests for group summary and assignment pass.

```bash
# Run web tests after frontend implementation
pnpm --filter @app/web test
```

Expected: all existing tests pass + new component/hook tests pass.

```bash
# Build web for production check
pnpm --filter @app/web build
```

Expected: Next.js build completes without errors.

## Validation and Acceptance

### Happy Path

1. **Create expense with groups:**
   - `POST /api/v1/expenses` with `groupIds: ["group-id-1", "group-id-2"]` returns 201 and the expense includes `groupIds`.
   - D1 `expense_group_items` contains two rows for the new expense.

2. **Replace group assignments:**
   - `PATCH /api/v1/expenses/:id/groups` with `groupIds: ["group-id-3"]` returns 200.
   - Querying the expense shows only `group-id-3`.

3. **Group summary:**
   - `GET /api/v1/groups/:id/summary` returns `totalSpendMinor`, `expenseCount`, `budgetRemainingMinor`, and `memberContributions` with correct aggregated values.

4. **Group detail page:**
   - Navigating to `/groups/:id` renders summary card and expense list.
   - Bulk-assign modal opens, lists expenses, and successfully assigns selected ones.

### Validation / Error Paths

- `PATCH /api/v1/expenses/:id/groups` with non-existent `groupIds` -> 400 or 404 (decide and document).
- `PATCH /api/v1/expenses/:id/groups` with group from different household -> 409 conflict.
- `GET /api/v1/groups/:id/summary` for archived group -> 404.
- `PATCH /api/v1/expenses/:id/groups` on another user's private expense -> 403.

### Unauthorized / Forbidden

- Both new endpoints return 401 when `Authorization` header is missing/invalid.
- `GET /api/v1/groups/:id/summary` returns 404/403 for non-members (follow existing household auth pattern).

### Regression Checks

- Existing expense CRUD (`feat-017`, `feat-019`) continues to work when `groupIds` is omitted.
- Existing group CRUD (`feat-022`) continues to work; group list still computes `totalSpendMinor` correctly.
- `./init.sh` passes cleanly with no new lint/type errors.

## Idempotence & Recovery

- Re-running `./init.sh` is safe and idempotent.
- The `replaceExpenseGroupAssignments` repository method is naturally idempotent (delete then insert).
- No destructive DB migrations required; `expense_group_items` already exists.
- If integration tests fail mid-implementation, re-run `pnpm --filter @app/worker test` after fixes.

## Harness Integration

### Required Updates

1. **`harness/features/feat-023.json`**
   - Set `status` to `in_progress` when implementation starts, `done` when complete.
   - Set `evidence` to the passing test file paths and `./init.sh` success.
   - Update `updated_at`.

2. **`harness/feature_index.json`**
   - Update `feat-023` status to `in_progress` / `done`.

3. **`harness/progress.md`**
   - Add session log entries for each implementation step with files changed, blockers, and next steps.

## Progress

- [x] (2026-05-03) Step 1 — Backend contracts & repository methods
- [x] (2026-05-03) Step 2 — Backend handlers & route registration
- [x] (2026-05-03) Step 3 — Backend unit + integration tests
- [x] (2026-05-03) Step 4 — Frontend types & API layer
- [x] (2026-05-03) Step 5 — Frontend React Query hooks
- [x] (2026-05-03) Step 6 — Frontend components & views
- [x] (2026-05-03) Step 7 — Frontend i18n & tests
- [x] (2026-05-03) Step 8 — Full verification & harness updates

## Surprises & Discoveries

- *Discovery:* The `feat-023` harness description states "expense create/edit payloads already accept group_ids[] (feat-017/019)", but the current codebase does **not** include `groupIds` in expense schemas, types, or handlers. The `expense_group_items` junction table exists in the schema but is never populated. This plan includes adding `groupIds` to expense create/update as a prerequisite.
- *Note:* D1 supports batched statements; the junction replace can use `db.batch([...])` for atomicity.

## Decision Log

- **Decision:** Add `groupIds` to general expense create/update schemas and handlers.
  - **Rationale:** The feature description assumes this exists but it does not. Adding it now makes the assignment flow complete and lets users assign groups at creation time, which is the primary UX path.
  - **Date/Author:** 2026-05-03 / Orchestrator

- **Decision:** Use a dedicated `PATCH /expenses/:id/groups` endpoint for bulk group assignment replacement instead of only supporting group changes through the general expense PATCH.
  - **Rationale:** Keeps the general expense update focused on metadata; group membership is a separate concern and may need different authorization or audit logging later.
  - **Date/Author:** 2026-05-03 / Orchestrator

- **Decision:** Compute group summary aggregates on-demand via SQL rather than materialized columns or triggers.
  - **Rationale:** The junction table is small-to-medium for MVP households; on-demand computation is simpler, avoids sync bugs, and D1 does not support triggers.
  - **Date/Author:** 2026-05-03 / Orchestrator

- **Decision:** Group detail page expense list reuses existing expense list query with a `group_id` filter parameter rather than a dedicated endpoint.
  - **Rationale:** The existing `GET /api/v1/expenses` already supports filtering by `household_id`, `category_key`, etc. Adding `group_id` as an optional filter keeps the surface area small.
  - **Date/Author:** 2026-05-03 / Orchestrator

## Risks and Blockers

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| D1 batch/transaction syntax for atomic delete+insert is unfamiliar | Medium | Medium | Spike a small test query in a local script before wiring into the repository. |
| Group multi-select in expense form makes the form too tall on mobile | Medium | Low | Use a compact combobox/multi-select primitive; cap visible items with scroll. |
| Member contribution breakdown requires a join to `users` table that may not have `display_name` indexed | Low | Low | The query is scoped to a single group; expected row count is small. |
| Adding `groupIds` to existing expense DTO may break frontend assumptions if any code iterates fields blindly | Low | Medium | Add the field as optional; run full web test suite to catch issues. |

## Outcomes & Retrospective

*(To be filled when implementation is complete.)*

## Context and Orientation

- **Worker app source:** `apps/worker/src/`
- **Worker tests:** `apps/worker/test/`
- **Web app source:** `apps/web/src/`
- **Web tests:** `apps/web/src/**/*.test.tsx`
- **Group feature backend:** `apps/worker/src/handlers/expense-groups/`, `apps/worker/src/routes/groups.ts`, `apps/worker/src/db/repositories/expense-group-repository.ts`
- **Group feature frontend:** `apps/web/src/components/group/`, `apps/web/src/views/app/groups-page.tsx`, `apps/web/src/hooks/api/use-groups.ts`
- **Expense feature backend:** `apps/worker/src/handlers/expenses/`, `apps/worker/src/routes/expenses.ts`
- **Expense feature frontend:** `apps/web/src/components/expense/`, `apps/web/src/hooks/api/use-expense.ts`
- **Plan governance:** `docs/PLANS.md`, `AGENTS.md`
- **Verification script:** `./init.sh` at repo root

## Interfaces & Dependencies

### Internal Modules

- `expense-group-repository.ts` — new methods depend on `expenses` and `expense_groups` tables.
- `expense-repository.ts` — create/update handlers may need to read expense household_id for validation.
- `household-membership.ts` middleware — reused for household-scoped auth on new endpoints.
- `authMiddleware` — already applied to `/groups/*` and `/expenses/*`.

### External Services

- None new. Cloudflare D1 is the only data store.

### Type Contracts

```ts
// ReplaceExpenseGroupsRequest (worker + web)
type ReplaceExpenseGroupsRequest = {
  groupIds: string[]
}

// GroupSummaryDTO (worker + web)
type MemberContributionDTO = {
  userId: string
  displayName: string
  totalSpendMinor: number
  expenseCount: number
}

type GroupSummaryDTO = {
  group: ExpenseGroupDTO
  totalSpendMinor: number
  expenseCount: number
  budgetRemainingMinor: number | null
  memberContributions: MemberContributionDTO[]
}
```

## Artifacts and Notes

*(Evidence snippets and transcripts will be appended during implementation.)*
