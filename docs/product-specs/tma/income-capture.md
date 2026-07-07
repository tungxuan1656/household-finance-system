# TMA Income Capture

## Goal

Provide a TMA-first personal income flow so users can record money-in and remove mistaken entries without using the expense wizard.

## User Flow

1. User opens `Incomes` from a Home shortcut.
2. User reviews the personal income list.
3. User taps the add action to open a one-page add-income form.
4. User enters date, amount, title, source, and optional note.
5. User saves through Telegram `BottomButton`.
6. TMA returns to the income list and shows the newly created income.
7. User can delete an income directly from the list through an inline confirm action.

## Acceptance Criteria

- TMA income flow is a single-page personal form, not a 3-step wizard.
- MVP always stores `categoryKey='money-in'`; the client does not show a category picker.
- MVP has no household or group fields.
- `Incomes` is a secondary page reached from shortcuts, not a new root tab.
- Delete is list-level only; MVP still has no income detail or edit route.
- Shared category/source semantics still come from `../shared/expense-categorization.md` and shared reference-data truth.
- No offline queue, summary analytics, or income edit flow is implied.

## Rule

- Keep this doc scoped to TMA-only income UX truth. Do not overload `expense-capture.md` with income behavior.
