# Design system contract hardening

## Purpose / Big Picture

Harden the web design-system contract so `docs/design-docs/design-system-v2-spec.md` becomes the effective visual source of truth and page-level code stops making visual decisions that belong in `apps/web/src/components/ui`. End users should observe no intentional product-behavior change, but future UI work should become more consistent: new pages and refactors can rely on primitive variants/sizes instead of ad hoc color, radius, shadow, blur, or spacing classes.

## Scope

- In scope:
  - `docs/design-docs/design-system.md`
  - `docs/design-docs/ui-implementation-rules.md`
  - `docs/design-docs/design-system-v2-spec.md` as the governing reference for this plan
  - `docs/exec-plans/index.md`
  - `harness/progress.md`
  - If needed for evidence only: repo-wide read-only audit of call sites under `apps/web/src/`
- Out of scope:
  - Refactoring `apps/web/src/components/ui/*`
  - Migrating feature pages/components to new primitive APIs
  - Changing backend, worker, or D1 code
  - Adding new product behavior, copy, or page flows

## Non-negotiable Requirements

- The plan must remain self-contained and executable without the original conversation.
- The resulting docs must clearly forbid visual styling at primitive call sites except for layout-only concerns.
- The resulting docs must align with the V2.1 glassmorphism specification and remove internal contradictions.
- The implementation must preserve the architecture boundary `Types -> Config -> Repo -> Service -> Runtime -> UI`; this work is UI/docs only and must not introduce higher-to-lower leakage.

## Progress

- [ ] 2026-05-12 Create baseline branch-local audit notes mapping V2 spec rules to the two docs.
- [ ] 2026-05-12 Rewrite `docs/design-docs/design-system.md` into a token + primitive-ownership contract.
- [ ] 2026-05-12 Rewrite `docs/design-docs/ui-implementation-rules.md` into a consumption contract with explicit allowed/disallowed `className` usage.
- [ ] 2026-05-12 Add reviewer-ready acceptance checklist and migration escalation rule to both docs.
- [ ] 2026-05-12 Run verification commands and capture evidence.
- [ ] 2026-05-12 Update `harness/progress.md` with outcomes and next-step handoff to the primitive expansion plan.

## Surprises & Discoveries

- Expected discovery to confirm during implementation: `harness/features/feat-048.json` still says `status: "in-progress"` even though `harness/feature_index.json` and `harness/progress.md` describe the work as completed; do not widen this plan into harness reconciliation unless it blocks accurate progress logging.

## Decision Log

- Decision: Split the work into two ExecPlans instead of one large refactor.
  Rationale: Docs contract hardening and primitive API expansion have different risk profiles; separating them keeps review scope bounded and allows implementation to stop after documentation if the API direction changes.
  Date/Author: 2026-05-12 / Orchestrator
- Decision: Preserve `docs/design-docs/design-system-v2-spec.md` as the aesthetic source while making `design-system.md` and `ui-implementation-rules.md` the operational contracts.
  Rationale: The V2 spec is concise and brand-defining; the other two docs should operationalize it rather than compete with it.
  Date/Author: 2026-05-12 / Orchestrator

## Outcomes & Retrospective

- Fill after implementation with: exact doc changes, remaining ambiguities, and whether a follow-up PR review found any policy gaps.

## Context and Orientation

- `docs/design-docs/design-system-v2-spec.md`: aesthetic spec defining the V2.1 palette, glass anatomy, radii, shadows, typography, and spacing.
- `docs/design-docs/design-system.md`: operational token and design-system contract used when refactoring primitives and theme rules.
- `docs/design-docs/ui-implementation-rules.md`: consumption rules used by feature/page authors.
- `apps/web/src/components/ui/*`: the primitive layer these docs are meant to govern; this plan references them for policy examples but does not edit them.
- `harness/features/feat-048.json`, `harness/feature_index.json`, and `harness/progress.md`: prior design-system history and required session evidence.

## Standards Enforcement

Frontend references that must shape implementation:

- `docs/references/frontend/project-folder-structure.md`
  - Constraint: keep documentation and any referenced examples aligned to existing `apps/web/src/components/ui` and `apps/web/src/components/*` boundaries; do not invent new folder schemes in prose.
- `docs/references/frontend/component-structure-pattern.md`
  - Constraint: doc examples must reinforce component-owned APIs (`variant`, `size`, `tone`, `surface`) rather than page-local styling workarounds.
- `docs/references/frontend/naming-and-conventions-pattern.md`
  - Constraint: any new terminology in docs must be stable, English, and consistent (`variant`, `size`, `tone`, `surface`, `layout-only className`).
- Companion skills required during execution:
  - `requesting-code-review` after the docs are rewritten.
  - `verification-before-completion` before claiming the plan finished.

Concrete policy constraints to encode in the docs:

- Call sites may customize layout-only concerns such as width, height, min/max constraints, flex/grid placement, order, responsive visibility, and container margins when placing a primitive in a page layout.
- Call sites may not customize primitive visuals via `bg-*`, `text-*`, `border-*`, `rounded-*`, `shadow-*`, `backdrop-blur-*`, opacity utilities, or internal spacing utilities intended to change primitive appearance.
- If a page needs a visual treatment not provided by a primitive API, the required change must be added to the primitive as a new `variant`, `size`, `tone`, or `surface` instead of patched into the page.
- Interaction rules must be single-source and non-contradictory; button active scaling, overlay blur/backdrop, and card glass treatment must each have one canonical rule.

## Plan of Work (Narrative)

1. Create a side-by-side audit table from `docs/design-docs/design-system-v2-spec.md` to the current `design-system.md` and `ui-implementation-rules.md`. Capture mismatches already identified: palette drift, opaque card guidance, direct semantic utility usage at call sites, contradictory interaction rules, and permissive custom-token guidance.
2. Rewrite `docs/design-docs/design-system.md` to act as the system contract rather than a theme playground. Keep the sections that define tokens, radii, shadow system, typography, spacing, and animation, but reword them so they operationalize V2.1 instead of presenting alternate palettes or open-ended token addition paths. Explicitly add a section that declares the primitive layer the owner of visual decisions.
3. Rewrite `docs/design-docs/ui-implementation-rules.md` so it becomes a reviewer-enforceable consumption contract. Replace examples that encourage direct semantic token usage at call sites with examples that prefer primitive props such as `variant`, `size`, `tone`, and `surface`. Add an explicit allowed/disallowed `className` matrix.
4. Add an escalation rule to both docs: if a page cannot achieve the desired look through the exposed primitive API, engineers must extend the primitive instead of styling the page manually.
5. Reconcile contradictions: choose one active-state scale rule, choose one overlay backdrop rule consistent with V2, and ensure spacing guidance points back to the same mobile/desktop values.
6. Add acceptance-oriented checklists to both docs so reviewers can quickly reject violations: visual class override, token drift, missing monospace amounts, and hardcoded surface styling.
7. Update `docs/exec-plans/index.md` and `harness/progress.md` to reflect the new active plan and document what changed.

## Concrete Steps (Commands)

Run from repo root `/Users/tungdoan/Projects/Web/household-finance-system` unless stated otherwise.

```bash
# full baseline verification before editing (required by repo policy)
./init.sh

# inspect current doc changes after edits
git diff -- docs/design-docs/design-system.md docs/design-docs/ui-implementation-rules.md docs/exec-plans/index.md harness/progress.md

# repo-required autofix pass after writing
pnpm lint:fix

# full verification before completion
./init.sh
```

Expected short outputs:

- `./init.sh` prints the workspace verification steps and ends without lint/type/test/build failures.
- `pnpm lint:fix` completes with either no changes or a short list of formatted Markdown/TSX files and no fatal errors.
- `git diff -- ...` shows only the intended doc/index/progress updates.

## Validation and Acceptance

Acceptance artifacts for this plan:

- `docs/design-docs/design-system.md` explicitly states that primitive visuals are owned by `components/ui` and that call sites are layout-only.
- `docs/design-docs/ui-implementation-rules.md` contains an allowed/disallowed `className` table and an escalation rule to extend primitives instead of patching pages.
- The two docs no longer contradict the V2.1 rules for palette, card glass treatment, spacing, and interaction behavior.
- Reviewer can inspect at least three concrete examples in the rewritten docs where primitive props replace page-level visual classes.
- `./init.sh` succeeds after the doc edits.

Validation matrix:

- Happy path:
  - Docs read coherently from top to bottom and all examples support primitive-first composition.
- Error/regression path:
  - Search examples do not still recommend `bg-primary`, `rounded-*`, or `shadow-*` on primitive call sites except where explicitly documented as layout-only non-visual placement.
- Policy regression check:
  - `design-system.md` no longer presents “add custom tokens” as a normal first-line solution for feature work.

## Idempotence & Recovery

- This plan is safe to re-run.
- If a rewrite heads in the wrong direction, recover by discarding only the doc/index/progress file changes from the working tree and reapplying the plan; no database, backend, or generated asset state is involved.
- Keep commits scoped so the docs-only contract hardening can be reverted independently from the primitive expansion plan.

## Artifacts and Notes

- Capture a short before/after excerpt for each rewritten doc section in the implementation PR description.
- Preserve a checklist of the specific contradictions removed:
  - active scale rule mismatch
  - overlay blur mismatch
  - token/customization permissiveness
  - semantic utility styling at primitive call sites

## Interfaces & Dependencies

- Internal dependencies:
  - `docs/design-docs/design-system-v2-spec.md`
  - `docs/design-docs/design-system.md`
  - `docs/design-docs/ui-implementation-rules.md`
  - `apps/web/src/components/ui/*` only as reference targets for the contract
- External libraries: none expected for this docs-only plan.
- No API or function signature changes are expected in this plan.

## Risks and Blockers

- Risk: rewriting the docs too aggressively could forbid patterns the current primitives cannot yet satisfy.
  - Mitigation: document the escalation path clearly and keep the primitive expansion plan active in parallel.
- Risk: ambiguity around which `className` usages are truly layout-only.
  - Mitigation: include a concrete allowed/disallowed matrix and multiple examples.
- Blocker: if implementation discovers product surfaces that fundamentally cannot map to the proposed primitive contract, pause and revise this plan before landing the docs.

## Open Decisions

- Decide whether `surface` should be the canonical prop name for container-like primitives across the codebase, or whether `variant` alone is sufficient when the primitive is purely visual.
- Decide whether docs should permit typography utilities such as `text-2xl` on raw content inside `CardContent`, or whether all typography that conveys semantic component state must also move behind higher-level primitives.

## Harness Integration

- Add this plan to `docs/exec-plans/index.md` under `Active`.
- Add a `harness/progress.md` entry summarizing the plan creation and later the implementation results.
- Do not alter `harness/feature_index.json` in this plan unless the team decides to formalize a new feature ID for design-system hardening.
- When implementation finishes, reference this plan from the relevant harness progress entry and note the handoff to the primitive expansion plan.
