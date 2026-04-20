# Role & Permission

## Goal

Define a minimal, safe permission model that maps household roles to actions, enabling clear enforcement in UI and backend.

## Entry Conditions

- User interacts with household-scoped features (expenses, members, settings).

## Roles (MVP)

- Admin: full household management (members, settings, groups/events, delete/archive, export).
- Member: create expenses, edit own expenses, view household expenses (depending on visibility), invite others if allowed, and create groups if permitted by settings.

## Permission Matrix (examples)

- Create Expense: Member, Admin
- Edit Own Expense: Member, Admin
- Edit Any Expense: Admin (or Member with elevated rights)
- Delete Expense: Admin (soft-delete by Member if allowed)
- Manage Groups: Admin, Member (if allowed in settings)
- Manage Members: Admin
- Change Household Settings: Admin
- View Audit Logs: Admin

## User Flow

1. Role assignment occurs on invite acceptance or via admin action in member management.
2. UI surfaces actions only when the user has permission; backend validates all actions.
3. Admins can promote/demote members; demotion requires confirmation and audit.

## Acceptance Criteria

- Permission checks enforced server-side for all sensitive operations.
- UI hides or disables actions the current user cannot perform.
- Role changes are recorded in audit entries with actor and timestamp.

## Failure States

- Permission mismatch: client must not rely on UI-only gating; server rejects unauthorized actions with clear error codes.
- Last admin demotion/removal blocked until another admin exists or transfer occurs.

---

Notes:
- Keep the model intentionally simple to avoid complex RBAC in MVP; extend with groups/roles later if needed.