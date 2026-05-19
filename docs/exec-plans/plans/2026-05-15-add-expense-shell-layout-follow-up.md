# Title

Adapt AddExpenseDialog into desktop dialog + mobile drawer with row layout.

## Purpose / Big Picture

Users already have one canonical add-expense entry point, but the current surface still feels too much like a generic dialog form. This follow-up changes the shell and field layout so desktop keeps a modal dialog, mobile uses a bottom drawer around 80vh, and the form becomes a clearer row-based entry flow with simpler native selects. Users will observe a more intentional mobile experience, easier scanning, and simpler category selection.

## Scope

- Files, modules, and areas expected to change:
  - `apps/web/src/components/expense/add-expense-dialog.tsx`
  - `apps/web/src/components/expense/category-picker.tsx`
  - `apps/web/src/components/expense/source-picker.tsx`
  - `apps/web/src/components/expense/form-fields/category-field.tsx`
  - `apps/web/src/components/ui/drawer.tsx` (consume only unless small styling hook is required)
  - `apps/web/src/hooks/shared/use-mobile.ts`
  - `apps/web/src/lib/i18n/locales/vi.json` if touched copy changes are required
  - `docs/design-docs/2026-05-15-add-expense-dialog-domain-and-ui-design.md`
  - `docs/exec-plans/index.md`
  - `harness/progress.md`
- Explicitly out of scope:
  - Worker/backend/domain changes.
  - New date-picker library or masked date input.
  - Expense edit flow redesign.
  - Broader dead-code cleanup from the prior expense refactor.

## Non-negotiable Requirements

- Desktop uses `Dialog`; mobile uses bottom `Drawer`.
- Mobile drawer height is capped near `80vh` and scrolls internally.
- Drawer exposes a close action and keeps submit in footer.
- The form body becomes one vertical list with each field on its own row, label left and control right.
- Field order is `money -> content -> date -> category -> source -> household -> group`.
- Date remains native date input.
- Category changes to native select.
- Source remains native select.
- The plan must produce observable proof via focused verification plus final repo verification.

## Progress

- [x] 2026-05-15 — Updated the existing expense refactor plan/index status so this follow-up became the single active plan during execution.
- [x] 2026-05-15 — Used focused verification (`./init.sh typecheck` + `./init.sh lint`) for the touched add-expense UI contract instead of adding new tests because the change was shell/layout and control composition only.
- [x] 2026-05-15 — Refactored `AddExpenseDialog` to switch shells by breakpoint and rebuilt the field layout into the approved row order.
- [x] 2026-05-15 — Replaced category selection with native select while preserving source as native select.
- [x] 2026-05-15 — Ran focused verification, final `./init.sh`, and updated harness/progress evidence.

## Surprises & Discoveries

- The current working tree already contains an incorrect post-commit change where `apps/web/src/components/expense/source-picker.tsx` was temporarily switched away from native select. This follow-up must preserve the corrected product intent: source stays native, category becomes native.

## Decision Log

- Decision: Keep shell switching logic inside the existing `AddExpenseDialog` smart component instead of splitting into separate mobile/desktop feature trees.
  Rationale: The business logic and data loading are already correct; only shell/layout should change, so one smart owner with shared form body is lower risk.
  Date/Author: 2026-05-15 / Orchestrator + User
- Decision: Keep native date input even though the user originally mentioned `dd/mm/yyyy` display.
  Rationale: The user explicitly selected native date input during clarification, so the follow-up will not introduce a mask or custom picker.
  Date/Author: 2026-05-15 / Orchestrator + User
- Decision: Simplify category to native select.
  Rationale: This removes nested overlay complexity and aligns with the user’s final direction after revising the earlier combobox/select request.
  Date/Author: 2026-05-15 / Orchestrator + User

## Outcomes & Retrospective

- Desktop add-expense now renders as a dialog while mobile renders as a bottom drawer capped around 80vh with internal scrolling and footer actions.
- The form body now follows the approved one-column row layout and field order while preserving existing create behavior.
- Category selection was simplified to native select; source stayed native select.
- Verification evidence: repeated `./init.sh typecheck` and `./init.sh lint` during implementation/review plus final full `./init.sh` returning `Done!`.
- Deferred cleanup remains intentionally separate (for example dead-code hygiene from the prior large refactor).

## Context and Orientation

- The current create surface lives in `apps/web/src/components/expense/add-expense-dialog.tsx` and already owns queries, submit mutation, amount normalization, and undo behavior.
- Shared mobile breakpoint logic already exists in `apps/web/src/hooks/shared/use-mobile.ts` and is used by `apps/web/src/components/layouts/main-layout.tsx`.
- Reusable shells already exist in `apps/web/src/components/ui/dialog.tsx` and `apps/web/src/components/ui/drawer.tsx`.
- Current category/source controls live in `apps/web/src/components/expense/category-picker.tsx` and `apps/web/src/components/expense/source-picker.tsx`.
- The design source of truth for this follow-up is `docs/design-docs/2026-05-15-add-expense-dialog-domain-and-ui-design.md`.

## Required Standards / Reference Docs

Frontend references to apply:

- `docs/references/frontend/project-folder-structure.md`
  - Keep this follow-up inside the existing expense feature files; do not create a parallel mobile-only feature tree.
- `docs/references/frontend/component-structure-pattern.md`
  - Keep `add-expense-dialog.tsx` as the smart orchestrator and extract only if the presentational row layout becomes unwieldy.
- `docs/references/frontend/naming-and-conventions-pattern.md`
  - Preserve named exports, alias imports, and concise English comments only when necessary.
- `docs/references/frontend/form-pattern.md`
  - Preserve `Field`, `FieldLabel`, `FieldError`, `data-invalid`, and `aria-invalid` behavior while changing the visual layout.
- `docs/references/frontend/dialog-and-form-pattern.md`
  - Use the existing `Dialog`/`Drawer` primitives correctly, keep title/description/footer semantics, and avoid ad-hoc overlay shells.
- `docs/references/frontend/api-react-query-pattern.md`
  - Do not disturb current query/mutation ownership while changing layout shells.
- `docs/references/frontend/i18n-label-pattern.md`
  - Any touched labels/buttons must stay i18n-backed.

Companion skills during execution:

- `test-driven-development` if a new focused test is introduced.
- `typescript-reviewer` after TS/TSX edits.
- `requesting-code-review` after implementation.
- `verification-before-completion` before claiming done.

## Plan of Work (Narrative)

1. **Normalize the current picker state before layout work.**
   - Ensure `apps/web/src/components/expense/source-picker.tsx` stays on `NativeSelect`.
   - Convert `apps/web/src/components/expense/category-picker.tsx` from the current select/combobox hybrid state into a pure native-select implementation with the smallest possible API surface.

2. **Refactor shell selection by breakpoint.**
   - In `apps/web/src/components/expense/add-expense-dialog.tsx`, read `useIsMobile()` and branch only at the outer shell layer.
   - Desktop keeps `Dialog` + `DialogContent`.
   - Mobile uses `Drawer` + `DrawerContent` with an internal scroll region and footer action row.
   - Reuse one shared form-body render path so validation, submit, reset, amount normalization, and mutations stay single-source.

3. **Rebuild the field layout.**
   - Replace the current grid/two-column layout with one vertical stack.
   - Each field row should render label left, control right, and preserve inline error output below or within the row without harming accessibility.
   - Reorder the rows to: amount, content, date, category, source, household, group.

4. **Keep existing business behavior intact.**
   - Preserve thousand-shortcut amount formatting.
   - Preserve profile last-source persistence, undo delete flow, household/group merge logic, and submit payload semantics.
   - Do not reintroduce `payerUserId`, combobox overlays, or `/expenses/new` route logic.

5. **Finish with focused verification and plan/harness evidence.**
   - Run typecheck at minimum because this change heavily affects TSX shell composition.
   - If a focused render/helper test is added, run it.
   - Run final `./init.sh` after the UI change is complete.
   - Update `harness/progress.md` and plan/index status to show this follow-up shipped.

## Concrete Steps (Commands)

Run from repo root `/Users/tungdoan/Projects/Web/household-finance-system` unless stated otherwise.

1. Baseline TypeScript state before editing the shell:

```bash
./init.sh typecheck
```

Expected short output:

```text
OK
```

2. After the picker + shell/layout batch, re-run focused verification:

```bash
./init.sh typecheck
./init.sh lint
```

Expected short output:

```text
OK
OK
```

3. Final verification after code/docs/progress updates:

```bash
./init.sh
```

Expected short output:

```text
Done!
```

## Validation and Acceptance

Happy path acceptance:

- On desktop width, opening add-expense shows a modal dialog.
- On mobile width, opening add-expense shows a bottom drawer capped around `80vh`.
- Drawer content scrolls internally when the viewport is short.
- The close action dismisses the drawer without submitting.
- The footer submit button still creates an expense successfully.
- The fields visually appear in this order: amount, content, date, category, source, household, group.
- Category and source both render as native selects.

Validation/error-path acceptance:

- Existing required-field validation still blocks empty amount/content/date/category/source submissions.
- Switching shell type does not break submit, close, or undo behavior.

Regression acceptance:

- `SourcePicker` remains native select after the accidental post-commit drift.
- The existing VND amount helper behavior still passes its focused test if rerun.
- No worker/domain files change as part of this frontend-only follow-up.

Acceptance artifacts required:

- Fresh `./init.sh typecheck` output.
- Fresh `./init.sh lint` output.
- Final `./init.sh` output.
- Manual responsive verification note (desktop dialog + mobile drawer).

## Idempotence & Recovery

- This is a frontend-only shell/layout change; edits are safe to re-run.
- If the shell refactor becomes unstable, revert only the follow-up working-tree changes on top of commit `5878ac1` and keep the prior canonical dialog behavior intact.
- Do not mix dead-code cleanup into this follow-up; if the diff grows beyond shell/layout and picker changes, split that work into a separate cleanup pass.

## Artifacts and Notes

- Prior shipped commit: `5878ac1` (`refactor: unify expense creation into canonical dialog`).
- Design note: `docs/design-docs/2026-05-15-add-expense-dialog-domain-and-ui-design.md`.
- This follow-up is intentionally frontend-only and should not modify worker contracts, migrations, or feature `feat-060` scope beyond evidence/progress updates.

## Interfaces & Dependencies

- Existing hooks/data dependencies that must remain untouched in behavior:
  - `useCreateExpenseMutation`, `useDeleteExpenseMutation`
  - `useReferenceCategoriesQuery`
  - `useHouseholdsQuery`
  - `useExpenseGroupListQuery`
  - `useCurrentUserProfileQuery`, `useUpdateCurrentUserProfileMutation`
- Existing UI primitives expected to be composed:
  - `@/components/ui/dialog`
  - `@/components/ui/drawer`
  - `@/components/ui/field`
  - `@/components/ui/input`
  - `@/components/ui/native-select`
