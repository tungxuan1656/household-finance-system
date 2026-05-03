# feat-019 — Expense update, delete & restore lifecycle

## Purpose / Big Picture

Implement the next stage of the expense lifecycle after create and read: authenticated users can update mutable expense fields, soft-delete expenses they are allowed to control, and household admins can restore soft-deleted shared expenses from a trash-oriented admin flow. Users will observe this working through a pre-filled edit screen, a delete confirmation flow, and an admin-only restore path, while the backend records immutable audit entries and keeps downstream expense feeds and derived analytics consistent with the changed state.

This plan intentionally centers the explicitly scoped behavior in `harness/features/feat-019.json`: edit, soft-delete, and restore. Permanent delete after retention is not expanded into this plan silently; it remains an open product decision because the product spec mentions it but the harness feature definition does not.

## Scope

- Planned backend areas:
  - `apps/worker/src/contracts/expense.ts`
  - `apps/worker/src/db/repositories/expense-repository.ts`
  - `apps/worker/src/db/repositories/audit-log-repository.ts` (reuse only, unless payload helper extraction proves necessary)
  - `apps/worker/src/handlers/expenses/update-expense.ts` (new)
  - `apps/worker/src/handlers/expenses/delete-expense.ts` (new)
  - `apps/worker/src/handlers/expenses/restore-expense.ts` (new)
  - `apps/worker/src/handlers/expenses/list-deleted-expenses.ts` (new, if trash view needs a dedicated admin query)
  - `apps/worker/src/routes/expenses.ts`
  - `apps/worker/src/lib/permissions/household-policy.ts`
  - `apps/worker/test/integration/expenses-*.spec.ts`
  - `apps/worker/test/unit/dto-expense-*.spec.ts`
  - `apps/worker/migrations/*` only if retention-window support, restore lookup performance, or admin-trash query performance requires schema/index work.
- Planned frontend areas:
  - `apps/web/src/types/expense.ts`
  - `apps/web/src/api/endpoints.ts`
  - `apps/web/src/api/expense.ts`
  - `apps/web/src/hooks/api/use-expense.ts`
  - `apps/web/src/lib/forms/expense.schema.ts` and/or feature-local edit/delete form helpers
  - `apps/web/src/components/expense/*`
  - `apps/web/src/views/app/expense-detail-page.tsx`
  - `apps/web/src/views/app/edit-expense-page.tsx` (new)
  - `apps/web/src/views/app/expense-trash-page.tsx` (new, if separate admin restore screen is required)
  - `apps/web/src/app/(protected)/expenses/[id]/edit/page.tsx` (new)
  - `apps/web/src/app/(protected)/expenses/trash/page.tsx` (new, if trash view is separate)
  - `apps/web/src/lib/constants/paths.ts`
  - `apps/web/src/lib/i18n/locales/vi.json`
  - web tests covering edit, delete confirmation, and restore affordances.
- Shared contract and behavior scope:
  - request/response types for update, soft-delete, restore, and any deleted-expense list payload.
  - audit payload shape for immutable change records.
  - visibility, ownership, and admin-only restore behavior.
- Harness/documentation continuity scope:
  - `docs/exec-plans/index.md`
  - `harness/feature_index.json`
  - `harness/features/feat-019.json`
  - `harness/progress.md`

Out of scope for this plan:

- Permanent delete endpoint or UI, even though `docs/product-specs/expense-management.md` mentions it.
- General expense search/filter work from `feat-021` beyond the minimum admin-trash retrieval needed to restore deleted expenses.
- New budget/analytics feature surfaces; only consistency of existing derived aggregates is in scope.
- Reworking expense creation flow beyond extracting shared form pieces that are directly necessary to support edit mode.
- Household-wide payer directory or creator-transfer flows.
- Any speculative version-history UI beyond the required immutable audit write on backend.

## Non-negotiable Requirements

- The plan must remain self-contained and executable without hidden assumptions.
- The implementation must produce observable proof through automated tests and feature-level verification steps.
- All request params, query params, and JSON bodies for new expense lifecycle routes must be validated explicitly.
- Authorization must be enforced for update, delete, deleted-list access, and restore flows.
- Audit log writes for edit/delete/restore are mandatory for successful state changes.
- Normal expense feeds and detail queries must continue excluding soft-deleted rows unless an explicit admin trash path is used.
- Frontend changes must follow orchestrator-first page composition and split oversized feature components rather than growing `apps/web/src/components/expense/expense-form.tsx` further.

## Progress

- [x] 2026-05-03 10:15 UTC — Review required docs, harness state, related feature records, and existing expense implementation paths. Owner: Orchestrator.
- [x] 2026-05-03 10:35 UTC — Lock conservative planning scope around edit + soft-delete + admin restore; carry permanent delete as open decision instead of silent scope expansion. Owner: Orchestrator.
- [ ] Create the worker contract and repository execution checklist for update/delete/restore/trash flows. Owner: Implementation session.
- [ ] Create the web edit/detail/trash UI execution checklist with component split points and i18n requirements. Owner: Implementation session.
- [ ] Execute backend-first tests and implementation for lifecycle routes, permissions, audit writes, and deleted-row handling. Owner: Implementation session.
- [ ] Execute frontend edit/delete/restore flows using typed APIs and React Query invalidation. Owner: Implementation session.
- [ ] Run verification (`./init.sh` plus focused expense tests) and record evidence in harness artifacts before marking `feat-019` done. Owner: Implementation session.

## Surprises & Discoveries

- GitNexus is referenced as mandatory in `AGENTS.md`, but the current environment does not have this repository indexed. Attempts to query repo `household-finance-system` failed with repo-not-found while other unrelated repos were listed. Treat this as an environment limitation, not a reason to skip architecture discipline.
- `apps/web/src/components/expense/expense-form.tsx` is already 359 lines, above the frontend early-split guideline; edit-mode support should trigger decomposition rather than extension-in-place.
- `findExpenseByIdRaw` already excludes `deleted_at IS NULL`, which is correct for normal reads but insufficient for admin restore and trash flows; those paths need an explicit repository method that can fetch soft-deleted rows intentionally.
- The product spec mentions concurrent edit conflict behavior, but current discovery did not find versioning or optimistic concurrency primitives in the existing expense flow.

## Decision Log

- Decision: Plan `feat-019` as a fullstack feature with backend-first execution.
  Rationale: The harness feature definition and discovered code paths span worker contracts/routes/repositories and web pages/hooks/components.
  Date/Author: 2026-05-03 / Orchestrator.

- Decision: Keep permanent delete outside the implementation plan and record it as an open decision.
  Rationale: `docs/product-specs/expense-management.md` mentions permanent delete after retention, but `harness/features/feat-019.json` explicitly scopes only edit, soft-delete, and admin restore. The harness definition is treated as the operative implementation boundary for this session.
  Date/Author: 2026-05-03 / Orchestrator.

- Decision: Prefer dedicated worker handlers for update, delete, restore, and deleted-list behavior instead of combining lifecycle branches in one large module.
  Rationale: Matches `docs/references/backend/architecture-and-boundaries.md` and keeps route -> handler -> repository ownership explicit.
  Date/Author: 2026-05-03 / Orchestrator.

- Decision: Split form behavior into feature-bounded expense form pieces if edit mode would otherwise enlarge the current create form.
  Rationale: `docs/FRONTEND.md` and component-structure references require early decomposition once files exceed ~200 lines or mix multiple concerns.
  Date/Author: 2026-05-03 / Orchestrator.

## Outcomes & Retrospective

- Pending implementation.
- Expected outcome: `feat-019` closes the expense lifecycle gap between create/read and future search/analytics work by making existing expenses manageable without violating visibility, ownership, or audit rules.
- Revisit after implementation to capture whether a follow-up feature is needed for permanent deletion, conflict detection, or richer admin-trash filtering.

## Context and Orientation

- Feature source of truth:
  - `harness/features/feat-019.json` — authoritative scoped description for edit, soft-delete, restore, audit, and permissions.
  - `docs/product-specs/expense-management.md` — lifecycle behavior, acceptance targets, and the permanent-delete ambiguity.
  - `docs/product-specs/audit-log.md` — immutable audit requirements.
  - `docs/product-specs/data-visibility.md` — private vs household visibility rules.
  - `docs/product-specs/expense-ownership.md` — creator/payer semantics and permission expectations.
- Existing backend implementation baseline:
  - `apps/worker/src/routes/expenses.ts` — currently registers create/list/detail only.
  - `apps/worker/src/contracts/expense.ts` — current DTOs and create/list/detail schemas.
  - `apps/worker/src/db/repositories/expense-repository.ts` — create/list/raw-detail queries; normal reads already exclude deleted rows.
  - `apps/worker/src/handlers/expenses/create-expense.ts` — orchestration precedent for validation, permission, mapping, and persistence.
  - `apps/worker/src/handlers/expenses/get-expense.ts` and `list-expenses.ts` — visibility enforcement and list/detail patterns.
  - `apps/worker/src/db/repositories/audit-log-repository.ts` — existing immutable audit write boundary.
  - `apps/worker/src/lib/permissions/household-policy.ts` — create/edit/view policies; delete/restore helpers may need addition.
- Existing frontend implementation baseline:
  - `apps/web/src/views/app/add-expense-page.tsx` — current create-page orchestration.
  - `apps/web/src/components/expense/expense-form.tsx` — create-focused expense form that likely needs decomposition for edit mode.
  - `apps/web/src/views/app/expense-detail-page.tsx` and `apps/web/src/components/expense/expense-detail-card.tsx` — current detail display and the natural insertion point for edit/delete affordances.
  - `apps/web/src/api/expense.ts`, `apps/web/src/hooks/api/use-expense.ts`, `apps/web/src/types/expense.ts`, `apps/web/src/api/endpoints.ts` — typed transport and cache layers that must grow to cover lifecycle mutations.
  - `apps/web/src/lib/i18n/locales/vi.json` — all new user-facing copy must be added here instead of hardcoded.
- Related precedent plans:
  - `docs/exec-plans/plans/2026-04-30-feat-017-expense-entry-create-flow.md` — create-flow contract and file pattern precedent.
  - `docs/exec-plans/plans/2026-05-02-feat-018-expense-detail-activity-feed.md` — read-flow contract and expense route/query precedent.

## Standards and Implementation Notes

### Required references for implementation

- Frontend:
  - `docs/FRONTEND.md`
  - `docs/references/frontend/project-folder-structure.md`
  - `docs/references/frontend/component-structure-pattern.md`
  - `docs/references/frontend/naming-and-conventions-pattern.md`
  - `docs/references/frontend/form-pattern.md`
  - `docs/references/frontend/dialog-and-form-pattern.md`
  - `docs/references/frontend/api-react-query-pattern.md`
  - `docs/references/frontend/i18n-label-pattern.md`
  - `docs/design-docs/shadcn-first-ui-web-guide.md`
  - `.agents/skills/shadcn/SKILL.md`
  - `.agents/skills/shadcn/rules/styling.md`
  - `.agents/skills/shadcn/rules/forms.md`
  - `.agents/skills/shadcn/rules/composition.md`
- Backend:
  - `docs/BACKEND.md`
  - `docs/references/backend/architecture-and-boundaries.md`
  - `docs/references/backend/api-contract-and-validation.md`
  - `docs/references/backend/error-handling-pattern.md`
  - `docs/references/backend/security-and-auth-pattern.md`
  - `docs/references/backend/testing-pattern.md`
  - `docs/references/backend/database-pattern.md`
  - `docs/references/backend/cloudflare-workers.md`
- Shared:
  - `docs/references/shared/type-naming-pattern.md`

### Concrete coding constraints

- Keep the layer model `Types -> Config -> Repo -> Service -> Runtime -> UI` intact; UI must only consume typed runtime/API contracts, and repositories must remain the only place with SQL.
- New request/response types must use `Request`, `Response`, and `DTO` suffix conventions.
- Use camelCase in API payloads and snake_case in D1 columns; keep mapping explicit.
- Use explicit 4xx/5xx status mapping: validation `400`, unauthenticated `401`, forbidden `403`, missing expense `404`, conflict `409` if a conflict path is introduced.
- Validate category edits against the global static catalog and reject non-expense kinds.
- Enforce ownership for private expenses and role-based control for shared/admin flows.
- No hardcoded UI copy; add translation keys and use existing i18n patterns.
- Use React Query hooks for UI data access; mutate via hooks and invalidate detail/list/trash queries deliberately.
- Add/update regression tests for every new destructive or authorization-sensitive path.

### Companion skills for implementation

- `tdd-workflow` — implement lifecycle behavior with tests-first discipline.
- `security-review` — review authorization, ownership, and user-input handling.
- `documentation-lookup` — retrieve up-to-date Cloudflare Workers docs if D1/runtime details or limits matter.
- `frontend-patterns` — keep edit/detail/trash UI architecture aligned with current React/Next patterns.
- `backend-patterns` — keep route/handler/repository responsibilities clean.
- `verification-loop` — verify focused checks continuously before final completion.

### Common pitfalls to avoid

- Do not reuse normal `findExpenseByIdRaw` for restore logic if it still hides deleted rows.
- Do not let soft-deleted expenses leak back into normal feed/detail queries.
- Do not expand the existing create form into a single monolith with edit, delete, and trash behavior mixed together.
- Do not invent new household/category data models; stay on the current static catalog and existing membership policy foundation.

## Plan of Work (Narrative)

1. **Lock the lifecycle contract in worker types and schemas.** Extend `apps/worker/src/contracts/expense.ts` with update request validation, restore/delete response shapes, and any deleted-expense list contract needed by the web trash view. Mirror those contract additions in `apps/web/src/types/expense.ts` so transport stays aligned. If the existing detail DTO already contains enough fields for edit prefill, reuse it rather than creating a second near-duplicate response.

2. **Add repository primitives for intentional deleted-row handling.** Update `apps/worker/src/db/repositories/expense-repository.ts` with focused helpers for: loading an expense for update/delete with permission-relevant fields; updating mutable fields and timestamps; soft-deleting by setting `deleted_at`; restoring by clearing `deleted_at`; and listing deleted expenses for an admin-scoped trash view. Keep SQL centralized, parameterized, and explicit. If restore or trash queries need index support, add a targeted migration and document rollback expectations.

3. **Implement backend handlers with explicit authorization and audit writes.** Create dedicated handlers under `apps/worker/src/handlers/expenses/` for update, delete, restore, and optionally deleted-list retrieval. Each handler should validate input, load the target expense through the correct repository path, enforce ownership/admin rules, apply visibility-specific household membership checks, call `createAuditLogEntry` with immutable change payloads, and return typed API responses. Audit write failure must block the state change from being treated as successful. If concurrent-edit conflict is not implementable without new data primitives, document that limitation in tests/notes and keep the route behavior deterministic.

4. **Register new routes without breaking existing create/read behavior.** Extend `apps/worker/src/routes/expenses.ts` with authenticated lifecycle routes under the existing `/expenses` group: `PATCH /expenses/:id`, `DELETE /expenses/:id`, `POST /expenses/:id/restore`, and, if needed for web restore UX, an admin-only deleted-expense listing route such as `GET /expenses/deleted` or equivalent. Keep route files limited to middleware and handler wiring.

5. **Add backend verification coverage before web wiring.** Extend or add worker integration specs to cover: successful owner edit, admin edit of shared expense, validation failure for invalid category/visibility, forbidden edit/delete on another user's private expense, successful soft-delete hiding records from normal list/detail, admin-only restore, restore failure outside retention policy if retention is encoded, and audit-log side effects. Add narrow unit tests for new DTO/schema mappings where current test patterns already exist.

6. **Refactor the web expense form boundary before adding edit behavior.** Split `apps/web/src/components/expense/expense-form.tsx` into smaller feature components or shared presentational pieces so create and edit can share field UI without one file owning route orchestration, mutation logic, dialog state, and defaults simultaneously. The page layer should remain an orchestrator; mutation wiring should live in feature-scoped smart components.

7. **Add typed web transport and cache behavior for lifecycle actions.** Extend `apps/web/src/api/endpoints.ts`, `apps/web/src/api/expense.ts`, and `apps/web/src/hooks/api/use-expense.ts` with update/delete/restore operations and a deleted-expense query if required. Cache invalidation must refresh expense detail, feed lists, and trash data coherently after each mutation.

8. **Deliver the user-facing flows.** Add `apps/web/src/views/app/edit-expense-page.tsx` and route it from `apps/web/src/app/(protected)/expenses/[id]/edit/page.tsx`; prefill values from expense detail or a dedicated query and submit through the update mutation. Extend `apps/web/src/views/app/expense-detail-page.tsx` with edit and delete affordances that respect authorization states. Add a confirmation dialog using the documented shadcn dialog/form pattern. If restore requires a separate admin trash page, add `apps/web/src/views/app/expense-trash-page.tsx` plus the protected route and path constants.

9. **Localize and test the UI flows.** Add all new copy to `apps/web/src/lib/i18n/locales/vi.json`. Add tests for edit-page rendering/prefill, delete confirmation behavior, authorization-gated actions, and restore affordances/query invalidation where existing testing patterns make this practical.

10. **Finish with full verification and harness evidence.** Run focused expense tests during iteration, then `./init.sh` from repo root. Update `harness/features/feat-019.json` with implementation evidence, align `harness/feature_index.json`, move the plan entry from active to completed only after verification passes, and add a newest-first `harness/progress.md` summary with blockers and next steps.

## Concrete Steps (Commands)

Run from repo root unless noted otherwise.

```bash
# Baseline workspace verification before implementation
./init.sh

# Focused worker expense tests during backend-first implementation
pnpm --filter worker test

# Focused web tests during edit/delete/restore UI work
pnpm --filter web test

# Worker type/lint loop if needed during API changes
pnpm --filter worker lint
pnpm --filter worker typecheck

# Web type/lint loop if needed during UI changes
pnpm --filter web lint
pnpm --filter web typecheck

# Final full verification
./init.sh
```

Expected short outputs to compare against:

- `./init.sh` ends with workspace lint, type-check, tests, and web build succeeding.
- `pnpm --filter worker test` reports worker specs passing with `0 failed`, including the new expense lifecycle coverage.
- `pnpm --filter web test` reports web specs passing with `0 failed`, including the new expense edit/delete/restore coverage.
- Lint/typecheck commands exit successfully with no errors.

## Validation and Acceptance

### Happy-path acceptance

- Update an owned expense via `PATCH /api/v1/expenses/:id` and verify:
  - HTTP success response.
  - mutable fields are updated.
  - `updatedAt` changes.
  - a matching immutable audit entry is written with actor, changed fields, and old/new values.
- Soft-delete an allowed expense via `DELETE /api/v1/expenses/:id` and verify:
  - HTTP success response.
  - the expense disappears from normal feed/detail queries.
  - the expense becomes available in the admin trash retrieval path if applicable.
  - a delete audit entry is written.
- Restore a soft-deleted expense as an admin via `POST /api/v1/expenses/:id/restore` and verify:
  - HTTP success response.
  - the expense reappears in normal detail/feed behavior.
  - a restore audit entry is written.
- Edit flow in web:
  - visiting `/expenses/[id]/edit` pre-fills the form from existing expense data.
  - save success returns the user to the correct post-submit page and refreshed detail/feed state.
- Delete flow in web:
  - expense detail exposes a delete action only when authorized.
  - confirmation dialog protects the destructive action and shows translated copy.
- Restore flow in web:
  - admin can reach the trash/restore surface and restore a deleted record with visible success feedback.

### Validation/error-path acceptance

- Invalid update request body returns `400` with consistent error envelope.
- Invalid category key or non-expense category kind returns `400`.
- Missing or non-existent expense id returns `404`.
- Unauthenticated lifecycle requests return `401`.
- Authenticated but unauthorized update/delete/restore attempts return `403`.
- If a restore retention rule is implemented, outside-window restore returns a deterministic failure status (likely `409` or `403`) and is covered by tests.
- Audit write failure blocks the destructive or mutating action from reporting success.

### Regression checks

- Existing create/list/detail flows still pass their expense tests.
- Soft-deleted expenses remain excluded from the current feed/detail implementation added in `feat-018`.
- Private expenses do not become visible to non-owners after edits that change note, payer, category, or date.
- Household aggregate-affecting edits/deletes/restores trigger the same downstream recomputation contract expected by current product specs, or the limitation is called out if the aggregate pipeline does not yet exist in code.

### Concrete acceptance artifacts to collect

- Worker integration test output naming the new lifecycle specs.
- Web test output for edit/delete/restore UI behavior.
- Final `./init.sh` transcript.
- Updated `harness/features/feat-019.json` evidence list.

## Idempotence & Recovery

- Most code-edit and test steps are safe to re-run.
- If a migration is added for deleted-row indexes or retention support, make it additive and re-runnable under the project migration workflow; document its exact filename and rollback implications in the implementation session.
- Soft-delete/restore operations are stateful by design, so integration tests should create isolated fixtures and avoid cross-test reuse.
- If the implementation pauses mid-session, update `Progress`, `Decision Log`, `Surprises & Discoveries`, and `harness/session-handoff.md` so the next session can resume cleanly.

## Artifacts and Notes

- Plan registration artifacts created in this session:
  - `docs/exec-plans/plans/2026-05-03-feat-019-expense-update-delete-restore-lifecycle.md`
  - `docs/exec-plans/index.md`
  - `harness/features/feat-019.json`
  - `harness/feature_index.json`
  - `harness/progress.md`
- Expected implementation evidence artifacts once work is complete:
  - new/updated expense worker contracts, repository helpers, handlers, and tests.
  - new/updated expense web types, APIs, hooks, components, routes, i18n keys, and tests.

## Interfaces & Dependencies

- Internal modules:
  - `apps/worker/src/contracts/expense.ts` — request/response schemas and DTO contracts.
  - `apps/worker/src/db/repositories/expense-repository.ts` — expense persistence and retrieval boundary.
  - `apps/worker/src/db/repositories/audit-log-repository.ts` — immutable audit write boundary.
  - `apps/worker/src/lib/permissions/household-policy.ts` — role/ownership policy helpers.
  - `apps/web/src/api/expense.ts` and `apps/web/src/hooks/api/use-expense.ts` — typed transport and React Query integration.
- Expected API contracts to add or extend:
  - `PATCH /api/v1/expenses/:id` with `UpdateExpenseRequest` -> typed update response (`ExpenseDTO` or dedicated `UpdateExpenseResponse`).
  - `DELETE /api/v1/expenses/:id` -> typed soft-delete response.
  - `POST /api/v1/expenses/:id/restore` -> typed restore response.
  - optional admin deleted-expense list route -> typed list response if the trash view cannot be served another way.
- External/runtime dependencies:
  - Cloudflare Workers + D1 runtime already used by the worker.
  - React Query + Next.js App Router already used by the web app.
  - shadcn UI primitives for form and dialog composition.

## Open Decisions / Blockers

- Permanent delete after retention is still unresolved at the product boundary and is intentionally excluded from this plan unless the harness feature definition changes.
- The exact retention-window value for restore eligibility is not yet locked in discovered sources.
- Concurrent edit conflict handling is mentioned in product specs but no current optimistic-locking or version token mechanism was discovered; implementation may need to defer true conflict detection unless a low-cost existing primitive appears during coding.
- If derived budget/analytics recomputation paths are not yet implemented in code, implementation must either wire the currently available aggregate hooks or record the gap explicitly before closure.
