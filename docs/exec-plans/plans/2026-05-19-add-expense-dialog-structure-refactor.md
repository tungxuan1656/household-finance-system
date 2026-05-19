# Title

Refactor add-expense dialog into bounded form and logic modules.

## Purpose / Big Picture

This change keeps the canonical add-expense behavior stable while making `apps/web/src/components/expense/add-expense-dialog.tsx` easier to maintain. Users should still see the same desktop dialog, mobile drawer, validation, submit flow, and undo toast, but the implementation will split rendering and state/mutation orchestration into clearer feature-local boundaries.

## Scope

- In scope:
  - `apps/web/src/components/expense/add-expense-dialog.tsx`
  - `apps/web/src/components/expense/add-expense-form.tsx`
  - `apps/web/src/components/expense/use-add-expense-form.ts`
  - Small feature-local helper/type cleanup in `apps/web/src/components/expense/*` if needed to support the split.
  - Harness and planning records required by repo policy.
- Out of scope:
  - Product behavior changes to expense creation.
  - Backend contracts, payload schema, or worker logic.
  - New copy, new i18n keys, or new shared components.
  - Converting the form to `react-hook-form`/`zod` during this refactor.

## Non-negotiable Requirements

- The plan is self-contained and names exact files/commands.
- The refactor must preserve observable add-expense behavior across desktop and mobile shells.
- Validation, source persistence, submit success toast, and undo delete flow must remain intact.
- New modules stay feature-local under `apps/web/src/components/expense/`; no promotion to `components/shared` or `components/ui`.

## Progress

- [x] 2026-05-19 Confirm current `AddExpenseDialog` blast radius with GitNexus upstream impact before edits.
- [x] 2026-05-19 Split form rendering into `apps/web/src/components/expense/add-expense-form.tsx` with presentational-only props.
- [x] 2026-05-19 Extract form state/reset/validate/submit orchestration into `apps/web/src/components/expense/use-add-expense-form.ts`.
- [x] 2026-05-19 Simplify `apps/web/src/components/expense/add-expense-dialog.tsx` to query orchestration + responsive shell composition.
- [x] 2026-05-19 Run focused verification for touched frontend files, then repo-required final checks and harness updates.

## Surprises & Discoveries

- `gitnexus_impact` for `AddExpenseDialog` returned LOW risk with 0 direct dependents and 0 affected processes.
- A focused pure-logic seam was enough for TDD without adding forbidden component render tests: `apps/web/src/components/expense/use-add-expense-form.test.ts` covers initial-state, validation, and payload mapping helpers.

## Decision Log

- Decision: Keep this as a feature-local refactor rather than a larger folder/barrel redesign.
  Rationale: The dialog already belongs to one expense feature and does not justify a broader public surface change; the main problem is mixed concerns inside one file.
  Date/Author: 2026-05-19 / Orchestrator

- Decision: Do not convert the form to `react-hook-form` + `zod` in the same change.
  Rationale: `docs/references/frontend/form-pattern.md` is the preferred pattern for new/reworked forms, but this task is a structure refactor with explicit behavior preservation and light cleanup only. Mixing a form-library migration would enlarge scope and risk.
  Date/Author: 2026-05-19 / Orchestrator

## Outcomes & Retrospective

- `apps/web/src/components/expense/add-expense-dialog.tsx` is now a smaller smart orchestrator.
- `apps/web/src/components/expense/add-expense-form.tsx` owns the presentational field tree and submit form wrapper.
- `apps/web/src/components/expense/use-add-expense-form.ts` owns reset, validation, payload assembly, submit side effects, and reusable pure helpers.
- Focused test, lint, typecheck, and final full `./init.sh` all passed.

## Context and Orientation

- `apps/web/src/components/expense/add-expense-dialog.tsx`: current canonical create-expense surface; currently mixes data fetching, derived options, form state, validation, responsive shell rendering, submit mutation side effects, and undo toast behavior.
- `apps/web/src/components/expense/category-picker.tsx`: existing feature-local category selector used by the dialog form.
- `apps/web/src/components/expense/source-picker.tsx`: existing feature-local source selector used by the dialog form.
- `apps/web/src/components/expense/dialog-amount-helper.ts`: existing amount formatting/parsing helper the form must continue to use.
- `apps/web/src/components/expense/form-fields/field-helpers.ts`: existing occurred-at/title placeholder helpers the form must continue to use.
- `harness/features/feat-060.json`: canonical feature record covering the add-expense dialog domain.

## Standards and Reference Docs

- `docs/FRONTEND.md`
  - Split near 200 lines or when 3+ concerns mix.
  - Feature smart component owns one bounded concern; dumb components are presentational only.
- `docs/references/frontend/project-folder-structure.md`
  - Keep new files under `apps/web/src/components/expense/`.
  - Do not promote feature logic to shared/UI layers.
- `docs/references/frontend/component-structure-pattern.md`
  - Use named exports.
  - Keep internal subcomponents private.
- `docs/references/frontend/frontend-component-architecture-guide.md`
  - Smart component may own hooks/mutations/state; presentational component receives props only.
- `docs/references/frontend/dialog-and-form-pattern.md`
  - Keep shadcn dialog/drawer primitives and `Field`/`FieldGroup` layout.
- `docs/references/frontend/naming-and-conventions-pattern.md`
  - Use kebab-case files, named exports, and `@/` imports.
- `docs/references/frontend/api-react-query-pattern.md`
  - UI continues to call hooks only; no direct API import introduction.

## Plan of Work (Narrative)

1. Run `gitnexus_impact` on `AddExpenseDialog` to confirm blast radius and check whether a refactor warning is needed before edits.
2. Create `apps/web/src/components/expense/add-expense-form.tsx` as a presentational component that renders the existing field layout, `FieldRow`, and submit form wrapper. Keep it free of API/query/mutation logic; it should receive current form state, derived options, display strings, field setter, errors, and submit handler via props.
3. Create `apps/web/src/components/expense/use-add-expense-form.ts` to own the current `useState`, reset-on-open effect, field updates, validation, payload assembly, create mutation success/error handling, profile source persistence, and undo toast side effects. Keep helper types feature-local and export only what the dialog needs.
4. Shrink `apps/web/src/components/expense/add-expense-dialog.tsx` into a smart orchestrator that fetches categories/households/groups/profile, derives form options, calls `useAddExpenseForm`, and renders the current mobile drawer / desktop dialog shells with shared action wiring.
5. Run focused validation for the touched frontend files, then repo-required final checks, then update `harness/features/feat-060.json` and `harness/progress.md` with concise evidence for this refactor follow-up.

## Concrete Steps (Commands)

Run from repo root `/Users/tungdoan/Projects/Web/household-finance-system` unless noted.

```bash
# inspect impact before edits
gitnexus_impact(target: "AddExpenseDialog", direction: "upstream", repo: "household-finance-system")

# focused static verification after edits
./init.sh lint
./init.sh typecheck

# final repo verification
./init.sh
```

Expected short outputs:

- `gitnexus_impact`: risk summary plus direct dependents/processes, ideally LOW/MEDIUM for this frontend-local refactor.
- `./init.sh lint`: `OK`
- `./init.sh typecheck`: `OK`
- `./init.sh`: `Done!`

## Validation and Acceptance

- Happy path:
  - Opening the add-expense surface still shows amount, content, date, category, source, household, and group fields in the same order.
  - Desktop still uses `Dialog`; mobile still uses bottom `Drawer`.
  - Successful submit still closes the surface, persists `quickAddLastSourceKey`, and shows the success toast with Undo.
- Validation/error path:
  - Empty or invalid amount/title/date/category/source still produces the same field-level errors.
- Regression checks:
  - Household selection still affects visibility payload and household-group query merge behavior.
  - Undo still calls the delete mutation for the created expense.
- Acceptance artifacts:
  - Passing `./init.sh lint`, `./init.sh typecheck`, and final `./init.sh`.
  - Updated harness evidence pointing at the split files.

## Idempotence & Recovery

- File edits are safe to re-run; this is a frontend-only refactor with no migration/destructive commands.
- If the extraction causes regressions, recovery is a normal code revert of the touched frontend files.

## Artifacts and Notes

- Expected implementation artifacts:
  - `apps/web/src/components/expense/add-expense-form.tsx`
  - `apps/web/src/components/expense/use-add-expense-form.ts`
  - Simplified `apps/web/src/components/expense/add-expense-dialog.tsx`
- Expected harness artifacts:
  - Updated `harness/features/feat-060.json`
  - New top entry in `harness/progress.md`

- Verification evidence captured during implementation:
  - `pnpm --filter web exec vitest run src/components/expense/use-add-expense-form.test.ts` → 6 tests passed.
  - `./init.sh lint` → `OK`
  - `./init.sh typecheck` → `OK`
  - `./init.sh` → `Done!`

## Interfaces & Dependencies

- React hooks: `useEffect`, `useMemo`, `useState` (or only what remains needed after extraction).
- Expense hooks: `useCreateExpenseMutation`, `useDeleteExpenseMutation`, `useExpenseGroupListQuery`.
- Profile hooks: `useCurrentUserProfileQuery`, `useUpdateCurrentUserProfileMutation`.
- Reference/household hooks: `useReferenceCategoriesQuery`, `useHouseholdsQuery`.
- Helper contracts:
  - `formatDialogAmountDisplay(value: string): string`
  - `parseDialogAmountSubmitMinor(value: string): number | null`
  - `formatOccurredAtDate(timestamp: number): string`
  - `parseOccurredAtDate(value: string): string | null`
  - `getExpenseTitlePlaceholder(categoryKey?: CategoryKey): string`
- Request contract:
  - `CreateExpenseRequest`
