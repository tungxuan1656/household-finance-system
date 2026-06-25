# feat-121: Bot natural-input direct-create + post-create household/delete

## Purpose / Big Picture

In a private chat, a linked Telegram user who sends a short expense message (e.g. `ăn bún 30k 15/6`) without a command currently gets the same flow as `/ai`: loader → full preview → explicit confirm. Many users find the confirm step friction for routine capture.

Change the natural-input path so a detected expense is **created immediately** when the AI returns a valid item. Each created expense is reported as its own Telegram message with two inline actions: `🏠 Chọn household` (assign a household after the fact) and `🗑 Xoá` (soft-delete the just-created row). Edits stay in-place; the chat stays clean.

`/ai` and `/aimulti` keep their existing preview → confirm flow. Only the auto-detect path changes.

## Scope

In scope:

- Spec change: `docs/product-specs/tma/telegram-bot-companion.md` — new "Natural Input Direct Create" subsection, update Auto-detect acceptance criteria, keep `Bot never creates an expense from free-form text without explicit user confirmation` true only for `/ai` and `/aimulti`.
- New file: `apps/worker/src/bot/commands/natural-expense.ts` — direct-create flow (loader → AI parse → create per item → send one confirmation message per created expense with `postCreateKeyboard`).
- New file: `apps/worker/src/bot/commands/post-create-expense.ts` — handlers for `ch_household` and `ch_delete` callbacks invoked after a natural-input expense is created.
- Edit: `apps/worker/src/bot/service.ts` — replace the natural-input branch to call the new direct-create flow.
- Edit: `apps/worker/src/bot/callback-dispatcher.ts` — wire `ch_household` and `ch_delete` actions.
- Edit: `apps/worker/src/bot/renderers/keyboards.ts` — add `postCreateKeyboard(expenseId, hasHouseholds)` returning the two-button row; `ch_household` and `ch_delete` callbacks hide `ch_household` when the user has no households.
- Edit: `apps/worker/src/db/repositories/expense-repository.ts` — add `updateExpenseHousehold(expenseId, appUserId, householdId | null)` partial update helper (owner check + currency lookup kept in handler).
- New tests: `apps/worker/test/unit/bot/commands/natural-expense.spec.ts`, `apps/worker/test/unit/bot/commands/post-create-expense.spec.ts`, extend `apps/worker/test/unit/bot/renderers/keyboards.spec.ts`.
- Harness: add `feat-121` to `harness/feature_index.json` + `harness/features/feat-121-...json`, log evidence in `harness/progress.md`, mark plan active in `docs/exec-plans/index.md`.

Out of scope:

- Edit expense after create (delete + re-create).
- Bulk apply household to multiple created expenses in one tap (per-message keyboard stays per expense).
- `/ai` and `/aimulti` flow changes (preview → confirm stays).
- Group-level expense editing.
- Notification fan-out (household-activity notification) — already handled by `household-activity.ts` on expense create with `household_id` set; a personal-then-household-moved path emits no second event in this slice.
- New audit action types beyond `expense.created` / `expense.updated` (household re-assignment) / `expense.deleted`.

## Required Standards / References

- `docs/product-specs/tma/telegram-bot-companion.md` (source of truth for bot behaviour, modified here)
- `docs/product-specs/shared/expense-tracking.md` (create / update / delete semantics)
- `docs/references/backend/architecture-and-boundaries.md` (route → handler → repository)
- `docs/references/backend/testing-pattern.md`
- `docs/references/shared/type-naming-pattern.md`

## Non-negotiable Requirements

- Natural input creates immediately when AI returns ≥1 valid item; no preview, no confirm button.
- Each created expense becomes one Telegram message with `🏠 Chọn household` + `🗑 Xoá` (or only `🗑 Xoá` if user has no households).
- All post-create actions edit the existing message in place. No extra bubbles.
- `🏠 Chọn household` opens the existing household selection keyboard; picking `personal` or a household updates `expenses.household_id` and re-edits the message to `✅ <preview>` with the same two buttons (now reflecting the new scope).
- `🗑 Xoá` soft-deletes the expense, re-edits the message to `🗑 Đã xoá — <summary line>` with no buttons.
- Defense-in-depth: post-create handlers must verify `expense.spent_by_user_id === ctx.appUserId` before mutating.
- Audit log: `expense.created` (source `telegram_bot`, direct path), `expense.updated` (household re-assignment only when value changes), `expense.deleted` (source `telegram_bot`, post-create undo).
- Currency follows the chosen household's `defaultCurrencyCode`; the summary line is re-rendered with the new currency.
- The loader still anchors the response slot: send `⏳ Phân tích...`, run AI, then either edit to a per-expense confirmation (success) or to the existing error text (`INPUT_UNRECOGNIZED_TEXT` / `AI_UNAVAILABLE_TEXT`). For zero valid items, edit to error text (no silent drop).
- No dedupe. Re-sending the same natural message creates new rows. The user has the delete button to clean up mistakes.
- `/ai` and `/aimulti` flow is untouched.

## Progress

- [x] Write ExecPlan
- [ ] Update spec with natural-input direct-create acceptance criteria
- [ ] Add `updateExpenseHousehold` to expense-repository
- [ ] Add `postCreateKeyboard` to renderers/keyboards
- [ ] Create `commands/natural-expense.ts` direct-create flow
- [ ] Create `commands/post-create-expense.ts` handlers (household + delete)
- [ ] Replace natural-input branch in `service.ts`
- [ ] Wire new callbacks in `callback-dispatcher.ts`
- [ ] Add unit tests for natural-expense service
- [ ] Add unit tests for post-create handlers
- [ ] Extend keyboards.spec.ts for `postCreateKeyboard`
- [ ] Update harness: feat-121 entries + progress.md
- [ ] Mark plan active in `docs/exec-plans/index.md`
- [ ] Verify: `./init.sh typecheck && ./init.sh lint && ./init.sh test`

## Surprises & Discoveries

- TBD as implementation lands.

## Decision Log

- Decision: Multi-item natural input → one Telegram message per created expense (not one summary bubble with N rows).
  Rationale: User explicitly wrote "gửi tin nhắn báo đã lưu từng chi tiêu" (send a message reporting each saved expense). Per-message keyboards also make household/delete per-expense simple and parallel to `/aimulti`.
  Date/Author: 2026-06-25 — initial plan.

- Decision: No dedupe for natural input direct-create.
  Rationale: The whole point of skipping confirm is speed; running a dedupe check would defeat it. Mistakes are cheap to fix via the in-message delete button. `/ai` and `/aimulti` retain their dedupe for the slower confirm path.
  Date/Author: 2026-06-25 — initial plan.

- Decision: Hide `🏠 Chọn household` button when user has zero households.
  Rationale: Showing a button that only leads to "Chưa tham gia hộ nào" is noise. Falls back to single-button `🗑 Xoá`.
  Date/Author: 2026-06-25 — initial plan.

- Decision: Default scope for natural input is `personal`. No scope arg parsing on this path.
  Rationale: Mirrors `/ai` without `hh:<id>` arg. User can reassign via `🏠 Chọn household` after create. Keeps the parser simple and consistent with `/aimulti` scope-arg semantics (which only apply to that command).
  Date/Author: 2026-06-25 — initial plan.

- Decision: Use partial `updateExpenseHousehold` repo helper instead of full `updateExpense` payload.
  Rationale: The post-create path only changes `household_id` (and may need to update currency). Reusing full `updateExpense` would force the handler to re-derive every field, increasing drift risk.
  Date/Author: 2026-06-25 — initial plan.

- Decision: New file `commands/post-create-expense.ts` rather than extending `confirm-expense.ts`.
  Rationale: Draft-based and direct-create flows share no state. New file keeps each path independently testable and prevents accidental cross-coupling.
  Date/Author: 2026-06-25 — initial plan.

## Outcomes & Retrospective

TBD after implementation.

## Context and Orientation

Relevant files in the repo:

- Bot entry: `apps/worker/src/bot/service.ts` (the natural-input branch we are replacing lives at lines 69–199).
- Bot dispatcher: `apps/worker/src/bot/callback-dispatcher.ts`.
- Command handlers: `apps/worker/src/bot/commands/` — `confirm-expense.ts`, `household-select.ts`, `ai-expense-shared.ts`, `ai-expense-service.ts`.
- AI parser: `apps/worker/src/lib/ai/expense-parser.ts` (`parseExpensesWithAi`).
- VN-amount detector: `apps/worker/src/bot/lib/vn-amount-detector.ts` (`detectAmountInVnd`, `looksLikeExpense`).
- Renderers / keyboards: `apps/worker/src/bot/format/renderers.ts`, `apps/worker/src/bot/renderers/keyboards.ts`.
- Draft repository (untouched by this plan): `apps/worker/src/db/repositories/telegram-bot-expense-draft-repository.ts`.
- Expense repository: `apps/worker/src/db/repositories/expense-repository.ts` (`createExpense`, `softDeleteExpense`).
- Audit log repository: `apps/worker/src/db/repositories/audit-log-repository.ts` (`createAuditLogEntry`).
- Telegram client: `apps/worker/src/bot/telegram-client.ts`.
- Spec: `docs/product-specs/tma/telegram-bot-companion.md`.
- Tests: `apps/worker/test/unit/bot/`, `apps/worker/test/integration/telegram-bot.spec.ts`.

## Plan of Work (Narrative)

### 1. Spec update (`docs/product-specs/tma/telegram-bot-companion.md`)

In the `### Auto-detect` section, append a new "Direct Create (natural input)" subsection covering:

- Trigger: same as today's auto-detect (private chat, linked user, recognised VND amount, not an income word).
- Behaviour: AI parses the message; for every valid item the bot calls `createExpense` immediately and sends one Telegram message per created expense with `🏠 Chọn household` + `🗑 Xoá` buttons. `🏠` is hidden when the user has zero households.
- Loader hygiene: still sends `⏳ Phân tích...` then edits in place to either the per-item confirmation (success) or the existing error text (no valid items / AI upstream failure).
- Post-create actions edit the originating message; no extra bubbles.
- Update the acceptance-criteria list at the end of the Expense Capture Flow: drop the "Bot never creates an expense from free-form text without explicit user confirmation" line for the natural-input path, replace it with "In natural input, valid items create immediately; the user can delete within the same message." Keep the rule for `/ai` and `/aimulti`.

### 2. Repository helper (`expense-repository.ts`)

Add `updateExpenseHousehold(db, expenseId, appUserId, householdId)` returning the updated row or `null` if no row matched the owner filter. Atomic single-statement UPDATE that:

- Requires `spent_by_user_id = ? AND deleted_at IS NULL` (owner + not-deleted guard).
- Sets `household_id = ?` (the new value, may be `null` to revert to personal).
- Bumps `updated_at`.

Reuse `findExpenseByIdRaw` to fetch the post-update row.

### 3. Keyboard (`renderers/keyboards.ts`)

Add `postCreateKeyboard(expenseId, hasHouseholds)` returning a single-row inline keyboard. When `hasHouseholds` is true: `[🏠 Chọn household, 🗑 Xoá]`. When false: only `[🗑 Xoá]`. Callback data:

- `ch_household:${expenseId}` for the household button.
- `ch_delete:${expenseId}` for the delete button.

### 4. New file: `commands/natural-expense.ts`

Export `runNaturalExpenseCreate(update, deps, client, appUserId)` returning a number count of processed expenses (used by `service.ts` to short-circuit further dispatch). Behaviour:

1. Send loader (`LOADER_TEXT`) → capture `loaderMsgId`.
2. Run the same pre-flight as today: `looksLikeExpense(text)` + `detectAmountInVnd(text)` + AI env config + `parseExpensesWithAi`.
3. On `AiUpstreamError`: edit loader with `AI_UNAVAILABLE_TEXT` (HTML); return 1.
4. Normalize each raw item via `normalizeAiItem(raw, defaultDate)`; drop ones that fail validation.
5. If zero valid items: edit loader with `INPUT_UNRECOGNIZED_TEXT` (HTML); return 1.
6. Override each item's `amount` with the detector's `amountVnd` (preserves current natural-input behaviour: detector is more reliable than AI).
7. Edit loader to a summary header line "✅ Đã lưu N khoản:" (or single-item summary if N=1).
8. For each normalized item: call `createExpense` directly with `created_via_bot = 1`, write `expense.created` audit log (`source: 'telegram_bot', expenseId, naturalInput: true`), then send a separate Telegram message containing `renderExpenseSummaryLine` (compact) + the `postCreateKeyboard(expenseId, hasHouseholds)` buttons. Use `formatMinorAmount(amountMinor, 'VND')` and `'VND'` as default currency on the summary (household reassignment re-renders).
9. To know `hasHouseholds`, query `listActiveHouseholdIdsForUser(db, appUserId)` once before the loop.

Currency for create: always `VND` initially because natural input starts at personal scope. Reassignment handler re-renders with the household's `defaultCurrencyCode` if scope changes.

### 5. New file: `commands/post-create-expense.ts`

Two exported handlers:

- `handlePostCreateHousehold(ctx, expenseId, messageId)` — mirrors the existing `household:draftId` flow in `household-select.ts` but uses `expenseId` instead of `draftId`. It:
  - Loads the expense by id; rejects if missing or `deleted_at` set or `spentByUserId !== ctx.appUserId`.
  - Queries `listActiveHouseholdIdsForUser`; if empty, edit message with "Chưa tham gia hộ nào." + the existing two-button keyboard (which will only show `🗑 Xoá`).
  - Otherwise edit message to `${summaryLine}\n\nChọn phạm vi:` + `householdSelectKeyboard` style row, but using `ch_household_apply` and `ch_household_apply_personal` callbacks so we can route back to this handler, not `hhselect`.
  - Add a small inline keyboard: `[{ text: '👤 Cá nhân', callback_data: \`ch_apply:${expenseId}:personal\` }]` + one row per household `[{ text: \`🏠 ${name}\`, callback_data: \`ch_apply:${expenseId}:${hhId}\` }]`.
  - On `ch_apply` callback (same handler, second entry point): load expense, verify ownership, call `updateExpenseHousehold`, re-edit the original message to `✅ ${renderExpenseSummaryLine}` with `postCreateKeyboard` again. Write `expense.updated` audit log when scope actually changed.
- `handlePostCreateDelete(ctx, expenseId, messageId)`:
  - Load expense; reject if missing / deleted / wrong owner.
  - Capture `summaryLine` for the post-delete message.
  - Call `softDeleteExpense`. Write `expense.deleted` audit log (`source: 'telegram_bot', naturalInputUndo: true`).
  - Edit message to `🗑 Đã xoá — ${summaryLine}` with no inline keyboard.

Both handlers use `mode: 'edit'`, `targetMessageId: messageId` so the chat stays single-bubble.

### 6. Service rewrite (`service.ts`)

Replace the natural-input branch (lines 69–199) with a thin wrapper that calls `runNaturalExpenseCreate(update, deps, client, appUserId)` from `commands/natural-expense.ts`. Keep:

- Private-chat-only filter.
- Linked-user check.
- `looksLikeExpense` + `detectAmountInVnd` early rejection (no Telegram API call at all if amount pattern is missing — same as today).
- AI env config early rejection.

`extractCommand` and the `/ai` / `/aimulti` branches stay untouched.

### 7. Dispatcher (`callback-dispatcher.ts`)

Add two switch cases:

- `case 'ch_household'` → `handlePostCreateHousehold(ctx, payload /* = expenseId */, messageId)`.
- `case 'ch_delete'` → `handlePostCreateDelete(ctx, payload /* = expenseId */, messageId)`.
- `case 'ch_apply'` → `handlePostCreateHousehold` with the third callback segment as payload (so it can parse `personal` vs household id).

`handlePostCreateHousehold` itself inspects `payload` to decide which mode to enter (show picker vs apply selection), so the dispatcher stays simple.

### 8. Tests

Add three test files plus extend keyboards.spec.ts:

- `apps/worker/test/unit/bot/commands/natural-expense.spec.ts` — pure unit tests mocking `parseExpensesWithAi`, `createExpense`, `listActiveHouseholdIdsForUser`, `createAuditLogEntry`, and `telegramClient`. Cover:
  - Happy single item → 1 expense created, summary line, two buttons when household exists.
  - Happy single item → 1 expense, single delete button when zero households.
  - Happy multi item → N expenses, N messages after the loader.
  - `AiUpstreamError` → loader edited to `AI_UNAVAILABLE_TEXT`, no expense created.
  - All items invalid after normalize → loader edited to `INPUT_UNRECOGNIZED_TEXT`, no expense created.
  - Detector-amount overrides AI amount on every item.
  - Audit log entry written with `source: 'telegram_bot'`.
- `apps/worker/test/unit/bot/commands/post-create-expense.spec.ts` — mock repositories + telegram client. Cover:
  - `ch_household` on expense with households → edit shows picker.
  - `ch_household` on expense without households → edit shows "Chưa tham gia hộ nào."
  - `ch_apply:personal` → household_id nulled, message re-edited to `✅ <summary>` + two-button keyboard.
  - `ch_apply:<hhId>` → household_id set, currency switched to household currency, audit log written when scope changed.
  - `ch_delete` → soft-deletes expense, message re-edited to `🗑 Đã xoá — <summary>`, no buttons.
  - Defense-in-depth: `ch_delete` / `ch_apply` on expense owned by another user → edit "Không có quyền." with no DB write.
- Extend `apps/worker/test/unit/bot/renderers/keyboards.spec.ts` — `postCreateKeyboard` returns two rows when households exist, one row when not; correct callback_data format.

### 9. Harness

- `harness/feature_index.json`: add `feat-121` entry with `status: "todo"`.
- `harness/features/feat-121-...json`: scope, dependencies (`feat-113`, `feat-118`), evidence pointer to test files.
- `harness/progress.md`: add `- 2026-06-25 — Bot natural-input direct-create + post-create household/delete: ... (feat-121 evidence)`.
- `docs/exec-plans/index.md`: add to Active section.

## Concrete Steps (Commands)

From repo root:

```bash
# Type check after each batch of edits
./init.sh typecheck

# Lint after edits
./init.sh lint

# Unit tests for the bot module
cd apps/worker && pnpm vitest run test/unit/bot

# Full repo verification at the end
./init.sh
```

Expected transcripts:

- `./init.sh typecheck` → `Done!`
- `pnpm vitest run test/unit/bot` → all suites green; new specs visible in output.
- `./init.sh lint` → `Done!`
- `./init.sh` (full) → `Done!`

## Validation and Acceptance

- `vitest run apps/worker/test/unit/bot/commands/natural-expense.spec.ts` → all cases pass.
- `vitest run apps/worker/test/unit/bot/commands/post-create-expense.spec.ts` → all cases pass.
- `vitest run apps/worker/test/unit/bot/renderers/keyboards.spec.ts` → all cases pass.
- `./init.sh typecheck` and `./init.sh lint` → `Done!`.
- `./init.sh test` → `Done!`.
- Manual smoke: in a local worker + Telegram bot env, sending `ăn bún 30k 15/6` from a linked user must (a) produce one Telegram message with `✅ … 🍜 Ăn bún · 30.000₫ · 15/06` (no household) and two buttons, (b) tapping `🏠 Chọn household` opens the picker, (c) tapping a household row replaces the message with the full preview including the household name and the two buttons, (d) tapping `🗑 Xoá` replaces the message with `🗑 Đã xoá — …` and no buttons.
- `feat-121` row exists in `harness/feature_index.json`; `harness/progress.md` carries an evidence entry.

## Idempotence & Recovery

- All edits are idempotent: re-running the implementation produces the same file contents. No DB migrations required.
- The handler paths re-check expense ownership on every callback, so a stale callback cannot mutate an expense owned by another user.

## Risks / Blockers

- Auto-detect + direct-create changes a long-standing spec rule ("Bot never creates an expense from free-form text without explicit user confirmation"). Make sure the spec update lands in the same PR or before the code change to keep docs and code aligned.
- `audit-log-repository.createAuditLogEntry` payload schema is `{ source: 'telegram_bot' }` today; we add `naturalInput: true` and `naturalInputUndo: true` for traceability. Confirm the payload is logged as a free-form JSON string and won't break parsers.
- Household activity notification: today it fires on `createExpense` if `household_id` is set; the natural-input path always creates with `household_id = null`, so no notification fires at create time. When user reassigns household, we do **not** fire a second `expense.created`-style notification in this slice — the moved expense is treated as a same-day add. This matches the spec's "Bot does not edit or delete expenses" boundary by re-using `updateExpense` audit events only.