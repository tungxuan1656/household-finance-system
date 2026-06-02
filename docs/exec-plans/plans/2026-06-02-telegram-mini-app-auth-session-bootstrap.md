# Telegram Mini App auth provider exchange and session bootstrap

## Purpose / Big Picture

Add Telegram as a second identity provider on the existing worker session model so the future `apps/tma` client can exchange a verified Telegram launch context for the same app access/refresh token pair that web already uses. Users will not see a new email/password form inside TMA; the TMA shell will read the Telegram launch context, exchange it for an app session, and join the shared refresh/logout lifecycle. No offline or guest session is implied, and no parallel Telegram-only session model is created.

## Scope

In scope:

- Worker contract normalization on `POST /api/v1/auth/provider/exchange` to accept a discriminated-union provider payload.
- Telegram launch-context verification using Cloudflare-compatible `crypto.subtle` HMAC-SHA256 against the bot token, plus `auth_date` freshness check.
- Telegram identity mapping on the existing `auth_identities` table (no D1 migration needed — table is already multi-provider).
- `apps/tma` auth bootstrap, refresh, and logout integration gated by the feat-079 scaffold shell.
- Storage adapter with `SecureStorage` first / `localStorage` fallback (no `DeviceStorage` for auth tokens), memory-only fallback when `SecureStorage` is unsupported.
- Fatal launch-error UI for invalid or missing launch context.
- Worker unit + integration tests; TMA storage/bootstrap unit tests; e2e smoke against Telegram test environment.

Expected touched paths:

- `apps/worker/src/contracts/auth.ts`
- `apps/worker/src/types/auth.ts`
- `apps/worker/src/handlers/auth/exchange-provider-token.ts`
- `apps/worker/src/handlers/auth/refresh-session.ts`
- `apps/worker/src/handlers/auth/logout-session.ts`
- `apps/worker/src/lib/auth/telegram.ts` (new)
- `apps/worker/src/lib/auth/jwt.ts` (no behavior change; verify shared session helper stays shared)
- `apps/worker/src/lib/env.ts`
- `apps/worker/src/db/repositories/user-repository.ts`
- `apps/worker/src/db/repositories/session-repository.ts` (read-only if no change needed)
- `apps/worker/src/routes/auth.ts`
- `apps/worker/test/integration/auth-telegram.spec.ts` (new)
- `apps/worker/test/integration/auth-provider-exchange.spec.ts` (extend for both providers)
- `apps/worker/test/unit/lib/auth/telegram.spec.ts` (new)
- `apps/worker/test/fixtures/auth-identities.ts` (new helper if needed)
- `apps/worker/wrangler.toml` (env hints) and `.dev.vars.example` (new vars)
- `apps/tma/src/lib/storage/adapter.ts` (new)
- `apps/tma/src/lib/storage/keys.ts` (new)
- `apps/tma/src/lib/telegram/launch-params.ts` (new; thin wrapper)
- `apps/tma/src/lib/auth/api.ts` (new)
- `apps/tma/src/lib/auth/session.ts` (new)
- `apps/tma/src/features/auth/store.ts` (new)
- `apps/tma/src/features/auth/bootstrap.tsx` (new)
- `apps/tma/src/features/auth/AuthProvider.tsx` (new)
- `apps/tma/src/features/auth/refresh-interceptor.ts` (new)
- `apps/tma/src/features/auth/fatal-launch-screen.tsx` (new)
- `apps/tma/src/i18n/vi.json` and `en.json` (new auth-related keys)
- `apps/tma/src/test/storage-adapter.test.ts` (new)
- `apps/tma/src/test/auth-bootstrap.test.ts` (new)
- `docs/references/tma/auth-and-bot-pattern.md` (request shape update)
- `docs/references/tma/state-and-storage-pattern.md` (fallback policy recap)
- `docs/product-specs/authentication.md` (TMA = supported provider)
- `docs/TMA.md` (no change expected; verified)
- `harness/feature_index.json`
- `harness/features/feat-080.json`
- `harness/progress.md`

Out of scope:

- TMA scaffold itself (must land in feat-079 first; this plan assumes `apps/tma` exists with the bootable shell, providers, and router).
- Expense, household, budget, group, or insights product flows in TMA.
- Bot runtime and webhook handlers.
- TMA read surfaces, hardening, and broader device QA.
- Production secret provisioning for `TELEGRAM_BOT_TOKEN` (only local `.dev.vars` template is added).
- Web auth UI changes (Firebase sign-in / sign-up stay unchanged).

## Non-negotiable Requirements

- Reuse the existing `POST /api/v1/auth/provider/exchange` route; no parallel Telegram-only route family.
- The same `access token` + `refresh token` shape is issued for both providers, stored in the same `refresh_sessions` table, with the same TTL config.
- `auth_identities` is the source of truth for provider → user mapping; no new tables.
- TMA client must verify launch context on the worker before any session state is trusted.
- `SecureStorage` is the preferred store for the refresh token; if unsupported, the session stays memory-only and re-exchanges on next supported launch.
- App auth tokens must never be persisted to `DeviceStorage` or `localStorage`; only the storage adapter owns that decision.
- Cloudflare-compatible crypto only; no Node-only verification helpers inside the worker.
- The `provider` field in `ExchangeProviderTokenInput` becomes a discriminated union literal (`'firebase' | 'telegram'`); existing Firebase request bodies remain valid.

## Progress

- [ ] Normalize `ExchangeProviderRequest` schema to a discriminated union and propagate the change through `ExchangeProviderTokenInput` and the route.
- [ ] Add `apps/worker/src/lib/auth/telegram.ts` with `verifyTelegramLaunchData` using `crypto.subtle` HMAC-SHA256 and `auth_date` freshness check.
- [ ] Thread `telegramBotToken` and `telegramFreshnessWindowSeconds` through `readConfig` and `AppConfig`.
- [ ] Parameterize `findIdentityUserId` and `upsertUserBy*Identity` so the provider is a parameter; add `upsertUserByTelegramIdentity`.
- [ ] Extract `issueAppSession(env, user, userAgent, ipAddress)` helper used by both providers.
- [ ] Update `exchangeProviderToken` to switch on `input.provider` and call the matching identity branch.
- [ ] Add worker integration tests for valid, expired `auth_date`, invalid hash, missing `user`, unsupported provider, and backward-compat Firebase cases.
- [ ] Add worker unit tests for `verifyTelegramLaunchData` covering: valid signature, tampered field, missing `hash`, bad encoding, replay-window expiry.
- [ ] Add `.dev.vars.example` entries for `TELEGRAM_BOT_TOKEN` and `TELEGRAM_FRESHNESS_WINDOW_SECONDS`.
- [ ] Update `docs/references/tma/auth-and-bot-pattern.md` with the new request shape and worker contract.
- [ ] Update `docs/product-specs/authentication.md` to mark Telegram as a supported provider and document the failure-state UI contract.
- [ ] Add `apps/tma/src/lib/storage/adapter.ts` and `keys.ts` with capability detection and `SecureStorage` / memory fallback.
- [ ] Add `apps/tma/src/lib/telegram/launch-params.ts` that returns the raw `initData` string from `@tma.js/sdk-react`.
- [ ] Add `apps/tma/src/lib/auth/api.ts` with `exchangeProviderToken`, `refreshSession`, `logoutSession` against the worker.
- [ ] Add `apps/tma/src/features/auth/store.ts` (Zustand) for `idle | bootstrapping | authenticated | error` plus `user`, `accessToken`, `refreshToken`.
- [ ] Add `apps/tma/src/features/auth/bootstrap.tsx` that gates the router on bootstrap completion and renders the fatal launch screen on failure.
- [ ] Add `apps/tma/src/features/auth/AuthProvider.tsx` and `useAuth` hook.
- [ ] Add `apps/tma/src/features/auth/refresh-interceptor.ts` that wraps the API client and refreshes once on 401.
- [ ] Add `apps/tma/src/features/auth/fatal-launch-screen.tsx` with localized copy and a "Reopen from Telegram" CTA.
- [ ] Add TMA unit tests for storage adapter (supported / unsupported / corrupt) and bootstrap order (valid auth, invalid auth, intent-routing cases).
- [ ] Add TMA i18n keys for launch-invalid, network-error, and reopen-guidance.
- [ ] Run targeted verification (`./init.sh lint`, `./init.sh typecheck`, `./init.sh test`, `./init.sh build`) for the touched scope.
- [ ] Run final `./init.sh` and `gitnexus_detect_changes(scope: 'all')` after all updates.

## Surprises & Discoveries

- The `auth_identities` table schema (`provider` + `provider_subject` with a uniqueness constraint) is already multi-provider, so feat-080 does **not** require a D1 migration. The work is limited to parameterizing the existing repository helpers.
- `ExchangeProviderRequest` currently uses `z.literal('firebase')` with a hardcoded `idToken` field; the simplest normalization is `z.discriminatedUnion('provider', [...])` so existing web clients keep working without a contract bump.
- The `exchangeProviderToken` handler currently embeds token issuance inline. Extracting `issueAppSession` reduces duplication and makes the two provider branches symmetric.
- `apps/tma` does not exist yet on disk; all TMA client steps above are blocked until feat-079 lands.
- TMA storage capabilities (`SecureStorage`, `DeviceStorage`) are version-gated; the `isSupported` checks come from `@tma.js/sdk` and must be wrapped, not assumed.
- The Telegram test environment expects the same endpoint contract for the Mini App; there is no separate TMA-only worker.

## Decision Log

- Decision: use a `z.discriminatedUnion('provider', [...])` on `ExchangeProviderRequest` instead of a separate `/auth/telegram/exchange` route.
  Rationale: keeps the worker session lifecycle shared, preserves the same response shape, and avoids a parallel route family. `docs/references/tma/auth-and-bot-pattern.md` and the authentication product spec already prefer this.
  Date/Author: 2026-06-02 / Codex

- Decision: no D1 migration for feat-080. The `auth_identities` table already supports `provider` + `provider_subject` uniqueness.
  Rationale: keeps the slice narrow and avoids coupling feat-080 to a database release.
  Date/Author: 2026-06-02 / Codex

- Decision: TMA refresh token storage priority is `SecureStorage` → memory-only fallback; no `DeviceStorage` or `localStorage` for `session:*` keys.
  Rationale: `docs/references/tma/state-and-storage-pattern.md` default auth-session policy forbids persisting app tokens outside `SecureStorage`. Weaker persistence is the explicit fallback, not weaker storage.
  Date/Author: 2026-06-02 / Codex

- Decision: Telegram identity mapping uses the same `upsertUserBy*Identity` pattern as Firebase — one identity row per provider, no email-based merge.
  Rationale: matches the existing `auth_identities` uniqueness rule and the auth-and-bot pattern identity rule. Cross-provider merge would be a separate product decision.
  Date/Author: 2026-06-02 / Codex

- Decision: TMA client side of feat-080 ships as one full slice (storage + store + bootstrap + refresh + fatal UI), not split across sub-feats.
  Rationale: the slice is internally small and TMA has no other consumer yet; splitting would create a half-bootable state.
  Date/Author: 2026-06-02 / Codex

## Outcomes & Retrospective

This plan is active. Final outcomes are recorded here when feat-080 is implemented. Success bar: web auth regresses nothing, TMA shell can be opened from the Telegram test environment and reach an authenticated app session, and the fatal launch screen covers every invalid-launch failure path.

## Context and Orientation

- Worker routes: `apps/worker/src/routes/*`
- Worker contracts (zod schemas): `apps/worker/src/contracts/*`
- Worker auth handlers: `apps/worker/src/handlers/auth/*`
- Worker auth libraries: `apps/worker/src/lib/auth/*`
- Worker env config: `apps/worker/src/lib/env.ts`
- Worker env types: `apps/worker/src/types/*`
- Worker D1 repositories: `apps/worker/src/db/repositories/*`
- Worker migrations: `apps/worker/migrations/*`
- Worker integration tests: `apps/worker/test/integration/*`
- Worker unit tests: `apps/worker/test/unit/*`
- Worker env template: `apps/worker/wrangler.toml`, `apps/worker/.dev.vars.example`
- TMA app (created in feat-079): `apps/tma/src/*`
- TMA reference rules: `docs/references/tma/*`
- Authentication product spec: `docs/product-specs/authentication.md`
- TMA product spec: `docs/product-specs/telegram-mini-app.md`
- TMA router: `docs/TMA.md`
- Durable TMA architecture: `docs/design-docs/telegram-mini-app-client-architecture.md`

## Plan of Work (Narrative)

1. Convert `ExchangeProviderRequest` in `apps/worker/src/contracts/auth.ts` into a discriminated union of `{ provider: 'firebase', idToken }` and `{ provider: 'telegram', initData }`. Update `ExchangeProviderTokenInput` in `apps/worker/src/types/auth.ts` so the request body fields are provider-specific and the rest (`locale`, `userAgent`, `ipAddress`) stays shared.
2. Update the route in `apps/worker/src/routes/auth.ts` to pass the full body through; the handler becomes the single switch point.
3. Add `apps/worker/src/lib/auth/telegram.ts`. The function `verifyTelegramLaunchData(initData, botToken, freshnessWindowSeconds)` parses the query string, validates the required fields (`hash`, `auth_date`, `user`), rebuilds the data-check string (sorted `key=value` pairs joined by `\n`, excluding `hash`), computes `secret_key = HMAC-SHA256("WebAppData", botToken)`, uses the raw HMAC bytes as the key for the second HMAC over the data-check string, hex-encodes only the final digest, and compares it to the provided `hash` in constant time. It rejects if `Date.now() / 1000 - auth_date > freshnessWindowSeconds`.
4. Thread `telegramBotToken` and `telegramFreshnessWindowSeconds` through `readConfig` and `AppConfig`; add defaults in `.dev.vars.example` (default window 3600 seconds).
5. Refactor `user-repository.ts`: parameterize `findIdentityUserId(db, provider, subject)`; add `upsertUserByTelegramIdentity(db, identity, locale)` mirroring the Firebase helper, and accept `provider: 'firebase' | 'telegram'` in the existing `upsertUserByFirebaseIdentity` signature.
6. Extract `issueAppSession(env, user, userAgent, ipAddress)` inside the auth handlers package (or co-locate inside `exchange-provider-token.ts` if extraction is too small) so both provider branches share the same access/refresh token issuance and `refresh_sessions` write.
7. Update `exchangeProviderToken` to switch on `input.provider`. Firebase branch keeps the existing behavior unchanged. Telegram branch calls `verifyTelegramLaunchData`, then `upsertUserByTelegramIdentity`, then `issueAppSession`, and returns `user.provider = 'telegram'`.
8. Add worker unit tests under `apps/worker/test/unit/lib/auth/telegram.spec.ts` and integration tests under `apps/worker/test/integration/auth-telegram.spec.ts`. Cover valid signature, tampered field, missing `hash`, replay-window expiry, missing `user`, unsupported `provider`, and the existing Firebase path.
9. Update `docs/references/tma/auth-and-bot-pattern.md` to record the new discriminated-union request shape and the worker contract; update `docs/product-specs/authentication.md` to add Telegram as a supported provider with the failure-state UI contract.
10. In `apps/tma/src/lib/storage/adapter.ts`, build a small `authStorage` that exposes `getRefreshToken`, `setRefreshToken`, `clearRefreshToken`. It prefers `@tma.js/sdk` `SecureStorage` when `isSupports` returns true; otherwise it stays memory-only and logs a one-time warning (no `localStorage` fallback for `session:*`).
11. In `apps/tma/src/lib/telegram/launch-params.ts`, wrap `retrieveLaunchParams` (or the equivalent `@tma.js/sdk-react` hook) and return the raw `initData` string. The wrapper must not parse user fields as truth; the worker is the verifier.
12. In `apps/tma/src/lib/auth/api.ts`, define `exchangeProviderToken(input)`, `refreshSession(refreshToken)`, and `logoutSession(refreshToken)` typed against the shared worker contracts. Treat 4xx responses with provider-neutral error codes from the existing `apps/worker/src/lib/errors` patterns.
13. In `apps/tma/src/features/auth/store.ts`, define a flat Zustand store: `{ status, user, accessToken, refreshToken, error }` plus `bootstrap`, `setSession`, `refresh`, `logout`, `reset`. Do not persist anything from this store.
14. In `apps/tma/src/features/auth/bootstrap.tsx`, gate the router on the first `bootstrap()` resolution. The bootstrap calls the worker once; on success it sets the session and flips to `authenticated`; on failure it shows the fatal launch screen. There is no retry loop — re-open from Telegram is the recovery path.
15. In `apps/tma/src/features/auth/AuthProvider.tsx`, expose `useAuth()` and the `<AuthProvider>` context that the rest of the app reads from.
16. In `apps/tma/src/features/auth/refresh-interceptor.ts`, wrap the shared `fetch` (or whatever HTTP primitive the rest of `apps/tma` uses) so that on 401 it calls `refreshSession` once and retries the request. Concurrent 401s share the same refresh promise.
17. In `apps/tma/src/features/auth/fatal-launch-screen.tsx`, render a localized blocking screen with a "Reopen from Telegram" CTA. The screen is keyboard-friendly and respects safe-area insets.
18. Add TMA i18n keys for `tma.auth.launchInvalid`, `tma.auth.networkError`, `tma.auth.reopenGuidance`, `tma.auth.signOutFailed`, and `tma.auth.sessionExpired`.
19. Add TMA unit tests:
    - `apps/tma/src/test/storage-adapter.test.ts`: `SecureStorage` supported branch, unsupported memory-only branch, and corrupt-payload recovery.
    - `apps/tma/src/test/auth-bootstrap.test.ts`: bootstrap order for valid auth, invalid launch data, missing launch data, and intent-routing stub.
20. Run the targeted verification chain, then the full `./init.sh` and `gitnexus_detect_changes` final scan.

## Concrete Steps (Commands)

Run from repo root unless noted.

```bash
./init.sh install
./init.sh lint
./init.sh typecheck
./init.sh test
./init.sh build
./init.sh
```

Expected short outputs:

- `./init.sh install` completes without workspace resolution errors after new `apps/tma` packages are introduced.
- `./init.sh lint`, `./init.sh typecheck`, `./init.sh test`, and `./init.sh build` finish with no TMA- or worker-specific failures.
- final `./init.sh` prints `Done!`.

Focused worker commands during the slice:

```bash
pnpm --filter worker exec vitest run test/unit/lib/auth/telegram.spec.ts
pnpm --filter worker exec vitest run test/integration/auth-telegram.spec.ts
pnpm --filter worker exec vitest run test/integration/auth-provider-exchange.spec.ts
```

Focused TMA commands during the slice (after feat-079 lands):

```bash
pnpm --filter tma exec vitest run src/test/storage-adapter.test.ts
pnpm --filter tma exec vitest run src/test/auth-bootstrap.test.ts
pnpm --filter tma build
```

## Validation and Acceptance

Happy path:

- `POST /api/v1/auth/provider/exchange` with a valid Firebase `idToken` returns 200 with the existing `ExchangeProviderResponse` shape (no contract regression).
- `POST /api/v1/auth/provider/exchange` with a valid Telegram `initData` returns 200 with the same shape, `user.provider = 'telegram'`, and a `refresh_sessions` row tied to the same user identity table.
- TMA shell booted from the Telegram test environment reads `initData`, calls the exchange endpoint, reaches `authenticated` state, and the router renders the home route.
- Re-opening the same TMA from a Telegram surface that supports `SecureStorage` rehydrates the session without a fresh exchange until the refresh token expires.
- Existing web sign-in / sign-up / logout / refresh flow continues to pass unit and integration tests with no new failures.

Failure-path validation:

- `initData` with an `auth_date` older than the configured freshness window returns 401 with a clear error code; the TMA shell renders the fatal launch screen.
- `initData` with a tampered field or invalid `hash` returns 401; same fatal screen.
- `initData` missing `user` or `hash` returns 400; same fatal screen.
- Worker config missing `TELEGRAM_BOT_TOKEN` fails fast at startup with `errors.workerConfigurationInvalid`.
- TMA storage `SecureStorage` unsupported → session stays memory-only, no `localStorage` write, and a one-time warning is emitted on first attempt.
- 401 from a downstream API triggers exactly one refresh attempt; second 401 propagates to the caller.

Regression checks:

- `./init.sh lint`, `./init.sh typecheck`, `./init.sh test`, `./init.sh build`, and final `./init.sh` all pass.
- `gitnexus_impact` on `exchangeProviderToken`, `verifyTelegramLaunchData`, `ExchangeProviderRequest`, and `upsertUserBy*Identity` is run before each edit batch.
- `gitnexus_detect_changes(scope: 'all')` after the slice returns LOW or MEDIUM risk; any HIGH or CRITICAL finding is justified inline in the progress log.

## Idempotence & Recovery

- The contract change is additive: existing Firebase clients continue to work because the `firebase` branch is preserved inside the discriminated union. Rolling back to the previous contract is a single revert of `apps/worker/src/contracts/auth.ts` and `apps/worker/src/handlers/auth/exchange-provider-token.ts`.
- `TELEGRAM_BOT_TOKEN` is a new required env var; if not set, the worker startup throws `errors.workerConfigurationInvalid` rather than silently accepting unverified data.
- The TMA client slice is feature-flag-able by gating `<AuthProvider>` rendering on a build-time or env check, so an emergency rollback only requires shipping with the provider disabled.
- No D1 migration is included, so there is nothing to roll back at the database layer.

## Artifacts and Notes

- Acceptance artifact: a passing `auth-telegram.spec.ts` integration test plus a passing `telegram.spec.ts` unit test.
- Acceptance artifact: TMA unit tests for storage adapter and bootstrap pass.
- Acceptance artifact: a manual smoke run that opens the TMA from the Telegram test environment with a valid bot token and reaches the home route.
- Acceptance artifact: `gitnexus_detect_changes(scope: 'all')` transcript and a progress log entry.

## Interfaces & Dependencies

- `@tma.js/sdk-react`: provides `retrieveLaunchParams`, `useLaunchParams`, and the React component tree for the auth bootstrap.
- `@tma.js/sdk`: lower-level `SecureStorage`, `DeviceStorage`, and `isSupports` helpers used by the storage adapter.
- `@tanstack/react-query`: future client queries; not introduced by this slice.
- `zustand`: session/flow store.
- `zod`: same library used by the worker; TMA reuses the same shape (or a local mirror) for client-side request validation when convenient.
- Worker `crypto.subtle` (Web Crypto): HMAC-SHA256 verification of the Telegram `initData` hash.
- Worker `auth_identities` table: existing schema with `provider` and `provider_subject` uniqueness.
- Worker `refresh_sessions` table: existing schema; no change.
- Worker config: `TELEGRAM_BOT_TOKEN` (required), `TELEGRAM_FRESHNESS_WINDOW_SECONDS` (optional, default 3600).
