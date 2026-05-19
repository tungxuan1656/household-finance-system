# Add Expense Dialog Experience

## Goal

Provide one ultra-fast, low-friction dialog for recording expenses (target: 2–3 seconds) to maximize capture rates and reduce cognitive load.

## Entry Conditions

- User is authenticated and has at least one household or is in single-player mode.
- Add-expense dialog is accessible globally (floating action button, keyboard shortcut, and CTA entry points).

## User Flow

1. User opens the canonical add-expense dialog from shortcut, FAB, onboarding, expenses page, or shortcuts surface.
2. UI focuses on the amount field first; the user types digits using VND thousand-shortcut semantics (`3` → `3.000 đ`).
3. User picks Source and Category, then enters `Nội dung`, date, optional family share, and optional group tag.
4. Family (`Gia đình`) and Group (`Nhóm`) are independent decisions:
   - no family = private expense
   - family selected = shared household expense
   - group may be empty or selected in either case
5. Payer is not chosen in create UI; create flow always records the current account as payer.
6. User confirms; expense is created and a brief success toast appears with an `Undo` action.
7. If save fails because of network or server problems, the dialog surfaces a failure state and lets the user retry manually.

## Acceptance Criteria

- Canonical add-expense dialog creates an expense with sensible defaults and no route change.
- Undo is available for a short window after creation.
- Offline or no-internet expense capture is not supported.
- Every add-expense entry point opens the same dialog instead of `/expenses/new`.

## Failure States

- Invalid amount/date/category/source/content: show inline error and prevent submission.
- Network failure: show a clear error state and allow manual retry. Do not imply queued save, background retry, or offline recovery.
- Permission error writing to household: surface clear message and keep the dialog open for correction.

---

Notes:
- Keep visual design minimal; prefer compact fields and a two-column layout on wider screens.
- Categories are chosen from the global static catalog; source keys are `cash`, `bank-transfer`, `card`, `momo`, `zalo-pay`, `shopee-pay`, `other`.
- The dialog is the only canonical expense-create surface; dedicated add-expense page is retired.
- Offline queueing, background sync, and pending-entry recovery are out of scope for this product.
