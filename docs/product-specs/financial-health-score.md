# Financial Health Score

## Goal

Provide a simple, interpretable household-level health score that summarizes financial posture (Phase 2+), helping users track long-term trends.

## Entry Conditions

- Households have at least a few months of tracked expenses and budgets.

## Components

- Budget adherence (on-time vs overspend)
- Expense volatility (large unexpected spikes)
- Savings or net inflow signals (if income is tracked)
- Diversity of contributors (payer distribution)

## User Flow

1. User views Health Score on dashboard with breakdown of contributing factors.
2. System provides suggestions to improve score (e.g., set category budgets, reduce subscription churn).
3. Users can view historical trend of the score and drill into contributing categories.

## Acceptance Criteria

- Score is computed consistently and explained with contributing factors.
- Score trend is visualized and updated regularly (daily/weekly).
- Suggestions are actionable and tied to UI flows.

## Failure States

- Poorly explained score reduces trust: provide transparency and raw metrics.
- Missing data: surface what data is required to compute a reliable score.

---

Notes:
- Start simple and iterate on weighting; avoid black-box models in early releases.
- Keep privacy in mind; do not expose personal financial details across household members improperly.