# Budget Management

## Goal

Allow households to define and track budgets (monthly and per-category) and compare planned vs actual spend to help users stay within limits. Per-category budgets reference the global static category catalog rather than household-owned category records.

## Entry Conditions

- User is an Admin or Member with budgeting rights and is in a household context.

## User Flow

1. Admin navigates to Budget settings and creates a monthly budget for the household (total) and/or per-category budgets keyed by the global category catalog.
2. User views current period budget dashboard with Planned vs Actual, spend timeline, and warnings for overspend.
3. Users can set budget start day, currency, and optionally recurring monthly rules.
4. When expenses are added/edited, budget aggregates update in near real-time; warnings appear when thresholds are crossed.
5. Admins can adjust budget mid-period; change history is recorded.
6. Admins can delete an obsolete budget; deleted budgets no longer appear in active budget lists or dashboard summaries.

## Acceptance Criteria

- Households can create at least a monthly total budget and per-category budgets keyed by categories whose catalog `kind` is `expense`.
- Dashboard shows Planned vs Actual and remaining budget for the period.
- Threshold notifications (e.g., 80%, 100%) are tracked and can be surfaced via UI/notification system.
- Budget changes are auditable and reflected in subsequent calculations.
- Deleted budgets disappear from active views without exposing them to members who can no longer access them.

## Failure States

- Budget creation failure: show validation errors and allow retry.
- Calculation mismatch after edits: provide reconciliation tools and audit logs.
- Insufficient permissions: block and explain required role.

---

Notes:
- Start with simple monthly budgets; advanced budgeting (rolling budgets, envelopes) in Phase 2.
- Category labels/icon/color used by budget UI resolve from the global static catalog by key.
- Index budget aggregates to support efficient dashboard queries.
- Notification delivery (email/push) is roadmap; surface in-app warnings in MVP.
