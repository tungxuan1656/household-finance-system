# TMA App Shell And Navigation

Status: current

## Goal

Define the top-level shell and navigation model for `apps/tma`.

## Current Truth

- Root shell uses a three-position tab rail: `Home`, a centered add-expense action, and `Statistics`; `Settings` and `Expenses` are secondary pages. See `apps/tma/DESIGN.md` and `docs/design-docs/frontend/tma/telegram-mini-app-client-architecture.md` for canonical shell.
- Every main screen has a top header.
- Back navigation uses Telegram `BackButton` on non-root flows.
- Flow CTAs use in-page shadcn `Button` CTAs via `TmaHapticButton` when haptics are needed. See `docs/references/frontend/tma/native-ui-and-navigation-pattern.md`.

## Acceptance Criteria

- TMA keeps one SPA session with no full reload navigation.
- Root tab screens do not render a fake app-owned back chip.
- Root shell shows the three-position rail (`Home`, centered add action, `Statistics`); `Settings` and `Expenses` open as secondary pages.
- TMA shell rules stay separate from web responsive-shell rules.
