# Quick Add Experience

## Goal

Provide an ultra-fast, low-friction entry path for recording expenses (target: 2–3 seconds) to maximize capture rates and reduce cognitive load.

## Entry Conditions

- User is authenticated and has at least one household or is in single-player mode.
- Quick-add UI is accessible globally (header, floating action button, keyboard shortcut).

## User Flow

1. User opens quick-add via shortcut/fab/global input.
2. UI focuses on amount input first; user types amount.
3. User picks Source (mandatory - default to last used) and optionally Category, Group, Payer, Date, Note.
4. Expense scope defaults to personal/private. If the user switches the entry to household-shared, quick-add must require an explicit household selection or a locally scoped household from the launch surface; it must never rely on a hidden global active household.
5. User confirms (Enter/Done); expense is created and a brief success toast appears with an "Undo" action.
6. If save fails because of network or server problems, quick-add surfaces a failure state and lets the user retry manually.

## Acceptance Criteria

- Quick-add creates an expense with minimal required input (amount) and sensible defaults.
- Undo is available for a short window after creation.
- Offline or no-internet expense capture is not supported.
- Time-to-add metric (from open to save) is tracked and averages under 3s for targeted users.

## Failure States

- Invalid amount: show inline error and prevent submission.
- Network failure: show a clear error state and allow manual retry. Do not imply queued save, background retry, or offline recovery.
- Permission error writing to household: surface clear message and allow saving as private (if user chooses).

---

Notes:
- Keep visual design minimal; prefer single-line compact inputs on mobile.
- Expose advanced "Add expense" screen for full metadata editing when needed.
- Categories are chosen from the global static catalog; MVP quick-add does not depend on per-user category history or suggestion logic.
- Offline queueing, background sync, and pending-entry recovery are out of scope for this product.
- Consider microcopy to explain visibility and payer concepts in the quick-add UI.
