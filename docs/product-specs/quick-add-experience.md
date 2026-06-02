# Add Expense Dialog Experience

## Goal

Provide one ultra-fast, low-friction dialog for recording expenses.

## Entry Conditions

- User is authenticated.
- Add-expense dialog is accessible globally.

## User Flow

1. User opens the canonical add-expense dialog from shortcut, FAB, onboarding, expenses page, or shortcuts surface.
2. UI focuses on amount first; the user types digits using VND thousand-shortcut semantics.
3. User picks source and category, then enters `Nội dung`, date, optional household, and optional group.
4. Household and group are independent decisions:
   - no household = personal expense
   - household selected = household expense
   - group may be empty or selected in either case
5. User confirms; expense is created and a brief success toast appears with an `Undo` action.
6. If save fails because of network or server problems, the dialog surfaces a failure state and lets the user retry manually.

## Acceptance Criteria

- Canonical add-expense dialog creates an expense with sensible defaults and no route change.
- Default new expense state is no household and no group.
- Undo is available for a short window after creation.
- Offline or no-internet capture is not supported.
- Every add-expense entry point opens the same dialog instead of a dedicated create page.

## Failure States

- Invalid amount/date/category/source/content: show inline error and prevent submission.
- Network failure: show a clear error state and allow manual retry.
- Permission error writing to household: surface clear message and keep the dialog open for correction.

---

Notes:
- The dialog is the only canonical expense-create surface.
- The flow keeps context selection minimal: household and group are optional, direct fields.
- This spec is for `apps/web` only. Planned TWA expense capture uses `telegram-mini-app.md` and a three-step SPA flow (`amount -> category -> details`) while keeping the same expense-domain rules.
