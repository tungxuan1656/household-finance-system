# Title

Replace quick-add/add-expense page with canonical AddExpenseDialog and independent group domain.

## Purpose / Big Picture

Users will create expenses from one compact dialog instead of switching between a quick-add dialog and a dedicated add-expense page. The new dialog will use a safer VND amount entry model, corrected category picking inside dialogs, updated source options, and independent household/group semantics so users can tag personal expenses without sharing them. The observable result is that every “Thêm chi tiêu” entry point opens the same dialog, saves the exact intended amount, and supports private/group-only, household-only, and combined household+group expenses.

## Scope

- Files, modules, and areas expected to change:
  - `apps/web/src/components/expense/quick-add-expense-dialog.tsx`
  - `apps/web/src/components/expense/quick-add-expense-trigger.tsx`
  - `apps/web/src/components/expense/quick-add/*`
  - `apps/web/src/components/expense/form-fields/*`
  - `apps/web/src/components/expense/category-picker.tsx`
  - `apps/web/src/components/expense/group-picker.tsx`
  - `apps/web/src/components/expense/source-picker.tsx`
  - `apps/web/src/components/expense/use-expense-form.ts`
  - `apps/web/src/views/app/add-expense-page.tsx`
  - `apps/web/src/app/(protected)/expenses/new/page.tsx`
  - `apps/web/src/views/app/expenses-page.tsx`
  - `apps/web/src/views/app/more/more-shortcuts-card.tsx`
  - `apps/web/src/views/app/onboarding/onboarding-complete-card.tsx`
  - `apps/web/src/lib/constants/paths.ts`
  - `apps/web/src/app/manifest.ts`
  - `apps/web/src/lib/forms/expense.schema.ts`
  - `apps/web/src/lib/reference-data/labels.ts`
  - `apps/web/src/lib/i18n/locales/*.json`
  - `apps/web/src/types/reference-data.ts`
  - `apps/web/src/types/group.ts`
  - `apps/web/src/types/expense.ts`
  - `apps/web/src/types/profile.ts`
  - `apps/web/src/api/expense.ts`
  - `apps/web/src/hooks/api/use-expense.ts`
  - `apps/web/src/hooks/api/use-groups.ts`
  - `apps/worker/src/contracts/reference-data.ts`
  - `apps/worker/src/contracts/expense-schemas.ts`
  - `apps/worker/src/contracts/expense-types.ts`
  - `apps/worker/src/contracts/profile.ts`
  - `apps/worker/src/db/repositories/expense-group-repository.ts`
  - `apps/worker/src/db/repositories/expense-repository.ts`
  - `apps/worker/src/db/repositories/user-repository.ts`
  - `apps/worker/src/handlers/expenses/*`
  - `apps/worker/src/handlers/profile/*`
  - `apps/worker/src/handlers/groups/*`
  - worker integration/unit tests touching expense create/update, profile source preference, and group behavior
  - `docs/product-specs/web/quick-add-experience.md`
  - `docs/product-specs/expense-tracking.md`
  - `docs/product-specs/expense-grouping.md`
  - `docs/product-specs/expense-ownership.md`
  - harness artifacts: `harness/feature_index.json`, `harness/features/*.json`, `harness/progress.md`, optional `harness/session-handoff.md`
- Explicitly out of scope:
  - Reworking the edit-expense UX beyond contract compatibility fixes.
  - Offline capture, draft persistence, background sync, or retry queues.
  - New analytics visualizations unrelated to preserving existing correctness.
  - A separate personal-tag entity distinct from `group`.

## Non-negotiable Requirements

- The plan is self-contained and executable without the original conversation.
- The implementation must produce observable proof: focused tests, manual/browser evidence for dialog behavior, and full final verification.
- `AddExpenseDialog` replaces both quick-add and dedicated add-expense page flows.
- Dialog amount entry uses thousand-shortcut display only inside the dialog and must submit the exact intended VND amount without float drift or double scaling.
- `group` becomes independent from `household` across docs, web, worker, and data-access assumptions.
- Category picking inside the dialog must render and position correctly when nested under `Dialog`.

## Progress

- [ ] 2026-05-15 00:00 — Baseline current expense/group/source contracts and confirm whether any DB migration is required for independent groups.
- [ ] 2026-05-15 00:00 — Write failing focused tests/helpers for dialog amount normalization, source contract changes, and independent group assignment semantics.
- [ ] 2026-05-15 00:00 — Refactor worker contracts/repositories/handlers for new source keys and independent group semantics.
- [ ] 2026-05-15 00:00 — Build feature-local `AddExpenseDialog` UI and migrate add-expense entry points.
- [ ] 2026-05-15 00:00 — Remove legacy quick-add/add-expense page files and update docs/harness evidence.
- [ ] 2026-05-15 00:00 — Run focused verification, then `./init.sh`, then `gitnexus_detect_changes(scope: "all")`.

## Surprises & Discoveries

- Pending implementation.

## Decision Log

- Decision: Replace the existing quick-add dialog with a new `AddExpenseDialog` instead of incrementally refactoring the old files.
  Rationale: The new UX, amount-entry semantics, and domain changes are broad enough that a clean feature-local composition is lower risk than preserving quick-add-specific structure.
  Date/Author: 2026-05-15 / Orchestrator + User
- Decision: Thousand-shortcut VND entry (`3` => `3.000 đ`) applies only inside the new dialog.
  Rationale: The user explicitly requested the shortcut but only within the dialog scope; other expense surfaces must not silently inherit it.
  Date/Author: 2026-05-15 / Orchestrator + User
- Decision: `group` is no longer household-scoped product truth.
  Rationale: The user wants group to be a personal tag independent from sharing scope; this must be reflected consistently in docs and API behavior.
  Date/Author: 2026-05-15 / Orchestrator + User

## Outcomes & Retrospective

- Fill after implementation: summarize delivered dialog-only flow, removed surfaces, domain migration impact, verification evidence, and any deferred debt.

## Context and Orientation

- Current quick-add UI lives in `apps/web/src/components/expense/quick-add-expense-dialog.tsx` with subcomponents under `apps/web/src/components/expense/quick-add/`.
- Dedicated add-expense page lives in `apps/web/src/views/app/add-expense-page.tsx` and `apps/web/src/app/(protected)/expenses/new/page.tsx`.
- Expense form schemas and submit mapping live in `apps/web/src/lib/forms/expense.schema.ts` and `apps/web/src/components/expense/use-expense-form.ts`.
- Shared expense field components live in `apps/web/src/components/expense/form-fields/*`.
- Group APIs and hooks currently assume household-scoped groups via `apps/web/src/hooks/api/use-groups.ts` and worker group repositories/handlers.
- Worker expense validation and minor-unit conversion live in `apps/worker/src/contracts/expense-schemas.ts` and `apps/worker/src/handlers/expenses/shared.ts`.
- Product docs for create/group semantics live in `docs/product-specs/web/quick-add-experience.md`, `docs/product-specs/expense-tracking.md`, `docs/product-specs/expense-grouping.md`, and `docs/product-specs/expense-ownership.md`.

## Required Standards / Reference Docs

Frontend references to apply:

- `docs/references/frontend/web/project-folder-structure.md`
  - Keep the new dialog as a feature-local component under `components/expense/`; do not add new root folders.
- `docs/references/frontend/web/component-structure-pattern.md`
  - `add-expense-dialog.tsx` is the smart orchestrator; `components/expense/add-expense/*` stays presentational/helper-local.
- `docs/references/frontend/web/frontend-component-architecture-guide.md`
  - Preserve layer order: route/view orchestration → feature smart component → presentational subcomponents → shadcn primitives.
- `docs/references/frontend/web/naming-and-conventions-pattern.md`
  - Use kebab-case files, named exports, alias imports, and English comments only.
- `docs/references/frontend/web/form-pattern.md`
  - Keep one root `react-hook-form` schema, `data-invalid`, `aria-invalid`, and explicit `FieldError` rendering.
- `docs/references/frontend/web/dialog-and-form-pattern.md`
  - Use `Dialog` + `FieldGroup` composition; dialog/form state remains in the feature component.
- `docs/references/frontend/web/api-react-query-pattern.md`
  - UI uses hooks only; updated group/expense/profile APIs invalidate the correct query scopes.
- `docs/references/frontend/web/i18n-label-pattern.md`
  - All new labels and validation copy must be i18n-backed in all locale files.

Backend references to apply:

- `docs/references/backend/architecture-and-boundaries.md`
  - Route files stay thin; group/expense business logic changes belong in handlers/repositories, not routes.
- `docs/references/backend/api-contract-and-validation.md`
  - Avoid silent coercion that changes meaning; if the web dialog uses thousand-shortcut semantics, web must normalize before request and worker must validate clear canonical values.
- `docs/references/backend/error-handling-pattern.md`
  - Preserve clear 4xx/5xx behavior for invalid household/group combinations or invalid source keys.
- `docs/references/backend/security-and-auth-pattern.md`
  - Derive authenticated user ownership consistently for payer/creator and group access checks.
- `docs/references/backend/testing-pattern.md`
  - Add or update scenario/integration coverage for changed create/list/group behavior.
- `docs/references/backend/database-pattern.md`
  - Keep explicit mappings, stable list ordering, and document any required migration/index changes.
- `docs/references/backend/cloudflare-workers.md`
  - Preserve worker runtime conventions and avoid browser/server API drift.

Shared references to apply:

- `docs/references/shared/type-naming-pattern.md`
  - Keep DTO/Request/Response naming explicit while source/group contract types change.

Companion skills during execution:

- `test-driven-development` before production edits.
- `typescript-reviewer` after TypeScript/TSX changes.
- `requesting-code-review` after implementation.
- `verification-before-completion` before claiming done.
- `subagent-driven-development` if implementation is split into independent backend/frontend/doc tasks.

## Plan of Work (Narrative)

1. **Baseline the current contract and migration need.**
   - Inspect current worker group storage and expense-group assignment shape to determine whether independent groups can be expressed by removing household filters only, or whether a D1 migration is required to decouple group ownership from household ownership.
   - Inspect all web entry points pointing to `PATHS.ADD_EXPENSE` and the PWA shortcut path so migration can happen in one pass.
   - Run required GitNexus upstream impact checks before touching high-risk symbols during implementation (examples: `QuickAddExpenseDialog`, `useExpenseForm`, worker expense create/update handlers, worker group repository).

2. **Lock the data contract first (TDD-first).**
   - Add/adjust focused worker and pure-helper tests that fail under old behavior:
     - source keys reject old `e-wallet` and accept `momo`/`zalo-pay`/`shopee-pay`
     - expense create accepts group assignment without household selection when allowed by the new domain
     - expense list/detail/group summary serializers no longer assume household-scoped group truth
     - profile source preference types remain compatible with new source keys
   - Add focused web pure-helper tests for amount formatting/normalization to prove `3` becomes display `3.000 đ` and canonical value `3000`.

3. **Refactor worker contracts and repositories.**
   - Update shared reference-data constants and all contract consumers.
   - Resolve the old `payerUserId` create mismatch explicitly: either add it to the create contract with consistent validation/usage, or stop sending it and derive payer from auth context in worker create handler.
   - Refactor repositories/handlers/serializers that enforce household-scoped groups so group access/assignment becomes independent from household visibility while still protecting user ownership.
   - If schema changes are required, add a migration plus repository/query updates and describe rollback in the implementation log.

4. **Build the new dialog as a feature-local frontend flow.**
   - Create `apps/web/src/components/expense/add-expense-dialog.tsx` as the smart dialog owner.
   - Create `apps/web/src/components/expense/add-expense/*` subcomponents for form shell, amount field, household/group/source fields, and submit-error presentation.
   - Keep category selection in a category-specific component, but fix its nested-dialog overlay/container issue using shadcn-compatible composition.
   - Use one root expense form schema for the dialog path; do not rely on the old quick-add visibility switch semantics.
   - Implement dialog-only amount normalization so the UI field can show shortcut formatting while the form stores or derives an exact canonical VND integer.

5. **Migrate all add-expense entry points and remove legacy surfaces.**
   - Replace existing quick-add trigger consumers and route-navigation CTAs with dialog-open behavior.
   - Update any app-level provider/state needed so multiple entry points can open the canonical dialog without route navigation.
   - Remove the add-expense page route/view and quick-add-specific files only after all callers are migrated.
   - Update path constants and the PWA shortcut so no stale `/expenses/new` dependency remains.

6. **Update docs and harness artifacts last, once behavior is stable.**
   - Update product specs to reflect one canonical dialog, independent group semantics, no payer/note field in create UI, and source contract changes.
   - Update harness as a new feature record only. Do not edit legacy completed feature records except to reference them as historical dependencies in the new record.
   - Add the next available feature id in `harness/feature_index.json` and create the matching `harness/features/<new-id>.json` record for this refactor.
   - Add a newest-first `harness/progress.md` entry describing implementation and verification evidence.

## Concrete Steps (Commands)

Run from repo root `/Users/tungdoan/Projects/Web/household-finance-system` unless stated otherwise.

1. Baseline and sync index if needed:

```bash
./init.sh sync
```

Expected short output:

```text
OK
```

2. During implementation, run focused checks after each subsystem batch:

```bash
./init.sh lint
./init.sh typecheck
```

Expected short output:

```text
OK
OK
```

3. Run focused worker/web tests once new helper and contract coverage is added. Prefer one-file or feature-targeted commands when debugging; examples below are placeholders for the touched suites and must be replaced with exact file paths created/updated during execution:

```bash
./init.sh test
```

Expected short output:

```text
OK
```

4. Final full verification only after all code/docs/harness edits are complete:

```bash
./init.sh
```

Expected short output:

```text
Done!
```

5. Final blast-radius review before completion summary:

```bash
# use MCP tool, not shell
gitnexus_detect_changes(scope: "all")
```

Expected short output:

```text
LOW|MEDIUM risk summary with changed symbols/processes listed
```

## Validation and Acceptance

Happy path acceptance:

- Opening add-expense from the header/FAB/onboarding/expenses page/more shortcuts opens `AddExpenseDialog`, not `/expenses/new`.
- Typing `3` in the dialog amount field displays `3.000 đ` and creates an expense stored/displayed as `3,000 VND` equivalent, not `3`, `300`, or `3,000,000`.
- Creating a private expense with `Nhóm` selected and `Gia đình = Không` succeeds.
- Creating a household-shared expense with `Gia đình` selected and `Nhóm = Không` succeeds.
- Creating a household-shared expense with both household and group succeeds.
- Category picker options render correctly inside the dialog, appear above the dialog content, and can be selected with keyboard/mouse.

Validation/error-path acceptance:

- Empty amount or zero-like input shows inline validation and blocks submit.
- Invalid or stale source values fail validation cleanly on both web and worker.
- Unauthorized group use (if the user does not own the independent group) returns the correct 4xx and surfaces a clear error.
- Invalid household selection still returns a clear validation/permission error.

Regression acceptance:

- Existing profile `quickAddLastSourceKey` handling remains type-safe with the new source keys.
- Expense create/update/list/detail tests still pass with updated source/group semantics.
- No entry point or manifest shortcut still relies on `/expenses/new`.

Acceptance artifacts required:

- Focused test output for amount normalization helper(s).
- Focused worker test output for source/group contract changes.
- Manual/browser evidence notes covering dialog open from all touched entry points and nested category picker behavior.

## Idempotence & Recovery

- Code, docs, and harness edits are safe to re-run and re-apply.
- If a DB migration is introduced to decouple groups from households, record the migration name and exact rollback/restore procedure in the implementation log before applying it. Back up any local D1 dev DB if manual data reshaping is required.
- Legacy quick-add/add-expense files should only be deleted after the new dialog path passes focused verification; until then, keep removals as the last code step in the branch.

## Artifacts and Notes

- Design spec: `docs/design-docs/2026-05-15-add-expense-dialog-domain-and-ui-design.md`.
- Relevant historical plans to consult during implementation:
  - `docs/exec-plans/plans/2026-04-30-feat-017-expense-entry-create-flow.md`
  - `docs/exec-plans/plans/2026-05-03-feat-022-expense-group-management.md`
  - `docs/exec-plans/plans/2026-05-03-feat-023-expense-to-group-assignment-and-summaries.md`
  - `docs/exec-plans/plans/2026-05-04-feat-024-quick-add-expense-basic-flow.md`
  - `docs/exec-plans/plans/2026-05-06-feat-025-quick-add-smart-defaults.md`
- This change spans layers: `Types -> Contracts -> Repositories/Handlers -> Web hooks/forms -> Dialog UI -> Docs/Harness`.

## Interfaces & Dependencies

- Web libraries:
  - `react-hook-form` + `zod` for dialog form state and validation.
  - shadcn primitives under `@/components/ui/*` for dialog/form controls.
  - React Query hooks in `apps/web/src/hooks/api/*` for expense/group/profile data.
- Worker dependencies:
  - expense/group/profile contracts under `apps/worker/src/contracts/*`
  - D1 repositories under `apps/worker/src/db/repositories/*`
  - expense/group/profile handlers under `apps/worker/src/handlers/*`
- Key contracts likely to change:
  - `SourceKey` / `ReferenceSourceKey`
  - expense create/update request validation
  - group DTO/listing semantics
  - profile `quickAddLastSourceKey`

Implementation note on boundaries:

- UI must not bypass hooks/API clients.
- Worker routes must not absorb repository logic.
- Any new dialog-open global state must remain on the web side and not leak into generic UI primitives.
