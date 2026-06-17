# Post-Deploy Verification

Run after every Worker + TMA deploy. Takes ~5 minutes. Catches the silent regressions.

## Worker Smoke Tests

### 1. Health Endpoint

```bash
WORKER_URL="https://<worker-url>"
curl -fsS "$WORKER_URL/api/v1/health" | jq .
```

Expected: HTTP 200 with status `ok` field.

### 2. Security Headers

```bash
curl -fsSI "$WORKER_URL/api/v1/health"
```

Expected headers (set by `security-headers.ts` middleware):
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: no-referrer`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `Permissions-Policy: geolocation=(), microphone=(), camera=()`

Missing any → check `wrangler deploy` succeeded and `securityHeadersMiddleware` is registered in `index.ts`.

### 3. Rate Limit Check (Auth)

Hit `/api/v1/auth/...` 11 times rapidly with a junk body:

```bash
for i in $(seq 1 11); do
  curl -s -o /dev/null -w "%{http_code}\n" \
    -X POST "$WORKER_URL/api/v1/auth/provider/exchange" \
    -H "Content-Type: application/json" \
    -d '{}'
done
```

Expected: 10 requests get 400 (invalid input), 11th request gets 429 (`RATE_LIMITED`).

If all return 400 → rate limit middleware not applied. Check `routes/auth.ts`.

### 4. Auth Round-Trip

Run a real login via Telegram provider (or Firebase, depending on what the test fixtures use):

```bash
# Use a test fixture or hit the existing integration test against the deployed URL.
# This validates end-to-end auth + session creation.
```

Or run integration tests remotely:
```bash
cd apps/worker
WORKER_URL="$WORKER_URL" pnpm test --run
```

(Adjust based on how integration tests are configured — see `references/backend/testing-pattern.md`.)

### 5. D1 Migrations Applied

```bash
cd apps/worker
pnpm exec wrangler d1 execute household-finance-main --remote --command "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"
```

Expected: full schema list, including any new tables from latest migration.

If a migration was missed, see `rollback.md` for recovery.

## TMA Smoke Tests

### 1. Bundle Loads in Browser

```bash
curl -fsS "https://<tma-url>" | head -50
```

Expected: HTML with `<script type="module" src="/assets/index-*.js">` and meta tags.

### 2. Static Assets Reachable

```bash
curl -fsSI "https://<tma-url>/assets/index-$(curl -fsS https://<tma-url> | grep -oP 'index-[^.]+\.js' | head -1)"
```

Expected: 200 with correct `Content-Type: application/javascript`.

### 3. API URL Embedded

```bash
curl -fsS "https://<tma-url>" | grep -c "VITE_WORKER_URL\|api/v1"
# Or inspect built JS:
curl -fsS "https://<tma-url>/assets/index-*.js" | grep -c "<expected-worker-host>"
```

Expected: at least 1 match for the Worker hostname.

If `VITE_WORKER_URL` not embedded → build was done with wrong env, or env var was empty.

### 4. End-to-End in Telegram

Manual test (cannot be automated via curl):
1. Open Telegram mobile app.
2. Navigate to the bot.
3. Tap menu button → TMA opens.
4. Verify:
   - App renders without white screen.
   - Login flow works.
   - Bottom buttons respond.
   - Dark mode toggle works.

### 5. Error Boundary

Trigger a runtime error (e.g., navigate to a non-existent route):
```bash
# In Telegram, navigate to an invalid URL inside the TMA.
# Or simulate via:
curl -fsS "https://<tma-url>/some-invalid-route" | grep "index.html"
# SPA should serve index.html for any path.
```

Expected: 404 page (not the runtime error boundary). To test the error boundary, manually trigger a JS error inside the app.

## Cross-App Integration

### 1. Auth Token Round-Trip

1. Open TMA in Telegram.
2. Login → access token + refresh token stored.
3. Wait until access token expires (or manually delete from storage).
4. Trigger an API call.
5. Expected: token refresh succeeds, API call retries and succeeds.

If refresh fails → check `RefreshInterceptor` wiring in `apps/tma/src/features/auth/`.

### 2. Invitation Flow

1. User A creates household invitation.
2. User B opens invitation preview (no login).
3. User B accepts → joins household.

If preview returns stale data (used/expired not filtered) → M5 fix not deployed.

## Monitoring Setup

- Cloudflare Workers → Worker → Logs → set retention to 30 days.
- Cloudflare Workers → Worker → Alerts → create alert for:
  - Error rate > 1% over 5 minutes.
  - CPU time > 10ms p95 over 10 minutes.
  - D1 query errors > 0.
- Status page (if external) → mark deploy complete.

## Rollback Triggers

Roll back if any of these persist for > 5 minutes:
- Health endpoint returns 5xx.
- Error rate > 5%.
- Auth round-trip fails.
- TMA white-screens on launch.

See `rollback.md`.

## Sign-Off

Post-deploy verify passes → log completion:
- [ ] Worker smoke tests pass.
- [ ] TMA bundle verified.
- [ ] E2E flow tested.
- [ ] Monitoring alerts configured.
- [ ] Team notified on Slack.
- [ ] Deploy ticket closed.