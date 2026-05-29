# Product Direction V2

Owner: product
Update trigger: when core product positioning or expense semantics change again

## Why this doc exists

This doc records the product-direction shift from `v1` to `v2`.

`v1` and `v2` here mean product-model direction, not release tags.

Use this doc when:

- checking why `PRODUCT.md` and `PRODUCT.vi.md` changed
- aligning feature specs with the current product truth
- reviewing old implementation decisions that still assume the old model

## Short summary

`v1` treated the product as household-first, with explicit privacy/visibility modes and separate payer/creator roles.

`v2` treats the product as a spending-recording tool for both personal and household finance. The base record is still the user's own expense. `Household` and `Group/Event` are extra contexts that can be attached independently.

## Direction change

### 1. Product positioning

`v1`

- Household-first
- Personal use was secondary
- Main story was shared family finance

`v2`

- Personal and household side by side
- Single-player use is first-class
- Household is an optional collaboration layer

### 2. Expense ownership model

`v1`

- Separate `creator` and `payer`
- Product logic assumed they may differ

`v2`

- The spender records the expense
- No first-class `payer vs creator` split in the product model

### 3. Visibility model

`v1`

- Explicit `private` vs `household/public` style visibility mode

`v2`

- No separate visibility mode
- The real rule is:
  - no household attached => personal expense
  - household attached => visible to that household

### 4. Household semantics

`v1`

- Household was close to the product center of gravity
- Household sharing felt like the default product story

`v2`

- Household is just one classification/context axis
- It answers: "Is this expense part of household finance?"

### 5. Group semantics

`v1`

- Grouping existed, but the relationship to household was easier to misread or blur

`v2`

- Group/Event is explicitly independent from household
- It answers: "What purpose, event, or context does this expense belong to?"

### 6. Default create flow

`v1`

- New expense defaulted into a private/visibility model
- Product language emphasized privacy choice

`v2`

- New expense defaults to:
  - no household
  - no group
- User adds household and/or group only when needed

## Canonical v2 examples

- Wedding attendance expense:
  - personal base record
  - may be attached to a household
  - may also be tagged to a `Wedding` group

- Travel expense:
  - solo trip => no household
  - family trip => attach household
  - both may use a `Travel` group

- Haircut:
  - personal expense
  - no household
  - no group

## Practical implications

Specs, copy, and UI should stop assuming:

- family-first positioning
- `private/public` as the main mental model
- `payer` and `creator` as separate user-facing concepts
- group depending on household

Specs, copy, and UI should now assume:

- one expense starts as the user's own record
- household is optional shared context
- group is optional event/context grouping
- household and group are independent axes

## Follow-up alignment targets

Likely docs/specs to review after this direction change:

- `docs/product-specs/expense-spender-model.md` (thay thế `expense-ownership.md` — spender là canonical owner, không phải payer/creator)
- `docs/product-specs/expense-household-context.md` (thay thế `data-visibility.md` — không có privacy mode, chỉ có personal vs household-attached)
- `docs/product-specs/expense-grouping.md`
- `docs/product-specs/expense-tracking.md`
- any UI copy or backend contract that still exposes `payer`, `creator`, or `private/public` as product-truth concepts

## Current source of truth

For the current high-level product definition, use:

- `docs/PRODUCT.vi.md`
- `docs/PRODUCT.md`
