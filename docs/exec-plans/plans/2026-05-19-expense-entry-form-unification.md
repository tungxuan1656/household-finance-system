# Title

Unify add/edit expense on one canonical expense-entry form.

## Purpose / Big Picture

This change makes add-expense and edit-expense use one shared form implementation while preserving the row-by-row UI style already approved in the current add-expense dialog. Users should see the same field visuals for create and edit, and the VND thousand-shortcut amount behavior must work symmetrically so an edited expense shows the correct input value and saves back to the exact same persisted amount when unchanged.

## Scope

- In scope:
  - `apps/web/src/components/expense/add-expense-dialog.tsx`
  - `apps/web/src/components/expense/add-expense/provider.tsx` only if imports/public surface need alignment
  - `apps/web/src/components/expense/add-expense-form.tsx` (expected rename/replacement)
  - `apps/web/src/components/expense/use-add-expense-form.ts` (expected rename/replacement)
  - `apps/web/src/components/expense/dialog-amount-helper.ts`
  - `apps/web/src/components/expense/expense-form.tsx`
  - `apps/web/src/components/expense/use-expense-form.ts`
  - `apps/web/src/components/expense/expense-form-fields.tsx`
  - `apps/web/src/components/expense/form-fields/*`
  - `apps/web/src/views/app/edit-expense-page.tsx`
  - `apps/web/src/components/expense/index.ts` if public exports change
  - Focused frontend tests for the shared amount helpers and shared form logic
  - Harness and plan artifacts required by repo policy
- Out of scope:
  - Worker/backend API contract changes
  - New visual redesign of the approved field appearance
  - Adding note, payer, or visibility back into the shared add/edit surface
  - New add-expense entry points or navigation changes beyond reusing the shared form in edit

## Non-negotiable Requirements

- The plan is self-contained and names exact files/commands.
- The approved add-expense field visuals remain the canonical UI; code may be normalized but not visually redesigned.
- Create and edit must share one canonical form component/hook path.
- The VND thousand-shortcut amount mapping must be symmetric: raw input -> display -> payload, and persisted amount -> edit raw input.
- Saving an unchanged amount in edit must preserve the exact stored amount.
- Dead code from the old split form architecture must be removed.

## Progress

- [ ] 2026-05-19 Run GitNexus upstream impact checks for `AddExpenseDialog`, `EditExpensePage`, and `ExpenseForm` before editing symbols.
- [ ] 2026-05-19 Add/adjust focused tests that lock the symmetric VND amount mapping and shared payload/initial-value helpers before refactor.
- [ ] 2026-05-19 Introduce a neutral shared `expense-entry` form module and move the approved field UI into it without visual redesign.
- [ ] 2026-05-19 Move create/edit form state, initial-value mapping, validation, and submit logic into one shared hook/module.
- [ ] 2026-05-19 Rewire `AddExpenseDialog` and `EditExpensePage` to the shared form implementation and remove the obsolete dual-form stack.
- [ ] 2026-05-19 Run focused verification, final repo verification, and update harness evidence plus plan status.

## Surprises & Discoveries

- Current add flow uses create-only amount helpers in `apps/web/src/components/expense/dialog-amount-helper.ts`: raw digits are displayed as `x.000 đ` and submitted as `digits * 1000`; there is no reverse mapper for edit initialization yet.
- Current edit flow uses `apps/web/src/components/expense/expense-form.tsx` + `apps/web/src/components/expense/use-expense-form.ts`, which is a separate `react-hook-form` stack and currently maps stored `amountMinor` to major units via `toMajorUnits(...)`, so it does not match the add-dialog thousand-shortcut semantics.

## Decision Log

- Decision: Use neutral `expense-entry-*` naming for the shared add/edit implementation.
  Rationale: The implementation is no longer create-only; naming should describe shared ownership and reduce future confusion.
  Date/Author: 2026-05-19 / Orchestrator

- Decision: Preserve the shipped row UI exactly and refactor structure/code only.
  Rationale: The user explicitly approved the current field visuals and asked for code normalization rather than a redesign.
  Date/Author: 2026-05-19 / Orchestrator

- Decision: Keep the edit surface as a page route but reuse the create form internals.
  Rationale: The user wants edit to keep page-level navigation freedom while still sharing the canonical form UI and logic.
  Date/Author: 2026-05-19 / Orchestrator

## Outcomes & Retrospective

- Intended final outcome:
  - One canonical expense-entry form path powers both add and edit.
  - The add dialog still behaves as before from the user perspective.
  - The edit page now visually matches the add dialog fields.
  - Old `expense-form` / `use-expense-form` / `form-fields` dead code is removed.
  - Focused tests, lint, typecheck, and final `./init.sh` pass.

## Context and Orientation

- `apps/web/src/components/expense/add-expense-dialog.tsx`: current smart create shell; already fetches categories, households, profile, and groups, and renders the desktop dialog/mobile drawer shells.
- `apps/web/src/components/expense/add-expense-form.tsx`: current approved row-based presentational UI for amount/content/date/category/source/household/group.
- `apps/web/src/components/expense/use-add-expense-form.ts`: current create-only local-state form logic with validation, payload creation, submit mutation, source persistence, and undo delete flow.
- `apps/web/src/components/expense/dialog-amount-helper.ts`: current create-only VND amount display/submit mapping; must become symmetric for edit.
- `apps/web/src/components/expense/expense-form.tsx`: old create/edit `react-hook-form` entry surface with more fields than the approved canonical add/edit set.
- `apps/web/src/components/expense/use-expense-form.ts`: old create/edit form hook that builds create/update payloads and resets `react-hook-form` state.
- `apps/web/src/views/app/edit-expense-page.tsx`: current edit route view that fetches expense detail and uses `ExpenseForm`.
- `docs/design-docs/2026-05-19-expense-entry-form-unification-design.md`: approved design source for this refactor.
- `harness/features/feat-061.json`: feature record for this shared expense-entry work.

## Standards and Reference Docs

- `docs/FRONTEND.md`
  - Follow feature-local boundaries and keep scope frontend-only.
  - Before code edits, run GitNexus impact for touched symbols.
- `docs/references/frontend/web/project-folder-structure.md`
  - Keep new logic under `apps/web/src/components/expense/` or existing `views/` path.
  - Promote nothing to `components/shared` or `components/ui` unless reuse is proven outside expense entry.
- `docs/references/frontend/web/component-structure-pattern.md`
  - Use named exports.
  - Keep smart shell/query code separate from dumb form rendering.
  - Keep internal subcomponents private.
- `docs/references/frontend/web/form-pattern.md`
  - Prefer one canonical form schema/engine for the shared form path.
  - Render `FieldError`, align `htmlFor`/`id`, and keep validation centralized.
  - If the refactor keeps custom state instead of `react-hook-form`, the shared helper layer must still centralize validation and field defaults in one place; do not keep two form engines after this refactor.
- `docs/references/frontend/web/dialog-and-form-pattern.md`
  - Keep `Dialog` / `Drawer` shells and `FieldGroup > Field > FieldLabel + control + FieldError` composition.
  - Do not add new custom dialog state patterns.
- `docs/references/frontend/web/api-react-query-pattern.md`
  - UI continues to call existing query/mutation hooks only.
  - Do not introduce direct API calls into presentational components.
- `docs/references/frontend/web/naming-and-conventions-pattern.md`
  - Use kebab-case filenames, named exports, `@/` imports, and English comments only.
- `docs/references/frontend/web/i18n-label-pattern.md`
  - Keep all user-facing strings on `t(...)`; add locale keys only if new copy becomes unavoidable.

## Companion Skills During Execution

- `test-driven-development`: mandatory for the amount-helper symmetry and shared form-logic refactor.
- `typescript-reviewer`: mandatory after TypeScript/React changes are staged.
- `requesting-code-review`: use after implementation is functionally complete.
- `verification-before-completion`: use before any completion claim.
- `subagent-driven-development`: recommended if implementation is split into independent tasks (amount helpers/tests vs form migration vs dead-code cleanup).

## Plan of Work (Narrative)

1. Run `gitnexus_impact` upstream checks for the symbols most likely to move or disappear: `AddExpenseDialog`, `EditExpensePage`, and `ExpenseForm`. Record the blast radius and warn if anything returns HIGH/CRITICAL risk before editing.
2. Lock the VND amount behavior with focused tests around `apps/web/src/components/expense/dialog-amount-helper.ts` and/or a renamed shared helper module. Add coverage for these exact cases: `raw "12" -> display "12.000"`, `raw "12" -> payload 12000`, `stored 12000 -> edit raw "12"`, invalid/empty input handling, and unchanged edit amount round-trip.
3. Replace the split form architecture with a neutral shared module, expected as `apps/web/src/components/expense/expense-entry-form.tsx` and `apps/web/src/components/expense/use-expense-entry-form.ts`. Move the approved row-based JSX layout into the neutral form component. Keep the current field visuals, but normalize repetitive classes and field-row organization using small feature-local helpers/constants rather than ad hoc per-field class strings.
4. Centralize shared form state and mapping logic in the new hook/module. It must handle: default values, field updates, validation, create payload creation, edit payload creation, edit initial-state mapping from `ExpenseDTO`, title placeholder behavior, source persistence for create, and submit success/error hooks. Keep container-specific side effects (dialog close vs route push) injectable from the shell so the shared hook stays neutral.
5. Rewire `apps/web/src/components/expense/add-expense-dialog.tsx` to the shared create mode. Preserve the existing desktop/mobile shell split, source persistence, and undo delete behavior. Update any related barrels/imports.
6. Rewire `apps/web/src/views/app/edit-expense-page.tsx` to the shared edit mode. Keep the existing loading/error page shells and expense-detail fetch, but map the fetched expense into the shared initial state using the reverse VND amount helper rather than `toMajorUnits(...)`. Ensure unchanged save submits the original persisted amount.
7. Delete the obsolete `ExpenseForm` stack and any dead `form-fields/*` modules that no longer have consumers. Clean imports/exports so only the new canonical surface remains.
8. Run focused verification first, then repo-required `./init.sh lint`, `./init.sh typecheck`, targeted tests if needed, and final `./init.sh`. Update `docs/exec-plans/index.md`, `harness/features/feat-061.json`, `harness/feature_index.json` status if completed, and `harness/progress.md` with final evidence.

## Concrete Steps (Commands)

Run from repo root `/Users/tungdoan/Projects/Web/household-finance-system` unless noted.

```bash
# pre-edit blast radius
gitnexus_impact(target: "AddExpenseDialog", direction: "upstream", repo: "household-finance-system")
gitnexus_impact(target: "EditExpensePage", direction: "upstream", repo: "household-finance-system")
gitnexus_impact(target: "ExpenseForm", direction: "upstream", repo: "household-finance-system")

# focused frontend verification during implementation
./init.sh lint
./init.sh typecheck

# optional focused test command once the new helper/hook tests exist
pnpm --filter web exec vitest run src/components/expense/*.test.ts

# final repo verification
./init.sh
```

Expected short outputs:

- `gitnexus_impact`: risk summary with direct dependents/processes; proceed directly only on LOW/MEDIUM or after explicit warning if higher.
- `./init.sh lint`: `OK`
- `./init.sh typecheck`: `OK`
- focused Vitest command: passing tests for touched expense-entry helper/hook suites
- `./init.sh`: `Done!`

## Validation and Acceptance

- Happy path:
  - Add-expense still opens in desktop dialog / mobile drawer and shows the approved 7-field UI in the same order.
  - Edit-expense page shows the same approved 7-field UI/order rather than the old generic form layout.
  - Creating an expense with raw input `12` submits `amount = 12000` and succeeds.
  - Editing an existing `amountMinor = 12000` expense shows raw input semantics equivalent to `12.000 đ`, and saving unchanged keeps persisted amount `12000`.
- Validation/error path:
  - Empty/invalid amount, date, category, source, or content still blocks submit with field-level errors.
  - Empty household/group still maps to `private` / no-group correctly.
- Regression checks:
  - Create still persists `quickAddLastSourceKey` and still offers Undo delete in the success toast.
  - Group remains independent from household in both create and edit payload mapping.
  - Edit still routes back to expense detail on success.
- Acceptance artifacts:
  - Passing focused tests for amount symmetry/shared form helpers.
  - Passing `./init.sh lint`, `./init.sh typecheck`, and final `./init.sh`.
  - Updated harness evidence pointing at the new canonical shared form files and dead-code removal.

## Idempotence & Recovery

- Frontend file edits are safe to re-run; no migration or destructive data command is involved.
- If the unification introduces regressions, recovery is a normal code revert of touched frontend files plus restoration of removed modules from git history.
- Deleting dead files should be the last structural step after shells are successfully rewired and tests pass.

## Artifacts and Notes

- Expected implementation artifacts:
  - `apps/web/src/components/expense/expense-entry-form.tsx`
  - `apps/web/src/components/expense/use-expense-entry-form.ts`
  - updated `apps/web/src/components/expense/dialog-amount-helper.ts` or renamed shared amount helper module
  - simplified `apps/web/src/components/expense/add-expense-dialog.tsx`
  - simplified `apps/web/src/views/app/edit-expense-page.tsx`
- Expected removals:
  - `apps/web/src/components/expense/expense-form.tsx`
  - `apps/web/src/components/expense/use-expense-form.ts`
  - obsolete `apps/web/src/components/expense/expense-form-fields.tsx`
  - obsolete `apps/web/src/components/expense/form-fields/*` no longer referenced anywhere
- Harness artifacts to update when implementation lands:
  - `docs/exec-plans/index.md`
  - `harness/feature_index.json`
  - `harness/features/feat-061.json`
  - `harness/progress.md`

## Interfaces & Dependencies

- Existing React Query hooks:
  - `useCreateExpenseMutation`
  - `useUpdateExpenseMutation`
  - `useDeleteExpenseMutation`
  - `useReferenceCategoriesQuery`
  - `useHouseholdsQuery`
  - `useExpenseGroupListQuery`
  - `useCurrentUserProfileQuery`
  - `useUpdateCurrentUserProfileMutation`
- Existing expense/detail view hook:
  - `useExpenseDetailQuery(id?: string)`
- Shared helper contracts expected after refactor:
  - `formatExpenseEntryAmountDisplay(raw: string): string`
  - `parseExpenseEntryAmountToMinor(raw: string): number | null`
  - `mapStoredExpenseAmountToEntryRaw(amountMinor: number): string`
  - `buildExpenseEntryInitialState(...)`
  - `buildExpenseEntryPayload(...)`
- Existing shells that must stay stable:
  - `AddExpenseDialog` open/close API from `apps/web/src/components/expense/add-expense/provider.tsx`
  - `EditExpensePage` route navigation to `/expenses/[id]`
