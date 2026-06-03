# Audit Log

## Goal

Maintain an immutable, queryable audit trail of important actions (member changes, expense edits/deletes, role changes, invites) for debugging and conflict resolution.

## Entry Conditions

- Any privileged or state-changing action occurs in household context.

## Contents

- Records should include: `id`, `household_id`, `actor_id`, `action_type`, `target_id`, `payload` (old/new), `timestamp`.
- Critical actions to log: member changes, role changes, invites, expense edits/deletes, group configuration changes, budget adjustments.

## User Flow

1. System writes audit entry synchronously with state-changing operations (or in a reliable async pipeline with guaranteed ordering).
2. Admins can view audit logs (read-only) filtered by date, actor, action_type, or target_id.
3. Logs are retained per retention policy and exportable for compliance.

## Acceptance Criteria

- Audit entries are written for all defined critical actions and are tamper-evident.
- Admin UI can query and filter logs with reasonable performance for typical household sizes.
- Retention and export policies are in place.

## Failure States

- Audit write failure: block or retry critical operations; surface error to monitoring.
- Unauthorized access to logs: enforce strict permissions (admin-only).

---

Notes:
- Consider append-only storage and periodic integrity checks.
- Document retention and privacy implications; provide export and deletion tools as required by law.