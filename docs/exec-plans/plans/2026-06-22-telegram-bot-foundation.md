# Telegram Bot Foundation

## Purpose / Big Picture

Create the worker-first Telegram bot foundation. After this slice, Telegram webhook updates are accepted only with the configured secret, linked users see the main menu, and unlinked users only see `Open App` guidance.

## Scope

In scope:

- Worker bot route, webhook secret verification, Telegram API adapter, command dispatcher.
- Account lookup from Telegram identity to existing app user identity.
- Bot chat/preferences row with no app access token or refresh token.
- `/start` and `/help` only.

Out of scope:

- `/ai`, `/stats`, `/top`, `/budget`, `/settings`.
- Notifications and scheduled jobs.
- Invite creation/sharing.

## Required Standards / References

- `docs/product-specs/tma/telegram-bot-companion.md`
- `docs/references/frontend/tma/auth-and-bot-pattern.md`
- `docs/references/backend/architecture-and-boundaries.md`
- `docs/references/shared/type-naming-pattern.md`

## Non-negotiable Requirements

- User must open TMA first. Unlinked bot users get only `Open App`.
- Bot persistence must not store app access or refresh tokens.
- Telegram API calls stay in one adapter/client layer.
- Domain handlers must not call Telegram APIs.

## Progress

- [ ] Add additive D1 migration for bot chat records.
- [ ] Add bot repository for chat/account lookup.
- [ ] Add bot route, webhook secret verification, service dispatcher, Telegram client adapter.
- [ ] Add `/start` and `/help` command handlers.
- [ ] Register route in worker entry.
- [ ] Add tests and update harness evidence.

## Decision Log

- Decision: Bot identity resolves from existing Telegram auth identity created by TMA launch.
  Rationale: Keeps TMA as trusted account-linking surface.
  Date/Author: 2026-06-22 / user + agent.
- Decision: No access/refresh tokens in bot tables.
  Rationale: Server-side bot actor does not need client sessions.
  Date/Author: 2026-06-22 / agent.

## Context and Orientation

- Worker entry: `apps/worker/src/index.ts`.
- Auth actor shape: `apps/worker/src/middlewares/auth.ts`, `apps/worker/src/types/app.ts`.
- Telegram identity truth: `auth_identities(provider='telegram')`.
- Tests: `apps/worker/test/integration/*` with `SELF.fetch`.

## Plan of Work

1. Create `apps/worker/migrations/0002_telegram_bot_foundation.sql` with `telegram_bot_chats`:
   - `id`, `telegram_user_id`, `telegram_chat_id`, `user_id`, preferences defaults, locale, timestamps.
   - Unique chat/user indexes.
   - No token columns.
2. Add `apps/worker/src/db/repositories/telegram-bot-chat-repository.ts`.
3. Add bot boundary files:
   - `apps/worker/src/bot/types.ts`
   - `apps/worker/src/bot/telegram-client.ts`
   - `apps/worker/src/bot/webhook-security.ts`
   - `apps/worker/src/bot/account-linking.ts`
   - `apps/worker/src/bot/service.ts`
   - `apps/worker/src/bot/commands/start.ts`
   - `apps/worker/src/bot/commands/help.ts`
4. Add `apps/worker/src/routes/telegram-bot.ts` and register it in `apps/worker/src/index.ts`.
5. Add env docs/config for bot token and webhook secret.
6. Add integration/unit tests for secret rejection, linked start, unlinked start, and help.

## Concrete Steps (Commands)

Run from repo root:

```bash
./init.sh typecheck
./init.sh test
```

Migration local smoke when needed:

```bash
wrangler d1 migrations apply household-finance-system --local --config ./wrangler.jsonc
```

## Validation and Acceptance

- Invalid webhook secret returns unauthorized response.
- Linked Telegram user gets menu buttons.
- Unlinked Telegram user gets only open-app guidance.
- `/help` describes supported bot/TMA boundary.
- Bot tables contain no app tokens.
- `./init.sh typecheck` and `./init.sh test` pass.

## Idempotence & Recovery

- Webhook retries must not create duplicate chat records.
- Repository upsert for chat records is safe to re-run.

## Risks / Blockers

- Local Telegram webhook testing needs a real bot token and public tunnel/staging URL; automated tests should mock outgoing Telegram calls.
