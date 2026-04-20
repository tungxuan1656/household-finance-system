# AGENTS.md (apps/worker)

## System Context

`apps/worker` is the backend service for Family Operating System.

Primary goals:

- Serve API endpoints used by `apps/web`.
- Enforce business rules for points, contributions, and rewards.
- Persist and query data through Cloudflare D1.
- Keep backend behavior deterministic, validated, and testable.

## Required Technology Stack

- Cloudflare Workers
- TypeScript
- Wrangler CLI
- D1 database bindings
- Vitest with `@cloudflare/vitest-pool-workers`

## Implementation Rules

- Keep domain logic in small, composable modules.
- Validate all external input at API boundaries.
- Do not trust client-side computed values for critical business logic.
- Treat D1 schema and query changes as versioned migrations.
- Regenerate worker bindings types after config changes.

## Commands

- `pnpm --filter worker dev`: start local worker runtime.
- `pnpm --filter worker cf-typegen`: regenerate `Env` bindings types.
- `pnpm --filter worker test`: run worker tests.
- `pnpm --filter worker deploy`: deploy to Cloudflare.

## Standards References

Use backend standards in `docs/standards/` as source of truth:

- `docs/standards/README.md`
- `docs/standards/architecture-and-boundaries.md`
- `docs/standards/api-contract-and-validation.md`
- `docs/standards/database-pattern.md`
- `docs/standards/error-handling-pattern.md`
- `docs/standards/security-and-auth-pattern.md`
- `docs/standards/testing-pattern.md`
- `docs/standards/code-review-guide.md`
