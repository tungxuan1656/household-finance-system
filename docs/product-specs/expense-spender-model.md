# Expense Spender Model

## Goal

Define the ownership truth for expenses in Product V2.

## Entry Conditions

- User creates, views, edits, or deletes an expense.

## Product Truth

- One expense is recorded by the person who spent the money.
- The canonical owner field is the spender of the expense.

## User Flow

1. User creates an expense for money they spent.
2. System stores that expense under the current signed-in user as the spender.
3. Read surfaces show who spent the money.
4. Edit and delete permissions are derived from the spender plus household role rules when the expense is attached to a household.

## Acceptance Criteria

- Each expense has exactly one canonical spender.
- Create UI does not ask the user to choose a different owner.
- Expense detail, lists, analytics, and budgets all use the same spender field consistently.
- APIs and UI expose one ownership concept only: the spender.

## Failure States

- Attempt to submit an expense with mismatched ownership fields: reject request.
- Attempt to mutate someone else's personal expense: deny.

---

Notes:
- Audit logs may still record the actor who performed a change. That is security metadata, not the product ownership model.
