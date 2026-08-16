# RELIABILITY.md

Reliability rules. Read for runtime health, restartability, or verification-path changes.

## Standard Paths

- Use one phased parameter at a time: `./init.sh <param>`.
- Phased parameters cover `format`, `lint`, `typecheck`, `test`, and `build`.
- There is no install or sync phase in the approved init path.
- Run full `./init.sh` at final verification.
- Frontend dev: `pnpm --filter web dev`.
- Worker dev: `pnpm --filter worker dev`.
- Runtime logs: `wrangler tail` / `wrangler dev` when worker debugging needs traces.

Full `./init.sh`: format, lint, typecheck, test, then web and TMA builds.

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
