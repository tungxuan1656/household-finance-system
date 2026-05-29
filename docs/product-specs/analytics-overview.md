# Analytics Overview

## Goal

Provide clear spending summaries for personal, household, and group contexts.

## Entry Conditions

- User opens Insights or a dashboard surface.

## Core Metrics (MVP)

- Total spend for selected period
- Category breakdown
- Group/event summary
- Month-over-month comparison
- Top spending categories
- Household member spending breakdown when the user is in a household context

## User Flow

1. User opens Insights and selects a time range.
2. User may inspect personal or household context, depending on the page/view.
3. Server computes aggregates for the selected scope.
4. Frontend displays charts, ranked lists, and summary cards.
5. User may export a CSV snapshot for the selected range.

## Acceptance Criteria

- Analytics load within acceptable time for household-scale datasets.
- Personal analytics use the current user's own expenses.
- Household analytics use expenses attached to that household.
- Group summaries reflect visible expenses tagged to each group.
- Export contains the same aggregates and raw rows shown in the UI.

## Failure States

- Long-running aggregate queries: return cached or optimized results with truthful loading/error behavior.
- Partial data due to permissions: surface clear messaging about omitted items.

---

Notes:
- Category labels, icons, and colors resolve from the global static catalog by key.
