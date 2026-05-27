# Budget Management

## Goal

Allow users to define and track budgets for personal, household, and group contexts.

## Entry Conditions

- User is authenticated.
- User is creating or reviewing a budget in one supported scope.

## Budget Scopes

- Personal
- Household
- Group

## User Flow

1. User creates a monthly budget for one scope.
2. User optionally adds per-category limits keyed by the global category catalog.
3. Budget views show Planned vs Actual, remaining amount, and threshold warnings.
4. When expenses change, budget aggregates update for the relevant scope.
5. Allowed roles can edit or delete obsolete budgets.

## Acceptance Criteria

- Personal budgets aggregate the current user's own expenses.
- Household budgets aggregate expenses attached to that household.
- Group budgets aggregate visible expenses tagged to that group.
- Per-category budgets use categories whose catalog `kind` is `expense`.
- Deleted budgets disappear from active views.

## Failure States

- Budget creation failure: show validation and allow retry.
- Insufficient permissions: block and explain required role.
- Aggregate mismatch after expense changes: provide truthful refreshed state and audit trail.

---

Notes:
- Notification delivery is roadmap. MVP needs in-app warnings only.
