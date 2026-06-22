# Telegram Bot Expense Create

## Purpose / Big Picture

Add `/ai` expense creation from one Telegram message. The bot parses one expense, shows a complete preview, requires explicit confirmation, then creates exactly one auditable expense with duplicate prevention.

## Scope

In scope:

- `/ai <text>` command.
- One expense per message.
- Missing required fields -> error + ask user to re-enter.
- Low confidence accepted only when preview is complete and user confirms.
- Draft token/state, confirm/cancel actions, duplicate prevention.
- `created_via_bot` marker and audit log.

Out of scope:

- Expense edit/delete from bot.
- Multi-expense import from one bot message.
- Bot invite flow.
- TMA import preview deep-link integration, unless needed later.

## Required Standards / References

- `docs/product-specs/tma/telegram-bot-companion.md`
- `docs/product-specs/shared/expense-tracking.md`
- `docs/references/backend/architecture-and-boundaries.md`
- `docs/references/shared/type-naming-pattern.md`

## Non-negotiable Requirements

- Bot never creates an expense without explicit confirm.
- Duplicate confirm taps do not create duplicate expenses.
- Bot cannot edit or delete expenses.
- Bot-created expenses are auditable as Telegram bot-created.

## Progress

- [ ] Add draft table migration and `expenses.created_via_bot` marker.
- [ ] Add draft repository.
- [ ] Extract parse/create use-cases if needed.
- [ ] Add `/ai` parse/preview command.
- [ ] Add confirm/cancel handlers.
- [ ] Add audit logging and dedupe.
- [ ] Add tests and update harness evidence.

## Context and Orientation

- AI parse handler: `apps/worker/src/handlers/expenses/parse-expense.ts`.
- Expense create handler: `apps/worker/src/handlers/expenses/create-expense.ts`.
- Expense contracts: `apps/worker/src/contracts/expense-schemas.ts`.
- Audit repository: `apps/worker/src/db/repositories/audit-log-repository.ts`.

## Plan of Work

1. Add `apps/worker/migrations/0003_telegram_bot_expense_create.sql`:
   - `telegram_bot_expense_drafts` with token, dedupe key, JSON preview, status, created expense id, timestamps.
   - Add `expenses.created_via_bot INTEGER NOT NULL DEFAULT 0`.
2. Add `apps/worker/src/db/repositories/telegram-bot-expense-draft-repository.ts`.
3. Extract parse use-case if `parseExpenseHandler` is Hono-specific.
4. Extract create use-case if `createExpenseHandler` is Hono-specific.
5. Add `apps/worker/src/bot/commands/ai-expense.ts`.
6. Add `apps/worker/src/bot/commands/confirm-expense.ts`.
7. On confirm, write expense, set `created_via_bot=1`, mark draft confirmed, write audit payload `{ source: 'telegram_bot' }`.
8. On repeated confirm, return existing created expense.
9. Reject edit/delete commands in help/dispatcher.

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

- `/ai ăn bún 30k 15/6` returns preview.
- Confirm creates one expense.
- Repeated confirm returns same result and creates no duplicate.
- Missing amount/date/category/title returns re-enter guidance.
- Multi-expense parse is rejected for bot MVP.
- Created expense has `created_via_bot=1`.
- Audit log entry exists.
- `./init.sh typecheck` and `./init.sh test` pass.

## Idempotence & Recovery

- Draft confirm is idempotent by draft status and dedupe key.
- Expired drafts cannot create expenses.

## Risks / Blockers

- Existing parser may return multiple items; bot command must enforce one complete item only.
- Additive `expenses` column touches core expense mapper/tests.
