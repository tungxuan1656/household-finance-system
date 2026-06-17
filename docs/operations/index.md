# Deployment Runbook

Runbook for deploying `apps/worker` to Cloudflare Workers and `apps/tma` to Telegram Mini Apps.

Use this runbook when:
- Promoting staging to production.
- Onboarding a new team member to the release flow.
- Recovering after an incident (rollback).

Do NOT use this for code changes or local debugging. For local dev, see `AGENTS.md` + `./init.sh dev`.

## Doc Architecture

This index routes to leaf docs. Leaf docs hold the rules. Do not duplicate rule bodies here.

## Reading Order

1. `pre-deploy-checklist.md` — gates before any deploy.
2. `deploy-worker.md` — Cloudflare Workers + D1.
3. `deploy-tma.md` — Telegram Mini Apps (Vite build + BotFather).
4. `post-deploy-verify.md` — smoke tests after release.
5. `rollback.md` — revert to previous version.
6. `secrets-rotation.md` — safe secret rotation.

## Tooling Baseline

Repo tooling:
- `pnpm` monorepo, workspace at repo root.
- `./init.sh <param>` wrapper for `pnpm <cmd>`. Params: `install`, `lint`, `typecheck`, `test`, `build`. Run full `./init.sh` only at final verification.
- `wrangler` (Cloudflare CLI), wrapped in `apps/worker/package.json` scripts.
- Cloudflare dashboard + Cloudflare API token.

Prerequisites before running the runbook:
- Cloudflare account with edit rights on Workers + D1 in the target account.
- `CLOUDFLARE_API_TOKEN` in local env (scope: Workers Scripts:Edit + D1:Edit + Account Settings:Read).
- Cloudflare Account ID for the target env (export as `CF_ACCOUNT_ID`).
- Telegram bot created via BotFather (see `deploy-tma.md`).
- Telegram bot token added to Worker secrets.

## Environment Matrix

| Env       | Worker URL                                  | TMA URL                                | D1 database             | Telegram bot           |
|-----------|---------------------------------------------|----------------------------------------|-------------------------|------------------------|
| local     | `http://localhost:8787/api/v1`              | `http://<lan-ip>:5174`                 | local D1 via wrangler   | dev bot                |
| staging   | `https://hfs-worker-staging.<acct>.workers.dev/api/v1` | `https://staging.example.com` | `household-finance-staging` | staging bot      |
| production| `https://api.householdfinance.app/api/v1`   | `https://app.householdfinance.app`     | `household-finance-main`| production bot         |

Production URLs are examples. Replace with the project's real domains.

## Scope: Worker + TMA Only

This runbook covers `apps/worker` and `apps/tma` only.

Web (`apps/web`) is a Next.js standalone app, deployed via Vercel or equivalent. Out of scope here.

## Definition of Done (Deploy)

A deploy is done when:
- Pre-deploy checklist is fully ticked.
- `./init.sh lint typecheck test` passes on the deploy commit.
- D1 migrations applied remotely.
- Worker deploy succeeds, no errors in Cloudflare logs for first 5 minutes.
- TMA bundle serves successfully over HTTPS, `/api/v1/health` reachable from Telegram WebView.
- Post-deploy verify passes all checks.

## Common Failure Modes

- Wrangler deploy fails with "Authentication error [code: 10000]" → token wrong scope or expired.
- D1 migration timeout → check query size, no SQL > 100KB per migration.
- TMA opens blank screen in Telegram → wrong `VITE_WORKER_URL` or CORS blocked.
- Worker returns 500 across all routes → check secrets set (especially `AUTH_JWT_SECRET` and `INVITATION_TOKEN_PEPPER`).

## Related Docs

- Worker runtime/bindings: `references/backend/cloudflare-workers.md`.
- Auth/secret model: `references/backend/security-and-auth-pattern.md`.
- TMA client rules: `references/frontend/tma/app-structure-and-client-rules.md`.
- Reliability checklist: `RELIABILITY.md`.
- Security baseline: `SECURITY.md`.