# Telegram Bot Companion

Status: mixed

## Goal

Define the Telegram bot as a companion surface for fast finance actions, reminders, and summaries.

The bot helps users act from chat. It does not replace the TMA.

## Product Position

- Bot owns short, option-first chat flows.
- TMA owns rich forms, full review screens, charts, and complex management.
- Bot may open the TMA when a task needs more context, editing, or visual review.
- Bot must not become a free-form finance admin chatbot.

## Primary Use Cases

- Add an expense from one short natural-language message.
- Review personal or household spending totals.
- Review top categories for a period.
- Check budget status and warnings.
- Receive budget, household activity, invite, and digest notifications.
- Open household and group views in the TMA.
- Manage bot notification preferences.

## Account Requirement

- User must open the TMA before the bot can show private finance data.
- If the bot cannot match the Telegram user to an app user, it shows `🏠 Mở Mini App` and asks the user to open the TMA first.
- Bot does not create a user account by chat alone.

## Command Set

| Command | Purpose |
|---------|---------|
| `/start` | Main menu + hint to send expense directly. |
| `/recents` | 6 most recent personal expenses. |
| `/stats` | Spending summary for a period. |
| `/budget` | Budget status + warnings. |
| `/top` | Top categories for a period. |
| `/settings` | Toggle bot notifications. |
| `/help` | Bot usage + TMA handoff. |

`/add` was removed in feat-135. The bot no longer registers a `/add` command; sending `/add ...` falls through to the default (no response / unknown) and does not create drafts or call AI. `help.ts` no longer mentions `/add`.

### Auto-detect

In private chat, a linked user can send a short expense message (e.g. `ăn bún 30k 15/6`). Bot auto-detects, sends a single loader `⏳ Phân tích...`, then creates expenses immediately and edits the loader into one grouped summary. The delete button provides 1-tap undo. `/start` echoes the direct-send hint.

#### Natural Input Direct Create (feat-121 → feat-135 native-only)

For natural input, the bot bypasses any preview/confirm step and uses a single-message grouped flow. No draft rows, no household picker.

Flow:

1. Loader `⏳ Phân tích...` is sent first (anchors the slot).
2. AI parser returns zero or more valid items. Batch is capped to `MAX_BATCH_SIZE = 10`; items beyond 10 are dropped. When truncated, `truncatedNote = "\nℹ️ Chỉ lấy 10 khoản đầu (N khoản bị bỏ qua)"` is appended to the summary.
3. For each valid item, the bot creates the expense directly with `created_via_bot=1`. Scope is resolved from AI household/group whitelist (personal by default; see AI Household/Group Recognition below). Titles are truncated to 60 chars per line for the summary.
4. Bot edits the loader into the single grouped summary `✅ Đã thêm N khoản:\n1. [emoji] [label] · title · amount₫ · dd/MM\n2. ...` using `parseMode HTML` and `escapeHtml` (no Markdown). Final `text` is capped to 4096 chars with trailing `…` if needed.
5. Keyboard is stacked `🗑 Xoá` buttons — one per expense (`callback_data ch_delete:<expenseId>`). There is no `🏠 Chọn gia đình` / `🏠 Chọn household` button and no `householdSelectKeyboard` / `household picker`.
6. Tapping `🗑 Xoá` soft-deletes that expense and re-edits the same grouped message to `🗑 Đã xoá — <summary>` (no buttons for the deleted row). Delete is the only post-create action.
7. The bot never sends a separate success/cancel bubble and never loops `sendMessage` per expense — `sendMessage` is called only for the loader; the grouped result is a single `editMessageText`.
8. When the user has zero households, the flow is identical (still grouped summary + 🗑 Xoá per expense).

### Auto-detect Spec Compatibility

The acceptance criteria in this spec cover only the natural-input direct-create grouped flow. Explicit user confirmation is replaced with the post-create `🗑 Xoá` stacked buttons (1-tap undo). There is no `/add` preview/confirm flow, no `pending`/`confirming` draft states, and no `truncatedNote` for `/add`.

## Message Hygiene

Bot chat must stay readable. Avoid new bubbles when one edit suffices.

Rules:

- Bot may edit the original message instead of sending a new one when the reply is a follow-up to a user action (toggle, delete).
- Bot must use `editMessageText` + `editMessageReplyMarkup` for `/settings` toggles. The toggle changes the message in place and updates the inline keyboard.
- `/stats` `/top` `/budget` must use contextual keyboards (`statsKeyboard` / `topKeyboard` / `budgetKeyboard`) for linked users. These expose the next likely action and stay inside the chat.
- The generic `🏠 Mở Mini App` button stays only for unlinked users as an `openAppKeyboard` guidance prompt. Linked users do not see this button.
- The bot never edits a system message it did not send.
- The bot never silently replaces a user's message.
- When the bot begins analyzing a natural input message, it sends a loader message `⏳ Phân tích...` first, then calls `editMessageText` to replace the loader with the grouped summary. This anchors the response slot and gives instant feedback. No `/add` loader exists.

## Main Menu

`/start` shows these actions:

- `➕ Thêm chi tiêu`
- `📊 Xem thống kê`
- `💸 Ngân sách`
- `👥 Gia đình`
- `⚙️ Cài đặt`
- `🏠 Mở Mini App`

Menu actions use buttons by default. Text prompts are only for expense input or explicit search-like input.

Linked user menu text: `Gửi chi tiêu (vd: "ăn bún 30k").`

## Expense Capture Flow

### Entry

Single natural-input entry form (private chat only). No `/add` form.

Natural input — in a private chat, a linked user sends one short message that matches the amount detector patterns. The bot sends the loader `⏳ Phân tích...`, runs AI parsing with household/group whitelist context, creates expenses directly, and edits the loader into the grouped summary. Group chats do not run this path.

Natural input patterns the bot accepts:

- Plain VND with thousand separators: `100.000`, `1.500.000`.
- Trailing-000 numbers ≥ 1000 are always read as thousand VND: `30000` → `30.000`, `1500000` → `1.500.000`.
- Short Vietnamese amount words: `30k`, `1tr`, `1tr5`, `1 triệu`, `1 củ`, `1 lít`, `5 xị`, `20 nghìn`.

Natural input must be rejected when:

- The chat is not private.
- The user is not linked to a local app account.
- The text does not contain a recognized amount.
- The text contains an income word (`thu`, `nhận`, `lương`, `thưởng`, ...).

### Grouped Summary (Direct Create)

Bot does not return a structured preview for confirmation. It creates expenses immediately and returns a single grouped summary message (see Natural Input Direct Create above).

Summary format per line: `[emoji] [label] · title · amount₫ · dd/MM` (via `renderExpenseSummaryLine`, `escapeHtml`, `parseMode HTML`). Title is cut to 60 chars per line; full message is truncated to 4096 chars.

#### AI Household/Group Recognition

- Parser uses whitelist recognition (householdName/groupNames) when available; see `shared/expense-household-context.md` and `expense-grouping.md`.
- Natural-input direct-create uses `fetchAiContext` / `mapAiNamesToIds` to auto-assign `householdId` / `groupIds` within the single grouped flow. No manual household picker is shown; the AI mapping is the only household/group assignment path. Group filtering respects household (`filterGroupByHousehold: true`).

### Required Actions

Post-create grouped message shows only stacked delete buttons:

- `🗑 Xoá` — one per created expense (`ch_delete:<expenseId>`)

There is no `✅ Thêm chi tiêu`, no `🏠 Chọn gia đình` / `🏠 Chọn household`, and no `❌ Hủy`. There is no scope chooser (`👤 Cá nhân` / per-household buttons). Household selection was removed in feat-135.

### Acceptance Criteria

- Bot creates expenses from free-form natural text without explicit user confirmation; `🗑 Xoá` stacked buttons provide 1-tap undo on the same grouped message.
- Bot edits the loader `⏳ Phân tích...` into a single grouped summary `✅ Đã thêm N khoản:\n1. ...\n2. ...` with `parseMode HTML`, `escapeHtml`, title cut to 60 chars, batch cap 10 with `truncatedNote` (`ℹ️ Chỉ lấy 10 khoản đầu (N khoản bị bỏ qua)`), and final text truncated to 4096 chars with `…`. No per-expense `sendMessage` loop.
- If required fields are missing (no valid items), bot edits the loader to `Không nhận diện được. Thử lại.` (`INPUT_UNRECOGNIZED_TEXT`) with `parseMode HTML`.
- If AI is unavailable, bot edits the loader to `AI tạm không khả dụng. Thử lại sau.` (`AI_UNAVAILABLE_TEXT`).
- Low confidence is acceptable when the bot can still create an expense from a valid parsed item (AI parser + household-context whitelist).
- Bot may auto-assign household/group via whitelist; it does not show a household picker after create. User edits household/group in the TMA if needed.
- Bot never creates an expense without going through the natural-input direct-create path (no `/add` draft path exists).
- Duplicate taps on `🗑 Xoá` must not crash; old callbacks (`household:xxx`, `confirm:xxx`, `ch_household`, `ch_apply`, `hhselect`, `retry`, `cancel` etc.) return `Nút đã hết hạn, vui lòng gửi lại` via fallback and do not crash (only `ch_delete`, `pref`, `settings`, `stats`, `budget`, `add_expense` are active).
- Bot-created expenses are visible in audit/history as created through Telegram bot (`created_via_bot=1`, `expense.created` audit with `source: telegram_bot`).
- Bot does not edit expenses (only soft-deletes expenses the bot itself created through `ch_delete` on the grouped message).

## Statistics Flow

### Entry

User sends `/stats`, `/top`, or chooses `📊 Xem thống kê`.

### Steps

1. Bot asks for scope:
   - `👤 Cá nhân`
   - One button per visible household
2. Bot asks for period:
   - `Tuần này`
   - `Tháng này`
   - `Tháng trước`
   - `Tùy chọn trong app`
3. Bot shows summary:
   - Total spend
   - Change versus previous comparable period, when available
   - Top categories, each with a short Vietnamese copy line, an amount, and a Unicode progress bar (▓/░) showing that category's share of the period total. Bar width is fixed (16 cells) so categories line up in the chat.

### Follow-up Actions

- `Xem category`
- `Xem giao dịch`
- `Mở thống kê trong app`

### Acceptance Criteria

- Bot only shows scopes the user can access.
- Summary is short enough to read in chat.
- Bot summary text is ready-to-send Vietnamese copy.
- Household summaries do not include member breakdown in MVP.
- Full charts, filters, exports, and custom analysis stay in the TMA.

## Budget Flow

### Entry

User sends `/budget` or chooses `💸 Ngân sách`.

### Summary

Bot shows:

- Budget name and scope
- Limit
- Spent amount
- Remaining amount
- Current status: safe, near limit, or exceeded
- Categories near or over limit, when available

### Actions

- `Xem chi tiết`
- `Xem giao dịch`
- `Tắt cảnh báo`
- `Mở Mini App`

### Acceptance Criteria

- Bot can show budget status and warning context.
- Bot does not create, edit, or delete budgets.
- Budget CRUD stays in the TMA.

## Household And Group Flow

### Household Menu

`👥 Gia đình` shows visible households and quick actions:

- View current month spend.
- Choose a household.
- Choose a group from that household when needed.
- Open household in the TMA.

### Acceptance Criteria

- Bot only lists households and groups visible to the current user.
- Bot does not create or share household invites.
- Invite creation and acceptance stay in the TMA.
- Member removal, role changes, household deletion, and full settings stay in the TMA.

## Notifications

### Budget Alerts

Bot may notify when a budget reaches 80% warning or 100% exceeded status.

Alert includes:

- Budget name
- Current spend
- Limit or remaining amount
- Main category drivers, when useful
- Time period

Actions:

- `Xem chi tiết`
- `Xem giao dịch`
- `Tắt cảnh báo`
- `Mở Mini App`

### Household Activity

Bot may notify household members when another member adds an expense.

Message includes:

- Actor display name
- Household name
- Expense title or note
- Amount
- Category
- Date

Actions:

- `Xem chi tiết`
- `Xem tháng này`

### Digests

Bot may send opt-in weekly digests.

Digest includes:

- Total spend
- Top categories
- Budget warnings
- Household highlights, when enabled
- Link to full TMA view

### Invite And Membership Events

Bot may notify about invite and membership changes later if product need is clear.

### Notification Acceptance Criteria

- Notifications respect user preferences.
- Household activity notifications are opt-in and default off.
- Bot avoids spam by grouping repeated low-priority events.
- Notifications never show household data to users without access.

## Settings

`/settings` shows bot-specific preferences:

- Budget alerts on/off.
- Household activity notifications on/off, default off.
- Weekly digest on/off, default off.
- Open full settings in TMA.

## Out Of Scope

- Full budget create, edit, delete.
- Household create, edit, delete.
- Member removal or role management.
- Household invite creation or sharing.
- Category management.
- Deep analytics, charts, exports, and custom filters.
- Multi-step expense editing after save.
- Expense edit or delete from bot.
- Fully autonomous finance assistant that performs actions without confirmation.
- Payments or invoices.

## Release Shape

### MVP

- `/start` menu.
- Natural-input grouped expense create (1 loader → 1 grouped summary, cap 10 + truncatedNote, 4096 limit, HTML, stacked 🗑 Xoá; no household picker).
- `/stats` guided personal/household summary.
- `/budget` status view.
- `/top` top categories.
- `/settings` notification toggles.
- Weekly digest opt-in.

### Later

- More household activity controls.
- Recurring expense reminders.
- Smarter category suggestions.
- Unusual spend alerts.
- Receipt or image-assisted draft creation.
- Financial health summary cards.
- Direct deep links into exact TMA detail pages where useful.

## Rules

- Bot flows must prefer buttons over open-ended text.
- Bot write scope is create-expense only (direct-create via natural input; delete via `ch_delete` undo).
- Bot should send users to the TMA for any task that needs careful review.
- Bot edits the original message when the reply is a follow-up; it does not post a new bubble just to show the next state.
- Bot reads amount patterns only inside the natural-input path and creates expenses directly without any draft / preview / confirm pipeline.
- `xxx000` with at least 4 digits always reads as thousand VND inside the natural-input path. Numbers below 1000, with more than 12 digits, or with ambiguous `00` endings are rejected.
- Shared domain truth remains in shared specs.
- This spec only defines Telegram companion behavior.
