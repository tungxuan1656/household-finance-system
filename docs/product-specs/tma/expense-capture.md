# TMA Expense Capture

## Goal

Provide a TMA-first expense-create flow optimized for Telegram WebView speed and clarity.

## User Flow

1. User starts expense capture from the floating add action or another supported entry point.
2. Step 1: choose date and category.
3. Step 2: enter amount, source, and note.
4. Step 3: choose optional household and group, then review preview state.
5. User saves through Telegram `BottomButton`.

## Acceptance Criteria

- TMA expense flow is `date + category -> amount + source + note -> household + group + preview`.
- Shared expense semantics still come from `../shared/expense-tracking.md`.
- No offline queue or background retry is implied.

## Rule

- TMA flow order is TMA-only UX truth. Do not backfill it into web quick-add docs.
