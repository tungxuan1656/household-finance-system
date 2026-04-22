# feat-006: Worker Service Foundation

## Objective

Establish a reusable backend foundation in `apps/worker` so future household-finance APIs can mount on a consistent Cloudflare Workers + Hono runtime. The user-visible outcome is that the worker exposes stable `/api/v1` routing, a health endpoint, consistent request metadata and error envelopes, validation failures with correct 4xx responses, and an auth boundary that protects downstream routes.

## Purpose / Big Picture

Before this feature, backend work risked re-solving runtime setup, JSON parsing, error mapping, and auth orchestration route by route. This plan locked the worker into the repository layer model from `ARCHITECTURE.md` (`Types -> Config -> Repo -> Service -> Runtime -> UI`) so later features can add domain handlers without bypassing validation, auth, or data-access boundaries. The completed implementation makes that behavior observable through worker tests that exercise health, malformed JSON, unauthorized access, not-found responses, and authenticated profile access.

## Scope and Out-of-Scope

### In Scope

- `apps/worker/src/index.ts`
- `apps/worker/src/lib/validation.ts`
- `apps/worker/src/db/repositories/user-repository.ts`
- `apps/worker/src/middlewares/auth.ts`
- `apps/worker/src/routes/auth.ts`
- `apps/worker/src/routes/profile.ts`
- `apps/worker/src/routes/health.ts`
- `apps/worker/test/index.spec.ts`
- `apps/worker/test/unit/response.spec.ts`
- `apps/worker/test/unit/env.spec.ts`
- `apps/worker/test/unit/firebase.spec.ts`
- `apps/worker/test/unit/jwt.spec.ts`
- `apps/worker/package.json`
- `apps/worker/wrangler.jsonc`
- `apps/worker/.dev.vars.example`
- `apps/worker/README.md`
- `apps/worker/vitest.config.mts`
- `harness/features/feat-006.json`
- `harness/feature_index.json`
- `harness/progress.md`

### Out of Scope

- New business-domain APIs for expenses, households, budgets, analytics, or onboarding.
- Schema or migration expansion beyond what the worker foundation needs to boot and test.
- Frontend session UX, API client wiring, or cross-app contract consumption.
- New dependencies beyond the existing worker stack.

## Non-negotiable Requirements

- Keep the plan self-contained with exact files, commands, and acceptance artifacts.
- Preserve backend boundaries from `ARCHITECTURE.md`: routes compose middleware, repositories own D1 access, and middleware must not absorb repository logic.
- Keep the API JSON-only under `/api/v1` with consistent success/error envelopes and `camelCase` fields.
- Add regression coverage for the worker shell behavior this foundation claims to provide.

## Context and Orientation

- Worker entrypoint: `apps/worker/src/index.ts`
- Shared request parsing and validation: `apps/worker/src/lib/validation.ts`
- Worker auth middleware: `apps/worker/src/middlewares/auth.ts`
- User data access: `apps/worker/src/db/repositories/user-repository.ts`
- Runtime routes: `apps/worker/src/routes/*`
- Integration-style worker tests: `apps/worker/test/index.spec.ts`
- Unit coverage for shared backend utilities: `apps/worker/test/unit/*`
- Worker package scripts and runtime config: `apps/worker/package.json`, `apps/worker/wrangler.jsonc`, `apps/worker/.dev.vars.example`

## Scope Map

### Layer Impact

- Types: existing DTO and app binding types remain the contract surface.
- Config: `wrangler.jsonc`, `.dev.vars.example`, and package scripts align the runtime naming and local setup.
- Repo: `user-repository.ts` owns user lookup/upsert behavior for auth-backed identity resolution.
- Service: shared validation logic centralizes request-body parsing for route consumers.
- Runtime: `index.ts`, `auth.ts`, and route modules compose the HTTP boundary and error handling.
- UI: untouched by this feature.

### Dependency Checks

- Lower layers do not depend on higher layers.
- Runtime routes do not execute SQL directly.
- Auth middleware reads config, verifies the access token, validates session state, and delegates user lookup to the repository.
- Shared validation remains generic and request-focused instead of embedding route-specific business rules.

## Standards Enforcement

### Required References

- `docs/references/backend/architecture-and-boundaries.md`
- `docs/references/backend/api-contract-and-validation.md`
- `docs/references/backend/error-handling-pattern.md`
- `docs/references/backend/security-and-auth-pattern.md`
- `docs/references/backend/testing-pattern.md`
- `docs/references/backend/cloudflare-workers.md`
- `docs/references/shared/type-naming-pattern.md`

### Concrete Coding Constraints

- Keep route modules narrow and free of SQL; use repositories for D1 access.
- Validate JSON bodies explicitly and return `400` on malformed or schema-invalid input.
- Preserve baseline status mapping: `400`, `401`, `404`, and `500` are all observable in tests.
- Do not log or persist secrets/tokens directly; auth relies on environment-backed config and verified token/session state.
- Maintain API response envelopes with request metadata so debugging and client integration stay consistent.
- Use shared DTO naming and `ApiResponse<T>` style wrappers when introducing or updating API payload types.

## Implementation Notes

- Mandatory patterns: repository-owned user lookup, middleware-only auth orchestration, central request-body validation, and worker-level integration coverage for shell behavior.
- Companion skills for implementation: `tdd-workflow`, `security-review`, `documentation-lookup`, `backend-patterns`, `verification-loop`.
- Common pitfalls to avoid: parsing JSON in each route, hiding auth side effects inside middleware helpers, returning raw uncaught errors, or letting route modules talk to D1 directly.

## Plan of Work (Narrative)

1. Keep `apps/worker/src/index.ts` as the Hono root that attaches request context middleware, translates uncaught exceptions through the shared error adapter, throws a canonical not-found error for unknown routes, and mounts worker routes under `/api/v1`.
2. Introduce `apps/worker/src/lib/validation.ts` as the shared JSON-body reader so auth/profile routes can reject malformed JSON and schema-invalid bodies consistently instead of duplicating parsing logic.
3. Move worker-side user lookup and Firebase identity upsert logic behind `apps/worker/src/db/repositories/user-repository.ts`, leaving `apps/worker/src/middlewares/auth.ts` responsible only for bearer extraction, JWT verification, session checks, and attaching the authenticated user/session to request context.
4. Reuse the new validation helper in `apps/worker/src/routes/auth.ts` and `apps/worker/src/routes/profile.ts`, preserving existing DTO contracts while tightening failure behavior.
5. Align worker package/runtime files (`package.json`, `wrangler.jsonc`, `.dev.vars.example`, `README.md`, `vitest.config.mts`) with Household Finance naming and developer workflow so local development and verification reflect the actual service identity.
6. Add or update tests in `apps/worker/test/index.spec.ts` and unit suites so the foundation proves request-id propagation, health success, 404 handling, invalid input, missing bearer-token rejection, and authenticated profile access.
7. Update harness records after implementation so repo memory captures completion status and evidence for `feat-006`.

## Concrete Steps (Commands)

Run from repository root unless noted otherwise.

```bash
./init.sh
pnpm --filter worker lint
pnpm --filter worker typecheck
pnpm --filter worker test
pnpm --filter worker cf-typegen
```

Expected short outputs:

```text
Harness size checks passed
eslint .
tsc --noEmit
Test Files 0 failed
types/generated
```

Notes:

- `./init.sh` is the canonical full-repo verification path and was part of the original completion evidence on 2026-04-22.
- `pnpm --filter worker cf-typegen` is required if bindings in `wrangler.jsonc` change.
- Current repo baseline on 2026-04-22 no longer passes `./init.sh` because of an unrelated web test failure in `apps/web/src/app.test.tsx` (`localStorage.getItem is not a function`); that drift was discovered during this plan review, not during the original feat-006 implementation.

## Validation and Acceptance

### Happy Path

- `GET /api/v1/health` returns HTTP `200` with `data.ok === true` and a non-empty `meta.requestId`.
- Auth exchange with a valid test Firebase token returns an access token and user payload.
- `GET /api/v1/profile` with a valid bearer token returns the authenticated user profile.

### Validation and Error Paths

- Malformed or schema-invalid JSON for auth exchange returns `400 INVALID_INPUT`.
- Missing bearer token on protected routes returns `401 UNAUTHENTICATED`.
- Unknown route under the worker returns `404 NOT_FOUND`.
- Unexpected uncaught errors are mapped to the generic internal-error envelope rather than leaking raw exceptions.

### Regression Checks

- Provided `x-request-id` is preserved in the API envelope instead of being overwritten.
- Auth middleware continues to reject revoked/expired/missing sessions after the repository extraction.
- Shared validation behavior is reused across auth/profile routes so future route additions can adopt the same error path without custom parsing.

### Acceptance Artifacts

- `apps/worker/test/index.spec.ts`
- `apps/worker/test/unit/response.spec.ts`
- `harness/features/feat-006.json`

## Interfaces and Dependencies

- `hono`: HTTP router/runtime composition for Cloudflare Workers.
- `zod`: request body validation through `readJsonBody`.
- `jose`: JWT verification for access tokens.
- Cloudflare D1 binding `DB`: repository access for users and sessions.
- `ApiResponse<T>` envelope and app binding types from `apps/worker/src/dto/*`.

## Idempotence and Recovery

- All verification commands are safe to re-run.
- Route, middleware, and repository edits are reversible through git history; no destructive migration or data backfill is required by this feature.
- If worker bindings change, regenerate types with `pnpm --filter worker cf-typegen` before re-running typecheck.
- If a future reopen is needed, keep this plan in `completed/` as the source of truth and create a new `active/` plan only for net-new scope.

## Risks and Blockers

- Auth middleware is security-sensitive; accidental logic drift can silently widen access or reject valid sessions.
- Worker runtime/config naming changes can break local dev or Cloudflare deployment if bindings and docs diverge.
- Full-repo verification is currently blocked by an unrelated web test failure discovered after feat-006 completion.

## Surprises & Discoveries

- 2026-04-22: The worker foundation already has broader integration coverage than the original short summary showed, including authenticated profile flow and request-id preservation, so the old completed plan understated the true acceptance surface.
- 2026-04-22: `apps/worker/README.md` still references legacy `docs/standards/*` paths even though canonical standards now live under `docs/references/*`; this is adjacent cleanup, not part of feat-006 scope.
- 2026-04-22: `./init.sh` currently fails in `apps/web/src/app.test.tsx` for a theme/localStorage test, which is unrelated repo drift outside the worker foundation scope.

## Decision Log

- Decision: Keep the completed plan in `docs/exec-plans/completed/` instead of reopening it in `active/`.
  Rationale: `feat-006` remains marked `done` in harness state, and the user asked for a review/re-plan of the existing completed plan rather than new implementation scope.
  Date/Author: 2026-04-22 / Codex

- Decision: Treat worker foundation as a backend + shared-types scope, not fullstack.
  Rationale: The feature changes runtime, validation, auth, repository, and config surfaces inside `apps/worker` without touching frontend consumption.
  Date/Author: 2026-04-22 / Codex

- Decision: Record current `./init.sh` failure as present-day repo drift, not as failed original evidence for feat-006.
  Rationale: Harness and progress records already show feat-006 completed on 2026-04-22 with full verification, and the failing test is in `apps/web`.
  Date/Author: 2026-04-22 / Codex

## Open Decisions

- None for the original feat-006 scope.
- If the team wants to clean up adjacent documentation drift (`apps/worker/README.md` standards paths), track that as a follow-up under the next relevant backend maintenance plan.

## Progress Log

- [x] (2026-04-22) Review existing completed plan content against `docs/exec-plans/__plan-template__.md`.
- [x] (2026-04-22) Reconcile feat scope with `ARCHITECTURE.md`, `docs/PLANS.md`, backend references, and harness state.
- [x] (2026-04-22) Reconstruct file-level implementation narrative and validation matrix from current worker code and harness evidence.
- [x] (2026-04-22) Re-run `./init.sh` to confirm present-day baseline and record unrelated repo drift discovered during review.
- [x] (2026-04-22) Rewrite this completed plan into a self-contained ExecPlan record suitable for future implementation or audit.

## Outcomes & Retrospective

The original short plan summary was directionally correct but incomplete for future reuse. This rewritten completed ExecPlan now captures the real scope, standards, concrete commands, validation matrix, layer boundaries, and repo-memory expectations needed for another agent or human to understand what feat-006 delivered and how to verify or reopen it safely. The only active blocker discovered during this review is outside feat-006: a current web test regression that breaks full-repo verification today.
