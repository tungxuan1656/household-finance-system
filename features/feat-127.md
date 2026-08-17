# feat-127 - TMA eager route loading

## Goal

Eliminate initial navigation delay caused by React.lazy route chunks in `apps/tma`.

## Scope

- Replace every app-router `React.lazy` route with static named imports.
- Retain the SPA Router and `RouteErrorBoundary`.
- Delete the now-unused `LoadingSkeleton`.
- Reconcile the three canonical TMA docs that prescribe route lazy-loading: `docs/references/frontend/tma/app-structure-and-client-rules.md`, `docs/references/frontend/tma/development-and-hardening-pattern.md`, and `docs/design-docs/frontend/tma/telegram-mini-app-client-architecture.md`.

## Non-goals

- Provider benchmark or migration.
- Auth, session, or API changes.
- Prefetch, PWA, or telemetry work.

## Acceptance

- [x] The app router contains no lazy loading or `Suspense`.
- [ ] No page JavaScript resource starts when initially tapping Expenses, Households, or add-expense after cold launch; API requests may remain.
- [x] Production hosting is unchanged.
- [ ] TMA verification passes and real Telegram manual evidence is recorded.

## Relevant docs

- `docs/TMA.md`
- `docs/references/frontend/tma/app-structure-and-client-rules.md`
- `docs/design-docs/frontend/tma/telegram-mini-app-client-architecture.md`
- `docs/references/frontend/tma/development-and-hardening-pattern.md`
- `docs/references/frontend/tma/local-testing-runbook.md`

## Plan

1. Capture a baseline trace for cold-launch navigation and route chunk requests.
2. Replace app-router lazy routes with static named imports and delete the dead loading skeleton.
3. Reconcile `docs/references/frontend/tma/app-structure-and-client-rules.md`, `docs/references/frontend/tma/development-and-hardening-pattern.md`, and `docs/design-docs/frontend/tma/telegram-mini-app-client-architecture.md` with eager route loading.
4. Validate static/network behavior and collect real Telegram manual evidence.
5. Record evidence in the handoff and progress tracker.

## Accepted decisions

- User chose eager-loading all TMA routes despite the P2 review finding of a 656.43 kB / 198.41 kB gzip entry. Do not introduce a critical-route-only or preload alternative in this feature; the real Telegram cold-launch trace decides whether the tradeoff is acceptable.

## Verify

- `pnpm --filter tma lint`
- `pnpm --filter tma typecheck`
- `pnpm --filter tma test`
- `pnpm --filter tma build`
- `./init.sh`
- `git diff --check`
- After a cold launch, trace taps to Expenses, Households, and add-expense; record no new route JavaScript module/chunk request starts after any tap; expected fetch/XHR API requests are valid and not failures.

## Handoff

- Handoff owns recovery for this feature; do not create a separate recovery file.
- State: active
- Evidence: `pnpm --filter tma lint` passed with 15 pre-existing warnings; `pnpm --filter tma typecheck` passed; `pnpm --filter tma test` passed (24 test files, 134 tests); `pnpm --filter tma build` passed with one entry JS asset (656.43 kB, 198.41 kB gzip), and Vite reported remaining dynamic import call sites do not become chunks because routes are statically imported; `./init.sh` completed successfully with the Worker build skipped by declared configuration; parent confirmed no lazy/Suspense/LoadingSkeleton occurrences in `apps/tma/src` and the loading-skeleton file is absent; `git diff --check` passed.
- Blockers: Real Telegram cold-launch trace remains unrun pending an authorized deploy/manual Telegram test.
- Next: After an authorized deploy, cache-clear/cold launch; tap Expenses, Households, and add-expense; confirm no new JS chunk request begins from each tap while API fetch/XHR may occur.
