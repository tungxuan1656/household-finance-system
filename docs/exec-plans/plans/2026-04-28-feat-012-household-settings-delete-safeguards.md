# feat-012: Household settings & delete safeguards

## Purpose / Big Picture

Implement full household settings behavior on top of existing household CRUD and permission infrastructure so admins can safely manage household metadata and delete flow without hidden global household state. After this feature, `/households/:id` acts as the practical settings page, supports updating `name`, `defaultCurrencyCode`, `timezone`, and `defaultVisibility`, and enforces a delete guard that blocks admin delete when other active members still exist.

## Scope

- In scope:
  - Worker contract + handler + repository updates for settings fields:
    - `PATCH /api/v1/households/:id`
    - `DELETE /api/v1/households/:id`
  - Admin-only delete safeguard:
    - block delete when active-member count is greater than one
    - return `409 CONFLICT` with clear error payload
  - Web household detail page upgrade to settings-centric UI for existing `/households/:id` route:
    - inline settings form fields
    - danger-zone delete action with confirmation dialog
  - Worker and web test coverage for new happy/error/guarded behavior.
  - Harness and plan artifact updates for `feat-012`.
- Out of scope:
  - New route `/households/:id/settings` (keep existing route shape).
  - Member management API/UX (`feat-013`, `feat-014`).
  - Frontend-wide permission affordance framework (`feat-015b`).
  - Household hard-delete semantics (keep recoverable archive behavior).
  - New DB migrations (columns already exist in current schema).

## Non-negotiable Requirements

- Keep explicit-household resolution and role enforcement from `feat-015a`; no global active-household assumptions.
- Keep API envelope contract unchanged (`success/data/error/meta`).
- Maintain boundary rules: route -> middleware -> handler -> repository; no SQL in routes.
- All user-facing web copy must be i18n-backed.
- UI in `apps/web` must comply with shadcn-first rules and form/composition constraints.
- Delete guard behavior must be deterministic:
  - `403` for active non-admin members (existing behavior).
  - `404` for non-members/inaccessible household.
  - `409` for admin delete blocked by remaining active members.

## Progress

- [x] (2026-04-28) Create active ExecPlan entry and keep this file in `docs/exec-plans/plans/`.
- [x] (2026-04-28) Extend household contracts and repository mapping for timezone/default visibility settings.
- [x] (2026-04-28) Implement worker-side delete safeguard with active-member counting.
- [x] (2026-04-28) Upgrade web `/households/:id` into settings-oriented page and danger-zone delete UX.
- [x] (2026-04-28) Add/adjust worker + web tests for new behavior.
- [x] (2026-04-28) Run verification path and record evidence in harness artifacts.
- [x] (2026-04-28) Move plan index entry from `Active` to `Completed` after implementation.

## Surprises & Discoveries

- Existing `households` table already contains `timezone` and `default_visibility`; this feature can ship without migration.
- Current `feat-012` harness description still mentions backend explicit delete-confirmation flag; implementation direction for this plan is UI-confirmation-only and backend state guard by active membership count.

## Decision Log

- Decision: Keep route `/households/:id` and evolve this screen into household settings instead of adding a new settings route.
  Rationale: lowest routing churn while still delivering required settings behavior.
  Date/Author: 2026-04-28 / Codex + user

- Decision: Use household-level `defaultVisibility` and validate timezone using IANA format.
  Rationale: aligns schema reality and future household-scoped visibility behavior.
  Date/Author: 2026-04-28 / Codex + user

- Decision: Keep delete confirmation at UI layer; backend delete guard focuses on household state (`active members`) and authorization.
  Rationale: requested implementation preference and keeps API simpler for current scope.
  Date/Author: 2026-04-28 / Codex + user

- Decision: Return `409 CONFLICT` when delete is blocked by remaining active members.
  Rationale: this is a resource-state conflict, not an authorization error.
  Date/Author: 2026-04-28 / Codex + user

## Open Decisions

- None blocking for implementation.

## Outcomes & Retrospective

- Implementation completed and verified with `./init.sh` plus worker-focused typecheck/test coverage.
- The only mid-session regression was enum drift on `defaultVisibility` (`shared` vs `household`), which was fixed by aligning the list handler and tests to the contract source of truth.

## Context and Orientation

- Worker household contracts/routes/handlers:
  - `apps/worker/src/contracts/household.ts`
  - `apps/worker/src/routes/households.ts`
  - `apps/worker/src/handlers/households/update-household.ts`
  - `apps/worker/src/handlers/households/archive-household.ts`
- Worker repositories/middleware/types:
  - `apps/worker/src/db/repositories/household-repository.ts`
  - `apps/worker/src/db/repositories/household-membership-repository.ts`
  - `apps/worker/src/middlewares/household-membership.ts`
- Web household domain:
  - `apps/web/src/pages/app/household-detail-page.tsx`
  - `apps/web/src/stores/household.store.ts`
  - `apps/web/src/api/household.ts`
  - `apps/web/src/types/household.ts`

## Implementation Notes

- Standards to enforce:
  - Backend:
    - `docs/references/backend/architecture-and-boundaries.md`
    - `docs/references/backend/api-contract-and-validation.md`
    - `docs/references/backend/error-handling-pattern.md`
    - `docs/references/backend/security-and-auth-pattern.md`
    - `docs/references/backend/testing-pattern.md`
    - `docs/references/backend/database-pattern.md`
    - `docs/references/backend/cloudflare-workers.md`
  - Frontend:
    - `docs/references/frontend/web/project-folder-structure.md`
    - `docs/references/frontend/web/component-structure-pattern.md`
    - `docs/references/frontend/web/naming-and-conventions-pattern.md`
    - `docs/references/frontend/web/form-pattern.md`
    - `docs/references/frontend/web/dialog-and-form-pattern.md`
    - `docs/references/frontend/web/i18n-label-pattern.md`
    - `docs/design-docs/shadcn-card-composition-architecture-guide.md`
  - Shared:
    - `docs/references/shared/type-naming-pattern.md`
- Companion skills to use during implementation:
  - `test-driven-development`
  - `security-reviewer`
  - `frontend-patterns`
  - `backend-patterns`
  - `verification-before-completion`
- Pitfalls to avoid:
  - Do not reintroduce role filtering into SQL update/delete helper logic.
  - Do not hardcode user-facing text in web settings/delete UI.
  - Do not drift API error mapping (`409` guard vs `403` authorization).

## Plan of Work (Narrative)

1. Extend worker household contract and validation:
   - add `timezone` and `defaultVisibility` to update schema and DTO mapping.
   - validate timezone with a deterministic IANA check.
2. Extend repository mapping/update behavior:
   - include `default_visibility` in read mapping.
   - include `timezone` + `default_visibility` in `UPDATE` patch query.
3. Add delete safeguard in worker handler/repository:
   - compute active membership count for household.
   - block delete when count > 1 with `conflict(...)`.
4. Upgrade web household detail page into settings surface:
   - show editable metadata fields.
   - keep delete in danger zone using confirmation dialog.
   - map API conflict errors to user-facing toast.
5. Update test coverage:
   - worker unit/integration for update validation and delete guard.
   - web store/page tests for expanded payload fields and conflict handling.
6. Update harness artifacts:
   - `harness/features/feat-012.json` evidence + status.
   - `harness/feature_index.json`.
   - `harness/progress.md`.

## Concrete Steps (Commands)

Run from repository root:

```bash
# Baseline and final full verification
./init.sh

# Worker-focused iteration checks
pnpm lint:worker
pnpm typecheck:worker
pnpm test:worker

# Web-focused iteration checks
pnpm lint:web
pnpm typecheck:web
pnpm test:web
pnpm build:web
```

Expected short outputs:

```text
Linting: OK
Type checking: OK
Running tests: OK
Init Done
```

## Validation and Acceptance

- Worker API happy paths:
  - admin can patch all settings fields and receives updated household payload.
  - admin can delete when they are the only active member and receives `{ archived: true }`.
- Worker failure paths:
  - invalid timezone/defaultVisibility -> `400 INVALID_INPUT`.
  - active non-admin member patch/delete -> `403 FORBIDDEN`.
  - non-member patch/delete -> `404 NOT_FOUND`.
  - admin delete while other active members remain -> `409 CONFLICT`.
- Web behavior:
  - `/households/:id` renders settings form with current values.
  - save sends expanded patch payload and refreshes state.
  - delete confirm dialog triggers delete only on confirm action.
  - blocked delete (`409`) shows clear failure feedback and keeps user on settings page.

## Risks and Blockers

- Timezone validation implementation can vary between runtimes; ensure Worker-compatible check and add regression test.
- Existing feature record text for `feat-012` currently conflicts with chosen API-confirmation behavior; must be reconciled in harness updates during implementation.
- Web page currently includes member placeholders; refactor should avoid accidental scope creep into member-management feature work.

## Idempotence & Recovery

- Planned commands are safe to rerun.
- No migration/data backfill in scope.
- If delete guard breaks existing archive flow, rollback path is to keep prior archive behavior while retaining explicit role middleware, then reapply guard with isolated repository test coverage.
- `./init.sh` may run `lint:fix`; verify and commit intentional formatting diffs only.

## Artifacts and Notes

- Acceptance artifact targets:
  - updated worker integration tests around household patch/delete.
  - updated web tests/store assertions for new household fields.
  - `./init.sh` success transcript.
- During implementation, update plan sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective`.

## Interfaces & Dependencies

- Public API shape changes:
  - `HouseholdDTO` includes `defaultVisibility`.
  - `UpdateHouseholdRequest` accepts `timezone` and `defaultVisibility` in addition to current fields.
  - no new endpoints.
- Internal dependencies:
  - `apps/worker` Hono routes + D1 repositories.
  - `apps/web` zustand household store + household API client + page form composition.
- External dependencies:
  - none new; reuse current monorepo stack.
