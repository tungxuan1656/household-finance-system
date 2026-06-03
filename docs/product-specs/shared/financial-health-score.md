# Financial Health Score

## Goal

Provide a simple, interpretable health score in Phase 2+.

## Entry Conditions

- User has enough spending and budget history in the relevant scope.

## Components

- Budget adherence
- Expense volatility
- Savings or net inflow signals when income is tracked
- Spending concentration across categories or contexts

## User Flow

1. User views Health Score on dashboard with a breakdown of contributing factors.
2. System provides suggestions to improve the score.
3. User can view historical score trend and drill into the underlying categories.

## Acceptance Criteria

- Score is computed consistently and explained with contributing factors.
- Score trend is visualized and updated regularly.
- Suggestions are actionable and tied to visible product flows.

## Failure States

- Poor explanation reduces trust: provide transparency and raw metrics.
- Missing data: surface what data is required for a reliable score.

---

Notes:
- Avoid black-box scoring in early releases.
