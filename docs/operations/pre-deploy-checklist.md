# Pre-Deploy Checklist

Tick every box before running any deploy command. If anything is unchecked → DO NOT deploy.

## Code Readiness

- [ ] Deploy commit is pushed to `main` (or release branch merged into `main`).
- [ ] `./init.sh` runs clean: install → harness → lint → typecheck → test. Specifically pass:
  - `pnpm --filter worker lint`
  - `pnpm --filter worker typecheck`
  - `pnpm --filter worker test --run`
  - `pnpm --filter tma lint`
  - `pnpm --filter tma typecheck`
  - `pnpm --filter tma test --run`
- [ ] Test pass count >= previous commit pass count. No coverage regression without documented reason.
- [ ] `git status` clean. No uncommitted changes.

## Worker Config

- [ ] `apps/worker/wrangler.jsonc`:
  - `database_id` replaced with the real production D1 ID (NOT the placeholder `00000000-...`).
  - `compatibility_date` not older than 6 months from the latest workerd release.
- [ ] New migrations (if any) reviewed for SQL safety: no `DROP TABLE`, no destructive data migration.

## Environment & Secrets

- [ ] Target env confirmed: `staging` or `production`.
- [ ] Cloudflare API token has scopes:
  - Workers Scripts: Edit
  - D1: Edit
  - Account Settings: Read
- [ ] All required secrets set on the target env (see `secrets-rotation.md` for the full list).
- [ ] `INVITATION_TOKEN_PEPPER` is set (mandatory — production guard throws on missing).
- [ ] `AUTH_ALLOW_INSECURE_TEST_TOKENS` = `false` in production.
- [ ] `APP_ENV` = `production` in production.

## TMA Bundle

- [ ] `apps/tma` builds locally: `pnpm --filter tma build`.
- [ ] `VITE_WORKER_URL` set correctly for the target env at build time (use Vite `.env.production` / `.env.staging`).
- [ ] Telegram bot points at the new TMA URL (updated via BotFather or menu button API).

## Communication

- [ ] Team notified about deploy window (Slack/Discord).
- [ ] On-call person available to revert if needed.
- [ ] Status page (if any) has no open incident.

## Rollback Plan

- [ ] Previous Worker version recorded (capture `wrangler deployments list` before deploy).
- [ ] Previous TMA bundle version recorded (git tag or commit hash).
- [ ] Rollback procedure verified on staging previously.

When every box is ticked → proceed to `deploy-worker.md` and `deploy-tma.md`.