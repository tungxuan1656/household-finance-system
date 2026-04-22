# feat-033: Standardize API response envelopes and typed HTTP error handling

## Objective

Establish one canonical API response contract for the worker and one matching typed HTTP client foundation for the web app so future features stop inventing ad hoc success/error shapes. The observable result is that worker routes consistently return `{ success, data, error, meta }`, worker errors come from one explicit code registry with centralized mapping, and the web app consumes those responses through a fetch-based client that can attach auth headers, normalize server failures into typed errors, and support 401 refresh-and-retry via an auth-session adapter seam.

## Purpose / Big Picture

The current worker already has shared helpers in `apps/worker/src/lib/response.ts`, but success and error payloads are asymmetric: success responses omit `success` and `error`, error responses omit `success` and `data`, and route tests mostly assert only partial payload shapes. On the frontend, there is not yet a shared API client layer, so upcoming features risk scattering `fetch(...)`, auth-header logic, and server-error parsing across pages and stores.

`feat-033` is infrastructure-only fullstack work. It standardizes the public wire contract before more domain endpoints arrive, keeps backend error/status mapping centralized, and creates a web-side client seam that later API modules and `feat-009` auth flows can reuse without rewriting transport logic.

## Scope and Out-of-Scope

### In Scope

- `apps/worker/src/lib/response.ts`
- `apps/worker/src/lib/errors.ts`
- New worker cross-cutting error registry or envelope contract files under `apps/worker/src/lib/*` or `apps/worker/src/contracts/*` if needed
- `apps/worker/src/index.ts`
- Worker route modules that return the shared envelope:
  - `apps/worker/src/routes/auth.ts`
  - `apps/worker/src/routes/health.ts`
  - `apps/worker/src/routes/profile.ts`
  - `apps/worker/src/routes/protected.ts`
- Worker tests covering envelope and error mapping:
  - `apps/worker/test/unit/response.spec.ts`
  - `apps/worker/test/index.spec.ts`
- New web API-layer files:
  - `apps/web/src/api/client.ts`
  - `apps/web/src/api/endpoints.ts`
  - `apps/web/src/types/api.ts`
  - `apps/web/src/api/client.test.ts` or equivalent focused tests
- Web auth-state files only if needed to expose a minimal adapter seam:
  - `apps/web/src/stores/auth.store.ts`
  - `apps/web/src/stores/auth.store.test.tsx`
  - `apps/web/src/stores/types.ts`
- Planning and harness artifacts:
  - `docs/exec-plans/active/2026-04-22-feat-033-api-response-contract-error-handling-standardization.md`
  - `docs/exec-plans/active/index.md`
  - `harness/progress.md`
  - `harness/features/feat-033.json`
  - `harness/feature_index.json`

### Out of Scope

- Adding new business endpoints, UI screens, or domain CRUD flows.
- Replacing the current auth UX from `feat-009`.
- Introducing React Query hooks for domain data; this feature stops at the shared client layer.
- Database schema, migrations, or repository behavior changes.
- Translating error copy beyond preserving existing worker i18n message behavior.
- Creating a new workspace package for shared transport types unless implementation proves duplication is unmanageable.
- Any deployment or production secret changes.

## Non-negotiable Requirements

- All worker JSON responses under `/api/v1` must use one envelope shape:
  - success: `{ success: true, data, error: null, meta }`
  - failure: `{ success: false, data: null, error, meta }`
- `meta.requestId` must remain present on both success and failure responses.
- Worker routes must continue following `route -> handler -> repository`; no SQL or business orchestration moves into routes.
- Error codes must come from one explicit registry, not scattered string literals.
- Unknown exceptions must still map to a safe `500 INTERNAL_ERROR` response without leaking secrets or token material.
- The web client must be fetch-based and typed; feature code should not need to parse raw response envelopes manually.
- The web client must normalize non-2xx API responses into typed errors that preserve `status`, `code`, `message`, `details`, and `requestId` when present.
- The 401 retry flow must be designed around an explicit auth-session adapter so refresh behavior stays testable and does not hard-wire transport code into React components.
- Do not add third-party HTTP client dependencies such as Axios.
- Verification must cover happy path, validation failure, unauthenticated behavior, unknown-error fallback, and refresh-retry behavior at the unit level.

## Progress

- [x] (2026-04-22, owner: Codex, status: done) Review harness state, active backend/frontend standards, and current worker/web transport code to define a plan grounded in repo reality.
- [ ] (current, owner: Codex, status: pending) Align the web auth-session adapter seam with `feat-009` assumptions before implementation starts so 401 refresh-and-retry does not conflict with the future auth store contract.
- [ ] Add the worker-side canonical envelope helpers and error-code registry, then migrate all current `/api/v1` routes to it without changing route ownership boundaries.
- [ ] Expand worker unit/integration coverage so success, validation, auth, not-found, and unknown-error cases all assert the full envelope shape.
- [ ] Create the shared web API client, endpoint registry, API transport types, and typed error classes in the canonical `src/api` / `src/types` locations.
- [ ] Add web-side client tests for header injection, envelope parsing, server-error mapping, and one-shot 401 refresh-and-retry behavior through an injected auth-session adapter.
- [ ] Update harness evidence, mark `feat-033` status based on verification results, and move the plan to `completed/` when implementation is finished.

## Surprises & Discoveries

- `apps/worker/src/lib/response.ts` already centralizes `requestId` handling, so the feature can evolve an existing seam instead of inventing a second response layer.
- Current worker route tests already exercise health, auth, profile, validation, and logout flows, which gives strong acceptance coverage once assertions are upgraded to the full envelope.
- The current web app has no `src/api/` directory yet, so this feature should create it in the canonical location from the frontend folder-structure reference instead of following the older `lib/api` wording in the feature description.
- `feat-033` does not need to wait for `feat-009` as long as the web retry behavior hangs off an adapter seam. The only hard prerequisite worth keeping is `feat-008`, because the backend auth refresh/logout surface already exists there and provides the real API contract this feature standardizes against.
- The worker already uses locale-aware `AppError` factories in `apps/worker/src/lib/errors.ts`, so standardization must preserve translated messages while changing only wire shape and registry ownership.

## Decision Log

- Decision: Put the shared frontend transport client in `apps/web/src/api/client.ts` with related endpoint constants in `apps/web/src/api/endpoints.ts`, not under `src/lib/api/`.
  Rationale: `docs/references/frontend/project-folder-structure.md` defines `src/api/*` as the canonical shared API layer and reserves `lib/` for cross-feature utilities outside the API branch.
  Date/Author: 2026-04-22 / Codex

- Decision: Keep the worker response helper as the canonical backend envelope seam in `apps/worker/src/lib/response.ts`.
  Rationale: The file already owns request-id injection and unknown-error mapping, so extending it is lower-risk than introducing a second response abstraction.
  Date/Author: 2026-04-22 / Codex

- Decision: Use an injected `AuthSessionAdapter` contract on the web client instead of coupling `client.ts` directly to the current Zustand store shape.
  Rationale: This keeps refresh-and-retry behavior testable and lets `feat-033` land before `feat-009`, while preserving compatibility with later auth-store evolution.
  Date/Author: 2026-04-22 / Codex

- Decision: Do not create a new shared workspace package for transport types in this feature by default.
  Rationale: The repo does not yet have a shared package surface, and this feature should keep diffs small unless duplicated public API types become a real maintenance problem during implementation.
  Date/Author: 2026-04-22 / Codex

## Risks and Blockers

- Blocker: none for planning. `feat-009` remains the downstream consumer of this contract, but it is not a prerequisite to standardizing the worker envelope or landing the web client seam.
- Risk: Changing the worker success/error envelope shape will require updating existing route assertions and any implicit consumers that assume the old partial shape.
- Risk: If the client retry logic is not guarded carefully, a failed refresh could recurse or mask the original 401.
- Risk: Duplicated public API types across worker/web could drift if the implementation does not keep one clearly documented source of truth.
- Risk: Route tests that currently assert only `error.code` may pass while missing envelope regressions unless every acceptance assertion is tightened to the full response structure.

## Outcomes & Retrospective

- Planned outcome: every current worker route returns the same envelope contract, making future handlers and tests faster to add and easier to reason about.
- Planned outcome: the web app gains one reusable typed client seam so future domain modules can focus on business types rather than auth headers, response parsing, or error normalization.
- Expected follow-on: `feat-009` should integrate with this client through the adapter contract instead of inventing its own transport stack, reducing auth-specific glue code in future screens.

## Context and Orientation

- Worker app entry and global error handling: `apps/worker/src/index.ts`
- Worker response helper: `apps/worker/src/lib/response.ts`
- Worker error factories and codes: `apps/worker/src/lib/errors.ts`
- Current worker route surfaces using the helper:
  - `apps/worker/src/routes/auth.ts`
  - `apps/worker/src/routes/health.ts`
  - `apps/worker/src/routes/profile.ts`
  - `apps/worker/src/routes/protected.ts`
- Worker acceptance coverage:
  - `apps/worker/test/unit/response.spec.ts`
  - `apps/worker/test/index.spec.ts`
- Current frontend auth state seam:
  - `apps/web/src/stores/auth.store.ts`
  - `apps/web/src/stores/auth.store.test.tsx`
- Frontend transport layer does not exist yet:
  - `apps/web/src/api/` must be created
  - `apps/web/src/types/api.ts` will hold frontend-facing envelope and typed error contracts
- Related sequencing:
  - `harness/features/feat-008.json`
  - `harness/features/feat-009.json`

## Scope Map

### Expected File and Module Impact

- Existing backend files likely edited:
  - `apps/worker/src/lib/response.ts`
  - `apps/worker/src/lib/errors.ts`
  - `apps/worker/src/index.ts`
  - `apps/worker/src/routes/auth.ts`
  - `apps/worker/src/routes/health.ts`
  - `apps/worker/src/routes/profile.ts`
  - `apps/worker/src/routes/protected.ts`
  - `apps/worker/test/unit/response.spec.ts`
  - `apps/worker/test/index.spec.ts`
- New backend files likely added:
  - `apps/worker/src/contracts/api.ts` or `apps/worker/src/lib/error-codes.ts` if extracting envelope or code constants out of `errors.ts` improves clarity
- New frontend files likely added:
  - `apps/web/src/api/client.ts`
  - `apps/web/src/api/endpoints.ts`
  - `apps/web/src/types/api.ts`
  - `apps/web/src/api/client.test.ts`
- Existing frontend files likely edited only if needed for adapter wiring:
  - `apps/web/src/stores/auth.store.ts`
  - `apps/web/src/stores/auth.store.test.tsx`
  - `apps/web/src/stores/types.ts`

### Layer Impact

- `Types`: `ApiEnvelope<T>`, `ApiSuccessResponse<T>`, `ApiErrorResponse`, public error-code unions, typed client errors, and the frontend auth-session adapter interface.
- `Config`: API base-path constants and endpoint registry under `apps/web/src/api/endpoints.ts`.
- `Repo`: unchanged for this feature.
- `Service`: backend handler orchestration should stay unchanged; frontend client introduces the transport service seam used by future API modules.
- `Runtime`: worker error middleware and response serialization; frontend fetch wrapper with auth header injection and refresh-retry policy.
- `UI`: unchanged directly, except future UI code will consume the new client instead of raw fetch calls.

### Hard Dependency Checks

- Lower layers do not depend on higher layers:
  - backend response helpers stay in `lib/`, not in routes or handlers
  - frontend transport types stay in `src/types` / `src/api`, not in components
- UI does not bypass runtime/service contracts:
  - future web code must call `src/api/*` helpers, not `fetch(...)` from pages/components
- Data access enters through repository or explicit adapter boundaries:
  - unchanged on the backend; this feature must not move D1 access into routes
- New dependencies:
  - none approved or required; use the platform `fetch` API and existing Zustand tooling only

### Compatibility and Sequencing Constraints

- Preserve the existing `/api/v1/*` routes and status codes while changing envelope shape.
- Preserve current localized worker error messages; only the envelope and code registry ownership are changing.
- Web retry behavior must attempt refresh at most once per request and must surface the original failure if refresh cannot recover.
- Final production wiring of token persistence and scheduled silent refresh belongs to `feat-009`; this feature should verify auth-header injection and refresh-retry through the shared adapter contract plus focused tests.

## Standards Enforcement

### Required References

- `docs/references/backend/project-folder-structure.md`
- `docs/references/backend/architecture-and-boundaries.md`
- `docs/references/backend/api-contract-and-validation.md`
- `docs/references/backend/error-handling-pattern.md`
- `docs/references/backend/security-and-auth-pattern.md`
- `docs/references/backend/testing-pattern.md`
- `docs/references/backend/cloudflare-workers.md`
- `docs/references/frontend/project-folder-structure.md`
- `docs/references/frontend/component-structure-pattern.md`
- `docs/references/frontend/naming-and-conventions-pattern.md`
- `docs/references/frontend/zustand-store-pattern.md`
- `docs/references/shared/type-naming-pattern.md`

### Concrete Coding Constraints

- Worker transport helpers remain in `apps/worker/src/lib/`; do not invent a mixed `dto/` or route-local response helper.
- Public transport-facing types should use `DTO`, `Request`, and `Response` suffixes where they describe API payloads; keep the common wrapper named `ApiResponse<T>` or `ApiEnvelope<T>` consistently.
- Route files may parse inputs and call helpers, but they must not build ad hoc response objects inline after this feature lands.
- Worker error codes must remain explicit uppercase identifiers such as `INVALID_INPUT` and `UNAUTHENTICATED`; no message-string matching on the frontend.
- Frontend transport code belongs in `apps/web/src/api/*`, and reusable public transport types belong in `apps/web/src/types/*`.
- If the auth store is touched, use the existing `_useAuthStore` / `useAuthStore` / `authActions` naming pattern and keep persistence limited to truly required session fields.
- Any new child component introduced during testing or harnessing must follow `export const` and folder `index.ts` rules, though the expected implementation should remain mostly non-UI.
- Keep comments in English and avoid introducing temporary mock data into UI files.

## Implementation Notes

- Mandatory patterns:
  - one worker envelope helper module
  - one explicit worker error-code registry
  - one frontend fetch client
  - one frontend endpoint registry
  - one typed frontend error hierarchy
  - one injected auth-session adapter for header lookup and refresh
- Companion skills for implementation:
  - `tdd-workflow`
  - `security-review`
  - `verification-loop`
  - `backend-patterns`
  - `frontend-patterns`
  - `documentation-lookup` if Cloudflare Worker error/middleware behavior becomes runtime-specific
- Common pitfalls to avoid:
  - updating success envelopes but forgetting not-found or unknown-error paths
  - retrying refresh more than once for the same request
  - storing refresh logic inside components instead of the shared client seam
  - coupling the client directly to the current auth store shape from `feat-005`
  - leaving tests that only assert partial payloads and therefore miss envelope drift

## Open Decisions

- Open: should the public frontend wrapper be named `ApiResponse<T>` or `ApiEnvelope<T>`?
  Current direction: use `ApiEnvelope<T>` for the wire wrapper to distinguish it from business `*Response` payload types such as `RefreshSessionResponse`.
- Open: should worker error-code constants stay in `apps/worker/src/lib/errors.ts` or move to a dedicated `apps/worker/src/lib/error-codes.ts`?
  Current direction: extract only if `errors.ts` becomes too crowded after envelope changes.
- Open: should the first implementation update `feat-009` to consume the new client immediately, or land `feat-033` with adapter-based unit coverage first?
  Current direction: keep `feat-033` implementation self-contained with adapter-based tests, then integrate `feat-009` afterward as a downstream consumer.

## Interfaces & Dependencies

- Existing backend interfaces:
  - `AppError` in `apps/worker/src/lib/errors.ts`
  - `success(...)`, `errorResponse(...)`, `fromUnknownError(...)` in `apps/worker/src/lib/response.ts`
- Existing auth payload contracts:
  - `ExchangeProviderRequest`
  - `ExchangeProviderResponse`
  - `RefreshSessionRequest`
  - `RefreshSessionResponse`
  - `LogoutSessionResponse`
- Planned frontend transport interfaces:

```ts
export type ApiErrorCode =
  | 'INVALID_INPUT'
  | 'UNAUTHENTICATED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR'

export type ApiErrorDTO = {
  code: ApiErrorCode
  message: string
  details?: unknown
}

export type ApiMetaDTO = {
  requestId: string
}

export type ApiEnvelope<T> =
  | {
      success: true
      data: T
      error: null
      meta: ApiMetaDTO
    }
  | {
      success: false
      data: null
      error: ApiErrorDTO
      meta: ApiMetaDTO
    }

export interface AuthSessionAdapter {
  getAccessToken(): string | null | Promise<string | null>
  refreshSession(): Promise<string | null>
  handleUnauthenticated(error: ApiClientError): void | Promise<void>
}
```

- Planned client surface:

```ts
export class ApiClientError extends Error {
  status: number
  code: ApiErrorCode | 'HTTP_ERROR' | 'NETWORK_ERROR'
  details?: unknown
  requestId?: string
}

export type ApiClient = {
  get<T>(path: string, init?: RequestInit): Promise<T>
  post<T, TBody = unknown>(path: string, body?: TBody, init?: RequestInit): Promise<T>
  patch<T, TBody = unknown>(path: string, body?: TBody, init?: RequestInit): Promise<T>
}
```

## Plan of Work (Narrative)

1. Tighten the worker-side public contract in `apps/worker/src/lib/response.ts` so every helper returns the full envelope shape with `success`, `data`, `error`, and `meta.requestId`. Keep request-id resolution and locale-aware unknown-error fallback centralized there.
2. Decide whether `apps/worker/src/lib/errors.ts` remains the single home for both error-code literals and `AppError` factories or whether a small `error-codes.ts` extraction improves clarity. Either way, route and helper code must import codes from one place rather than repeating string literals.
3. Update `apps/worker/src/index.ts` and all current route modules to use the standardized helpers without changing route ownership boundaries or handler signatures.
4. Tighten worker tests:
   - `apps/worker/test/unit/response.spec.ts` should assert the full success/failure envelope and generic unknown-error mapping.
   - `apps/worker/test/index.spec.ts` should assert the full envelope on health, validation, auth, logout, protected, and not-found cases.
5. Create the canonical frontend transport folder:
   - `apps/web/src/api/endpoints.ts` for base path and route constants
   - `apps/web/src/types/api.ts` for envelope, meta, error, and client-facing transport types
   - `apps/web/src/api/client.ts` for fetch wrapper logic
6. Implement the web fetch client so it:
   - serializes JSON bodies
   - adds `Accept: application/json`
   - adds `Authorization: Bearer <token>` when the adapter provides an access token
   - parses the standardized envelope
   - throws `ApiClientError` on network, parse, or API failures
   - retries once after a 401 by calling `AuthSessionAdapter.refreshSession()`
7. Only if needed for adapter realism, expose a narrow auth-store seam in `apps/web/src/stores/auth.store.ts` that later `feat-009` can fill with real access-token / refresh-session behavior. Do not force the full auth implementation into this feature.
8. Add focused client tests proving:
   - success payload unwrap
   - typed error mapping from standardized worker error envelopes
   - auth-header injection when a token exists
   - single retry on 401 followed by success
   - refresh failure surfaces unauthenticated state cleanly without infinite recursion
9. Re-run full verification, then update harness artifacts with evidence and remaining dependency notes before closing the feature.

## Concrete Steps (Commands)

Run from the repo root unless noted otherwise.

```bash
# Baseline repo verification
./init.sh

# Worker-focused verification while iterating on the envelope
pnpm --filter worker exec vitest run test/unit/response.spec.ts test/index.spec.ts
pnpm --filter worker lint
pnpm --filter worker typecheck

# Web-focused verification while iterating on the client seam
pnpm --filter web exec vitest run src/api/client.test.ts src/stores/auth.store.test.tsx
pnpm --filter web lint
pnpm --filter web typecheck
pnpm --filter web build

# Final workspace verification
./init.sh
```

Expected short outputs:

- `./init.sh` ends with `=== Init complete ===`
- Worker test run shows the response and route suites passing, for example `2 files passed`
- Web test run shows the client and store suites passing, for example `2 files passed`
- `pnpm --filter web build` ends with `vite build` success output and no TypeScript errors

## Verification Path

1. Confirm the baseline repo passes `./init.sh` before implementation or record any unrelated failure as plan context.
2. Write or tighten worker tests first so the current asymmetric envelope fails against the new assertions.
3. Implement the worker envelope/error standardization until worker unit + integration tests pass.
4. Add frontend client tests for success, typed failures, auth-header injection, and one-shot 401 retry through a mocked adapter.
5. Implement the frontend client and any minimal auth-store seam until focused web tests pass.
6. Re-run repo-wide verification with `./init.sh`.
7. Record evidence in harness artifacts and move the plan to `completed/` only after the full verification path passes.

## Validation and Acceptance

### Happy Path

- `GET /api/v1/health` returns HTTP 200 and JSON like:
  - `success: true`
  - `data.ok: true`
  - `error: null`
  - `meta.requestId` present
- `POST /api/v1/auth/provider/exchange` and `POST /api/v1/auth/refresh` return the same success envelope shape around their existing payloads.
- Web client `get/post/patch` methods resolve with typed `data` payloads, not raw envelopes.

### Validation and Error Paths

- Invalid request bodies return HTTP 400 with:
  - `success: false`
  - `data: null`
  - `error.code: 'INVALID_INPUT'`
  - `meta.requestId` present
- Unknown routes return HTTP 404 with the same failure envelope and `NOT_FOUND`.
- Unhandled exceptions still return HTTP 500 with `INTERNAL_ERROR` and do not leak stack traces or secrets.

### Unauthorized / Forbidden

- Missing or invalid auth on protected endpoints returns HTTP 401 and the full failure envelope.
- When the web client receives a 401 and refresh succeeds once, it retries the original request once and returns the recovered payload.
- When refresh fails, the client throws a typed unauthenticated error and gives the adapter a chance to clear session state.

### Regression Checks

- Existing worker route tests still pass after envelope assertions are tightened.
- The worker i18n message text remains localized as before for error cases.
- The client never performs more than one refresh attempt per failed request.
- No UI or feature module starts calling raw `fetch(...)` directly once the client seam is introduced for future transport work.

## Idempotence & Recovery

- The implementation is code-only and safe to re-run; lint, typecheck, tests, and build commands are idempotent.
- If the envelope refactor temporarily breaks multiple worker tests, recover by fixing `apps/worker/src/lib/response.ts` first and then updating route assertions in `apps/worker/test/index.spec.ts` before touching frontend code.
- If the web retry logic causes recursion, recover by disabling the retry branch behind the adapter seam, re-running focused client tests, and reintroducing retry only with an explicit per-request guard.
- No database backup or migration rollback is required because this feature does not touch schema or persisted data.

## Artifacts and Notes

- Required acceptance artifacts when implementation is complete:
  - passing worker response/route test transcript
  - passing web client/store test transcript
  - successful final `./init.sh` transcript
  - updated `harness/features/feat-033.json` evidence string referencing the above checks
- Recommended evidence snippets:
  - one worker success envelope assertion
  - one worker failure envelope assertion
  - one web client retry test name proving 401 recovery

## Harness Integration

- Update `harness/features/feat-033.json` with implementation summary, dependency note on `feat-009` if still relevant, and concrete verification evidence.
- Update `harness/feature_index.json` to mark `feat-033` as `done` only after the full verification path passes.
- Prepend a session entry to `harness/progress.md` after plan creation, then prepend another entry after implementation with changed files, blockers, and next steps.
- Move this file from `docs/exec-plans/active/` to `docs/exec-plans/completed/` when the feature is fully verified, and update both index files accordingly.
