# Household Management

## Goal

Provide clear lifecycle and settings management for households.

## Entry Conditions

- User is authenticated and navigates to household creation or household settings.

## User Flow

1. User creates a household with a name.
2. After creation, user lands in household detail or household-oriented views with members, recent expenses, and actions.
3. Household settings include name, currency, and timezone.
4. Admins can manage members, update household settings, and delete/archive the household when rules allow.
5. Members can view household info and leave voluntarily.
6. Users with multiple households choose the household explicitly in each household-scoped flow.

## Acceptance Criteria

- Users can create a household with required fields.
- Household views surface members, recent household expenses, and key actions.
- Admin-only settings are enforced server-side and reflected in UI affordances.
- Members can view household info and leave voluntarily.
- Product does not rely on one hidden global active household.

## Failure States

- Creation fails due to validation/network: show inline errors and allow retry.
- Attempt to delete household while other active members remain: block and surface required steps.
- Attempt to update household without permission: deny.

---

Notes:
- Household settings focus on name, currency, timezone, membership, and lifecycle controls.
