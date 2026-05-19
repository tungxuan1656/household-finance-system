# Expense Entry Form Unification Design

## Status

- Owner: Orchestrator
- Date: 2026-05-19
- Status: Proposed
- Update trigger: Any change to add/edit expense field set, amount-entry semantics, or shared form/component boundaries.

## Goal

Unify add-expense and edit-expense on one canonical expense-entry form while preserving the approved row-by-row UI styling already shipped in the current add-expense dialog.

## Why

- Current add and edit flows are split across two different form systems.
- `AddExpenseForm` UI is visually close to the desired result, but the code organization is inconsistent and noisy.
- `EditExpensePage` does not match the approved add-expense UX.
- The current VND thousand-shortcut amount behavior is create-centric and must become symmetric for edit.

## Scope

In scope:

- Replace the current split add/edit form implementations with one shared expense-entry form.
- Reuse the approved add-expense field visuals for edit.
- Normalize form helpers, field-row composition, right-side control styling, and native-select organization.
- Remove dead code left from the old split form architecture.
- Make VND amount normalization reversible so edit initializes and submits correctly.

Out of scope:

- Visual redesign of the approved field appearances.
- Bringing back note, payer, or visibility into this surface.
- Product/domain changes outside the existing add/edit expense field set.

## Locked UI Decision

- The current per-field visual styling from the shipped add-expense dialog is the canonical UI.
- This refactor is allowed to clean up structure, naming, and reuse.
- This refactor must not redesign field visuals unless required for a bug fix.

## Product Decisions

### Canonical field set

Both create and edit use the same 7 user-facing fields in the same order:

1. Amount
2. Content
3. Date
4. Category
5. Source
6. Household (`Gia đình`)
7. Group (`Nhóm`)

Removed from this canonical add/edit surface:

- Note
- Payer
- Visibility

### Visibility derivation

- No household selected => submit `visibility = private`.
- Household selected => submit `visibility = household` and include `householdId`.
- Visibility is derived state, not a visible field.

### Group behavior

- Group remains optional and independent from household.
- Edit must preserve and allow changing/removing the current group using the same surface as create.

## Architecture Decision

### Canonical component naming

Use neutral naming that reflects shared create/edit ownership:

- `expense-entry-form.tsx`
- `use-expense-entry-form.ts`

Wrappers stay purpose-specific:

- `add-expense-dialog.tsx` => create shell
- `edit-expense-page.tsx` => edit shell

### Responsibility split

`ExpenseEntryForm`:

- presentational shell for the 7-field layout
- mode-aware labels/button copy only
- no data fetching
- no mutation ownership

`useExpenseEntryForm`:

- canonical form state
- create/edit initial-value mapping
- validation
- payload construction
- amount normalization helpers
- submit orchestration for create/edit modes

Shells (`AddExpenseDialog`, `EditExpensePage`):

- fetch categories / households / groups / expense detail
- map query data into form options / initial values
- own container-specific success navigation/close behavior

## Code Normalization Rules

### Field row primitive

Introduce one reusable row primitive for the approved layout.

Rules:

- icon is optional, not required by API shape
- shared left-label region width stays consistent
- shared right-control slot handles alignment and width rules
- inline error placement stays consistent for every field

### Shared control styling

Create one small style layer for right-side controls so text inputs, date input, pickers, and native selects stop duplicating class strings.

Normalize:

- right-aligned text input classes
- borderless/transparent field look
- small-size control rules
- native-select label classes

Do not create a heavyweight design-system abstraction. Keep it feature-local unless real reuse appears outside expense entry.

### Native select consistency

All native-select fields in this feature should follow one organization pattern:

- same wrapper component usage
- same class application path
- same empty-option handling
- same right-aligned label behavior

## Amount Semantics Design

### Current truth

The approved UX is VND thousand-shortcut entry:

- user types `12`
- UI communicates `12.000 đ`
- submit payload amount becomes `12000`

### Problem to solve

This currently works mainly for create. Edit must map persisted amount back into the same shortcut model without double scaling or under-scaling.

### Canonical internal rule

The shared form must keep a raw input model that represents thousand-shortcut digits, not persisted minor units.

For the current VND-only UI behavior:

- raw input `12` => displayed `12.000 đ`
- raw input `12` => submit amount `12000`
- persisted amount `12000` => edit initial raw input `12`

### Required helper symmetry

The amount helper layer must support both directions:

- raw digits -> display text
- raw digits -> submit amount
- persisted amount -> edit raw digits

This symmetry is mandatory. No container may apply extra `* 1000` or reverse logic ad hoc.

### Edit safety rule

Editing an expense and saving without changing the amount must preserve the same persisted amount.

Example:

- stored amount `12000`
- edit form initializes as raw `12`
- user saves unchanged
- payload remains `12000`

## Edit Page Decision

- `EditExpensePage` remains a dedicated page route.
- The page uses the shared canonical form component instead of the old `ExpenseForm` stack.
- The page keeps page-level loading/error shells and detail fetch behavior.
- Only the form implementation changes.

## Migration / Cleanup Plan

Expected cleanup after unification:

- remove the old `expense-form.tsx`
- remove `use-expense-form.ts`
- remove obsolete `expense-form-fields.tsx`
- remove obsolete `form-fields/*` modules that no longer have consumers
- remove or replace old amount helpers that encode create-only behavior in the wrong layer
- update exports/imports to point at the new canonical form surface

## Risks

### Highest risk: amount regression

Possible failure modes:

- `12000` displayed as `12` instead of `12.000 đ`
- unchanged edit save becomes `12000000`
- unchanged edit save becomes `12`

Mitigation:

- centralize all amount mapping in one helper layer
- add focused tests for create parse/format and edit reverse-mapping

### Medium risk: silent behavior drift during form merge

Possible failure modes:

- create loses undo behavior
- last-source persistence breaks
- group/household option sets diverge between create and edit

Mitigation:

- keep dialog/page wrappers responsible only for shell-specific side effects
- test the shared pure mapping/validation helpers

## Acceptance Criteria

- Add dialog and edit page render the same approved field visuals and order.
- Edit uses the same canonical form component as create.
- Amount shortcut semantics are symmetric between create and edit.
- Saving an unchanged edited amount preserves the stored amount exactly.
- Native-select fields are organized consistently in code.
- Dead code from the old dual-form architecture is removed.

## Implementation Notes

- Prefer structure cleanup over new abstractions.
- Keep abstractions feature-local unless another feature already needs them.
- Use neutral naming (`expense-entry`) instead of create-only naming where ownership is shared.
