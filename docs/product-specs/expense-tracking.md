# Expense Tracking

## Goal

Enable fast, accurate capture of expenses with minimal friction so users record transactions in 2–3 seconds.

## Entry Conditions

- User is authenticated and in a household (or using app solo).
- User invokes quick-add or navigates to the "Add Expense" UI.

## User Flow

1. User opens quick-add (global) or dedicated Add Expense screen.
2. User enters amount; optionally picks category, payer, date, and note.
3. User chooses visibility: private or household.
4. User confirms; expense is stored and appears in the transaction list.
5. If the user is in multiple households, prompt to choose active household.

## Acceptance Criteria

- Quick-add accepts amount and creates an expense with defaults filled.
- Add Expense screen supports optional fields: category, payer, source, note, date.
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