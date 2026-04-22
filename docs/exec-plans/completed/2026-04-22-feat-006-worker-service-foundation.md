# feat-006: Worker Service Foundation

## Summary
Complete the `apps/worker` foundation for Cloudflare Workers + Hono so the backend has a stable runtime shell, shared request validation, consistent envelopes, and an auth middleware boundary that future domain routes can reuse safely.

## Key Changes
- Keep `apps/worker/src/index.ts` as the Hono root with request context, not-found handling, and a global error adapter.
- Extract shared request-body parsing into `apps/worker/src/lib/validation.ts` and reuse it from auth/profile routes.
- Move worker auth user lookup into repository code so `apps/worker/src/middlewares/auth.ts` only orchestrates session and identity checks.
- Align worker naming/config from `fos-*` to Household Finance naming in runtime docs and test config.
- Add worker foundation tests for request-id propagation, 404s, generic internal-error mapping, and validation failures.

## Scope
- In scope: `apps/worker/src/**`, `apps/worker/test/**`, `apps/worker/package.json`, `apps/worker/wrangler.jsonc`, `apps/worker/.dev.vars.example`, `apps/worker/README.md`, and harness bookkeeping.
- Out of scope: new business-domain routes for expenses, households, budgets, analytics, or migrations beyond the existing worker foundation.

## Test Plan
- `pnpm --filter worker lint`
- `pnpm --filter worker typecheck`
- `pnpm --filter worker test`
- `./init.sh`

## Outcome
- Worker foundation is now consistent enough for downstream domain work to mount on top without re-litigating config, envelopes, or JSON parsing at each route.
- Repo verification passed end to end.
