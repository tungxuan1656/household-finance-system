# feat-024 — Quick-add expense basic flow

## Title

Add the MVP quick-add expense flow with global trigger, compact create UI, and Undo.

## Purpose / Big Picture

Implement a frontend-first quick-add expense flow so authenticated users can capture an expense in roughly 2–3 seconds without navigating to the full add-expense screen. Users will observe this through a globally accessible trigger (floating action button plus keyboard shortcut), a compact modal or bottom-sheet style entry surface with the amount field focused immediately, sensible defaults for the minimum required fields, and a success toast that offers a 5-second Undo action.

This plan keeps the scope tightly aligned to `harness/features/feat-024.json` and `docs/product-specs/quick-add-experience.md`: it reuses the existing expense create API from `feat-017`, reuses delete support from `feat-019` for Undo, and explicitly excludes offline or no-internet capture, durable smart defaults, and ML-like suggestion behavior.

## Scope

- Planned frontend areas:
  - `apps/web/src/components/layouts/main-layout.tsx`
  - `apps/web/src/components/layouts/bottom-tab.tsx` (only if FAB spacing or overlap needs adjustment)
  - `apps/web/src/components/expense/expense-form.tsx` (only if extracting reusable field sections is the smallest safe path)
  - `apps/web/src/components/expense/expense-form-fields.tsx`
  - `apps/web/src/components/expense/use-expense-form.ts`
  - `apps/web/src/components/expense/index.ts`
  - `apps/web/src/components/expense/quick-add-expense-dialog.tsx` or equivalent new feature component
  - `apps/web/src/components/expense/quick-add-expense-trigger.tsx` or equivalent new feature component
  - `apps/web/src/components/expense/quick-add-expense-form.tsx` or equivalent compact form component if the existing full form is too large or mismatched
  - `apps/web/src/hooks/api/use-expense.ts`
  - `apps/web/src/hooks/api/use-reference-data.ts` (reuse only unless a missing selector/helper must be added)
  - `apps/web/src/hooks/api/use-households.ts` (reuse only unless a missing selector/helper must be added)
  - `apps/web/src/views/app/expenses-page.tsx`
  - `apps/web/src/lib/i18n/locales/vi.json`
  - `apps/web/src/app/manifest.ts` (only if app/PWA shortcut metadata is intentionally aligned to quick-add)
  - web test files covering trigger, form behavior, create success, error states, and Undo behavior.
- Shared/runtime integration scope:
  - Reuse `POST /api/v1/expenses` from `feat-017`.
  - Reuse `DELETE /api/v1/expenses/:id` from `feat-019` for Undo.
  - Reuse global static category/source catalogs from `feat-016`.
  - Reuse existing query invalidation patterns for expense feed/detail refresh from `feat-018` and current `use-expense` hooks.
- Harness/documentation continuity scope:
  - `docs/exec-plans/index.md`
  - `harness/feature_index.json`
  - `harness/features/feat-024.json`
  - `harness/progress.md`

Out of scope for this plan:

- Offline queueing, background sync, pending-entry recovery, and automatic retry behavior.
- Durable cross-session persistence of “last used source”; MVP uses session-local or launch-context-local defaulting only.
- ML/smart category defaults, heuristics, or analytics-driven suggestions.
- New backend routes, D1 schema changes, or worker contract expansion unless implementation discovery proves a missing existing contract; if that happens, stop and amend the plan instead of expanding silently.
- Group assignment UX in quick-add unless it can be shown to already exist as a trivial reuse with no scope expansion; current MVP quick-add should prefer omission over reintroducing heavy fields.
- Replacing the full Add Expense page; the quick-add flow complements it.
- Hidden global active-household state or any new app-wide household-selection store.

## Non-negotiable Requirements

- The plan must stay self-contained and executable without hidden assumptions.
- The implementation must produce observable proof via automated tests and feature verification commands.
- Quick-add must default to `private` visibility and require explicit household selection for any `household` submission.
- Quick-add must never depend on hidden global active-household state; only explicit in-form choice or launch-surface local context is allowed.
- MVP “last used source” behavior is session-local or launch-context-local only; no durable preference persistence belongs in `feat-024`.
- Undo must call the existing delete flow from `feat-019` within a 5-second success-toast window.
- The UI must preserve frontend decomposition rules: page/layout files orchestrate only, feature-bounded smart components own local quick-add behavior, and shared components are extracted only when truly cross-feature.
- New user-facing copy must be localized through i18n keys, not hardcoded strings.

## Progress

- [x] 2026-05-04 15:05 UTC — Reviewed required planning documents, harness state, product specs, and prior expense exec plans for `feat-017`, `feat-018`, and `feat-019`. Owner: Orchestrator.
- [x] 2026-05-04 15:18 UTC — Locked scope decisions for MVP quick-add: session-local source default only, Undo depends on existing delete support from `feat-019`, and offline/no-internet flows remain out of scope. Owner: Orchestrator.
- [x] 2026-05-04 16:13 UTC — Implemented the quick-add trigger and compact dialog at the protected-shell level using a floating action button plus guarded `q` shortcut handling in `main-layout.tsx` and new expense-scoped quick-add components. Owner: Orchestrator.
- [x] 2026-05-04 16:13 UTC — Implemented compact quick-add form wiring with amount autofocus, session-scoped last-used-source memory, explicit household validation, and current-user payer defaulting for household submissions. Owner: Orchestrator.
- [x] 2026-05-04 16:13 UTC — Implemented 5-second Undo toast behavior by reusing the existing delete mutation and added regression coverage for quick-add submit, household validation, payer defaulting, session source restore, and Undo delete behavior. Owner: Orchestrator.
- [x] 2026-05-04 16:14 UTC — Ran full verification via `./init.sh`, updated harness evidence, and moved the plan entry to Completed. Owner: Orchestrator.

## Surprises & Discoveries

- `feat-024` is described as frontend-only in harness, but the Undo requirement effectively depends on backend delete support from `feat-019`; the original dependency list in `harness/features/feat-024.json` omits that relationship and should be corrected during plan registration.
- The current web shell has no existing FAB component, no quick-add provider, and no bottom-sheet/drawer primitive already in use. `Dialog` exists today and is the safest baseline overlay unless implementation adds a compliant `Drawer`/`Sheet` intentionally.
- The current expense form stack is designed for the full add/edit page flow rather than a 2–3 second compact capture path. Reuse should focus on field logic and mutation wiring, not copying the whole page-oriented form wholesale.
- Existing keyboard shortcut precedent lives in `apps/web/src/components/theme-provider.tsx` with guardrails for editable targets and modifier keys. Quick-add should reuse that discipline rather than invent ad hoc event handling.

## Decision Log

- Decision: Treat `feat-024` as a `frontend` domain ExecPlan with runtime integration dependencies, not a new backend feature.
  Rationale: The scoped behavior reuses existing create and delete APIs and primarily concerns UI entry, local form defaults, and mutation orchestration.
  Date/Author: 2026-05-04 / Orchestrator.

- Decision: MVP “last used source” behavior is session-local or launch-context-local only.
  Rationale: The user explicitly chose the recommended interpretation, and durable cross-session persistence belongs in post-MVP smart-defaults follow-up work rather than the MVP quick-add surface.
  Date/Author: 2026-05-04 / Orchestrator.

- Decision: Undo is in scope and depends explicitly on `feat-019` delete support.
  Rationale: The quick-add success contract requires a reversible 5-second window; the cleanest scoped implementation is to reuse the existing `DELETE /api/v1/expenses/:id` flow rather than invent client-only rollback semantics.
  Date/Author: 2026-05-04 / Orchestrator.

- Decision: Do not use hidden global active-household state.
  Rationale: This is explicitly prohibited in `harness/features/feat-024.json`, `quick-add-experience.md`, and `data-visibility.md`; any household sharing must come from explicit quick-add selection or local launch context.
  Date/Author: 2026-05-04 / Orchestrator.

- Decision: Prefer an existing overlay primitive (`Dialog`) unless implementation proves a compliant `Drawer`/`Sheet` is both available and lower risk.
  Rationale: The repository already uses `Dialog`, while no current bottom-sheet primitive was discovered in active use; the plan should optimize for repeatable delivery rather than speculative visual abstraction.
  Date/Author: 2026-05-04 / Orchestrator.

## Outcomes & Retrospective

- Outcome: users can create a private expense quickly from anywhere in the protected app through a global floating trigger or `q` shortcut, optionally switch to explicit household-sharing, and immediately undo a mistaken submission within 5 seconds.
- Verification completed: `pnpm --filter web test -- quick-add-expense-dialog quick-add-expense-trigger`; `./init.sh`.
- Follow-up note: the MVP ships on the existing `Dialog` primitive and intentionally uses session storage for last-used source memory; richer drawer ergonomics and durable/smarter defaults remain appropriate follow-up work for `feat-025` or a future UX-focused feature, while offline capture remains out of product scope.

## Context and Orientation

- Feature and product source of truth:
  - `harness/features/feat-024.json` — authoritative quick-add scope, constraints, and original dependency declaration.
  - `docs/product-specs/quick-add-experience.md` — goal, acceptance criteria, failure states, and MVP boundaries.
  - `docs/product-specs/expense-tracking.md` — expense-capture behavior, explicit visibility requirements, and telemetry intent.
  - `docs/product-specs/data-visibility.md` — explicit household-selection and authorization semantics for shared expenses.
- Dependency features already implemented:
  - `harness/features/feat-016.json` — global static categories and sources.
  - `harness/features/feat-017.json` — expense create flow and visibility-aware create API.
  - `harness/features/feat-018.json` — expense feed/detail read behavior and cache consumers.
  - `harness/features/feat-019.json` — delete support required for Undo.
  - `harness/features/feat-025.json` — post-MVP smart-defaults work that must stay out of scope.
  - `harness/features/feat-030.json` — onboarding depends on feat-024 and will later surface quick-add as a CTA.
- Existing web integration baseline:
  - `apps/web/src/components/layouts/main-layout.tsx` — best global app shell insertion point for quick-add trigger/UI.
  - `apps/web/src/components/layouts/bottom-tab.tsx` — mobile nav overlap constraint for FAB placement.
  - `apps/web/src/views/app/expenses-page.tsx` — existing expense page CTA and feed consumer.
  - `apps/web/src/components/expense/expense-form.tsx` — current full create/edit form boundary.
  - `apps/web/src/components/expense/expense-form-fields.tsx` — reusable field sections and likely source of compact-field reuse.
  - `apps/web/src/components/expense/use-expense-form.ts` — create mutation orchestration and form defaults.
  - `apps/web/src/hooks/api/use-expense.ts` — mutation/query hooks and invalidation patterns.
  - `apps/web/src/api/expense.ts` — typed transport for create/delete.
  - `apps/web/src/lib/forms/expense.schema.ts` — existing schema constraints, including household requirement when visibility is `household`.
  - `apps/web/src/components/ui/dialog.tsx` and `apps/web/src/components/ui/sonner.tsx` — current overlay and toast infrastructure.
  - `apps/web/src/components/theme-provider.tsx` — keyboard shortcut guard pattern precedent.
- Related prior ExecPlans for pattern reference:
  - `docs/exec-plans/plans/2026-04-30-feat-017-expense-entry-create-flow.md`
  - `docs/exec-plans/plans/2026-05-02-feat-018-expense-detail-activity-feed.md`
  - `docs/exec-plans/plans/2026-05-03-feat-019-expense-update-delete-restore-lifecycle.md`

## Standards and Implementation Notes

### Required references for implementation

- Frontend mandatory docs:
  - `docs/FRONTEND.md`
  - `docs/references/frontend/project-folder-structure.md`
  - `docs/references/frontend/component-structure-pattern.md`
  - `docs/references/frontend/naming-and-conventions-pattern.md`
  - `docs/references/frontend/form-pattern.md`
  - `docs/references/frontend/dialog-and-form-pattern.md`
  - `docs/references/frontend/api-react-query-pattern.md`
  - `docs/references/frontend/i18n-label-pattern.md`
  - `docs/design-docs/shadcn-card-composition-architecture-guide.md`
  - `.agents/skills/shadcn/SKILL.md`
  - `.agents/skills/shadcn/rules/styling.md`
  - `.agents/skills/shadcn/rules/forms.md`
  - `.agents/skills/shadcn/rules/composition.md`
- Shared mandatory docs:
  - `docs/references/shared/type-naming-pattern.md`

### Concrete coding constraints derived from the standards matrix

- Keep feature-specific quick-add code in `apps/web/src/components/expense/*` or `apps/web/src/hooks/<feature>`-appropriate locations; do not dump feature logic into `lib`.
- Page/layout files remain orchestrators only; compact form submit logic, dialog open/close behavior, shortcut handling, and toast/delete orchestration belong in feature-bounded smart components.
- Prefer named exports and kebab-case file names with folder `index.ts` exports for public feature components.
- Use React Query hooks from `use-expense.ts`; UI must not call raw API functions directly.
- Keep form validation/schema centralized and complete; if quick-add needs a smaller schema or defaults mapper, define it explicitly rather than overloading the full add-expense page contract implicitly.
- Use `FieldGroup` + `Field`, proper `data-invalid`/`aria-invalid`, and shadcn primitives directly; do not build bespoke form markup or wrapper replacements around base primitives.
- Use `toast()`/`toast.success()` from `sonner` for notifications; the Undo action should use the documented action API instead of custom inline markup.
- Use semantic tokens and built-in variants; avoid ad hoc overlay z-index tuning except where shell layout spacing requires non-overlay container adjustments.
- Add all new quick-add labels, hints, validation messages, and toast text to i18n locale files; do not hardcode copy in JSX or Zod schemas.

### Implementation Notes

- Mandatory patterns for this scope:
  - Global trigger should be injected at the protected-shell level, not duplicated independently on many pages.
  - Quick-add should prefer a compact subset of expense fields: amount first, source required, category optional or fast-select according to existing create rules, visibility explicit, household shown only when relevant.
  - If the existing full `ExpenseForm` cannot be adapted cleanly without growing more complex, create a quick-add-specific compact form component that reuses only the field primitives and shared mutation helpers needed.
  - Session-local “last used source” may live in component state, query cache, or browser-session storage only if it can be implemented without leaking into durable preference scope.
- Companion skills for implementation:
  - `tdd-workflow`
  - `security-review`
  - `documentation-lookup`
  - `frontend-patterns`
  - `verification-loop`
- Common pitfalls to avoid:
  - Do not silently add durable preferences, offline logic, or queued-save behavior.
  - Do not infer a household from hidden global app state.
  - Do not expand the quick-add surface into a second full add-expense page.
  - Do not forget that Undo can fail with authorization/network errors; the UI must surface a clear error and leave the feed consistent.

## Interfaces & Dependencies

- Internal runtime/API dependencies:
  - `createExpense(payload: CreateExpenseRequest)` in `apps/web/src/api/expense.ts` — existing create transport reused by quick-add.
  - `deleteExpense(expenseId: string)` in `apps/web/src/api/expense.ts` — existing delete transport reused by Undo.
  - `useCreateExpenseMutation()` and `useDeleteExpenseMutation()` in `apps/web/src/hooks/api/use-expense.ts` — mutation boundaries for create and Undo.
  - Existing `ExpenseDTO`, create request types, and feed/detail query keys in `apps/web/src/types/expense.ts` and `apps/web/src/hooks/api/use-expense.ts`.
- UI/component dependencies:
  - `Dialog` or another existing shadcn-compliant overlay primitive.
  - `sonner` toast action API for Undo.
  - existing category/source picker components from `feat-016`.
- Layer impact check using `Types -> Config -> Repo -> Service -> Runtime -> UI`:
  - `Types`: existing expense DTO/request types may gain only minimal frontend helper typing if required.
  - `Config`: possible update to manifest shortcut metadata only if explicitly used.
  - `Repo`: no direct repo/database changes planned.
  - `Service`: existing worker create/delete service boundaries are reused only.
  - `Runtime`: web API hooks/mutation orchestration and cache invalidation are touched.
  - `UI`: main quick-add trigger, overlay, compact form, success/error/undo states.
- Hard dependency rule checks from `ARCHITECTURE.md`:
  - Lower layers remain unchanged; no UI bypass of runtime/service contracts.
  - Data access stays behind existing API/hooks, never directly from UI.
  - No new dependency should be introduced unless the overlay or session helper cannot be delivered from existing stack; if a new dependency appears necessary, implementation must stop and justify it in the plan before proceeding.

## Plan of Work (Narrative)

1. **Confirm the smallest viable quick-add architecture at the shell boundary.** Update `apps/web/src/components/layouts/main-layout.tsx` to host a single global quick-add entry point for authenticated/protected routes. The trigger set must include a visible floating action button and a keyboard shortcut handler with editable-target guards, so quick-add can be invoked consistently without page-by-page duplication.

2. **Create feature-bounded quick-add UI components instead of overloading existing page forms.** Add a new quick-add overlay component and supporting trigger/form components under `apps/web/src/components/expense/`. Reuse current field building blocks and schema/mutation helpers only where doing so keeps the code smaller and clearer. If the existing `expense-form.tsx` can contribute reusable subsections, extract only those parts directly needed for the compact quick-add flow.

3. **Implement compact defaulting and explicit visibility behavior.** The quick-add form should open with amount focused immediately, private visibility selected by default, date defaulted to today, payer defaulted to the current user, and source defaulted from session-local last-used state or local launch context only. When the user switches visibility to household, the UI must require an explicit household selection inside the quick-add flow unless a launch surface passes a clear local household context.

4. **Wire quick-add to existing runtime contracts without creating parallel transport.** Reuse `useCreateExpenseMutation()` and existing request types; add only the smallest necessary hook enhancements for quick-add-specific success callbacks, invalidation handling, or local session-default updates. Avoid creating duplicate API modules or duplicate mutation hooks.

5. **Add Undo toast behavior on successful create.** After a successful quick-add submission, show a success toast with a 5-second Undo action that calls the existing delete mutation for the just-created expense. Ensure the action updates the same invalidation scopes used elsewhere so feeds, summaries, and detail views return to a consistent state. If Undo fails, show a clear error toast and keep the created expense visible.

6. **Integrate page-level affordances conservatively.** Update `apps/web/src/views/app/expenses-page.tsx` only as needed to keep the existing Add Expense affordance coherent with the new global quick-add flow. The full add-expense page remains the advanced/fallback flow for richer metadata entry.

7. **Localize copy and capture verification evidence.** Add all quick-add labels, helper text, validation messages, shortcut hints, and toast strings to i18n files. Add focused component/page tests for trigger visibility, dialog open/close, amount autofocus, household-required behavior when switching to shared visibility, create success, retryable error state, and Undo delete behavior. Finish with full repo verification and harness evidence updates.

## Concrete Steps (Commands)

Run from repo root unless noted otherwise.

```bash
# Baseline verification before implementation
./init.sh

# Focused web tests during quick-add implementation
pnpm --filter web test

# Focused type/lint loop for quick-add UI changes
pnpm --filter web lint
pnpm --filter web typecheck

# Optional focused test runs for expense-related suites once created/updated
pnpm --filter web test -- quick-add
pnpm --filter web test -- expense

# Final full verification
./init.sh
```

Expected short outputs to compare against:

- `./init.sh` completes with install/harness checks/lint/type-check/tests/build succeeding.
- `pnpm --filter web test` ends with `0 failed`, including the new quick-add coverage.
- `pnpm --filter web lint` and `pnpm --filter web typecheck` exit successfully with no errors.

## Validation and Acceptance

### Happy-path acceptance

- Opening quick-add from the global trigger displays the overlay and focuses the amount input immediately.
- Submitting a minimal private expense through quick-add succeeds with sensible defaults and shows a success toast.
- The new expense appears in the expense feed after cache invalidation/refetch.
- Clicking Undo within the toast window deletes the created expense successfully and removes it from the feed again.

### Validation and error-path checks

- Invalid amount prevents submission and shows inline validation.
- Network failure on create shows a clear retryable error state; no offline queueing behavior is implied or supported.
- If the user switches visibility to household without selecting a household, submission is blocked with clear validation.
- If delete fails during Undo, the app shows an error toast and leaves the created expense present.

### Unauthorized / forbidden checks

- If household create fails due to permission rules from the backend, the user sees a clear error and can still choose to save privately if they want.
- Quick-add must never submit a household expense using an implicit hidden household id.

### Regression checks

- Existing full Add Expense page remains functional and is not replaced by quick-add.
- Existing expense feed/detail flows continue to react correctly to create and delete invalidation.
- Existing keyboard shortcuts such as theme toggle do not break, and quick-add shortcut ignores editable text targets.

### Concrete acceptance artifacts

- Web test output covering trigger/open/submit/Undo behavior.
- `./init.sh` transcript showing clean verification.
- Optional captured toast/action test assertions if the test utilities can observe sonner output directly.

## Verification Path

- Start with `./init.sh` to ensure the workspace is clean before feature work.
- During implementation, run focused `pnpm --filter web test`, `pnpm --filter web lint`, and `pnpm --filter web typecheck` loops after each bounded change.
- Before marking the feature done, run `./init.sh` again from repo root and record the successful transcript in harness evidence.

## Idempotence & Recovery

- The planned web-only changes are safe to re-run: test, lint, typecheck, and build commands are idempotent.
- Reopening and reusing the quick-add overlay repeatedly must not accumulate stale state across sessions; implementation should reset transient form state on successful submit and on dismiss where appropriate.
- Undo logic must tolerate duplicate or expired clicks gracefully by surfacing an error rather than leaving caches inconsistent.
- No destructive schema or infrastructure operations are planned, so rollback is standard git/file rollback rather than data restore.

## Risks and Blockers

- **Overlay primitive risk:** the repository currently uses `Dialog`, but the product language suggests a compact modal or bottom-sheet. Forcing a new drawer primitive can increase scope; start with the existing compliant primitive unless implementation evidence justifies more.
- **Form-complexity risk:** reusing the entire existing expense form may harm the 2–3 second goal. The implementation should bias toward a compact feature-specific component.
- **Undo timing risk:** the toast action is time-bounded and depends on delete mutation success; tests must verify behavior around timing and failure states without introducing flaky timers.
- **Household-context risk:** any shortcut integration that infers a selected household globally would violate the product spec.
- **Dependency hygiene risk:** if implementation discovers that `feat-019` delete behavior cannot be reused cleanly from current web hooks, pause and amend this plan instead of adding hidden backend work.

## Harness Integration

- Update `harness/features/feat-024.json` when implementation begins and ends:
  - mark status appropriately,
  - correct dependencies to include `feat-019`,
  - attach evidence paths/tests once verification passes.
- Update `harness/feature_index.json` to mirror the feature status transition.
- Add newest-first progress entries in `harness/progress.md` for:
  - plan creation,
  - implementation completion,
  - blockers or follow-up notes if any.
- Keep `docs/exec-plans/index.md` accurate by listing this plan under `Active` now and moving it to `Completed` only after verification/evidence are finished.

## Artifacts and Notes

- Primary acceptance artifact should be web test output proving quick-add open/submit/Undo behavior.
- Secondary artifact should be the final `./init.sh` transcript.
- If implementation adds a quick-add-specific component tree, keep a short file list in harness evidence so later sessions can locate the main entry points quickly.

## Open Decisions

- Resolved in implementation: the MVP remains on `Dialog` to avoid scope creep and reuse an existing compliant primitive.
- Resolved in implementation: session-local “last used source” uses `sessionStorage` via shared browser-storage helpers.
- Resolved in implementation: the first MVP requires explicit in-form household selection for shared entries and does not pass household context from additional launch surfaces.
