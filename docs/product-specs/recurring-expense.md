# Recurring Expense

## Goal

Enable users to schedule recurring expenses (monthly, weekly, custom) to automate repeat entries while allowing easy override and cancellation.

## Entry Conditions

- User is authenticated and in a household or single-player context.

## User Flow

1. User creates an expense and optionally toggles "Make recurring".
2. User selects recurrence pattern (daily, weekly, monthly, custom), start date, optional end date, source (mandatory), and optionally category, group, payer, and note.
3. System creates scheduled recurrence rule and generates future occurrences according to rule (either pre-generated or created on-demand per schedule).
4. User can view and manage recurring rules (edit, pause, cancel) from a Recurring tab.
5. Generated occurrences can be edited individually without breaking the rule (option: "edit this occurrence only").

## Acceptance Criteria

- Users can create, update, pause, and cancel recurring expense rules.
- Generated occurrences appear in feeds and analytics according to visibility rules.
- Editing a single occurrence provides choice to apply change to single occurrence or the rule.
- Recurrence engine handles daylight saving and month-length edge cases correctly.

## Failure States

- Recurrence generation failure: retry with exponential backoff and surface failing rule in UI for manual review.
- Conflicting edits between rule and occurrence: surface conflict resolution UI.

---

Notes:
- Start with simple recurrence patterns (daily/weekly/monthly) in MVP+; advanced calendaring in later phases.
- Design storage model: recurrence rule object + occurrence transactions referencing rule id.