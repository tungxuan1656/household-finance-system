# Expense Tracking

## Goal

Enable fast, accurate capture of expenses with minimal friction so users record transactions in 2–3 seconds.

## Entry Conditions

- User is authenticated and in a household (or using app solo).
- User invokes quick-add or navigates to the "Add Expense" UI.

## User Flow

1. User opens quick-add (global) or dedicated Add Expense screen.
2. User enters amount; picks category, source (mandatory), payer, date, and note.
3. Optionally assigns the expense to one or more Groups (Events).
4. User chooses visibility: private or household.
5. User confirms; expense is stored and appears in the transaction list.
6. If the user is in multiple households, prompt to choose active household.

## Acceptance Criteria

- Quick-add accepts amount and creates an expense with defaults filled (including default source and group if applicable).
- Add Expense screen requires fields: amount, category, source, payer.
- Add Expense screen supports optional fields: note, date, group assignment.
- Visibility (private vs household) is explicit and remembered per user preference.
- New expense appears immediately in UI and is indexed for query & analytics.

## Failure States

- Input validation error (invalid amount/date): show inline feedback.
- Network error saving expense: queue locally for retry and surface retry UI.
- Permission error when saving to household: inform user they lack permission.

---

Notes:
- Prefer conservative defaults (last used category, current household, creator=payer if not specified).
- Track telemetry: time-to-add, fields used, and quick-add conversion.