# Worker App (apps/worker)

This package is the backend runtime for Family Operating System.

## Responsibilities

- Expose backend APIs used by the web client.
- Implement server-side business rules for contributions, points, and rewards.
- Manage persistence via Cloudflare D1 (through Worker bindings).
- Keep backend logic secure, validated, and testable.

## Technology Stack

- Cloudflare Workers runtime.
- TypeScript.
- Wrangler for local development, type generation, and deployment.
- Vitest with Workers pool support.
- D1 as the primary relational datastore.

## Standards

Backend work must follow standards in `docs/standards/`:

- `docs/standards/README.md`
- `docs/standards/architecture-and-boundaries.md`
- `docs/standards/api-contract-and-validation.md`
- `docs/standards/database-pattern.md`
- `docs/standards/error-handling-pattern.md`
- `docs/standards/security-and-auth-pattern.md`
- `docs/standards/testing-pattern.md`
- `docs/standards/code-review-guide.md`

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

- `docs/cloudflare-workers.md`

## Build, Test, and Deploy

```bash
pnpm --filter worker cf-typegen
pnpm --filter worker test
pnpm --filter worker deploy
```

## D1 Migrations

- Migration files are stored in `migrations/`.
- Use timestamp/sequence naming, e.g. `0001_init.sql`, `0002_add_xxx.sql`.

Apply migrations locally:

```bash
pnpm --filter worker db:migrate:local
```

Apply migrations remotely:

```bash
pnpm --filter worker db:migrate:remote
```

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
