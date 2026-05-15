# Expense Ownership

## Goal

Clarify domain model for `creator` vs `payer`, define permissions and how ownership affects visibility and analytics.

## Entry Conditions

- Creating or viewing an expense in private or household context.

## User Flow

1. When creating an expense, `creator` and `payer` are both derived from the current signed-in account.
2. Display ownership metadata in expense list and details (Creator: X, Payer: Y).
3. Ownership changes are recorded in audit logs and can affect analytics attribution.

## Acceptance Criteria

- Each expense stores `creator_id` and `payer_id` fields.
- Create UI does not expose creator/payer selectors.
- Read and edit surfaces display both roles clearly where relevant.
- Analytics attribute amount to `payer` for spending summaries; `creator` used for input tracking.
- Changing payer requires appropriate permissions; changing creator is restricted or recorded separately.

## Failure States

- Invalid payer on non-create flows (user not in household): block and request valid payer.
- Attempt to change ownership without permission: deny and record attempt.

---

Notes:
- Define clear rules for refunds/reimbursements (out of scope for MVP).
- Ensure queries for "who paid" use `payer_id` consistently to avoid double-counting.
