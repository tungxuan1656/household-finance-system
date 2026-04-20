# Expense Categorization

## Goal

Provide clear, maintainable categorization for expenses to power budgets and analytics.

## Entry Conditions

- User creates or edits an expense and selects a category.

## User Flow

1. Category dropdown suggests recent categories and top-level household categories.
2. Users can create a new category if allowed by household settings.
3. User can re-categorize past expenses via bulk actions.

## Acceptance Criteria

- Categories are hierarchical (optional) or flat depending on household settings.
- Defaults: last-used category or household default for quick-add.
- Bulk re-categorization works and updates analytics consistently.

## Failure States

- Category creation conflict: handle duplicate or invalid names gracefully.
- Bulk operation partially fails: provide per-item error details and retry option.

---

Notes:
- Avoid ML in MVP; keep categorization manual with later auto-suggestion in Phase 2.
- Maintain a canonical category list per household with optional personal overrides.