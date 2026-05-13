# RELIABILITY.md

Reliability rules. Read for runtime health, restartability, or verification-path changes.

## Standard Paths

- Bootstrap/full verification: `./init.sh`.
- Frontend dev: `pnpm --filter web dev`.
- Worker dev: `pnpm --filter worker dev`.
- Runtime logs: `wrangler tail` / `wrangler dev` when worker debugging needs traces.

`./init.sh` installs deps, checks harness, lints, type-checks, tests, builds web.

## Required Signals

- Startup/auth/migration structured logs.
- Worker `/health` and D1/migration status where available.
- Timing/trace data for slow aggregation paths when useful.
- User-visible error states for recoverable failures.

## Golden Journeys

- Sign up/sign in → backend token verification → local user mapping.
- Create household → invite member → verify role semantics.
- Quick add expense → dashboard/budget reflects change.

Each golden journey needs repeatable verification and clear failure signal.

## Rules

- Feature not done if repo cannot restart cleanly.
- Runtime failure must be diagnosable from repo-local signals.
- Critical paths expose health or verification evidence.
- Repeated failure mode becomes guardrail/check.
- Cleanup/rollback steps belong in docs when reliability risk exists.
