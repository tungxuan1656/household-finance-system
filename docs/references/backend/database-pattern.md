# Database Pattern (D1)

## Query Principles

- Do not use `SELECT *` in production endpoints.
- Bind all dynamic parameters.
- Separate read and write concerns.

## Naming and Mapping

- DB columns: `snake_case`
- API payloads: `camelCase`
- Keep mapping centralized and explicit.

## Integrity Rules

- Enforce ownership checks for user-scoped updates/deletes.
- Keep list ordering stable for pagination.
- Follow feature-specific delete policy (soft vs hard) intentionally.

## Performance Hygiene

- Limit list queries and enforce pagination.
- Avoid repeated queries inside loops when batch queries can be used.
- Document indexing needs when adding heavy queries.
- For AI context, fetch household groups with single `IN` query (`listExpenseGroupsByHouseholdIds`), not N+1 per household.
- Sort globally by recency then cap 15 households and 15 groups each.
- Log normalized-key collisions via `parse_expense_name_collision` and drop duplicates (keep first).
