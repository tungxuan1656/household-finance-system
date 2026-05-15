# Add Expense Dialog Domain and UI Design

## Status

- Owner: Orchestrator
- Date: 2026-05-15
- Status: Proposed
- Update trigger: Any change to expense-create entry UX, amount-entry semantics, group/household domain semantics, or source contract.

## Goal

Replace both the current quick-add expense flow and the dedicated add-expense page with one canonical `AddExpenseDialog` flow that is compact, mobile-first, shadcn-first, and domain-correct for the updated product model.

## Why

- The current create surface is split across quick-add and a dedicated add-expense page.
- The quick-add form layout no longer matches the desired UX.
- The current amount field is vulnerable to float parsing / rounding mismatch in VND.
- The current `group` concept is coupled to household scope, but product direction now requires `group` to be an independent personal tag.
- The current category picker has a nested-dialog rendering/positioning bug when used inside a dialog.

## Scope

In scope:

- New `AddExpenseDialog` component and supporting feature-local subcomponents.
- Remove `QuickAddExpenseDialog` and dedicated add-expense page/route after replacement is complete.
- Migrate all add-expense CTAs to open the new dialog.
- Redesign expense-create form layout and field set.
- Add dialog-only custom VND amount input with thousand-shortcut semantics.
- Fix amount mismatch bug in the dialog create path.
- Change `group` semantics to be independent from `household`.
- Update frontend/backend contracts, handlers, queries, and docs to match.
- Replace generic e-wallet source contract with specific sources: `momo`, `zalo-pay`, `shopee-pay`.
- Fix category picker behavior inside dialog nesting.

Out of scope:

- Reworking edit-expense flow unless required for contract parity.
- Adding offline capture, draft persistence, or background retry.
- Creating a second personal-tag concept separate from `group`.

## Product Decisions

### Canonical expense-create entry

- Expense creation has one canonical entry surface: `AddExpenseDialog`.
- The dedicated add-expense page and `/expenses/new` route are removed after migration.
- All UI entry points that currently navigate to add-expense must instead open `AddExpenseDialog`.

### Form fields

Required user-facing fields in the dialog:

1. Amount
2. Date
3. Source
4. Category
5. Title (label changed to `Nội dung`)
6. Household
7. Group

Removed from this create flow UI:

- Note
- Payer selector
- Visibility switch

### Household semantics

- Household controls visibility/share scope.
- Household select label: `Gia đình`.
- Default option: `Không`.
- `Không` means:
  - `visibility = private`
  - `householdId = undefined`
- Selecting a household means:
  - `visibility = household`
  - `householdId = selected household id`

### Group semantics

- Group is an independent tag concept.
- Group select label: `Nhóm`.
- Default option: `Không`.
- Group does not depend on household selection.
- A transaction may have:
  - only group
  - only household
  - both household and group
  - neither

This product decision overrides the old household-scoped group assumption. Docs, API, validation, and data queries must align with this new model.

### Payer semantics

- No payer chooser is shown in the dialog.
- Create submit must always send `payerUserId = current user id` when the create contract still accepts payer.
- If backend create contract should not accept `payerUserId`, then backend must derive payer from authenticated user consistently and frontend must stop sending it. Pick one contract and make it consistent across web + worker.

### Source contract

The system keeps a fixed frontend/backend source catalog, but updates its values:

- `cash`
- `bank-transfer` (display label: `CK Ngân hàng`)
- `card`
- `momo`
- `zalo-pay`
- `shopee-pay`
- `other`

`e-wallet` is removed from the selectable/source contract path and replaced by the specific wallet keys above.

## UX and Layout

### Layout order

Desktop/tablet (`sm+`):

- Row 1: `Số tiền | Ngày`
- Row 2: `Nguồn tiền | Danh mục`
- Row 3: `Nội dung`
- Row 4: `Gia đình | Nhóm`

Mobile:

- Same order, stacked to one column.

### UI rules

- Use shadcn primitives directly.
- Use `FieldGroup > Field > FieldLabel + control + FieldError` composition.
- Use primitive props before custom styling.
- Text-like inputs use `size='sm'` where supported.
- `Source`, `Household`, and `Group` use native select.
- `Category` keeps custom picker/icon behavior, but its popover/dialog behavior must be corrected for use inside `Dialog`.

## Amount Input Design

### Problem

The current amount input uses numeric input + float parsing on web and currency-based rounding on worker. For VND this can produce mismatches between typed value, displayed value, and stored minor units.

### New dialog-only behavior

The new amount input behavior applies only inside `AddExpenseDialog`.

- Use a custom text input, not `type='number'`.
- Accept digits only.
- Display using mono/tabular number styling.
- UI uses thousand-shortcut entry:
  - typing `3` means `3.000 đ`
  - typing `30` means `30.000 đ`
  - typing `300` means `300.000 đ`
- The displayed value is a presentation value only.
- The canonical form submit value must be the real VND amount:
  - UI raw digits `3` => canonical amount `3000`

### Canonical value rule

- The dialog amount field must normalize to an integer VND amount before submit.
- The dialog create path must not rely on float math.
- The create payload that leaves web must already represent the intended VND amount exactly.
- The worker must store the exact intended amount without accidental second scaling or float rounding drift.

### Validation rule

- For the dialog flow, the amount must be a positive integer after VND normalization.
- Empty or zero-like input is invalid.
- Non-digit input is rejected at the UI layer.

## Category Picker Nested Dialog Fix

### Problem

The current category picker misbehaves when nested inside a dialog: options may fail to appear or position incorrectly.

### Design requirement

- The category picker must work reliably inside `AddExpenseDialog`.
- It must render above the dialog content correctly and position predictably.
- It must remain keyboard-usable and accessible.

### Implementation constraint

- Keep the category picker experience/icon affordance.
- Fix the overlay/container/composition issue instead of downgrading category to a plain native select.
- If the current picker primitive is incompatible with nested dialog composition, replace its internals with a shadcn-compatible overlay composition while preserving the category-specific feature API.

## Architecture and File Structure

Follow `FRONTEND.md` and feature-local boundaries.

### Public feature surface

- `components/expense/add-expense-dialog.tsx`

### Feature-local subcomponents/helpers

Suggested structure:

```text
components/expense/
  add-expense-dialog.tsx                # feature smart component
  add-expense/
    add-expense-form.tsx                # presentational form shell
    add-expense-amount-field.tsx        # dialog-only VND shortcut input
    add-expense-source-field.tsx
    add-expense-household-field.tsx
    add-expense-group-field.tsx
    add-expense-submit-error.tsx
    add-expense-defaults.ts
    add-expense-mappers.ts
    add-expense-formatters.ts
```

Rules:

- `add-expense-dialog.tsx` owns orchestration, queries, mutation wiring, success/error handling, and open/close/reset behavior.
- `add-expense-form.tsx` is presentational: props in, JSX out.
- Amount parsing/formatting/normalization helpers stay feature-local unless reused elsewhere.
- Do not introduce new domain-aware shared components unless reuse is real.

## API / Domain Alignment

### Expense create contract

Expense create flow must align on these semantics:

- household independent from group
- group optional regardless of household selection
- amount canonicalized correctly for dialog shortcut input
- source uses new wallet-specific keys

### Group API/domain changes

Current household-scoped group behavior is no longer product truth.

Required alignment areas:

- DTOs
- create/update expense validation
- expense list/detail serialization
- group list queries used by create flow
- filter/query behavior
- summaries/analytics assumptions where relevant
- docs and tests

If data model/migrations are needed to decouple group from household, plan them explicitly in the implementation plan.

## Docs That Must Be Updated

- `docs/product-specs/quick-add-experience.md`
- `docs/product-specs/expense-tracking.md`
- `docs/product-specs/expense-grouping.md`
- any product spec that still states payer selection is required in create flow
- any docs or plans that state group is household-scoped or that add-expense page remains a canonical surface

If existing design docs/index need to point to this design, add it as proposed until implemented.

## Migration / Removal

After the new dialog works and all entry points are migrated:

- Remove `QuickAddExpenseDialog` and quick-add-specific expense create UI files.
- Remove add-expense page view and route.
- Remove or update path constants and PWA shortcuts that point to `/expenses/new`.
- Ensure all prior add-expense CTAs now open the dialog instead of navigating.

## Verification Requirements

- Focused tests for amount normalization/parsing helpers.
- Focused tests for updated source contract helpers/schemas.
- Focused tests for any group-domain mapping/validation helpers changed in web or worker.
- Manual/browser verification for:
  - dialog open from all migrated CTAs
  - category picker inside dialog
  - amount shortcut display and submit correctness
  - private expense with group only
  - household expense with no group
  - household expense with group
- Final repo verification follows standard init workflow.

## Open Implementation Notes

- The old create payload mismatch around `payerUserId` vs worker create schema must be resolved, not preserved.
- The amount bug investigation should inspect both web normalization and worker minor-unit conversion to prevent double-scaling.
- The implementation plan should explicitly sequence domain/data changes before UI removal so the final migration is safe.
