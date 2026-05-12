# Shared Forms/Dialogs Primitive Rollout Design

Date: 2026-05-12
Status: Proposed
Related features: `feat-048`, `feat-049`, `feat-051`
Related plans completed: `docs/exec-plans/plans/2026-05-12-design-system-contract-hardening.md`, `docs/exec-plans/plans/2026-05-12-base-primitive-expansion.md`

## 1. Objective

Define the first rollout phase that migrates real app consumers onto the hardened V2.1 primitive contract so shared dialog/form flows can be composed with `variant`, `size`, `surface`, and `tone` instead of page-level visual override classes.

This phase intentionally targets **shared forms/dialogs first** because they are high-reuse, high-visibility patterns and already benefited from the primitive expansion work completed earlier on 2026-05-12.

## 2. Problem Statement

The project now has:

- a hardened design contract in `docs/design-docs/design-system.md`
- a hardened consumption contract in `docs/design-docs/ui-implementation-rules.md`
- expanded core primitives in `apps/web/src/components/ui`

But most app consumers have **not** yet been migrated to that contract. Many screens and shared flows may still express visual intent with call-site classes such as:

- `bg-*`
- `text-*` on primitive-owned slots
- `border-*`
- `rounded-*`
- `shadow-*`
- `backdrop-blur-*`
- primitive-internal spacing overrides used to restyle the primitive contract

Without a focused rollout phase, the system remains partially standardized: primitives are ready, but consumers still leak visual decisions into feature code.

## 3. Goals

### Primary goals

1. Migrate shared dialog/form/select-like consumers to the primitive-first contract.
2. Remove common page-level visual overrides from the selected rollout scope.
3. Establish canonical migrated examples that later domain rollouts can copy.
4. Preserve compatibility and avoid broad redesign while increasing contract adoption.

### Secondary goals

1. Identify any remaining high-frequency rollout blockers.
2. Allow very small primitive follow-ups only when needed to unblock migration.
3. Produce an exception list for patterns intentionally deferred to later phases.

## 4. Non-Goals

This phase does **not** include:

- a big-bang full-app rewrite
- marketing / landing / public-page polish
- dashboard/stat-card restyling outside form/dialog patterns
- broad primitive redesign
- adding large new variant matrices
- domain-specific polish unrelated to shared dialog/form patterns

## 5. Scope

### In scope

The rollout will audit and migrate consumers in these pattern families:

1. **Dialog shells**
   - `DialogContent`
   - `AlertDialog` consumers where contract migration is relevant
   - drawer/sheet-like shared overlays where they behave as form containers

2. **Shared form structures**
   - form sections
   - field rows
   - field group wrappers
   - dialog-embedded forms

3. **Selection controls**
   - `Select`
   - `NativeSelect`
   - `Combobox`

4. **Form feedback states**
   - `Alert`
   - `Empty`
   - validation or helper states around form flows

5. **Small primitive follow-ups** only when rollout is blocked by a missing common preset
   - one small additive `size`, `variant`, `surface`, or `tone`
   - one small consistency fix in primitive data attributes or geometry contract
   - one small compatibility-safe behavior refinement

### Out of scope

- page-wide domain modernization beyond shared form/dialog patterns
- broad card-grid or dashboard migration
- new aesthetic exploration beyond V2.1
- primitive API expansion driven by hypothetical future needs

## 6. Recommended Approach

Use a **pattern-first rollout**.

### Why not a component-class sweep

A direct sweep across every matching consumer would maximize churn before canonical usage patterns are stable. That increases review cost and makes it harder to tell whether issues belong to primitives or consumers.

### Why not audit-only

An inventory-only phase would improve visibility, but it would delay real adoption and leave no concrete migrated examples for follow-on work.

### Why pattern-first is preferred

Pattern-first rollout balances delivery and safety:

1. audit by reusable pattern rather than by page
2. migrate a small number of representative consumers per pattern
3. tighten primitives only if a concrete migration is blocked
4. document canonical usage from actual code, not theory

This creates a stable bridge between the primitive contract and later domain-by-domain rollout.

## 7. Design Rules for This Rollout

### 7.1 Consumer rule

Consumers in scope must express visual intent through primitive props first:

- `variant`
- `size`
- `surface`
- `tone`

If the primitive cannot express a required common case, the rollout may add a **small additive primitive follow-up** rather than reintroducing consumer-side visual overrides.

### 7.2 Allowed call-site customization

Call sites may still use layout-only concerns defined by the hardened contract, such as:

- width / height / min / max constraints
- responsive layout
- placement in flex/grid flows
- margins for placement
- position / order / visibility

### 7.3 Disallowed migration outcome

The rollout is considered incomplete for a migrated consumer if it still relies on primitive-restyling classes like:

- `bg-*`
- `border-*`
- `rounded-*`
- `shadow-*`
- `backdrop-blur-*`
- internal spacing overrides used to change primitive surface or density semantics
- `text-*` on primitive roots or primitive-defined slots when the purpose is to restyle the primitive contract

## 8. Primitive Follow-Up Guardrails

Small primitive follow-ups are allowed, but only under strict limits.

### Allowed

- add one missing common preset discovered during migration
- align one shared geometry/surface rule across a primitive family
- add inspectability support such as a missing `data-*` contract attribute
- fix one compatibility-safe contract mismatch

### Not allowed

- re-open primitive architecture
- redesign component visuals from scratch
- add speculative variants “just in case”
- introduce page-specific variants into shared primitives

## 9. Migration Sequence

### Phase A — Audit

Create a scoped inventory of shared dialog/form consumers still using visual override classes. Group findings by pattern, not just by file.

Expected outputs:

- dialog shell override list
- form control override list
- select-family override list
- feedback-state override list
- shortlist of representative consumers to migrate first

### Phase B — Representative migrations

For each pattern family, migrate 2–4 representative consumers:

1. choose high-reuse or high-visibility examples
2. replace visual override classes with primitive props
3. keep behavior unchanged unless the plan explicitly allows a tiny primitive follow-up
4. add or update tests where contract usage should be asserted

### Phase C — Canonicalization

After the first migrated examples are stable:

- identify the preferred usage pattern for each family
- capture exceptions that still need later work
- use those examples as rollout references for later domain plans

## 10. Acceptance Criteria

This design is successful when all of the following are true inside the chosen rollout scope:

1. Shared dialog/form/select consumers no longer restyle primitives with page-level visual classes for common color, border, radius, shadow, blur, or internal spacing decisions.
2. Migrated consumers rely on primitive props (`variant`, `size`, `surface`, `tone`) for those decisions.
3. Any primitive follow-up introduced during rollout is:
   - additive
   - small
   - compatibility-safe
   - directly justified by an actual migration blocker
4. The rollout leaves behind canonical migrated examples for later teams/phases.
5. Deferred exceptions are explicitly listed rather than silently left inconsistent.
6. Full verification passes before completion.

## 11. Risks and Mitigations

### Risk 1 — Primitive drift reopens

If rollout teams add too many follow-up presets, this phase becomes a second primitive redesign.

**Mitigation:** require every primitive follow-up to be tied to a real migrated consumer and keep changes additive/minimal.

### Risk 2 — Overly broad migration scope

If too many screens are migrated at once, review quality drops and regression risk rises.

**Mitigation:** keep this phase pattern-first and representative, not app-wide.

### Risk 3 — Consumer-specific hacks return

Developers may be tempted to keep old shell classes for speed.

**Mitigation:** treat remaining visual override classes as explicit migration failures inside the chosen scope.

### Risk 4 — Pattern mismatch between primitives and real usage

Some real-world consumers may expose one or two missing presets not seen during primitive expansion.

**Mitigation:** allow tiny primitive follow-ups, but only for proven repeated needs.

## 12. Expected Deliverables

1. One ExecPlan for the rollout phase.
2. Migrated shared dialog/form/select consumers.
3. Tests proving contract-based usage in representative consumers.
4. Any tiny primitive follow-ups needed to unblock migration.
5. Progress/harness evidence documenting what was migrated and what remains deferred.

## 13. Recommendation

Proceed with a new execution plan for:

**Shared forms/dialogs rollout with migration + small primitive follow-ups**

This is the smallest next step that turns the newly standardized primitive system into real consumer usage, while avoiding another high-risk app-wide rewrite.
