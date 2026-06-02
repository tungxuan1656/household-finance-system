# TWA auth and bot pattern

Canonical worker and platform rules for Telegram Mini App auth and bot-adjacent work.

## Scope

Use this doc when work adds or changes:

- Telegram launch-context verification
- provider exchange for TWA auth
- bot-link generation or bot-adjacent adapters
- TWA invite or deep-link validation boundaries

## Contract rules

- TWA should join the existing worker session lifecycle.
- Prefer extending `POST /api/v1/auth/provider/exchange` over inventing a parallel session route family.
- If the existing request shape is too Firebase-specific (`idToken`), refactor it to provider-neutral naming before adding Telegram support.
- Keep the shared access-token, refresh-token, and user response shape stable.

## Verification rules

- Verify raw Telegram launch data on the worker.
- Never trust client-parsed Telegram user fields without verification.
- Enforce `auth_date` freshness.
- Reject invalid hash/signature, missing fields, and replay-window violations.

## Runtime rules

- Use Cloudflare Worker-compatible crypto.
- Do not depend on Node-only verification helpers inside worker handlers.
- Secrets such as the bot token stay in worker env/config only.

## Identity rules

- Keep provider identity mapping provider-neutral.
- One Telegram account maps to one local app user identity.
- Reuse the existing refresh-session and logout flows.
- Do not create a Telegram-only session table or JWT format.

## Launch and deep-link rules

- Some launch modes may not provide valid `initData`.
- Reject unsupported or missing launch context explicitly. Do not create guest sessions silently.
- Treat `startapp` as one compact opaque payload.
- Decode and validate invite or action intent before using it to route product behavior.

## Bot boundary rules

- Bot send/link logic belongs behind a dedicated adapter or service boundary.
- Expense, household, budget, and analytics handlers must not call Telegram bot APIs directly.
- Bot-triggered side effects should remain explicit, auditable, and retry-aware.

## Test rules

Cover at least:

- valid Telegram exchange
- expired `auth_date`
- invalid signature/hash
- missing launch data
- provider-neutral contract regression
- invite payload decode failure
- bot secret not exposed in logs or error payloads
