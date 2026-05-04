# Progress Log

## 2026-05-04 — Backend API scenario testing coverage
- Who: Orchestrator
- Summary: Added three backend-only scenario integration tests to validate real worker HTTP flows end to end: auth/profile, household expense lifecycle, and group expense assignment/summary. Also introduced shared worker test helpers for authenticated JSON requests plus reusable household/expense setup, then refactored the existing expense lifecycle suite to consume the new helper return shapes. Verified the full worker suite passes (`pnpm --filter worker test`, 242 tests).
- Files changed: apps/worker/test/helpers/test-context.ts, apps/worker/test/integration/scenario-auth-profile.spec.ts, apps/worker/test/integration/scenario-household-expense.spec.ts, apps/worker/test/integration/scenario-group-expense.spec.ts, apps/worker/test/integration/expenses-lifecycle.spec.ts, harness/progress.md
- Blockers: none
- Next steps: none.

## 2026-05-03 — Second round code review fixes for feat-023
- Who: Orchestrator
- Summary: Fixed three issues from follow-up review: (1) CRITICAL — moved groupIds validation before `createExpense` call so validation failures no longer leave orphaned expense rows; (2) MAJOR — reject `groupIds` with explicit 409 when visibility is `private` instead of silently ignoring them; (3) MAJOR — preserve existing `note` on partial update by using `body.note !== undefined ? body.note : existingExpense.note` instead of `body.note ?? null`.
- Files changed: apps/worker/src/handlers/expenses/create-expense.ts, apps/worker/src/handlers/expenses/update-expense.ts
- Blockers: none
- Next steps: commit review fixes

## 2026-05-03 — Code review fixes for feat-023
- Who: Orchestrator
- Summary: Addressed all issues from code review: (1) removed group picker from edit mode since general PATCH does not persist groupIds — create mode only; (2) added `assignedByUserId` parameter to `replaceExpenseGroupAssignments` and passed `currentUser.id` from all callers (create-expense, replace-expense-groups); (3) added group validation to create-expense handler (checks group exists and belongs to same household); (4) fixed group-detail-page to use `group.householdId` instead of store state and included it in query key; (5) formally de-scoped `BulkAssignExpensesModal` from feat-023 and updated plan; (6) added 5 integration tests for new endpoints (`groups-assignment.spec.ts`: replace happy path, 401, 409 cross-household, summary happy path, summary 404); (7) restored Vietnamese copy from HEAD~1 and re-added new keys with proper spacing; (8) fixed `replaceExpenseGroups` return type from `ExpenseGroupDTO` to `ExpenseDTO` across API and hooks; (9) removed unused `ExpenseGroupDTO` imports. All verification passes.
- Files changed: apps/worker/src/db/repositories/expense-group-repository.ts, apps/worker/src/handlers/expenses/create-expense.ts, apps/worker/src/handlers/expense-groups/replace-expense-groups.ts, apps/web/src/components/expense/expense-form.tsx, apps/web/src/components/expense/use-expense-form.ts, apps/web/src/views/app/group-detail-page.tsx, apps/web/src/hooks/api/use-groups.ts, apps/web/src/api/group.ts, apps/web/src/api/expense.ts, apps/web/src/hooks/api/use-expense.ts, apps/web/src/lib/i18n/locales/vi.json, apps/worker/test/integration/groups-assignment.spec.ts, docs/exec-plans/plans/2026-05-03-feat-023-expense-to-group-assignment-and-summaries.md
- Blockers: none
- Next steps: commit review fixes

## 2026-05-03 — Completed feat-023: Expense-to-group assignment & summaries
- Who: Orchestrator
- Summary: Implemented full-stack expense-to-group assignment and group summary views. Backend: added `groupIds` to expense create/update request schemas and DTO types; updated `create-expense` handler to write `expense_group_items` junction rows; created `PATCH /api/v1/expenses/:id/groups` handler for bulk replace group assignments with household validation; created `GET /api/v1/groups/:id/summary` handler returning total spend, expense count, budget remaining, and per-member contribution breakdown; added `replaceExpenseGroupAssignments`, `getGroupSummary`, `listExpensesByGroup`, `findGroupIdsForExpense`, `findGroupIdsForExpenses` repository methods; updated existing expense handlers (`get-expense`, `update-expense`, `restore-expense`, `list-expenses`, `list-deleted-expenses`) to include `groupIds` in DTOs; added `group_id` filter to expense list query; registered new routes; added i18n error messages. Frontend: updated `ExpenseDTO`/`CreateExpenseRequest`/`UpdateExpenseRequest` types with `groupIds`; added `GroupSummaryDTO`, `MemberContributionDTO`, `ReplaceExpenseGroupsRequest` types; added API functions and React Query hooks (`useGroupSummaryQuery`, `useReplaceExpenseGroupsMutation`, `useGroupExpenseListQuery`); created `GroupPicker` multi-select component and wired it into `expense-form-fields.tsx`; updated `group-card.tsx` with navigation to `/groups/[id]`; created `GroupSummaryCard`, `GroupExpenseFeedList`, `GroupDetailPage` view, and `/groups/[id]/page.tsx` route; added i18n keys for group picker, summary, and detail sections. Fixed type errors and test failures (duplicate API exports, missing `useRouter` mocks, missing `groupIds` in test data, missing i18n key, `ComboboxChip` prop fix). All verification passes.
- Files changed: ~25 files across worker and web (contracts, repositories, handlers, routes, types, API, hooks, components, views, pages, i18n, tests)
- Blockers: none
- Next steps: feat-021 (Expense search, filters & pagination) or feat-026 (Budget setup & editing)

## 2026-05-03 — Created active ExecPlan for feat-023 expense-to-group assignment & summaries
- Who: Orchestrator
- Summary: Created and registered the active ExecPlan for `feat-023` covering fullstack expense-to-group assignment and group summaries. Backend scope: add `groupIds` to expense create/update schemas and handlers (prerequisite discovery: not currently wired), `PATCH /api/v1/expenses/:id/groups` for bulk replace group assignments, `GET /api/v1/groups/:id/summary` for aggregated metrics with member contribution breakdown, repository methods for junction-table management, unit/integration tests. Frontend scope: group multi-select in expense form, Group Detail page at `/groups/[id]` with summary card and filtered expense list, bulk-assign modal for retroactive tagging, React Query hooks, API functions, i18n keys, component/hook tests. Explicitly out of scope: group analytics charts (feat-028/029), offline queueing, bulk expense creation, budget-exceeded notifications.
- Files changed: docs/exec-plans/plans/2026-05-03-feat-023-expense-to-group-assignment-and-summaries.md, docs/exec-plans/index.md, harness/features/feat-023.json, harness/feature_index.json, harness/progress.md
- Blockers: none
- Next steps: execute Step 1 (backend contracts, repository methods), then Step 2 (handlers, routes), then Step 3 (tests), then frontend Steps 4-7, then run `./init.sh` and capture evidence before marking `feat-023` done.

## 2026-05-03 — Post-implementation code review fixes for feat-022
- Who: Orchestrator
- Summary: Addressed all issues from code review: (1) listExpenseGroupsByHousehold now computes totalSpendMinor via LEFT JOIN with expense_group_items/expenses instead of hardcoding 0; (2) updateExpenseGroupRequestSchema rejects empty PATCH bodies; (3) group-card status labels use i18n keys instead of hardcoded Vietnamese; (4) group-list error state shows error message instead of loading text; (5) group-form allows clearing optional fields in edit mode; (6) groups-page hides create button when no household selected; (7) added 2 integration tests: non-zero totalSpendMinor from linked expenses, and 401 unauthenticated coverage across all 5 endpoints. All verification passed.
- Files changed: apps/worker/src/db/repositories/expense-group-repository.ts, apps/worker/src/handlers/expense-groups/list-expense-groups.ts, apps/worker/src/contracts/expense-group-schemas.ts, apps/worker/test/integration/groups-crud.spec.ts, apps/web/src/components/group/group-card.tsx, apps/web/src/components/group/group-form.tsx, apps/web/src/components/group/group-list.tsx, apps/web/src/views/app/groups-page.tsx, apps/web/src/lib/i18n/locales/vi.json, harness/features/feat-022.json, harness/progress.md
- Blockers: none
- Next steps: create PR to main

## 2026-05-03 — Created active ExecPlan for feat-022 expense group management
- Who: Orchestrator
- Summary: Created and registered the active ExecPlan for `feat-022` covering fullstack expense group management. Backend scope: group CRUD + archive API (`POST /api/v1/groups`, `GET /api/v1/groups`, `PATCH /api/v1/groups/:id`, `POST /api/v1/groups/:id/archive`) with household membership enforcement, repository queries with computed total spend, schema/unit tests, and integration tests. Frontend scope: Groups list page with group cards and budget progress bar, Create/Edit Group dialog forms, React Query hooks, i18n keys, navigation updates, and component/hook tests. Key constraint: the `expense_groups` table already exists in `0001_init.sql`, so no new migration is required. Explicitly out of scope: expense-to-group assignment (feat-023), group-level analytics, permanent delete, and household settings for member edit permissions.
- Files changed: docs/exec-plans/plans/2026-05-03-feat-022-expense-group-management.md, docs/exec-plans/index.md, harness/features/feat-022.json, harness/feature_index.json, harness/progress.md
- Blockers: none
- Next steps: execute Step 1 (backend contracts, repository, handlers, routes, tests), then Step 2 (frontend API, hooks, components, views, tests), run `./init.sh`, and capture evidence before marking `feat-022` done.

## 2026-05-03 — Completed feat-019: Expense update, delete & restore lifecycle
- Who: Orchestrator
- Summary: Implemented full-stack expense lifecycle management for feat-019. Backend: PATCH /api/v1/expenses/:id (mutable field updates with household/private transition support, immutable audit logging with change sets), DELETE /api/v1/expenses/:id (soft-delete with audit trail), POST /api/v1/expenses/:id/restore (admin-only restore with audit trail), GET /api/v1/expenses/deleted (admin-only trash list). All destructive handlers include compensating rollback on audit write failure to maintain consistency. Permission rules: member edits/deletes own expenses; admin can edit/delete any household expense; admin-only restore. Frontend: Replaced oversized create-only form with an edit-capable ExpenseForm supporting create/edit modes, payer selection from household members, and proper amount conversion. Added Edit Expense page, Expense Detail lifecycle actions (edit/delete), and Admin Trash page with restore. Added web tests for form edit mode, detail actions, and trash view. Worker: 217 tests (29 files), 8 lifecycle integration tests covering happy path, authorization, visibility transitions, and audit rollback scenarios. Web: 54 tests (23 files) including 3 new lifecycle tests. `./init.sh` passes cleanly.
- Files changed: 29 files across worker and web (contracts, repositories, handlers, routes, tests, types, API, hooks, components, pages, views, i18n, test setup)
- Blockers: none. Open decisions remain: permanent delete after retention window, retention window policy value, concurrent edit conflict handling, derived aggregate recomputation pipeline.
- Next steps: feat-021 (Expense search, filters & pagination) or feat-027 (expense grouping), or return to address open decisions if product priorities shift.

## 2026-05-03 — Created active ExecPlan for feat-019 expense update/delete/restore lifecycle
- Who: Orchestrator
- Summary: Created and registered the active ExecPlan for `feat-019` covering fullstack expense lifecycle management. The plan scopes worker-side mutable expense updates, soft-delete, admin restore, immutable audit-log writes, and web edit/delete/restore flows, while explicitly keeping permanent delete out of scope until the harness feature definition changes. The plan also records current constraints: GitNexus is unavailable for this repo in the current environment, the existing expense form is already oversized and should be decomposed before edit-mode expansion, and concurrent edit conflict handling remains an open decision because no versioning primitive was discovered.
- Files changed: docs/exec-plans/plans/2026-05-03-feat-019-expense-update-delete-restore-lifecycle.md, docs/exec-plans/index.md, harness/features/feat-019.json, harness/feature_index.json, harness/progress.md
- Blockers: permanent delete / retention-window product decision remains open but does not block the scoped plan.
- Next steps: execute backend-first implementation for update/delete/restore routes and tests, then add web edit/delete/restore flows, run `./init.sh`, and capture evidence before marking `feat-019` done.

## 2026-05-02 — Completed feat-018: Expense detail & activity feed
- Who: Orchestrator
- Summary: Implemented full-stack expense read flows for feat-018. Backend: GET /api/v1/expenses (cursor-paginated feed with visibility enforcement, basic filters) and GET /api/v1/expenses/:id (403 for unauthorized). Frontend: Expense Feed page (chronological list with load-more), Expense Detail page (full metadata display). DB migration 0004 for personal feed and soft-delete indexes. 15 integration/unit tests (9 list + 6 detail). Review fixes: payerUserId type mismatch, dead code removal, invalid cursor 400, unsafe enum casts, accessibility, error handling.
- Files changed: 24 files across worker and web (migration, contracts, repository, handlers, routes, tests, types, API, hooks, components, pages, i18n)
- Blockers: none
- Next steps: feat-019 (Expense update, delete & restore lifecycle) or feat-021 (Expense search, filters & pagination).

## 2026-05-02 — Marked feat-017 done in harness
- Who: Codex
- Summary: Updated the harness record for `feat-017` from `in_progress` to `done`, refreshed the feature timestamp, and aligned the feature index entry. No code files were changed in this session.
- Files changed: harness/features/feat-017.json, harness/feature_index.json, harness/progress.md
- Blockers: none
- Next steps: none.

## 2026-05-02 — Synced mandatory frontend headings into docs/FRONTEND.md
- Who: Codex
- Summary: Checked whether the frontend guide already contained the mandatory AGENTS headings `Mandatory Component Decomposition Policy (Frontend)` and `Mandatory Pre-Read for UI Work`. The guidance already existed in substance, but not under the required headings, so `docs/FRONTEND.md` was updated with the exact section names and the pre-read non-compliance note while preserving the existing shadcn governance content.
- Files changed: docs/FRONTEND.md, harness/progress.md
- Blockers: none
- Next steps: none.

## 2026-05-02 — Refactored AGENTS.md structure for faster scanning
- Who: Codex
- Summary: Reorganized `AGENTS.md` to reduce repetition and make the operational rules easier to scan. Consolidated the pre-GitNexus content into shorter sections for behavior, product context, startup workflow, session rules, artifacts, verification, references, and frontend requirements while preserving the auto-generated GitNexus block verbatim.
- Files changed: AGENTS.md, harness/progress.md
- Blockers: none
- Next steps: none.

## 2026-04-30 — Created active ExecPlan for feat-017 expense entry create flow
- Who: Prometheus
- Summary: Created and registered the active ExecPlan for `feat-017` covering fullstack expense creation: user-scoped `POST /api/v1/expenses` with visibility rules (private default, household requires explicit `household_id`), global static category/source pickers from feat-016, payer defaulting to current user, currency auto-default (VND for private, household default for shared), conditional household picker appearing only for household-shared expenses, and DB migration 0003 adding `category_key`/`source_key` columns to `expenses` table. Locked decisions: user-scoped route (not household-scoped), category by key (not FK), title auto-populated from category label, group_ids excluded, current-user-only payer (MVP). Marked `feat-017` as `in_progress` in harness state.
- Files changed: docs/exec-plans/plans/2026-04-30-feat-017-expense-entry-create-flow.md, docs/exec-plans/index.md, harness/features/feat-017.json, harness/feature_index.json, harness/progress.md
- Blockers: none
- Next steps: execute `feat-017` implementation from the new ExecPlan and capture verification evidence before marking the feature done.

## 2026-04-29 — Applied review fixes for feat-016 category picker contract alignment
- Who: Codex
- Summary: Addressed post-implementation review findings for `feat-016` by updating `CategoryPicker` to render category icons from `iconUrl` and configuring combobox search labeling with translated category labels via `itemToStringLabel`. Extended component tests to assert icon rendering and translated-label search mapping behavior, while keeping source picker behavior unchanged.
- Files changed: apps/web/src/components/expense/category-picker.tsx, apps/web/src/components/expense/category-picker.test.tsx, harness/progress.md
- Blockers: none
- Next steps: none.

## 2026-04-29 — Implemented and closed feat-016 global static expense reference data
- Who: Codex
- Summary: Implemented `feat-016` end-to-end as a global immutable reference-data foundation. Worker now serves public/cacheable `GET /api/v1/categories` and `GET /api/v1/sources` from a checked-in catalog with semantic keys and category metadata (`key`, `kind`, `iconUrl`, `color`). Added worker contracts, handlers, route registration, cache-header policy, unit schema tests, and integration tests for unauthenticated access, payload contract, and canonical ordering. Web now includes typed reference-data models, endpoint wiring, API functions, React Query hooks, i18n key-based label mapping, reusable expense components (`category-picker`, `source-picker`), and component/API tests. Feature and plan tracking were moved to completed state with evidence updates.
- Files changed: apps/worker/src/contracts/reference-data.ts, apps/worker/src/contracts/index.ts, apps/worker/src/lib/reference-data/catalog.ts, apps/worker/src/handlers/reference-data/list-categories.ts, apps/worker/src/handlers/reference-data/list-sources.ts, apps/worker/src/routes/reference-data.ts, apps/worker/src/index.ts, apps/worker/test/unit/dto-reference-data.spec.ts, apps/worker/test/integration/reference-data.spec.ts, apps/web/src/types/reference-data.ts, apps/web/src/api/endpoints.ts, apps/web/src/api/reference-data.ts, apps/web/src/hooks/api/use-reference-data.ts, apps/web/src/lib/reference-data/labels.ts, apps/web/src/components/expense/category-picker.tsx, apps/web/src/components/expense/source-picker.tsx, apps/web/src/components/expense/index.ts, apps/web/src/api/reference-data.test.ts, apps/web/src/components/expense/category-picker.test.tsx, apps/web/src/components/expense/source-picker.test.tsx, apps/web/src/lib/i18n/locales/vi.json, docs/exec-plans/index.md, docs/exec-plans/plans/2026-04-29-feat-016-global-static-expense-reference-data.md, harness/features/feat-016.json, harness/feature_index.json, harness/progress.md
- Blockers: none
- Next steps: `feat-017` can consume the new hooks/pickers; key-based persistence migration remains deferred tech debt.

## 2026-04-29 — Created active ExecPlan for feat-016 global static expense reference data
- Who: Codex
- Summary: Created and registered the active ExecPlan for `feat-016` to deliver a fullstack reference-data foundation for expense categories and sources. The plan locks the runtime source of truth to a checked-in worker catalog, public/cacheable `GET /api/v1/categories` and `GET /api/v1/sources` endpoints, semantic string keys without numeric ids, key-based i18n labels on web, and reusable `category-picker`/`source-picker` components without `/expenses` or quick-add page integration. The plan also records the deferred schema migration away from legacy household-scoped `expense_categories` as explicit tech debt and marks `feat-016` as `in_progress` in harness state.
- Files changed: docs/exec-plans/plans/2026-04-29-feat-016-global-static-expense-reference-data.md, docs/exec-plans/index.md, docs/exec-plans/tech-debt-tracker.md, harness/features/feat-016.json, harness/feature_index.json, harness/progress.md
- Blockers: none
- Next steps: implement worker catalog/routes/tests first, then web transport/hooks/pickers/tests, and only mark `feat-016` done after full `./init.sh` verification and harness evidence updates.

## 2026-04-29 — Aligned quick-add product spec with post-MVP offline queue scope
- Who: Codex
- Summary: Resolved a contract conflict where `feat-024` and `feat-025` already treated offline queueing as post-MVP, but `docs/product-specs/quick-add-experience.md` still required queued offline behavior and automatic retry in MVP. Updated the quick-add spec to require manual retry only in MVP and explicitly defer offline queueing/pending-entry recovery to `feat-025`. Also aligned the generic expense-tracking failure-state wording so MVP docs no longer imply offline queue support before the resilience follow-up feature exists.
- Files changed: docs/product-specs/quick-add-experience.md, docs/product-specs/expense-tracking.md, harness/progress.md
- Blockers: none
- Next steps: keep future quick-add planning and implementation aligned with `feat-025` as the only source of truth for offline queueing.

## 2026-04-29 — Synchronized docs and harness around the global static category catalog decision
- Who: Codex
- Summary: Updated forward-looking product specs and harness feature records so categories/sources are now consistently documented as immutable global reference data served from checked-in code, not household-scoped records. Locked `feat-016` to API/hooks/picker/test scope only, updated downstream expense/budget/analytics features to reference category keys from the shared catalog, clarified that expense creation defaults to personal/private and requires explicit household selection only when sharing, and added superseded notes to historical feat-007/schema docs where the current DB baseline still models `expense_categories` as household-scoped legacy data.
- Files changed: harness/features/feat-007.json, harness/features/feat-016.json, harness/features/feat-017.json, harness/features/feat-018.json, harness/features/feat-019.json, harness/features/feat-021.json, harness/features/feat-024.json, harness/features/feat-026.json, harness/features/feat-027.json, harness/features/feat-028.json, harness/features/feat-029.json, docs/product-specs/expense-categorization.md, docs/product-specs/expense-tracking.md, docs/product-specs/quick-add-experience.md, docs/product-specs/data-visibility.md, docs/product-specs/budget-management.md, docs/product-specs/expense-querying.md, docs/product-specs/analytics-overview.md, docs/PRODUCT.md, docs/PRODUCT.vi.md, docs/exec-plans/plans/2026-04-22-feat-007-database-schema-local-migrations.md, docs/generated/db-schema.md, harness/progress.md
- Blockers: none
- Next steps: implement the actual catalog/runtime/schema migration work in separate feature-scoped sessions; this pass only aligns docs and harness truth and does not close `feat-016`.

## 2026-04-29 — Guarded member removal against deleting the last household admin
- Who: Codex
- Summary: Fixed review finding on `DELETE /households/:id/members/:userId` by adding a last-admin guard in `handleRemoveHouseholdMember`. The handler now loads target membership, counts active admins, and returns `409 CONFLICT` when removal would delete the final admin. Added integration coverage for this specific path (`blocks admin removal when target is the last active admin`).
- Files changed: apps/worker/src/handlers/households/remove-household-member.ts, apps/worker/src/lib/i18n/messages.vi.ts, apps/worker/test/integration/households-members.spec.ts, harness/progress.md
- Blockers: none
- Next steps: none.

## 2026-04-29 — Refactored oversized worker integration test file into domain-scoped specs
- Who: Codex
- Summary: Split `apps/worker/test/index.spec.ts` (~2800 lines) into smaller domain-focused test files under `apps/worker/test/integration/` and added shared setup/util context under `apps/worker/test/helpers/test-context.ts`. Test coverage remains equivalent (130 tests) while improving maintainability and discoverability by domain (core, households CRUD, member actions, invitations, media/profile, auth/session, data integrity).
- Files changed: apps/worker/test/helpers/test-context.ts, apps/worker/test/integration/core.spec.ts, apps/worker/test/integration/households-crud.spec.ts, apps/worker/test/integration/households-members.spec.ts, apps/worker/test/integration/invitations.spec.ts, apps/worker/test/integration/media-profile.spec.ts, apps/worker/test/integration/auth-session.spec.ts, apps/worker/test/integration/data-integrity.spec.ts, apps/worker/test/index.spec.ts, harness/progress.md
- Blockers: none
- Next steps: none.

## 2026-04-29 — Addressed review findings for feat-013/014/015b closure and added regression coverage
- Who: Codex
- Summary: Resolved all four review findings by aligning feat-014/015b plan/harness artifacts and adding missing regression tests. Added explicit worker integration coverage for member endpoints (`GET /households/:id/members`, `DELETE /households/:id/members/:userId`, `DELETE /households/:id/members/me`) and web UI-affordance coverage for admin/member conditional rendering in household detail/settings/members cards. While implementing tests, uncovered real backend regressions and fixed them: route middleware did not apply to `/households/:id/*`, `/members/me` was shadowed by `/members/:userId`, and member-list query selected non-existent `users.email` column.
- Files changed: apps/worker/src/routes/households.ts, apps/worker/src/db/repositories/household-membership-repository.ts, apps/worker/test/index.spec.ts, apps/web/src/views/app/household-detail-page.test.tsx, apps/web/src/components/household/household-settings-card.test.tsx, apps/web/src/components/household/household-members-card.test.tsx, docs/exec-plans/plans/2026-04-29-feat-014-household-membership-actions-and-015b-ui-affordances.md, harness/features/feat-014.json, harness/features/feat-015b.json, harness/progress.md
- Blockers: none
- Next steps: none.

## 2026-04-29 — Implemented and closed feat-014 + feat-015b household membership actions and role-based UI affordances
- Who: Codex
- Summary: Implemented member management API (list/remove/leave) and role-based UI for household detail page. Backend: fixed createHousehold defaults (Asia/Ho_Chi_Minh, household-share visibility), added GET/DELETE member endpoints, last-admin leave block. Frontend: HouseholdSettingsCard read-only for members, HouseholdMembersCard with trash icon for admin, HouseholdDetailPage conditional rendering (admin sees DangerZone, member does not).
- Files changed: apps/worker/src/db/repositories/household-repository.ts (defaults), apps/worker/src/db/repositories/household-membership-repository.ts (member CRUD), apps/worker/src/handlers/households/get-household-members.ts, leave-household.ts, apps/worker/src/routes/households.ts, apps/worker/src/middlewares/household-membership.ts (validateTargetUserIdParam), apps/worker/src/contracts/household.ts, apps/worker/src/types/app.ts, apps/worker/src/lib/i18n/messages.vi.ts, apps/worker/test/index.spec.ts, apps/web/src/types/household.ts, apps/web/src/api/endpoints.ts, apps/web/src/api/household.ts, apps/web/src/stores/household.store.ts, apps/web/src/components/household/household-settings-card.tsx, apps/web/src/components/household/household-members-card.tsx, apps/web/src/views/app/household-detail-page.tsx, apps/web/src/lib/i18n/locales/vi.json, docs/product-specs/household-management.md, docs/product-specs/role-permission.md, harness/features/feat-014.json, harness/features/feat-015b.json, harness/feature_index.json, docs/exec-plans/index.md, docs/exec-plans/plans/2026-04-29-feat-014-household-membership-actions-and-015b-ui-affordances.md
- Blockers: none
- Next steps: none.

## 2026-04-29 — Fixed protected-route chunk-load resilience for stale service-worker state
- Who: Codex
- Summary: Investigated the reported `ChunkLoadError` on the protected layout and reproduced the protected shell on a clean browser session. The app build and browser network path were healthy, so I hardened the service-worker bootstrap to clear any stale registrations and cached static assets in non-production environments before the protected shell loads. This prevents old cached chunks from poisoning the current App Router bundle during local development.
- Files changed: apps/web/src/app/providers/sw-register.tsx, apps/web/src/app/providers/sw-register.test.tsx, harness/progress.md, harness/features/feat-039.json
- Blockers: none
- Next steps: if the error still appears on an existing browser profile, clear that profile’s service worker once; fresh sessions should no longer hit the stale chunk path.

## 2026-04-29 — Implemented and closed feat-013 household invitations
- Who: Codex
- Summary: Delivered `feat-013` end-to-end across worker and web. Backend now supports invitation creation (`POST /api/v1/households/:id/invitations`, admin-only), public invitation preview (`GET /api/v1/invitations/:token`), and authenticated acceptance (`POST /api/v1/invitations/:token/accept`) with single-use token consumption and role assignment (`member|admin`). Added dedicated invitation persistence via `household_invitations` migration, invitation token hashing, and audit log entries for invitation created/accepted events. Frontend now enables household-detail Invite Members dialog (role + TTL preset + copy-link flow), adds deep-link accept page at `/invitations/[token]`, and updates sign-in flow to honor `returnTo` for invite continuation after authentication.
- Files changed: apps/worker/migrations/0002_household_invitations.sql, apps/worker/src/contracts/invitation.ts, apps/worker/src/contracts/index.ts, apps/worker/src/db/repositories/household-invitation-repository.ts, apps/worker/src/db/repositories/audit-log-repository.ts, apps/worker/src/handlers/invitations/create-household-invitation.ts, apps/worker/src/handlers/invitations/get-invitation-preview.ts, apps/worker/src/handlers/invitations/accept-invitation.ts, apps/worker/src/routes/invitations.ts, apps/worker/src/index.ts, apps/worker/src/lib/i18n/messages.vi.ts, apps/worker/test/unit/dto-invitation.spec.ts, apps/worker/test/index.spec.ts, apps/web/src/api/endpoints.ts, apps/web/src/api/invitation.ts, apps/web/src/types/invitation.ts, apps/web/src/views/app/household-detail-page.tsx, apps/web/src/views/invitations/accept-invitation-page.tsx, apps/web/src/app/invitations/[token]/page.tsx, apps/web/src/views/auth/sign-in-page.tsx, apps/web/src/lib/i18n/locales/vi.json, apps/web/src/lib/i18n/browser-fallback.test.tsx, docs/exec-plans/plans/2026-04-29-feat-013-household-invitations.md, docs/exec-plans/index.md, docs/exec-plans/tech-debt-tracker.md, harness/features/feat-013.json, harness/feature_index.json, harness/progress.md
- Blockers: none
- Next steps: none.

## 2026-04-29 — Created active ExecPlan for feat-013 household invitations
- Who: Codex
- Summary: Created and registered the active ExecPlan for `feat-013` covering fullstack invitation delivery: dedicated invitation persistence model, admin-only invite creation with role (`member|admin`) and TTL presets (`24h/72h/7d`, default `72h`), public token preview validation, authenticated token acceptance, household-detail invite panel, and `/invitations/{token}` accept page with sign-in return-path handling. Locked decision set for status mapping (`404` invalid token, `409` expired/used/already-member), post-accept redirect to household detail, audit logging in-scope, and invite rate-limit deferred as explicit tech debt.
- Files changed: docs/exec-plans/plans/2026-04-29-feat-013-household-invitations.md, docs/exec-plans/index.md, harness/features/feat-013.json, harness/feature_index.json, harness/progress.md
- Blockers: none
- Next steps: execute `feat-013` implementation from the new ExecPlan and capture verification evidence before marking the feature done.

## 2026-04-29 — Removed returnTo functionality and cleaned up Service Worker
- Who: Antigravity
- Summary: Addressed review comments by removing the `returnTo` redirect feature from `ProtectedRoute` to simplify authentication flows. Cleaned up `SwRegister` and `sw.js` by removing forced service worker and cache clearing on every app load, moving to a standard production-only registration pattern for a fresh start. Verified changes with web lint, typecheck, and test suites.
- Files changed: apps/web/src/components/layouts/protected-route.tsx, apps/web/src/app/providers/sw-register.tsx, apps/web/public/sw.js, harness/progress.md
- Blockers: none
- Next steps: none.

## 2026-04-29 — Verified Next.js migration and fixed final styling/hydration issues
- Who: Antigravity
- Summary: Conducted a comprehensive verification of the Next.js migration. Discovered and fixed a critical styling issue caused by a missing `@import 'shadcn/tailwind.css'` in `src/index.css`. Mitigated hydration mismatch warnings by adding `suppressHydrationWarning` to the `body` tag in `src/app/layout.tsx`. Verified core functionality (auth, navigation, data fetching) across Home, Households, and placeholder pages.
- Files changed: apps/web/src/index.css, apps/web/src/app/layout.tsx, harness/progress.md
- Blockers: none
- Next steps: proceed with implementing features for placeholder pages (Expenses, Budgets, etc.).

## 2026-04-29 — Fixed Tailwind utility generation for Next CSS pipeline
- Who: Codex
- Summary: Diagnosed the "plain text" rendering issue as a missing Tailwind v4 PostCSS integration. Added `@tailwindcss/postcss` and `apps/web/postcss.config.mjs`, then verified the emitted CSS bundle now contains utility classes such as `flex`, `grid`, `min-h-dvh`, `bg-background`, and `rounded-lg` instead of only theme/base rules.
- Files changed: apps/web/src/index.css, apps/web/postcss.config.mjs, apps/web/package.json, pnpm-lock.yaml, harness/progress.md
- Blockers: none
- Next steps: restart the web dev server and hard-refresh the browser so it loads the newly generated CSS bundle instead of stale assets.

## 2026-04-29 — Fixed web CSS load issue by narrowing service worker behavior
- Who: Codex
- Summary: Investigated the post-migration styling issue and found the PWA service worker was caching same-origin navigation responses broadly, which can keep stale HTML/CSS pairs alive in the browser after a framework swap. Updated the SW registration to unregister in development and narrowed the production SW to cache only static asset destinations, not document navigations.
- Files changed: apps/web/src/app/providers/sw-register.tsx, apps/web/public/sw.js, harness/progress.md
- Blockers: none
- Next steps: if the browser still shows stale styling, clear the existing service worker once or hard refresh; future navigations will no longer cache HTML responses.

## 2026-04-29 — Completed feat-038 Next.js App Router migration
- Who: Codex
- Summary: Finished the `feat-038` migration: `apps/web` now runs on Next.js App Router with `/` as a public landing page and `/home` as the protected home route. I also completed the direct-import cleanup for runtime-critical i18n modules, verified env migration to `NEXT_PUBLIC_*`, kept Vitest in place with a dedicated config, and confirmed the repo passes lint, typecheck, tests, build, and `./init.sh`.
- Files changed: docs/exec-plans/plans/2026-04-29-feat-038-nextjs-app-router-migration.md, docs/exec-plans/index.md, harness/features/feat-038.json, harness/feature_index.json, harness/progress.md
- Blockers: none
- Next steps: none unless you want follow-up polish on remaining Next image-optimization warnings.

## 2026-04-29 — Started implementing feat-038 Next.js App Router migration
- Who: Codex
- Summary: Executed the first implementation pass for `feat-038`: migrated `apps/web` to Next.js App Router structure (landing at `/`, app shell at `/home`), replaced React Router usage with Next navigation primitives, migrated public env keys to `NEXT_PUBLIC_*`, removed Vite entry/config artifacts, added Next configs (`next.config.ts`, `next-env.d.ts`, app routes/layout/providers), and wired Next-compatible PWA artifacts (`manifest.ts`, `public/sw.js`, app icons, service-worker register hook). Stabilized tests/build by adding dedicated `vitest.config.ts`, switching Vitest JSX transform to automatic runtime, and resolving protected-route suspense/build issues.
- Files changed: apps/web package/config/app/router/view files, AGENTS.md, README.md, pnpm-lock.yaml, harness/progress.md
- Blockers: none
- Next steps: continue `feat-038` by converting remaining barrel-index imports to direct imports where it impacts bundle size, then update feature evidence docs and finalize harness status once migration is fully complete.

## 2026-04-29 — Created active ExecPlan for feat-038 Next.js App Router migration
- Who: Codex
- Summary: Created and registered the active ExecPlan for migrating `apps/web` from React + Vite SPA to Next.js App Router (Node runtime), including route contract changes (`/` landing, `/home` protected home), Next-compatible PWA setup, env migration from `VITE_*` to `NEXT_PUBLIC_*`, direct-import cleanup expectations, and full verification/harness evidence workflow.
- Files changed: docs/exec-plans/plans/2026-04-29-feat-038-nextjs-app-router-migration.md, docs/exec-plans/index.md, harness/feature_index.json, harness/features/feat-038.json, harness/progress.md
- Blockers: none
- Next steps: execute `feat-038` implementation from the new ExecPlan and keep progress/evidence updated after each implementation session.

## 2026-04-28 — Marked feat-012 complete in harness and plan index
- Who: Codex
- Summary: Updated `feat-012` feature metadata to `done`, moved its ExecPlan entry from `Active` to `Completed`, and aligned the plan file with completed status so the repo records now match the verified implementation state.
- Files changed: harness/features/feat-012.json, harness/feature_index.json, docs/exec-plans/index.md, docs/exec-plans/plans/2026-04-28-feat-012-household-settings-delete-safeguards.md, harness/progress.md
- Blockers: none
- Next steps: none unless you want follow-up cleanup or a commit.

## 2026-04-28 — Implemented feat-012 plan, then surfaced enum mismatch during verification
- Who: Codex
- Summary: Implemented `feat-012` according to the active ExecPlan, then verification exposed a contract drift where `defaultVisibility` still had stale `shared` references in part of the worker test surface and list handler typing. That mismatch was then fixed in the follow-up session.
- Files changed: apps/worker/src/handlers/households/list-households.ts, apps/worker/test/unit/dto-household.spec.ts, apps/worker/test/index.spec.ts, harness/progress.md
- Blockers: none
- Next steps: keep `feat-012` moving through harness evidence updates and commit once you are ready.

## 2026-04-28 — Fixed feat-012 defaultVisibility enum mismatch (worker typecheck + tests)
- Who: Codex
- Summary: Fixed worker-side enum drift where some files/tests still used `shared` while the implemented contract uses `household`. Updated household list handler typing and aligned worker DTO/integration tests to `defaultVisibility: 'household'`, removing TS errors and restoring green worker update-settings tests.
- Files changed: apps/worker/src/handlers/households/list-households.ts, apps/worker/test/unit/dto-household.spec.ts, apps/worker/test/index.spec.ts, harness/progress.md
- Blockers: worker tests needed unsandboxed execution because Wrangler writes logs to `~/Library/Preferences/.wrangler/logs`.
- Next steps: continue your feat-012 completion flow (harness evidence/status updates and commit) now that `./init.sh` is green.

## 2026-04-28 — Created active ExecPlan for feat-012 household settings/delete safeguards
- Who: Codex
- Summary: Created and registered the active ExecPlan for `feat-012` in `docs/exec-plans/plans/`, capturing fullstack scope for household settings expansion (`name`, `defaultCurrencyCode`, `timezone`, `defaultVisibility`) and delete safeguards (`409` when other active members remain). Plan locks current implementation direction for `/households/:id` as the settings surface and records current decisions for validation/error semantics.
- Files changed: docs/exec-plans/plans/2026-04-28-feat-012-household-settings-delete-safeguards.md, docs/exec-plans/index.md, harness/progress.md
- Blockers: none
- Next steps: execute `feat-012` implementation from the new active ExecPlan and update `harness/features/feat-012.json` to reconcile the old delete-confirmation wording during implementation.

## 2026-04-28 — Implemented and closed feat-015a backend permission enforcement
- Who: Codex
- Summary: Implemented `feat-015a` end-to-end on worker by adding explicit household membership resolution middleware (`validateHouseholdIdParam`, `resolveHouseholdMembership`) and role guard middleware (`requireRole`) so household-scoped permissions no longer depend on any global active-household state. Added a reusable household permission-policy module, refactored household repository/handlers to remove embedded admin checks from SQL update/delete paths, and updated integration behavior to return `403 FORBIDDEN` for active non-admin members while retaining `404 NOT_FOUND` for non-members.
- Files changed: apps/worker/src/db/repositories/household-membership-repository.ts, apps/worker/src/db/repositories/household-repository.ts, apps/worker/src/middlewares/household-membership.ts, apps/worker/src/lib/permissions/household-policy.ts, apps/worker/src/types/app.ts, apps/worker/src/routes/households.ts, apps/worker/src/handlers/households/get-household.ts, apps/worker/src/handlers/households/update-household.ts, apps/worker/src/handlers/households/archive-household.ts, apps/worker/test/unit/household-policy.spec.ts, apps/worker/test/index.spec.ts, docs/exec-plans/plans/2026-04-28-feat-015a-role-permission-backend-enforcement.md, docs/exec-plans/index.md, harness/features/feat-015a.json, harness/feature_index.json, harness/progress.md
- Blockers: `pnpm test:worker` required escalated execution in this environment because Wrangler log output path is outside sandbox (`~/Library/Preferences/.wrangler/logs`).
- Next steps: proceed with `feat-012` household settings/delete safeguards using the new middleware/policy infrastructure.

## 2026-04-28 — Reconciled household docs and created feat-015a ExecPlan
- Who: Codex
- Summary: Updated household-related docs and harness feature records to match the explicit household-selection model (no global active household) and the current delete terminology for household flows. Added the active ExecPlan for `feat-015a` so backend permission enforcement now targets explicit request household resolution plus hybrid `404`/`403` authorization behavior.
- Files changed: docs/product-specs/household-management.md, docs/product-specs/role-permission.md, docs/product-specs/data-visibility.md, docs/product-specs/expense-tracking.md, docs/product-specs/quick-add-experience.md, docs/exec-plans/plans/2026-04-25-feat-011-household-crud-pages-no-active.md, docs/exec-plans/plans/2026-04-28-feat-015a-role-permission-backend-enforcement.md, docs/exec-plans/index.md, docs/exec-plans/tech-debt-tracker.md, harness/features/feat-011.json, harness/features/feat-012.json, harness/features/feat-015a.json, harness/features/feat-024.json, harness/feature_index.json, harness/progress.md
- Blockers: none
- Next steps: implement `feat-015a` against the new ExecPlan; keep configurable member invite/group permissions deferred until household settings/schema is defined.

## 2026-04-25 — Fixed member placeholder UX review issues in household detail
- Who: Codex
- Summary: Addressed review findings in household detail placeholder members section by disabling Invite/Remove buttons until member-management APIs exist and adding explicit TODO comments for follow-up feature work. Also replaced hardcoded English placeholder row labels with i18n-backed strings.
- Files changed: apps/web/src/pages/app/household-detail-page.tsx, apps/web/src/lib/i18n/locales/vi.json, harness/progress.md
- Blockers: none
- Next steps: enable invite/remove actions after feat members endpoints are implemented.

## 2026-04-25 — Default VND backend + remove currency choice/display from web
- Who: Codex
- Summary: Temporarily disabled currency selection in gia đình create flows by making worker create-contract accept omitted currency and default to `VND` server-side. Updated web create/edit forms to remove currency fields and removed gia đình currency rendering from list/detail UI, keeping member-count placeholder only.
- Files changed: apps/worker/src/contracts/household.ts, apps/worker/src/db/repositories/household-repository.ts, apps/worker/test/unit/dto-household.spec.ts, apps/worker/test/index.spec.ts, apps/web/src/lib/forms/household.schema.ts, apps/web/src/types/household.ts, apps/web/src/pages/app/onboarding-page.tsx, apps/web/src/pages/app/households-page.tsx, apps/web/src/pages/app/household-detail-page.tsx, apps/web/src/stores/household.store.test.tsx, harness/progress.md
- Blockers: none
- Next steps: when member feature is implemented, replace `Số thành viên: --` placeholders with real counts from household members API.

## 2026-04-25 — Refined gia đình wording + household dialogs UI
- Who: Codex
- Summary: Updated web household UI copy to use Vietnamese term `gia đình`, removed slug display from household list/detail screens, added member-count placeholder text (`Số thành viên: --`), and converted create/edit gia đình forms to `Dialog` flows while removing field-level descriptions to reduce visual noise.
- Files changed: apps/web/src/pages/app/households-page.tsx, apps/web/src/pages/app/household-detail-page.tsx, apps/web/src/lib/i18n/locales/vi.json, harness/progress.md
- Blockers: none
- Next steps: wire real member counts after member-management feature APIs land.

## 2026-04-25 — Reworked feat-011 to household CRUD + pages without active household
- Who: Codex
- Summary: Re-implemented `feat-011` to remove global active-household assumptions and ship full household CRUD. Backend now supports `PATCH /api/v1/households/:id` and `DELETE /api/v1/households/:id` (soft archive), plus expanded integration coverage for update/archive validation and authorization. Web now uses a single `household.store`, removed active-household store/context/switcher and header injection, and added `/households`, `/households/:id`, and `/more` pages with household navigation; household detail includes members placeholder table + invite/remove buttons with TODO markers for follow-up member features.
- Files changed: apps/worker/src/contracts/household.ts, apps/worker/src/db/repositories/household-repository.ts, apps/worker/src/handlers/households/update-household.ts, apps/worker/src/handlers/households/archive-household.ts, apps/worker/src/routes/households.ts, apps/worker/src/index.ts, apps/worker/src/lib/i18n/messages.vi.ts, apps/worker/test/unit/dto-household.spec.ts, apps/worker/test/index.spec.ts, apps/web/src/api/client.ts, apps/web/src/api/household.ts, apps/web/src/types/household.ts, apps/web/src/stores/household.store.ts, apps/web/src/stores/household.store.test.tsx, apps/web/src/pages/app/onboarding-page.tsx, apps/web/src/pages/app/households-page.tsx, apps/web/src/pages/app/household-detail-page.tsx, apps/web/src/pages/app/more-page.tsx, apps/web/src/pages/app/overview-page.tsx, apps/web/src/router.tsx, apps/web/src/lib/constants/navigation.ts, apps/web/src/lib/constants/paths.ts, apps/web/src/lib/i18n/locales/vi.json, apps/web/src/app.test.tsx, docs/exec-plans/plans/2026-04-25-feat-011-household-crud-pages-no-active.md, docs/exec-plans/index.md, harness/features/feat-011.json, harness/feature_index.json, harness/progress.md
- Blockers: GitNexus impact/detect-changes automation is still unavailable in this environment because the repository is not discoverable from available GitNexus MCP repository listing; previous `npx gitnexus analyze` attempts also failed with runtime index errors.
- Next steps: move to `feat-012`/`feat-013`/`feat-014` for real household settings and member-management APIs if prioritized.

## 2026-04-25 — Implemented and closed feat-011 household creation + active household selection
- Who: Codex
- Summary: Completed `feat-011` end-to-end by adding authenticated worker household APIs (`POST /api/v1/households`, `GET /api/v1/households`, `GET /api/v1/households/:id`) with membership-aware access control and creator admin bootstrap, plus web onboarding create-household flow, persisted active-household zustand store, shell household switcher, household context provider fallback logic, and `X-Household-Id` request propagation in the web API client.
- Files changed: apps/worker/src/contracts/household.ts, apps/worker/src/contracts/index.ts, apps/worker/src/db/repositories/household-repository.ts, apps/worker/src/handlers/households/create-household.ts, apps/worker/src/handlers/households/list-households.ts, apps/worker/src/handlers/households/get-household.ts, apps/worker/src/routes/households.ts, apps/worker/src/index.ts, apps/worker/src/lib/i18n/messages.vi.ts, apps/worker/test/unit/dto-household.spec.ts, apps/worker/test/index.spec.ts, apps/web/src/types/household.ts, apps/web/src/lib/forms/household.schema.ts, apps/web/src/api/endpoints.ts, apps/web/src/api/household.ts, apps/web/src/hooks/api/use-households.ts, apps/web/src/stores/active-household.store.ts, apps/web/src/stores/active-household.store.test.tsx, apps/web/src/components/layouts/household-context-provider.tsx, apps/web/src/components/layouts/household-switcher.tsx, apps/web/src/components/layouts/main-layout.tsx, apps/web/src/components/layouts/app-sidebar.tsx, apps/web/src/pages/app/onboarding-page.tsx, apps/web/src/pages/app/overview-page.tsx, apps/web/src/api/client.ts, apps/web/src/lib/i18n/locales/vi.json, apps/web/src/app.test.tsx, docs/exec-plans/plans/2026-04-25-feat-011-household-creation-active-selection.md, docs/exec-plans/index.md, harness/features/feat-011.json, harness/feature_index.json, harness/progress.md
- Blockers: GitNexus impact/detect-changes automation remained unavailable for this repo in this environment because the repository was not indexed in MCP, and `npx gitnexus analyze` failed with `Cannot destructure property 'package' of 'node.target' as it is null`.
- Next steps: continue with dependent household features (`feat-015a`, `feat-012`, `feat-013`, `feat-014`) on top of the new household context/API foundation.

## 2026-04-25 — Corrected Cloudinary upload test contract
- Who: Agent
- Summary: Removed the accidental `max_file_size` multipart field from `apps/web/src/lib/media/cloudinary-upload.ts` and updated `apps/web/src/lib/media/cloudinary-upload.test.ts` so the assertion matches the intended Cloudinary upload payload. Re-ran `pnpm test:web` and the full web suite passed.
- Files changed: apps/web/src/lib/media/cloudinary-upload.ts, apps/web/src/lib/media/cloudinary-upload.test.ts, harness/progress.md
- Blockers: none
- Next steps: none.

## 2026-04-25 — Implemented and closed feat-037 profile settings UI and Cloudinary integration
- Who: Agent
- Summary: Refactored `apps/web/src/pages/app/profile-settings-page.tsx` for a premium side-by-side UI layout with CardDescription context, updated i18n locales with new descriptions, and successfully migrated the avatar upload flow from Firebase Storage to Cloudinary signed uploads (`uploadMediaViaCloudinary`). Ran lint and fixed formatting, updated harness artifacts to mark feat-037 done.
- Files changed: apps/web/src/pages/app/profile-settings-page.tsx, apps/web/src/lib/i18n/locales/vi.json, docs/exec-plans/plans/2026-04-25-feat-037-improve-profile-settings.md, harness/feature_index.json, harness/features/feat-037.json, harness/progress.md
- Blockers: none
- Next steps: proceed to next pending feature.
## 2026-04-24 — Backfilled missing ExecPlan for feat-036
- Who: Codex
- Summary: Added missing execution plan document for `feat-036` into `docs/exec-plans/plans/` and registered it in `docs/exec-plans/index.md` under `Completed`, aligning the feature with harness plan governance flow.
- Files changed: docs/exec-plans/plans/2026-04-24-feat-036-cloudinary-signed-media-upload-foundation.md, docs/exec-plans/index.md, harness/progress.md
- Blockers: none
- Next steps: none.

## 2026-04-24 — Locked Cloudinary upload to required preset
- Who: Codex
- Summary: Updated signed-upload flow to enforce preset-only uploads using `household-finance-system-preset`. Backend now includes `upload_preset` in signed params and response ticket, and frontend upload helper always forwards `upload_preset` from server-issued ticket to Cloudinary multipart upload.
- Files changed: apps/worker/src/lib/media/cloudinary.ts, apps/worker/src/contracts/media.ts, apps/worker/test/unit/cloudinary.spec.ts, apps/worker/test/index.spec.ts, apps/web/src/types/media.ts, apps/web/src/lib/media/cloudinary-upload.ts, apps/web/src/api/media.test.ts, apps/web/src/lib/media/cloudinary-upload.test.ts, harness/progress.md
- Blockers: none
- Next steps: none.

## 2026-04-24 — Implemented and closed feat-036 Cloudinary signed upload foundation
- Who: Codex
- Summary: Delivered a reusable signed media-upload foundation across worker and web. Backend now exposes authenticated `POST /api/v1/media/upload-signature` with strict request validation, server-controlled `folder/public_id/timestamp`, policy enforcement per resource type (`image|video`), and Cloudinary SHA-1 signature generation using protected server secret. Frontend now has shared media API + Cloudinary SDK helpers for the two-step flow (`requestUploadSignature` then multipart upload), with normalized upload result mapping for future features.
- Files changed: apps/worker/src/contracts/media.ts, apps/worker/src/contracts/index.ts, apps/worker/src/routes/media.ts, apps/worker/src/handlers/media/create-upload-signature.ts, apps/worker/src/lib/media/cloudinary.ts, apps/worker/src/index.ts, apps/worker/src/lib/env.ts, apps/worker/src/types/app.ts, apps/worker/.dev.vars.example, apps/worker/vitest.config.mts, apps/worker/test/index.spec.ts, apps/worker/test/unit/cloudinary.spec.ts, apps/worker/test/unit/dto-media.spec.ts, apps/worker/test/unit/env.spec.ts, apps/worker/README.md, apps/web/src/api/endpoints.ts, apps/web/src/api/media.ts, apps/web/src/api/media.test.ts, apps/web/src/types/media.ts, apps/web/src/lib/media/cloudinary-upload.ts, apps/web/src/lib/media/cloudinary-upload.test.ts, harness/feature_index.json, harness/features/feat-036.json, harness/progress.md
- Blockers: none
- Next steps: integrate `uploadMediaViaCloudinary` into specific product features (avatar, expense attachments, etc.) in separate feature scopes.

## 2026-04-24 — Fixed Prettier plugin resolution and increased Commitlint header limit
- Who: Codex
- Summary: Installed `prettier-plugin-tailwindcss` at the workspace root to resolve Husky/lint-staged errors where Prettier could not find the plugin from the root context. Updated `commitlint.config.cjs` to increase the `header-max-length` from the conventional default to 150 characters to accommodate longer descriptive commit messages.
- Files changed: package.json, commitlint.config.cjs, harness/progress.md
- Blockers: None.

## 2026-04-24 — Implemented and closed feat-035 responsive main layout shell
- Who: Codex
- Summary: Completed `feat-035` by creating `AppSidebar` and `BottomTab` components with unified `APP_MENU_ITEMS` and `BOTTOM_TAB_ITEMS` constants under `paths.ts` and `navigation.ts`. Refactored `router.tsx` to a single `/` base protected app root and eliminated the legacy `/app` path prefix. Used `createPortal` for bottom tabs to render above the page safe area. Confirmed layout rendering and responsive logic via test suite and marked feature as done.
- Files changed: apps/web/src/router.tsx, apps/web/src/components/layouts/main-layout.tsx, apps/web/src/components/layouts/app-sidebar.tsx, apps/web/src/components/layouts/bottom-tab.tsx, apps/web/src/hooks/shared/use-mobile.ts, apps/web/src/lib/constants/paths.ts, apps/web/src/lib/constants/navigation.ts, apps/web/src/lib/constants/auth.ts, apps/web/src/index.css, apps/web/src/lib/i18n/locales/vi.json, apps/web/src/app.test.tsx, apps/web/src/test/setup.ts, apps/web/src/pages/auth/sign-up-page.tsx, apps/web/src/pages/app/onboarding-page.tsx, apps/web/src/pages/app/overview-page.tsx, apps/web/src/pages/app/placeholder-page.tsx, docs/exec-plans/index.md, harness/features/feat-035.json, harness/feature_index.json, harness/progress.md
- Blockers: GitNexus `detect_changes` isn't available for the environment, so couldn't execute GitNexus diff check. Mocked `window.matchMedia` for `jsdom` testing in Vitest since `useIsMobile` needed it.
- Next steps: Proceed to the next prioritized features or bug fixes.

## 2026-04-24 — Restructured exec-plan storage to keep stable file paths
- Who: Codex
- Summary: Updated plan storage structure per request to keep `docs/exec-plans/` as the root and avoid active/completed folder moves: all plan files now live under `docs/exec-plans/plans/`, while `docs/exec-plans/index.md` tracks status with `Active` and `Completed` sections. Updated plan governance docs and the planning skill guidance to match this workflow.
- Files changed: docs/exec-plans/index.md, docs/exec-plans/__plan-template__.md (moved), docs/exec-plans/tech-debt-tracker.md (moved), docs/exec-plans/plans/*.md (moved), docs/PLANS.md, .agents/skills/create-plan-for-implement/SKILL.md, docs/exec-plans/plans/2026-04-24-feat-035-responsive-main-layout-shell.md, harness/progress.md
- Blockers: none
- Next steps: when finishing any feature plan, keep the same file in `docs/exec-plans/plans/` and only move its line item from `Active` to `Completed` in `docs/exec-plans/index.md`.

## 2026-04-24 — Created ExecPlan and harness records for feat-035 responsive main layout shell
- Who: Codex
- Summary: Created the active ExecPlan for `feat-035` to build a responsive protected-app layout shell in `apps/web` with desktop sidebar, mobile bottom tabs (`5 tabs + More`), canonical protected routing rooted at `/`, shared navigation constants, safe-area spacing guarantees, and i18n-ready navigation copy. Registered the new feature in harness as `in_progress` so implementation can start immediately in the next step.
- Files changed: docs/exec-plans/active/2026-04-24-feat-035-responsive-main-layout-shell.md, docs/exec-plans/active/index.md, harness/features/feat-035.json, harness/feature_index.json, harness/progress.md
- Blockers: none for planning; implementation must still execute the AGENTS-mandated impact analysis step before editing symbols.
- Next steps: start implementing `feat-035` from the new ExecPlan, then collect verification evidence (`pnpm --filter web lint`, `pnpm --filter web typecheck`, `pnpm --filter web test`, `pnpm --filter web build`, `./init.sh`) before moving plan/feature to done.

## 2026-04-24 — Added local Husky hooks for staged lint/format, push tests, and commit message linting
- Who: Codex
- Summary: Added repository-level Husky hooks so `pre-commit` runs `lint-staged` on staged files, `pre-push` runs the existing root `test` suite only, and `commit-msg` validates Conventional Commit messages with commitlint. Also added root-level hook dependencies plus a repo-prettier dependency so staged docs, harness files, lockfiles, and package manifests can be formatted locally before commit.
- Files changed: package.json, pnpm-lock.yaml, .gitignore, .lintstagedrc.cjs, commitlint.config.cjs, .husky/pre-commit, .husky/pre-push, .husky/commit-msg, harness/features/feat-034.json, harness/feature_index.json, harness/progress.md
- Blockers: `npx gitnexus detect-changes` is unavailable in this environment (`unknown command 'detect-changes'`), so the repo-mandated graph-diff step could not be run with that exact subcommand.
- Next steps: keep CI unchanged, and use the new hooks as a local fast-fail layer before push/PR.

## 2026-04-24 — Fixed web auth routing tests to respect session hydration gate
- Who: Codex
- Summary: Updated `apps/web/src/app.test.tsx` so the shared test reset marks the auth store session as checked after clearing state. This keeps the public/protected auth route tests aligned with the current hydration gate behavior instead of getting stuck on the temporary "restoring session" screen.
- Files changed: apps/web/src/app.test.tsx, harness/features/feat-009.json, harness/progress.md
- Blockers: none
- Next steps: keep auth route tests aligned with the store hydration contract whenever that gate changes again.

## 2026-04-24 — Removed stale web auth/session and axios refresh plumbing
- Who: Codex
- Summary: Simplified the web auth flow by removing the unused `returnTo`/`postAuthRedirect` routing state, trimming `session-service` down to sign-in/sign-up/sign-out only, deleting obsolete client/session tests, and reducing the axios client to request auth headers + API envelope unwrapping. Also aligned profile queries to return DTOs directly so the settings page and React Query hooks consume the expected types again.
- Files changed: apps/web/src/api/auth.ts, apps/web/src/api/client.ts, apps/web/src/api/profile.ts, apps/web/src/app.test.tsx, apps/web/src/components/layouts/main-layout.tsx, apps/web/src/components/layouts/protected-route.tsx, apps/web/src/lib/auth/session-service.ts, apps/web/src/pages/auth/sign-in-page.tsx, apps/web/src/pages/auth/sign-up-page.tsx, apps/web/src/stores/auth.store.test.tsx, apps/web/src/stores/auth.store.ts, apps/web/src/api/client.test.ts, apps/web/src/lib/auth/session-service.test.ts, apps/web/src/lib/auth/redirect.ts, harness/progress.md
- Blockers: none
- Next steps: keep `apps/web` auth/session changes minimal unless a future feature needs redirect persistence again.

## 2026-04-24 — Implemented and closed feat-010 profile settings + avatar upload
- Who: Codex
- Summary: Completed `feat-010` end-to-end by migrating profile API contract from `/api/v1/profile` to `/api/v1/users/me`, adding `createdAt` in profile responses, and enforcing backend display-name validation (`trim`, non-empty, max 100). Replaced the web settings placeholder with a real `ProfileSettingsPage` using shadcn-first composition + RHF/Zod + React Query optimistic updates, added Firebase Storage avatar upload with client-side square crop/compression before upload, and synchronized updated profile data back into auth store state.
- Files changed: AGENTS.md, apps/worker/eslint.config.mjs, apps/worker/tsconfig.json, apps/worker/src/routes/profile.ts, apps/worker/src/contracts/profile.ts, apps/worker/src/db/repositories/user-repository.ts, apps/worker/src/handlers/profile/get-current-profile.ts, apps/worker/src/handlers/profile/update-current-profile.ts, apps/worker/src/lib/i18n/messages.vi.ts, apps/worker/test/index.spec.ts, apps/worker/test/unit/dto-profile.spec.ts, apps/worker/test/unit/user-repository.spec.ts, apps/web/src/main.tsx, apps/web/src/router.tsx, apps/web/src/api/endpoints.ts, apps/web/src/api/profile.ts, apps/web/src/hooks/api/use-profile.ts, apps/web/src/types/profile.ts, apps/web/src/lib/forms/profile.schema.ts, apps/web/src/lib/firebase/storage.ts, apps/web/src/lib/images/avatar-image.ts, apps/web/src/pages/app/profile-settings-page.tsx, apps/web/src/stores/auth.store.ts, apps/web/src/stores/auth.store.test.tsx, apps/web/src/lib/i18n/locales/vi.json, docs/exec-plans/completed/2026-04-24-feat-010-user-profile-settings-avatar-upload.md, docs/exec-plans/active/index.md, docs/exec-plans/completed/index.md, harness/features/feat-010.json, harness/feature_index.json, harness/progress.md
- Blockers: GitNexus CLI in this environment does not expose the `detect_changes` command referenced in AGENTS guidance (`npx gitnexus detect-changes` / `detect_changes` are unknown), so that specific pre-commit graph-diff step could not be executed.
- Next steps: move to the next pending feature (`feat-011`) when requested.

## 2026-04-24 — Created ExecPlan for feat-010 profile settings + avatar upload
- Who: Codex
- Summary: Created the active ExecPlan for `feat-010` at `docs/exec-plans/active/2026-04-24-feat-010-user-profile-settings-avatar-upload.md` using the repository `__plan-template__.md` structure, with strict `/api/v1/users/me` contract migration, display-name update validation, and expanded avatar workflow (square crop + client-side compression + Firebase Storage upload + backend profile persistence). Updated active plan index and synchronized `harness/features/feat-010.json` scope to match the approved feature expansion.
- Files changed: docs/exec-plans/active/2026-04-24-feat-010-user-profile-settings-avatar-upload.md, docs/exec-plans/active/index.md, harness/features/feat-010.json, harness/progress.md
- Blockers: none
- Next steps: implement feat-010 from the new ExecPlan, then collect verification evidence (`pnpm test:worker`, `pnpm test:web`, `./init.sh`) before marking the feature complete.

## 2026-04-24 — Implemented and closed feat-009c auth standardization
- Who: Codex
- Summary: Completed `feat-009c` by refactoring `apps/web` auth flow to axios transport + interceptor-driven refresh-and-retry queue, persisting session state (`user`, `accessToken`, `refreshToken`) in the zustand auth store with hydration gating (`isSessionChecked`), simplifying auth session orchestration, and migrating sign-in/sign-up forms to `react-hook-form` + `zod` while preserving existing UI composition. Updated auth route guards to wait for hydration and added/updated tests for client, store, session service, and routing behavior.
- Files changed: apps/web/package.json, pnpm-lock.yaml, apps/web/src/api/client.ts, apps/web/src/api/auth.ts, apps/web/src/api/client.test.ts, apps/web/src/stores/auth.store.ts, apps/web/src/stores/auth.store.test.tsx, apps/web/src/lib/auth/session-service.ts, apps/web/src/lib/auth/session-service.test.ts, apps/web/src/components/layouts/public-route.tsx, apps/web/src/components/layouts/shell-guard.tsx, apps/web/src/router.tsx, apps/web/src/pages/auth/sign-in-page.tsx, apps/web/src/pages/auth/sign-up-page.tsx, apps/web/src/components/auth/auth-field.tsx, apps/web/src/app.tsx, apps/web/src/app.test.tsx, docs/exec-plans/active/index.md, docs/exec-plans/completed/2026-04-24-feat-009c-auth-call-and-auth-state-standardization.md, docs/exec-plans/completed/index.md, harness/features/feat-009c.json, harness/feature_index.json, harness/progress.md
- Blockers: none
- Next steps: monitor bundle-size warning from `pnpm --filter web build` (Vite chunk > 500kB) in a separate performance-focused feature; auth/session functionality for feat-009c is complete.

## 2026-04-24 — Created ExecPlan and harness records for feat-009c
- Who: Codex
- Summary: Added the active ExecPlan for `feat-009c` to standardize frontend auth API calls and auth-state handling (`axios` interceptor refresh-and-retry queue, persisted auth-store hydration gate, and react-hook-form + zod auth form wiring with current UI preserved). Updated active plan index, created `harness/features/feat-009c.json`, and registered the new feature in `harness/feature_index.json`.
- Files changed: docs/exec-plans/active/2026-04-24-feat-009c-auth-call-and-auth-state-standardization.md, docs/exec-plans/active/index.md, harness/features/feat-009c.json, harness/feature_index.json, harness/progress.md
- Blockers: none
- Next steps: implement `feat-009c` according to the new ExecPlan and attach verification evidence after `./init.sh` and web auth-focused test suites pass.

## 2026-04-24 — Decoupled API client test from VITE_API_BASE_URL
- Who: Codex
- Summary: Relaxed the web API client fetch assertion so it only checks the expected `/api/v1/health` path suffix, which makes the test pass in CI and local environments regardless of whether `VITE_API_BASE_URL` is set. Re-verified the web workspace with `pnpm test:web` and `pnpm typecheck:web`.
- Files changed: apps/web/src/api/client.test.ts, harness/progress.md
- Blockers: none
- Next steps: keep environment-specific base URLs out of unit-test expectations unless the test is explicitly verifying env wiring.

## 2026-04-24 — Kept shared card UI unchanged and aligned auth tests to current markup
- Who: Codex
- Summary: Reverted the temporary `CardTitle` semantic change so `apps/web/src/components/ui` stays untouched, then updated the auth routing and i18n tests to assert the existing `data-slot="card-title"` markup instead of relying on a heading role. Verified the web workspace with `pnpm test:web` and `pnpm typecheck:web`.
- Files changed: apps/web/src/components/ui/card.tsx, apps/web/src/app.test.tsx, apps/web/src/lib/i18n/browser-fallback.test.tsx, harness/progress.md
- Blockers: none
- Next steps: if future UI tests need accessibility-driven queries, add semantics at the page-specific layer rather than in shared UI primitives.

## 2026-04-24 — Fixed web test regressions in auth headings and API client expectation
- Who: Codex
- Summary: Updated the shared `CardTitle` component to render a semantic `h2`, which restored heading-based queries across the sign-in, sign-up, and overview UI tests. Also aligned the API client test with the configured absolute `VITE_API_BASE_URL` so the fetch assertion matches runtime behavior. Verified the web workspace with `pnpm test:web` and `pnpm typecheck:web`.
- Files changed: apps/web/src/components/ui/card.tsx, apps/web/src/api/client.test.ts, harness/progress.md
- Blockers: none
- Next steps: keep using semantic heading elements in shared card headers so accessibility and Testing Library queries stay aligned.

## 2026-04-23 — Quieted init.sh step output on success
- Who: Codex
- Summary: Wrapped each `init.sh` step in a capture-and-replay helper so normal runs only show the step banners, while any failing step prints its collected stdout/stderr after the failure.
- Files changed: init.sh, harness/progress.md
- Blockers: none
- Next steps: if needed, apply the same wrapper pattern to any future repo bootstrap scripts that are too noisy on success.

## 2026-04-23 — Mobile-first auth UI redesign
- Who: Antigravity
- Summary: Completed `feat-009b`: Redesigned Auth UI to be mobile-first and minimal. Swapped Form/Hero order in `PublicShell` for better mobile above-the-fold experience. Removed debug labels and technical footer text. Reverted custom component modifications; used only default shadcn variants (`size="lg"` for buttons). Corrected theme resolution logic in `Toaster` component (now using project-local `useTheme` instead of `next-themes`) to fix failing tests. Verified the workspace with `pnpm --filter web lint`, `pnpm --filter web test`, `pnpm --filter web build`, and the full `./init.sh` workspace verification successfully.
- Files changed: apps/web/src/components/layouts/public-shell.tsx, apps/web/src/components/ui/toaster.tsx, apps/web/src/components/auth/auth-panel.tsx, apps/web/src/pages/auth/sign-in-page.tsx, apps/web/src/pages/auth/sign-up-page.tsx, harness/progress.md
- Blockers: none
- Next steps: keep the auth/session seam stable for follow-on profile/onboarding work and future API consumers.

## 2026-04-23 — Hardened auth session bootstrap and browser storage fallback
- Who: Codex
- Summary: Fixed the remaining `feat-009` review issues by adding stale-bootstrap guards in the frontend auth session service, finalizing bootstrap when Firebase auth initialization fails, rolling back Firebase sign-in/sign-up if the provider exchange fails, and routing web theme/i18n storage through a safe browser-storage helper so the app and tests tolerate the current jsdom localStorage behavior. Added focused regressions for the auth race/rollback paths and the Firebase readiness gate, then re-ran `pnpm --filter web lint`, `pnpm --filter web test`, `pnpm --filter web build`, and the full `./init.sh` workspace verification successfully.
- Files changed: apps/web/src/components/theme-provider.tsx, apps/web/src/lib/auth/firebase-auth.ts, apps/web/src/lib/auth/firebase-auth.test.ts, apps/web/src/lib/auth/session-service.ts, apps/web/src/lib/auth/session-service.test.ts, apps/web/src/lib/i18n/browser-fallback.test.tsx, apps/web/src/lib/i18n/change-language.test.tsx, apps/web/src/lib/i18n/index.ts, apps/web/src/lib/storages/auth-refresh-token-storage.ts, apps/web/src/lib/storages/browser-storage.ts, apps/web/src/test/setup.ts, harness/progress.md, harness/features/feat-009.json, AGENTS.md
- Blockers: none
- Next steps: keep the auth/session seam stable for follow-on profile/onboarding work and future API consumers.

## 2026-04-23 — Completed feat-009 frontend authentication session flow
- Who: Codex
- Summary: Implemented the frontend auth/session flow end-to-end for `feat-009`: Firebase email/password sign-in and sign-up, backend token exchange and refresh/logout calls, refresh-token persistence behind a storage adapter, in-memory access token/session state with scheduled silent refresh, bootstrap gating, protected-route redirects, sign-out cleanup, and onboarding redirect handling. Verified the workspace with `pnpm --filter web lint`, `pnpm --filter web test`, `pnpm --filter web build`, and `./init.sh`, then archived the ExecPlan and updated the harness records.
- Files changed: apps/web/package.json, apps/web/src/api/auth.ts, apps/web/src/api/endpoints.ts, apps/web/src/app.test.tsx, apps/web/src/app.tsx, apps/web/src/components/auth/auth-field.tsx, apps/web/src/components/auth/auth-panel.tsx, apps/web/src/components/layouts/protected-shell.tsx, apps/web/src/components/layouts/shell-guard.tsx, apps/web/src/lib/auth/firebase-auth.ts, apps/web/src/lib/auth/redirect.ts, apps/web/src/lib/auth/session-service.ts, apps/web/src/lib/constants/auth.ts, apps/web/src/lib/i18n/locales/vi.json, apps/web/src/lib/storages/auth-refresh-token-storage.ts, apps/web/src/pages/app/overview-page.tsx, apps/web/src/pages/auth/sign-in-page.tsx, apps/web/src/pages/auth/sign-up-page.tsx, apps/web/src/stores/auth.store.test.tsx, apps/web/src/stores/auth.store.ts, apps/web/src/types/auth.ts, docs/exec-plans/active/index.md, docs/exec-plans/completed/2026-04-23-feat-009-authentication-frontend-session-flow.md, docs/exec-plans/completed/index.md, harness/feature_index.json, harness/features/feat-009.json, harness/progress.md, pnpm-lock.yaml
- Blockers: none
- Next steps: keep the new auth/session seam stable for follow-on profile/onboarding work and future API consumers.

## 2026-04-23 — Created ExecPlan for feat-009 frontend authentication session flow
- Who: Codex
- Summary: Drafted the active ExecPlan for `feat-009` after reviewing the current shell-auth stub flow, the completed `feat-008` backend auth endpoints, the `feat-033` typed API client/auth-session adapter seam, the product auth/onboarding specs, and the required frontend/shared planning references. The plan locks the feature to frontend session orchestration: Firebase email/password auth, backend token exchange, refresh-token persistence behind a storage adapter, in-memory access token ownership in the auth store, silent refresh/bootstrap behavior, logout cleanup, protected-route gating, and a replaceable onboarding redirect seam.
- Files changed: docs/exec-plans/active/2026-04-23-feat-009-authentication-frontend-session-flow.md, docs/exec-plans/active/index.md, harness/progress.md
- Blockers: none for planning; implementation must verify the auth exchange endpoint naming (`exchange` vs `provider/exchange`) and document any required Firebase web env/config exposure.
- Next steps: start implementation with failing auth/session regression tests, then build the Firebase auth service, storage adapter, real auth store lifecycle, and route/bootstrap wiring before full repo verification.

## 2026-04-23 — Hardened feat-033 web API client envelope validation
- Who: Codex
- Summary: Fixed the follow-up review issues in the shared web API client by rejecting malformed JSON success payloads that do not satisfy the `{ success, data, error, meta }` contract and by wrapping invalid JSON responses into typed `ApiClientError` transport failures. Added regression tests for both cases and re-verified the web and repo-wide checks.
- Files changed: apps/web/src/api/client.ts, apps/web/src/api/client.test.ts, harness/progress.md
- Blockers: none
- Next steps: keep future `src/api/*` consumers on the typed client path so transport contract regressions remain centralized and testable.

## 2026-04-22 — Implemented feat-033 API response contract standardization
- Who: Codex
- Summary: Standardized all current worker `/api/v1` responses onto the symmetric `{ success, data, error, meta }` envelope, centralized worker error-code ownership, added explicit response-envelope assertions in worker unit/integration tests, and created the canonical web `src/api` layer with endpoint constants, typed transport contracts, a fetch-based client, and adapter-driven 401 refresh-and-retry coverage. Archived the ExecPlan and marked `feat-033` done after full repo verification.
- Files changed: apps/worker/src/lib/errors.ts, apps/worker/src/lib/response.ts, apps/worker/test/unit/response.spec.ts, apps/worker/test/index.spec.ts, apps/web/src/api/client.ts, apps/web/src/api/client.test.ts, apps/web/src/api/endpoints.ts, apps/web/src/types/api.ts, docs/exec-plans/completed/2026-04-22-feat-033-api-response-contract-error-handling-standardization.md, docs/exec-plans/active/index.md, docs/exec-plans/completed/index.md, harness/feature_index.json, harness/features/feat-033.json, harness/progress.md
- Blockers: none
- Next steps: wire `feat-009` to the new API client/auth-session adapter instead of adding raw fetch/session logic in auth pages or stores.

## 2026-04-22 — Re-sequenced feat-033 ahead of feat-009
- Who: Codex
- Summary: Removed the incorrect dependency from `feat-033` to `feat-009`, kept `feat-033` anchored to the existing backend auth surface from `feat-008`, and updated the active ExecPlan plus `feat-009` dependencies so the frontend auth flow now consumes the standardized API client/error contract instead of blocking it.
- Files changed: harness/features/feat-033.json, harness/features/feat-009.json, docs/exec-plans/active/2026-04-22-feat-033-api-response-contract-error-handling-standardization.md, harness/progress.md
- Blockers: none
- Next steps: implement `feat-033` first, then wire `feat-009` onto the new client/envelope contract.

## 2026-04-22 — Created ExecPlan for feat-033 API response contract standardization
- Who: Codex
- Summary: Drafted the active ExecPlan for `feat-033` after reviewing the current worker response/error helpers, route coverage, frontend store state, harness backlog, and the required frontend/backend/shared reference docs. The plan locks the feature to infrastructure-only fullstack work: standardize the worker `{ success, data, error, meta }` envelope, centralize error-code ownership, create the canonical web `src/api` client seam with typed errors and a refresh adapter, and record the remaining dependency on `feat-009` for real auth-session wiring.
- Files changed: docs/exec-plans/active/2026-04-22-feat-033-api-response-contract-error-handling-standardization.md, docs/exec-plans/active/index.md, harness/progress.md
- Blockers: final production verification of 401 refresh-and-retry still depends on `feat-009` exposing the real frontend auth-session lifecycle.
- Next steps: implement worker envelope/error standardization first, then add the web API client and adapter-driven retry tests before running full repo verification.

## 2026-04-22 — Hardened feat-008 auth/session rotation and logout timing
- Who: Codex
- Summary: Tightened refresh-session rotation in the worker repository to be atomic, added logout request-epoch plumbing to avoid near-expiry revocation races, parallelized auth middleware lookups, expanded auth contract/session repository tests for validation and edge cases, and re-verified the worker auth slice with focused tests plus lint/typecheck.
- Files changed: apps/worker/src/db/repositories/session-repository.ts, apps/worker/src/middlewares/auth.ts, apps/worker/src/routes/auth.ts, apps/worker/src/types/app.ts, apps/worker/src/types/auth.ts, apps/worker/src/contracts/auth.ts, apps/worker/src/handlers/auth/logout-session.ts, apps/worker/test/unit/dto-auth.spec.ts, apps/worker/test/unit/session-repository.spec.ts, harness/progress.md
- Blockers: none
- Next steps: keep the auth/session flow stable for `feat-009`; no further `feat-008` changes are expected.

## 2026-04-22 — Completed feat-008 backend logout/session revocation
- Who: Codex
- Summary: Implemented `POST /api/v1/auth/logout` behind auth middleware, added current-session revocation through the worker session repository, covered unauthorized/logout/post-logout regression paths in the worker integration tests, and verified the workspace with worker lint, typecheck, test, and full `./init.sh`.
- Files changed: apps/worker/src/contracts/auth.ts, apps/worker/src/types/auth.ts, apps/worker/src/handlers/auth/logout-session.ts, apps/worker/src/routes/auth.ts, apps/worker/test/index.spec.ts, harness/feature_index.json, harness/features/feat-008.json, harness/progress.md
- Blockers: none
- Next steps: keep the auth/session lifecycle stable for `feat-009`; no remaining work is expected for `feat-008`.

## 2026-04-22 — Rewrote feat-008 ExecPlan to full backend-scope template
- Who: Codex
- Summary: Tightened the active `feat-008` execution plan into a fully template-aligned backend plan with explicit scope map, layer impact, standards matrix, verification path, risks, harness integration steps, and a single owned current implementation step.
- Files changed: docs/exec-plans/active/2026-04-22-feat-008-authentication-backend-session-exchange.md, harness/progress.md
- Blockers: none
- Next steps: start implementation with a failing logout regression test in `apps/worker/test/index.spec.ts`, then add route/handler/repository support and run worker + full repo verification.

## 2026-04-22 — Hardened feat-032 language persistence against blocked storage
- Who: Codex
- Summary: Wrapped the frontend i18n language write in a storage-safe fallback and added a regression test so `changeLanguage()` keeps working even when localStorage is unavailable or blocked.
- Files changed: apps/web/src/lib/i18n/index.ts, apps/web/src/lib/i18n/change-language.test.tsx, harness/progress.md
- Blockers: none
- Next steps: keep the i18n bootstrap unchanged unless future locale expansion needs a broader storage abstraction.

## 2026-04-22 — Tightened feat-032 fallback verification
- Who: Codex
- Summary: Added a render-level regression test that boots the web router under an unsupported browser language hint and confirms the sign-in shell still renders in Vietnamese, closing the remaining verification gap from the feat-032 review.
- Files changed: apps/web/src/lib/i18n/browser-fallback.test.tsx, harness/progress.md
- Blockers: none
- Next steps: keep the i18n foundation as-is unless future locale work expands beyond `vi`.

## 2026-04-22 — Implemented feat-032 frontend internationalization foundation
- Who: Codex
- Summary: Delivered the frontend i18n foundation with `i18next`/`react-i18next`/`i18next-browser-languagedetector`, a shared `vi` catalog, browser-language plus `appLanguage` resolution normalized to `vi`, Vietnamese labels across the current auth/shell/onboarding/placeholder/overview surfaces, and regression coverage for translated rendering plus unsupported-locale fallback.
- Files changed: apps/web/package.json, pnpm-lock.yaml, apps/web/src/lib/constants/i18n.ts, apps/web/src/lib/i18n/index.ts, apps/web/src/lib/i18n/locales/vi.json, apps/web/src/lib/i18n/resolve-locale.ts, apps/web/src/lib/i18n/resolve-locale.test.ts, apps/web/src/main.tsx, apps/web/src/app.tsx, apps/web/src/router.tsx, apps/web/src/components/auth/auth-panel.tsx, apps/web/src/components/layouts/public-shell.tsx, apps/web/src/components/layouts/protected-shell.tsx, apps/web/src/pages/auth/sign-in-page.tsx, apps/web/src/pages/auth/sign-up-page.tsx, apps/web/src/pages/app/overview-page.tsx, apps/web/src/pages/app/onboarding-page.tsx, apps/web/src/pages/app/placeholder-page.tsx, apps/web/src/app.test.tsx, docs/exec-plans/completed/2026-04-22-feat-032-frontend-internationalization-foundation.md, docs/exec-plans/completed/index.md, docs/exec-plans/active/index.md, harness/feature_index.json, harness/features/feat-032.json, harness/progress.md
- Blockers: none
- Next steps: continue with the next pending feature; `feat-032` is verified and archived.

## 2026-04-22 — Refined feat-032 ExecPlan with i18next decisions
- Who: Codex
- Summary: Updated the active `feat-032` ExecPlan to reflect the chosen frontend i18n direction: use browser language detection plus `localStorage`, normalize unsupported values to `vi` before runtime init, adopt `i18next`/`react-i18next`/`i18next-browser-languagedetector`, and place shared locale constants under `src/lib/constants` with runtime bootstrap under `src/lib/i18n`.
- Files changed: docs/exec-plans/active/2026-04-22-feat-032-frontend-internationalization-foundation.md, harness/progress.md
- Blockers: none
- Next steps: implement `feat-032` with the approved `i18next` bootstrap shape, then verify persisted-locale and fallback-to-`vi` behavior in web tests.

## 2026-04-22 — Created ExecPlan for feat-032 frontend i18n foundation
- Who: Codex
- Summary: Drafted the active ExecPlan for `feat-032` after reviewing the current web shell/auth copy surface, frontend reference docs, harness state, and the completed backend i18n foundation. The plan scopes the work to frontend-only locale plumbing with a Vietnamese JSON catalog, hard fallback to `vi`, migration of the current auth/shell/onboarding labels, and explicit verification for fallback behavior.
- Files changed: docs/exec-plans/active/2026-04-22-feat-032-frontend-internationalization-foundation.md, docs/exec-plans/active/index.md, harness/progress.md
- Blockers: none
- Next steps: implement `feat-032` from the new ExecPlan, then update harness feature state and move the plan to `completed/` after verification passes.

## 2026-04-22 — Closed remaining feat-031 verification gaps
- Who: Codex
- Summary: Added integration coverage for malformed JSON request bodies and for locale resolution via `x-locale`, then re-ran worker tests and full `./init.sh` to confirm the backend i18n foundation still passes the repo verification gate.
- Files changed: apps/worker/test/index.spec.ts, harness/features/feat-031.json, harness/progress.md
- Blockers: none
- Next steps: continue with `feat-032` or resume `feat-008` now that feat-031 coverage matches the plan.

## 2026-04-22 — Implemented feat-031 backend internationalization foundation
- Who: Codex
- Summary: Delivered the worker-side i18n foundation with request-scoped locale resolution, a private Vietnamese message catalog, localized error/validation/auth responses, and `vi` fallback behavior for unsupported language hints. The plan was moved to `docs/exec-plans/completed/`, and the harness now marks `feat-031` as done.
- Files changed: apps/worker/src/lib/i18n/locales.ts, apps/worker/src/lib/i18n/messages.vi.ts, apps/worker/src/lib/i18n/catalog.ts, apps/worker/src/lib/i18n/resolve-locale.ts, apps/worker/src/lib/i18n/translate.ts, apps/worker/src/lib/i18n/zod.ts, apps/worker/src/lib/i18n/index.ts, apps/worker/src/types/app.ts, apps/worker/src/middlewares/request-context.ts, apps/worker/src/lib/errors.ts, apps/worker/src/lib/validation.ts, apps/worker/src/lib/response.ts, apps/worker/src/lib/env.ts, apps/worker/src/index.ts, apps/worker/src/contracts/profile.ts, apps/worker/src/types/auth.ts, apps/worker/src/lib/auth/firebase.ts, apps/worker/src/lib/auth/jwt.ts, apps/worker/src/middlewares/auth.ts, apps/worker/src/routes/auth.ts, apps/worker/src/routes/profile.ts, apps/worker/src/handlers/profile/get-current-profile.ts, apps/worker/src/handlers/profile/update-current-profile.ts, apps/worker/src/handlers/auth/exchange-provider-token.ts, apps/worker/src/handlers/auth/refresh-session.ts, apps/worker/src/db/repositories/user-repository.ts, apps/worker/test/unit/response.spec.ts, apps/worker/test/unit/dto-profile.spec.ts, apps/worker/test/unit/i18n.spec.ts, apps/worker/test/index.spec.ts, apps/worker/README.md, docs/exec-plans/completed/2026-04-22-feat-031-backend-internationalization-foundation.md, docs/exec-plans/active/index.md, docs/exec-plans/completed/index.md, harness/feature_index.json, harness/features/feat-031.json, harness/progress.md
- Blockers: none
- Next steps: start `feat-032` for frontend locale wiring, then resume `feat-008` on top of the new backend locale foundation.

## 2026-04-22 — Created ExecPlan for feat-031 backend i18n foundation
- Who: Codex
- Summary: Drafted the active ExecPlan for `feat-031` after reviewing the worker message surface, backend standards, and harness state. The plan scopes the feature to backend-only locale resolution and Vietnamese error/validation copy with hard fallback to `vi`, without changing API codes or adding dependencies.
- Files changed: docs/exec-plans/active/2026-04-22-feat-031-backend-internationalization-foundation.md, docs/exec-plans/active/index.md, harness/progress.md
- Blockers: none
- Next steps: implement `feat-031` first, then continue with `feat-032` and resume `feat-008` on top of the new backend i18n foundation.

## 2026-04-22 — Reordered i18n features ahead of feat-008
- Who: Codex
- Summary: Updated harness sequencing so the new backend/frontend internationalization foundations are explicitly scheduled before `feat-008`. The feature index now lists `feat-031` and `feat-032` before auth backend work, `feat-008` now depends on both, and the active auth ExecPlan notes the new prerequisite order.
- Files changed: harness/feature_index.json, harness/features/feat-008.json, docs/exec-plans/active/2026-04-22-feat-008-authentication-backend-session-exchange.md, harness/progress.md
- Blockers: none
- Next steps: create the next ExecPlan for `feat-031` or `feat-032` before resuming `feat-008`.

## 2026-04-22 — Added i18n foundation features to harness backlog
- Who: Codex
- Summary: Added two new pending features to the harness backlog for internationalization groundwork before auth implementation: one for backend locale resolution and one for frontend locale wiring. Both are explicitly scoped to Vietnamese-only behavior for now with fallback pinned to `vi`.
- Files changed: harness/feature_index.json, harness/features/feat-031.json, harness/features/feat-032.json, harness/progress.md
- Blockers: none
- Next steps: decide whether `feat-031` or `feat-032` should be planned first, then create an ExecPlan before implementation.

## 2026-04-22 — Created ExecPlan for feat-008 backend auth completion
- Who: Codex
- Summary: Drafted the active ExecPlan for `feat-008` after reviewing the auth product spec, worker auth/session code, harness state, and backend reference docs. The plan captures the current partial implementation baseline and narrows the remaining backend scope to logout/session revocation, acceptance coverage, and harness closure.
- Files changed: docs/exec-plans/active/2026-04-22-feat-008-authentication-backend-session-exchange.md, docs/exec-plans/active/index.md, harness/progress.md
- Blockers: none
- Next steps: implement the plan in `feat-008`, keeping exchange/refresh stable while adding logout/session revocation and final verification evidence.

## 2026-04-22 — Added canonical backend folder-structure reference
- Who: Codex
- Summary: Added a backend companion to the frontend folder-structure reference so routes/handlers/repositories/contracts/types/lib/auth placement rules are documented in one canonical backend doc, then linked it from `docs/references/index.md` and `docs/BACKEND.md`.
- Files changed: docs/references/backend/project-folder-structure.md, docs/references/index.md, docs/BACKEND.md, harness/progress.md
- Blockers: none
- Next steps: keep future backend folder moves aligned with this reference and update it when a new canonical backend namespace is introduced.

## 2026-04-22 — Refactored worker auth/session structure for clearer boundaries
- Who: Codex
- Summary: Split `apps/worker` transport contracts out of the old `src/dto` bucket into `src/contracts`, moved runtime-only app/auth types into `src/types`, moved Firebase/JWT/security code into `src/lib/auth`, simplified shared ID helper placement, changed refresh-session rotation to a transactional D1 batch flow, added rollback/not-found regression coverage, and documented the source layout in the worker README.
- Files changed: apps/worker/src/contracts/auth.ts, apps/worker/src/contracts/profile.ts, apps/worker/src/contracts/index.ts, apps/worker/src/types/app.ts, apps/worker/src/types/auth.ts, apps/worker/src/types/index.ts, apps/worker/src/lib/auth/firebase.ts, apps/worker/src/lib/auth/jwt.ts, apps/worker/src/lib/auth/security.ts, apps/worker/src/utils/id.ts, apps/worker/src/db/repositories/session-repository.ts, apps/worker/src/db/repositories/user-repository.ts, apps/worker/src/handlers/auth/exchange-provider-token.ts, apps/worker/src/handlers/auth/refresh-session.ts, apps/worker/src/handlers/profile/get-current-profile.ts, apps/worker/src/handlers/profile/update-current-profile.ts, apps/worker/src/index.ts, apps/worker/src/lib/env.ts, apps/worker/src/lib/response.ts, apps/worker/src/middlewares/auth.ts, apps/worker/src/middlewares/request-context.ts, apps/worker/src/routes/auth.ts, apps/worker/src/routes/health.ts, apps/worker/src/routes/profile.ts, apps/worker/src/routes/protected.ts, apps/worker/test/unit/dto-auth.spec.ts, apps/worker/test/unit/dto-profile.spec.ts, apps/worker/test/unit/firebase.spec.ts, apps/worker/test/unit/jwt.spec.ts, apps/worker/test/unit/response.spec.ts, apps/worker/test/unit/session-repository.spec.ts, apps/worker/test/unit/user-repository.spec.ts, apps/worker/README.md, harness/features/feat-008.json, harness/progress.md
- Blockers: GitNexus CLI in this session exposes `impact`, `query`, and `context`, but not the `detect_changes` command referenced in repo guidance, so pre-commit graph diff verification could not be run from the available tool surface.
- Next steps: keep auth work under `feat-008`, add logout/session revocation endpoints on top of the new structure, and continue moving future worker domains into the same contracts/types/lib-auth boundary pattern.

## 2026-04-22 — Implemented feat-007 D1 schema and local migration workflow
- Who: Codex
- Summary: Replaced the legacy worker `0001_init.sql` schema with a product-aligned household-finance baseline, swapped the old family/rewards integrity tests for household/expense/budget/audit constraints, added deterministic test fixtures and a local SQL seed workflow, and verified the feature with worker tests, local Wrangler migrate/seed/query commands, and full `./init.sh`.
- Files changed: apps/worker/migrations/0001_init.sql, apps/worker/test/index.spec.ts, apps/worker/test/helpers/household-fixtures.ts, apps/worker/seeds/local/dev.sql, apps/worker/package.json, apps/worker/README.md, docs/exec-plans/completed/2026-04-22-feat-007-database-schema-local-migrations.md, docs/exec-plans/completed/index.md, harness/features/feat-007.json, harness/feature_index.json, harness/progress.md
- Blockers: Local Wrangler D1 commands must be run sequentially; running migrate, seed, and query in parallel against `.wrangler/state/v3/d1` caused a transient `SQLITE_READONLY` failure during verification.
- Next steps: Use this schema baseline for the next worker-backed features (`feat-008`, `feat-011`, `feat-016`, `feat-017`) and add new migrations rather than rewriting `0001`.

## 2026-04-22 — Moved profile orchestration behind worker handlers
- Who: Codex
- Summary: Refactored the worker profile route to follow the backend route -> handler -> data-access boundary by introducing dedicated profile handlers and keeping the route focused on middleware, validation, and response wiring.
- Files changed: apps/worker/src/routes/profile.ts, apps/worker/src/handlers/profile/get-current-profile.ts, apps/worker/src/handlers/profile/update-current-profile.ts, harness/progress.md
- Blockers: Full `./init.sh` is still blocked by the unrelated web test failure in `apps/web/src/app.test.tsx` (`localStorage.getItem is not a function`).
- Next steps: run worker verification and keep future worker endpoints on the same handler-first boundary.

## 2026-04-22 — Revalidated feat-006 worker foundation implementation
- Who: Codex
- Summary: Re-checked the worker service foundation against the completed ExecPlan, confirmed the runtime/auth/validation/test surfaces are still implemented, and aligned `apps/worker/README.md` with the current `docs/references/*` backend standards.
- Files changed: apps/worker/README.md, harness/progress.md
- Blockers: Full `./init.sh` remains blocked by the unrelated web test failure in `apps/web/src/app.test.tsx` (`localStorage.getItem is not a function`).
- Next steps: keep feat-006 closed unless worker behavior regresses; handle the web test failure under the next appropriate frontend or maintenance task.

## 2026-04-22 — Rewrote feat-006 completed plan into full ExecPlan
- Who: Codex
- Summary: Reviewed the completed `feat-006` worker foundation plan against the repo ExecPlan requirements, rewrote it as a self-contained completed ExecPlan with scope, standards, validation, and recovery details, and re-ran `./init.sh` to capture current baseline drift.
- Files changed: docs/exec-plans/completed/2026-04-22-feat-006-worker-service-foundation.md, harness/progress.md
- Blockers: `./init.sh` currently fails outside feat-006 because `apps/web/src/app.test.tsx` hits `localStorage.getItem is not a function` in the theme-provider test path.
- Next steps: keep `feat-006` closed; address the unrelated web test regression in the next appropriate frontend/session feature or maintenance task.

## 2026-04-22 — Implemented feat-006 worker service foundation
- Who: Codex
- Summary: Hardened the `apps/worker` foundation by extracting shared JSON-body validation, moving auth user lookup behind a repository helper, aligning worker naming/config with Household Finance, and adding coverage for request-id propagation, 404s, and generic internal-error mapping.
- Files changed: apps/worker/src/lib/validation.ts, apps/worker/src/db/repositories/user-repository.ts, apps/worker/src/middlewares/auth.ts, apps/worker/src/routes/auth.ts, apps/worker/src/routes/profile.ts, apps/worker/src/routes/health.ts, apps/worker/test/index.spec.ts, apps/worker/test/unit/response.spec.ts, apps/worker/test/unit/env.spec.ts, apps/worker/test/unit/firebase.spec.ts, apps/worker/test/unit/jwt.spec.ts, apps/worker/package.json, apps/worker/wrangler.jsonc, apps/worker/.dev.vars.example, apps/worker/README.md, apps/worker/vitest.config.mts, docs/exec-plans/completed/2026-04-22-feat-006-worker-service-foundation.md, docs/exec-plans/completed/index.md, harness/features/feat-006.json, harness/feature_index.json
- Blockers: none
- Next steps: move on to feat-007 database schema and local migrations, using the cleaned worker foundation as the base.

## 2026-04-22 — Implemented feat-005 auth-state zustand migration
- Who: Codex
- Summary: Replaced the shell-auth context with a zustand store, rewired the shell guard and auth pages to use store-backed auth state and return-to handling, added store tests, and revalidated the web app with test, lint, typecheck, and build.
- Files changed: apps/web/src/stores/auth.store.ts, apps/web/src/stores/auth.store.test.tsx, apps/web/src/stores/types.ts, apps/web/src/router.tsx, apps/web/src/components/layouts/shell-guard.tsx, apps/web/src/pages/auth/sign-in-page.tsx, apps/web/src/pages/auth/sign-up-page.tsx, apps/web/src/pages/app/overview-page.tsx, apps/web/src/app.test.tsx
- Blockers: none
- Next steps: continue with the next auth/session plan items, especially the real token-backed frontend session flow from feat-009.

## 2026-04-22 — Reactivated feat-005 plan for zustand auth state follow-on
- Who: Codex
- Summary: Restored feat-005 as an active execution plan, extended it with the auth-state zustand migration and downstream auth shell follow-on items, and linked it from the active plans index.
- Files changed: docs/exec-plans/active/2026-04-21-feat-005-web-app-shell-ui-foundation.md, docs/exec-plans/active/index.md
- Blockers: none
- Next steps: implement the auth-state zustand store, rewire shell guard and auth pages to it, and add store-level tests before re-validating the web shell.

## 2026-04-21 — Completed feat-005 web app shell and UI foundation
- Who: Codex
- Summary: Replaced the starter web app with a React Router shell, public sign-in/sign-up routes, a protected app scaffold with onboarding and placeholder feature routes, local-theme toast integration, and UI test coverage for redirects and shell behavior.
- Files changed: apps/web/package.json, apps/web/vite.config.ts, apps/web/src/app.tsx, apps/web/src/app.test.tsx, apps/web/src/components/ui/sonner.tsx, apps/web/src/index.css, apps/web/src/main.tsx, apps/web/src/router.tsx, apps/web/src/test/setup.ts, harness/feature_index.json, harness/features/feat-005.json, docs/exec-plans/active/2026-04-21-feat-005-web-app-shell-ui-foundation.md, docs/exec-plans/active/index.md
- Blockers: None after fixing Vitest config typing and lint formatting.
- Next steps: Update downstream auth and onboarding features to mount into the new shell routes.

## 2026-04-21 — Removed shared tsconfig base from feat-004
- Who: Codex
- Summary: Reverted the shared TypeScript base and restored app-owned compiler settings so each app keeps its own config without inheritance from a shared root file.
- Files changed: apps/web/tsconfig.app.json, apps/web/tsconfig.node.json, apps/worker/tsconfig.json, docs/exec-plans/completed/2026-04-21-feat-004-workspace-toolchain-foundation.md, harness/features/feat-004.json
- Blockers: None.
- Next steps: Re-run workspace verification to confirm the app-local configs still pass from the root scripts.

## 2026-04-21 — Completed feat-004 workspace/toolchain foundation
- Who: Codex
- Summary: Added a shared TypeScript base config, added root `test` and `build` orchestration, kept app dependencies local, and aligned `init.sh` with the canonical root scripts.
- Files changed: package.json, init.sh, apps/web/tsconfig.json, apps/web/tsconfig.app.json, apps/web/tsconfig.node.json, apps/worker/tsconfig.json, docs/exec-plans/completed/2026-04-21-feat-004-workspace-toolchain-foundation.md, harness/feature_index.json, harness/features/feat-004.json
- Blockers: None after rerunning verification with elevated repo-root access.
- Next steps: Move to the next pending feature or tighten shared ESLint/Prettier/Vitest surfaces if a future feature needs them.

## 2026-04-21 — Rebalanced MVP feature breakdown
- Who: Codex
- Summary: Reworked the pending MVP backlog from coarse mini-epics into smaller feature-sized slices that still match the product roadmap. Split oversized areas such as auth, household, quick-add, budget, analytics, and grouping into execution-friendly features without going all the way down to subtask level.
- Files changed: harness/feature_index.json, harness/features/feat-004.json through feat-030.json
- Blockers: Full `./init.sh` verification could not complete in sandbox because `pnpm install` could not reach the npm registry (`ENOTFOUND`).
- Next steps: Pick one pending feature at a time, then create a focused execution plan for that feature before implementation.

## 2026-04-21 — Feature backlog decomposition (feat-004 → feat-020)
- Who: human + Antigravity
- Summary: Analyzed product specs (docs/product-specs/) and PRODUCT.md to break the MVP into 17 granular feature records spanning foundation, auth, household, expense domain, budget, analytics, and onboarding. All records added to harness/features/ and feature_index.json updated.
- Files changed: harness/feature_index.json, harness/features/feat-004.json through feat-020.json
- Blockers: none
- Next steps: start with feat-004 (project foundation & monorepo setup), then proceed in dependency order.

---

## 2026-04-21 — CI scope script trigger alignment
- Who: automation
- Summary: Added the CI scope helper script to the verify workflow trigger and shared-scope detection so changes to the detector itself also run verification.
- Files changed: .github/workflows/verify-code.yml, scripts/detect_ci_scope.sh, harness/features/feat-003.json
- Blockers: none
- Next steps: keep the scope helper aligned with the lockfile importer layout.

---

## 2026-04-21 — Lockfile importer-aware CI scope
- Who: automation
- Summary: Replaced the generic shared lockfile trigger with git-diff scope detection so pnpm-lock changes can be attributed to web or worker importer sections instead of always running both.
- Files changed: .github/workflows/verify-code.yml, scripts/detect_ci_scope.sh, harness/features/feat-003.json
- Blockers: none
- Next steps: keep the importer detection aligned with the pnpm lockfile format if the monorepo layout changes.

---

## 2026-04-21 — CI trigger and install simplification
- Who: automation
- Summary: Restricted verify and harness-size workflows to relevant file paths, switched verify to a single full workspace install, and used the existing root scripts for app checks.
- Files changed: .github/workflows/verify-code.yml, .github/workflows/harness-size-check.yml, harness/features/feat-003.json
- Blockers: none
- Next steps: keep any new shared config files in the workflow path filters intentionally.

---

## 2026-04-21 — GitHub verify single-job optimization
- Who: automation
- Summary: Consolidated the PR verify flow into a single job so shared setup and dependency installation happen once, while still running only the affected web and/or worker checks.
- Files changed: .github/workflows/verify-code.yml, harness/features/feat-003.json
- Blockers: none
- Next steps: keep adding any new truly shared config files to the shared change filter intentionally.

---

## 2026-04-21 — GitHub verify scoping
- Who: automation
- Summary: Narrowed the PR verify workflow so web changes only run web checks, worker changes only run worker checks, and shared root workflow/package changes trigger both. Each job now installs and runs only its own workspace package scope.
- Files changed: .github/workflows/verify-code.yml, harness/feature_index.json, harness/features/feat-003.json
- Blockers: none
- Next steps: run repository verification if needed; otherwise keep this workflow pattern for future CI changes.

---

## 2026-04-21 — Harness contract standardization
- Who: automation
- Summary: Standardized the repository on `harness/` as the canonical state surface and aligned docs, scripts, and handoff workflow.
- Files changed: AGENTS.md, README.md, docs/knowledge/codex-exec-plan.md, docs/knowledge/harness-engineering.md, docs/exec-plans/__plan-template__.md, init.sh, scripts/rotate_progress.sh, scripts/check_harness_size.sh, harness/feature_index.json, harness/features/feat-001.json, harness/features/feat-002.json, harness/session-handoff.md
- Blockers: `./init.sh` still needs network access for `pnpm install`; sandboxed verification without network will fail at dependency install.
- Next steps: keep new feature records in `harness/features/*.json`; use `harness/session-handoff.md` only for unfinished sessions.

---

## 2026-04-21 — Harness verification
- Who: automation
- Summary: Ran `./init.sh` to verify installs, lint, typechecks, tests, and build. All verification steps completed successfully.
- Files changed: harness/features/feat-harness-001.json (feat-harness-001 marked done)
- Blockers: none
- Next steps: keep updating `harness/feature_index.json` and `harness/progress.md` during active work.

---

## 2026-04-21 — Bootstrap harness
- Who: automation
- Summary: Created initial harness artifacts required by `AGENTS.md`.
- Files added: harness/features/feat-harness-001.json, harness/feature_index.json
- Blockers: none
- Next steps: populate `harness/features/*.json` with active features and update during sessions; run `./init.sh` to verify repository checks.

Note: progress logs are now rotated by `scripts/rotate_progress.sh` into `harness/progress/archive/`.
Keep `harness/progress.md` as a short index with newest entries first to avoid large file growth.


## Template for future entries
- Date: YYYY-MM-DD
- Who: <name>
- Summary: <short summary>
- Files changed: <list>
- Blockers: <list or none>
- Next steps: <next actions>
