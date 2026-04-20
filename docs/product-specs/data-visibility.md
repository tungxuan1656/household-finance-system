# Data Visibility

## Goal

Specify clear rules for which users can see which expenses and related metadata to inform DB design, API contracts, and UI behavior.

## Entry Conditions

- Expense created with a visibility flag or default household/user preference.

## Visibility Model

- `private`: visible only to the creator (and system admins for support) — not shared to household feeds.
- `household`: visible to all household members subject to role permissions.
- `restricted` (future): limited subset of household (e.g., admins-only) — roadmap.

## Rules

1. Each expense has a `visibility` enum field and `household_id` (nullable for personal-only usage).
2. On create, default visibility uses user preference; explicit selection overrides default.
3. Changing visibility from `private` → `household` requires explicit confirmation and records an audit entry; any attached PII should be reviewed.
4. Changing `household` → `private` should be allowed but must be audited and may be restricted for expenses with shared reimbursements (future edge case).
5. API responses must only include expenses the caller is authorized to see; server filters by `visibility` + `household membership` + role.
6. Search & analytics pipelines must respect visibility: private expenses excluded from household aggregates unless user opts in for personal analytics.

## User Flow Examples

- Viewing household feed: server returns expenses where `visibility=household` and `household_id` matches user's active household.
- Viewing personal feed: server returns expenses where `creator_id` == user or `visibility=private` for that user.
- Sharing an expense: UI prompts confirmation and explains impact before flipping visibility.

## Acceptance Criteria

- Visibility enforcement is correct across UI and API (no leakage).
- Transitions between visibility states are audited.
- Analytics pipelines exclude private expenses from shared household metrics.

## Failure States

- Visibility misconfiguration returns 403 for resource access: surface clear error and remediation steps.
- Attempt to change visibility without permission: block and audit attempt.
- Edge cases with migrated data: provide migration steps and verification.

---

Notes:
- DB indexing: index on (`household_id`, `visibility`, `date`) for efficient household queries.
- Consider soft-delete and archival flags interacting with visibility rules.
- Document any GDPR-like deletion semantics as part of retention policy.