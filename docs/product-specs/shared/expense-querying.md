# Expense Querying

## Goal

Define filtering and querying semantics for personal, household, and group views.

## Entry Conditions

- User requests expense lists, search results, or filtered views.

## Query Parameters / Filters

- `date_from`, `date_to`
- `category_key`
- `group_id`
- `household_id`
- `spent_by_user_id` when the product needs explicit spender filtering
- `query`
- `amount_min`, `amount_max`
- pagination: `limit`, `cursor`
- sort: `occurred_at_desc`, `amount_desc`

## User Flow

1. User selects filters in UI.
2. Frontend composes query to `/api/v1/expenses` and optional summary endpoints.
3. Server validates caller authorization and applies scope:
   - personal scope = current user's own expenses
   - household scope = expenses attached to selected household
4. Server returns cursor-based results and companion totals where needed.

## Acceptance Criteria

- API supports the above filters and returns consistent paginated results.
- Server enforces membership for household-scoped requests.
- Aggregated totals for filtered sets are available efficiently.
- Text search supports simple partial note matching in MVP.

## Failure States

- Invalid filter values: return 400 with helpful message.
- Authorization failure: return 403.
- Large queries: enforce limits and stable pagination.

---

Notes:
- Expense querying uses scope, spender, category, group, amount, date, and text filters only.
- Group filtering narrows the current visible scope; it does not replace that scope.
