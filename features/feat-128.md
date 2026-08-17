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

- [ ] The approved Base UI foundation uses preset `b6G3fhkA4`.
- [ ] All feasible generic primitives use the migrated shadcn UI components.
- [ ] The central shadcn Button provides haptic behavior.
- [ ] Native pickers and DataState behavior remain intact.
- [ ] No Telegram BottomButton/MainButton usage remains.

## Handoff

- State: active
- Plan: Pending design-doc review.
