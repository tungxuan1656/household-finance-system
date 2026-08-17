# feat-128 - TMA shadcn UI migration

## Goal

Migrate feasible TMA generic UI primitives to the approved shadcn UI foundation.

## Confirmed scope

- Use Base UI with the exact preset `b6G3fhkA4`.
- Support light mode only.
- Use a central shadcn Button with haptic behavior.
- Replace all feasible generic primitives.
- Retain native pickers and existing DataState behavior.
- Remove all Telegram BottomButton/MainButton usage.

## Non-goals

- Dark mode.
- Replacing native pickers.
- Changing DataState behavior.
- Backend, API, or unrelated TMA behavior changes.

## Acceptance

- [x] The approved Base UI foundation uses preset `b6G3fhkA4`.
- [x] All feasible generic primitives use the migrated shadcn UI components.
- [x] The central shadcn Button provides haptic behavior.
- [ ] Native pickers and DataState behavior remain intact.
- [x] No Telegram BottomButton/MainButton usage remains.

## Handoff

- State: active
- Plan: [`docs/plans/feat-128.md`](../docs/plans/feat-128.md) — accepted implementation plan covering provenance, primitive contracts, nine in-page CTA routes, bridge deletion, fixed-light/token gates, BackButton/shell audit, rollback, tests, and Telegram QA.
- Evidence: The automated gates passed: TMA lint/typecheck/test/build, `./init.sh`, bridge/theme/token audits, BackButton tests, Button activation tests, and `git diff --check`.
- Blockers: Real Telegram QA on iOS and Android, in host light and host dark settings, remains unrecorded.
- Next: Record the Telegram QA matrix, then run the final whole-branch review.
