# Household Management

## Goal

Provide clear household lifecycle and settings management so users can create, configure, and operate household units safely and predictably.

## Entry Conditions

- User is authenticated and navigates to household creation or household settings.

## User Flow

1. Create household: user provides household name (no currency/timezone selection — defaults apply).
2. After creation, user lands in the household dashboard showing recent activity, members, budgets, and quick actions.
3. Household settings include: name, default visibility (private vs household). Currency and timezone are fixed defaults for MVP (VND, Asia/Ho_Chi_Minh) and not shown in the UI.
4. Admins can: update household name and visibility, manage members (invite, remove, view), and delete the household (with 409 block if other active members remain).
5. Members can: view household info, view the members list, and leave voluntarily.
6. Household selection for actions: user with multiple households can open household list/detail pages and pick a household explicitly in each household-scoped flow; the product must not rely on one global active household in MVP.

## Acceptance Criteria

- Users can create and configure a household with required fields (name only for MVP).
- Household dashboard surfaces members, recent expenses, and key actions.
- Admin-only settings are enforced server-side (member management, deletion) and surfaced as UI affordances.
- Members can view household info and leave voluntarily.
- Household list/detail pages are available and household-scoped flows can request explicit household selection.

## Failure States

- Creation fails due to validation/network: show inline errors and allow retry.
- Attempt to delete household while other members exist or without transferring admin: block and surface required steps.
- Export fails: provide retry and partial export diagnostics.

---

Notes:
- Deleting a household should be a two-step flow with confirmation and retention policy.
- Consider export formats (CSV/JSON) and privacy obligations.
