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
- Share or open household invites.
- Manage bot notification preferences.

## Command Set

| Command | Purpose |
|---------|---------|
| `/start` | Show main menu and connect user to core actions. |
| `/ai` | Parse one free-form expense message and show a confirmation preview. |
| `/stats` | Show guided spending summary flow. |
| `/budget` | Show guided budget status flow. |
| `/top` | Show top spending categories for a selected scope and period. |
| `/invite` | Start household invite share flow. |
| `/settings` | Show bot notification preferences. |
| `/help` | Explain safe bot usage and when to open the TMA. |

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

User sends `/ai ăn bún 30k 15/6` or chooses `➕ Thêm chi tiêu` and then enters expense text.

### Preview

Bot returns a structured preview:

- Amount
- Date
- Category
- Note or title
- Source, when known
- Scope: personal or household
- Group, when known

### Required Actions

Preview shows:

- `✅ Thêm chi tiêu`
- `🏠 Chọn household`
- `✏️ Sửa trong app`
- `❌ Hủy`

If scope is unclear, bot asks the user to choose:

- `👤 Cá nhân`
- One button per available household

### Acceptance Criteria

- Bot never creates an expense from free-form text without explicit user confirmation.
- Bot shows all important parsed fields before confirmation.
- User can cancel before any expense is created.
- If the parsed result is incomplete or confusing, bot asks a short clarifying question or sends the user to the TMA.
- After save, bot confirms success and offers `Xem chi tiết` and `Thêm khoản khác`.
- Duplicate taps must not create duplicate expenses.

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
   - Top categories
   - Optional household member breakdown when household scope is selected

### Follow-up Actions

- `Xem category`
- `Xem giao dịch`
- `Mở thống kê trong app`

### Acceptance Criteria

- Bot only shows scopes the user can access.
- Summary is short enough to read in chat.
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

## Household And Invite Flow

### Household Menu

`👥 Gia đình` shows visible households and quick actions:

- View current month spend.
- Create or share an invite.
- Open household in the TMA.

### Invite Flow

User chooses household, then bot returns an invite share action and an open-in-app action.

### Acceptance Criteria

- Only allowed users can create or share invites.
- Invite acceptance stays in the existing product invite flow.
- Member removal, role changes, household deletion, and full settings stay in the TMA.

## Notifications

### Budget Alerts

Bot may notify when a budget reaches warning or exceeded status.

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

Bot may send opt-in daily, weekly, or monthly digests.

Digest includes:

- Total spend
- Top categories
- Budget warnings
- Household highlights, when enabled
- Link to full TMA view

### Invite And Membership Events

Bot may notify about:

- Invite accepted
- Member joined
- Member left or removed
- Role changed

### Notification Acceptance Criteria

- Notifications respect user preferences.
- Household activity notifications are opt-in or easy to mute.
- Bot avoids spam by grouping repeated low-priority events.
- Notifications never show household data to users without access.

## Settings

`/settings` shows bot-specific preferences:

- Budget alerts on/off.
- Household activity notifications on/off.
- Daily digest on/off.
- Weekly digest on/off.
- Monthly digest on/off.
- Quiet mode or mute all.
- Open full settings in TMA.

## Out Of Scope

- Full budget create, edit, delete.
- Household create, edit, delete.
- Member removal or role management.
- Category management.
- Deep analytics, charts, exports, and custom filters.
- Multi-step expense editing after save.
- Fully autonomous finance assistant that performs actions without confirmation.
- Payments or invoices.

## Release Shape

### MVP

- `/start` menu.
- `/ai` expense preview and confirmed add.
- `/stats` guided personal/household summary.
- `/budget` status view.
- `/settings` notification toggles.
- Weekly digest opt-in.

### Later

- More household activity controls.
- Recurring expense reminders.
- Smarter category suggestions.
- Unusual spend alerts.
- Receipt or image-assisted draft creation.
- Financial health summary cards.

## Rules

- Bot flows must prefer buttons over open-ended text.
- Bot writes must require explicit confirmation.
- Bot should send users to the TMA for any task that needs careful review.
- Shared domain truth remains in shared specs.
- This spec only defines Telegram companion behavior.
