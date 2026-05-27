# Expense Management

## Goal

Define lifecycle rules for edit, delete, restore, and audit so expense data stays understandable and recoverable.

## Entry Conditions

- User views an existing expense and has permission to modify it.

## User Flow

1. User opens an expense.
2. Edit screen shows mutable fields: amount, category, source, note, date, optional household, and optional groups.
3. On save, system records an audit entry and refreshes derived aggregates.
4. User may soft-delete an expense with confirmation.
5. Allowed roles may restore a deleted expense.

## Acceptance Criteria

- Edit creates immutable audit entries recording actor, changed fields, old/new values, and timestamp.
- Soft-delete hides expense from normal lists but preserves recovery and audit history.
- Restore returns the expense to active lists and recalculates downstream summaries.
- Derived metrics for personal, household, and group scopes update consistently after edit/delete/restore.

## Failure States

- Unauthorized edit/delete: deny action and explain required role.
- Audit write failure: block destructive action and surface retry path.
- Restore of an unavailable expense: show not found or forbidden state.

---

Notes:
- Product V2 does not support changing expense ownership to another person.
