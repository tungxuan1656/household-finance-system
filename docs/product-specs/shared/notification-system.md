# Notification System

## Goal

Provide a minimal, reliable notification system for key events in Phase 2+.

## Entry Conditions

- Events occur that warrant user attention.
- Users have opted into notifications where applicable.

## Event Types (MVP+)

- Budget threshold reached
- Household invite sent, accepted, or revoked
- Membership changes
- Critical system alerts

## Delivery Channels

- In-app notification center
- Push or email later

## User Flow

1. Event triggers a server-side notification job that writes a notification record.
2. Frontend surfaces in-app notifications and unread counts.
3. User opens a notification and navigates to the related context.
4. User marks notifications read or unread and configures basic preferences.

## Acceptance Criteria

- Notifications for core events appear in-app in near real time.
- Notification data includes event type, actor, related resource id, and timestamp.
- Users can view recent notifications and unread counts.
- Preferences allow toggling budget-related notifications per supported scope.

## Failure States

- Notification delivery failure: retry and surface errors to monitoring.
- User rejects push permission: fall back to in-app only.
- High volume events: throttle or deduplicate to avoid spam.

---

Notes:
- Notifications must respect the user's visible scopes and never leak household-only data to non-members.
