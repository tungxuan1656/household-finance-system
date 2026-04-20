# Quick Add Experience

## Goal

Provide an ultra-fast, low-friction entry path for recording expenses (target: 2–3 seconds) to maximize capture rates and reduce cognitive load.

## Entry Conditions

- User is authenticated and has at least one household or is in single-player mode.
- Quick-add UI is accessible globally (header, floating action button, keyboard shortcut).

## User Flow

1. User opens quick-add via shortcut/fab/global input.
2. UI focuses on amount input first; user types amount (support numeric keyboard on mobile).
3. Optional lightweight fields available inline or collapsed: category, payer, date, note, visibility.
4. Defaults: last-used category, active household, creator=payer if unset.
5. User confirms (Enter/Done); expense is created and a brief success toast appears with an "Undo" action.
6. If offline or network failure, expense is queued locally and retried; user sees pending state in feed.

## Acceptance Criteria

- Quick-add creates an expense with minimal required input (amount) and sensible defaults.
- Undo is available for a short window after creation.
- Pending/offline entries are visible and sync automatically when network returns.
- Time-to-add metric (from open to save) is tracked and averages under 3s for targeted users.

## Failure States

- Invalid amount: show inline error and prevent submission.
- Network failure: show queued/pending state and retry automatically; allow manual retry.
- Permission error writing to household: surface clear message and allow saving as private (if user chooses).

---

Notes:
- Keep visual design minimal; prefer single-line compact inputs on mobile.
- Expose advanced "Add expense" screen for full metadata editing when needed.
- Consider microcopy to explain visibility and payer concepts in the quick-add UI.