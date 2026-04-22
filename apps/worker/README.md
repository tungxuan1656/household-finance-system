# Worker App (apps/worker)

This package is the backend runtime for Household Finance System.

## Responsibilities

- Expose backend APIs used by the web client.
- Implement server-side authentication, profile, and future household/expense rules.
- Manage persistence via Cloudflare D1 (through Worker bindings).
- Keep backend logic secure, validated, and testable.
- Provide the shared worker foundation for `/api/v1` routing, request metadata,
  error envelopes, and auth boundaries.

## Technology Stack

- Cloudflare Workers runtime.
- TypeScript.
- Wrangler for local development, type generation, and deployment.
- Vitest with Workers pool support.
- D1 as the primary relational datastore.

## Standards

Backend work must follow the repository guidance in:

- `AGENTS.md`
- `docs/BACKEND.md`
- `docs/references/index.md`
- `docs/references/backend/architecture-and-boundaries.md`
- `docs/references/backend/api-contract-and-validation.md`
- `docs/references/backend/database-pattern.md`
- `docs/references/backend/error-handling-pattern.md`
- `docs/references/backend/security-and-auth-pattern.md`
- `docs/references/backend/testing-pattern.md`
- `docs/references/shared/type-naming-pattern.md`

## Foundation Surface

- Base API path: `/api/v1`
- Shared health endpoint: `GET /api/v1/health`
- Shared request-body validation helper: `src/lib/validation.ts`
- Shared auth boundary: `src/middlewares/auth.ts`
- Shared response envelope + error mapping: `src/lib/response.ts`

## Backend Locale Behavior

- The worker resolves a request locale from `x-locale` or `accept-language`.
- Unsupported locale hints fall back to `vi`.
- API-visible human-readable messages are currently emitted in Vietnamese through the backend i18n adapter in `src/lib/i18n/`.

## Source Layout

- `src/routes/*`: HTTP route registration and middleware composition only
- `src/handlers/*`: per-use-case orchestration and business flow
- `src/db/repositories/*`: D1 reads/writes and row mapping
- `src/contracts/*`: API request/response schemas and transport contracts
- `src/types/*`: runtime-only app/auth types that are not API payload contracts
- `src/lib/auth/*`: auth/security infrastructure such as Firebase verification, JWT, hashing
- `src/lib/*`: shared runtime helpers that are broader than a pure utility
- `src/utils/*`: small reusable pure helpers

## Development

Run from repository root:

```bash
pnpm --filter worker dev
```

Or run inside this folder:

```bash
pnpm dev
```

## Cloudflare Workers guide

- `docs/references/backend/cloudflare-workers.md`

## Build, Test, and Deploy

```bash
pnpm --filter worker cf-typegen
pnpm --filter worker test
pnpm --filter worker deploy
```

## D1 Migrations

- Migration files are stored in `migrations/`.
- Use timestamp/sequence naming, e.g. `0001_init.sql`, `0002_add_xxx.sql`.
- The initial schema preserves auth/session tables and adds the first household-finance persistence surfaces for households, memberships, categories, groups, expenses, budgets, and audit logs.

Apply migrations locally:

```bash
pnpm --filter worker db:migrate:local
```

Apply migrations remotely:

```bash
pnpm --filter worker db:migrate:remote
```

Seed the local database with a minimal demo household:

```bash
pnpm --filter worker db:seed:local
```

The seed file lives at `seeds/local/dev.sql` and is written to be safe to re-run with the same IDs.
Remote migrations remain operator-only until `wrangler.jsonc` is configured with the real D1 database identifiers.

## Configuration

- Main entry: `src/index.ts`
- Wrangler config: `wrangler.jsonc`
- Add D1 and other bindings in `wrangler.jsonc`, then run `pnpm --filter worker cf-typegen`.

### Environment strategy

- Keep `wrangler.jsonc` for runtime/bindings only (name, main, compatibility, d1 bindings).
- Keep local env values in `.dev.vars` (not committed).
- Use `wrangler secret put` for remote secrets.

Local setup:

```bash
cp apps/worker/.dev.vars.example apps/worker/.dev.vars
```

Remote secrets setup example:

```bash
pnpm --filter worker exec wrangler secret put AUTH_JWT_SECRET
pnpm --filter worker exec wrangler secret put AUTH_REFRESH_TOKEN_PEPPER
```
