# Shared forms/dialogs primitive rollout

## Purpose / Big Picture

This plan migrates the first real set of app consumers onto the hardened V2.1 primitive contract by targeting shared dialogs, form flows, selection controls, and form feedback states. End users should observe no intentional behavior regressions, but the migrated flows should stop relying on page-level visual override classes for primitive styling and instead express common visual choices through built-in primitive props like `size`, `variant`, `surface`, and `tone`.

This is the first rollout phase after the completed contract-hardening and primitive-expansion work. It turns the design-system contract from documentation plus primitive capability into actual feature-code adoption, while allowing only tiny primitive follow-ups when a real migrated consumer is blocked by a missing common preset.

## Scope

- Files, modules, and areas expected to change:
  - `apps/web/src/components/household/*dialog*.tsx`
  - `apps/web/src/components/expense/*dialog*.tsx`
  - `apps/web/src/components/**/form*.tsx`
  - `apps/web/src/components/**/field*.tsx`
  - `apps/web/src/components/ui/dialog.tsx`
  - `apps/web/src/components/ui/drawer.tsx`
  - `apps/web/src/components/ui/select.tsx`
  - `apps/web/src/components/ui/native-select.tsx`
  - `apps/web/src/components/ui/combobox.tsx`
  - `apps/web/src/components/ui/alert.tsx`
  - `apps/web/src/components/ui/empty.tsx`
  - `apps/web/src/components/ui/primitive-styles.ts`
  - representative consumer tests under `apps/web/src/components/**/*.test.tsx`
  - optional scope-local supporting files such as feature-local component barrels or small helper files under `apps/web/src/components/<feature>/`
  - plan/harness artifacts: `docs/exec-plans/index.md`, `harness/progress.md`, and if status/evidence needs expansion, `harness/features/feat-048.json`
- In scope:
  - audit shared dialogs/forms/select-like consumers for primitive-restyling classes
  - migrate representative consumers in dialog shells, form structures, selection controls, and form feedback states
  - replace common visual overrides with primitive props where already supported
  - add tiny additive primitive follow-ups only when a representative migration is blocked by a missing common preset/state
  - add or update tests that prove contract-based usage in representative migrated consumers
- Explicitly out of scope:
  - app-wide migration of every screen in one pass
  - marketing / landing / public page polish
  - dashboard/stat-card modernization unrelated to form/dialog patterns
  - broad primitive redesign or speculative new variant matrices
  - backend, worker, or database changes

## Non-negotiable Requirements

- The plan must remain compatibility-first: migrated consumers should preserve existing user-visible behavior unless the change is required to align with the design contract.
- Missing common visual cases must route through primitive props (`variant`, `size`, `surface`, `tone`) instead of reintroducing consumer-side `bg-*`, `border-*`, `rounded-*`, `shadow-*`, or `backdrop-blur-*` overrides.
- Tiny primitive follow-ups are allowed only when tied to an actual migrated consumer and must remain additive and compatibility-safe.
- Every migrated representative consumer must have observable evidence of success through tests, targeted assertions, or full verification output.
- All code comments added or updated must be written in English.

## Progress

- [ ] 2026-05-12 Audit shared dialog/form/select consumers for primitive-restyling classes and record a representative migration shortlist.
- [ ] 2026-05-12 Migrate representative dialog-shell consumers to primitive props and add/update focused tests.
- [ ] 2026-05-12 Migrate representative form-structure and selection-control consumers to primitive props and add/update focused tests.
- [ ] 2026-05-12 Migrate representative feedback-state consumers (`Alert`, `Empty`, validation/help surfaces) where applicable.
- [ ] 2026-05-12 Apply only required tiny primitive follow-ups discovered during migration blockers.
- [ ] 2026-05-12 Run plan reviews, full verification, and update plan/harness artifacts.

## Surprises & Discoveries

- Record any consumer patterns that appear repeatedly but still cannot be expressed cleanly through current primitive props.
- Record any primitive API gap that must be filled to unblock more than one migrated consumer.
- Record any legacy examples in reference docs that still show now-disallowed visual overrides.

## Decision Log

- Decision: Roll out by reusable pattern family instead of by full domain.
  Rationale: Shared forms/dialogs produce high reuse, lower blast radius, and clearer canonical examples than an app-wide sweep.
  Date/Author: 2026-05-12 / Orchestrator + user approval.
- Decision: Allow small primitive follow-ups during migration.
  Rationale: Prevents consumer-side hacks from returning when one real migrated flow reveals a missing common preset.
  Date/Author: 2026-05-12 / Orchestrator + user approval.

## Outcomes & Retrospective

- On completion, summarize which consumer families were migrated, which tiny primitive follow-ups were added, which override patterns were eliminated, and which deferred exceptions remain for later rollout phases.

## Context and Orientation

- Design contract source: `docs/design-docs/design-system.md`
- Consumer usage contract: `docs/design-docs/ui-implementation-rules.md`
- Rollout design spec for this phase: `docs/design-docs/2026-05-12-shared-forms-dialogs-rollout-design.md`
- Prior primitive expansion plan: `docs/exec-plans/plans/2026-05-12-base-primitive-expansion.md`
- Primitive implementations: `apps/web/src/components/ui/*`
- Representative migrated proof from prior phase: `apps/web/src/components/household/household-create-dialog.tsx`
- Frontend shared form/layout primitives: `apps/web/src/components/ui/field.tsx`, `apps/web/src/components/ui/input.tsx`, `apps/web/src/components/ui/input-group.tsx`, `apps/web/src/components/ui/dialog.tsx`, `apps/web/src/components/ui/select.tsx`, `apps/web/src/components/ui/combobox.tsx`
- Feature history and evidence anchor: `harness/features/feat-048.json`

This is a **frontend-only** rollout plan. Layer impact is limited to the `UI` layer in `ARCHITECTURE.md`; no `Runtime`, `Service`, `Repo`, `Config`, or `Types` boundary changes are expected beyond additive UI prop typing local to primitives.

## Interfaces & Dependencies

- Existing internal UI contracts:
  - `DialogContent` supports additive `size` and `surface`
  - `Card` supports additive `variant`, `size`, and `surface`
  - `Input`, `Textarea`, `InputGroup`, `NativeSelect`, `Select`, and `Combobox` support additive size/variant/surface contracts from the previous plan
  - `Alert` supports `tone` compatibility mapping
- Internal dependency files:
  - `apps/web/src/components/ui/primitive-styles.ts` for shared surface/overlay/control contracts
  - consumer tests under `apps/web/src/components/**`
- External libraries already in use and unchanged by this plan:
  - React
  - Next.js App Router
  - `react-hook-form`
  - `zod`
  - Radix/shadcn-based primitives already present in `apps/web/src/components/ui`

No new dependencies should be introduced. If a new dependency appears necessary, stop and record explicit justification in this plan before implementation.

## Standards Enforcement

Apply these references during implementation:

- `docs/references/frontend/project-folder-structure.md`
  - Keep migrations within existing feature folders.
  - Only promote new helpers out of a feature when reused by 2+ consumers.
- `docs/references/frontend/component-structure-pattern.md`
  - Split any touched file that grows beyond 200 lines by concern.
  - Use folder `index.ts` exports only for public feature components when new child components are extracted.
- `docs/references/frontend/naming-and-conventions-pattern.md`
  - Use `kebab-case` filenames, named exports, `@/...` imports, and English comments only.
- `docs/references/frontend/form-pattern.md`
  - Preserve `Field`, `FieldLabel`, `FieldError`, `data-invalid`, and `aria-invalid` patterns when refactoring forms.
  - Keep a single schema + `useForm` root per form; do not split validation ownership across children.
- `docs/references/frontend/dialog-and-form-pattern.md`
  - Prefer built-in primitives over custom shell styling.
  - Do not hardcode dialog padding/spacing/sizing on `DialogContent` unless truly necessary and contract-approved.

Companion skills required during implementation:

- `test-driven-development` before changing production code or tests
- `subagent-driven-development` if executing the plan in this session
- `verification-before-completion` before any completion claim
- `requesting-code-review` before merge or final handoff
- `typescript-reviewer` for TS/TSX review on modified files

## Plan of Work (Narrative)

1. Start with a scoped consumer audit. Search `apps/web/src/components/` and, if needed, `apps/web/src/views/` for dialog/form/select consumers that still use visual override classes to restyle primitive surfaces. Record findings by pattern family: dialog shells, shared form structures, selection controls, and feedback states.

2. From that audit, choose a representative shortlist of real consumers. Favor high-reuse or high-visibility components already close to the shared primitive contract, such as dialog-hosted create/edit forms, selection-heavy flows, and shared empty/error states. Keep the set intentionally bounded so review stays sharp.

3. Migrate dialog-shell consumers first. Replace shell-level override classes such as `sm:max-w-*`, custom border/shadow/blur classes, or hardcoded paddings when those concerns now map to primitive APIs like `DialogContent size` or `surface`. If an existing common case cannot be expressed through the current dialog/drawer contract, add one tiny primitive follow-up to the relevant `apps/web/src/components/ui/*` file and cover it with tests before continuing.

4. Migrate form-structure consumers next. Replace custom wrappers or primitive-restyling classes around `Input`, `Textarea`, `Field`, and `InputGroup` with the built-in control props and documented field composition patterns. Keep form logic, validation schemas, and submission semantics unchanged unless a bug is discovered. Preserve accessibility attributes (`aria-invalid`, `data-invalid`, labels, error messages).

5. Migrate selection-control consumers after that. Align real `Select`, `NativeSelect`, and `Combobox` usages to the unified control contract from the previous primitive-expansion phase. Remove call-site styling that exists only to compensate for old geometry/surface differences. If a tiny additive selection preset is required by multiple migrated consumers, add it centrally and update the focused primitive contract tests.

6. Migrate feedback-state consumers where they are part of form/dialog flows. Replace ad hoc alert/empty-state shell styling with `tone`, `surface`, or existing primitive composition. Only migrate examples directly tied to the shared dialog/form rollout scope.

7. Strengthen evidence. Update or add representative consumer tests to assert contract-based usage rather than shell override classes. Where a tiny primitive follow-up is added, extend `apps/web/src/components/ui/primitive-contract.test.tsx` or create a similarly scoped contract test to prove the additive API.

8. After implementation, run spec review first, then TypeScript/UI quality review, then full verification. Finally, update `docs/exec-plans/index.md`, `harness/progress.md`, and any required feature evidence file to record what this rollout phase migrated and what exceptions remain deferred.

## Concrete Steps (Commands)

Run from repo root `/Users/tungdoan/Projects/Web/household-finance-system` unless noted otherwise.

1. Audit likely consumers.

```bash
pnpm exec rg "DialogContent|Combobox|NativeSelect|SelectTrigger|<Alert|<Empty|rounded-|shadow-|backdrop-blur-|border-|bg-" apps/web/src/components apps/web/src/views
```

Expected: a scoped list of consumer files that still combine primitive usage with visual override classes.

2. Run GitNexus upstream impact checks before editing any touched primitive symbol.

```bash
# examples; replace symbol names based on actual primitive follow-ups
```

Use tool calls instead of shell for impact analysis. Expected: LOW risk for additive primitive follow-ups, or explicit warning/escalation if risk is HIGH/CRITICAL.

3. Run focused consumer tests red-first before migrating each representative flow.

```bash
pnpm --filter web exec vitest run <consumer-test-files>
```

Expected: at least one failing assertion when the new contract behavior is not yet implemented, followed by green after implementation.

4. Run focused primitive contract tests when adding a tiny primitive follow-up.

```bash
pnpm --filter web exec vitest run src/components/ui/primitive-contract.test.tsx
```

Expected: fail first for the missing preset/contract, then pass.

5. Check types and auto-fix linting after migrations are stable.

```bash
pnpm typecheck
pnpm lint:fix
```

Expected short outputs: typecheck succeeds for web + worker; lint fix completes with no new errors.

6. Run full workspace verification at the end.

```bash
./init.sh
```

Expected short transcript:

```text
pnpm install: OK
Harness checks: OK
Linting: OK
Type checking: OK
Running tests: OK
Gitnexus: OK
Init Done
```

## Validation and Acceptance

### Happy path

- Representative migrated dialog consumers now use primitive props instead of shell restyling classes.
- Representative migrated form consumers preserve submission, validation, labels, and error rendering.
- Representative selection-control consumers preserve value selection behavior while removing custom visual compensation classes.
- Representative feedback-state consumers use primitive contract props where applicable.

### Validation / error path

- Invalid field states still render `data-invalid`, `aria-invalid`, and `FieldError` correctly after migration.
- Dialog close/cancel behavior remains unchanged.
- Combobox/select empty, disabled, or validation states remain functional after styling migration.

### Regression checks

- Existing migrated proof `apps/web/src/components/household/household-create-dialog.tsx` remains aligned with the contract.
- Any tiny primitive follow-up remains additive and does not break representative existing consumers.
- No migrated consumer relies on disallowed primitive-restyling classes for common color/radius/shadow/blur/internal spacing decisions.

### Acceptance artifacts

- Updated representative consumer tests proving prop-based contract usage.
- Focused primitive contract test output if primitive follow-ups are added.
- Final `./init.sh` transcript showing full verification success.

## Idempotence & Recovery

- Consumer audit commands are safe to re-run.
- Primitive follow-up edits must be additive and should preserve existing defaults so reverting a single consumer migration is possible without reverting the primitive contract itself.
- If a migrated consumer reveals a broader primitive redesign need, stop, record the blocker in this plan, revert the consumer-specific partial workaround, and split the work into a later plan rather than widening scope here.
- Before any risky multi-file migration batch, keep changes in small reviewable commits or local diff chunks so a single pattern family can be reverted cleanly if needed.

## Artifacts and Notes

- Required design reference: `docs/design-docs/2026-05-12-shared-forms-dialogs-rollout-design.md`
- Required acceptance evidence:
  - audit shortlist of migrated consumers
  - test evidence for representative migrated flows
  - full verification output from `./init.sh`
- If deferred items remain, log them in `docs/exec-plans/tech-debt-tracker.md`.

## Risks and Blockers

- Risk: representative consumers expose more missing primitive presets than expected.
  - Response: only add tiny additive follow-ups; if the need expands, stop and split scope.
- Risk: old reference examples still teach now-disallowed call-site styling.
  - Response: update or note them as follow-up if they directly block rollout clarity.
- Risk: a touched primitive has larger blast radius than expected.
  - Response: run GitNexus impact before editing and warn/escalate on HIGH or CRITICAL results.

## Open Decisions

- Which exact 2–4 representative consumers per pattern family should be chosen after the audit.
- Whether any migrated examples justify expanding `feat-048` evidence only, or also merit a new feature record entry.
- Whether any stale reference examples outside the immediate migration files should be corrected in this same phase or deferred.
