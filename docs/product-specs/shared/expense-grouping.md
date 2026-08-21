# Expense Grouping

Status: current

## Goal

Allow users to group expenses into events or projects to track event-level budgets and insights.

## Entry Conditions

- User wants to associate one or more expenses with a named group.

## User Flow

1. User creates a group with a name, optional dates, and optional event budget.
2. When adding or editing an expense, user can assign it to a group tag.
3. User views group summary with aggregated spend, list of contained expenses, and remaining event budget.
4. User may bulk-assign existing expenses to a group during reconciliation.

## Acceptance Criteria

- Groups can be created, edited, and archived.
- Groups are independent from household context and may be used on personal or household expenses.
- Create dialog allows zero or one group selection per expense in MVP.
- Group aggregates update correctly when linked expenses change.

## AI Recognition

- AI may suggest `groupNames` only when text explicitly mentions whitelisted group names (case-insensitive, NFD + `đ→d` normalized).
- Whitelist is capped at 15 most-recent groups across household + personal; hallucinated names are dropped to `[]`.
- Server maps names to `groupIds` via normalized keys and deduplicates; see household context spec for household side.

## Failure States

- Group creation error: show validation and allow retry.
- Partial assignment failure: show per-expense error and allow retry.

---

Notes:
- Groups are a core MVP feature for event-based tracking.
- Parser details live in `lib/ai/expense-parser.ts` and `handlers/expenses/parse-expense.ts`; this spec owns product truth only.
