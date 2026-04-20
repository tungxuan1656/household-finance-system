# Expense Querying

## Goal

Define querying and filtering semantics for expenses to support UI lists, search, and analytics with performant, predictable APIs.

## Entry Conditions

- User requests expense lists, search results, or filtered views in a household or personal context.

## Query Parameters / Filters

- `date_from`, `date_to` (range)
- `period` (month, week, custom)
- `category_id` (single or multiple)
- `group_id` (single or multiple)
- `payer_id`, `creator_id`
- `visibility` (private, household) — server-enforced
- `query` (full-text search against notes)
- `amount_min`, `amount_max`
- pagination: `limit`, `cursor` (cursor-based preferred)
- sort: `date`, `amount`, `created_at`

## User Flow

1. User selects filters in UI; frontend composes query to `/api/expenses` with filters and pagination.
2. Server validates caller authorization and filters by `visibility` + `household membership`.
3. Server returns a cursor-based page of expenses plus aggregated totals for the requested period.
4. Frontend uses results to render lists and feeds; infinite-scroll or paged navigation supported.

## Acceptance Criteria

- API supports the above filters and returns consistent, paginated results.
- Server enforces visibility and membership rules for each request.
- Aggregated totals (sum/COUNT) for the filtered set are returned efficiently (or via a companion endpoint).
- Text search is available for notes and supports simple partial-match queries in MVP.

## Failure States

- Invalid filter values: return 400 with helpful message.
- Authorization failure: return 403.
- Large queries: enforce sensible limits and return truncated results with guidance.

---

Notes:
- Use DB indexes on (`household_id`, `date`, `category_id`) and full-text index on `note`.
- Prefer cursor pagination for stable feeds. Provide an `/api/expenses/summary` for heavy aggregated queries if needed.