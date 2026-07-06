# Internal user-targeted expense migration

## Purpose / Big Picture

Enable maintainers to import one legacy JSON file into an existing user account without asking for that user's JWT. The observable behavior is a new server-only migration path and CLI mode that accepts a `targetUserId` plus a dedicated internal secret, while the existing `/api/v1/migrate/expenses` route keeps its current self-service user-token behavior.

## Scope

- Backend Worker internal migration contract and auth guard under `apps/worker/src/routes/migrate.ts`, `apps/worker/src/handlers/migrate/*`, `apps/worker/src/contracts/migrate*`, and touched middleware/env/type files.
- Worker integration coverage for internal migration auth, target-user validation, and household authorization via the target user.
- CLI updates in `scripts/migrate-expenses.mjs` to support either user-token mode or internal-secret + `targetUserId` mode.
- Worker binding/config examples in `apps/worker/.dev.vars.example`, `apps/worker/wrangler.jsonc` comments if needed, and regenerated `apps/worker/worker-configuration.d.ts` if bindings change.
- Harness evidence updates for a new feature record `feat-124`.

Out of scope:

- Batch multi-user directory imports.
- New web or TMA admin UI.
- General-purpose admin RBAC or staff accounts.
- Changing semantics of the existing authenticated `/api/v1/migrate/expenses` endpoint.

## Non-negotiable Requirements

- The plan is self-contained and must not rely on the original chat.
- The change must preserve the current self-token migration path unchanged.
- The internal path must require a dedicated env-provided secret and must never accept a target user via the public user-token route.
- The internal path must validate target user existence and re-use target-user household membership/role checks before writing household expenses.
- The implementation must produce observable acceptance via worker integration tests and CLI invocation examples.

## Progress

- [x] 2026-07-06 Create internal migration ExecPlan and register `feat-124` as active.
- [x] Add internal-secret auth path, request contract, and shared handler flow for target-user migration.
- [x] Extend `scripts/migrate-expenses.mjs` with internal mode flags and guardrails.
- [x] Add/expand worker integration tests for internal migration success and failure paths.
- [x] Run targeted verification, then full `./init.sh`, and record evidence in harness artifacts.

## Surprises & Discoveries

- Existing `POST /api/v1/migrate/expenses` already hard-binds `spentByUserId` to `currentUser.id` in `apps/worker/src/handlers/migrate/migrate-expenses.ts`, so a target-user flow must be additive rather than a small flag flip.
- Worker binding changes require regenerating `apps/worker/worker-configuration.d.ts` per `docs/references/backend/cloudflare-workers.md`.
- `pnpm --filter worker cf-typegen` confirms secret-only env like `INTERNAL_API_KEY` is not emitted into generated Worker env typings, so no committed `apps/worker/worker-configuration.d.ts` diff is expected for this feature.

## Decision Log

- Decision: keep the current authenticated migration route unchanged and add a separate internal migration path.
  Rationale: avoids weakening the caller-owned auth contract of `POST /api/v1/migrate/expenses` and keeps breaking-risk low for existing tooling.
  Date/Author: 2026-07-06 / OpenCode orchestrator

- Decision: internal authorization will use a dedicated env secret, not another user token and not an overload of the existing JWT auth middleware.
  Rationale: user JWTs represent end-user identity; internal migration is an operator capability and needs a separate trust boundary.
  Date/Author: 2026-07-06 / OpenCode orchestrator

## Outcomes & Retrospective

- Added `POST /api/v1/internal/migrate/expenses` behind dedicated `X-Internal-Api-Key` middleware using env secret `INTERNAL_API_KEY` and constant-time comparison.
- Kept `POST /api/v1/migrate/expenses` unchanged; it still requires bearer auth and still imports into the caller identity only.
- Refactored the migrate handler around shared target-user-agnostic core logic so both public and internal flows reuse the same import path without duplicating business rules.
- Extended `scripts/migrate-expenses.mjs` with mutually exclusive internal mode (`--admin-secret` + `--target-user-id`) while preserving existing token mode.
- Added integration coverage for internal success/failure paths and verified the final tree with targeted tests, `./init.sh typecheck`, and full `./init.sh`.

## Context and Orientation

- Existing user-scoped route: `apps/worker/src/routes/migrate.ts`
- Existing migrate handler: `apps/worker/src/handlers/migrate/migrate-expenses.ts`
- Existing migrate schemas/types: `apps/worker/src/contracts/migrate-schemas.ts`, `apps/worker/src/contracts/migrate-types.ts`
- Existing migrate CLI: `scripts/migrate-expenses.mjs`
- Worker env loader: `apps/worker/src/lib/env.ts`
- Worker app types/context: `apps/worker/src/types/app.ts`
- Existing integration suite: `apps/worker/test/integration/migrate-expenses.spec.ts` and `apps/worker/test/integration/migrate-expenses-test-setup.ts`
- Existing feature baseline: `harness/features/feat-106.json`

## Required standards/reference docs

- `docs/SECURITY.md`
- `docs/references/backend/architecture-and-boundaries.md`
- `docs/references/backend/api-contract-and-validation.md`
- `docs/references/backend/security-and-auth-pattern.md`
- `docs/references/backend/testing-pattern.md`
- `docs/references/backend/cloudflare-workers.md`

Concrete constraints from those refs:

- Route modules compose middleware only; business branching stays in handlers.
- Secrets must come from env/config only and never be hardcoded in source or docs.
- New API input must be explicitly validated with additive request schemas; no in-place meaning changes for existing fields.
- Security-sensitive flows need unauthorized + forbidden + not-found coverage.
- If bindings change, rerun `wrangler types` and commit `apps/worker/worker-configuration.d.ts`.

## Plan of Work (Narrative)

1. Refactor the migrate handler so the core import logic can accept an explicit target user id instead of reading only `currentUser.id` from Hono context. Keep the current authenticated path wired to the caller user so no existing behavior changes.
2. Add a dedicated internal migration request schema/type that extends the current migrate payload with `targetUserId`. Register a separate internal route under the migrate route module and protect it with a dedicated middleware that validates `X-Internal-Api-Key` against Worker env secret `INTERNAL_API_KEY`.
3. Resolve household authorization using the target user for internal requests. If `householdId` is provided, the target user must have an active membership and a role that passes `canCreateExpense`; otherwise return the same forbidden/not-found semantics as the current flow.
4. Validate target user existence before migration writes. Personal imports do not need household membership but must still fail fast when the target user id does not exist.
5. Extend `scripts/migrate-expenses.mjs` with a second invocation mode: `--admin-secret <secret> --target-user-id <id>`. Make token mode and internal-secret mode mutually exclusive, print the selected mode clearly, and route to the internal endpoint only when the internal flags are used.
6. Add integration tests for internal success and failure paths while preserving the current route tests. Cover missing/invalid internal secret, target user not found, personal import to target user, and household import that succeeds/fails based on target-user membership.
7. Update harness artifacts with the new feature record and verification evidence.

## Concrete Steps (Commands)

Run from repo root unless noted.

```bash
# targeted worker integration suite during implementation
pnpm --filter worker exec vitest run test/integration/migrate-expenses.spec.ts

# regenerate worker env types if bindings change
pnpm --filter worker cf-typegen

# backend focused verification
./init.sh typecheck
./init.sh test

# final repo verification before completion claim
./init.sh
```

Expected short outputs:

- `vitest` shows the migrate integration file passing with all tests green.
- `pnpm --filter worker cf-typegen` rewrites `apps/worker/worker-configuration.d.ts` without errors.
- `./init.sh typecheck` prints `OK`.
- `./init.sh test` prints `OK`.
- final `./init.sh` prints `Done!`.

## Validation and Acceptance

Happy path:

- Internal route with valid secret + valid `targetUserId` + personal payload returns HTTP 200 and persists expenses under the target user.
- Internal route with valid secret + valid `targetUserId` + `householdId` returns HTTP 200 only when the target user is an eligible member of that household.
- Existing `POST /api/v1/migrate/expenses` with bearer token still imports into the caller account exactly as before.

Failure paths:

- Missing internal secret header returns unauthenticated/unauthorized 401 style error and writes nothing.
- Wrong internal secret returns the same failure and writes nothing.
- Unknown `targetUserId` returns 404 and writes nothing.
- Valid secret + target user not in household returns 403 and writes nothing.
- Existing user route still returns 401 without bearer auth.

CLI acceptance:

- `node scripts/migrate-expenses.mjs file.json --admin-secret "$INTERNAL_API_KEY" --target-user-id <id> --dry-run` prints `mode: internal` (or equivalent), calls the internal endpoint, and returns the migrate summary.
- Token mode still works with `--token` or `ACCESS_TOKEN` and does not require `targetUserId`.

## Idempotence & Recovery

- Dry-run mode remains safe to re-run and is the recommended first step for every import.
- Real imports are not idempotent today; re-running the same file can create duplicate expenses. This plan does not add dedupe logic, so operational guidance must tell maintainers to dry-run first and avoid rerunning completed imports.
- Recovery for a bad real import remains manual cleanup through existing expense delete flows or direct operator intervention.

## Artifacts and Notes

- Primary evidence will be the updated integration test file and verification command outputs.
- If the env binding changes, include the regenerated diff for `apps/worker/worker-configuration.d.ts` as proof that runtime typings match config. For this feature, `cf-typegen` was still run as evidence and produced no diff because `INTERNAL_API_KEY` is a secret rather than a generated var binding.

## Interfaces & Dependencies

- Existing user-scoped request schema: `migrateExpensesRequestSchema(): ZodObject<...>`
- New internal request schema should be additive, likely `internalMigrateExpensesRequestSchema(): ZodObject<...>` extending the existing payload with `targetUserId: string`.
- Shared handler interface should accept a resolved target user id and auth mode, e.g. a helper invoked by both routes rather than duplicating migration logic.
- Internal secret is provided by Worker env via `readConfig(env)` as `INTERNAL_API_KEY` and is represented in `AppConfig`; generated Worker env typings do not change for this secret-only config.

## Risks / Blockers

- Main risk: accidentally weakening the existing public route by allowing target-user impersonation through the user-token path.
- Main security risk: logging or exposing the internal secret in CLI output, docs, or errors.
- Operational risk: duplicate imports remain possible on repeated real runs.
- Blocker risk: if no internal-auth precedent exists, keep the middleware minimal and local to migration instead of inventing a generic staff system.

## Open decisions

- Resolved: final route path is `POST /api/v1/internal/migrate/expenses`.
- Resolved: internal auth uses header `X-Internal-Api-Key`; missing or wrong secret returns 401.
