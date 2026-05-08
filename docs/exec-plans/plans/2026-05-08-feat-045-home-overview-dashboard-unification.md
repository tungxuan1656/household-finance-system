# ExecPlan: feat-045 — Home overview dashboard unification across spending, budgets, and household activity

## Title

Home overview dashboard unification across spending, budgets, and household activity (frontend-first fullstack composition)

## Purpose / Big Picture

Upgrade `/home` from shell placeholder cards into real first screen for signed-in users so app reflects maturity of expense, budget, analytics, onboarding, and household work already shipped. After this feature lands, users should open home overview and quickly understand current financial state, see household-aware next actions, and move into deeper flows without hunting across `/households`, `/budgets`, `/insights`, and onboarding paths.

This feature is intentionally integrative, not greenfield. First pass should prefer truthful composition of existing contracts and routes over new backend summary architecture, while still leaving room for a small additive summary contract if implementation proves current fan-out too slow or too fragile for dashboard-quality UX.

## Scope

### In Scope

**Frontend (`apps/web`):**
- `apps/web/src/app/(protected)/home/page.tsx` or current protected home App Router entry if path differs
- `apps/web/src/views/app/overview-page.tsx`
- New or expanded dashboard components under `apps/web/src/components/overview/*` and possibly bounded reuse from `apps/web/src/components/household/*`, `apps/web/src/components/analytics/*`, and `apps/web/src/components/budget/*`
- `apps/web/src/components/overview/index.ts`
- `apps/web/src/hooks/api/use-analytics.ts` only for small additive overview-safe selectors or summary helpers
- `apps/web/src/hooks/api/use-budgets.ts` only for small additive overview-safe selectors or summary helpers
- `apps/web/src/hooks/api/use-expense.ts` only for small additive overview-safe selectors or summary helpers
- `apps/web/src/hooks/api/use-households.ts` only if current household query surface needs a bounded overview helper
- `apps/web/src/stores/household.store.ts` only if current explicit household context or selection bridge needs a minimal additive selector for truthful dashboard CTAs
- `apps/web/src/types/*` only for additive frontend view-model types that compose existing DTOs without rewriting contracts
- `apps/web/src/lib/constants/paths.ts` if a missing route constant blocks dashboard actions
- `apps/web/src/lib/i18n/locales/vi.json`
- Focused tests near `apps/web/src/views/app/` and `apps/web/src/components/overview/`

**Backend (`apps/worker`) only if implementation proves necessary:**
- Existing analytics, budget, expense, and household contracts may be reused unchanged in first pass.
- A small additive summary endpoint under current route boundaries is allowed only if implementation verifies that frontend fan-out creates unacceptable latency, partial-failure complexity, or duplicate work that prevents a truthful home dashboard.
- If backend work becomes necessary, touched files would likely stay within existing route/handler/repository slices such as `apps/worker/src/routes/analytics.ts`, `apps/worker/src/routes/budgets.ts`, `apps/worker/src/routes/expenses.ts`, `apps/worker/src/routes/households.ts`, matching handler files, related contracts, and focused repository helpers.

**Planning / Harness:**
- `docs/exec-plans/plans/2026-05-08-feat-045-home-overview-dashboard-unification.md`
- `docs/exec-plans/index.md`
- `harness/features/feat-045.json`
- `harness/feature_index.json`
- `harness/progress.md`
- `harness/session-handoff.md` only if work pauses unfinished

### Out of Scope

- Inventing global active-household state or hidden household switching.
- Rebuilding existing `/insights`, `/budgets`, `/households`, onboarding, or expense-management routes end-to-end instead of linking into them.
- Forecasting, notification center, async reporting, or new cross-domain roadmap features outside current dependency set.
- Broad design-system refactors outside dashboard-owned files.
- Large new backend aggregation architecture unless first-pass implementation proves existing contracts cannot support acceptable home UX.
- New mobile/desktop navigation structure unrelated to dashboard content.

## Non-negotiable Requirements

- Plan remains self-contained with exact files, boundaries, commands, and acceptance artifacts named in-place.
- Observable success must include automated tests for key home states plus `./init.sh` evidence before feature can move to `done`.
- Dashboard must stay truthful: shown summaries, quick actions, and empty/error states must map to current real data and permissions.
- Product rule from `household-management.md` remains intact: no global active household assumption; household-scoped actions require explicit household context.
- User-facing copy must remain i18n-backed; no hardcoded labels.
- UI/UX quality bar for this feature is mobile-first responsive first, then larger-breakpoint enhancement; section order, tap targets, typography, and loading/error states must remain usable at small-phone widths before desktop polish.
- Implementation must respect `ARCHITECTURE.md` layer model `Types -> Config -> Repo -> Service -> Runtime -> UI`.
- UI must reuse existing API boundaries first; no component may bypass typed hooks/API modules for ad hoc fetch logic.
- If implementation introduces backend summary work, routes must stay thin, validation explicit, auth enforced before aggregation, and repository boundaries preserved.
- Partial failure must degrade clearly instead of showing misleading totals or dead actions.
- No new dependencies unless existing repo tools cannot satisfy layout, composition, or data needs; any new dependency must be justified in Decision Log before adoption.

## Progress

- [x] (2026-05-08) Reviewed planning rules, architecture constraints, harness state, and feature record for next pending item `feat-045`. Owner: Orchestrator.
- [x] (2026-05-08) Mapped direct dependency features (`feat-024`, `feat-027`, `feat-028`, `feat-029`, `feat-030`, `feat-042`, `feat-043`, `feat-044`) and current `/home` placeholder surface. Owner: Orchestrator.
- [x] (2026-05-08) Locked first-pass approach to frontend-first dashboard composition with explicit stop-and-log gate if backend summary contract becomes necessary. Owner: Orchestrator.
- [x] (2026-05-08) Created and registered active ExecPlan for `feat-045`; marked harness feature `in_progress`. Owner: Orchestrator.
- [x] (2026-05-08) Defined dashboard information hierarchy and section contract for signed-in users with and without households. Owner: Implementation agent.
- [x] (2026-05-08) Refactored home route into thin page + bounded overview sections with explicit empty, partial-error, and success states. Owner: Implementation agent.
- [x] (2026-05-08) Added focused tests for no-household onboarding CTA state, multi-household dashboard state, action visibility, and partial-summary degradation. Owner: Implementation agent.
- [x] (2026-05-08) Confirmed smallest safe first pass stayed frontend-only; backend summary support remained unnecessary after focused verification. Owner: Implementation agent.
- [x] (2026-05-08) Ran focused verification plus `./init.sh`, updated harness evidence, and moved plan to Completed. Owner: Implementation agent.

## Surprises & Discoveries

- Current `apps/web/src/views/app/overview-page.tsx` is still shell-level placeholder UI with three static cards and no real product summary data.
- Product specs already expect richer dashboard behavior across multiple existing domains: household dashboard signals, budget planned-vs-actual context, analytics summaries, and onboarding next steps.
- `feat-042` explicitly deferred unified `/home` dashboard work into `feat-045`, so this plan should reuse that feature’s household-card lessons rather than duplicating `/households` scope.
- Existing plan index still contains stale active entries for older completed work (`feat-041`, `feat-029`). Leave that drift untouched for this request except for adding `feat-045` to Active.
- Highest delivery risk is not missing data availability but over-composing too many household-scoped queries on one screen; implementation must verify truthfulness and acceptable load behavior before deciding whether frontend-only fan-out is enough.

## Decision Log

- **Decision**: Treat `harness/features/feat-045.json` as roadmap authority, with product specs and dependency plans used to sharpen behavior and boundaries.
  - Rationale: Harness file defines next pending feature; specs and prior plans clarify exact dashboard obligations already implied by completed work.
  - Date/Author: 2026-05-08 / Orchestrator

- **Decision**: First pass stays frontend-first and composes current household, budget, analytics, expense, and onboarding surfaces into `/home`.
  - Rationale: Existing completed features already expose most required information; compose before inventing another summary backend.
  - Date/Author: 2026-05-08 / Orchestrator

- **Decision**: Dashboard must support two truth-first modes: authenticated user with no households, and authenticated user with one or more households.
  - Rationale: `feat-030` onboarding and household product rules make no-household state first-class, not error state.
  - Date/Author: 2026-05-08 / Orchestrator

- **Decision**: Keep quick actions explicit and route-owned rather than embedding full editing or management flows inside `/home`.
  - Rationale: Surgical dashboard upgrade improves discoverability without creating second copies of existing domain workflows.
  - Date/Author: 2026-05-08 / Orchestrator

- **Decision**: Treat mobile-first responsive usability as primary dashboard layout constraint and use `ui-ux-pro-max` guidance during planning and code review.
  - Rationale: `/home` is top-level daily surface and must stay fast, readable, and actionable on narrow mobile widths before scaling up for tablet/desktop.
  - Date/Author: 2026-05-08 / Orchestrator

- **Decision**: If frontend fan-out cannot produce truthful, responsive summary cards, implementation may add one small backend summary contract but must stop and record that scope shift explicitly before proceeding.
  - Rationale: Protects UX quality without silently drifting into large architecture redesign.
  - Date/Author: 2026-05-08 / Orchestrator

## Outcomes & Retrospective

- Target outcome: `/home` becomes operational dashboard instead of placeholder shell, with clear summary hierarchy, household-aware next steps, and truthful links into deeper routes.
- Verification target: dashboard renders coherent states for signed-in users with no household, one household, or multiple households; quick actions remain permission-aware; partial data failures degrade visibly without false totals.
- Expected acceptance artifacts: passing home-page tests, any additive worker tests if backend summary support is introduced, typechecks, and successful `./init.sh` run recorded in harness evidence.
- Expected follow-up boundary: if analytics/budget/expense aggregation pressure exposes need for broader shared summary architecture, log that as later feature or tech debt instead of broadening `feat-045` beyond home dashboard scope.
- Actual outcome (2026-05-08): `/home` now shows onboarding-first empty state when user has no households, summary metrics plus household cards when households exist, role-aware action visibility, and explicit budget-slice retry/error UI while other sections remain visible. No additive backend summary contract was needed for this first pass.
- Actual acceptance artifacts (2026-05-08): `pnpm --filter web test -- --run src/views/app/overview-page.test.tsx src/views/app/households-page.test.tsx src/views/app/budgets-page.test.tsx src/views/app/insights-page.test.tsx`; `pnpm --filter web typecheck`; `./init.sh`.

## Context and Orientation

- Feature record: `harness/features/feat-045.json`
- Direct predecessor progress: `harness/progress.md` latest `feat-044` entry points next work to `feat-045`
- Current protected home surface:
  - `apps/web/src/app/(protected)/home/page.tsx` or current protected route entry for `/home`
  - `apps/web/src/views/app/overview-page.tsx` — current placeholder overview implementation
- Key dependency surfaces expected to feed dashboard composition:
  - `apps/web/src/views/app/households-page.tsx`
  - `apps/web/src/views/app/budgets-page.tsx`
  - `apps/web/src/views/app/insights-page.tsx`
  - onboarding route/view files from `feat-030`
  - quick-add trigger/path surfaces from `feat-024`
- Likely frontend data boundaries:
  - `apps/web/src/hooks/api/use-households.ts`
  - `apps/web/src/hooks/api/use-budgets.ts`
  - `apps/web/src/hooks/api/use-analytics.ts`
  - `apps/web/src/hooks/api/use-expense.ts`
  - `apps/web/src/stores/household.store.ts`
  - `apps/web/src/api/household.ts`, `apps/web/src/api/budget.ts`, `apps/web/src/api/analytics.ts`, `apps/web/src/api/expense.ts`
- Existing backend/runtime contracts likely reused unchanged in first pass:
  - `GET /api/v1/households`
  - `GET /api/v1/households/:id/members`
  - existing budget list/status endpoints keyed by `household_id`
  - existing analytics overview/comparison/groups endpoints keyed by `household_id`
  - existing expense list/summary endpoints keyed by `household_id`
- Plans that define reusable behavior and scope boundaries:
  - `docs/exec-plans/plans/2026-05-07-feat-042-household-overview-enrichment.md`
  - `docs/exec-plans/plans/2026-05-04-feat-028-analytics-overview-dashboard.md`
  - `docs/exec-plans/plans/2026-05-05-feat-029-analytics-comparisons-breakdowns.md`
  - `docs/exec-plans/plans/2026-05-06-feat-030-new-user-onboarding-flow.md`
  - `docs/exec-plans/plans/2026-05-08-feat-044-analytics-export-path-and-product-hardening-follow-up.md`

## Standards Enforcement

### Scope Classification

- Target domain: `fullstack`, with explicit first-pass preference for `frontend` composition
- Layer impact expected first: `Config -> UI`
- Layer impact if backend summary support becomes necessary: `Types -> Repo -> Runtime -> UI`
- New dependency risk: none expected

### Required References and Concrete Constraints

**Shared**
- `docs/references/shared/type-naming-pattern.md`
  - Keep additive view-model and DTO names explicit (`HomeOverviewSummary`, `HouseholdHomeCardViewModel`, `GetHomeSummaryResponse`) and avoid generic bag names.

**Frontend**
- `docs/FRONTEND.md`
  - Keep App Router pages thin, express loading/error/empty states deliberately, and preserve accessibility.
- `docs/references/frontend/project-folder-structure.md`
  - Keep dashboard-specific UI in `apps/web/src/components/overview/*`; do not scatter one-off summary code across unrelated shared folders.
- `docs/references/frontend/component-structure-pattern.md`
  - `overview-page.tsx` should orchestrate data + section order only; extracted components own cards/sections.
- `docs/references/frontend/naming-and-conventions-pattern.md`
  - Use kebab-case files, named exports, `@/...` imports, and maintain existing style.
- `docs/references/frontend/api-react-query-pattern.md`
  - Reuse typed API hooks and add only focused overview helpers/selectors; do not perform direct fetches from UI components.
- `docs/references/frontend/zustand-store-pattern.md`
  - If household store participates, changes must stay minimal and avoid reintroducing hidden active-household semantics.
- `docs/references/frontend/i18n-label-pattern.md`
  - All dashboard headings, helper text, empty states, and action labels must flow through locale keys.
- `ui-ux-pro-max`
  - Use skill guidance to review hierarchy, accessibility, touch targets, responsive layout, contrast, and mobile-first dashboard ergonomics during both planning updates and implementation review.
  - Treat generated design-system artifacts as working design input for this feature:
    - `design-system/household-finance-system/MASTER.md`
    - `design-system/household-finance-system/pages/dashboard.md`

**Backend**
- `docs/references/backend/architecture-and-boundaries.md`
  - If additive summary endpoint appears, keep route thin, handler orchestration-focused, repository data-owned.
- `docs/references/backend/api-contract-and-validation.md`
  - Validate any new query params explicitly and preserve standard error envelope behavior.
- `docs/references/backend/error-handling-pattern.md`
  - Distinguish validation/auth/membership failures from empty-data states.
- `docs/references/backend/security-and-auth-pattern.md`
  - Summary endpoint must never leak private expenses or unauthorized household context.
- `docs/references/backend/testing-pattern.md`
  - Add endpoint coverage for happy path plus auth/validation/visibility regressions if backend work is added.
- `docs/references/backend/database-pattern.md`
  - No SQL in routes; keep queries explicit and avoid N+1 loops in any summary helper.
- `docs/references/backend/cloudflare-workers.md`
  - If additive summary contract aggregates multiple domains server-side, verify runtime safety and avoid oversized/mis-scoped responses.

### Implementation Notes

- Mandatory patterns for this scope:
  - Build `/home` as layered dashboard sections, not single giant component.
  - Compose and verify layout mobile-first; start with stacked small-screen sections, then enhance for `md`/`lg`/`xl` grids only after narrow-width readability works.
  - Apply persisted `ui-ux-pro-max` guidance before implementation and during review: minimal professional dashboard tone, high-contrast text, skeleton loading feedback, touch-friendly targets, and no horizontal scroll at phone widths.
  - Keep no-household experience actionable and respectful of onboarding state.
  - Prefer concise, high-value summaries over maximum metric density.
  - Use existing route ownership for deeper actions such as budgets, insights, households, and quick-add.
  - Partial-failure design is required: if one summary slice fails, unaffected slices should still render with truthful messaging.
  - Any cross-household comparisons shown on home must remain explicit; do not imply hidden selected household.
- Companion skills recommended for implementation:
  - `test-driven-development`
  - `frontend-patterns`
  - `ui-ux-pro-max`
  - `security-reviewer` if backend summary support is introduced
  - `backend-patterns` if backend summary support is introduced
  - `verification-before-completion`
  - `requesting-code-review`
  - `typescript-reviewer`
- Common pitfalls to avoid:
  - Designing desktop-first cards that collapse poorly on phones or create horizontal scroll.
  - Rebuilding entire downstream pages inside dashboard cards.
  - Showing totals without clarifying scope when multiple households exist.
  - Accidentally coupling dashboard behavior to hidden household state.
  - Letting one failed summary query blank whole page.
  - Expanding into new analytics, notification, or navigation features under cover of dashboard work.

## Interfaces & Dependencies

### Expected Existing Frontend Interfaces

- Dashboard auth/user context from `apps/web/src/stores/auth.store.ts`
- Household context from `apps/web/src/stores/household.store.ts` and/or `apps/web/src/hooks/api/use-households.ts`
- Analytics overview/comparison/group hooks from `apps/web/src/hooks/api/use-analytics.ts`
- Budget status/list hooks from `apps/web/src/hooks/api/use-budgets.ts`
- Expense summary/list hooks from `apps/web/src/hooks/api/use-expense.ts`
- Navigation constants from `apps/web/src/lib/constants/paths.ts`
- i18n access through existing web locale layer

### Possible Additive Backend Interface Only If Needed

- Candidate endpoint shape if frontend fan-out proves insufficient:
  - `GET /api/v1/home/overview?household_id=<id?>&period=YYYY-MM`
  - or additive summary endpoint under an existing owned route if repo conventions favor domain ownership over new `/home` route
- Candidate response shape before final implementation decision:

```ts
type HomeOverviewSummary = {
  scope: {
    householdId: string | null
    period: string
  }
  onboarding: {
    hasHouseholds: boolean
    recommendedAction: 'createHousehold' | 'joinHousehold' | 'setBudget' | 'addExpense' | 'reviewInsights'
  }
  householdCards: Array<{
    householdId: string
    householdName: string
    role: 'admin' | 'member'
    memberCount: number | null
    budgetStatus: 'ok' | 'warning' | 'exceeded' | 'missing' | null
    latestSpendAmountMinor: number | null
    latestActivityAt: string | null
  }>
  personalSummary: {
    expenseCount: number | null
    totalSpendMinor: number | null
  } | null
}
```

### Dependency Chain

- `feat-024` quick-add defines fast first action path from dashboard.
- `feat-027` provides budget status/planned-vs-actual surface candidate.
- `feat-028`, `feat-029`, `feat-044` provide analytics summary/export maturity that home can reuse or deep-link into.
- `feat-030` defines no-household onboarding and next-step CTA behavior.
- `feat-042` provides household overview card lessons and constraints.
- `feat-043` improves expense exploration follow-through for dashboard links.

## Scope Map and Dependency Checks

### Files Expected to Change First Pass

**Web**
- `apps/web/src/app/(protected)/home/page.tsx` or equivalent route entry
- `apps/web/src/views/app/overview-page.tsx`
- New overview components under `apps/web/src/components/overview/*`
- `apps/web/src/components/overview/index.ts`
- `apps/web/src/lib/i18n/locales/vi.json`
- Focused test files under `apps/web/src/views/app/` and `apps/web/src/components/overview/`

**Optional small helper changes**
- `apps/web/src/hooks/api/use-analytics.ts`
- `apps/web/src/hooks/api/use-budgets.ts`
- `apps/web/src/hooks/api/use-expense.ts`
- `apps/web/src/hooks/api/use-households.ts`
- `apps/web/src/lib/constants/paths.ts`
- `apps/web/src/types/*`

**Only if frontend composition proves insufficient**
- `apps/worker/src/routes/*`, matching handler files, matching contract files, and focused repository helpers under existing domain ownership

### Layer Check Using `ARCHITECTURE.md`

- `Types`: additive frontend view models likely; backend DTO changes only if summary endpoint added.
- `Config`: i18n keys and maybe route constants.
- `Repo`: unchanged in first pass; additive summary query helpers only if backend support added.
- `Service`: unchanged unless backend summary orchestration requires focused additive service/helper.
- `Runtime`: existing endpoints reused first; optional additive summary endpoint only if justified.
- `UI`: primary impacted layer.

### Hard Dependency Checks

- Lower layers must not depend on higher layers: preserved if first pass stays UI composition; still preserved if backend summary follows normal route/handler/repository boundaries.
- UI must not bypass runtime/service contracts: required.
- Data access must remain through repositories/equivalent adapters: required for any backend addition.
- Shared utilities must stay generic: do not stuff dashboard-specific aggregation logic into generic shared helpers without real reuse.

## Plan of Work (Narrative)

1. **Define dashboard states before coding layout.** Start by locking exact user-visible states for `/home`: loading, signed-in with no household, signed-in with households but low data, signed-in with active summary data, and partial failure of one or more summary slices. Each state should define which cards/sections render, which copy explains missing data, and which CTA is primary.

2. **Replace placeholder shell with thin orchestrator plus bounded sections.** Refactor `apps/web/src/views/app/overview-page.tsx` so page owns high-level query orchestration, state selection, and section ordering only. Extract dashboard-owned components under `apps/web/src/components/overview/*` for hero/header, onboarding CTA section, household summary section, financial summary section, and quick-action section. Reuse existing shadcn primitives and any already-good domain components only where ownership remains clear.

3. **Compose existing domain data truthfully.** Use existing typed household, budget, analytics, and expense hooks to derive compact summary cards. For users with no households, homepage should emphasize onboarding-safe next steps from `feat-030`. For users with one or more households, show concise scoped summaries and deep links into `/households`, `/budgets`, `/insights`, and expense/quick-add flows. If multiple households exist, preserve explicit household context in card labels and actions instead of collapsing them into hidden global totals.

4. **Design for partial failure and bounded fan-out.** If one slice such as analytics or budget summary fails, render unaffected sections with localized alert/help text for failed slice. During implementation, measure whether current hook fan-out creates unacceptable complexity, latency, or duplicate requests. Only if that happens should implementation add a small backend summary contract to centralize needed dashboard fields.

5. **Add focused tests around behavior, not only snapshots.** Tests should exercise no-household onboarding CTA state, single-household dashboard summary state, multi-household rendering, role-aware action visibility, and partial-summary failure messaging. If backend summary support is introduced, add worker coverage for visibility/auth/validation and one end-to-end happy path of summary payload shape.

6. **Finish with harness evidence and plan-state updates.** After implementation verification passes, update feature evidence, mark `feat-045` `done`, move plan entry in `docs/exec-plans/index.md` from Active to Completed, and log final outcomes in `harness/progress.md`.

## Concrete Steps (Commands)

Run from repo root unless noted otherwise.

```bash
# baseline full-workspace verification before touching behavior
./init.sh

# inspect current home/dashboard-related web tests while implementing
pnpm --filter web test -- --run src/views/app/overview-page.test.tsx

# run focused web verification for dashboard work
pnpm --filter web test -- --run src/views/app/overview-page.test.tsx src/components/overview

# web typecheck after dashboard changes
pnpm --filter web typecheck

# if backend summary support is added, run focused worker tests
pnpm --filter worker test -- --run test/integration/home-overview.spec.ts

# if backend summary support is added, run worker typecheck
pnpm --filter worker typecheck

# final full verification before claiming done
./init.sh
```

Expected short transcript targets:

- `pnpm --filter web test -- --run ...` shows new overview tests passing with `0 failed`.
- `pnpm --filter web typecheck` exits successfully with no TypeScript errors.
- `pnpm --filter worker test -- --run ...` shows summary endpoint tests passing if backend work was added.
- `./init.sh` completes full install/check/lint/typecheck/test/build path without failures.

## Validation and Acceptance

- **No-household state**: authenticated user with zero household memberships sees welcome/explanation plus at least one clear CTA aligned with onboarding (`create household`, `join household`, or equivalent existing next step) instead of broken dashboard metrics.
- **Household summary state**: authenticated user with one or more households sees concise summary cards or sections with truthful household names, role-aware context, and scoped actions into existing routes.
- **Financial insight state**: dashboard shows at least one meaningful spend/budget/analytics summary derived from existing contracts, not placeholder copy.
- **Partial failure state**: if one summary source fails, user sees localized alert/help for that slice while unaffected slices still render.
- **Permission truthfulness**: dashboard never shows admin-only action as available to non-admin user.
- **Acceptance artifacts**:
  - passing focused web tests for overview behavior
  - passing worker tests if backend summary support was added
  - successful typecheck(s)
  - successful `./init.sh`

## Idempotence & Recovery

- Plan-creation artifact updates are safe to re-run; editing plan, harness feature status, and progress log is idempotent when content is updated in place.
- Frontend-first implementation path should be safe to iterate without data migrations.
- If backend summary support is introduced, keep it additive and non-destructive so rollback is file-level revert rather than data repair.
- No destructive database or irreversible git operations are part of this plan.

## Artifacts and Notes

- Plan creation artifact for this session:
  - `docs/exec-plans/plans/2026-05-08-feat-045-home-overview-dashboard-unification.md`
  - `docs/exec-plans/index.md`
  - `harness/features/feat-045.json`
  - `harness/feature_index.json`
  - `harness/progress.md`
- UI research artifacts for implementation guidance:
  - `design-system/household-finance-system/MASTER.md`
  - `design-system/household-finance-system/pages/dashboard.md`
- Expected final evidence snippet should mention exact verification commands and whether backend summary support stayed unnecessary or was added.
- If implementation pauses mid-feature, add concise restart instructions to `harness/session-handoff.md` rather than overloading progress log.
