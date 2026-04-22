# Title

feat-008: Complete backend authentication session exchange

## Purpose / Big Picture

This plan finalizes the backend authentication session lifecycle in the worker by preserving the existing provider exchange and refresh behavior, then adding explicit logout/session revocation and complete acceptance evidence. Users should be able to exchange a Firebase ID token for app tokens, refresh while the refresh token is valid, and log out so the current app session can no longer access protected endpoints or refresh. The scope is backend-only and keeps the established route -> handler -> repository boundaries.

## Objective

Implement and verify `POST /api/v1/auth/logout` so `feat-008` can move from pending to done with complete backend acceptance evidence aligned to `docs/product-specs/authentication.md`.

## Scope

In scope (expected edits):

- `apps/worker/src/contracts/auth.ts`
- `apps/worker/src/routes/auth.ts`
- `apps/worker/src/handlers/auth/logout-session.ts` (new)
- `apps/worker/src/handlers/auth/index.ts` (if needed for exports)
- `apps/worker/src/db/repositories/session-repository.ts`
- `apps/worker/src/types/auth.ts` (only if new runtime type is required)
- `apps/worker/test/index.spec.ts`
- `apps/worker/test/unit/dto-auth.spec.ts`
- `apps/worker/test/unit/session-repository.spec.ts`
- `apps/worker/README.md` (only if endpoint docs change)
- `harness/features/feat-008.json`
- `harness/feature_index.json`
- `harness/progress.md`
- `docs/exec-plans/active/2026-04-22-feat-008-authentication-backend-session-exchange.md`

Out of scope:

- Frontend token storage/session wiring (`feat-009`).
- Firebase UI auth flows and onboarding/profile UX.
- Global multi-device logout or provider-wide Firebase revocation.
- New infrastructure dependencies, rate-limiting rollout, or observability dashboards.
- Rewriting `apps/worker/migrations/0001_init.sql`; any DB changes must be additive.

## Non-negotiable Requirements

- Keep architecture direction from `ARCHITECTURE.md`: `Types -> Config -> Repo -> Service -> Runtime -> UI`.
- Keep worker boundary direction: `contracts/types -> lib/env -> db/repositories -> handlers -> routes/runtime`.
- Routes must remain thin and contain no SQL.
- Handlers must orchestrate behavior but not define transport envelope shape ad hoc.
- Repository layer owns D1 SQL and row mapping.
- Use JSON-only `/api/v1` contracts with `camelCase` fields and shared response envelope.
- Refresh tokens remain hashed at rest and never logged.
- Include endpoint and regression tests for happy path, validation failure, and unauthenticated/invalid-token paths.

## Context and Orientation

- Product behavior source: `docs/product-specs/authentication.md`
- Existing auth routes: `apps/worker/src/routes/auth.ts`
- Existing auth orchestration: `apps/worker/src/handlers/auth/exchange-provider-token.ts`, `apps/worker/src/handlers/auth/refresh-session.ts`
- Session persistence: `apps/worker/src/db/repositories/session-repository.ts`
- Session context middleware: `apps/worker/src/middlewares/auth.ts`
- Auth transport contracts: `apps/worker/src/contracts/auth.ts`
- Integration tests: `apps/worker/test/index.spec.ts`
- Unit tests: `apps/worker/test/unit/dto-auth.spec.ts`, `apps/worker/test/unit/session-repository.spec.ts`
- Current harness state: `harness/features/feat-008.json` (pending with partial evidence)

## Scope Map and Layer Impact

Layer impact for this feature:

- Types: possible logout runtime type additions in `apps/worker/src/types/auth.ts`.
- Config: no planned config/env changes.
- Repo: session revocation helper updates in `apps/worker/src/db/repositories/session-repository.ts`.
- Service (handler): new logout orchestration in `apps/worker/src/handlers/auth/logout-session.ts`.
- Runtime (route/middleware wiring): `apps/worker/src/routes/auth.ts`.
- UI: no changes (frontend out of scope).

Dependency checks:

- Lower layers will not import higher layers.
- Route code will not bypass handler/repository contracts.
- Data access remains repository-only.
- No new dependency is planned; if one becomes necessary, capture explicit justification in Decision Log before implementation.

## Standards Enforcement

Required references:

- `docs/references/backend/project-folder-structure.md`
- `docs/references/backend/architecture-and-boundaries.md`
- `docs/references/backend/api-contract-and-validation.md`
- `docs/references/backend/error-handling-pattern.md`
- `docs/references/backend/security-and-auth-pattern.md`
- `docs/references/backend/testing-pattern.md`
- `docs/references/backend/database-pattern.md`
- `docs/references/backend/cloudflare-workers.md`
- `docs/references/shared/type-naming-pattern.md`

Concrete coding constraints:

- Keep API schemas in `apps/worker/src/contracts/auth.ts` with explicit zod validation.
- If logout request/response transport types are added, use `LogoutSessionRequest` and `LogoutSessionResponse` naming.
- Return failures with proper status mapping (`400`, `401`, `500`) and never with `200`.
- Keep SQL parameterized and avoid `SELECT *`.
- Do not log token material or secret-bearing payload fields.
- If worker runtime binding/config changes are required, fetch current Cloudflare docs first and rerun `wrangler types`.

## Implementation Notes

Mandatory implementation patterns:

- Reuse middleware auth context (`currentSessionId`, `currentUser`) for logout identity.
- Prefer empty logout body and derive revocation target from authenticated session context unless a validated requirement emerges.
- Keep repository changes minimal and focused on explicit revocation semantics.

Companion skills to use during implementation:

- `tdd-workflow`
- `security-review`
- `documentation-lookup`
- `backend-patterns`
- `verification-loop`

Common pitfalls to avoid:

- Mixing API contracts and runtime-only internal types.
- Accidentally changing exchange/refresh response shape used by `feat-009`.
- Implementing logout in route code instead of handler/repository layers.

## Interfaces & Dependencies

- Firebase ID token verification: `apps/worker/src/lib/auth/firebase.ts`
- JWT issue/verify: `apps/worker/src/lib/auth/jwt.ts`
- Refresh-token hashing: `apps/worker/src/lib/auth/security.ts`
- Session table: `refresh_sessions` (D1)
- Shared response envelope: `apps/worker/src/lib/response.ts`

Target logout contract:

- Endpoint: `POST /api/v1/auth/logout`
- Authorization: required bearer token via auth middleware
- Request body: default `{}` (or no body) unless implementation requires typed payload
- Response body: success envelope containing `{ revoked: true }`

## Plan of Work (Narrative)

1. Confirm baseline behavior in current tests/routes for exchange and refresh. Keep those flows stable.
2. Add logout transport contract only if needed in `apps/worker/src/contracts/auth.ts`.
3. Add `POST /auth/logout` route in `apps/worker/src/routes/auth.ts` behind auth middleware.
4. Implement `apps/worker/src/handlers/auth/logout-session.ts` for session revocation orchestration.
5. Update `apps/worker/src/db/repositories/session-repository.ts` only if current helpers are insufficient.
6. Add integration coverage in `apps/worker/test/index.spec.ts` for post-logout protected and refresh rejection.
7. Add/adjust focused unit tests in `apps/worker/test/unit/dto-auth.spec.ts` and `apps/worker/test/unit/session-repository.spec.ts` only where behavior changed.
8. Update worker docs only if endpoint docs changed.
9. Update harness records and complete plan lifecycle once verification passes.

## Concrete Steps (Commands)

Run from repo root:

```bash
# Baseline repository verification before implementation
./init.sh

# Focused auth test cycle while implementing
pnpm --filter worker exec vitest run apps/worker/test/unit/dto-auth.spec.ts apps/worker/test/unit/session-repository.spec.ts apps/worker/test/index.spec.ts

# Worker package gates
pnpm --filter worker lint
pnpm --filter worker typecheck
pnpm --filter worker test

# Final full repository verification before closing the feature
./init.sh
```

Optional manual route check (separate shell with dev worker running):

```bash
pnpm dev:worker
curl -i http://127.0.0.1:8787/api/v1/auth/logout
```

Expected short outputs:

- `=== Init complete ===`
- `Test Files ... passed`
- `All files pass linting`
- `Found 0 errors`
- Logout unauthenticated call returns `401`
- Logout authenticated call returns `200` with `{"data":{"revoked":true},...}`

## Verification Path

Happy path evidence:

- Exchange returns app access and refresh tokens.
- Refresh rotates tokens and invalidates old refresh token.
- Logout revokes current session and returns `revoked: true`.

Validation and error evidence:

- Exchange malformed payload -> `400`.
- Refresh missing/replayed token -> `401`.
- Logout missing bearer token -> `401`.
- Logout on invalid/revoked session -> `401`.

Regression evidence:

- Protected route succeeds before logout and returns `401` after logout using same prior access token.
- Revoked refresh token cannot be used after logout.
- Existing exchange/refresh tests remain green.

Acceptance artifacts:

- Updated tests in `apps/worker/test/index.spec.ts`
- Any updated unit tests in `apps/worker/test/unit/dto-auth.spec.ts`
- Any updated unit tests in `apps/worker/test/unit/session-repository.spec.ts`
- Final `./init.sh` output transcript snippet
- Updated `harness/features/feat-008.json`

## Idempotence & Recovery

- All verify commands are safe to rerun.
- No destructive migration is planned.
- If a migration becomes necessary, create a new migration file and include backup/rollback instructions before applying.
- If scope expands beyond logout/session revocation, pause and log a decision before proceeding.

## Risks and Blockers

- Risk: backend contract drift against upcoming frontend work.
  Mitigation: keep exchange/refresh payloads backward-compatible and tested.

- Risk: ambiguous logout semantics (current session vs all sessions).
  Mitigation: lock behavior to current-session revoke for feat-008 and document the decision.

- Risk: unrelated repo failures during final `./init.sh`.
  Mitigation: run worker-local gates regardless and record unrelated blockers precisely in harness logs.

## Open Decisions

- Confirm whether logout remains current-session-only (default: yes).
- Confirm whether logout should require request body (default: no).
- Confirm whether provider-wide Firebase revoke remains out of scope (default: yes).

## Harness Integration

When implementation starts/completes:

- Update `harness/features/feat-008.json` status/evidence/updated_at.
- Update `harness/feature_index.json` to `done` only after final verification passes.
- Add newest-first implementation entry to `harness/progress.md` with commands and outcomes.
- Move this plan to `docs/exec-plans/completed/` and update active/completed indexes.

## Progress

- [x] (2026-04-22, owner: Codex) Revalidated feat-008 scope against auth product spec, worker auth route/test baseline, and harness feature records.
- [x] (2026-04-22, owner: Codex) Rewrote this ExecPlan to align with template sections, backend reference matrix, and explicit verification path.
- [ ] (2026-04-22, owner: Codex, status: current) Begin implementation with TDD: add failing integration test for logout/post-logout behavior in `apps/worker/test/index.spec.ts`.
- [ ] Implement logout route and handler while preserving exchange/refresh contracts.
- [ ] Add/adjust repository helper(s) for deterministic session revocation semantics.
- [ ] Pass worker-local gates (`lint`, `typecheck`, `test`) and full `./init.sh`.
- [ ] Update harness records, then move this plan to completed.

## Surprises & Discoveries

- Existing auth routes already cover `/auth/provider/exchange` and `/auth/refresh`; the functional gap for this feature is explicit logout/session revocation evidence.
- `harness/features/feat-008.json` already includes partial implementation evidence while status is still `pending`, so implementation must reconcile evidence rather than overwrite context.
- Product spec naming uses `/auth/exchange` while current runtime uses `/auth/provider/exchange`; plan assumes no endpoint rename for compatibility.

## Decision Log

- Decision: Treat feat-008 as backend-only completion work.
  Rationale: Frontend auth session behavior is tracked separately as `feat-009`.
  Date/Author: 2026-04-22 / Codex

- Decision: Keep logout scoped to revoking current app session only.
  Rationale: Matches current product scope and avoids introducing global session side effects.
  Date/Author: 2026-04-22 / Codex

- Decision: Keep `/auth/provider/exchange` path stable in feat-008.
  Rationale: Avoid frontend contract churn before `feat-009` implementation.
  Date/Author: 2026-04-22 / Codex

## Outcomes & Retrospective

To fill after implementation:

- Outcome:
- Gaps:
- Lessons:
