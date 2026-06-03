# TMA local testing runbook

Canonical step-by-step guide for local worker testing, browser-only TMA checks, and real Telegram TMA smoke runs.

## Scope

Use this doc when you need to:

- run the worker locally for TMA auth work
- run `apps/tma` against the local worker
- verify browser-only failure paths without Telegram
- smoke-test a real TMA launch from Telegram
- debug common local auth/bootstrap failures

## Current repo truth

- Worker local runtime is `apps/worker` on Wrangler dev.
- TMA local runtime is `apps/tma` on Vite dev.
- Default TMA dev worker URL is `http://localhost:8787`.
- Default TMA dev app URL is `http://localhost:5174`.
- Telegram auth needs a real `TELEGRAM_BOT_TOKEN` in `apps/worker/.dev.vars`.
- The repo does not yet standardize BotFather or Telegram test-environment setup steps. Treat bot-side URL wiring as operator-owned setup.

## Pick one test mode

Use one mode at a time.

- Worker-only: verify Telegram signature handling and provider exchange with Vitest. Fastest. No Telegram app needed.
- Browser-only TMA: verify shell/bootstrap/fatal-screen behavior in a normal browser. No real Telegram launch context.
- Real Telegram TMA: verify `initData`, worker exchange, and authenticated bootstrap from a Telegram surface.

## Prerequisites

From repo root:

```bash
./init.sh install
```

Create local worker env:

```bash
cp apps/worker/.dev.vars.example apps/worker/.dev.vars
```

Set at least these values in `apps/worker/.dev.vars`:

- `TELEGRAM_BOT_TOKEN`
- `AUTH_JWT_SECRET`
- `AUTH_REFRESH_TOKEN_PEPPER`

Optional but useful:

- `TELEGRAM_FRESHNESS_WINDOW_SECONDS`

## Worker local setup

Apply local D1 migrations:

```bash
pnpm --filter worker db:migrate:local
```

Seed local demo data if you want a non-empty database:

```bash
pnpm --filter worker db:seed:local
```

Start the worker:

```bash
pnpm --filter worker dev
```

Expected local base URL:

```text
http://localhost:8787/api/v1
```

## TMA local setup

Default local wiring is already in `apps/tma/.env.example`:

```text
VITE_WORKER_URL=http://localhost:8787
```

Start the TMA app:

```bash
pnpm --filter tma dev
```

Expected local app URL:

```text
http://localhost:5174
```

Before auth smoke tests, confirm the worker still allows the TMA dev origin:

```bash
rg "localhost:5174" apps/worker/src/
```

## Mode 1 — Worker-only test

Use this when you want confidence in the auth backend before touching Telegram surfaces.

Run the focused Telegram auth tests:

```bash
pnpm --filter worker exec vitest run test/unit/lib/auth/telegram.spec.ts test/integration/auth-telegram.spec.ts
```

What this proves:

- Telegram HMAC verification works.
- `auth_date` freshness checks work.
- `/api/v1/auth/provider/exchange` accepts valid Telegram `initData`.
- invalid signature, missing fields, and unsupported provider paths fail correctly.

When to use it:

- worker auth changes
- env or crypto-path changes
- quick regression pass before a real Telegram smoke run

## Mode 2 — Browser-only TMA test

Use this when you want to verify the app shell and failure path without a real Telegram launch.

Start both local servers:

```bash
pnpm --filter worker dev
pnpm --filter tma dev
```

Open `http://localhost:5174` in a normal browser.

Expected behavior:

- the app should render
- Telegram wrappers should not crash
- no authenticated session should be created
- the fatal launch screen should appear because no valid Telegram launch context exists

This is a useful sanity check for:

- fatal launch UI
- non-Telegram fallback behavior
- route/bootstrap stability
- obvious CORS or fetch wiring issues

This is not enough to prove:

- real `initData` exchange
- real Telegram WebView behavior
- `SecureStorage` support on device

## Mode 3 — Real Telegram TMA smoke run

Use this when you need to prove the full launch-context auth flow.

You need one of these:

- Telegram test environment with direct HTTP/IP access
- an HTTPS tunnel that points at local TMA dev

Start worker and TMA locally:

```bash
pnpm --filter worker dev
pnpm --filter tma dev
```

Then make the TMA reachable from Telegram:

- If using Telegram test environment, point your bot/app config at the local URL or reachable local IP that environment accepts.
- If using a tunnel, point your bot/app config at the tunnel HTTPS URL that forwards to `http://localhost:5174`.

Current repo rule:

- pick Telegram test environment or tunnel HTTPS for a run, not both half-configured

Open the Mini App from Telegram.

Expected happy path:

- Telegram injects `initData`
- TMA reads raw launch data
- TMA calls worker `POST /api/v1/auth/provider/exchange`
- worker verifies launch data and returns app session tokens
- TMA bootstrap reaches authenticated state
- the app renders the authenticated shell instead of the fatal launch screen

Expected failure path:

- invalid or missing launch data keeps the blocking fatal launch screen visible
- expired or tampered launch data is rejected by the worker
- unsupported storage falls back to memory-only session behavior

## Suggested local flow for feat-080 work

Use this order:

1. Run focused worker Telegram tests.
2. Run focused TMA auth/bootstrap tests.
3. Run browser-only TMA check at `localhost:5174` and confirm fatal launch behavior.
4. Run one real Telegram smoke test through test environment or tunnel.
5. Finish with repo verification.

Focused TMA auth tests:

```bash
pnpm --filter tma exec vitest run src/test/storage-adapter.test.ts src/test/auth-api.test.ts src/test/auth-bootstrap.test.ts src/test/auth-provider.test.ts
```

Repo verification:

```bash
./init.sh lint
./init.sh typecheck
./init.sh test
./init.sh build
./init.sh
```

## Common failure map

`Fatal launch screen in Chrome`:

- expected if you opened `localhost:5174` outside Telegram

`Fatal launch screen in Telegram`:

- check `TELEGRAM_BOT_TOKEN` in `apps/worker/.dev.vars`
- check the bot/app URL points to the current TMA URL
- check worker logs for invalid signature or expired `auth_date`

`401 or invalid signature from provider exchange`:

- bot token does not match the bot that launched the Mini App
- launch data is stale
- worker was not restarted after env changes

`TMA cannot call worker from local app`:

- CORS allowlist missing `localhost:5174`
- `VITE_WORKER_URL` does not point at the running worker
- worker dev server is not up

`Authenticated in one open, lost after reopen`:

- check whether the client/device supports `SecureStorage`
- memory-only fallback is expected on unsupported clients

`Works in desktop browser, broken in Telegram`:

- test the real WebView surface
- inspect Telegram client/platform/version
- re-check safe-area, launch context, and capability support assumptions

## Evidence to record

For any meaningful TMA auth test pass, record:

- worker URL used
- TMA URL used
- Telegram test environment or tunnel HTTPS
- Telegram client/platform/version
- whether `SecureStorage` was supported
- happy path result
- failure path result if you checked one

## Out of scope

This runbook does not standardize:

- BotFather command-by-command setup
- production bot URL changes
- deployment steps
- invite or expense-flow QA beyond launch/auth/bootstrap
