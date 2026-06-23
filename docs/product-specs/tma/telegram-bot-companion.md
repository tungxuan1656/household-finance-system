# Telegram Bot Companion

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
| `/start` | Show main menu and connect user to core actions. |
| `/ai` | Parse one free-form expense message and show a confirmation preview. |
| `/stats` | Show guided spending summary flow. |
| `/budget` | Show guided budget status flow. |
| `/top` | Show top spending categories for a selected scope and period. |
| `/settings` | Show bot notification preferences. |
| `/help` | Explain safe bot usage and when to open the TMA. |

## Message Hygiene

Bot chat must stay readable. Avoid new bubbles when one edit suffices.

Rules:

- Bot may edit the original message instead of sending a new one when the reply is a follow-up to a user action (toggle, confirm, scope switch).
- Bot must use `editMessageText` + `editMessageReplyMarkup` for `/settings` toggles. The toggle changes the message in place and updates the inline keyboard.
- `/stats` `/top` `/budget` must use contextual keyboards (`statsKeyboard` / `topKeyboard` / `budgetKeyboard`) for linked users. These expose the next likely action and stay inside the chat.
- The generic `🏠 Mở Mini App` button stays only for unlinked users as an `openAppKeyboard` guidance prompt. Linked users do not see this button.
- The bot never edits a system message it did not send.
- The bot never silently replaces a user's message.

## Main Menu

`/start` shows these actions:

- `➕ Thêm chi tiêu`
- `📊 Xem thống kê`
- `💸 Ngân sách`
- `👥 Gia đình`
- `⚙️ Cài đặt`
- `🏠 Mở Mini App`

Menu actions use buttons by default. Text prompts are only for expense input or explicit search-like input.

## Expense Capture Flow

### Entry

Two equivalent entry forms. Both end at the same preview / confirm step.

1. `/ai` form — user sends `/ai ăn bún 30k 15/6` or chooses `➕ Thêm chi tiêu` and then enters expense text.
2. Natural input — in a private chat, a linked user sends one short message that matches the amount detector patterns. The bot routes it through the same preview / confirm pipeline as the `/ai` form. Group chats do not run this path.

Natural input patterns the bot accepts:

- Plain VND with thousand separators: `100.000`, `1.500.000`.
- Trailing-000 numbers ≥ 1000 are always read as thousand VND: `30000` → `30.000`, `1500000` → `1.500.000`.
- Short Vietnamese amount words: `30k`, `1tr`, `1tr5`, `1 triệu`, `1 củ`, `1 lít`, `5 xị`, `20 nghìn`.

Natural input must be rejected when:

- The chat is not private.
- The user is not linked to a local app account.
- The text does not contain a recognized amount.
- The text contains an income word (`thu`, `nhận`, `lương`, `thưởng`, ...).

### Preview

Bot returns a structured preview. Two density modes:

- Full preview (default) — Amount, Date, Category, Note or title, Source when known, Scope (personal or household), Group when known.
- Compact preview — Amount, Category, Title only. Used after the user has already tapped through once and the chat thread is getting long.

The compact preview exposes a `📋 Chi tiết` button. Tapping it calls `editMessageText` to swap the compact body with the full preview. `📋 Chi tiết` does not appear in the full preview because the user is already reading it.

### Required Actions

Preview shows:

- `✅ Thêm chi tiêu`
- `📋 Chi tiết` (compact preview only)
- `🏠 Chọn household`
- `🔁 Nhập lại`
- `❌ Hủy`

If scope is unclear, bot asks the user to choose:

- `👤 Cá nhân`
- One button per available household

### Acceptance Criteria

- Bot never creates an expense from free-form text without explicit user confirmation.
- Bot shows all important parsed fields before confirmation.
- User can cancel before any expense is created.
- If required fields are missing, bot shows an error and asks the user to enter the expense again.
- Bot handles one expense per message in MVP.
- Low confidence is acceptable when the bot can still show a complete preview and the user confirms it.
- After save, bot confirms success and offers `Xem chi tiết` and `Thêm khoản khác`.
- Duplicate taps must not create duplicate expenses.
- Bot-created expenses are visible in audit/history as created through Telegram bot.
- Bot does not edit or delete expenses.

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
- `/ai` expense preview and confirmed add.
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
- Bot writes must require explicit confirmation.
- Bot write scope is create-expense only.
- Bot should send users to the TMA for any task that needs careful review.
- Bot edits the original message when the reply is a follow-up; it does not post a new bubble just to show the next state.
- Bot reads amount patterns only inside the natural-input path. Numbers from that path still pass through the same `/ai` draft / confirm pipeline.
- `xxx000` with at least 4 digits always reads as thousand VND inside the natural-input path. Numbers below 1000, with more than 12 digits, or with ambiguous `00` endings are rejected.
- Shared domain truth remains in shared specs.
- This spec only defines Telegram companion behavior.
