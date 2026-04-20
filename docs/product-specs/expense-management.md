# Expense Management

## Goal

Define lifecycle rules for expenses: edit, delete, recovery, and audit to minimize disputes and preserve data integrity.

## Entry Conditions

- User views an existing expense and has appropriate permissions to modify it.

## User Flow

1. User selects an expense and clicks Edit.
2. Edit screen shows original values and the ability to change mutable fields (amount, category, note, date, payer, visibility) depending on permissions.
3. On save, system records a versioned audit entry and updates derived aggregates.
4. For Delete: user may soft-delete (archived) with confirmation; admins can permanently delete after a retention window.
5. Recovery: soft-deleted items can be restored by allowed roles within retention window.

## Acceptance Criteria

- Edits create immutable audit entries recording who changed what and when.
- Soft-delete hides expense from normal lists but retains data for recovery and audit.
- Permanent delete is restricted to admins and only after retention/consent rules.
- Derived metrics (budgets, analytics) update consistently after edits or deletions.

## Failure States

- Concurrent edit conflict: surface conflict UI showing both versions and require user confirmation to overwrite.
- Unauthorized edit/delete: deny action and explain required role.
- Audit write failure: block destructive actions and surface error for retry.

---

Notes:
- Audit entries should include actor id, changed fields, old/new values, and timestamp.
- Consider retention policy and GDPR-like deletion flows where applicable.