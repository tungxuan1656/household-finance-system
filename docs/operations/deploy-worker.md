# Deploy Worker (Cloudflare Workers + D1)

## Stack

- Runtime: Cloudflare Workers (workerd).
- Bindings: D1 database (`DB`), env vars, secrets.
- Tool: Wrangler CLI.
- Source: `apps/worker/src/index.ts`. Config: `apps/worker/wrangler.jsonc`.

## One-Time Setup

Run once per environment (staging/production). Skip if already configured.

### 0. Local Developer Sync

If you have an existing `apps/worker/.dev.vars` from before a recent change that added a new required env var (e.g. `INVITATION_TOKEN_PEPPER` in the post-review fix), `wrangler dev` will boot but every route returns 500 with `INTERNAL_ERROR` / `workerConfigurationInvalid`. Symptom: `readConfig` throws `envConfigError()` on first request.

Fix by appending the new var to `.dev.vars` and restarting `wrangler dev`:

```bash
echo 'INVITATION_TOKEN_PEPPER="local-dev-invitation-pepper-replace-me"' >> apps/worker/.dev.vars
```

For any future required var added to `readConfig`, diff your `.dev.vars` against `.dev.vars.example` and reconcile. The example file is the source of truth for local-only keys.

### 1. Create D1 Database

```bash
cd apps/worker
pnpm exec wrangler d1 create household-finance-main
```

The command returns JSON. Copy `uuid` into `wrangler.jsonc`:

```jsonc
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "household-finance-main",
    "database_id": "<paste-uuid-here>"
  }
]
```

Note: the `database_name` must match across local dev, staging, and production — only `database_id` differs.

### 2. Apply Migrations Locally (Smoke Test)

```bash
cd apps/worker
pnpm db:migrate:local
pnpm db:seed:local  # optional — dev only
```

### 3. Set Secrets Remotely

Mandatory for production. Never commit secrets to git or put them in `wrangler.jsonc`.

```bash
cd apps/worker
pnpm exec wrangler secret put AUTH_JWT_SECRET
pnpm exec wrangler secret put AUTH_REFRESH_TOKEN_PEPPER
pnpm exec wrangler secret put INVITATION_TOKEN_PEPPER
pnpm exec wrangler secret put FIREBASE_PROJECT_ID
pnpm exec wrangler secret put FIREBASE_JWKS_URL
pnpm exec wrangler secret put TELEGRAM_BOT_TOKEN
pnpm exec wrangler secret put CLOUDINARY_API_KEY
pnpm exec wrangler secret put CLOUDINARY_API_SECRET
```

Each command prompts stdin — paste value, press Enter. Do not echo values back when verifying.

Note: `INVITATION_TOKEN_PEPPER` is a new secret added in the post-review fix. If missing, `readConfig` throws on first request — Worker returns 500 for every route.

### 4. Set Non-Secret Vars

`APP_ENV`, `AUTH_ISSUER`, `AUTH_AUDIENCE`, `ACCESS_TOKEN_TTL_SECONDS`, `REFRESH_TOKEN_TTL_SECONDS`, `AUTH_ALLOW_INSECURE_TEST_TOKENS`, `CLOUDINARY_CLOUD_NAME` can be set via:

```bash
pnpm exec wrangler secret put APP_ENV
# value: production

pnpm exec wrangler secret put AUTH_ALLOW_INSECURE_TEST_TOKENS
# value: false

pnpm exec wrangler secret put AUTH_ISSUER
# value: https://api.your-domain.com

pnpm exec wrangler secret put AUTH_AUDIENCE
# value: household-finance-tma

pnpm exec wrangler secret put ACCESS_TOKEN_TTL_SECONDS
# value: 900

pnpm exec wrangler secret put REFRESH_TOKEN_TTL_SECONDS
# value: 2592000

pnpm exec wrangler secret put CLOUDINARY_CLOUD_NAME
# value: <cloudinary-cloud-name>
```

Or use the `vars` block in `wrangler.jsonc` for non-secrets. NEVER put secrets in `vars`.

## Per-Deploy Steps

### 1. Verify Config

```bash
cd apps/worker
pnpm exec wrangler deployments list
```

Record the current `Version ID` — that's the rollback target.

### 2. Generate Types (if bindings changed)

```bash
pnpm --filter worker cf-typegen
```

Commit the updated `worker-configuration.d.ts` if changed.

### 3. Apply D1 Migrations Remotely

```bash
cd apps/worker
pnpm db:migrate:remote
```

Migration files live in `apps/worker/migrations/`. Migrations are append-only — NEVER edit an applied migration. To change schema, write a new migration.

D1 has no cross-migration transaction. Run each one and check logs between. If a migration fails mid-way, see `rollback.md`.

### 4. Dry-Run Deploy

```bash
cd apps/worker
pnpm exec wrangler deploy --dry-run --outdir /tmp/wrangler-dryrun
```

Check bundle size, no syntax errors. If it fails, do NOT proceed.

### 5. Real Deploy

```bash
cd apps/worker
pnpm deploy
```

Output prints the Worker URL (e.g. `https://household-finance-worker.<acct>.workers.dev`). Save the URL.

### 6. Immediate Smoke Test

```bash
curl -fsS https://<worker-url>/api/v1/health
```

Must return 200 with correct JSON shape (see test fixtures). On 5xx → check logs:

```bash
pnpm exec wrangler tail --format pretty
```

Open `tail` in a separate terminal, replay the request, inspect the error.

### 7. Custom Domain (Optional)

In Cloudflare dashboard:
- Workers & Pages → select worker → Settings → Triggers → Add Custom Domain.
- Domain must belong to a zone in the same Cloudflare account.
- HTTPS is automatic via Cloudflare.

After adding, wait for DNS propagation (usually < 1 minute). Verify with `curl` against the custom domain.

## Multi-Environment (Staging + Production)

Recommended: use wrangler environments.

```jsonc
"env": {
  "staging": {
    "d1_databases": [{ "binding": "DB", "database_name": "household-finance-staging", "database_id": "..." }],
    "vars": { "APP_ENV": "staging", "AUTH_ALLOW_INSECURE_TEST_TOKENS": "false" }
  },
  "production": {
    "d1_databases": [{ "binding": "DB", "database_name": "household-finance-main", "database_id": "..." }],
    "vars": { "APP_ENV": "production", "AUTH_ALLOW_INSECURE_TEST_TOKENS": "false" }
  }
}
```

Deploy staging:
```bash
pnpm exec wrangler deploy --env staging
```

Deploy production:
```bash
pnpm exec wrangler deploy --env production
```

Each env has its own secret scope → `pnpm exec wrangler secret put AUTH_JWT_SECRET --env staging`.

## Observability

Worker has `observability.enabled: true` in `wrangler.jsonc`. View logs at:
- Cloudflare Dashboard → Workers → Worker → Logs.
- Realtime: `pnpm exec wrangler tail --format pretty`.

Set alert for error rate > 1% over 5 minutes. See `RELIABILITY.md`.

## Rollback

If the deploy causes problems → `rollback.md`. Worker rollback = redeploy old version via `wrangler rollback` (Cloudflare keeps 3 most recent versions) or redeploy from a prior git tag.

## Common Pitfalls

- `AUTH_ALLOW_INSECURE_TEST_TOKENS=true` in production → blocked by guard (B3 fix). Throws at boot.
- Missing `INVITATION_TOKEN_PEPPER` → 500 across all routes when invitation endpoint is called.
- Migration fails due to SQL syntax D1 does not support (D1 = SQLite dialect). See `references/backend/database-pattern.md`.
- `wrangler.jsonc` `database_id` accidentally points at wrong D1 → data leak across envs. Verify before deploy.