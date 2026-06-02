# TMA auth and bot pattern

Canonical worker, launch, and bot-boundary rules for Telegram Mini App work.

## Scope

Use this doc when work adds or changes:

- Telegram launch-context verification
- provider exchange for TMA auth
- `startapp` or `startattach` payload handling
- TMA invite/deep-link routing
- bot launch/share/notification behavior

## Auth contract rules

- TMA joins the existing worker session lifecycle.
- Prefer extending `POST /api/v1/auth/provider/exchange` over inventing a parallel TMA session route family.
- If request naming is still Firebase-shaped, neutralize it before landing Telegram support.
- Keep shared access-token, refresh-token, and user response shapes stable.

## Provider exchange request shape

`POST /api/v1/auth/provider/exchange` accepts a discriminated union keyed on `provider`. Existing Firebase clients keep working because the union preserves the Firebase branch byte-for-byte.

```json
// Firebase (web)
{ "provider": "firebase", "idToken": "<firebase-id-token>" }

// Telegram (TMA)
{ "provider": "telegram", "initData": "<raw Telegram WebApp initData query string>" }
```

Validation rules:

- `z.discriminatedUnion('provider', [...])` rejects unknown providers and unknown fields.
- Telegram `initData` must contain `hash`, `auth_date`, and `user` keys. Missing or unparseable fields return `400` with `errors.invalidTelegramLaunchData`.
- The Telegram branch is server-verified. The TMA client only forwards the raw `initData` string from `@tma.js/sdk-react`; parsed `initDataUnsafe.user` fields are never trusted as identity.

## Verification rules

- Send raw Telegram launch data to the worker for verification.
- Never trust client-parsed Telegram user fields as authenticated truth.
- Enforce `auth_date` freshness and replay-window checks.
- Reject invalid signature/hash, missing required fields, and unsupported launch context explicitly.
- Telegram signature path:
  1. Build the `data-check-string` by removing `hash` and joining `key=value` pairs (sorted by key) with `\n`.
  2. Compute `secret_key = HMAC-SHA256("WebAppData", bot_token)` and keep the raw bytes.
  3. Compute `hash = HMAC-SHA256(secret_key, data-check-string)` and hex-encode only this final digest.
  4. Constant-time compare against the provided `hash` field.
- Worker config: `TELEGRAM_BOT_TOKEN` is required at startup. `TELEGRAM_FRESHNESS_WINDOW_SECONDS` defaults to `3600`.

## Launch-surface rules

- Prefer launch surfaces that reliably provide Mini App auth context.
- Do not make keyboard-button or inline-mode launches a hard dependency for authenticated TMA product flows.
- Treat missing or unusable launch context as a blocking re-open path, not a guest-session shortcut.

## Intent payload rules

- Treat `startapp` and `startattach` as one compact opaque payload.
- Keep payloads small, versioned, and easy to validate.
- Decode and validate intent before mapping to product behavior.
- Route only to supported product intents such as invite preview/accept. Unknown intents should fail closed.

Good payload shape ideas:

- compact JSON then base64url
- version prefix like `v1:` when schema evolution is likely

Bad payload shape ideas:

- raw household ids with no checksum or expiry context
- multi-parameter ad hoc query parsing spread across pages

## Runtime rules

- Use Cloudflare Worker-compatible crypto only.
- Keep bot token or validation secrets in worker env/config only.
- Do not depend on Node-only verification helpers inside worker handlers.

## Identity rules

- Keep provider identity mapping provider-neutral.
- One Telegram account maps to one local app user identity.
- Reuse existing refresh-session and logout flows.
- Do not create a Telegram-only session table, JWT shape, or permission model.
- `auth_identities` is the source of truth. `provider` + `provider_subject` uniqueness means a Telegram identity and a Firebase identity never collide even if they share an email. Cross-provider merge is intentionally not implemented.

## Bot boundary rules

- Bot logic lives behind a dedicated adapter or service boundary.
- Expense, household, budget, and analytics handlers must not call Telegram bot APIs directly.
- Bot-triggered side effects stay explicit, auditable, and retry-aware.
- Default deployment shape is worker-first: keep the bot boundary inside `apps/worker` until real operational pressure justifies extraction.

Bot is good for:

- opening the Mini App
- sharing invite links
- budget alerts
- summary digests

Bot is not the primary UI for:

- multi-step expense create/edit
- budget CRUD
- household administration
- read-heavy analytics exploration

## Interaction-contract rules

- Do not base core product flows on `sendData()` or keyboard-button close semantics.
- Mini App deep links should land in the SPA, finish auth if needed, then continue the intended action.
- Invite acceptance must preserve the same worker membership and permission rules already used by web.

## Test rules

Cover at least:

- valid Telegram exchange
- expired `auth_date`
- invalid signature/hash (including equal-length mismatch to validate constant-time compare)
- missing `hash`, missing `user`, missing `auth_date`
- unsupported provider literal
- provider-neutral contract regression (Firebase path still passes)
- repeated exchange maps to the same local user
- separate identity per provider for the same email
- invalid or expired invite payload
- bot secret not exposed in logs or error payloads
