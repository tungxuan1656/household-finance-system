# Secrets Rotation

Rotate secrets on a schedule and immediately when compromised.

## Secret Inventory

All Worker secrets (set via `wrangler secret put`):

| Secret | Used for | Rotation cadence |
|--------|----------|------------------|
| `AUTH_JWT_SECRET` | Signing access/refresh JWTs | Quarterly |
| `AUTH_REFRESH_TOKEN_PEPPER` | Hashing refresh tokens | Quarterly |
| `INVITATION_TOKEN_PEPPER` | Hashing household invitation tokens | Quarterly |
| `FIREBASE_PROJECT_ID` | Firebase Auth JWKS lookup | Stable — only on Firebase project change |
| `FIREBASE_JWKS_URL` | Firebase public keys | Stable |
| `TELEGRAM_BOT_TOKEN` | Telegram initData verification, Bot API calls | On bot compromise |
| `CLOUDINARY_API_KEY` | Cloudinary signing | Quarterly |
| `CLOUDINARY_API_SECRET` | Cloudinary signing | Quarterly |

Non-secrets (can go in `wrangler.jsonc` `vars`):

| Var | Notes |
|-----|-------|
| `APP_ENV` | `local` / `staging` / `production` |
| `AUTH_ISSUER` | Worker URL (without `/api/v1`) |
| `AUTH_AUDIENCE` | `household-finance-tma` (or per-env) |
| `ACCESS_TOKEN_TTL_SECONDS` | Default 900 (15 min) |
| `REFRESH_TOKEN_TTL_SECONDS` | Default 2592000 (30 days) |
| `AUTH_ALLOW_INSECURE_TEST_TOKENS` | MUST be `false` in production |
| `CLOUDINARY_CLOUD_NAME` | Stable |

## Rotation Procedure

For each secret:

### Step 1: Generate New Value

Use a cryptographically secure random source:

```bash
# 32 bytes (256 bits) — for pepper/JWT secret
openssl rand -hex 32

# 32 bytes (256 bits) — for Cloudinary API secret
openssl rand -base64 32
```

For Firebase project ID and Telegram bot token, the value is issued by the upstream service — generate via Firebase console / @BotFather.

### Step 2: Stage the New Value (Dual-Value Window)

Wrangler does NOT support dual secrets natively. Two options:

**Option A: Atomic swap (Worker restart risk)**

```bash
pnpm exec wrangler secret put AUTH_JWT_SECRET
# paste new value
```

Worker restarts on secret change. Brief downtime (< 30s). Acceptable for non-critical rotations.

**Option B: Two-phase swap (zero-downtime)**

1. Add the new secret under a temporary name: `wrangler secret put AUTH_JWT_SECRET_NEW`.
2. Update code to accept both old and new secrets during the transition window.
3. Deploy.
4. Once all in-flight tokens use the new secret, remove old secret and temporary name.
5. Deploy final cleanup.

Use Option B for `AUTH_JWT_SECRET` because rotating it invalidates all existing user sessions if done atomically. Users would be force-logged-out.

For pepper secrets (`AUTH_REFRESH_TOKEN_PEPPER`, `INVITATION_TOKEN_PEPPER`), atomic swap is safer because:
- Existing refresh tokens become invalid → users re-login (acceptable).
- Existing invitation tokens become invalid → invitation links break (acceptable, invitations are short-lived).

### Step 3: Verify

After rotation:

```bash
# Worker should still serve health:
curl -fsS https://<worker-url>/api/v1/health

# Test auth round-trip (login should still work):
# Run integration tests against the deployed URL.
```

### Step 4: Remove Old Value

If using Option B: remove the old secret.

```bash
pnpm exec wrangler secret delete AUTH_JWT_SECRET_OLD
```

Cloudflare does not let you delete secrets via CLI directly. Use the dashboard:
- Workers & Pages → Worker → Settings → Variables and Secrets → delete.

## Compromised Secret: Emergency Rotation

If a secret is compromised (leaked in chat, git, log file):

1. Rotate immediately. Do not wait for cadence.
2. Audit usage:
   - `AUTH_JWT_SECRET` compromised → invalidate all sessions (force logout all users).
   - `TELEGRAM_BOT_TOKEN` compromised → revoke bot via @BotFather, create new, redeploy Worker with new token.
   - `CLOUDINARY_API_SECRET` compromised → rotate via Cloudinary dashboard, update Worker.
3. Notify team. Write incident note.

## Local Dev Secrets

Local secrets live in `apps/worker/.dev.vars` (gitignored). Never commit.

Setup:
```bash
cp apps/worker/.dev.vars.example apps/worker/.dev.vars
# Fill in real values
```

`.dev.vars` values are loaded by `wrangler dev` and the test runner (`vitest`).

To rotate locally:
1. Edit `.dev.vars` with new values.
2. Restart `wrangler dev`.
3. Re-run integration tests.

## Adding a New Required Secret

When a new env var is added to `readConfig` (e.g. `INVITATION_TOKEN_PEPPER` in the post-review fix), existing local `.dev.vars` files become stale. Symptom: `wrangler dev` boots but every route returns 500 with `workerConfigurationInvalid`.

Per-env checklist when adding a required var:

1. Update `apps/worker/.dev.vars.example` (committed) with the new key.
2. Remind team via PR description or Slack to reconcile their local `.dev.vars` (gitignored, so the change isn't auto-picked-up).
3. Document the new key in the secrets inventory above.
4. For remote envs, run `wrangler secret put <NEW_KEY>` on staging + production BEFORE merging the code change that calls `readRequired`. Otherwise deploy will boot-fail.
5. Update `apps/worker/worker-configuration.d.ts` via `pnpm --filter worker cf-typegen` and commit.

## Audit Trail

Track rotations in your incident tracker:

- Date.
- Secret name.
- Old value fingerprint (first 4 chars of hash, NOT the value itself).
- New value fingerprint.
- Reason (scheduled / compromised).
- Operator.

Example:
```
2026-06-17 | AUTH_JWT_SECRET | old: a3f2... | new: 7e91... | scheduled quarterly | @operator
```

## Common Pitfalls

- Rotating `AUTH_JWT_SECRET` atomically → all users force-logged-out. Use Option B (two-phase swap) if zero-downtime required.
- Forgetting to rotate in ALL envs (local / staging / production) → tests fail on stale envs.
- Committing `.dev.vars` → secret leaked. Verify `.gitignore` covers it.
- Reusing a rotated secret value → defeats the rotation. Generate fresh each time.
- Not notifying users of force-logout → support tickets spike. If rotating JWT secret, send a heads-up via in-app banner first.