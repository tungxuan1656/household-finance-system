# TWA auth and bot pattern

Canonical worker, launch, and bot-boundary rules for Telegram Mini App work.

## Scope

Use this doc when work adds or changes:

- Telegram launch-context verification
- provider exchange for TWA auth
- `startapp` or `startattach` payload handling
- TWA invite/deep-link routing
- bot launch/share/notification behavior

## Auth contract rules

- TWA joins the existing worker session lifecycle.
- Prefer extending `POST /api/v1/auth/provider/exchange` over inventing a parallel TWA session route family.
- If request naming is still Firebase-shaped, neutralize it before landing Telegram support.
- Keep shared access-token, refresh-token, and user response shapes stable.

## Verification rules

- Send raw Telegram launch data to the worker for verification.
- Never trust client-parsed Telegram user fields as authenticated truth.
- Enforce `auth_date` freshness and replay-window checks.
- Reject invalid signature/hash, missing required fields, and unsupported launch context explicitly.

## Launch-surface rules

- Prefer launch surfaces that reliably provide Mini App auth context.
- Do not make keyboard-button or inline-mode launches a hard dependency for authenticated TWA product flows.
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

## Bot boundary rules

- Bot logic lives behind a dedicated adapter or service boundary.
- Expense, household, budget, and analytics handlers must not call Telegram bot APIs directly.
- Bot-triggered side effects stay explicit, auditable, and retry-aware.

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
- invalid signature/hash
- missing or unsupported launch data
- provider-neutral contract regression
- invalid or expired invite payload
- bot secret not exposed in logs or error payloads
