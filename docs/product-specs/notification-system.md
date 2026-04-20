# Notification System

## Goal

Provide a minimal, reliable notification system for key events (budget thresholds, invites, membership changes) with in-app first delivery and extensible channels (push/email) later.

## Entry Conditions

- Events occur that warrant user attention: budget threshold crossed, invite sent/accepted, role change, critical errors.
- Users have opted into notifications where applicable.

## Event Types (MVP)

- Budget Threshold (80%, 100%) for household or category
- Household Invite sent/accepted/revoked
- Membership changes (promote/demote/remove)
- Critical system alerts (sync failures, account issues)

## Delivery Channels

- In-app toast/notification center (MVP)
- Push notifications / email (Phase 2)

## User Flow

1. Event triggers server-side notification job which writes a notification record to DB.
2. Frontend subscribes (poll/websocket) and surfaces in-app notifications and a notification center with unread counts.
3. User can open notification to navigate to related context (budget page, household settings, expense detail).
4. Notifications can be marked read/unread; users can configure basic preferences (enable/disable budget alerts).

## Acceptance Criteria

- Notifications for core events appear in-app in near real-time.
- Notification data includes event type, actor, related resource id, and timestamp.
- Users can view a notification center with recent notifications and unread count.
- Preferences allow toggling budget-related notifications per household.

## Failure States

- Notification delivery failure (background job error): retry with exponential backoff and surface errors to monitoring.
- User rejects push permission: fall back to in-app only and surface guidance to enable push later.
- High volume events: implement throttling/deduplication to avoid spamming users.

---

Notes:
- Design notification records as append-only for auditability: `id, household_id, user_id (recipient), actor_id, type, payload, read_at, created_at`.
- Consider batching budget alerts (e.g., daily digest) to reduce noise.
- Respect privacy/visibility rules when creating notifications (do not notify about private expenses to household members).