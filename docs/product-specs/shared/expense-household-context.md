# Expense Household Context

Status: current

## Goal

Define how an expense becomes a household expense in Product V2.

## Entry Conditions

- User creates or edits an expense.

## Product Truth

- `householdId` is optional.
- No household attached means the expense is personal.
- Household attached means the expense belongs to that household and all active members of that household can see it.

## User Flow

1. User creates an expense.
2. If the user leaves household empty, the expense remains personal.
3. If the user selects a household, the expense becomes part of that household's shared finance.
4. Household members can see household-attached expenses in household views.

## Acceptance Criteria

- Expense create and edit flows allow zero or one household per expense.
- Household membership is validated server-side before attaching an expense to that household.
- Household feeds show all expenses attached to that household.
- Personal views show the current user's own expenses, including their own household-attached expenses when the personal view is aggregating the user's spending.

## AI Recognition

- AI may suggest `householdName` only when text explicitly mentions a whitelisted household name (case-insensitive, NFD + `đ→d` normalized).
- Whitelist is capped at 15 most-recent households; hallucinated names map to `null`.
- Server re-validates membership before attaching; personal remains default.

## Failure States

- User selects a household they do not belong to: reject request.
- Household is archived or unavailable: reject request and keep the expense personal until corrected.

---

Notes:
- Category and group assignment are independent from household attachment.
- Whitelist mapping lives in `lib/ai/expense-parser.ts` and `handlers/expenses/parse-expense.ts`; this spec owns product truth only.
