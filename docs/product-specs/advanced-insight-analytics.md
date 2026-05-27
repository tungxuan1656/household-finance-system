# Advanced Insight Analytics

## Goal

Provide deeper analytics beyond basic rollups in Phase 2+.

## Entry Conditions

- Sufficient historical data exists for personal or household analysis.

## Features

- Trend decomposition across categories and groups
- Anomaly detection for unusual spikes in categories, spending contexts, or groups
- Cohort analysis across groups or time-based cohorts
- Custom reports that users can save and rerun

## User Flow

1. User opens advanced analytics and selects analysis type and time range.
2. Server computes results and returns visualizations and explanations.
3. User can export results or save a report.

## Acceptance Criteria

- Advanced reports run within acceptable latency or provide progress feedback.
- Anomalies include explanation and example transactions for verification.
- Users can save and rerun custom reports.

## Failure States

- Insufficient data: show guidance and require more history.
- Long-running computations: provide progress UI and cached results.

---

Notes:
- Keep explanations tied to raw transactions and visible scopes.
