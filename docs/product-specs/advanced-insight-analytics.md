# Advanced Insight Analytics

## Goal

Provide deeper analytics beyond basic rollups: cohort analysis, trend decomposition, anomaly detection, and segmentation to surface actionable insights (Phase 2+).

## Entry Conditions

- Sufficient historical data exists for a household (several months).

## Features

- Trend decomposition: separate seasonal vs baseline spend.
- Anomaly detection: flag unusual spikes in categories or payers.
- Cohort analysis: compare spending behavior across groups or time-based cohorts.
- Custom reports: allow users to define and save report queries.

## User Flow

1. User opens advanced analytics and selects analysis type and time range.
2. Server computes results (may use precomputed rollups or background jobs) and returns visualizations and explanations.
3. User can export results or save as a custom report.

## Acceptance Criteria

- Advanced reports run within acceptable latency (use background jobs with progress indicators if needed).
- Anomalies include explanation and example transactions for verification.
- Users can save and re-run custom reports.

## Failure States

- Insufficient data: show guidance and require more history.
- Long-running computations: provide progress UI and cached results.

---

Notes:
- Prioritize UX clarity: show why a metric changed and provide drilldowns to transactions.
- Consider privacy and access controls for sensitive analyses.