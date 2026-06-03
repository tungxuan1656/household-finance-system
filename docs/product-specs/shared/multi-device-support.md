# Multi-device Support

## Goal

Ensure seamless sync and consistent UX across multiple devices (mobile, desktop) with conflict resolution and near-real-time updates.

## Entry Conditions

- User has multiple active sessions/devices or uses web and mobile clients.

## Features

- Real-time sync via WebSocket or push-based notifications.
- Conflict resolution strategy for concurrent edits (last-writer-wins with edit history or merge UI for complex conflicts).
- Background refresh and reconnect handling for mobile.
- Session management UI showing active devices and ability to sign out remote sessions.

## User Flow

1. User creates/edits an expense on device A; device B receives updates and refreshes lists.
2. If device B edits the same expense concurrently, system detects conflict and applies resolution policy or prompts user.
3. If connectivity drops, the app surfaces failure state and requires the user to retry after reconnecting.

## Acceptance Criteria

- Changes made on one device appear on other devices within acceptable time (seconds for active sessions).
- Changes retry successfully after connectivity is restored and conflicts are surfaced when they occur.
- Users can view and revoke active sessions/devices.

## Failure States

- Repeated sync conflicts: provide clear remediation and support contact.
- Repeated reconnect failures: surface guidance and preserve clear retry paths.

---

Notes:
- Product does not support offline write queues or no-internet capture; sync expectations begin after connectivity returns.
- Start with simple polling or WebSocket for MVP; improve conflict handling if needed later.
