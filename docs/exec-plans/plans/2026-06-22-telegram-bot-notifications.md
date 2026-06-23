# Telegram Bot Notifications

## Purpose / Big Picture

Add notification delivery infrastructure and scheduled sends for budget alerts, household activity, and weekly digest. This slice depends on bot foundation and settings being complete.

## Scope

In scope:

- Notification delivery log and dedupe.
- Budget alerts at 80% warning and 100% exceeded.
- Household activity notifications, opt-in only.
- Weekly digest, opt-in only.
- Cron/scheduled worker entry if needed.

Out of scope:

- Quiet hours and mute all.
- Daily/monthly digests.
- Invite notifications unless product need is clarified later.
- Push/email channels.

## Required Standards / References

- `docs/product-specs/tma/telegram-bot-companion.md`
- `docs/product-specs/shared/budget-notification.md`
- `docs/product-specs/shared/notification-system.md`
- `docs/references/backend/architecture-and-boundaries.md`

## Non-negotiable Requirements

- Respect user preferences.
- Household activity default is off.
- Weekly digest default is off.
- Delivery dedupe prevents repeated same-period alerts.
- Telegram sends stay inside bot Telegram client/notification sender.

## Progress

- [ ] Add notification delivery table migration.
- [ ] Add delivery repository.
- [ ] Add notification sender.
- [ ] Add budget alert job.
- [ ] Add household activity hook/job.
- [ ] Add weekly digest job.
- [ ] Add tests and update harness evidence.

## Context and Orientation

- Budget status: `apps/worker/src/handlers/budgets/get-budget-status.ts`.
- Analytics overview/top categories: analytics handlers/repositories.
- Delivery should use `telegram_bot_chats` preferences.
- Telegram API send stays in `apps/worker/src/bot/telegram-client.ts` or a sender wrapper.

## Plan of Work

1. Add `apps/worker/migrations/0004_telegram_bot_notification_deliveries.sql`.
2. Add `apps/worker/src/db/repositories/telegram-bot-notification-delivery-repository.ts`.
3. Add `apps/worker/src/bot/notifications/sender.ts`.
4. Add `apps/worker/src/bot/notifications/budget-alerts.ts`.
5. Add `apps/worker/src/bot/notifications/household-activity.ts`.
6. Add `apps/worker/src/bot/notifications/weekly-digest.ts`.
7. Wire cron/scheduled entry in worker config/runtime if absent.
8. Add tests for dedupe keys, preference gating, failed send status, and retry-safe behavior.

## Concrete Steps (Commands)

```bash
./init.sh typecheck
./init.sh test
```

Migration local smoke when needed:

```bash
wrangler d1 migrations apply household-finance-system --local --config ./wrangler.jsonc
```

## Validation and Acceptance

- Budget warning is sent once per budget/user/period at 80%.
- Budget exceeded is sent once per budget/user/period at 100%.
- Household activity is skipped unless opted in.
- Weekly digest is skipped unless opted in.
- Delivery log records sent/failed/skipped state.
- `./init.sh typecheck` and `./init.sh test` pass.

## Idempotence & Recovery

- Jobs are safe to rerun because of delivery dedupe keys.
- Failed delivery can be retried without duplicate sent records.

## Risks / Blockers

- Notification spam risk if dedupe keys are wrong.
- Cron behavior may need separate staging validation with real Telegram bot.
