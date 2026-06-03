# Expense Tracking

## Goal

Enable fast, accurate expense capture with minimal friction so users record transactions consistently.

## Entry Conditions

- User is authenticated.
- User opens a supported expense-create surface.

## User Flow

1. User starts a new expense.
2. User provides the required fields: amount, category, source, date, and content.
3. User may optionally select one household.
4. User may optionally select one group.
5. Household and group stay independent:
   - no household = personal expense
   - household selected = household expense
   - group may be empty or selected in either case
6. User confirms; expense is stored and appears in lists, summaries, and analytics.

## Acceptance Criteria

- Required create fields: amount, category, source, date, content.
- Optional create fields: household selection and group selection.
- New expense defaults to no household and no group.
- The current signed-in user is recorded as the spender.
- New expense appears immediately in downstream UI and aggregates.

## Failure States

- Input validation error: show inline feedback.
- Network error saving expense: surface retry UI. Do not imply offline queueing or background retry.
- Permission error when attaching to household: inform user they lack permission.

---

Notes:
- Categories and sources come from global static reference-data catalogs.
- Shared expense semantics do not dictate whether the client uses a dialog, step flow, drawer, or dedicated page.
