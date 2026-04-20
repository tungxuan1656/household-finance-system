# RELIABILITY.md

This file defines how the system proves it is healthy and restartable.

## Standard Paths

- Bootstrap: `./init.sh` (installs deps, runs lint/type-check/test/build as defined in AGENTS.md)
- Verification: `./init.sh` (full workspace verification) or `pnpm --filter <package> run typecheck && pnpm --filter <package> test`
- Start app or service: `pnpm --filter web dev` (frontend) and `pnpm --filter worker dev` (Cloudflare Worker via Wrangler)
- Debug or inspect runtime: `pnpm --filter worker dev` (local worker), use `wrangler tail` / `wrangler dev` logs for runtime traces

## Required Runtime Signals

- structured logs for startup, auth flows, and migration steps
- health checks for key services (worker `/health`, D1 connectivity, migrations status)
- trace/timing data for slow aggregation paths (insights) when available
- error metrics and user-visible error states for recoverable failures

## Golden Journeys

- `Sign up / sign in` — frontend auth -> backend token verification -> local user mapping
- `Create household and invite member` — create household, add member, verify role semantics
- `Quick add expense -> view dashboard` — add expense (<=3s), verify it appears in household dashboard and budget calculations

Each golden journey should have a repeatable verification path and clear failure
signals; add automated integration checks where feasible.

## Reliability Rules

- No feature is complete if the system cannot restart cleanly afterward; `./init.sh` must succeed after changes.
- Runtime failures should be diagnosable from repo-local signals (logs, health, migrations status).
- Critical paths (auth verification, expense writes, budget calculations) must expose health endpoints and observable metrics.
- If a repeated failure mode appears, add a benchmark or guardrail and include it in CI where possible.
- Cleanup (migrations roll-forward/rollback, DB compaction) is part of reliability and must be documented in `docs/`.
