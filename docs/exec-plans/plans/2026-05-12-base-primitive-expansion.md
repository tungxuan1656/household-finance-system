# Base primitive expansion for variant-only UI composition

## Purpose / Big Picture

Expand the base UI primitives in `apps/web/src/components/ui` so product teams can build pages using variants, sizes, tones, and surface presets instead of custom visual classes. End users should observe preserved or improved visual consistency across cards, forms, selectors, dialogs, drawers, alerts, and empty states, while the engineering team gains a stable primitive API that reduces downstream styling drift.

## Scope

- In scope:
  - `apps/web/src/components/ui/card.tsx`
  - `apps/web/src/components/ui/input.tsx`
  - `apps/web/src/components/ui/textarea.tsx`
  - `apps/web/src/components/ui/input-group.tsx`
  - `apps/web/src/components/ui/select.tsx`
  - `apps/web/src/components/ui/native-select.tsx`
  - `apps/web/src/components/ui/combobox.tsx`
  - `apps/web/src/components/ui/dialog.tsx`
  - `apps/web/src/components/ui/drawer.tsx`
  - `apps/web/src/components/ui/alert.tsx`
  - `apps/web/src/components/ui/empty.tsx` (recommended completion target)
  - `apps/web/src/index.css` only if token registration or shared surface helpers are required by the primitive APIs
  - Targeted web tests and snapshots covering the touched primitives and key consumers
  - `docs/design-docs/design-system.md` and `docs/design-docs/ui-implementation-rules.md` only for synchronization with landed contract changes
  - `docs/exec-plans/index.md`
  - `harness/progress.md`
- Out of scope:
  - Mass migration of every feature page in `apps/web/src/views` to the new APIs
  - New backend contracts, state stores, or API hooks
  - Broad redesign of non-primitive feature components outside targeted smoke migrations
  - Replacing shadcn/Radix foundations with a different component library

## Non-negotiable Requirements

- The plan must produce a primitive API that lets pages avoid custom visual classes for color, radius, shadow, blur, and primitive-internal spacing.
- Backward compatibility must be preserved where feasible; additive APIs come first, destructive cleanup later.
- The plan must include observable acceptance evidence: tests, build success, and at least a small set of migrated consumers proving the APIs are sufficient.
- UI work must remain inside the `UI` layer of `Types -> Config -> Repo -> Service -> Runtime -> UI` and must not bypass runtime/service boundaries.

## Progress

- [ ] 2026-05-12 Freeze the target primitive API conventions (`variant`, `size`, `tone`, `surface`, and any approved compatibility props).
- [ ] 2026-05-12 Refactor `Card`, `Input`, `Textarea`, and `InputGroup` to align on shared size/visual contracts.
- [ ] 2026-05-12 Refactor `Select`, `NativeSelect`, and `Combobox` as one selection family with shared trigger/content rules.
- [ ] 2026-05-12 Refactor `Dialog`, `Drawer`, `Alert`, and `Empty` to expose reusable surface/tone/size presets.
- [ ] 2026-05-12 Add or update focused tests and, where sensible, minimal consumer smoke coverage.
- [ ] 2026-05-12 Run verification and document remaining migration debt.
- [ ] 2026-05-12 Update `harness/progress.md` with implementation evidence and any follow-up rollout tasks.

## Surprises & Discoveries

- Pre-seeded discovery from the audit: `Button` already has the strongest variant/size contract and should be treated as the model for other primitives.
- Pre-seeded discovery from prior harness logs: auth pages previously required explicit `Input` overrides after a cleanup regression; this plan must verify that strengthened base primitives eliminate the need for those visual overrides or clearly document why not.

## Decision Log

- Decision: Use additive API expansion before removing current defaults.
  Rationale: many pages already depend on the current shapes; additive props let the team migrate incrementally and reduce blast radius.
  Date/Author: 2026-05-12 / Orchestrator
- Decision: Treat `Select`, `NativeSelect`, and `Combobox` as a single family for API design.
  Rationale: mismatched trigger shape, size, and popup surface across selection controls is a primary source of page-level overrides.
  Date/Author: 2026-05-12 / Orchestrator

## Outcomes & Retrospective

- Fill after implementation with the final primitive API matrix, migrated consumer examples, remaining gaps, and any variants intentionally deferred to `docs/exec-plans/tech-debt-tracker.md`.

## Context and Orientation

- `apps/web/src/components/ui/button.tsx`: reference-quality primitive with mature `variant` and `size` APIs.
- `apps/web/src/components/ui/card.tsx`: current card shell with heavy glass styling and only size variants.
- `apps/web/src/components/ui/input.tsx`, `textarea.tsx`, `input-group.tsx`: current form primitives lacking parity with `Button`.
- `apps/web/src/components/ui/select.tsx`, `native-select.tsx`, `combobox.tsx`: selection family with inconsistent trigger/content contracts.
- `apps/web/src/components/ui/dialog.tsx`, `drawer.tsx`, `alert.tsx`, `empty.tsx`: surface/feedback primitives that currently embed visual decisions without enough preset APIs.
- `apps/web/src/index.css`: token registration and any shared utilities supporting the primitives.
- `docs/design-docs/design-system.md` and `docs/design-docs/ui-implementation-rules.md`: contract docs that must stay aligned with the landed APIs.

## Standards Enforcement

Frontend references that must shape implementation:

- `docs/references/frontend/project-folder-structure.md`
  - Constraint: keep work inside `apps/web/src/components/ui` and nearby tests/helpers; do not create catch-all utility dumping grounds.
- `docs/references/frontend/component-structure-pattern.md`
  - Constraint: if any primitive file exceeds 200 lines materially after refactor, split by concern into adjacent files with clear public exports.
- `docs/references/frontend/naming-and-conventions-pattern.md`
  - Constraint: new files use `kebab-case`, named exports where appropriate, and consistent prop names across families.
- `docs/references/frontend/form-pattern.md`
  - Constraint: form-control refactors must preserve accessible labels, states, and touch targets.
- `docs/references/frontend/dialog-and-form-pattern.md`
  - Constraint: dialog/drawer content, header, footer, and action patterns must remain consistent with existing interaction flows.
- Companion skills required during execution:
  - `test-driven-development` before editing production primitives that change behavior or structure.
  - `requesting-code-review` after the refactor lands.
  - `verification-before-completion` before claiming completion.

Concrete coding constraints:

- Prefer `class-variance-authority`-style variant maps or equivalent local utilities so visual contracts are explicit and discoverable.
- Keep default variants visually close to current shipped UI unless the docs plan explicitly changed the design contract.
- Do not introduce arbitrary values for colors, radius, shadows, or blur when an existing token or semantic class exists.
- Shared visual recipes (for example the standard glass surface) must be centralized enough that `Card`, `Dialog`, `Drawer`, and popup surfaces do not drift independently.

## Plan of Work (Narrative)

1. Define the target primitive API matrix before touching files. For each primitive family, write down the exact props to support and what they mean:
   - surface containers: `variant` and/or `surface`, plus `size`
   - form controls: `variant`, `size`, and state styling parity
   - feedback components: `tone`, optional `size`
   - selection family: shared trigger `size`/`variant` and popup surface rules
2. Refactor `apps/web/src/components/ui/card.tsx` first because it establishes the surface contract the rest of the system follows. Split shell styling from composition spacing if necessary, and expose the minimal set of variants that cover current product usage without explosion.
3. Refactor `input.tsx`, `textarea.tsx`, and `input-group.tsx` as a cohesive form-control pass. Align height, padding, radius, focus ring, invalid state, and disabled state behind `size` and `variant` props so consumers no longer need visual overrides.
4. Refactor `select.tsx`, `native-select.tsx`, and `combobox.tsx` together. Standardize trigger geometry with the text input family and ensure popup/content surfaces consume the same glass/surface contract as dialogs and cards.
5. Refactor `dialog.tsx`, `drawer.tsx`, `alert.tsx`, and `empty.tsx`. Add size presets where needed and expose tones/surfaces so callers no longer pass shell-level visual classes.
6. Add or update focused tests around the new props and states. Where the repo already has consumer tests for auth, forms, or pages affected by these primitives, adjust only the minimum assertions needed to prove compatibility.
7. Perform a targeted smoke migration in a small number of representative consumers—preferably one auth form, one filter/select flow, and one card-heavy screen—to prove the expanded primitives are sufficient without broad rollout.
8. Sync any doc examples or policy language that changed as a direct consequence of the final primitive APIs. Update progress and plan index artifacts.

## Concrete Steps (Commands)

Run from repo root `/Users/tungdoan/Projects/Web/household-finance-system` unless stated otherwise.

```bash
# baseline verification before edits
./init.sh

# focused web tests during each primitive pass (adjust file list to touched suites)
pnpm --filter web exec vitest run src/components/**/*.test.tsx src/views/**/*.test.tsx

# repo-required autofix after code changes
pnpm lint:fix

# final full verification
./init.sh

# inspect working tree impact for touched UI files
git diff -- apps/web/src/components/ui apps/web/src/index.css docs/design-docs docs/exec-plans/index.md harness/progress.md
```

Expected short outputs:

- Focused Vitest runs end with passing counts for touched suites and no new snapshot/type failures.
- `pnpm lint:fix` completes successfully.
- Final `./init.sh` ends with lint, type-check, tests, and build all green.

## Validation and Acceptance

Acceptance artifacts for this plan:

- A primitive API matrix documenting the final props landed for each touched component.
- Tests demonstrating at least:
  - `Input` and `Textarea` honor new size/variant props without breaking invalid/disabled states.
  - `Card` supports its declared surface variants without requiring external shell styling.
  - `Select` family components share trigger sizing and popup surface behavior.
  - `Dialog`/`Drawer` content supports preset sizes or surfaces through props rather than page-level shell overrides.
- At least one migrated consumer example that no longer needs visual override classes because the primitive API now covers the use case.
- Final `./init.sh` success transcript.

Validation matrix:

- Happy path:
  - Default primitive renderings remain visually correct and compile cleanly.
  - New props produce distinct, intentional outputs.
- Validation/error path:
  - Invalid and disabled states on inputs/select-like controls remain visible and accessible.
  - Dialog and drawer overlays still trap focus and render titles/descriptions correctly.
- Regression checks:
  - Auth inputs no longer rely on one-off visual overrides unless explicitly documented as an intentional exception.
  - Existing page tests that exercise cards, dialogs, filters, or selects still pass after the primitive changes.

## Idempotence & Recovery

- Safe to re-run verification commands.
- Refactor in small commits or checkpoints by primitive family so a problematic family can be reverted independently.
- If a primitive API change proves too breaking, restore the previous default rendering and keep the new prop behind an additive path rather than forcing immediate migration.

## Artifacts and Notes

- Produce a final table in the PR description or implementation notes with columns:
  - component
  - new props
  - default behavior preserved?
  - representative migrated consumer
- Capture before/after screenshots or browser-subagent spot checks for:
  - one card surface
  - one form with inputs/selects
  - one dialog or drawer

## Interfaces & Dependencies

- Internal dependencies:
  - `apps/web/src/lib/utils` for `cn`
  - `class-variance-authority` patterns already used in existing primitives such as `button.tsx`
  - Radix/shadcn primitives used by `select.tsx`, `dialog.tsx`, `drawer.tsx`, and related files
- External libraries/services:
  - shadcn/Radix components already installed in the repo; no new UI library should be added without explicit justification
- API contracts remain internal to the UI layer. If helper signatures are extracted, document them in-place, for example:
  - `type SurfaceVariant = "glass" | "subtle" | "outline" | "solid"`
  - `type ControlSize = "sm" | "default" | "lg"`
  - `type FeedbackTone = "neutral" | "success" | "warning" | "destructive" | "info"`

## Risks and Blockers

- Risk: variant explosion makes primitives harder to reason about.
  - Mitigation: start with the smallest set justified by audited consumer needs; defer speculative variants.
- Risk: shared surface recipes drift across components even after the refactor.
  - Mitigation: centralize class recipes or helper functions where repeated glass/surface styling appears.
- Risk: targeted consumers reveal missing primitive states late.
  - Mitigation: include the smoke migration step before finalizing the API.
- Blocker: if the docs hardening plan has not landed, implementation may lack a stable policy target; land or at least freeze the contract language first.

## Open Decisions

- Decide whether `surface` should be a dedicated prop on `Card`, `DialogContent`, `DrawerContent`, and popup content, or whether `variant` alone should encode those distinctions.
- Decide whether `Empty` belongs in this plan’s required scope or may be deferred if the more critical container/form/overlay families consume the available time budget.
- Decide whether auth pages should be used as the primary smoke migration target because they previously needed input overrides.

## Harness Integration

- Add this plan to `docs/exec-plans/index.md` under `Active`.
- Update `harness/progress.md` when the plan is created and again when the implementation lands.
- If the implementation reveals deferred migration debt, log it in `docs/exec-plans/tech-debt-tracker.md` instead of silently dropping it.
- Do not update feature completion statuses until the refactor is implemented and verified.
