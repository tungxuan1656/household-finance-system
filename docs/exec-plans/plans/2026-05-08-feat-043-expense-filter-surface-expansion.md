# feat-043 — Expense filter surface expansion to match backend querying capabilities

## Title

Expand `/expenses` into a mobile-first expense exploration surface that exposes the richer filtering and sorting capabilities already supported by current contracts.

## Purpose / Big Picture

Implement a frontend-first upgrade of the current `/expenses` route so users can ask more useful day-to-day questions of their expense history without leaving the existing feed architecture. After this feature lands, authenticated users should be able to narrow expense results by time, amount, payer, group, visibility, and sort direction from a mobile-first responsive UI, while keeping the existing summary card and cursor-based feed behavior coherent.

This plan intentionally prioritizes exposing already-supported filtering power before inventing new backend capabilities. Users should observe a more controllable expense feed that remains fast to scan on mobile, keeps summary totals aligned with active filters, and preserves the current card-based feed/detail navigation instead of replacing it with a denser desktop-only table or an advanced analytics surface.

## Scope

- Planned frontend areas:
  - `apps/web/src/app/(protected)/expenses/page.tsx`
  - `apps/web/src/views/app/expenses-page.tsx`
  - New or expanded expense exploration components under `apps/web/src/components/expense/*`
  - `apps/web/src/components/expense/index.ts` if new public components are introduced
  - `apps/web/src/components/expense/expense-feed-list.tsx`
  - `apps/web/src/components/expense/expense-feed-summary.tsx`
  - `apps/web/src/hooks/api/use-expense.ts` only for additive query wiring or query-key shaping
  - `apps/web/src/api/expense.ts` only if an additive client helper is required for existing contract fields
  - `apps/web/src/types/expense.ts` only if additive frontend list/sort typing is needed to reflect currently supported contracts
  - `apps/web/src/hooks/api/use-reference-data.ts` if existing reference-data hooks need small additive reuse for filter options
  - `apps/web/src/hooks/api/use-households.ts` or existing household selectors only if household or payer filter options need truthful reuse of current data sources
  - `apps/web/src/lib/i18n/locales/vi.json`
  - New or updated tests near `apps/web/src/views/app/` and `apps/web/src/components/expense/`
- Existing backend/runtime contracts reused first and only expanded if current product semantics prove insufficient:
  - `GET /api/v1/expenses`
  - `GET /api/v1/expenses/summary`
  - Existing reference-data endpoints for categories/sources
  - Existing household/member data already available to the web app for filter option composition
- Potential backend touch points only if execution confirms a genuine product gap rather than an unexposed existing capability:
  - `apps/worker/src/contracts/expense-schemas.ts`
  - `apps/worker/src/contracts/expense-types.ts`
  - `apps/worker/src/handlers/expenses/list-expenses.ts`
  - `apps/worker/src/handlers/expenses/get-expense-summary.ts`
  - `apps/worker/src/db/repositories/expense-query-repository.ts`
  - Related worker tests for query validation or search semantics
- Continuity and planning artifacts:
  - `docs/exec-plans/index.md`
  - `harness/features/feat-043.json`
  - `harness/feature_index.json`
  - `harness/progress.md`

Out of scope for this plan:

- Replacing the current feed with an analytics dashboard, data table, or export workflow already reserved for `feat-044`.
- Reworking expense create/edit/delete/detail flows beyond the minimum needed to preserve filter-aware navigation.
- Adding offline query-state persistence, saved views, or cross-route global filter state.
- Introducing a hidden active-household model to simplify filtering.
- Building arbitrary comparison charts or budget-linked insights already owned by `/insights` and later dashboard work.
- Broad backend search redesign unless implementation proves the current backend only supports a materially narrower user-visible search than this feature requires; any such gap must be logged explicitly before scope broadens.
- Multi-feature state-management rewrites across expenses, households, or groups unless a very small additive refactor is required to keep the page maintainable.

## Non-negotiable Requirements

- The plan must stay self-contained and implementation-ready for a human or coding agent.
- `feat-043` is primarily locked to a `frontend` outcome: expose the already-supported backend filtering/sorting power in the UI before adding new worker scope.
- `/expenses` must remain mobile-first and responsive; additional controls cannot degrade the current small-screen usability of the feed.
- The feed summary and list must always use the same active filter model so totals remain truthful.
- Cursor pagination must remain authoritative and stable when filters or sort change.
- User-facing text must remain fully i18n-backed; no hardcoded labels or validation copy may be introduced.
- The implementation must follow the repository’s orchestrator-first view/component split and shadcn composition rules.
- No new dependency may be introduced unless implementation proves the existing stack cannot satisfy the UI need; any new dependency must be justified in the plan before adoption.
- UI/UX quality is part of the acceptance bar: clearer hierarchy, touch-safe controls, explicit loading/empty/error states, and accessible filtering interactions are required outcomes.
- If implementation discovers a backend gap that materially changes the user-visible search/filter promise, it must stop, document the gap, and either narrow the UI scope or add a bounded follow-up decision instead of silently expanding the feature.

## Progress

- [x] 2026-05-08 00:00 UTC — Reviewed planning requirements, architecture rules, harness continuity, and the next pending feature record (`feat-043`). Owner: Orchestrator.
- [x] 2026-05-08 00:00 UTC — Mapped the current `/expenses` surface, existing feed/list/summary components, current exposed controls, and already-supported backend query contract fields. Owner: Orchestrator.
- [x] 2026-05-08 00:00 UTC — Reviewed frontend, shadcn, and UI/UX constraints for a mobile-first filter expansion path and locked the plan to a frontend-first approach. Owner: Orchestrator.
- [x] 2026-05-08 00:00 UTC — Created and registered the active ExecPlan for `feat-043`. Owner: Orchestrator.
- [ ] 2026-05-08 00:00 UTC — Decide the smallest high-value filter set to expose in the first pass and confirm whether any intended control depends on a true backend gap versus existing contract coverage. Owner: Implementation agent. Status: current step.
- [ ] 2026-05-08 00:00 UTC — Refactor `/expenses` into a thin orchestrator plus feature-bounded filter/control components that preserve summary/feed alignment and responsive behavior. Owner: Implementation agent.
- [ ] 2026-05-08 00:00 UTC — Add or update focused tests for filter state, summary/list query alignment, reset/refetch behavior, and mobile-safe loading/error/empty states. Owner: Implementation agent.
- [ ] 2026-05-08 00:00 UTC — Run verification, update harness evidence, and move the plan to Completed once implementation is fully verified. Owner: Implementation agent.

## Surprises & Discoveries

- The current `/expenses` page only exposes search, visibility, and category despite the existing frontend/backend contracts already supporting date range, amount range, payer, group, creator, household, and sort.
- The current expense feed still uses a strong mobile-safe card/list shape, so the main design challenge is not data availability but control density and responsive hierarchy.
- The current feed summary and list are already separated components driven by shared filter props, which is a good seam for expansion and should be preserved.
- Current backend `query` behavior appears to search note text rather than a broader user-facing expense surface. If implementation wants to promise broader “search expenses” behavior, that may require a deliberate backend scope decision instead of a silent assumption.
- The existing route relies on inline raw `<input>` plus `NativeSelect` controls in a single page file; even a frontend-only feature will likely need early component extraction to keep the page under control.

## Decision Log

- Decision: Treat `feat-043` as a frontend-first feature unless implementation proves a specific existing contract is insufficient for the promised first-pass filter set.
  Rationale: The feature record explicitly frames the gap as discoverability of backend capabilities already present, so the lowest-risk delivery path is to expose current power before changing worker behavior.
  Date/Author: 2026-05-08 / Orchestrator.

- Decision: Preserve the existing feed-card and summary architecture instead of replacing the route with a new analytics or table experience.
  Rationale: The current feed is already aligned with mobile use, detail navigation, and cursor pagination; this feature should deepen exploration, not replace the product surface.
  Date/Author: 2026-05-08 / Orchestrator.

- Decision: Prefer a layered mobile-first control model, with a compact always-visible summary of active filters and a responsive advanced-filter surface, rather than forcing every control inline on narrow screens.
  Rationale: The current contract supports more filters than comfortably fit in one mobile row, and the feature record explicitly requires remaining mobile-friendly.
  Date/Author: 2026-05-08 / Orchestrator.

- Decision: Keep filter state page-local and query-driven unless implementation proves a cross-route persistence need.
  Rationale: Current product behavior does not require saved views or route-global expense filters, and adding a store would broaden scope unnecessarily.
  Date/Author: 2026-05-08 / Orchestrator.

- Decision: If broader text search semantics become necessary, record that as an explicit backend decision rather than burying it inside a frontend ticket.
  Rationale: Search semantics affect product expectation, validation, repository queries, and summary alignment, so that scope boundary must remain visible.
  Date/Author: 2026-05-08 / Orchestrator.

## Outcomes & Retrospective

- Target outcome: `/expenses` becomes a practical exploration surface where users can quickly narrow large feeds by the dimensions they already care about most—time, amount, payer, group, visibility, and sort—without losing mobile usability.
- Verification target: the route renders a clearer responsive filter experience, summary totals stay aligned with the active filter model, and the feed still paginates and navigates predictably.
- Expected acceptance artifact: successful expense-page/component tests plus a passing `./init.sh` transcript recorded in harness evidence.
- Expected follow-up boundary: if broader server-side search semantics, saved filters, or export interactions are required, they should become explicit follow-up work rather than leaking into this implementation.

## Context and Orientation

- User-facing navigation and route surface:
  - `apps/web/src/app/(protected)/expenses/page.tsx` — App Router entry for `/expenses`.
  - `apps/web/src/views/app/expenses-page.tsx` — current expense feed orchestrator with inline search and two selects.
  - `apps/web/src/app/(protected)/expenses/[id]/page.tsx` and `apps/web/src/views/app/expense-detail-page.tsx` — downstream detail route the feed must continue to navigate into.
- Existing expense frontend boundaries:
  - `apps/web/src/components/expense/expense-feed-list.tsx`
  - `apps/web/src/components/expense/expense-feed-summary.tsx`
  - `apps/web/src/components/expense/expense-feed-item.tsx`
  - `apps/web/src/hooks/api/use-expense.ts`
  - `apps/web/src/api/expense.ts`
  - `apps/web/src/types/expense.ts`
- Existing reusable filter-option or supporting sources:
  - `apps/web/src/hooks/api/use-reference-data.ts` — category/source catalogs.
  - Existing household/member data hooks/store selectors used elsewhere in the app if payer or household-scoped options need truthful reuse.
  - Existing groups UI/query surfaces from `feat-022` and `feat-023` if group options need to be surfaced.
- Existing backend/runtime contracts that remain the source of truth unless explicitly broadened:
  - `apps/worker/src/routes/expenses.ts`
  - `apps/worker/src/handlers/expenses/list-expenses.ts`
  - `apps/worker/src/handlers/expenses/get-expense-summary.ts`
  - `apps/worker/src/contracts/expense-schemas.ts`
  - `apps/worker/src/contracts/expense-types.ts`
  - `apps/worker/src/db/repositories/expense-query-repository.ts`
- Plan and harness continuity:
  - `docs/PLANS.md`
  - `docs/exec-plans/__plan-template__.md`
  - `docs/exec-plans/index.md`
  - `harness/features/feat-043.json`
  - `harness/feature_index.json`
  - `harness/progress.md`

## Standards and Implementation Notes

### Required references for implementation

- Planning and shared execution rules:
  - `AGENTS.md`
  - `ARCHITECTURE.md`
  - `docs/PLANS.md`
  - `docs/exec-plans/__plan-template__.md`
  - `docs/exec-plans/index.md`
  - `docs/knowledge/harness-engineering.md`
  - `docs/knowledge/codex-exec-plan.md`
  - `docs/references/index.md`
- Frontend standards required by scope:
  - `docs/FRONTEND.md`
  - `docs/references/frontend/project-folder-structure.md`
  - `docs/references/frontend/component-structure-pattern.md`
  - `docs/references/frontend/naming-and-conventions-pattern.md`
  - `docs/references/frontend/api-react-query-pattern.md`
  - `docs/references/frontend/form-pattern.md` if the implementation formalizes filter controls as a structured form surface
  - `docs/references/frontend/dialog-and-form-pattern.md` if advanced filters use a dialog, drawer, or sheet flow
  - `docs/references/frontend/i18n-label-pattern.md`
- Shared standards required by scope:
  - `docs/references/shared/type-naming-pattern.md`
- Required shadcn governance pre-read for UI work:
  - `.agents/skills/shadcn/SKILL.md`
  - `.agents/skills/shadcn/rules/styling.md`
  - `.agents/skills/shadcn/rules/forms.md`
  - `.agents/skills/shadcn/rules/composition.md`

### Concrete coding constraints derived from standards matrix

- Keep App Router page files thin: route-level files should only hand off to the view/orchestrator component.
- Keep view orchestration in `apps/web/src/views/app/*` and feature-bounded smart components in `apps/web/src/components/expense/*`.
- Use `kebab-case` file names, `export const` component exports, and barrel `index.ts` files only for public expense-filter components.
- Promote code to shared locations only when it is truly cross-feature reusable; do not move expense-exploration-specific logic into `lib`.
- UI must call typed hooks only; components must not call API modules directly.
- Before adding a new query/hook, confirm the needed data cannot be derived from an existing query or current household/group state.
- Include the filter object in React Query keys so summary and list cache entries stay isolated and refetch correctly when filters change.
- All user-facing copy, helper text, and filter labels must use i18n keys in locale files; no JSX hardcoded strings or manual interpolation.
- Use shadcn primitives and composition patterns for controls and states (`Card`, `Button`, `Alert`, `Badge`, `Skeleton`, `Drawer`, `Sheet`, `Dialog`, `Separator`, `ToggleGroup`, `FieldGroup`, `Field`) instead of ad hoc primitives.
- Use semantic color tokens and existing variants; do not restyle primitives with raw color overrides.
- Preserve touch-safe targets and visible focus states across any new mobile filter affordances.

### Implementation Notes

- Mandatory patterns for this scope:
  - Build `/expenses` as a thin orchestrator that owns the active filter state and passes one truthful filter model to summary and feed components.
  - Keep the first pass to a small but high-value filter set that closes the main capability gap without overwhelming mobile users. Recommended first-pass controls: search, visibility, category, sort, date range, amount range, and one of payer/group depending on option-source readiness.
  - Represent “advanced” filters in a mobile-friendly overlay surface (`Drawer` or `Sheet`) or an equivalent bounded panel rather than forcing every control inline on narrow screens.
  - Keep a lightweight active-filter summary/chip area or equivalent state summary visible on the main page so users understand why the feed changed after closing the advanced controls.
  - Keep reset behavior explicit and predictable; changing filters should safely refetch and restart pagination from the first page.
  - Keep the summary card truthful to the current active filter model and update it with the same query shape as the feed list.
- Companion skills recommended for implementation:
  - `test-driven-development` for adding filter-state and page-behavior regressions before or alongside implementation.
  - `frontend-patterns` for React/Next component architecture and query-driven state handling.
  - `ui-ux-pro-max` for mobile-first responsive hierarchy, touch targets, accessibility, and filter-density tradeoffs during implementation review.
  - `verification-before-completion` for final evidence gathering.
  - `requesting-code-review` for implementation review before merge.
  - `documentation-lookup` if implementation depends on current shadcn, Next.js App Router, or React Query APIs.
  - `security-reviewer` only if implementation broadens backend query semantics or exposes sensitive household/member option data in a new way.
- Common pitfalls to avoid:
  - Do not expose more simultaneous controls than mobile users can parse without an overlay or clear hierarchy.
  - Do not let summary and list drift onto different filter objects.
  - Do not add a global store for convenience when page-local state is sufficient.
  - Do not assume current backend search semantics are broader than they are.
  - Do not regress the current card-based feed into a desktop-centric dense layout.
  - Do not rely on manual QA only; direct regression coverage is required.

### UI/UX implementation constraints for this scope

- Preserve a mobile-first layout that works at 375px before widening into tablet/desktop rows.
- Ensure primary interactions use minimum touch-target sizes of roughly 44x44px and avoid hover-only affordances.
- Keep always-visible inline controls limited to the highest-frequency actions; secondary filters should move into an accessible overlay or bounded expansion pattern.
- Use a clearer hierarchy than the current raw inline controls: heading + primary action, active filter summary, compact summary card, then the feed list.
- Use shadcn `Skeleton` states for loading surfaces rather than text-only placeholders so layout remains stable.
- Use an accessible error surface (`Alert` or equivalent `role="alert"`) for list/filter failures and provide retry/reset affordances.
- Avoid uncontrolled horizontal scrolling in the filter area on mobile.
- Keep any filter-state indicators readable in both light and dark themes with semantic tokens and non-color-only meaning.

## Interfaces & Dependencies

- Internal frontend interfaces:
  - `useInfiniteExpenseListQuery()` and `useExpenseSummaryQuery()` from `apps/web/src/hooks/api/use-expense.ts`
  - Existing query keys in `EXPENSE_KEYS`
  - Existing category labels from `apps/web/src/lib/reference-data/labels.ts`
  - Existing reference-data hooks for filter option sources
  - Existing route constants from `apps/web/src/lib/constants/paths.ts`
  - Existing i18n translation utilities
- Existing backend/runtime contracts reused by the UI:
  - `GET /api/v1/expenses`
  - `GET /api/v1/expenses/summary`
  - Existing household/member/group/reference-data endpoints already available to the frontend for option composition
- Layer impact check using `Types -> Config -> Repo -> Service -> Runtime -> UI` from `ARCHITECTURE.md`:
  - `Types`: possibly additive frontend list-filter and view-model typing; shared runtime DTOs should stay unchanged unless a proven backend gap appears.
  - `Config`: i18n keys and optional route/constants may change.
  - `Repo`: unchanged in the frontend-first path; only touched if a documented backend gap is approved.
  - `Service`: unchanged in the frontend-first path.
  - `Runtime`: unchanged in the frontend-first path; UI must consume existing runtime/service contracts only.
  - `UI`: primary layer impacted.
- Hard dependency rule checks:
  - Lower layers do not depend on higher layers because the default path is frontend-only composition work.
  - UI must not bypass runtime/service contracts; all list/summary data and option data must use existing hooks or explicit adapters.
  - Data access remains through repository-backed worker routes already exposed to the frontend.
- New dependency expectation:
  - No new dependency is expected. If implementation believes a new dependency is required for filter UI composition, stop and justify it explicitly in the decision log before adoption.

## Plan of Work (Narrative)

1. **Lock the first-pass filter surface to the smallest high-value set.** Start by auditing the currently supported contract fields against the current page and choose the minimum set that materially closes the product gap without producing a crowded mobile UI. The expected first-pass set is search, visibility, category, sort, date range, amount range, and one contextual actor dimension (payer or group) if option data is already readily available from current frontend state or existing hooks.

2. **Split `/expenses` into an orchestrator plus bounded filter components.** Keep `apps/web/src/views/app/expenses-page.tsx` responsible for route-level composition and active filter state only. Move the richer control UI into new expense feature components such as a compact filter bar, advanced-filter overlay, and active-filter summary so the page remains reviewable and testable.

3. **Preserve one truthful filter model shared by summary and feed.** Centralize a normalized `ExpenseListParams` model derived from user input, including trimming search, omitting empty values, and restarting pagination when the model changes. Pass that same object to `ExpenseFeedSummary` and `ExpenseFeedList` so both stay consistent.

4. **Introduce a mobile-first advanced-filter interaction.** Keep the highest-frequency controls directly available and move the denser filters into a bounded `Drawer`, `Sheet`, or equivalent mobile-safe composition. The advanced surface should support clear apply/reset actions, explicit titles for accessibility, and a concise summary of what is active once the user returns to the feed.

5. **Improve feedback states while preserving the current feed architecture.** Replace any text-only or overly bare filter/loading feedback with better hierarchy: active filter summary, compact filtered totals, feed skeletons, and accessible retry/error treatment. Preserve the card-based feed item layout and current detail navigation.

6. **Only broaden backend behavior if a specific gap is proven.** If implementation discovers that a planned user-visible filter or search promise is not actually supported by current worker semantics, document the exact gap and choose one of two constrained paths: narrow the UI promise to match current truth, or add a small explicitly approved backend follow-up inside this feature with matching validation/tests and summary alignment.

7. **Add focused regression coverage and finish through the harness path.** Add page/component tests for filter state ownership, query parameter normalization, summary/list alignment, reset behavior, and key mobile-safe states. Then run frontend verification and the repo-wide `./init.sh`, and record evidence in harness artifacts before marking the feature done.

## Concrete Steps (Commands)

Run from repository root: `/Users/tungdoan/Projects/Web/household-finance-system`

```bash
./init.sh
```

Expected:

```text
install complete
lint passed
typecheck passed
tests passed
build passed
```

```bash
pnpm --filter web test -- --run src/views/app/expenses-page.test.tsx src/components/expense/expense-feed-list.test.tsx src/components/expense/expense-feed-summary.test.tsx
```

Expected:

```text
3 files passed
```

```bash
pnpm --filter web typecheck
```

Expected:

```text
typecheck passed
```

```bash
pnpm --filter web lint
```

Expected:

```text
lint passed
```

```bash
pnpm build:web
```

Expected:

```text
build succeeds
```

If implementation introduces an approved backend contract adjustment, also run:

```bash
pnpm --filter worker test -- --run test/integration/core.spec.ts
```

Expected:

```text
worker integration tests passed
```

## Validation and Acceptance

### Happy Path

- Users can open `/expenses`, type a search, and see both the summary card and feed update from the same query model.
- Users can apply the first-pass filter set and see the feed narrow predictably without breaking pagination.
- Users can change sort and observe a stable reordered feed with correct “load more” behavior.
- On mobile widths, users can still reach and understand advanced filters without horizontal-scroll-driven UX or crowded inline controls.

### Validation / Error Paths

- Empty-result combinations render a truthful empty state instead of a broken or stale list.
- Failed list/summary fetches render accessible retry treatment.
- Invalid or unsupported client filter values are normalized away on the client or surfaced through current server validation without crashing the page.
- If an advanced filter depends on supporting option data that fails to load, the page degrades gracefully and keeps basic exploration usable.

### Unauthorized / Forbidden

- Existing auth-protected route behavior remains intact.
- If implementation adds any backend scope, unauthorized requests still return `401` and forbidden household/member access remains enforced by the worker contracts.

### Regression Checks

- Changing filters resets pagination to the first page rather than mixing cursors across filter states.
- Summary totals never reflect stale pre-filter results once active filters change.
- Feed item navigation to `/expenses/[id]` still works after filtering or sorting.
- Existing search/visibility/category behavior remains functional after component extraction.

### Acceptance Artifact

- `pnpm --filter web test -- --run src/views/app/expenses-page.test.tsx src/components/expense/expense-feed-list.test.tsx src/components/expense/expense-feed-summary.test.tsx` output showing the focused regressions pass.
- `pnpm --filter web typecheck` and `pnpm --filter web lint` outputs showing the frontend remains green.
- `./init.sh` transcript showing the repository is still restartable and verified.
- If backend scope is added, one worker test transcript proving the search/filter contract remains validated.

## Idempotence & Recovery

- All planning, UI, and harness edits are safe to re-run.
- The default frontend-first path is additive and non-destructive.
- If implementation broadens backend query behavior, keep the change reversible by making it additive and covered by focused tests so a rollback is just a repository revert rather than a data repair step.
- No schema migration or destructive database step is expected in the intended first-pass path.

## Artifacts and Notes

- Minimum evidence expected on completion:
  - one passing focused web test command transcript
  - one passing repo-wide verification transcript (`./init.sh`)
  - updated harness feature evidence string pointing to the active/completed ExecPlan and final verification commands
- If implementation narrows the first-pass filter set after discovery, record the exact kept vs deferred controls in the Decision Log and `harness/progress.md` instead of leaving the difference implicit.

## Harness Integration

- Update `harness/features/feat-043.json` when implementation is complete:
  - keep the feature description aligned with the actual delivered first-pass filter surface
  - set `status` to `done` only after verification passes
  - add evidence that names the final ExecPlan, touched UI surfaces, and verification commands
  - refresh `updated_at`
- Update `harness/feature_index.json` when implementation is complete:
  - change `feat-043` from `pending` to `done`
- Update `harness/progress.md` twice across the lifecycle:
  - this planning session entry announcing the created active ExecPlan and locked scope
  - a later implementation-complete entry with files changed, verification, blockers, and next steps
- Update `docs/exec-plans/index.md`:
  - keep this plan in `Active` while implementation is underway
  - move it to `Completed` after the feature is verified and harness evidence is updated
- If implementation defers any attractive-but-unbuilt filter affordance (for example saved views or broader server-side text search), log it in `docs/exec-plans/tech-debt-tracker.md` instead of leaving it undocumented.

## Open Decisions

- Which contextual actor filter should make the first pass: `payer`, `group`, or both? Choose based on truthful option-source readiness and mobile complexity, not on theoretical backend support alone.
- Should advanced filters use a `Drawer` or `Sheet` on mobile? Prefer the option that best fits the current shadcn composition already used elsewhere in the app.
- Does current backend `query` behavior align with the intended user-visible search promise for this feature, or must the plan explicitly narrow search copy to note text?

## Risks and Blockers

- The largest product risk is overloading the mobile UI with too many simultaneous controls and producing a more powerful but less usable feed.
- The largest scope risk is silently broadening backend search/filter semantics when the feature record mostly describes frontend discoverability.
- A moderate implementation risk is option-source complexity for payer/group filters if those choices are not already easily available on the page.
- A moderate regression risk is query-key or pagination drift that causes summary/list inconsistency or cursor mixing after filter changes.
- No hard blocker is currently known from harness continuity; dependencies `feat-021`, `feat-023`, `feat-024`, and `feat-025` are already done.
