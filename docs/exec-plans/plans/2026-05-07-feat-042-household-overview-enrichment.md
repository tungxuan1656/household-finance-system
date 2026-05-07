# feat-042 — Household overview enrichment and actionable list summaries

## Title

Upgrade `/households` into a frontend-first household overview that surfaces real summary signals and action paths using existing APIs.

## Purpose / Big Picture

Implement a frontend-first upgrade of the current `/households` route so it stops behaving like a thin navigation list and starts acting like a useful operational overview for users who belong to one or more households. After this feature lands, authenticated users should be able to open the households overview and immediately understand which households they belong to, what each household’s current state looks like at a glance, and which next actions are available without first drilling into every detail page.

This plan intentionally reuses the existing household, analytics, budget, and expense contracts instead of introducing a new backend household-summary endpoint in the first pass. Users should observe a more informative household list built from truthful, already-supported signals: real member counts, current budget presence/status, recent expense activity or spend summaries, and direct links into the richer household detail, budgets, and insights flows that already exist elsewhere in the product.

## Scope

- Planned frontend areas:
  - `apps/web/src/app/(protected)/households/page.tsx`
  - `apps/web/src/views/app/households-page.tsx`
  - New or expanded household overview components under `apps/web/src/components/household/*`
  - `apps/web/src/components/household/index.ts`
  - `apps/web/src/hooks/api/use-households.ts` if household-list query composition moves from Zustand toward React Query or needs additive summary hooks
  - `apps/web/src/hooks/api/use-budgets.ts` only if existing budget hooks need a small additive selector/helper for overview composition
  - `apps/web/src/hooks/api/use-analytics.ts` only if existing analytics hooks need a small additive selector/helper for overview composition
  - `apps/web/src/hooks/api/use-expense.ts` only if an existing summary hook needs additive overview-safe reuse
  - `apps/web/src/types/household.ts` only if a frontend-only view model or additive response typing becomes necessary without changing backend contracts
  - `apps/web/src/lib/constants/paths.ts` only if a missing existing household-related route constant blocks truthful quick actions
  - `apps/web/src/lib/i18n/locales/vi.json`
  - New or updated tests near `apps/web/src/views/app/` and `apps/web/src/components/household/`
- Existing reusable surfaces the implementation may compose but should not broadly redesign:
  - `apps/web/src/views/app/household-detail-page.tsx`
  - `apps/web/src/components/household/household-detail-header.tsx`
  - `apps/web/src/components/household/household-settings-card.tsx`
  - `apps/web/src/components/household/household-members-card.tsx`
  - `apps/web/src/views/app/budgets-page.tsx`
  - `apps/web/src/views/app/insights-page.tsx`
  - `apps/web/src/views/app/overview-page.tsx`
  - `apps/web/src/stores/household.store.ts` only if a minimal additive bridge is truly needed during migration or reuse
- Existing backend/runtime contracts reused but not expanded in this plan:
  - `GET /api/v1/households`
  - `GET /api/v1/households/:id`
  - `GET /api/v1/households/:id/members`
  - Existing budget list/status endpoints keyed by `household_id`
  - Existing analytics overview endpoint keyed by `household_id`
  - Existing expense summary/list endpoints keyed by `household_id`
- Continuity and planning artifacts:
  - `docs/exec-plans/index.md`
  - `harness/features/feat-042.json`
  - `harness/feature_index.json`
  - `harness/progress.md`

Out of scope for this plan:

- New backend endpoints, database fields, or worker-side household summary aggregation contracts in the first pass.
- A redesign of `/home` into the unified dashboard planned later in `feat-045`.
- Rewriting household detail, member-management, invitation, delete/archive, or leave flows that already exist and work on their owned routes.
- Introducing a global “active household” concept or hidden household selection state.
- CSV export, advanced cross-household analytics, or any analytics hardening work already reserved for `feat-044`.
- Speculative action counts or summaries that are not directly backed by current frontend-available data.
- Broad state-management rewrites across household/budget/analytics domains unless a very small additive refactor is required to keep the overview maintainable.

## Non-negotiable Requirements

- The plan must stay self-contained and implementation-ready for a human or coding agent.
- `feat-042` is locked to a `frontend` domain outcome with frontend-first reuse of existing backend contracts.
- `/households` must replace placeholder information with truthful summary data; the existing `memberCountPlaceholder` copy must not survive implementation.
- The overview must improve discoverability of existing household operations without duplicating complex detail-management flows inside the list view.
- User-facing text must remain fully i18n-backed; no hardcoded labels may be introduced.
- The implementation must follow the repository’s orchestrator-first view/component split and shadcn composition rules.
- Any per-household summary shown in the overview must be derived from existing supported APIs and degrade gracefully when one supporting query fails.
- UI/UX quality is part of the feature outcome, not a polish-only follow-up: the enriched overview must improve hierarchy, scanability, responsiveness, and accessibility while staying within the existing shadcn-first design system.
- No new dependencies may be introduced unless implementation proves an existing project dependency cannot satisfy the UI composition need; any new dependency must be justified in the plan before adoption.
- The implementation must add or update automated tests for the enriched `/households` states because the current page is lightweight and under-covered.

## Progress

- [x] 2026-05-07 00:00 UTC — Reviewed planning requirements, architecture rules, harness state, and the next pending feature record (`feat-042`). Owner: Orchestrator.
- [x] 2026-05-07 00:00 UTC — Mapped the current household overview surface, related detail routes, and reusable household/analytics/budget/expense data sources. Owner: Orchestrator.
- [x] 2026-05-07 00:00 UTC — Locked scope to a frontend-first `/households` enrichment plan that composes existing APIs rather than adding new backend household summary contracts in the first pass. Owner: Orchestrator.
- [x] 2026-05-07 00:00 UTC — Created and registered the active ExecPlan for `feat-042`. Owner: Orchestrator.
- [x] 2026-05-07 00:00 UTC — Reviewed current household frontend surfaces against UI/UX guidance and confirmed that the active plan must explicitly cover hierarchy, skeleton loading, responsive card layout, localized role/status labels, and accessible error/action treatment. Owner: Orchestrator.
- [ ] 2026-05-07 00:00 UTC — Define the exact summary contract and UI hierarchy rendered on each household card (member count, budget signal, recent spend/activity, localized status labels, and quick actions) using only currently supported data. Owner: Implementation agent. Status: current step.
- [ ] 2026-05-07 00:00 UTC — Refactor `/households` into a thin orchestrator plus feature-bounded overview components with improved UI/UX, explicit loading, partial-error, empty, and success states. Owner: Implementation agent.
- [ ] 2026-05-07 00:00 UTC — Add or update focused tests for multi-household rendering, no-household empty state, summary data states, action visibility, and retry/error handling. Owner: Implementation agent.
- [ ] 2026-05-07 00:00 UTC — Run frontend verification plus `./init.sh`, then update harness evidence and move the plan to Completed. Owner: Implementation agent.

## Surprises & Discoveries

- The current `/households` page still renders a literal placeholder string for member count even though the product already has household detail, membership, budgets, and analytics capabilities.
- The current households overview is built on a Zustand async store, while several reusable summary signals already live behind React Query hooks in other domains. The implementation should prefer focused composition over a broad store-vs-query rewrite.
- Current `HouseholdDTO` list items are intentionally thin and do not include summary aggregates, so the first-pass design must be careful about N+1 client composition and should keep the card contents high-value but limited.
- The product spec already expects a household dashboard to surface members, recent expenses, budgets, and quick actions, which means the current list page is under-delivering relative to documented intent even though deeper surfaces exist.
- A dedicated UI/UX review confirmed the current overview under-delivers not only on data but also on hierarchy and interaction quality: it uses text-only loading, a generic non-semantic error card, a single-column flat list, inline dialog complexity, and untranslated raw role labels.

## Decision Log

- Decision: Treat `feat-042` as a frontend-only feature that composes existing household-scoped APIs.
  Rationale: The user selected the frontend-first path, and the existing household/member, analytics, budget, and expense contracts appear sufficient to deliver a meaningful first-pass overview without introducing new backend risk.
  Date/Author: 2026-05-07 / Orchestrator.

- Decision: Target `/households` rather than `/home` as the primary surface for this feature.
  Rationale: The feature record explicitly calls out the household overview/list experience as the unfinished layer, while the unified home dashboard is already planned separately as `feat-045`.
  Date/Author: 2026-05-07 / Orchestrator.

- Decision: Prefer summary cards plus truthful quick actions instead of embedding full management flows inside the overview.
  Rationale: This keeps the feature surgical, improves discoverability, and respects route ownership of the more complex household detail operations.
  Date/Author: 2026-05-07 / Orchestrator.

- Decision: Do not invent a primary or globally active household concept for ordering or emphasis.
  Rationale: Current product rules explicitly avoid a global active-household model in MVP, so the overview must remain explicit and multi-household safe.
  Date/Author: 2026-05-07 / Orchestrator.

- Decision: If implementation discovers that the required card summaries cannot be built efficiently or truthfully from current APIs, stop short of backend changes and log that constraint as a follow-up decision rather than silently broadening scope.
  Rationale: This preserves the frontend-first commitment and keeps `feat-042` from turning into an unplanned contract redesign.
  Date/Author: 2026-05-07 / Orchestrator.

## Outcomes & Retrospective

- Target outcome: `/households` becomes a useful overview where each household card shows real operational context and clear next actions instead of acting like a thin list of names.
- Verification target: the route renders enriched cards correctly for users with one or multiple households, handles empty and failure states coherently, and preserves truthful links into existing downstream flows.
- Expected acceptance artifact: successful households-page/component tests and a passing `./init.sh` transcript recorded in harness evidence.
- Expected follow-up boundary: if multiple per-household fan-out queries create unacceptable complexity or performance risk, log a later backend summary-contract feature rather than expanding `feat-042` in place.

## Context and Orientation

- User-facing navigation and route surface:
  - `apps/web/src/app/(protected)/households/page.tsx` — current App Router entry for `/households`.
  - `apps/web/src/views/app/households-page.tsx` — current list view with create dialog, role badge, placeholder member count, and detail link.
  - `apps/web/src/views/app/household-detail-page.tsx` — existing richer downstream household surface this feature should connect to better.
- Existing household frontend boundaries:
  - `apps/web/src/api/household.ts`
  - `apps/web/src/hooks/api/use-households.ts`
  - `apps/web/src/stores/household.store.ts`
  - `apps/web/src/types/household.ts`
  - `apps/web/src/components/household/*`
- Existing reusable household-scoped summary sources:
  - `apps/web/src/hooks/api/use-budgets.ts` — existing budget list/status access keyed by household.
  - `apps/web/src/hooks/api/use-analytics.ts` — existing analytics overview access keyed by household and period.
  - `apps/web/src/hooks/api/use-expense.ts` — existing expense list/summary access keyed by household.
  - `apps/web/src/api/budget.ts`, `apps/web/src/api/analytics.ts`, `apps/web/src/api/expense.ts` — typed API boundaries the UI must consume rather than bypass.
- Existing backend/runtime contracts that remain the source of truth:
  - `apps/worker/src/routes/households.ts`
  - `apps/worker/src/routes/budgets.ts`
  - `apps/worker/src/routes/analytics.ts`
  - `apps/worker/src/routes/expenses.ts`
- Plan and harness continuity:
  - `docs/PLANS.md`
  - `docs/exec-plans/__plan-template__.md`
  - `docs/exec-plans/index.md`
  - `harness/features/feat-042.json`
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
  - `docs/references/frontend/i18n-label-pattern.md`
  - `docs/references/frontend/zustand-store-pattern.md` if any store shape/selector changes are made
- Shared standards required by scope:
  - `docs/references/shared/type-naming-pattern.md`
- Required shadcn governance pre-read for UI work:
  - `.agents/skills/shadcn/SKILL.md`
  - `.agents/skills/shadcn/rules/styling.md`
  - `.agents/skills/shadcn/rules/forms.md`
  - `.agents/skills/shadcn/rules/composition.md`

### Concrete coding constraints derived from standards matrix

- Keep App Router page files thin: route-level files should only hand off to a view/orchestrator component.
- Keep view orchestration in `apps/web/src/views/app/*` and feature-bounded smart components in `apps/web/src/components/household/*`.
- Use `kebab-case` file names, `export const` component exports, and barrel `index.ts` files only for public household overview components.
- Promote code to shared locations only when it is truly cross-feature reusable; do not put household-overview-specific logic into `lib`.
- UI must call typed hooks/store boundaries rather than directly calling new ad hoc API helpers from components.
- Before adding a new query, check whether the needed data already exists in the household store or an existing React Query hook; avoid redundant parallel requests.
- All user-facing copy and dynamic labels must use i18n keys in `vi.json`; no JSX hardcoded strings or manual quantity concatenation.
- Use existing shadcn primitives and composition patterns (`Card`, `Badge`, `Button`, `Skeleton`, `Alert`, `Separator`) rather than custom primitive wrappers.
- If a small local view model is added for enriched cards, keep shared contract names aligned with DTO/Request/Response suffix rules and keep frontend-only derived types clearly separate from backend DTOs.
- The UI must represent backend truth only: actions must reflect current role/data permissions and must link only to supported existing routes.

### Implementation Notes

- Mandatory patterns for this scope:
  - Build `/households` as an orchestrator page composed of smaller overview sections/cards rather than a single large component.
  - Keep create-household capability available, but subordinate it to the richer overview instead of letting the dialog dominate the page.
  - Prefer a compact set of high-value per-household signals such as member count, current budget status/presence, and recent expense activity/spend summary; do not overload each card with every available metric.
  - Use quick actions to connect to existing routes such as household detail, budgets, or insights only when those links are truthful for the current role and data.
  - Design for partial data failure: one missing summary source should degrade one part of the card, not collapse the whole page.
- Companion skills recommended for implementation:
  - `test-driven-development` for adding households overview regressions before or alongside behavior changes.
  - `frontend-patterns` for React/Next component architecture decisions.
  - `ui-ux-pro-max` for hierarchy, responsiveness, accessibility, and shadcn-friendly dashboard-card decisions during implementation review.
  - `verification-before-completion` for final evidence gathering.
  - `requesting-code-review` for implementation review before merge.
  - `security-reviewer` only if implementation expands privileged actions or exposes user-sensitive data in a new way.
  - `documentation-lookup` only if implementation needs current Next.js, React Query, or shadcn API specifics.
- Common pitfalls to avoid:
  - Do not broaden the feature into the unified home dashboard planned later.
  - Do not invent unsupported summary data just to make cards look fuller.
  - Do not silently add backend endpoints if the frontend-first composition gets awkward; log that as a follow-up decision.
  - Do not introduce a hidden active-household assumption for quick actions or sorting.
  - Do not leave `/households` with only manual QA; add direct regression coverage.
  - Do not treat UI/UX quality as optional polish; loading, error, layout, copy, and action affordances are part of the acceptance bar for this feature.

### UI/UX implementation constraints for this scope

- Replace text-only list loading with shadcn `Skeleton` states that roughly preserve final card layout and reduce content jumping.
- Replace the generic error `Card` treatment with an accessible error surface such as shadcn `Alert` or an equivalent `role="alert"` pattern.
- Render the enriched household list as a responsive grid (`grid-cols-1`, then multi-column at larger breakpoints) so multi-household users can scan and compare cards more efficiently.
- Mirror the stronger card hierarchy already present in `HouseholdSettingsCard`: use `CardHeader` for title/description, `CardContent` for summary signals, and `CardFooter` for quick actions.
- Localize role/status labels instead of rendering raw backend values like `admin` and `member` directly.
- Keep each card compact and scannable by limiting the summary to at most three high-value signals plus bounded actions.
- Preserve visible focus states, minimum touch-target sizes, and non-color-only status communication for any budget or activity indicators.
- Extract the create-household dialog into a feature component so the page remains an orchestrator and the interaction flow stays easier to maintain and test.

## Interfaces & Dependencies

- Internal frontend interfaces:
  - `householdActions.fetchHouseholds()` and `useHouseholdStore` selectors from `apps/web/src/stores/household.store.ts`
  - `useHouseholdsQuery()` and `useHouseholdMembersQuery()` from `apps/web/src/hooks/api/use-households.ts` if React Query becomes the preferred overview source
  - Existing budget, analytics, and expense hooks keyed by `household_id`
  - Navigation constants from `apps/web/src/lib/constants/paths.ts`
  - i18n translation calls through the existing web i18n layer
- Existing backend/runtime contracts reused by the UI:
  - `GET /api/v1/households`
  - `GET /api/v1/households/:id/members`
  - Existing budget list/status routes keyed by `household_id`
  - Existing analytics overview route keyed by `household_id`
  - Existing expense summary/list routes keyed by `household_id`
- Layer impact check using `Types -> Config -> Repo -> Service -> Runtime -> UI` from `ARCHITECTURE.md`:
  - `Types`: possibly additive frontend-only derived types or query result composition types; shared runtime DTOs should remain unchanged in the first pass.
  - `Config`: i18n keys and optional route constants may change.
  - `Repo`: unchanged.
  - `Service`: unchanged.
  - `Runtime`: unchanged; UI must consume existing runtime/service contracts only.
  - `UI`: primary layer impacted.
- Hard dependency rule checks:
  - Lower layers do not depend on higher layers because this plan is frontend-only composition work.
  - UI must not bypass runtime/service contracts; overview components must use existing hooks/store/API adapters.
  - Data access remains through repository-backed worker routes already exposed to the frontend.
- New dependency expectation:
  - No new dependency is expected. If implementation believes a new dependency is required for card composition, stop and justify it explicitly in the plan/decision log before adoption.

## Plan of Work (Narrative)

1. **Lock the summary content to a small truthful set of signals.** Replace the current placeholder-only household cards with an explicit card contract that prioritizes operational usefulness over breadth. The planned minimum set should include the user’s role, a real member count, one budget signal (for example active budget presence or latest budget threshold status when directly discoverable), one recent expense or spend signal, and a bounded set of next actions that deep-link into existing routes.

2. **Decompose the current page before enriching it further.** Extract the inline create-household dialog into a dedicated `apps/web/src/components/household/household-create-dialog.tsx` component and introduce a bounded overview card component such as `apps/web/src/components/household/household-summary-card.tsx`. Keep `apps/web/src/views/app/households-page.tsx` under tight control as an orchestrator for state wiring, high-level layout, and composition.

3. **Restructure `/households` into a scan-friendly overview with explicit UI hierarchy.** Use a responsive card grid, preserve strong card structure (`CardHeader` / `CardContent` / `CardFooter`), and make quick actions easy to discover without overpowering the summary content. Reuse the detail-page card composition patterns rather than inventing a second household UI language.

4. **Choose the smallest safe data composition strategy.** Start from the already-fetched household list, then layer in additive summary sources only where they are high value and maintainable. Prefer reuse of existing hooks over new API utilities, and avoid fan-out for low-value data. If the store-based household list becomes awkward to compose with React Query summary hooks, make the smallest additive state-boundary adjustment needed rather than a broad migration.

5. **Design for partial, empty, and retry-safe states.** The page must explicitly cover loading, empty, success, and error/retry states as required by `docs/FRONTEND.md`. For per-card summary sources, partial failures should degrade individual summaries to fallback text or subdued indicators while preserving the household card and its core actions.

6. **Improve discoverability of existing household operations.** Add quick actions that connect overview cards to routes users already need, such as household detail, budgets, or insights, but only when the current route and role model make those actions truthful. Prefer `Button asChild` + `Link` for primary actions, and only consider a compact action menu if the number of truthful actions becomes too large for the card footer. Do not replicate downstream settings/member-management UIs inside the overview.

7. **Preserve create-household and multi-household safety.** Keep the existing create dialog or a bounded replacement path intact. Ensure the enriched overview remains explicit for users with multiple households and never assumes one global active household for subsequent flows.

8. **Localize all new copy and add direct regression coverage.** Add i18n keys for headings, card labels, localized role/status labels, fallback states, quick actions, and summary text. Add tests for one-household and multi-household rendering, no-household empty state, action visibility, responsive card behavior where practical, partial summary failure behavior, and retry handling. Finish with the standard frontend verification flow and full `./init.sh`.

## Concrete Steps (Commands)

Run from repo root unless noted otherwise.

```bash
# Baseline verification before implementation
./init.sh

# Run focused web tests while developing household overview changes
pnpm --filter web test -- --run households

# Frontend quality gates
pnpm --filter web lint
pnpm --filter web typecheck

# Final full-repo verification required by AGENTS.md
./init.sh
```

Expected short outputs to compare against:

- `pnpm --filter web test -- --run households` shows the new/updated households tests passing (for example, `N passed, 0 failed`).
- `pnpm --filter web lint` completes without errors.
- `pnpm --filter web typecheck` completes without TypeScript errors.
- `./init.sh` completes with install/harness checks/lint/type-check/tests/build succeeding.

## Validation and Acceptance

- Happy path — one household:
  - Visiting `/households` shows a real summary card instead of placeholder metadata.
  - The card displays the household name, truthful role badge, real member count, and at least one real budget or expense/analytics summary signal.
  - The card exposes bounded quick actions that navigate to existing valid downstream routes.
- Happy path — multiple households:
  - `/households` renders one enriched card per membership without inventing a primary household.
  - Each card’s actions and summary content remain tied to that household’s own identifiers.
- Happy path — no households:
  - The page renders a coherent empty state with a clear next-step CTA to create a household or continue onboarding, without showing broken placeholders.
- Validation/error paths:
  - Initial household-list load failure renders a retry action.
  - If one additive per-household summary source fails, the page still renders the household card and degrades only the affected sub-section.
  - Create-household submission success and failure behavior remain intact after page restructuring.
- UI/UX acceptance:
  - Loading state uses shadcn `Skeleton` components or an equivalent layout-preserving placeholder, not a text-only loading card.
  - The placeholder member-count experience is fully removed; the card shows a real value, a loading placeholder, or a graceful fallback only.
  - List-level errors render with an accessible alert treatment (`Alert` or equivalent `role="alert"` pattern) and keep retry obvious.
  - Household cards follow clear hierarchy with header, summary content, and footer actions; quick actions are visible without overwhelming the card.
  - The overview uses a responsive multi-column layout at larger breakpoints and remains readable without horizontal scrolling on mobile.
  - Role and status labels are localized and do not rely on color alone to communicate meaning.
- Unauthorized/forbidden:
  - The protected route remains protected through existing app auth gating.
  - Admin-only or member-specific action affordances must only appear when current role/data make them truthful; no fabricated privilege escalation in the overview.
- Regression checks:
  - Existing navigation into household detail still works.
  - New overview tests cover multi-household rendering, empty state, action visibility, and retry/partial-failure handling.
- Acceptance artifact:
  - A passing households-page/component test transcript and `./init.sh` output recorded in `harness/progress.md` and `harness/features/feat-042.json` evidence.

## Idempotence & Recovery

- UI and harness edits are safe to re-run because they are deterministic source changes.
- If the composed per-household query strategy becomes too complex, revert to the last committed state and re-apply only the highest-value summary signal set rather than broadening scope.
- If an intended summary depends on data not truthfully available from current contracts, remove that summary and keep the rest of the overview intact.
- If the existing household store becomes a blocker, prefer a narrow additive bridge or direct query composition for the overview instead of a cross-feature store rewrite.

## Artifacts and Notes

- Expected artifacts after execution:
  - Expanded `/households` overview implementation with feature-bounded components.
  - New or updated web tests covering enriched household overview behavior.
  - Updated i18n keys for the new overview content.
  - Updated harness feature and progress records with concrete verification evidence.
  - A commit limited to the expected household-overview/harness/planning files.

## Risks and Blockers

- Risk: per-household client-side summary composition may create too many parallel queries or too much view complexity.
  - Mitigation: limit the summary set to the highest-value signals and prefer existing hooks with bounded fallback UI.
- Risk: the feature may sprawl into backend summary-contract work.
  - Mitigation: treat backend additions as explicit follow-up only if frontend-first composition is proven insufficient.
- Risk: quick actions may drift into duplicating downstream flows.
  - Mitigation: keep the overview action layer link-based and summary-focused.
- Risk: mixed Zustand + React Query data sourcing may tempt a broad architectural rewrite.
  - Mitigation: choose the smallest additive boundary change that keeps `/households` maintainable.
- Risk: UI improvements may drift into a broad visual redesign or add low-value decorative elements.
  - Mitigation: keep the UI/UX bar focused on hierarchy, scanability, accessibility, responsive layout, and truthful action affordances within the current design system.
- Risk: shared loading and error state in the current household store may produce confusing overview interactions when list loading and create-household submission overlap.
  - Mitigation: separate list-level and dialog-level interaction handling where needed without rewriting the whole store architecture.

## Verification Path

- Baseline before coding: run `./init.sh` from repo root to confirm the repository is in a clean verified state.
- During implementation: run focused web tests for the households overview, then `pnpm --filter web lint` and `pnpm --filter web typecheck`.
- Before claiming completion: rerun `./init.sh` from repo root and capture the relevant passing transcript snippets in harness evidence.

## Open Decisions

- Which exact real summary set is best for the first pass without creating excessive per-household query fan-out: member count + budget status + expense count, or member count + budget presence + analytics spend total?
- Should the enriched overview continue to use the Zustand household list as the primary source, or should it switch `/households` to React Query for easier composition with existing summary hooks?
- If no active budget exists for a household, should the quick-action emphasis point to `/budgets` setup first, or should the card prioritize household detail as the canonical next step?
- If additive summary queries create noticeable UX latency for many households, is a staged rendering pattern sufficient, or should a later backend summary contract be proposed explicitly?
- If truthful quick actions exceed comfortable card-footer space, should the implementation keep all actions visible or collapse secondary actions into a compact shadcn `DropdownMenu`?

## Harness Integration

- `harness/features/feat-042.json`
  - Keep status `pending` until implementation is complete.
  - After implementation, update evidence with the active ExecPlan path, concrete touched UI/test files, and the exact verification commands that passed.
- `harness/feature_index.json`
  - Keep `feat-042` as `pending` while this plan is active.
  - Mark it `done` only after implementation, verification, and evidence updates are complete.
- `harness/progress.md`
  - Add a newest-first entry recording creation of this active ExecPlan, its frontend-first scope lock, main in-scope summary goals, and the next implementation steps.
- `docs/exec-plans/index.md`
  - Add this plan under `Active` now.
  - Move it to `Completed` only after implementation finishes; do not move the plan file itself out of `docs/exec-plans/plans/`.
