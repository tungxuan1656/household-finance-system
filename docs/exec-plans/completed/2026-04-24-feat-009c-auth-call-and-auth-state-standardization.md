# feat-009c: Standardize auth API calling and auth-state handling in `apps/web`

## Purpose / Big Picture

Simplify and standardize the frontend authentication lifecycle so auth behavior is predictable on first load, page refresh, and token expiry. Users will continue using the same sign-in/sign-up UI, but form handling will be schema-driven (`react-hook-form` + `zod`), auth requests will run through one axios client layer, and 401 failures will recover via refresh-and-retry automatically. Session state will be persisted in the auth store and route rendering will wait for hydration, preventing false redirects during reload.

## Scope

- In scope:
  - `apps/web/src/api/client.ts` (rewrite to axios-based client and interceptors)
  - `apps/web/src/api/auth.ts` (align to the new client behavior)
  - `apps/web/src/lib/auth/session-service.ts` (simplify sign-in/up/refresh/logout orchestration)
  - `apps/web/src/stores/auth.store.ts` and `apps/web/src/stores/auth.store.test.tsx` (persisted auth session + hydration state)
  - `apps/web/src/components/layouts/shell-guard.tsx` and routing auth guards (hydration-gated guard behavior)
  - `apps/web/src/pages/auth/sign-in-page.tsx`
  - `apps/web/src/pages/auth/sign-up-page.tsx` (RHF + zod wiring with existing UI layout)
  - `apps/web/src/api/client.test.ts` and relevant auth/session/route tests
  - `apps/web/package.json` and lockfile for form dependencies
- Out of scope:
  - Worker/backend API contract changes
  - Visual redesign outside the minimum UI wiring needed for form-controller/error rendering
  - New auth providers beyond current Firebase email/password

## Non-negotiable Requirements

- The plan is self-contained and executable from repository context alone.
- The change must produce observable behavior:
  - persisted auth session rehydrates correctly,
  - guarded routes do not redirect before hydration,
  - 401 requests are retried after successful refresh,
  - auth forms validate via schema and submit through the unified auth service.
- Key terms used in this plan:
  - `hydration`: Zustand persist restoring state from storage into runtime memory.
  - `refresh-and-retry`: when an API request returns 401, obtain a new access token through refresh endpoint and replay failed requests once.
  - `failedQueue`: in-memory list of failed requests waiting for one active refresh cycle to finish.

## Progress

- [x] 2026-04-24: Captured implementation goals and chosen direction (persist store + hydration gate + axios interceptor queue retry).
- [x] Add form dependencies (`react-hook-form`, `zod`, `@hookform/resolvers`) in `apps/web`.
- [x] Rewrite `apps/web/src/api/client.ts` to axios with request/response interceptors and typed error mapping.
- [x] Implement queued 401 refresh-and-retry behavior to replay failed API calls after token renewal.
- [x] Refactor auth store to persisted session state with explicit hydration-complete state (`isSessionChecked`).
- [x] Simplify session service flow (Firebase -> exchange -> set store session, refresh, logout cleanup).
- [x] Update auth route guards to block rendering until hydration is complete.
- [x] Refactor sign-in/sign-up pages to RHF + zod while preserving current UI layout and copy.
- [x] Update/extend tests for client interceptor behavior, store hydration, route guards, and auth forms.
- [x] Run verification (`./init.sh`) and collect evidence for harness update.

## Surprises & Discoveries

- Existing web dependencies already include `axios`, so transport refactor does not add a new HTTP dependency.
- Current auth flow still carries bootstrap-era complexity; this feature intentionally replaces it with hydration-gated state restoration.
- Backend refresh response currently rotates token pair but does not return user payload, so user state persistence must be handled on FE side.

## Decision Log

- Decision: Persist `user`, `accessToken`, and `refreshToken` in auth store instead of split token storage.
  Rationale: Team explicitly chose store-persist + hydration gate for deterministic startup behavior.
  Date/Author: 2026-04-24 / Codex + user

- Decision: Keep UI design intact and only update UI wiring needed by RHF/zod/controller-based form handling.
  Rationale: Feature scope focuses on auth behavior standardization, not visual redesign.
  Date/Author: 2026-04-24 / Codex + user

- Decision: Use interceptor queue pattern (`isRefreshing` + `failedQueue`) for 401 recovery.
  Rationale: Prevent duplicate refresh requests and guarantee replay of pending failed requests after refresh succeeds.
  Date/Author: 2026-04-24 / Codex

## Outcomes & Retrospective

- Completed `feat-009c` with the target architecture: axios transport + centralized interceptor retry, persisted auth store hydration gate, and simplified auth orchestration.
- Added regression coverage for concurrent 401 refresh queue replay, hydrated-route gating, session store behavior, and schema-driven auth form validation.
- Verification status:
  - `pnpm --filter web lint` passed.
  - `pnpm --filter web typecheck` passed.
  - `pnpm --filter web test` passed.
  - `pnpm --filter web build` passed.
  - `./init.sh` passed (after removing transient `apps/worker/.wrangler/tmp` generated artifact from a prior run).

## Context and Orientation

- Current auth transport: `apps/web/src/api/client.ts`, `apps/web/src/api/auth.ts`
- Current auth state and actions: `apps/web/src/stores/auth.store.ts`
- Current auth lifecycle orchestration: `apps/web/src/lib/auth/session-service.ts`
- Current auth entry screens: `apps/web/src/pages/auth/sign-in-page.tsx`, `apps/web/src/pages/auth/sign-up-page.tsx`
- Current route guard layer: `apps/web/src/components/layouts/shell-guard.tsx`, `apps/web/src/router.tsx`
- Harness tracking: `harness/feature_index.json`, `harness/features/feat-009c.json`, `harness/progress.md`

## Plan of Work (Narrative)

1. Add RHF/zod dependencies and align imports/types for form schema usage in auth pages.
2. Rewrite API client around `axios.create` with one request interceptor for auth header injection and one response interceptor for 401 handling. Implement retry guard (`_retry`) and refresh queue replay so all pending failed requests are retried with the new access token.
3. Refactor auth store to use persist middleware for session fields and add explicit hydration-complete state so route resolution waits for restored state.
4. Simplify session-service operations:
   - sign-in/sign-up: Firebase credential auth -> get ID token -> backend exchange -> store session (`user`, access/refresh tokens).
   - refresh: call refresh endpoint with persisted refresh token and update store tokens.
   - logout: call backend logout best-effort then clear local auth state.
5. Update route guard behavior to mirror hydration-first logic:
   - protected routes: block until session checked; redirect only after checked + unauthenticated.
   - public routes: block until session checked; redirect to app when checked + authenticated.
6. Convert sign-in and sign-up forms to schema-based RHF flow while preserving current UI composition and i18n copy.
7. Update tests for:
   - axios interceptor attach/refresh/retry queue behavior,
   - store hydration and actions,
   - guard redirects after hydration,
   - form validation and submit wiring.
8. Run full verification and update harness evidence/status artifacts.

## Concrete Steps (Commands)

Run from repo root:

```bash
# baseline/full verification
./init.sh

# targeted web verification while implementing
pnpm --filter web lint
pnpm --filter web typecheck
pnpm --filter web test
pnpm --filter web build

# focused auth tests (examples)
pnpm --filter web exec vitest run src/api/client.test.ts src/stores/auth.store.test.tsx src/lib/auth/session-service.test.ts src/app.test.tsx
```

Expected short transcript examples:

- `vitest ...` => `X passed, 0 failed`
- `pnpm --filter web build` => build completed without TypeScript or Vite errors
- `./init.sh` => all workspace checks pass

## Validation and Acceptance

- Acceptance behavior checks:
  - Reload on authenticated session does not flash-redirect to `/sign-in` before hydration.
  - Unauthenticated access to protected routes redirects to `/sign-in` only after hydration check completes.
  - Any API request failing with 401 is retried once after refresh succeeds.
  - Multiple concurrent 401 responses trigger a single refresh request and queued request replay.
  - Sign-in/sign-up forms validate with zod schema and surface field errors consistently.
- Verification commands:
  - `./init.sh`
  - `pnpm --filter web test`
  - targeted vitest suites for auth client/store/service/route

## Idempotence & Recovery

- Most changes are idempotent and safe to re-run (`pnpm`, tests, builds).
- If the axios interceptor refactor introduces request loops, rollback by:
  - temporarily disabling retry in interceptor,
  - keeping direct error propagation,
  - re-running focused client tests before restoring queue logic.
- No destructive DB or migration operations are included in this feature scope.

## Artifacts and Notes

- Primary evidence to collect at completion:
  - passing auth-focused test outputs,
  - full `./init.sh` success,
  - updated harness feature record with verification evidence.

## Interfaces & Dependencies

- External libraries:
  - `axios`: HTTP client + interceptor mechanism for auth header and 401 recovery.
  - `react-hook-form`: form state/control.
  - `zod`: schema validation.
  - `@hookform/resolvers`: zod resolver bridge for RHF.
- Internal modules:
  - `apps/web/src/types/api.ts`: API envelope and error-code contracts.
  - `apps/web/src/types/auth.ts`: auth DTO and request/response contracts.
  - `apps/web/src/lib/auth/firebase-auth.ts`: Firebase auth adapter.
  - `apps/web/src/stores/auth.store.ts`: canonical session owner and hydration state source.
