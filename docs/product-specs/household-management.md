# Household Management

## Goal

Provide clear household lifecycle and settings management so users can create, configure, and operate household units safely and predictably.

## Entry Conditions

- User is authenticated and navigates to household creation or household settings.

## User Flow

1. Create household: user provides household name, default currency, optional description, and optional initial invite.
2. After creation, user lands in the household dashboard showing recent activity, members, budgets, and quick actions.
3. Household settings include: name, currency, timezone, default category list, Group/Event management, and privacy defaults (private vs household default visibility).
4. Admins can manage members (promote/demote, remove), manage household groups, export household data, and delete/archive the household.
5. Switch household: user with multiple households can switch active household via a quick selector; current household context is shown across UI.

## Acceptance Criteria

- Users can create and configure a household with required fields.
- Household dashboard surfaces members, recent expenses, and key actions.
- Admin-only settings are enforced (member management, deletion).
- Switching households updates active context and persists preference.

## Failure States

- Creation fails due to validation/network: show inline errors and allow retry.
- Attempt to delete household while other members exist or without transferring admin: block and surface required steps.
- Export fails: provide retry and partial export diagnostics.

---

Notes:
- Deleting a household should be a two-step flow with confirmation and retention policy.
- Consider export formats (CSV/JSON) and privacy obligations.