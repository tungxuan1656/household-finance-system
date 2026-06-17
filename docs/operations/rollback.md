# Rollback

Reverse a Worker or TMA deploy when post-deploy verify fails or an incident hits.

## Decision: When to Roll Back

Roll back if:
- Health endpoint returns 5xx for > 5 minutes.
- Error rate > 5% sustained.
- Auth flow broken (login, refresh, or logout fails).
- Data corruption observed (mismatched writes, missing rows).
- TMA white-screens on launch in Telegram.

Do NOT roll back if:
- A single user reports an issue (debug first, verify on staging).
- Bug is reproducible on staging pre-deploy → fix forward, do not roll back.

## Worker Rollback

Cloudflare keeps 3 most recent versions of each Worker.

### Option A: `wrangler rollback`

```bash
cd apps/worker
pnpm exec wrangler rollback
```

This rolls back to the previous version. Verify with:

```bash
pnpm exec wrangler deployments list
```

### Option B: Rollback to Specific Version

```bash
cd apps/worker
pnpm exec wrangler rollback --version-id <previous-version-id>
```

Get version IDs:
```bash
pnpm exec wrangler deployments list
```

### Option C: Redeploy from Git

```bash
git checkout <previous-good-tag>
pnpm --filter worker install
pnpm --filter worker build
pnpm --filter worker deploy
```

Use this when the previous version has been garbage-collected (Cloudflare keeps only 3 versions).

### D1 Migrations: Forward-Only

D1 migrations are append-only. Rollback does NOT undo a migration.

If a bad migration was applied:
1. Roll back the Worker (so it stops calling the new schema).
2. Write a NEW migration that reverses the change (adds back dropped columns, etc.).
3. Apply the reverse migration.
4. Re-deploy Worker forward.

If the migration was destructive (e.g., `DROP COLUMN`) and data is lost → restore from D1 backup. Cloudflare D1 has time-travel restore (up to 30 days):

```bash
pnpm exec wrangler d1 time-travel household-finance-main --timestamp "<iso-before-bad-migration>"
```

Use this only as last resort.

## TMA Rollback

### Option A: Cloudflare Pages (Auto History)

Cloudflare Pages keeps deploy history. Roll back via dashboard:
1. Pages project → Deployments.
2. Select previous successful deployment.
3. "Rollback to this deploy".

### Option B: Redeploy from Git

```bash
git checkout <previous-good-tag>
cd apps/tma
pnpm build
# Deploy dist/ via your hosting provider
```

## Verifying Rollback

After rolling back:
1. Re-run `post-deploy-verify.md` smoke tests.
2. Check Cloudflare Worker logs — error rate should drop within 5 minutes.
3. Confirm via Telegram that TMA loads and login works.
4. Notify team on Slack.

## Post-Rollback

If rollback was triggered by a real bug:
1. Open a ticket describing the bug + reproduction.
2. Revert the bad commit (or write a fix-forward).
3. Test the fix on staging.
4. Re-deploy via `deploy-worker.md` + `deploy-tma.md`.

Do NOT immediately retry the failed deploy without understanding the root cause.

## Incident Notes

After every rollback, write a short incident note:
- What deployed.
- What broke.
- When detected.
- When rolled back.
- Root cause (if known).
- Action items.

Store in your incident tracker (Linear, GitHub Issues, etc.). Brief is fine.