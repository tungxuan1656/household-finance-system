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

### Personal scope specifics (MVP)

- A personal budget is owned by exactly one user and has no household.
- `currencyCode` is required on create for personal scope; the server stores the user-supplied code.
- A user can have at most one personal budget per period; duplicate create returns `409 CONFLICT`.
- `GET /budgets` with no filter returns the unioned list of the caller's personal budgets and the budgets of every household the caller is an active member of, sorted by `period` DESC.
- `GET /budgets?scope=personal` returns only the caller's personal budgets.
- `GET /budgets?scope=household&household_id=...` returns only that household's budgets.
- Personal budget status aggregates from `expenses` where `spent_by_user_id = currentUser.id AND household_id IS NULL`; household expenses must not appear in the personal total or any personal category row.
- Cross-user access to a personal budget returns `404 NOT_FOUND` (never `403`) to avoid leaking existence.
- Update and delete of a personal budget require `currentUser.id == ownerUserId`; otherwise the response is `404 NOT_FOUND`.

## Failure States

- Budget creation failure: show validation and allow retry.
- Insufficient permissions: block and explain required role.
- Aggregate mismatch after expense changes: provide truthful refreshed state and audit trail.

---

Notes:
- Notification delivery is roadmap. MVP needs in-app warnings only.