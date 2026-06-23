# Architecture and Boundaries

## Goal

Keep backend code maintainable and prevent layer mixing.

## Structure

- `src/routes/*`: route definitions and middleware composition
- `src/handlers/*`: business orchestration per use case
- `src/middlewares/*`: auth/guard/request checks
- `src/utils/*`: reusable pure helpers

## Boundary Rules

- Routes must not contain SQL.
- Handlers must not break response contracts.
- Utils must not depend on Hono context.
- Avoid “god helpers” that hide multiple responsibilities.
- The Telegram bot companion lives under `apps/worker/src/bot/`. `bot/service.ts` is the only webhook entry; `bot/telegram-client.ts` is the only module allowed to call Telegram Bot API. `bot/commands/*` and `bot/renderers/*` consume contracts and shared services only. `bot/lib/*` stays pure (no Hono context, no fetch globals).

## Quick Checklist

- [ ] New endpoint lives in the proper route module.
- [ ] Business logic is in handlers.
- [ ] No duplicated business logic across handlers.
- [ ] Split files when complexity grows too high.
- [ ] Bot edits use `editMessageText` / `editMessageReplyMarkup` from `TelegramClient`; handlers never call Telegram API directly.
- [ ] Natural-expense-input amount detection lives in `bot/lib/` as pure helpers; handlers stay thin.
