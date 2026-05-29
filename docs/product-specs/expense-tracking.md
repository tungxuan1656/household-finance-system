# Expense Tracking

## Goal

Enable fast, accurate capture of expenses with minimal friction so users record transactions in 2–3 seconds.

## Entry Conditions

- User is authenticated.
- User opens the canonical add-expense dialog from any supported entry point.

## User Flow

1. User opens the canonical add-expense dialog.
2. User enters amount with VND shortcut semantics, then picks category, source, date, and `Nội dung`.
3. User may optionally select one household.
4. User may optionally select one group.
5. Household and group are independent:
   - no household = personal expense
   - household selected = household expense
   - group may be empty or selected in either case
6. User confirms; expense is stored and appears in lists, summaries, and analytics.

## Acceptance Criteria

- Required create fields: amount, category, source, date, content.
- Optional create fields: household selection and group selection.
- New expense defaults to no household and no group.
- The current signed-in user is recorded as the spender.
- New expense appears immediately in UI and is included in downstream summaries.

## Failure States

- Input validation error: show inline feedback.
- Network error saving expense: surface retry UI. Do not imply offline queueing or background retry.
- Permission error when attaching to household: inform user they lack permission.

---

Notes:
- Categories and sources come from global static reference-data catalogs.
- The same create surface supports personal-only, household-only, group-only, and household-plus-group records.
