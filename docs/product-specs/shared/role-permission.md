# Role & Permission

## Goal

Define a minimal, safe permission model for household-scoped actions.

## Entry Conditions

- User interacts with household-scoped features.

## Roles (MVP)

- Admin: full household management, full household expense management, budget management.
- Member: create household expenses, edit own household expenses, view household expenses, leave voluntarily.

## Permission Matrix

| Action | Admin | Member |
|--------|-------|--------|
| Create Household Expense | ✓ | ✓ |
| Edit Own Household Expense | ✓ | ✓ |
| Edit Any Household Expense | ✓ | ✗ |
| Delete Household Expense | ✓ | ✗ |
| View Members | ✓ | ✓ |
| Invite Members | ✓ | ✗ |
| Remove Members | ✓ | ✗ |
| Leave Household | ✓ | ✓ |
| Change Household Settings | ✓ | ✗ |
| Delete Household | ✓ | ✗ |

## User Flow

1. Role assignment occurs on invite acceptance or via admin action in member management.
2. UI surfaces actions only when the user has permission.
3. Backend validates every protected action.

## Acceptance Criteria

- Permission checks are enforced server-side for all sensitive operations.
- UI hides or disables actions the current user cannot perform.
- Role changes are recorded in audit entries with actor and timestamp.

## Failure States

- Permission mismatch: server rejects unauthorized actions with clear error codes.
- Last admin demotion or removal is blocked until another admin exists.

---

Notes:
- Personal expenses remain owned by the spender and do not require household role checks.
