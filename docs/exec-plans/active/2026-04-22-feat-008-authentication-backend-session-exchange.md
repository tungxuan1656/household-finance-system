# feat-008: Complete backend authentication session exchange

## Objective

Finish the backend half of the authentication flow so the worker fully supports provider token exchange, refresh rotation, and explicit logout/session revocation for the app session lifecycle described in `docs/product-specs/authentication.md`. The observable outcome is that a client can sign in with a Firebase ID token, refresh without re-authenticating while the refresh token is valid, and log out so the current session can no longer refresh or access protected endpoints.

## Purpose / Big Picture

`feat-008` is the backend contract that turns Firebase identity into a local application session. Exchange and refresh behavior already exist in `apps/worker`, but the feature is still incomplete because the logout/revocation path and its end-to-end acceptance evidence are missing from the repository memory. This plan locks the remaining scope to backend work only, preserves the current route -> handler -> repository boundaries, and defines the verification and harness updates needed to close the feature safely.

This plan is now sequenced behind `feat-031` and `feat-032` so backend and frontend locale foundations land first, with current fallback behavior pinned to `vi`.

## Scope and Out-of-Scope

### In Scope

- `apps/worker/src/routes/auth.ts`
- `apps/worker/src/handlers/auth/*`
- `apps/worker/src/db/repositories/session-repository.ts`
- `apps/worker/src/contracts/auth.ts`
- `apps/worker/src/types/auth.ts` if logout-specific runtime input types are needed
- `apps/worker/test/index.spec.ts`
- `apps/worker/test/unit/dto-auth.spec.ts`
- `apps/worker/test/unit/session-repository.spec.ts`
- `apps/worker/README.md` if auth endpoint docs need to mention logout semantics
- `harness/features/feat-008.json`
- `harness/feature_index.json`
- `harness/progress.md`
- `docs/exec-plans/active/2026-04-22-feat-008-authentication-backend-session-exchange.md`
- `docs/exec-plans/active/index.md`

### Out of Scope

- Frontend Firebase SDK work, token storage, router redirects, and auth-state handling (`feat-009`).
- Firebase sign-up/sign-in UI, onboarding, and profile UX.
- Multi-device global logout, provider-wide Firebase token revocation, or admin-driven session invalidation beyond the current app session.
- Rate limiting, observability dashboards, or new infrastructure dependencies unless a blocker proves they are required.
- Rewriting the baseline schema from `feat-007`; any schema change discovered during implementation must be additive and justified.
- Implementing locale infrastructure itself; that belongs to `feat-031` and `feat-032`, which are now prerequisites for this feature.

## Non-negotiable Requirements

- Keep backend layering aligned with `ARCHITECTURE.md`: `Types -> Config -> Repo -> Service -> Runtime`, expressed here as `contracts/types -> lib/env -> db/repositories -> handlers -> routes/runtime`.
- Keep `route -> handler -> repository` ownership intact; routes may parse/validate input and return envelopes, but must not contain business logic or SQL.
- Keep API transport contracts in `apps/worker/src/contracts`, internal runtime types in `apps/worker/src/types`, and auth/security helpers in `apps/worker/src/lib/auth`.
- Preserve JSON-only `/api/v1` behavior, `camelCase` API fields, and the shared success/error envelope from `apps/worker/src/lib/response.ts`.
- Continue storing refresh tokens as hashes only. Never log or persist raw refresh tokens.
- Add regression coverage for happy path, invalid input, unauthenticated access, and logout-related replay/reuse failure.

## Progress

- [ ] (2026-04-22, owner: Codex, status: current) Confirm the remaining feature delta against the current auth worker surface and keep logout/session revocation as the only new backend behavior.
- [ ] Wait for `feat-031` and `feat-032` to land so auth contracts and UI flow can build on the repo-standard i18n foundation with `vi` fallback.
- [ ] Add logout request/response contract shape and route wiring in `apps/worker/src/contracts/auth.ts` and `apps/worker/src/routes/auth.ts`.
- [ ] Implement a dedicated auth logout handler in `apps/worker/src/handlers/auth/` that revokes the current session using repository helpers and current middleware context.
- [ ] Tighten `session-repository.ts` only if needed for explicit logout semantics or clearer revoke helpers without widening repository responsibilities.
- [ ] Extend endpoint and unit tests to prove exchange, refresh rotation, logout revocation, and post-logout rejection behavior.
- [ ] Update `apps/worker/README.md` if endpoint documentation changes.
- [ ] Update `harness/features/feat-008.json`, `harness/feature_index.json`, and `harness/progress.md` with completion evidence.
- [ ] Move this ExecPlan to `docs/exec-plans/completed/` and update both plan indexes when the feature is done.

## Surprises & Discoveries

- Current repo state already implements `POST /api/v1/auth/provider/exchange` and `POST /api/v1/auth/refresh`, plus refresh rotation and protected-route invalidation after refresh. The missing feature evidence is concentrated around logout/session revocation and final harness closure.
- `harness/features/feat-008.json` already contains implementation evidence from earlier worker auth refactors while the feature status is still `pending`; the implementation session should reconcile that record instead of overwriting it blindly.
- The current route name is `/auth/provider/exchange` instead of the product-spec shorthand `/auth/exchange`. Keep the existing shipped path stable unless a compatibility reason justifies adding an alias.

## Decision Log

- Decision: Treat `feat-008` as backend-only completion work and leave frontend session orchestration to `feat-009`.
  Rationale: The harness backlog already separates backend and frontend auth work, and the backend surface is the only remaining scope described in `feat-008`.
  Date/Author: 2026-04-22 / Codex

- Decision: Keep logout scoped to revoking the current application refresh session rather than revoking all provider sessions.
  Rationale: The product spec marks provider-wide revocation as optional, and current worker bindings/contracts only support app-session lifecycle management.
  Date/Author: 2026-04-22 / Codex

- Decision: Preserve the current `/auth/provider/exchange` path instead of renaming it during `feat-008`.
  Rationale: Renaming a working endpoint would create avoidable contract churn for the upcoming frontend implementation.
  Date/Author: 2026-04-22 / Codex

## Outcomes & Retrospective

Fill in after implementation:

- Outcome:
- Gaps:
- Lessons:

## Context and Orientation

- Product behavior source: `docs/product-specs/authentication.md`
- Worker auth route surface: `apps/worker/src/routes/auth.ts`
- Worker auth handlers: `apps/worker/src/handlers/auth/exchange-provider-token.ts`, `apps/worker/src/handlers/auth/refresh-session.ts`, plus the new logout handler to add
- Session persistence: `apps/worker/src/db/repositories/session-repository.ts`
- Auth middleware and current session context: `apps/worker/src/middlewares/auth.ts`
- API contracts: `apps/worker/src/contracts/auth.ts`
- Worker integration coverage: `apps/worker/test/index.spec.ts`
- Worker unit coverage: `apps/worker/test/unit/dto-auth.spec.ts`, `apps/worker/test/unit/session-repository.spec.ts`

## Standards Enforcement

### Required References

- `docs/references/backend/project-folder-structure.md`
- `docs/references/backend/architecture-and-boundaries.md`
- `docs/references/backend/api-contract-and-validation.md`
- `docs/references/backend/error-handling-pattern.md`
- `docs/references/backend/security-and-auth-pattern.md`
- `docs/references/backend/testing-pattern.md`
- `docs/references/backend/database-pattern.md`
- `docs/references/backend/cloudflare-workers.md`
- `docs/references/shared/type-naming-pattern.md`

### Concrete Coding Constraints

- Keep new request schemas in `contracts/auth.ts` with explicit `zod` validation; no implicit coercion.
- Keep logout input/output names aligned with the shared naming rule: `LogoutSessionRequest` and `LogoutSessionResponse` if new transport types are added.
- Keep routes thin: validate request body and headers, delegate orchestration to a handler, and return `success(ctx, data)` or mapped errors only.
- Keep all D1 statements in `session-repository.ts`; do not move session revocation SQL into routes or handlers.
- Use `401` for invalid/expired/replayed tokens and do not return `200` for failed revocation attempts.
- Do not use `SELECT *`; bind parameters explicitly and keep DB-to-API field mapping intentional.
- Avoid logging token values or raw identity payloads. If debugging is needed, log request id and stable identifiers only.
- If any Worker binding/runtime configuration changes are required, retrieve current Cloudflare Workers docs before editing `wrangler.jsonc` or runtime-specific code.

## Implementation Notes

- Mandatory patterns:
  - Reuse the existing auth middleware session context (`currentSessionId`, `currentUser`) for logout instead of re-parsing an access token in the handler.
  - Keep logout semantics idempotent where possible for the client, but still distinguish invalid/expired session replays from successful revocation in tests.
  - Prefer adding the smallest repository helper needed over broad repository rewrites.
- Companion skills for implementation:
  - `tdd-workflow`
  - `security-review`
  - `documentation-lookup`
  - `backend-patterns`
  - `verification-loop`
- Common pitfalls to avoid:
  - Mixing API contract types with runtime-only auth/session types.
  - Accidentally revoking the current session before using its id for response or audit assertions.
  - Changing the existing exchange/refresh payload shape in a way that breaks `feat-009`.

## Interfaces & Dependencies

- Firebase ID token verification via `apps/worker/src/lib/auth/firebase.ts`
- Access/refresh JWT issuance and verification via `apps/worker/src/lib/auth/jwt.ts`
- Refresh-token hashing via `apps/worker/src/lib/auth/security.ts`
- Session persistence in D1 table `refresh_sessions`
- Current-user/session injection via `apps/worker/src/middlewares/auth.ts`
- Shared API envelope via `apps/worker/src/lib/response.ts`

Planned contract for the new logout flow:

- Endpoint: `POST /api/v1/auth/logout`
- Auth: requires a valid bearer access token through `authMiddleware`
- Request body:
  - Option A: empty body `{}` with session id taken from middleware context
  - Option B: `{ refreshToken: string }` if implementation proves the client must prove possession of the refresh token too
- Planned default for this feature: Option A, because the authenticated access token already identifies the current session and keeps the logout flow narrow
- Response: success envelope with a minimal explicit result such as `{ revoked: true }`

## Plan of Work (Narrative)

1. Confirm the exact backend delta by comparing `docs/product-specs/authentication.md` with the already-shipped worker auth endpoints and tests. Preserve existing exchange and refresh behavior as the baseline.
2. Extend `apps/worker/src/contracts/auth.ts` with logout request/response schemas only if the route needs a body. Keep transport names explicit and `camelCase`.
3. Update `apps/worker/src/routes/auth.ts` to mount `POST /auth/logout` behind `authMiddleware`. The route should parse any required body, pass `currentSessionId`, `currentUser.id`, `user-agent`, and `cf-connecting-ip` to a logout handler, and return the standard success envelope.
4. Add `apps/worker/src/handlers/auth/logout-session.ts` to own logout orchestration. This handler should revoke the current session through `session-repository.ts`, map missing/inactive sessions to the correct auth error, and avoid embedding SQL or Hono-specific logic.
5. Keep repository work constrained to `apps/worker/src/db/repositories/session-repository.ts`. If current `revokeSessionIfActive` is enough, reuse it. If the handler needs a clearer helper keyed by session id and user id, add it there with bound parameters and explicit return semantics.
6. Extend `apps/worker/test/index.spec.ts` with end-to-end coverage for:
   - exchange -> protected route success
   - refresh rotation invalidating old refresh token
   - logout revoking current session
   - protected route rejection after logout
   - refresh rejection after logout if the revoked session’s refresh token is replayed
   - invalid input or missing auth header for logout
7. Extend `apps/worker/test/unit/dto-auth.spec.ts` and `apps/worker/test/unit/session-repository.spec.ts` only where new contract/repository behavior needs direct regression coverage.
8. Update `apps/worker/README.md` only if auth endpoint docs or local verification instructions changed.
9. Reconcile harness state at the end: mark `feat-008` done if all acceptance evidence exists, summarize what was implemented in `harness/progress.md`, and move this plan to `completed/`.

## Concrete Steps (Commands)

Run from repo root unless noted otherwise.

```bash
# Baseline before implementation
./init.sh

# Focused worker auth verification during implementation
pnpm --filter worker exec vitest run apps/worker/test/unit/dto-auth.spec.ts apps/worker/test/unit/session-repository.spec.ts apps/worker/test/index.spec.ts

# Worker-wide verification once auth/logout work is complete
pnpm --filter worker lint
pnpm --filter worker typecheck
pnpm --filter worker test

# Final full-repo verification before closing feat-008
./init.sh
```

Expected short outputs:

```text
=== Init complete ===
Test Files ... passed
All files pass linting
Found 0 errors
```

If a local manual HTTP check is helpful during implementation, run the worker dev server in one shell and exercise:

```bash
pnpm dev:worker
curl -i http://127.0.0.1:8787/api/v1/auth/logout
```

Expected behavior after the route exists:

- Without bearer token: HTTP `401`
- With a valid bearer token from an exchanged session: HTTP `200` with `{"data":{"revoked":true},...}`

## Validation and Acceptance

### Happy Path

- `POST /api/v1/auth/provider/exchange` returns `200` and both app tokens.
- `POST /api/v1/auth/refresh` returns `200` and rotates both tokens.
- `POST /api/v1/auth/logout` with a valid bearer token returns `200` and marks the current session revoked.

### Validation / Error Paths

- Exchange rejects malformed payloads with `400`.
- Refresh rejects missing or replayed refresh tokens with `401`.
- Logout rejects missing bearer tokens with `401`.
- Logout rejects attempts to use a revoked or expired session with `401`.

### Regression Checks

- A protected endpoint that succeeded before logout now returns `401` after logout using the same access token.
- Reusing the revoked session’s refresh token after logout returns `401`.
- Existing exchange and refresh tests continue to pass unchanged.

### Acceptance Artifacts

- `apps/worker/test/index.spec.ts`
- `apps/worker/test/unit/dto-auth.spec.ts`
- `apps/worker/test/unit/session-repository.spec.ts`
- Final `./init.sh` transcript
- Updated `harness/features/feat-008.json`

## Idempotence & Recovery

- Test and lint commands are safe to re-run.
- Logout/session repository changes should not require a schema migration; if a migration becomes necessary, create a new migration file instead of editing `0001_init.sql`.
- Repository updates should be reversible with a normal git revert because no irreversible data migration is planned.
- If a repository refactor widens unexpectedly, stop and re-scope before touching unrelated auth/profile code.

## Risks and Blockers

- The main product risk is contract drift between this backend feature and the upcoming frontend auth flow. Avoid changing existing exchange/refresh response fields unless absolutely necessary.
- Logout semantics can become ambiguous if the implementation mixes access-token identity with refresh-token proof. Keep one clear rule and test it directly.
- Full-repo verification depends on the current web baseline staying green. If `./init.sh` fails for an unrelated area, record the failure precisely and still complete all worker-local verification.

## Open Decisions

- Do we need logout to revoke only the current session, or all sessions for the user? Current plan assumption: current session only.
- Should logout require a request body at all? Current plan assumption: no body, rely on `authMiddleware` session context.
- Should `feat-008` add provider-revocation hooks for Firebase? Current plan assumption: no, leave provider-wide revocation out of scope unless product requirements change.

## Harness Integration

- Update `harness/features/feat-008.json`:
  - keep `status` aligned with actual completion state
  - replace partial/refactor-only evidence with final endpoint/test evidence once complete
  - update `updated_at`
- Update `harness/feature_index.json`:
  - mark `feat-008` as `done` only after final verification passes
- Update `harness/progress.md`:
  - add a newest-first entry describing logout implementation, tests, verification evidence, and any blocker
- Update plan lifecycle:
  - move this file to `docs/exec-plans/completed/`
  - add the completed-plan link to `docs/exec-plans/completed/index.md`
  - remove it from `docs/exec-plans/active/index.md` when finished

## Artifacts and Notes

- Existing evidence already in repo:
  - exchange and refresh endpoints are implemented
  - refresh rotation invalidates the old refresh token
  - old access tokens stop working after refresh rotation
- New evidence required to close the feature:
  - logout endpoint contract and handler
  - post-logout protected-route rejection
  - post-logout refresh rejection
  - final harness records and completed plan move
