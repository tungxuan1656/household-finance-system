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
4. Expense scope defaults to personal/private.
5. If the user switches the expense to household-shared, the UI must require an explicit household selection for that submission; category choice is independent from the household decision.
6. User confirms; expense is stored and appears in the transaction list.

## Acceptance Criteria

- Quick-add accepts amount and creates an expense with defaults filled where applicable.
- Add Expense screen requires fields: amount, category, source, payer.
- Add Expense screen supports optional fields: note, date, group assignment.
- Visibility/scope is explicit, defaults to personal/private, and requires an explicit household selection only when the user chooses household sharing.
- New expense appears immediately in UI and is indexed for query & analytics.

## Failure States

- Input validation error (invalid amount/date): show inline feedback.
- Network error saving expense: surface retry UI. Offline queuing, pending entries, and background retry are deferred to quick-add resilience follow-up work (`feat-025`) rather than required in MVP.
- Permission error when saving to household: inform user they lack permission.

---

Notes:
- Categories and sources come from global static reference-data catalogs. Expense flows treat category selection and household selection as separate decisions.
- Prefer conservative defaults (selected household only when the user explicitly chooses household sharing, creator=payer if not specified).
- Track telemetry: time-to-add, fields used, and quick-add conversion.
