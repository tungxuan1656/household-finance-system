# Deploy TMA (Telegram Mini App)

## Stack

- Build: Vite SPA, output to `apps/tma/dist/`.
- Hosting: any static HTTPS host (Cloudflare Pages recommended).
- Entry point: `apps/tma/index.html` → `apps/tma/src/main.tsx`.
- Bot integration: Telegram BotFather + bot menu button.

## Architecture Recap

TMA is a pure client-side SPA. It talks to the Worker via `fetch`. There is no server-side render.

The build embeds `VITE_WORKER_URL` at compile time. Changing the backend URL requires a rebuild.

See `references/frontend/tma/app-structure-and-client-rules.md` for client-side rules.

## One-Time Setup

### 1. Create Telegram Bot

Use @BotFather in Telegram:
1. `/newbot` — pick name and username.
2. Save the bot token. Add it to Worker secrets as `TELEGRAM_BOT_TOKEN` (see `deploy-worker.md`).
3. `/setdomain` — set the domain that will host the TMA (e.g. `app.your-domain.com`).
4. `/setmenubutton` — set the menu button URL to the TMA URL.
5. `/setuserpic` — optional branding.

For staging, use a separate bot (e.g. `YourAppStagingBot`).

### 2. Configure Static Hosting (Cloudflare Pages Recommended)

If hosting on Cloudflare Pages:
```bash
cd apps/tma
pnpm build
# Output: apps/tma/dist/

# Upload dist/ to a Cloudflare Pages project:
# - Connect repo, set build command: pnpm --filter tma build
# - Set output directory: apps/tma/dist
# - Set environment variable: VITE_WORKER_URL=https://<worker-url>/api/v1
```

Pages auto-deploys on push to the configured branch. For manual control:
```bash
pnpm exec wrangler pages deploy dist --project-name=<pages-project>
```

Alternative hosts: Vercel, Netlify, S3 + CloudFront. All require HTTPS — Telegram rejects HTTP origins.

### 3. Required Build Env Vars

| Var | Value | Notes |
|-----|-------|-------|
| `VITE_WORKER_URL` | `https://<worker-url>/api/v1` | Must match the deployed Worker |

Vite reads `.env.production`, `.env.staging`, etc. based on `--mode`. Use Vite modes for env-specific URLs:

```bash
# apps/tma/.env.production
VITE_WORKER_URL=https://api.your-domain.com/api/v1

# apps/tma/.env.staging
VITE_WORKER_URL=https://hfs-worker-staging.<acct>.workers.dev/api/v1
```

Build commands:
```bash
pnpm --filter tma build --mode production
pnpm --filter tma build --mode staging
```

Or pass inline:
```bash
VITE_WORKER_URL=https://staging.example.com/api/v1 pnpm --filter tma build
```

## Per-Deploy Steps

### 1. Verify Build

```bash
cd apps/tma
pnpm build
```

Check `dist/` is created and `dist/index.html` exists. No TypeScript errors. No Vite warnings about missing env vars.

### 2. Deploy Bundle

Cloudflare Pages (CI/CD):
- Push to release branch → Pages auto-builds and deploys.
- Check Pages dashboard for build status.

Cloudflare Pages (manual):
```bash
pnpm exec wrangler pages deploy dist --project-name=<project>
```

Other hosts: follow host-specific deploy procedure.

### 3. Update Telegram Bot Menu Button (if URL changed)

If the TMA URL changed (different domain or path):
1. Open @BotFather.
2. `/setmenubutton` → select bot → set new URL.

Or via Telegram Bot API:
```bash
curl -X POST https://api.telegram.org/bot<TOKEN>/setChatMenuButton \
  -H "Content-Type: application/json" \
  -d '{
    "menu_button": {
      "type": "web_app",
      "text": "Open App",
      "web_app": { "url": "https://<new-tma-url>" }
    }
  }'
```

### 4. Smoke Test from Telegram

Open the bot in Telegram mobile app → tap menu button → TMA opens.

Verify:
- App loads in < 3 seconds.
- Theme matches Telegram theme (light/dark).
- Login flow works end-to-end.

### 5. CORS Check

Worker CORS is configured at `apps/worker/src/lib/cors.ts`. The TMA origin (e.g. `https://app.your-domain.com`) must be in the allowlist. If not, requests fail with CORS error in browser console.

Update CORS allowlist → redeploy Worker.

## Custom Domain for TMA

If using Cloudflare Pages:
1. Pages project → Custom domains → Add domain.
2. Domain must belong to a Cloudflare zone.
3. HTTPS auto-issued.

If using another host: configure DNS and TLS per host.

## Observability

TMA is client-side only — no server logs.

Debug tools:
- Telegram WebApp debug mode: open bot → tap 10x on version number (mobile) to enable debug.
- Browser console (open in desktop browser at the TMA URL with fake launch params).
- Worker logs show all backend requests. See `deploy-worker.md` for tail.

## Rollback

If the TMA bundle has a bug → `rollback.md`. TMA rollback = redeploy previous bundle (Cloudflare Pages keeps deploy history).

## Common Pitfalls

- Building TMA without `VITE_WORKER_URL` → falls back to `/api/v1` which only works if TMA and Worker share an origin (e.g. same domain with Worker at `/api/*`). Check `apps/tma/src/app/app.tsx:14`.
- TMA domain not added via `/setdomain` in BotFather → `initData` validation fails, login broken.
- Using HTTP instead of HTTPS → Telegram WebView rejects the URL.
- Cache busting not configured → users see stale bundle. Cloudflare Pages handles this via hashed asset names, but `index.html` may be cached. Add a custom cache rule if needed.
- MiniApp back button not configured → users can't navigate properly. See `references/frontend/tma/app-structure-and-client-rules.md`.