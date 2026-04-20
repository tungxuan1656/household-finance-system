# Expense Grouping

## Goal

Allow users to group expenses into events/projects (e.g., "Vacation", "Tet shopping") to track event-level budgets and insights.

## Entry Conditions

- User wants to associate one or more expenses with a named group.

## User Flow

1. User creates a group with a name, optional dates, and optional event budget.
2. When adding/editing an expense, user can assign it to one or more groups (tags).
3. User views group summary with aggregated spend, list of contained expenses, and remaining event budget.
4. Allow bulk assignment of expenses to a group during reconciliation.

## Acceptance Criteria

- Groups can be created, edited, and archived.
- Expenses can belong to multiple groups (tags) if household allows.
- Group aggregates compute correctly and update when member expenses change.

## Failure States

- Group creation error: show validation and allow retry.
- Partial assignment failure: show per-expense error and allow retry.

---

Notes:
- Start with simple tagging model; integrate deeply into the primary expense creation flow.
- Groups are a core feature for event-based tracking (Vacation, Tet, etc.) in MVP.
