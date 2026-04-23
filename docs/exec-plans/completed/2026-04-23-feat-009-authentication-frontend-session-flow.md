# feat-009: Implement the frontend authentication session flow

## Objective

Replace the current mock-only auth shell flow with a real frontend session lifecycle that uses Firebase email/password auth, exchanges the Firebase ID token for app tokens, persists only the refresh token in secure client storage, refreshes the access token silently, and signs the user out cleanly. The observable result is that sign-in and sign-up pages authenticate against Firebase, protected routes stay accessible while the session is valid, expired access tokens recover automatically through the shared API client, and first-time users are routed into onboarding through one explicit post-auth decision seam.

## Purpose / Big Picture

`feat-005` created the public and protected route shells, but the current auth flow is still a local form stub: the sign-in and sign-up pages only validate input, `auth.store.ts` toggles `isAuthenticated` without real tokens, and `ShellGuard` trusts that mock flag. `feat-008` and `feat-033` now provide the backend session endpoints and the typed web API client seam needed to finish the real frontend session lifecycle.

This feature is frontend-led with shared-contract consumption. It should deliver one canonical auth session path for current and future web features: Firebase authenticates the credential flow, the web app exchanges the provider token with the worker, the auth store owns the session state and refresh schedule, route guards stop depending on fake local state, and sign-out revokes the worker session before clearing browser state.

## Scope and Out-of-Scope

### In Scope

- Web auth pages and route guard behavior:
  - `apps/web/src/pages/auth/sign-in-page.tsx`
  - `apps/web/src/pages/auth/sign-up-page.tsx`
  - `apps/web/src/components/layouts/shell-guard.tsx`
  - `apps/web/src/router.tsx`
  - `apps/web/src/app.test.tsx`
- Web auth state, storage, and transport wiring:
  - `apps/web/src/stores/auth.store.ts`
  - `apps/web/src/stores/auth.store.test.tsx`
  - `apps/web/src/stores/types.ts`
  - new auth API/service files under `apps/web/src/api/auth*.ts`, `apps/web/src/lib/auth/*`, and `apps/web/src/lib/storages/*` as needed
  - `apps/web/src/api/client.ts` only for adapter integration points already designed in `feat-033`
  - `apps/web/src/api/endpoints.ts` only if the auth endpoint registry needs alignment
  - `apps/web/src/types/api.ts` only if shared wire types must be imported or tightened for auth usage
- Frontend i18n keys and auth/session tests:
  - `apps/web/src/lib/i18n/locales/vi.json`
  - new focused auth/session tests in `apps/web/src/lib/auth/*.test.ts`, `apps/web/src/api/*.test.ts`, or route/store tests as needed
- Harness and planning artifacts:
  - `docs/exec-plans/active/2026-04-23-feat-009-authentication-frontend-session-flow.md`
  - `docs/exec-plans/active/index.md`
  - `harness/progress.md`
  - `harness/features/feat-009.json`
  - `harness/feature_index.json`

### Out of Scope

- Any worker route, contract, repository, or database changes unless implementation exposes a hard backend contract gap that cannot be bridged on the frontend.
- Profile editing, household creation/join flows, or the full onboarding feature from `feat-030`.
- Social login or additional identity providers beyond Firebase email/password.
- React Query feature hooks for post-auth domain data.
- Multi-device sync, remember-device UI, or session management UI beyond a working sign-out path.
- Deployment, secret provisioning, or production Firebase console setup beyond documenting required runtime variables.

## Non-negotiable Requirements

- The web app must use the real Firebase Auth SDK for email/password sign-in and sign-up; no mock credential path may remain on the main auth pages.
- App tokens remain opaque on the frontend. The access token must stay in memory only, while the refresh token is the only session credential persisted in browser storage.
- Persisted storage must be wrapped behind a storage adapter in `src/lib/storages/*`; components and stores must not call `localStorage` directly.
- The auth store remains the single owner of session state, session bootstrap status, current user snapshot, and auth actions.
- Protected-route decisions must not rely only on a boolean flag; they must respect session bootstrap, unauthenticated fallback, and post-refresh recovery.
- The shared API client from `feat-033` remains the only fetch/auth-header/401-retry seam. Do not add parallel raw `fetch(...)` auth calls inside pages.
- Silent refresh must be bounded and testable: one refresh path, one timer policy, and one unauthenticated fallback when refresh fails or the refresh token is invalid.
- Sign-out must call `POST /api/v1/auth/logout` when a current app session exists, then clear in-memory tokens, persisted refresh token, timer state, and any auth-derived routing state even if the network call fails.
- All new user-facing copy and validation errors must use i18n keys.
- Verification must cover happy path, invalid credentials/provider failure, token exchange failure, refresh success, refresh failure, logout cleanup, protected-route redirect, and return-to routing.

## Progress

- [x] (2026-04-23, owner: Codex, status: done) Review `feat-009` scope, upstream dependencies (`feat-005`, `feat-008`, `feat-033`), product specs, and the active frontend auth code to ground the plan in repo reality.
- [x] (2026-04-23, owner: Codex, status: done) Confirm the existing `src/api/client.ts` auth-session adapter seam and current route/store gaps so the plan does not introduce a competing transport abstraction.
- [ ] (2026-04-23, owner: Codex, status: current) Write failing regression coverage for the current missing behaviors: auth bootstrap, protected-route gating during bootstrap/anonymous states, session refresh handoff, logout cleanup, and post-auth routing.
- [ ] Add Firebase auth service/helpers and browser storage adapter(s), including a safe initialization path for tests and non-browser storage failures.
- [ ] Expand `auth.store.ts` from mock shell state into a real session store with explicit bootstrap, token, timer, user, and redirect actions that integrate with `createApiClient()` through its `AuthSessionAdapter`.
- [ ] Replace local form-only submit logic in the auth pages with Firebase credential submission, backend token exchange, translated error handling, and safe redirect decisions.
- [ ] Wire app startup and protected routes so existing refresh tokens restore the session before protected routing resolves, and failed refresh falls back to `/sign-in` without stale state.
- [ ] Implement logout orchestration and verify the API client, store, and route guard all converge on one unauthenticated cleanup path.
- [ ] Update harness evidence, mark `feat-009` complete when verification passes, and move this plan to `docs/exec-plans/completed/`.

## Surprises & Discoveries

- `feat-033` already created a usable `AuthSessionAdapter` seam in `apps/web/src/api/client.ts`, so `feat-009` should adapt the auth store to that interface instead of modifying all future API modules.
- `apps/web/src/api/endpoints.ts` currently exposes `auth.providerExchange`, while the feature description and product spec say `POST /auth/exchange`. Implementation must confirm whether this is a naming mismatch in the endpoint registry or a genuine backend contract drift before coding.
- `apps/web/package.json` does not currently include the Firebase web SDK, so this feature likely requires one justified dependency addition during implementation.
- The current onboarding redirect is only a local page-level default in `sign-up-page.tsx`; there is no durable first-run routing signal yet. The feature needs one explicit redirect decision seam so future onboarding logic can replace the temporary heuristic without rewriting the auth pages again.

## Decision Log

- Decision: Keep `feat-009` scoped to frontend implementation even though it consumes backend auth endpoints.
  Rationale: `feat-008` and `feat-033` already delivered the backend routes and typed client seam; the remaining work is session orchestration, storage, routing, and UI behavior in `apps/web`.
  Date/Author: 2026-04-23 / Codex

- Decision: Use one auth-domain service layer plus the existing store, not page-local Firebase/API orchestration.
  Rationale: Auth pages should stay focused on form UX and redirection, while token exchange, refresh, bootstrap, and logout remain reusable and testable outside the components.
  Date/Author: 2026-04-23 / Codex

- Decision: Keep the current store as the canonical session owner and expose the `AuthSessionAdapter` from it or a thin auth-session service around it.
  Rationale: `feat-005` already standardized Zustand auth ownership, and `feat-033` explicitly prepared its API client for store-backed integration.
  Date/Author: 2026-04-23 / Codex

- Decision: Treat the first-run onboarding redirect as a replaceable policy seam rather than hardcoding onboarding logic throughout the auth flow.
  Rationale: `feat-030` is still pending, and the repo does not yet expose a backend onboarding-readiness flag. This feature should create one narrow decision point that can later switch from heuristic routing to authoritative household/onboarding state.
  Date/Author: 2026-04-23 / Codex

## Risks and Blockers

- Risk: Firebase Auth introduces a new dependency and browser/runtime behavior that the repo does not yet exercise. The implementation should start with a small auth-service seam and tests before page rewiring.
- Risk: If bootstrap and route guard semantics are vague, protected routes may flicker to `/sign-in` before a valid refresh completes.
- Risk: If refresh timers are persisted or not cleared correctly, stale timers could fire after logout or across test runs.
- Risk: If the app endpoint registry and the backend contract still disagree on `exchange` vs `provider/exchange`, the real auth flow will fail despite correct frontend orchestration.
- Risk: The onboarding redirect policy may need to start with a temporary heuristic because no backend-owned “new user” flag exists yet.
- Blocker to watch: if Firebase project configuration or required env exposure for the web app is not already documented, implementation will need a short docs/env clarification step before the feature can be fully verified.

## Outcomes & Retrospective

- To be completed after implementation.

## Context and Orientation

- Current route shell:
  - `apps/web/src/router.tsx`
  - `apps/web/src/components/layouts/shell-guard.tsx`
- Current mock auth pages:
  - `apps/web/src/pages/auth/sign-in-page.tsx`
  - `apps/web/src/pages/auth/sign-up-page.tsx`
- Current auth store:
  - `apps/web/src/stores/auth.store.ts`
  - `apps/web/src/stores/auth.store.test.tsx`
  - `apps/web/src/stores/types.ts`
- Existing typed transport seam from `feat-033`:
  - `apps/web/src/api/client.ts`
  - `apps/web/src/api/endpoints.ts`
  - `apps/web/src/types/api.ts`
- Backend auth contracts already available to consume:
  - `apps/worker/src/contracts/auth.ts`
- Product behavior references:
  - `docs/product-specs/authentication.md`
  - `docs/product-specs/new-user-onboarding.md`

## Scope Map

### Expected File and Module Impact

- Existing frontend files likely edited:
  - `apps/web/src/pages/auth/sign-in-page.tsx`
  - `apps/web/src/pages/auth/sign-up-page.tsx`
  - `apps/web/src/components/layouts/shell-guard.tsx`
  - `apps/web/src/router.tsx`
  - `apps/web/src/stores/auth.store.ts`
  - `apps/web/src/stores/auth.store.test.tsx`
  - `apps/web/src/stores/types.ts`
  - `apps/web/src/app.test.tsx`
  - `apps/web/src/api/client.ts`
  - `apps/web/src/api/endpoints.ts`
  - `apps/web/src/lib/i18n/locales/vi.json`
- New frontend files likely added:
  - `apps/web/src/api/auth.ts`
  - `apps/web/src/lib/auth/firebase-auth.ts`
  - `apps/web/src/lib/auth/session-service.ts`
  - `apps/web/src/lib/auth/post-auth-redirect.ts`
  - `apps/web/src/lib/storages/auth-refresh-token-storage.ts`
  - matching focused tests under `apps/web/src/api/`, `apps/web/src/lib/auth/`, or `apps/web/src/lib/storages/`
- Harness artifacts to update during implementation:
  - `harness/features/feat-009.json`
  - `harness/feature_index.json`
  - `harness/progress.md`

### Layer Impact

- `Types`: auth session DTO usage, store state types, redirect-decision types, and storage adapter types.
- `Config`: Firebase web configuration/env exposure and auth endpoint constants.
- `Repo`: unchanged; no database or worker repository work is planned.
- `Service`: frontend auth-domain services for Firebase credential auth, session exchange, refresh, bootstrap, and logout orchestration.
- `Runtime`: route guard/bootstrap behavior, API-client auth header injection, timer-driven silent refresh, browser storage access.
- `UI`: sign-in/sign-up forms, protected-route behavior, onboarding redirect, sign-out entry flow.

### Hard Dependency Checks

- Lower layers do not depend on higher layers:
  - storage and auth services must not import page components
  - the store may depend on auth services, not the reverse on page UI
- UI does not bypass runtime/service contracts:
  - pages must call auth actions/services, not raw Firebase SDK calls plus direct `client.post(...)` combinations inline
- Data access enters through explicit adapter boundaries:
  - refresh token persistence must go through a storage adapter
  - API calls must go through `src/api/*` and the shared client
- New dependencies:
  - likely one justified addition: Firebase web SDK for credential auth
  - no new HTTP client, form library, or state library dependencies

### Compatibility and Sequencing Constraints

- Build on top of the current shell/store/router work from `feat-005`; do not replace the route structure unnecessarily.
- Consume the backend auth contracts from `feat-008` and the typed envelope/client seam from `feat-033`; do not duplicate token exchange or retry logic elsewhere.
- Keep the current onboarding page route stable so `feat-030` can build on it later.
- Preserve return-to behavior for protected deep links, but make redirect resolution happen after auth bootstrap rather than immediately on any anonymous render.

## Standards Enforcement

### Required References

- `docs/references/frontend/project-folder-structure.md`
- `docs/references/frontend/component-structure-pattern.md`
- `docs/references/frontend/naming-and-conventions-pattern.md`
- `docs/references/frontend/form-pattern.md`
- `docs/references/frontend/i18n-label-pattern.md`
- `docs/references/frontend/zustand-store-pattern.md`
- `docs/references/shared/type-naming-pattern.md`

### Concrete Coding Constraints

- Keep feature HTTP calls in `apps/web/src/api/*`; auth session orchestration may live in `apps/web/src/lib/auth/*`, but pages must stay thin.
- If auth-page child components are introduced, use `export const` and folder `index.ts` barrel rules from the component-structure reference.
- File names must stay `kebab-case`; new store/storage/service helpers must use named exports.
- User-facing text and validation errors must come from `t(...)` keys, with synchronized locale additions.
- The auth store must keep `_useAuthStore`, `useAuthStore`, and `authActions` naming, use selector access, and expose a `reset` action for tests.
- If persistence is used in Zustand, persist only truly required session data; do not persist transient bootstrap, loading, or error flags.
- DTO/Request/Response naming must match the shared type pattern when frontend-facing auth request/response types are added.

## Implementation Notes

- Mandatory patterns:
  - one auth API module for `exchange`, `refresh`, and `logout`
  - one browser storage adapter for the persisted refresh token
  - one Firebase auth wrapper for email/password operations and ID-token extraction
  - one session bootstrap/refresh orchestration seam
  - one redirect decision seam for post-auth destination selection
- Companion skills for implementation:
  - `tdd-workflow`
  - `verification-loop`
  - `security-review`
  - `frontend-patterns`
  - `documentation-lookup`
- Common pitfalls to avoid:
  - page-local Firebase initialization repeated across sign-in and sign-up
  - direct `localStorage` access from the store or components
  - persisting the access token
  - route redirects that run before bootstrap finishes
  - refresh recursion or multiple concurrent refresh timers
  - coupling the onboarding redirect directly to the sign-up page only

## Plan of Work (Narrative)

1. Lock the missing behaviors with focused tests before the store and pages change. Add route/store/service tests that demonstrate the current gaps: protected routes should wait for session bootstrap, a persisted refresh token should trigger a silent restore path, logout should clear all state, and failed refresh should fall back to the public auth shell.
2. Create the auth-domain seams in the canonical frontend locations. Add `apps/web/src/api/auth.ts` for auth endpoint calls using the shared `client` or a dedicated non-recursive auth client path, add `apps/web/src/lib/auth/firebase-auth.ts` for Firebase email/password flows plus ID-token extraction, and add `apps/web/src/lib/storages/auth-refresh-token-storage.ts` so refresh-token persistence is centralized and safe when storage access fails.
3. Expand `apps/web/src/stores/auth.store.ts` from shell-only state into a real session store. It should track at least `status`/bootstrap state, current authenticated user DTO, in-memory access token, persisted refresh-token availability, return-to path, and scheduled refresh bookkeeping. Keep refresh scheduling and cleanup behind actions so tests can assert behavior without rendering pages.
4. Integrate the store with `createApiClient()` by implementing the `AuthSessionAdapter` contract through the store/session service seam. `getAccessToken()` should read the current in-memory token, `refreshSession()` should use the persisted refresh token to call the backend refresh endpoint and update store state, and `handleUnauthenticated()` should route through one cleanup action that clears tokens, cancels timers, and preserves only safe redirect context.
5. Replace the local submit stubs in `sign-in-page.tsx` and `sign-up-page.tsx`. Forms should call the auth-domain service, show translated error feedback for Firebase/provider/API failures, and navigate only after the session store resolves the post-auth redirect decision. The sign-up path should mark a first-run redirect intent through the redirect policy seam rather than hardcoding onboarding routing directly in the page.
6. Rework route/bootstrap behavior. `ShellGuard` should distinguish between “session still bootstrapping” and “confirmed anonymous”, and app startup should attempt refresh-token bootstrap before redirecting away from protected routes. Preserve `returnTo` for deep links and avoid open-redirect behavior by continuing to sanitize destinations.
7. Implement sign-out orchestration and route regression checks. Sign-out should call the backend logout endpoint when possible, then always clear local auth state, timers, and persisted refresh token. Route and store tests should cover successful sign-out plus network-failure cleanup.
8. Finish by updating harness artifacts with evidence, marking `feat-009` done when the full verification path passes, and archiving this plan into `docs/exec-plans/completed/`.

## Concrete Steps (Commands)

Run from the repository root unless noted otherwise.

```bash
# Baseline repo verification before implementation
./init.sh

# Focused web auth/session tests while iterating
pnpm --filter web exec vitest run src/stores/auth.store.test.tsx src/app.test.tsx src/api/client.test.ts

# Focused auth-domain tests once new modules exist
pnpm --filter web exec vitest run src/api/auth.test.ts src/lib/auth/*.test.ts src/lib/storages/*.test.ts

# Web package verification
pnpm --filter web lint
pnpm --filter web typecheck
pnpm --filter web test
pnpm --filter web build

# Full workspace verification before completion
./init.sh
```

Expected short outputs:

- `./init.sh` ends with `=== Init complete ===`
- focused Vitest runs end with `passed`
- `pnpm --filter web build` ends with Vite build success output and no TypeScript errors

## Validation and Acceptance

### Happy Path

- A user can sign in with valid email/password and lands on the previous protected route or `/app` when no return path exists.
- A new sign-up session completes Firebase auth, token exchange, and lands on the onboarding decision route (`/app/onboarding` for the initial heuristic or equivalent explicit policy output).
- A page reload with a valid persisted refresh token restores the app session without forcing the user back to `/sign-in`.

### Validation and Error Paths

- Invalid form input keeps the user on the auth page and shows translated validation feedback.
- Firebase credential errors and backend exchange failures surface translated auth errors and do not mark the store authenticated.
- If the refresh token is missing, expired, or rejected, bootstrap resolves to unauthenticated state and protected routes redirect to `/sign-in`.

### Unauthorized / Forbidden Paths

- A protected API call returning `401` triggers exactly one refresh attempt through the auth-session adapter and retries once with the new access token.
- If refresh cannot recover, the app clears session state and returns to the public auth shell without infinite retry loops.

### Regression Checks

- `returnTo` still works for direct visits such as `/app/onboarding` and `/app/expenses`.
- Logout clears the persisted refresh token, in-memory access token, timers, and authenticated UI state even when the logout HTTP request fails.
- Existing public and protected shell routing tests continue to pass after the real session flow replaces the mock path.

### Acceptance Artifacts

- Passing web tests covering auth store/session services/routes.
- Passing `./init.sh` transcript.
- Updated `harness/features/feat-009.json` evidence pointing to the new tests and verification commands.

## Idempotence & Recovery

- Test, lint, typecheck, and build commands are safe to re-run.
- Store resets and storage helpers must support repeated test runs without leaking persisted auth state between tests.
- If Firebase setup or auth endpoint alignment blocks progress, pause implementation after the failing regression tests and record the exact gap in `Surprises & Discoveries` plus `harness/progress.md`.
- If a dependency addition for Firebase is required, keep the change isolated to `apps/web/package.json` and `pnpm-lock.yaml` so it is easy to review or revert independently.

## Harness Integration

- When implementation starts, keep this plan in `docs/exec-plans/active/` and update its `Progress`, `Decision Log`, and `Surprises & Discoveries` after each stopping point.
- On completion, move the plan to `docs/exec-plans/completed/` and update the active/completed indexes if the repo is still maintaining both lists.
- Update `harness/features/feat-009.json` with `status: "done"`, current `updated_at`, and concise evidence naming the auth/session verification.
- Update `harness/feature_index.json` to mark `feat-009` done.
- Prepend a session summary to `harness/progress.md` with files changed, blockers, and next steps.

## Open Decisions

- Open: should the frontend consume `API_ENDPOINTS.auth.providerExchange` as-is or rename it to `exchange` to match the feature description and product spec?
  Current direction: verify the worker route first, then rename only if the registry name is inconsistent with the real backend path.

- Open: where should the web Firebase config live and how should it be exposed to Vite?
  Current direction: place a narrow config reader under `apps/web/src/lib/constants/` or `apps/web/src/lib/auth/` and document required env keys during implementation.

- Open: what is the initial first-run onboarding signal?
  Current direction: start with an explicit frontend redirect policy seam that can use “fresh sign-up” as the temporary heuristic until a backend-owned onboarding readiness signal exists.

- Open: should refresh scheduling happen through raw `setTimeout` inside the store or through a tiny scheduler helper?
  Current direction: use the smallest testable abstraction that keeps timer cleanup explicit and does not push runtime concerns into React components.
