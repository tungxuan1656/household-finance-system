# Progress Log

## Template for future entries
- Date: YYYY-MM-DD
- Who: <name>
- Summary: <short summary>
- Files changed: <The description lists the changed files, without listing the file names.>
- Blockers: <list or none>
- Next steps: <next actions>

<!-- Start writing log before here, latest log on top -->
## 2026-05-27 — Refactored bottom tabs and four-tab protected navigation

- Who: Orchestrator + User
- Summary: Continued the Yellow Finance protected-pages execution with the first live shell-navigation batch. Reduced the shared protected nav model to the approved four top-level tabs (`Expense`, `Analysis`, `Household`, `Settings`), switched `PATHS.APP_ROOT` and auth default redirects to Expense semantics, converted `/home` into a compatibility redirect, updated the manifest shortcut, centralized active-state logic in `navigation.ts`, and rebuilt the mobile bottom tab bar into a rounded elevated surface with selected gold-pill states that better matches the approved Stitch direction.
- Files changed: Protected path/auth/navigation constants, mobile bottom-tab component, desktop sidebar nav mapping, `/home` protected route redirect, manifest shortcut, feat-073 evidence, and this progress log.
- Verification: `gitnexus_impact` for `BottomTab`, `AppSidebar`, and `HomeRoutePage` returned `LOW` risk with 0 direct dependents and 0 affected processes; `./init.sh typecheck` returned `OK`; `./init.sh lint` returned `OK`; `gitnexus_detect_changes(scope: all)` returned `LOW` risk with 10 changed symbols across 7 files and 0 affected processes.
- Blockers: No dev server was attached in this thread, so this batch was not visually browser-verified yet.
- Next steps: Visually verify the new shell if a local web server is available, then move to the first protected page adoption batch on the Expense surface using the shared page wrappers.

## 2026-05-27 — Built shared protected-page wrapper foundation

- Who: Orchestrator + User
- Summary: Started executing the Yellow Finance protected-pages plan with the lowest-risk foundation batch. Added the new shared page wrapper modules under `apps/web/src/components/shared/page/`: `PageContainer`, `PageHeader`, `PageContent`, `PageFooter`, and a barrel export. `PageHeader` now supports the requested back-button contract plus `left` and `right` render slots, while `PageContent` and `PageFooter` encode the default protected-page spacing and bottom-nav-safe layout behavior needed for later route migrations.
- Files changed: New shared page wrapper components, active ExecPlan progress/discovery notes, feat-073 evidence, and this progress log.
- Verification: `gitnexus_impact` for `PageShell` and `MobileHeader` returned `LOW` risk with 0 direct dependents and 0 affected processes; `./init.sh typecheck` returned `OK`; `./init.sh lint` returned `OK`; `gitnexus_detect_changes(scope: all)` returned no changed symbols because the new wrapper files are still untracked.
- Blockers: none.
- Next steps: Begin Batch 1 shell foundation by changing route constants and navigation, then start adopting the shared wrappers on the first protected page surface.

## 2026-05-27 — Wrote Yellow Finance protected-pages ExecPlan and canonical page rules

- Who: Orchestrator + User
- Summary: Converted the approved Yellow Finance protected-shell design into an implementation-ready ExecPlan for the actual `apps/web` refactor. The plan sequences the work into shell foundation, shared page-wrapper creation, Expense/Analysis/Household/Settings page rebuilds, contextual route cleanup, and final `PageShell` removal. In the same session, updated the canonical frontend docs so future protected pages now point at `PageContainer`/`PageHeader`/`PageContent`/`PageFooter`, the four-tab responsive shell model, and the shared-page-wrapper ownership rules instead of the older `PageShell` contract.
- Files changed: New ExecPlan, exec-plans index, frontend router doc, new protected-page surface reference doc, responsive shell reference doc, frontend component architecture guide, new feat-073 harness record, feature index, and this progress log.
- Blockers: none.
- Next steps: Execute `docs/exec-plans/plans/2026-05-27-yellow-finance-protected-pages-refactor.md` in a later session, starting with the required GitNexus impact checks on shell and top-level page symbols.

## 2026-05-27 — Refined protected-shell design doc from approved Stitch screens

- Who: Orchestrator + User
- Summary: Updated the new protected-shell design doc so it now reflects the actual approved Yellow Finance screens instead of only the textual product brief. Pulled the Stitch project and the ten provided screens, downloaded their hosted HTML and screenshots with `curl -L`, then folded the real UI details back into the doc: the exact 4-tab labels, Expense summary/filter/timeline/FAB composition, Analysis segmentation and card hierarchy, Household card/activity/detail patterns, Settings profile-management layout, the full 3-step add-expense drawer structure, and the add-household bottom sheet details.
- Files changed: Protected-shell design doc, feat-072 harness evidence, and this progress log.
- Blockers: none.
- Next steps: Convert the refined design doc into one ExecPlan before starting the `apps/web` refactor.

## 2026-05-27 — Wrote mobile-first protected-shell refactor design doc

- Who: Orchestrator + User
- Summary: Captured the durable design direction for the full protected `apps/web` UI refactor. The new design doc locks one mobile-first app shape with a shared header/content/navigation model, keeps auth pages unchanged, moves the protected post-auth entry toward the Expense surface, reduces top-level navigation to four tabs (Expense, Analysis, Household, Settings), replaces `PageShell`/`PageSection` with `PageContainer`/`PageHeader`/`PageContent`/`PageFooter`, and records the new 3-step bottom-drawer expense flow plus household list/add/detail surfaces.
- Files changed: Design-docs index, new protected-shell design doc, new harness feature record, feature index, and this progress log.
- Blockers: none.
- Next steps: Convert this design doc into one ExecPlan before starting the actual `apps/web` refactor.

## 2026-05-27 — Completed Product V2 full project reset (Phases 2-4)

- Who: Orchestrator + User
- Summary: Finished the remaining V2 reset work across schema, worker internals, and web UI. Rewrote the base D1 migration to canonical V2 (removed visibility/payer/creator columns from expenses, renamed to spent_by_user_id, added user category/source keys, made group household_id nullable, added household_invitations). Removed all temporary repository bridges from worker repositories and handlers so internal code now matches the public V2 contract. Cleaned web code by renaming Lens→View in overview components, removing dead payer-attribution analytics types and UI card, and purging all visibility/payer/lens V1 i18n keys from Vietnamese locale.
- Files changed: Worker migration 0001_init.sql (deleted 0002-0008), worker expense repositories (row-mapper, repository, query, scope, summary, analytics, analytics-export, group-expense-list, group-summary, group-assignment, budget-spend-summary), worker expense handlers (create, update, shared, authorization, get, restore, list, replace-expense-groups), worker analytics contract, worker expense schema, web overview tabs/page/test, web analytics types, web insights comparison section, web Vietnamese i18n, harness feature records, active ExecPlan, and this progress log.
- Verification: Stale-term scans for payer_user_id|payerUserId|payerAttribution|visibility|lens|Lens returned no matches across apps/worker/src and apps/web/src; full `./init.sh` returned Done!; final `gitnexus_detect_changes(scope: all)` returned LOW risk with changed indexed symbols across files and 0 affected processes.
- Blockers: none.
- Next steps: Review diff and commit if desired.

## 2026-05-27 — Restored a green full worker suite after V2 expense migration

- Who: Orchestrator + User
- Summary: Finished migrating the worker expense integration matrix to V2 semantics after the public expense contract switch. Updated personal feed, household feed, detail-access, update, delete, restore, group-assignment, and scenario tests to stop sending or asserting `visibility`, `payer`, and creator-based public fields. Also aligned detail-access behavior with the V2 personal-spending rule so the spender can still read their own expense detail after leaving a household. The repo now keeps temporary bridges from legacy storage columns to V2 DTOs, but the worker-facing behavior and tests are green again.
- Files changed: Worker expense handlers, expense query helper unit test, expense integration/scenario suites, groups-assignment helper fixture, active ExecPlan, feat-071 evidence, and this progress log.
- Verification: `pnpm --filter worker exec vitest run test/integration/expenses-list-personal-feed.spec.ts test/integration/expenses-list-personal-visibility.spec.ts test/integration/expenses-list-household.spec.ts test/integration/expenses-list-household-member.spec.ts` passed with 13 tests; `pnpm --filter worker exec vitest run test/integration/expenses-update-authorization.spec.ts test/integration/expenses-update-validation.spec.ts test/integration/expenses-update-audit.spec.ts` passed with 6 tests; `pnpm --filter worker exec vitest run test/integration/expenses-delete.spec.ts test/integration/expenses-restore.spec.ts test/integration/groups-assignment.spec.ts test/integration/scenario-group-expense.spec.ts test/integration/scenario-household-expense.spec.ts test/integration/groups-read.spec.ts` passed with 22 tests; `pnpm --filter worker exec vitest run test/unit/expense-query-helpers.spec.ts test/integration/expenses-detail-access.spec.ts` passed with 9 tests; `pnpm --filter worker test` passed with 76 files and 366 tests; final `./init.sh` returned `Done!`; final `gitnexus_detect_changes(scope: all)` returned LOW risk with 8 changed indexed symbols across 10 files and 0 affected processes.
- Blockers: none.
- Next steps: Continue Phase 3 and Phase 2 by reducing or removing temporary legacy storage bridges, then migrate the remaining web/UI copy and any untouched schema/internal records toward the final V2 model.

## 2026-05-27 — Migrated public expense CRUD/query contract to V2

- Who: Orchestrator + User
- Summary: Continued the Product V2 reset by moving the public expense contract to V2 across worker and web CRUD/query entry points. Worker expense request/response schemas now pivot around optional `householdId` and `spentByUserId` in DTOs, worker list/detail/summary/update/delete/restore handlers and query helpers now bridge to that contract, personal query defaults moved toward current-user spending semantics, and web expense types, form schema, entry-form payload builders, detail actions, and detail card were updated to stop depending on `visibility`, `payer`, and `creator` as public expense fields. Rewrote the focused worker contract tests and a first set of expense integration tests to match the new API.
- Files changed: Worker expense contracts/query helpers/handlers/tests, web expense types/forms/components/tests, active ExecPlan, feat-071 evidence, and this progress log.
- Verification: `./init.sh typecheck` returned `OK`; `pnpm --filter worker exec vitest run test/unit/dto-expense.spec.ts test/unit/dto-expense-list.spec.ts` passed with 41 tests; `pnpm --filter web exec vitest run src/features/expenses/components/use-expense-entry-form.test.ts` passed with 8 tests; `pnpm --filter worker exec vitest run test/integration/expenses.spec.ts test/integration/expenses-detail-success.spec.ts test/integration/expenses-summary.spec.ts` passed with 15 tests; `gitnexus_detect_changes(scope: all)` returned `MEDIUM` risk with 60 changed indexed symbols across 26 files and 4 affected processes.
- Blockers: Full `./init.sh` still fails because many deeper worker integration suites and analytics/budget/group flows still depend on legacy expense payloads and legacy assertions.
- Next steps: Continue Phase 3 by migrating remaining worker integration suites plus the downstream analytics, budget, restore/delete, group-assignment, and scenario flows that still assume `visibility`, `payer`, or creator-based query semantics.

## 2026-05-27 — Removed household defaultVisibility from current schema and app contracts

- Who: Orchestrator + User
- Summary: Continued the Product V2 reset by removing `defaultVisibility` as a current product concept from the household slice. Updated worker household contracts, row mappers, repositories, handlers, Vietnamese validation messages, integration/unit tests, and `apps/worker/migrations/0001_init.sql`; updated web household types, settings form schema, store test, role-label helper, and locale strings. This leaves household settings aligned with V2: name, currency, timezone, membership, and lifecycle only.
- Files changed: Worker household contracts/repositories/handlers/messages/tests, web household types/schema/utils/store test/locale copy, base migration, active ExecPlan, feat-071 evidence, and this progress log.
- Verification: `./init.sh typecheck` returned `OK`; `pnpm --filter worker exec vitest run test/unit/dto-household.spec.ts test/integration/households-read-update.spec.ts` passed with 16 tests; `pnpm --filter web exec vitest run src/stores/household.store.test.ts` passed with 8 tests; stale-term scan for `defaultVisibility|default_visibility` returned no matches in the touched worker/web slice; `gitnexus_detect_changes(scope: all)` returned `MEDIUM` risk with 6 changed indexed symbols across 16 files and 3 affected household-related processes.
- Blockers: none.
- Next steps: Move to the broad expense contract reset: remove visibility/payer/creator semantics from worker and web expense types, handlers, queries, and tests.

## 2026-05-27 — Completed Product V2 spec rewrite phase

- Who: Orchestrator + User
- Summary: Executed Phase 0 and Phase 1 of the Product V2 reset plan. Ran the required GitNexus impact checks and confirmed the broadest early blast radius is the expense contract (`ExpenseDTO`), while the initial handler/form/page symbols stayed LOW risk. Rewrote the current product spec tree to align with V2, replaced `expense-ownership.md` with `expense-spender-model.md`, replaced `data-visibility.md` with `expense-household-context.md`, updated the specs index, and removed V1 product-model terminology from `docs/product-specs/`.
- Files changed: Product spec docs, specs index, active ExecPlan progress/discoveries, feat-071 harness record, feature index, and this progress log.
- Verification: `python3 -m json.tool` validated harness JSON; stale-term scan on `docs/product-specs` returned no matches for `payer|creator|visibility|private|public|lens|defaultVisibility`; final `./init.sh` returned `Done!`; final `gitnexus_detect_changes(scope: all)` returned LOW risk with 100 changed indexed sections across 19 indexed files and 0 affected processes.
- Blockers: none.
- Next steps: Begin Phase 2 and Phase 3 together so migration reset and backend contract changes land in one coherent block.

## 2026-05-27 — Wrote Product V2 full-project reset ExecPlan

- Who: Orchestrator + User
- Summary: Created the active full-project reset plan for Product Direction V2. The plan covers current product specs, D1 migration reset, worker contract/repository/handler/test rewrites, web form/query/dashboard/copy/test rewrites, and current docs/harness cleanup so the project no longer treats payer/creator, private/public visibility, household-first positioning, household-dependent groups, or lens terminology as current product truth. Also moved the stale feat-061 expense-entry plan from Active to Completed in the exec-plan index because the feature record is already done.
- Files changed: New Product V2 reset ExecPlan, exec-plan index, new harness feature record, feature index, and this progress log.
- Verification: `python3 -m json.tool` validated harness JSON; placeholder scan found no unfinished placeholder markers in the new plan and touched harness/index files; final `./init.sh` returned `Done!`; `gitnexus_detect_changes(scope: all)` returned LOW risk with 5 changed indexed sections across 3 indexed files and 0 affected processes.
- Blockers: none.
- Next steps: Begin Phase 0 of the plan by running GitNexus impact checks, then execute the reset in phases.

## 2026-05-27 — Clarified product direction v2 in Vietnamese, English, and design docs

- Who: Orchestrator + User
- Summary: Rewrote both product overview docs so they now describe the same product truth: the app serves both personal and household finance, each expense is recorded by the spender, household is an optional family-sharing context, and group/event is an independent classification axis. Added a durable design doc that explains the v1 -> v2 direction shift, including the removal of family-first positioning, `payer vs creator`, and `private/public` as core product concepts.
- Files changed: Vietnamese and English product overview docs, design-docs index, new product-direction design doc, new harness feature record, feature index, and this progress log.
- Verification: `python3 -m json.tool` validated `harness/feature_index.json` and `harness/features/feat-070.json`; targeted wording search confirmed the old-model terms remain only in explicit contrast/de-scope text; final `./init.sh` returned `Done!`; final `gitnexus_detect_changes(scope: all)` returned `LOW` risk with 79 changed indexed sections across 5 indexed files and 0 affected processes.
- Blockers: none.
- Next steps: Optionally align downstream product specs and user-facing copy that still assume the old model.

## 2026-05-25 — Added UI/UX review skill and reviewer sub-agent

- Who: Orchestrator
- Summary: Added the new `feat-069` portable UI/UX review flow. Created `.agents/skills/ui-ux-review/` with core review workflow, anti-bias rules, scoring rubric, exact output format, and focused checklists for mobile, dashboard, forms, navigation, and finance-app screens. Added `.agents/agents/ui-ux-reviewer.md` as the minimal-context review-only sub-agent prompt and documented the `.agents/agents/` convention.
- Files changed: `.agents/skills/ui-ux-review/**`, `.agents/agents/ui-ux-reviewer.md`, `.agents/README.md`, `harness/features/feat-069.json`, `harness/feature_index.json`, `harness/progress.md`.
- Verification: Focused artifact checks passed by listing new skill/sub-agent files and parsing `harness/feature_index.json` plus `harness/features/feat-069.json`; final `./init.sh` returned `Done!`; final `gitnexus_detect_changes(scope: all)` returned LOW risk with 2 changed symbols across 3 indexed files and 0 affected processes.
- Blockers: none.
- Next steps: Review diff and commit if desired.

## 2026-05-21 — Fixed insights month selector regression

- Who: Orchestrator
- Summary: Fixed the insights month dropdown regression where selecting an older month rebuilt the option list from that older selection and removed newer months like the current `05-2026` option. Root cause was `buildPeriodOptions` anchoring the six-month window to the selected month instead of the current/latest anchor month. The util now anchors options to the newer of the selected period and current UTC period, so moving backward in history keeps the latest month visible while still supporting newer explicit periods.
- Files changed: Insights period helper, its focused regression test, feat-028 harness evidence, and this progress log.
- Verification: Red step: `pnpm --filter web exec vitest run src/features/insights/utils/insights-period.test.ts` failed with the new regression expectation before the fix; green step: the same focused test passed with 2/2 tests after the fix; read-only code review returned PASS with no blocking findings; final `./init.sh` passed with `Done!`; final `gitnexus_detect_changes(scope: all)` returned LOW risk with 5 changed symbols across 4 files and 0 affected processes.
- Blockers: none.
- Next steps: Optional only: smoke-check the Insights dropdown in browser, then review diff and commit if desired.

## 2026-05-21 — Added budget delete lifecycle across worker and web

- Who: Orchestrator + code-reviewer
- Summary: Added admin-only budget deletion end to end. Worker now exposes `DELETE /api/v1/budgets/:id` through a dedicated handler with path validation, household membership permission checks, soft delete via `archived_at`, audit logging, and rollback on audit failure. Web budget cards now show a destructive confirm-dialog action that calls the new mutation, refreshes budget queries, closes the edit dialog if the deleted budget was being edited, and shows localized success/failure toast feedback. The budget product spec and harness records now document that deleted budgets disappear from active budget lists and current dashboard views.
- Files changed: Budget worker contract/repository/route/handler/test layers, budget web API/hook/types/page/list/card orchestration, Vietnamese locale copy, budget product spec, new feat-068 harness record, feature index, and this progress log.
- Verification: TDD red step confirmed the new delete tests failed before implementation; targeted `pnpm --filter worker exec vitest run test/integration/budgets-read-update.spec.ts` passed with 13/13 tests after implementation; `pnpm --filter worker lint`, `pnpm --filter worker typecheck`, `pnpm --filter web lint`, and `pnpm --filter web typecheck` all passed; read-only code review returned APPROVE with no blocking findings; final `./init.sh` passed with `Done!`; final `gitnexus_detect_changes(scope: all)` returned MEDIUM risk with 30 changed symbols across 14 files and 3 affected helper processes (`SoftDeleteBudget`, `RestoreBudget`, `DeleteBudgetLimits`).
- Blockers: none.
- Next steps: Optional follow-up only: add one extra regression test proving deleted budgets stay hidden from list queries, then review diff and commit if desired.

## 2026-05-21 — Completed protected-page PageShell/DataState normalization

- Who: Orchestrator + code-reviewer
- Summary: Finished feat-067 by normalizing the remaining protected route pages around the repo-standard `PageShell` and `DataState` rules. Settings and expense trash now keep their blocking states inside one shell; home no longer duplicates shell padding in its empty branch; budgets and groups moved to shell-owned titles with normalized async-state widgets; group detail now uses shell-owned back navigation and blocking state handling; insights moved title ownership to `PageShell` while keeping specialized chart/loading layouts; onboarding setup and completion now both render inside the shared shell.
- Files changed: Protected frontend route orchestrators for settings, expense trash, home, budgets, groups, group detail, insights, and onboarding; touched budget/group/insights child components; plan/index/harness tracking files; and this progress log.
- Verification: `./init.sh lint` OK; `./init.sh typecheck` OK; `./init.sh test` OK; final `./init.sh` passed with `Done!`; code review requested and the required group-detail mobile back-navigation fix was applied; final `gitnexus_detect_changes(scope: all)` returned MEDIUM risk with 26 changed symbols across 18 files and 1 affected onboarding process (`OnboardingPage -> NormalizeInviteToken`).
- Blockers: none.
- Next steps: Perform manual browser smoke checks for the touched protected routes if desired, then review diff and commit if desired.

## 2026-05-21 — Wrote protected-page PageShell/DataState ExecPlan

- Who: Orchestrator + User
- Summary: Converted the completed PageShell/DataState page audit into an implementation-ready ExecPlan for eight protected routes. The plan keeps the work frontend-only, sequences it into three low-risk batches, preserves specialized Insights/Onboarding layouts where generic `DataState` cards would be a poor fit, and records the existing LOW-risk GitNexus impact evidence before any code edits begin.
- Files changed: New ExecPlan, plans index, new feat-067 harness record, feature index, and this progress log.
- Blockers: none.
- Next steps: Execute Batch 1 (`settings-page.tsx`, `expense-trash-page.tsx`, `overview-page.tsx`), then continue through the remaining batches with targeted verification and final full `./init.sh`.

## 2026-05-20 — Corrected expense detail DataState integration

- Who: Orchestrator + User
- Summary: Reworked `apps/web/src/features/expenses/pages/expense-detail-page.tsx` so the page now integrates with one shared `DataState` instance fed by derived loading/empty/error/action props, instead of rendering separate `DataState` components per branch. The success layout and existing edit/delete flow remain unchanged, while not-found/forbidden/generic-error actions are computed centrally before render.
- Files changed: Expense detail page orchestration, feat-065 evidence wording, and this progress log.
- Verification: `./init.sh` passed with `Done!`; final `gitnexus_detect_changes(scope: all)` returned LOW risk with no affected processes.
- Blockers: none.
- Next steps: Review the expense detail states in browser and commit if desired.

## 2026-05-20 — Unified DataState retry/custom action API

- Who: Orchestrator
- Summary: Refactored the shared `DataState` contract to use `retryAction`, `showRetryAction`, and `customAction` instead of the old generic action slot. The shared component now renders the default outline retry button automatically when a retry callback exists, suppresses that retry affordance when a custom action component is provided, and the migration was applied across expense, household, and overview surfaces. The expense detail page now routes its async states through the shared `DataState` pattern while keeping the existing success actions and content layout.
- Files changed: Shared state component API, expense detail/edit/feed surfaces, household list/detail/member surfaces, overview widgets, feat-065 evidence, and this progress log.
- Verification: `./init.sh` passed with `Done!` after fixing the initial retry callback type mismatch.
- Blockers: none.
- Next steps: Review the visual state changes for overview/expense/household pages in browser and commit if desired.

## 2026-05-20 — Clarified planning defaults for non-trivial tasks

- Who: Orchestrator + User
- Summary: Added a follow-up workflow clarification so the harness no longer leaves small-but-real implementation tasks in a gray area. The repo contract now says every task needs a planning mode, keeps tiny one-shot exceptions narrow, requires explicit inline plans for normal Level 1 multi-step work, and makes verification-before-completion explicit before done/ready claims.
- Files changed: Root agent contract, plan router, project-owned workflow skills, feat-066 harness evidence, and this progress log.
- Verification: `./init.sh` passed with `Done!`; stale wording search across `.agents/skills` found no matches for the targeted contradictory patterns.
- Blockers: none.
- Next steps: Apply the clarified workflow in future sessions; review diff and commit if desired.

## 2026-05-20 — Refactored expense feed and detail page orchestration

- Who: Orchestrator
- Summary: Refactored the two main expense route surfaces to align with the frontend architecture docs. The expense feed page now uses `PageShell`, keeps page-level composition leaner, and delegates category/group/filter derivation to a new pure helper module with focused Vitest coverage. The expense detail page now keeps all loading/error/forbidden/not-found/success states inside one `PageShell`, reuses shared fallback building blocks, and preserves existing edit/delete behavior while reducing repeated markup.
- Files changed: Expense feed/detail page orchestration, new pure helper + focused helper test, new feat-065 harness record, feature index, and this progress log.
- Verification: `pnpm --filter web exec vitest run src/features/expenses/pages/expense-feed-page-helpers.test.ts` passed with 1 file / 4 tests; final `./init.sh` passed with `Done!`; final `gitnexus_detect_changes(scope: all)` returned LOW risk with 26 changed symbols, 4 changed files, and 0 affected processes.
- Blockers: none.
- Next steps: Review diff and commit if desired.

## 2026-05-20 — Clarified initial-thinking versus brainstorming in skill routing

- Who: Orchestrator + User
- Summary: Refined feat-064 after reviewing the new skill set semantics. `using-skills` now states that every task requires mandatory initial thinking before ceremony selection, and explicitly frames itself as entrypoint plus light triage rather than mechanical classification. `brainstorming` now clearly covers deeper structured exploration only when triage finds ambiguity, tradeoffs, unclear acceptance criteria, or non-trivial behavior/design/architecture impact. `writing-plans`, `executing-plans`, `verification-before-completion`, and `ceremony-levels` were aligned to the same distinction so the system keeps thought mandatory without forcing formal brainstorming on trivial work.
- Files changed: Skill-routing and workflow-skill wording, feat-064 evidence description, and this progress log.
- Verification: `./init.sh` passed with `Done!`; stale wording search across `.agents/skills` found no matches for the targeted contradictory patterns.
- Blockers: none.
- Next steps: Review the wording tone and commit if desired.

## 2026-05-20 — Completed portable skill-system ceremony alignment

- Who: Orchestrator
- Summary: Finished feat-064 by moving shared skill guidance into portable folder-based skills, adding project-level `.agents` guidance, and rewriting the core workflow skills around minimum-sufficient ceremony. `using-skills` now acts as the single entrypoint, Level 0 work is no longer forced through heavy process, verification and review expectations scale by ceremony level, the deferred subagent refactor stays out of scope, and stale skill references were removed without expanding skill metadata.
- Files changed: Project-level agent-skill guidance, new shared ceremony/maintenance skill folders, core workflow skill docs, stale reference cleanup in supporting skills, new feat-064 harness record, feature index, and this progress log.
- Verification: `./init.sh` passed with `Done!`; final `gitnexus_detect_changes(scope: all)` returned LOW risk with 9 changed files, 0 changed symbols, and 0 affected processes.
- Blockers: none.
- Next steps: Review diff and commit if desired.

## 2026-05-20 — Completed frontend shim cleanup and ownership normalization

- Who: Orchestrator + fixer + oracle reviewers
- Summary: Finished feat-063 by removing the leftover frontend compatibility shims created during the feature-first migration. Deleted the old `components/expense`, `components/budget`, and household shim entrypoints; rewired onboarding, overview, expenses, households, stores, and tests to canonical feature-first imports; normalized budget field ownership under `features/budgets/components/fields`; and kept only genuinely shared root infrastructure.
- Files changed: Expense/budget/household legacy shim trees, feature-first consumer imports across onboarding/overview/expenses/households/stores/tests, shared field-row/format helper consolidation, feat-063 plan/index/harness records, and this progress log.
- Verification: `./init.sh` passed with `Done!`; final `gitnexus_detect_changes(scope: all)` returned MEDIUM risk with 52 changed symbols, 26 changed files, and 1 affected process (`ExpensesPage -> LocalDateToTimestamp`); final oracle review for feat-063 returned PASS with no blocking issues.
- Blockers: none.
- Next steps: Review diff and commit if desired.

## 2026-05-20 — Wrote frontend shim-cleanup ExecPlan

- Who: Orchestrator + User
- Summary: Converted the approved shim-cleanup design into an implementation-ready ExecPlan. The plan removes leftover frontend compatibility shims after feat-062, normalizes budget field ownership under feature paths, rewires household/store/onboarding/overview consumers to canonical feature-first imports, and requires pre-delete impact checks plus final verification.
- Files changed: Shim-cleanup ExecPlan, plans index, and this progress log.
- Blockers: none.
- Next steps: Run pre-edit GitNexus impact checks, then execute cleanup batches for expense, budget, and household/root shim removal.

## 2026-05-20 — Approved frontend shim cleanup direction

- Who: Orchestrator + User
- Summary: Agreed to remove the leftover frontend compatibility shims created during the feature-first migration. The approved direction is to normalize canonical ownership first where needed (especially budget fields), then delete legacy `components/expense`, `components/budget`, household shim entrypoints, and old hook/type shims once all consumers point at feature-first paths.
- Files changed: New shim-cleanup design doc, design-docs index, new feature record, feature index, and this progress log.
- Blockers: none.
- Next steps: Convert the approved shim-cleanup design into an ExecPlan before editing code.

## 2026-05-20 — Refactored expenses feed UI

- Who: Orchestrator
- Summary: Refactored the expenses feed list and filters to match the recent expenses item design and improved mobile layout. Changed `ExpenseFeedItem` to match the badge/icon and layout of recent expenses. Wrapped `ExpenseFeedFilters` inputs in a scrollable shadcn `Dialog` with a Filter button, keeping the search input exposed for better UX on smaller screens.
- Files changed: Expense feed item and expense feed filters components.
- Verification: `./init.sh typecheck` and `./init.sh lint` passed successfully.
- Blockers: none.
- Next steps: Review diff and commit if desired.
## 2026-05-19 — Completed web feature-first folder architecture refactor

- Who: Orchestrator + fixer + oracle reviewers
- Summary: Finished the `apps/web/src` migration from mixed `views/` + domain-component layering to feature-first ownership. Protected/public route files now stay thin and import from `@/features/**/pages/*`; domain-local pages/components/hooks/api/types moved under feature roots across more, onboarding, settings, insights, overview, auth, invitations, budgets, households, groups, and expenses; the old `views/` tree is gone; system not-found UI moved to shared components; and the canonical frontend docs now describe the feature-first structure.
- Files changed: Web route/page imports, new `apps/web/src/features/**` trees, compatibility shims for selected shared-consumer modules, shared not-found component placement, canonical frontend reference docs, plans index, feat-062 records, and this progress log.
- Verification: `./init.sh typecheck` passed with `OK`; final full `./init.sh` passed with `Done!`; final `gitnexus_detect_changes(scope: all)` returned LOW risk with 22 changed symbols, 68 changed files, 0 affected symbols, and 0 affected processes.
- Blockers: none.
- Next steps: Review diff and commit if desired.

## 2026-05-19 — Wrote web feature-first folder refactor ExecPlan

- Who: Orchestrator + User
- Summary: Converted the approved web folder-architecture design into an implementation-ready ExecPlan. The plan moves `apps/web/src` to feature-first ownership, keeps App Router route files thin, removes `views/`, locks canonical feature naming for overview/settings/insights, and requires doc + harness alignment with pre-edit GitNexus impact checks and final verification.
- Files changed: Web folder-architecture ExecPlan, plans index, new feature record, feature index, and this progress log.
- Blockers: none.
- Next steps: Execute the plan by mapping current ownership, running impact checks, then migrating features into `apps/web/src/features/**` in low-risk batches.

## 2026-05-19 — Fixed raw money input display in shared expense-entry form

- Who: Orchestrator
- Summary: Adjusted the shared expense amount display helper so the amount input keeps raw typed digits instead of inline formatting them to VND display text. The `.000 đ` suffix now remains solely in the input addon, while submit scaling and edit hydration keep the existing `*1000` storage semantics unchanged.
- Files changed: Expense amount display helper, focused helper test, and this progress log.
- Verification: `pnpm --filter web exec vitest run src/components/expense/dialog-amount-helper.test.ts src/components/expense/use-expense-entry-form.test.ts` passed with 2 files / 13 tests; `pnpm exec tsc -p apps/web/tsconfig.json --noEmit` passed; full `./init.sh` passed with `Done!` before this log entry.
- Blockers: none.
- Next steps: Re-run final verification after the progress log update if preparing a commit-ready handoff.

## 2026-05-19 — Shipped shared expense-entry add/edit unification

- Who: Orchestrator + fixer + oracle reviewer
- Summary: Unified add-expense and edit-expense onto one canonical shared expense-entry path. Preserved the approved add-expense row UI, made VND thousand-shortcut amount behavior symmetric for create and edit, rewired the edit page to the same 7-field form, extracted neutral option/date helpers, and removed the obsolete dual-form stack plus transition wrappers.
- Files changed: Shared expense-entry form/hook/helper modules, add/edit expense shells, focused expense-entry tests, obsolete expense form stack cleanup, feature records, and this progress log.
- Verification: `pnpm --filter web exec vitest run src/components/expense/expense-entry-helpers.test.ts src/components/expense/expense-entry-options.test.ts src/components/expense/dialog-amount-helper.test.ts src/components/expense/use-expense-entry-form.test.ts` passed with 4 files / 18 tests; `pnpm exec tsc -p apps/web/tsconfig.json --noEmit` passed; final full `./init.sh` passed with `Done!`; final `gitnexus_detect_changes(scope: all)` returned LOW risk with 24 changed symbols, 9 changed files, and 0 affected processes.
- Blockers: none.
- Next steps: Review diff and commit if desired.

## 2026-05-19 — Wrote expense-entry unification ExecPlan

- Who: Orchestrator + User
- Summary: Converted the approved expense-entry unification design into an implementation-ready ExecPlan. The plan locks one canonical shared add/edit form, preserves the shipped add-expense field visuals, requires symmetric VND thousand-shortcut amount mapping for edit/create, schedules pre-edit GitNexus impact checks, and defines dead-code cleanup plus final verification/harness updates.
- Files changed: ExecPlan file, plans index, and this progress log.
- Blockers: none.
- Next steps: Choose execution mode, then run impact checks and begin implementation.

## 2026-05-19 — Approved shared expense-entry form refactor

- Who: Orchestrator + User
- Summary: Agreed to refactor expense entry around one shared add/edit form instead of keeping separate create/edit stacks. The approved add-expense row UI remains the canonical visual design; the work should normalize code organization only, remove dead form code, and make the VND thousand-shortcut amount behavior symmetric so edit maps stored amounts back into the same input semantics without scaling bugs.
- Files changed: Expense-entry design doc/index, new feature record, feature index, and this progress log.
- Blockers: none.
- Next steps: User reviews the proposed design doc, then convert it into an implementation plan before editing code.

## 2026-05-19 — Refactored add-expense dialog structure

- Who: Orchestrator + explorer + oracle reviewer
- Summary: Split the canonical add-expense dialog into bounded feature-local modules while preserving existing behavior. The dialog file now focuses on data queries and responsive shell composition, a new presentational form file renders the field tree, and a new hook file owns reset/validation/payload/submit logic plus source persistence and undo side effects. Added focused pure-helper tests for the extracted logic without adding forbidden component render tests.
- Files changed: Add-expense dialog/form/hook frontend modules, focused helper test, ExecPlan records, feat-060 evidence, and this progress log.
- Verification: `gitnexus_impact` for `AddExpenseDialog` returned LOW risk with 0 direct dependents and 0 affected processes; `pnpm --filter web exec vitest run src/components/expense/use-add-expense-form.test.ts` passed with 6 tests; `./init.sh lint` passed with `OK`; `./init.sh typecheck` passed with `OK`; oracle review returned PASS with low-severity non-blocking notes only; final `./init.sh` passed with `Done!`.
- Blockers: none.
- Next steps: Run final GitNexus change detection and review diff/commit if desired.

## 2026-05-15 — Shipped add-expense shell/layout follow-up

- Who: Orchestrator + fixer + oracle reviewer
- Summary: Refined the canonical add-expense surface so desktop keeps a dialog while mobile uses a bottom drawer with internal scrolling and footer actions. Rebuilt the form into the approved row-based vertical order (amount, content, date, category, source, household, group), kept native date and source controls, and simplified category back to native select while preserving the existing amount shortcut, submit payload, profile source persistence, and undo flow.
- Files changed: Add-expense dialog shell/layout and category picker implementation, follow-up design/plan records, feature evidence, and this progress log.
- Verification: `./init.sh typecheck` passed during implementation and review; `./init.sh lint` passed during implementation and review; final full `./init.sh` passed with `Done!`; oracle spec compliance review ended PASS and oracle quality re-review ended PASS.
- Blockers: none.
- Next steps: Review final diff and commit the frontend follow-up if desired.

## 2026-05-15 — Approved add-expense shell/layout follow-up

- Who: Orchestrator + User
- Summary: Agreed on a follow-up UI adjustment for the canonical add-expense surface. Desktop remains a dialog, mobile changes to a bottom drawer capped around 80vh with internal scrolling and explicit close action. The form layout changes from the prior two-column arrangement to a vertical row layout with label-left/control-right ordering. The category field is simplified from the custom picker back to native select, while source remains native select and date stays native date input.
- Files changed: Add-expense design doc update and this progress log.
- Blockers: none.
- Next steps: User reviews the updated design note, then convert it into a focused implementation plan/update before editing code.

## 2026-05-15 — Shipped canonical add-expense dialog refactor

- Who: Orchestrator + fixer + oracle reviewer
- Summary: Replaced the old quick-add plus dedicated `/expenses/new` flow with one global `AddExpenseDialog` mounted from the protected shell. The new flow uses VND thousand-shortcut amount entry, native source/family/group selects, a dialog-safe category picker, last-source persistence, query-param open support on `/expenses`, and independent group-vs-household semantics across web, worker, migrations, and product docs. Also retired the legacy quick-add files and add-expense page route, updated source contracts from `e-wallet` to `momo`/`zalo-pay`/`shopee-pay`, and refreshed stale worker tests that still asserted the old domain truth.
- Files changed: Worker contracts/repositories/handlers/migration/tests for independent groups and new source keys; new add-expense dialog/provider and supporting web hooks/types/i18n; expenses/onboarding/more/manifest entry points; product specs, exec plan records, harness feature record, and this progress log.
- Verification: Focused `pnpm --filter web test -- src/components/expense/dialog-amount-helper.test.ts` passed; `./init.sh typecheck`, `./init.sh lint`, `./init.sh test`, and final full `./init.sh` all passed; `gitnexus_detect_changes(scope: all)` reported high risk with 49 changed files and 6 affected processes (onboarding, create-expense, and group list/assignment/read flows).
- Blockers: none.
- Next steps: Review final diff and commit if desired.

## 2026-05-15 — Wrote add-expense dialog redesign spec

- Who: Orchestrator + User
- Summary: Captured the proposed redesign spec for replacing quick-add and the dedicated add-expense page with a new shadcn-first `AddExpenseDialog`. The spec locks the compact dialog layout, dialog-only VND thousand-shortcut amount input, nested category-picker fix inside dialog, new static source keys, and the product/domain change that makes group independent from household.
- Files changed: Design docs index, new add-expense redesign design doc, and this progress log.
- Blockers: none.
- Next steps: User reviews the proposed design doc, then convert it into an implementation plan before touching code.

## 2026-05-14 — Refactored household pages with shared action cards

- Who: Orchestrator + fixer
- Summary: Refactored the households list and household detail pages to use PageShell/DataState and a shared reusable ActionCard with optional header, dashed content, custom media, action copy, and `onAction` callback. The create-household card now always renders as the final grid item, and the admin invite-member card now renders as a separate sibling card below the member card while opening the existing invite dialog through parent-owned state.
- Files changed: Household route views, shared ActionCard, household list section, household action-card adapters, household create/invite/member components, Vietnamese i18n, ExecPlan records, feature evidence, and this progress log. Removed the household UI/source-contract test per user request.
- Verification: GitNexus upstream impact checks returned LOW risk before edits; focused household source-contract Vitest passed; `./init.sh lint`, `./init.sh typecheck`, `./init.sh test`, and final full `./init.sh` passed; final `gitnexus_detect_changes(scope: all)` returned LOW risk with 12 changed files and 0 affected processes.
- Blockers: none.
- Next steps: Review diff and commit if desired.

## 2026-05-14 — Redesigned loading session checker with premium skeletons

- Who: Orchestrator + User
- Summary: Replaced the basic loading div in `ProtectedRoute` with a premium `Card` composition featuring `Skeleton` elements that mimic the wireframe. Added a localized "loading page" label and fixed a high-frequency flickering issue in `prefers-reduced-motion` by removing the stale duration override.
- Files changed: Protected route layout, Vietnamese i18n, global CSS, feature evidence, and this progress log.
- Verification: `./init.sh lint`, `./init.sh typecheck`, and full `./init.sh` passed; manual visual verification via browser confirmed layout matches user-provided image.
- Blockers: none.
- Next steps: Create PR.

## 2026-05-14 — Added AlertDialog and Firebase account security flows

- Who: Orchestrator + Oracle reviewer
- Summary: Switched the shared confirmation component from Dialog to AlertDialog, fixed More shortcut text wrapping at narrow widths, wired Firebase current-password reauthentication for password change and Firebase sign-in account deletion, and restyled sign-out/delete as danger-zone action rows.
- Files changed: Shared confirm dialog, Firebase auth/session services, More shortcut card, Profile Settings profile/security and account-action cards, Vietnamese i18n, focused source-contract/Firebase tests, ExecPlan records, feature evidence, and this progress log.
- Verification: GitNexus impact checks were attempted but MCP returned `Connection closed` / `Not connected` after `./init.sh sync`; focused Vitest passed with 8 tests across 2 files; `./init.sh lint` passed; `./init.sh typecheck` passed; Playwright CLI mocked authenticated session confirmed More wrapping, password form, danger-zone rows, and AlertDialog confirmations; `./init.sh test` passed; full `./init.sh` passed; final `gitnexus_detect_changes(scope: all)` returned `Not connected`.
- Blockers: GitNexus MCP unavailable.
- Next steps: Review final diff and commit if desired.

## 2026-05-14 — Applied PageShell to settings pages

- Who: Orchestrator
- Summary: Wrapped More and Profile Settings route states with the shared `PageShell` pattern from Overview, removed duplicate page headers from those pages, and documented PageShell as the route-level app page contract in `docs/FRONTEND.md`.
- Files changed: More/Profile Settings page orchestration, focused source-contract test, frontend governance doc, feature evidence, and this progress log.
- Verification: GitNexus impact checks for `MorePage` and `ProfileSettingsPage` returned `Not connected`; focused Vitest passed with 5 tests; `./init.sh lint` passed; `./init.sh typecheck` passed; `python3 -m json.tool harness/features/feat-057.json` passed; full `./init.sh` passed; final `gitnexus_detect_changes(scope: all)` returned `Not connected`.
- Blockers: GitNexus MCP unavailable.
- Next steps: View final diff and commit if desired.

## 2026-05-14 — Refactored More and Profile Settings cards

- Who: Orchestrator + fixer + Oracle reviewer
- Summary: Refactored More into an icon/right-arrow shortcut card with root package version footer, and refactored Profile Settings into avatar, profile/security, and account-actions cards with no tabs or household memberships. Added a reusable ref-based confirmation dialog for sign-out/delete and kept password/delete account backend work deferred.
- Files changed: More/Profile Settings view components, shared confirm dialog, profile form schema, Vietnamese i18n, focused source-contract test, ExecPlan records, feature evidence, and this progress log.
- Verification: GitNexus impact checks were attempted but MCP returned `Connection closed` / `Not connected` after `./init.sh sync`; focused Vitest passed; `./init.sh lint` passed; `./init.sh typecheck` passed; Playwright CLI mocked authenticated session confirmed More rows/version and Profile Settings cards/confirmation dialogs; `./init.sh test` passed; full `./init.sh` passed; final `gitnexus_detect_changes(scope: all)` returned `Not connected`.
- Blockers: GitNexus MCP unavailable.
- Next steps: Review final diff and commit if desired.

## 2026-05-14 — Refactored Home category statistics chart

- Who: Orchestrator + Oracle reviewer
- Summary: Refactored the Home overview category statistics widget from progress-only rows into a Recharts donut chart with category colors, center total, accessible chart summary, and a bottom value list with amount, percent, and expense count. Added source-contract coverage for the Recharts composition.
- Files changed: Home category breakdown component, Home source-contract test, ExecPlan records, Home dashboard feature evidence, and this progress log.
- Verification: GitNexus upstream impact for `CategoryBreakdown` returned LOW risk with 0 impacted symbols/processes; focused Vitest first failed RED on missing Recharts import, then passed; `./init.sh lint`, `./init.sh typecheck`, `./init.sh test`, and full `./init.sh` passed; Oracle review accessibility finding was fixed with `aria-describedby`.
- Blockers: none.
- Next steps: Run final GitNexus change detection and commit if desired.

## 2026-05-14 — Aligned frontend docs with new utils folder

- Who: Orchestrator + Explorer subagent
- Summary: Refreshed frontend folder structure docs and shadcn guidance after shared utilities moved from `apps/web/src/lib/utils` to `apps/web/src/utils`. Updated the shadcn components alias to `@/utils` and corrected stale `@/lib/utils` examples.
- Files changed: Frontend project folder reference, shadcn skill docs/config, historical shadcn ExecPlan alias note, feature evidence, and this progress log.
- Verification: `python3 -m json.tool` passed for updated JSON files; `./init.sh` passed and printed `Done!`.
- Blockers: none.
- Next steps: Review final diff and commit if desired.

## 2026-05-14 — Added Tailwind lint autofix to init lint flow

- Who: Orchestrator
- Summary: Updated `init.sh` so the web lint job runs `pnpm --filter web lint --fix` followed by `pnpm --filter web twlint --fix`; this applies to both explicit `./init.sh lint` and the default full flow because both reuse the web lint job.
- Files changed: Repository init verification script, init workflow feature evidence, and this progress log.
- Verification: GitNexus upstream impact for `run_parallel_checks` could not resolve the Bash function in the index; `bash -n init.sh` passed; `./init.sh lint` passed and printed `OK`; `python3 -m json.tool harness/features/feat-055.json` passed; `./init.sh` passed and printed `Done!`.
- Blockers: none.
- Next steps: Run final change scan and commit if desired.

## 2026-05-14 — Consolidated shared formatting utilities

- Who: GitHub Copilot
- Summary: Centralized currency, date/time, label, and download helpers into shared utilities; removed formatCurrency prop threading in Insights; and standardized formatter imports across Home, budgets, households, and groups.
- Files changed: Shared formatter/label helper modules, updated Home/Insights/Budget/Household/Group components and views to import them, new unit tests, and harness feature records.
- Verification: `pnpm --filter web exec vitest run src/lib/format-currency.test.ts src/lib/format-date-time.test.ts src/lib/household-labels.test.ts src/lib/group-status-label.test.ts src/lib/analytics-export.test.ts src/lib/is-editable-target.test.ts src/lib/constants/paths.test.ts src/views/app/overview/overview-formatters.test.ts src/views/app/insights/insights-period.test.ts` passed; GitNexus impact checks skipped (tool unavailable).
- Blockers: none.
- Next steps: Run `./init.sh` for full verification if needed.

## 2026-05-14 — Improved init verification script ergonomics

- Who: Orchestrator
- Summary: Reworked `init.sh` into a quiet command dispatcher with optional `install`, `lint`, `typecheck`, `test`, `build`, and `sync` targets. The default full flow runs install first, then web/worker lint, typecheck, and test jobs in parallel, then syncs GitNexus and prints `Done!`; build is temporarily explicit-only through `./init.sh build`. Single-command success now prints `OK`; failures print the failing captured output; `--verbose` prints captured logs.
- Files changed: Repository init verification script, init workflow feature evidence, and this progress log.
- Verification: GitNexus upstream impact for `init.sh` returned LOW risk; `bash -n init.sh` passed; harness JSON validation passed; `./init.sh lint`, `./init.sh typecheck`, `./init.sh test`, and explicit `./init.sh build` passed and printed `OK`; `./init.sh` full flow passed and printed `Done!` with build excluded; `gitnexus_detect_changes(scope: all)` reported low risk with 3 changed files and 0 affected processes.
- Blockers: none.
- Next steps: Run final change scan and commit if desired.

## 2026-05-13 — Refactored Home shared state handling to DataState

- Who: Orchestrator
- Summary: Renamed the shared Home state helper from `StateCard` to `DataState`, removed the success-state Card wrapper so successful children render directly, and updated Home widgets to own their explicit Card anatomy when populated.
- Files changed: Shared web state component, Home widget consumers, Home source-contract test, feat-045 evidence, and this progress log.
- Verification: TDD red-green completed for `apps/web/src/components/home/home-card-composition.test.ts`; focused web Vitest command passed (18 files, 58 tests); `pnpm lint:fix` passed; `pnpm --filter web typecheck` passed; `./init.sh` passed; `gitnexus_detect_changes(scope: all)` reported low risk with 0 affected processes.
- Blockers: none.
- Next steps: Review final diff and commit if desired.

## 2026-05-13 — Hardened frontend no-render-test rule

- Who: Orchestrator
- Summary: promoted the `apps/web` no component/page render test policy into the frontend defaults before continuing the Home/DataState refactor. The frontend router now directs agents to write unit tests for pure logic/API/store/non-render helpers and use browser/manual evidence for UI behavior.
- Files changed: Frontend governance doc and this progress log.
- Verification: `pnpm lint:fix` passed.
- Blockers: none.
- Next steps: Refactor shared `StateCard` into `DataState` without adding component/page render tests.

## 2026-05-13 — Caveman-refactored remaining leaf reference docs

- Who: Orchestrator + fixer subagents
- Summary: Refactored remaining verbose frontend/backend leaf references into shorter caveman-lite rule docs: component architecture, responsive navigation shell, dialog/form, form, API/React Query, Zustand, i18n, and backend project folder structure. Fixed stale `frontend/src` and generic shift examples in touched frontend references.
- Files changed: `docs/references/frontend/*`, `docs/references/backend/project-folder-structure.md`, feat-054 ExecPlan/evidence, and this progress log.
- Verification: `pnpm lint:fix` passed; JSON validation passed; `./init.sh` passed install, harness checks, linting, type checking, tests, GitNexus; `gitnexus_detect_changes(scope: all)` reported low risk with 0 affected processes.
- Blockers: none.
- Next steps: Run required verification and update feature evidence with final results.

## 2026-05-13 — Standardized documentation clean architecture and minimal reading

- Who: Orchestrator
- Summary: Reworked root/task docs into parent-to-child routers so agents read minimum docs by task. Added explicit doc architecture rules to `AGENTS.md`, tightened `ARCHITECTURE.md`, rewrote frontend/backend/plan routers and key indexes in caveman-lite style, fixed stale shadcn guide links, and updated stale frontend folder/component structure references for Next.js App Router.
- Files changed: Root docs, task router docs, reference/product/design/security/reliability/product-sense docs, selected frontend reference docs, ExecPlan records, feature harness evidence, and this progress log.
- Verification: `pnpm lint:fix` passed; JSON validation passed for feature index and feat-054 record; `./init.sh` passed install, harness checks, linting, type checking, tests, GitNexus; `gitnexus_detect_changes(scope: all)` reported low risk with 0 affected processes.
- Blockers: none.
- Next steps: Run required verification and update feature evidence with final results.

## 2026-05-13 — Added frontend component architecture reference

- Who: Orchestrator
