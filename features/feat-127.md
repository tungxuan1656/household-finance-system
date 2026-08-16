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

- [ ] The app router contains no lazy loading or `Suspense`.
- [ ] No page JavaScript resource starts when initially tapping Expenses, Households, or add-expense after cold launch; API requests may remain.
- [ ] Production hosting is unchanged.
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
- Evidence: Tracker and inline plan created; verification not yet run.
- Blockers: none
- Next: Independent plan review and commit.
