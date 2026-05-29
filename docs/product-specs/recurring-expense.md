# Recurring Expense

## Goal

Enable users to schedule recurring expenses in Phase 2+.

## Entry Conditions

- User is authenticated and creating a supported expense rule.

## User Flow

1. User creates an expense and optionally toggles recurring mode.
2. User selects recurrence pattern, start date, optional end date, source, and optionally category, group, household, and note.
3. System creates a recurring rule and generates future occurrences on schedule.
4. User can view, edit, pause, or cancel rules from a recurring area.
5. Generated occurrences can be edited individually without necessarily changing the base rule.

## Acceptance Criteria

- Users can create, update, pause, and cancel recurring expense rules.
- Generated occurrences appear in feeds and analytics according to their household and group context.
- Editing a single occurrence allows single-occurrence or whole-rule behavior.
- Recurrence engine handles calendar edge cases correctly.

## Failure States

- Recurrence generation failure: retry and surface failing rule for manual review.
- Conflicting edits between rule and occurrence: surface conflict resolution UI.

---

Notes:
- Storage model should use a recurrence rule plus generated occurrences.
