# Analytics Overview

## Goal

Outline the basic analytics and insights the app provides in MVP: spend summaries, category breakdowns, and simple trend comparisons to help households understand where money goes.

## Entry Conditions

- User requests analytics/dashboard for a household or personal view.

## Core Metrics (MVP)

- Total Spend (period)
- Category Breakdown (percent + amount)
- Group/Event Summary (total per group)
- Month-over-Month comparison (this month vs last month)
- Top N categories (by spend)
- Payer attribution (who paid most)

## User Flow

1. User opens the Insights/Dashboard page and selects a time range (month default).
2. Server computes aggregates for the requested range, respecting `visibility` rules.
3. Frontend displays charts: time series, pie/bar for categories, and list of top categories.
4. User can export a CSV snapshot for the selected range.

## Acceptance Criteria

- Dashboard loads within acceptable time for household-sized datasets (thousands of records).
- Metrics respect visibility: private expenses excluded from household-level metrics.
- Charts show clear comparisons and allow switching ranges.
- Export contains the same aggregates and raw rows as presented (subject to visibility).

## Failure States

- Long-running aggregate queries: provide precomputed rollups or background jobs and return cached results.
- Partial data due to permissions: surface clear messaging about omitted items.

---

Notes:
- Implement daily rollups for ranged queries to meet performance targets.
- Advanced analytics (trend forecasting, health score) belong to Phase 2+.