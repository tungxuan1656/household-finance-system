# TMA App Shell And Navigation

## Goal

Define the top-level shell and navigation model for `apps/tma`.

## Current Truth

- Root shell uses three tabs: `Home`, `Statistics`, and `Settings`.
- `Expenses` is a secondary page reached from shortcuts, recent activity, or the floating add/expense entry points.
- Every main screen has a top header.
- Back navigation uses Telegram `BackButton` on non-root flows.

## Acceptance Criteria

- TMA keeps one SPA session with no full reload navigation.
- Root tab screens do not render a fake app-owned back chip.
- TMA shell rules stay separate from web responsive-shell rules.
