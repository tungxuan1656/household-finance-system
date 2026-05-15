# Expense Tracking

## Goal

Enable fast, accurate capture of expenses with minimal friction so users record transactions in 2–3 seconds.

## Entry Conditions

- User is authenticated and in a household (or using app solo).
- User invokes the canonical add-expense dialog from any supported CTA.

## User Flow

1. User opens the canonical add-expense dialog.
2. User enters amount with VND shortcut semantics, then picks category, source, date, and `Nội dung`.
3. User may optionally select a family and/or one group.
4. Expense scope defaults to private when no family is selected.
5. If the user selects a family, the submission becomes household-shared for that household only.
6. Group selection is an independent personal tag decision and may be used with private, household, or mixed cases.
7. User confirms; expense is stored and appears in the transaction list.

## Acceptance Criteria

- Add-expense dialog accepts amount and creates an expense with defaults filled where applicable.
- Required create fields: amount, category, source, date, content.
- Optional create fields: family selection and single group tag.
- Visibility/scope is derived from family selection: no family = private, selected family = household.
- Payer is derived from the current account during create and is not chosen in the create dialog.
- New expense appears immediately in UI and is indexed for query & analytics.

## Failure States

- Input validation error (invalid amount/date): show inline feedback.
- Network error saving expense: surface retry UI. Do not imply offline queuing, pending entries, or background retry because no-internet flows are not supported.
- Permission error when saving to household: inform user they lack permission.

---

Notes:
- Categories and sources come from global static reference-data catalogs. Expense flows treat category selection, family sharing, and group tagging as separate decisions.
- Group is not household-scoped product truth; the same create surface supports private-only, family-only, group-only, or family+group records.
- Prefer conservative defaults (no family selected, last source restored, current account as payer).
