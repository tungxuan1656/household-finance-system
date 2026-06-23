# Telegram Bot Read Commands

## Purpose / Big Picture

Add read-only bot commands for spending summaries, top categories, and budget status. After this slice, linked users can use `/stats`, `/top`, and `/budget` to receive short Vietnamese summaries for only their visible personal/household scopes.

## Scope

In scope:

- `/stats`, `/top`, `/budget` commands.
- Household/group option lists for current user only.
- Vietnamese-ready text rendering in worker bot layer.

Out of scope:

- Expense creation.
- Notifications and settings.
- Member breakdown in household stats.
- Charts, exports, custom filters.

## Required Standards / References

- `docs/product-specs/tma/telegram-bot-companion.md`
- `docs/product-specs/shared/analytics-overview.md`
- `docs/product-specs/shared/budget-notification.md`
- `docs/references/backend/architecture-and-boundaries.md`

## Non-negotiable Requirements

- Commands are read-only.
- Bot only shows scopes user can access.
- Output is short Vietnamese text suitable for Telegram chat.
- No household member breakdown in MVP.

## Progress

- [ ] Extract or add reusable actor-based analytics/budget query services.
- [ ] Add Vietnamese finance renderer.
- [ ] Add `/stats` command.
- [ ] Add `/top` command.
- [ ] Add `/budget` command.
- [ ] Add tests and update harness evidence.

## Context and Orientation

Reusable areas:

- Analytics overview: `apps/worker/src/handlers/analytics/get-analytics-overview.ts`.
- Analytics comparison: `apps/worker/src/handlers/analytics/get-analytics-comparison.ts`.
- Budget list/status: `apps/worker/src/handlers/budgets/list-budgets.ts`, `apps/worker/src/handlers/budgets/get-budget-status.ts`.
- Household membership: `apps/worker/src/db/repositories/household-membership-repository.ts`.
- Existing TMA labels/formatting references: `apps/tma/src/lib/i18n/locales/vi.json`, `apps/tma/src/lib/formatters.ts`.

## Plan of Work

1. Add worker-safe formatting helpers under `apps/worker/src/bot/renderers/finance-text.ts`.
2. Add keyboard builders under `apps/worker/src/bot/renderers/keyboards.ts`.
3. Extract Hono-free query helpers if current handlers are too coupled to context.
4. Add `apps/worker/src/bot/commands/stats.ts` with scope and period option flow.
5. Add `apps/worker/src/bot/commands/top.ts` with top category output.
6. Add `apps/worker/src/bot/commands/budget.ts` with budget status output.
7. Register commands in bot dispatcher.
8. Add tests for personal scope, household scope, no household, inaccessible household, and budget status labels.

## Concrete Steps (Commands)

```bash
./init.sh typecheck
./init.sh test
```

## Validation and Acceptance

- `/stats` shows personal/household scope choices and a summary.
- `/top` shows top categories for selected scope/period.
- `/budget` shows safe/warning/exceeded budget state.
- Inaccessible household/group requests are rejected or omitted.
- Vietnamese currency/date/category labels are readable and consistent.
- `./init.sh typecheck` and `./init.sh test` pass.

## Idempotence & Recovery

- Read commands have no write side effects except optional bot message state.

## Risks / Blockers

- Some existing handler logic may need extraction into use-case helpers to avoid importing Hono handlers into bot commands.
