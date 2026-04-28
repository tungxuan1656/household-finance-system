# feat-015a: Backend role & permission enforcement for explicit household selection

## Purpose / Big Picture

Implement reusable worker-side household authorization so every household-scoped request resolves permissions from the explicitly targeted household instead of any global active-household state. After this feature, current household detail/update/delete routes share one consistent membership + role pipeline, active members who lack the required role receive `403 FORBIDDEN`, non-members still receive `404 NOT_FOUND`, and future household features inherit the same backend contract.

## Scope

- In scope:
  - Worker-only permission infrastructure for explicit household-scoped requests.
  - Current `GET /api/v1/households/:id`, `PATCH /api/v1/households/:id`, and `DELETE /api/v1/households/:id` integration.
  - Worker context typing, repository support, and unit/integration tests for the permission layer.
  - Harness/docs updates required to track `feat-015a`.
- Out of scope:
  - Frontend permission affordances and UI gating (`feat-015b`).
  - New invitation, membership-action, group, expense, or audit-log endpoints; those will consume this infra later.
  - Data-model changes or migrations for configurable member invite/group permissions.
  - Replacing the current recoverable delete storage implementation (`archived_at`) with hard delete semantics.
  - Renaming existing worker files whose current names still say `archive`; the user-visible contract is what changes here.

## Non-negotiable Requirements

- No global active-household assumptions and no `X-Household-Id` request contract.
- Household authorization must resolve from an explicit household id provided by the current route or handler-specific adapter.
- Status-code rules must be fail-closed and consistent:
  - `401` for unauthenticated or invalid sessions.
  - `404` when the household does not exist, is deleted, or the caller has no active membership in that household.
  - `403` when the caller is an active household member but lacks the required role or named permission.
- Keep worker boundaries clean: route -> middleware -> handler -> repository. Do not place SQL in routes or permission logic in generic helpers.
- Preserve the existing JSON response envelope and path structure; the only planned public behavior change is the `404` to `403` distinction for active members who are authenticated but not authorized.
- Do not add new runtime dependencies or environment variables for this feature.

## Progress

- [x] (2026-04-28 / Codex) Reconcile household source-of-truth docs and harness records with explicit household selection and delete terminology.
- [x] Add explicit-household membership repository support plus middleware context plumbing in `apps/worker`.
- [x] Add named household permission-policy helpers and lock default admin-only behavior for configurable member powers.
- [x] Refactor current household detail/update/delete flow to use middleware-based authorization instead of repository-embedded role checks.
- [x] Add worker unit + integration coverage for hybrid `404`/`403` behavior.
- [x] Run worker-focused verification, then full repo verification, and record evidence in harness artifacts.

## Surprises & Discoveries

- `feat-015a` and several product/harness docs still described permission resolution in terms of an "active household" even though `feat-011` already removed that runtime model.
- `feat-012` still described a future archive endpoint, but the current worker surface already exposes `DELETE /api/v1/households/:id`; the remaining work is to harden rules around that existing delete flow.
- Current admin-only household authorization is embedded in SQL helpers and returns `404` for non-admin members; `feat-015a` must deliberately move that distinction into middleware and change active-member failures to `403`.
- `./init.sh` runs `pnpm run lint:fix`, so full verification can rewrite imports/formatting beyond the immediately touched worker files.
- Running `pnpm test:worker` inside the default sandbox failed because Wrangler could not write to `~/Library/Preferences/.wrangler/logs`; rerunning with escalated permission resolved it.

## Decision Log

- Decision: Use explicit request household selection for all permission resolution.
  Rationale: The product now supports users interacting with multiple households in the same session, so a single global active-household state is invalid.
  Date/Author: 2026-04-28 / Codex

- Decision: Use hybrid `404`/`403` authorization behavior.
  Rationale: Hide inaccessible households from non-members while returning a true permission failure to active members who are authenticated but lack the needed role.
  Date/Author: 2026-04-28 / Codex

- Decision: Default configurable member powers to admin-only in MVP.
  Rationale: Product docs mention "if allowed" for invite/group actions, but the schema and settings contract for those flags do not exist yet; `feat-015a` should ship reusable infra first instead of inventing new settings semantics.
  Date/Author: 2026-04-28 / Codex

## Open Decisions

- None blocking for `feat-015a`.
- Deferred and tracked in `docs/exec-plans/tech-debt-tracker.md`: per-household settings flags for member invite/group permissions.

## Outcomes & Retrospective

- Added reusable, explicit-household authorization infrastructure in worker (`household-membership` repository + middleware + policy module) without introducing global active-household state.
- Refactored household detail/update/delete flow so role checks are middleware-driven instead of embedded in repository SQL.
- Landed the intended hybrid authorization behavior: active member lacking role -> `403 FORBIDDEN`; non-member -> `404 NOT_FOUND`.
- Verification evidence captured with passing `pnpm typecheck:worker`, `pnpm lint:worker`, `pnpm test:worker`, and `./init.sh`.

## Context and Orientation

- Worker route composition: `apps/worker/src/routes/households.ts`
- Current auth/session middleware: `apps/worker/src/middlewares/auth.ts`
- Worker context typing: `apps/worker/src/types/app.ts`
- Current household handlers: `apps/worker/src/handlers/households/get-household.ts`, `apps/worker/src/handlers/households/update-household.ts`, `apps/worker/src/handlers/households/archive-household.ts`
- Current household data access: `apps/worker/src/db/repositories/household-repository.ts`
- Worker integration tests and fixtures: `apps/worker/test/index.spec.ts`, `apps/worker/test/helpers/household-fixtures.ts`

Today, household detail/update/delete behavior is enforced partly by route auth middleware and partly by repository SQL that bakes in membership/role conditions. That shape makes future permissions harder to reuse across invitations, membership management, expenses, and groups. This plan centralizes household membership resolution into reusable middleware, stores the resolved membership on request context, and leaves repositories focused on neutral data reads/writes.

## Implementation Notes

- Required standards to enforce during implementation:
  - `docs/references/backend/architecture-and-boundaries.md`: new permission logic belongs in middleware/lib layers, not in routes or generic utils.
  - `docs/references/backend/api-contract-and-validation.md`: keep explicit param validation and do not change response envelope fields.
  - `docs/references/backend/error-handling-pattern.md`: active-member permission failures must map to `403`, missing membership to `404`.
  - `docs/references/backend/security-and-auth-pattern.md`: never trust client-supplied role data or infer household context from hidden global state.
  - `docs/references/backend/testing-pattern.md`: add happy path, forbidden, not found, and unauthenticated coverage.
  - `docs/references/backend/database-pattern.md`: keep household/membership lookups narrowly scoped, predictable, and index-friendly.
  - `docs/references/backend/cloudflare-workers.md`: keep middleware/runtime code edge-safe and compatible with Worker execution.
  - `docs/references/shared/type-naming-pattern.md`: only new public contract types get `DTO` / `Request` / `Response` suffixes; keep internal permission context types out of API contracts.
- Companion skills for implementation:
  - `test-driven-development`
  - `backend-patterns`
  - `security-reviewer`
  - `typescript-reviewer`
  - `verification-before-completion`
  - `gitnexus-impact-analysis`
- Common pitfalls to avoid:
  - Do not duplicate role checks in both middleware and handler business logic unless the repository needs a final ownership constraint for defense in depth.
  - Do not reintroduce route behavior that depends on a hidden active-household store or header.
  - Do not invent per-household permission flags in this feature; use admin-only defaults where the product has not defined a settings contract yet.

## Plan of Work (Narrative)

1. Add a dedicated active-membership data-access boundary for explicit household selection.
   - Create `apps/worker/src/db/repositories/household-membership-repository.ts`.
   - Add a focused query such as `findActiveHouseholdMembership(db, userId, householdId)` that returns the membership id, role, state, and household id for active memberships only.
   - Keep `listUserHouseholds` and `createHouseholdForUser` in `household-repository.ts`; do not move unrelated household CRUD into the membership repository.

2. Add reusable household membership context and middleware.
   - Extend `apps/worker/src/types/app.ts` with request variables for the resolved household id and active membership context.
   - Create `apps/worker/src/middlewares/household-membership.ts` with two exported helpers:
     - `resolveHouseholdMembership(getHouseholdId)` where `getHouseholdId` is a route-supplied callback that reads the explicit household id for the current request.
     - `requireRole(roles)` which reads the resolved membership from context and throws `403` when the role is not allowed.
   - `resolveHouseholdMembership` must throw `404` if the household id is absent, deleted, or has no active membership for the caller.
   - The initial `getHouseholdId` implementation for current routes should read `ctx.req.param('id')`. Future routes can provide body/query adapters without changing the middleware contract.

3. Add a named household permission-policy module for future household features.
   - Create `apps/worker/src/lib/permissions/household-policy.ts`.
   - Export named guards for at least:
     - `canManageHouseholdSettings`
     - `canDeleteHousehold`
     - `canManageMembers`
     - `canInviteMembers`
     - `canManageGroups`
     - `canCreateExpense`
     - `canEditOwnExpense`
     - `canEditAnyExpense`
     - `canViewAuditLogs`
   - Lock default MVP policy so anything not explicitly member-safe is admin-only. That means `canInviteMembers` and `canManageGroups` must return `false` for `member` until a future feature adds real household settings flags.

4. Refactor current household detail/update/delete flow to use the new authorization pipeline.
   - Update `apps/worker/src/db/repositories/household-repository.ts` so detail/update/delete helpers become neutral data operations by household id and archived state instead of embedding role checks in SQL.
   - Keep non-deleted filtering in the repository layer. User-facing delete remains the `DELETE /api/v1/households/:id` endpoint backed by the current recoverable storage behavior.
   - Update `apps/worker/src/handlers/households/get-household.ts`, `update-household.ts`, and `archive-household.ts` so they consume resolved membership from context rather than looking up role implicitly via `findUserHouseholdById` / admin-only repo helpers.
   - Update `apps/worker/src/routes/households.ts`:
     - `POST /households` and `GET /households` remain auth-only.
     - `GET /households/:id` uses `resolveHouseholdMembership`.
     - `PATCH /households/:id` and `DELETE /households/:id` use `resolveHouseholdMembership` + `requireRole(['admin'])`.
   - Preserve explicit path-param validation and existing success envelope behavior.

5. Add verification coverage that proves the new public behavior.
   - Add a worker unit test file for `household-policy.ts` that covers admin/member outcomes for each named guard.
   - Update `apps/worker/test/index.spec.ts` to prove:
     - active admin can update/delete a household.
     - active member can view the household detail but gets `403 FORBIDDEN` on update/delete.
     - authenticated non-member gets `404 NOT_FOUND` on detail/update/delete.
     - unauthenticated requests still get `401 UNAUTHENTICATED`.
   - Keep existing happy-path create/list/detail regression coverage intact.

6. Update harness artifacts at implementation completion.
   - Update this plan's `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective`.
   - Update `harness/features/feat-015a.json` with implementation evidence and final status.
   - Reflect status in `harness/feature_index.json`.
   - Add the implementation session summary and verification evidence to `harness/progress.md`.

## Concrete Steps (Commands)

Run from repo root unless stated otherwise:

```bash
# baseline repo verification before or after the worker-focused pass
./init.sh

# worker-focused verification while iterating on feat-015a
pnpm lint:worker
pnpm typecheck:worker
pnpm test:worker
```

Expected short outputs:

```text
pnpm install: OK
Harness checks: OK
Linting: OK
Type checking: OK
Running tests: OK
Init Done
```

```text
> household-finance-system@0.1.0 typecheck:worker
> pnpm --filter worker typecheck
```

```text
> household-finance-system@0.1.0 test:worker
> pnpm --filter worker exec vitest run

... passed
```

## Validation and Acceptance

- Happy path:
  - Admin `PATCH /api/v1/households/:id` succeeds with HTTP `200` and unchanged success envelope.
  - Admin `DELETE /api/v1/households/:id` succeeds with HTTP `200` and `{ archived: true }` in the current response payload.
- Authorization path:
  - Active non-admin member calling `PATCH` or `DELETE` receives HTTP `403` with error code `FORBIDDEN`.
  - Authenticated non-member calling `GET`, `PATCH`, or `DELETE` receives HTTP `404` with error code `NOT_FOUND`.
  - Missing/invalid bearer token still returns HTTP `401`.
- Regression path:
  - `GET /api/v1/households/:id` still works for active members.
  - `GET /api/v1/households` and `POST /api/v1/households` remain unaffected.
  - No route begins depending on `X-Household-Id` or hidden active-household state.
- Acceptance artifacts:
  - Worker unit tests for named permission guards.
  - Integration tests in `apps/worker/test/index.spec.ts` asserting the hybrid `404` / `403` contract.
  - Full `./init.sh` transcript showing success.

## Risks and Blockers

- Refactoring repository helpers from role-aware to neutral data-access functions can accidentally widen behavior if middleware composition is incomplete; route tests must cover each household-scoped branch.
- The current delete flow is user-facing delete but storage-backed by `archived_at`; this plan must keep terminology clear so future features do not confuse delete UX with hard-delete persistence.
- GitNexus caller graphs may under-report route and handler edges; implementation should treat tests and direct code inspection as the final safety net.

## Idempotence & Recovery

- Re-running the planned test commands is safe.
- No DB migration or data backfill is part of this feature.
- If the refactor breaks current household route behavior mid-implementation, restore the previous repository helper behavior first, then reintroduce middleware one route at a time so the failing branch stays isolated.
- Because `./init.sh` runs `lint:fix`, commit or inspect the post-format diff before treating verification output as the final state.

## Artifacts and Notes

- Public API behavior change to call out in review:
  - Existing admin-only household routes will move from always returning `404` on authenticated non-admin access to returning `403` only for active members who lack the role.
- No frontend code or API envelope shape is planned in this feature.
- The delete response may continue to expose `{ archived: true }` until a separate contract-cleanup feature deliberately renames it.

## Interfaces & Dependencies

- Internal modules involved:
  - `apps/worker/src/middlewares/auth.ts`
  - `apps/worker/src/middlewares/household-membership.ts` (new)
  - `apps/worker/src/lib/errors.ts`
  - `apps/worker/src/lib/permissions/household-policy.ts` (new)
  - `apps/worker/src/db/repositories/household-membership-repository.ts` (new)
  - `apps/worker/src/db/repositories/household-repository.ts`
  - `apps/worker/src/routes/households.ts`
  - `apps/worker/src/handlers/households/*`
- Public contract changes:
  - No new endpoints.
  - No response-envelope field changes.
  - Existing admin-only household routes gain the explicit `403 FORBIDDEN` branch for active members lacking authorization.
- External dependencies:
  - None beyond the current Worker stack (`hono`, D1, `zod`, `jose`).
