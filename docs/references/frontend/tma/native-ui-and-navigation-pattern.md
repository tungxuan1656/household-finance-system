# TMA native UI and navigation pattern

Canonical rules for Telegram-native-feeling UX inside one SPA WebView.

## Scope

Use this doc for:

- route transitions
- `BackButton`, safe-area, and viewport handling
- shadcn/ui buttons and fixed light-only visual theme
- haptics
- safe area, keyboard, and gesture behavior

## Navigation rules

- Use SPA routing only.
- Keep screen transitions at route-shell or flow-shell level, not scattered across leaf components.
- Treat route changes as in-memory screen swaps. A full WebView reload is a bug.

## BackButton rules

- `BackButton` is manual. Telegram does not wire app history for you.
- Flow or route shell owns show, hide, and click binding.
- Root routes with no meaningful back target should hide it.
- Clean up handlers on unmount. Do not leak multiple listeners across screen swaps.

## In-page Button rules

- Do not use Telegram `BottomButton` or `MainButton` on any route.
- Use in-page shadcn/ui `Button` components for CTAs.
- The locally customized Button triggers Telegram `impact('light')` once for an enabled activation.
- Flow shells may own button text, enabled state, progress state, and click handler, but the CTA remains in page content.
- Keep button text action-specific: `Continue`, `Save 50,000d`, `Join household`.

## Layout rules

- One scroll root per screen.
- Reserve bottom spacing for safe area plus tab-rail overlap when present.
- Use Telegram viewport and safe-area CSS vars, not raw `100vh`, for pinned mobile layouts.
- Keep keyboard-safe padding in the shared shell.

Prefer these inputs for layout decisions:

- stable viewport height
- safe-area insets
- content safe-area insets
- fullscreen state

## Motion rules

- Animate `transform` and `opacity` only.
- Avoid `width`, `height`, `top`, `left`, `margin`, and layout-heavy filters in motion.
- Use spring motion for sheets, route transitions, and high-touch controls.
- Keep expensive charts and long lists out of the same animated layer when possible.

## Touch and gesture rules

- Keep semantic `onClick` or pointer handlers by default.
- Add touch-first handlers only on measured high-frequency controls such as amount pads or fast toggles.
- Do not blanket-replace all button handlers with `onTouchStart`.
- Disable vertical close-swipes only when the app gesture conflicts with product UX. Do not disable platform gestures globally without need.

## Theme rules

- TMA is fixed light-only.
- Do not sync the visual theme to Telegram theme vars.
- Prevent first-paint flash with the app's fixed light base colors before hydration.
- Legacy `--tma-*` UI tokens are transitional only and are removed after all consumers migrate.

## Native picker and state rules

- Preserve existing native-picker/date-picker behavior.
- Preserve `DataState` behavior and restyle its presentation with shadcn/ui.

## Haptics rules

- Use haptics for confirmation, selection, and high-value taps.
- Do not vibrate every control.
- Success, warning, and error haptics should map to product meaning, not decoration.

Good uses:

- amount keypad press
- category selection
- expense save success
- destructive confirm acceptance

Bad uses:

- every list row tap
- passive scrolling
- repeated background refresh events

## Keyboard rules

- Assume iOS keyboard overlap is a core path, not an edge case.
- Scroll the active input into view only after viewport changes settle.
- If keyboard hiding is supported, use it as a convenience only. Do not make the flow depend on that capability.

## Example ownership split

```text
AddExpenseFlowShell
  -> owns route step, BackButton, in-page CTA state, closing confirmation
  -> reads Zustand flow state and query data
  -> renders step page

CategoryDateStepPage
  -> owns date summary and category selection UI
  -> commits chosen category/date and advances on category tap

ExpenseDetailsStepPage
  -> owns amount, source, and note input formatting
  -> exposes current validity/value upward
```

## Verification checklist

- Route push/pop works without WebView reload.
- `BackButton` visibility matches route depth.
- In-page shadcn Button text, disabled state, and loading state match current step.
- Fixed light theme, safe area, and keyboard overlap were checked on real Telegram surfaces.
