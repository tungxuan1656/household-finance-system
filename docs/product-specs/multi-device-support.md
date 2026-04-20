# Multi-device Support

## Goal

Ensure seamless sync and consistent UX across multiple devices (mobile, desktop) with conflict resolution and near-real-time updates.

## Entry Conditions

- User has multiple active sessions/devices or uses web and mobile clients.

## Features

- Real-time sync via WebSocket or push-based notifications.
- Conflict resolution strategy for concurrent edits (last-writer-wins with edit history or merge UI for complex conflicts).
- Background sync and offline-first behavior for mobile.
- Session management UI showing active devices and ability to sign out remote sessions.

## User Flow

1. User creates/edits an expense on device A; device B receives updates and refreshes lists.
2. If device B edits the same expense concurrently, system detects conflict and applies resolution policy or prompts user.
3. When offline, device queues changes and syncs on reconnect; user sees pending state.

## Acceptance Criteria

- Changes made on one device appear on other devices within acceptable time (seconds for active sessions).
- Offline edits sync reliably and conflicts are surfaced when they occur.
- Users can view and revoke active sessions/devices.

## Failure States

- Repeated sync conflicts: provide clear remediation and support contact.
- Long offline queues: surface guidance and limit queue size to protect local storage.

---

Notes:
- Start with simple polling or WebSocket for MVP; improve with CRDTs or operational transforms if needed later.