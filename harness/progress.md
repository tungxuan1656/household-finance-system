# Progress Log

## Template for future entries
- Date: YYYY-MM-DD
- Who: <name>
- Summary: <short summary>
- Files changed: <The description lists the changed files, without listing the file names.>
- Blockers: <list or none>
- Next steps: <next actions>

<!-- Start writing log before here, latest log on top -->

## 2026-06-02 — Added project-owned TMA development skill

- Who: Codex
- Summary: Added a new repo-owned skill at `.agents/skills/tma-development` so future Telegram Mini App work automatically pulls the right repo-specific defaults instead of relying on generic memory. The skill is intentionally narrow: it triggers on `apps/tma`, launch-context auth, `@tma.js/sdk-react`, native Telegram chrome, deep links, safe-area/keyboard hardening, and bot companion work; then routes the agent into `docs/TMA.md`, the exact `docs/references/tma/*` leaves, and the active `feat-079` scaffold plan. Two short reference files preserve the locked defaults and per-slice reading map without duplicating the full docs set.
- Files changed: The new project-owned TMA skill folder with `SKILL.md`, `agents/openai.yaml`, and two reference files; a new harness feature record; the feature index; and this progress log.
- Verification: `python3 /Users/tungdoan/.codex/skills/.system/skill-creator/scripts/init_skill.py tma-development --path .agents/skills --resources references ...` scaffolded the skill successfully. `python3 /Users/tungdoan/.codex/skills/.system/skill-creator/scripts/quick_validate.py .agents/skills/tma-development` passed with `Skill is valid!` after installing the missing validator dependency via `python3 -m pip install --user pyyaml`. No template placeholders remain in `.agents/skills/tma-development` (`rg -n "TODO|\[TODO" .agents/skills/tma-development -S` returned no matches). `node -e "for (const file of ['harness/feature_index.json','harness/features/feat-086.json']) { JSON.parse(require('fs').readFileSync(file,'utf8')); console.log('OK ' + file) }"` passed for the new harness JSON; `./scripts/check_harness_size.sh` passed with `Harness size checks passed`; `git diff --check` passed with no whitespace issues; final `gitnexus_detect_changes(scope: all, repo: household-finance-system)` returned `LOW` risk with 3 changed symbols, 2 changed files, and 0 affected processes.
- Blockers: `quick_validate.py` initially failed because `PyYAML` was missing from the local Python environment.
- Next steps: none.

## 2026-06-02 — Standardized TMA terminology across docs and harness

- Who: Codex
- Summary: Completed the terminology cleanup that became obvious once the docs matured past rough research notes. The repo now uses `TMA` consistently for Telegram Mini App work, the router doc and reference folder were renamed to the `TMA`/`tma` convention, the planned runtime app path is now `apps/tma`, and older direct alternate-package references were removed so the docs present one clear package choice: `@tma.js/sdk-react` as the primary React-facing dependency.
- Files changed: Root agent and architecture routers, TMA router/reference/design/product docs, active and completed Telegram Mini App ExecPlans, TMA-related harness feature records, and this progress log.
- Verification: Docs-only verification used direct artifact checks. `node -e "for (const file of ['harness/feature_index.json','harness/features/feat-078.json','harness/features/feat-079.json','harness/features/feat-080.json','harness/features/feat-081.json','harness/features/feat-082.json','harness/features/feat-083.json','harness/features/feat-084.json','harness/features/feat-085.json']) { JSON.parse(require('fs').readFileSync(file,'utf8')); console.log('OK ' + file) }"` passed for all touched Telegram Mini App harness JSON files; `./scripts/check_harness_size.sh` passed with `Harness size checks passed`; `git diff --check` passed with no whitespace issues; trailing-whitespace scan across the touched docs/harness files returned no matches; global legacy-term scan returned no matches; final `gitnexus_detect_changes(scope: all, repo: household-finance-system)` returned `LOW` risk with 32 changed symbols, 23 changed files, and 0 affected processes.
- Blockers: none.
- Next steps: Future implementation should scaffold `apps/tma` and use the renamed TMA docs as the canonical entry path.

## 2026-06-02 — Tightened TMA docs into implementation-ready runtime guidance

- Who: Codex
- Summary: Moved the TMA docs from broad platform guidance toward runtime readiness. Locked the default package line to `@tma.js/*`, documented a stricter TMA session fallback policy that avoids persisting auth tokens outside `SecureStorage`, defaulted the future bot companion to a worker-first adapter boundary, added a new TMA slice-readiness map, and created the first active ExecPlan for `feat-079` so the repo now has an implementation-ready scaffold plan instead of only high-level TMA direction.
- Files changed: The durable TMA client architecture doc, multiple TMA reference leaves, the TMA router and shared references index, a new active TMA runtime scaffold ExecPlan, the plans index, TMA harness feature records, the feature index, and this progress log.
- Verification: Docs-only verification used direct artifact checks. `node -e "for (const file of ['harness/feature_index.json','harness/features/feat-079.json','harness/features/feat-080.json','harness/features/feat-085.json']) { JSON.parse(require('fs').readFileSync(file,'utf8')); console.log('OK ' + file) }"` passed for all four harness JSON files; `./scripts/check_harness_size.sh` passed with `Harness size checks passed`; `git diff --check` passed with no whitespace issues; trailing-whitespace scan across the touched docs/harness files returned no matches; final `gitnexus_detect_changes(scope: all, repo: household-finance-system)` returned `LOW` risk with 7 changed symbols, 12 changed files, and 0 affected processes. Follow-up clarification on the same day corrected the package framing so React work now treats `@tma.js/sdk-react` as the primary dependency rather than implying raw `@tma.js/sdk` is the main app package.
- Blockers: none.
- Next steps: Use the new active `feat-079` ExecPlan as the entry point for the first runtime coding session.

## 2026-06-02 — Expanded TMA reference docs into practical implementation guides

- Who: Codex
- Summary: Expanded the planned Telegram Mini App docs from two thin leaves into a fuller implementation set. The TMA router and references index now route five focused leaf docs covering app structure, native navigation/UI, state/storage, auth/bot boundary, and development/hardening. The refreshed guidance also corrects a few stale assumptions from the initial brief: newer package guidance now points future runtime work toward the `@tma.js/*` line, `BottomButton` is treated as the current name for the old Main Button surface, local development can use Telegram's test environment without forcing HTTPS in every case, and newer storage/keyboard capabilities are documented as version-gated rather than assumed universal.
- Files changed: TMA reference leaf docs, the TMA docs router, the shared references index, the related TMA harness feature evidence, and this progress log.
- Verification: Docs-only verification used direct artifact checks. `node -e "JSON.parse(require('fs').readFileSync('harness/features/feat-078.json','utf8')); console.log('OK feat-078.json')"` passed with `OK feat-078.json`; `./scripts/check_harness_size.sh` passed with `Harness size checks passed`; `git diff --check` passed with no whitespace issues; final `gitnexus_detect_changes(scope: all, repo: household-finance-system)` returned `LOW` risk with 5 changed symbols, 6 changed files, and 0 affected processes.
- Blockers: none.
- Next steps: none.

## 2026-06-02 — Fixed TMA docs patch mergeability issues

- Who: Antigravity
- Summary: Removed the category search input from AddExpenseStep1 and cleaned up all category search logic and properties from parent components (AddExpenseDrawerFlow and AddExpenseDialog).
- Files changed: The expense quick-add step 1 component, the expense quick-add drawer flow, the add expense dialog wrapper, the harness feature index, the feat-077 feature JSON file, and this progress log.
- Verification: GitNexus upstream impact check for `AddExpenseStep1` returned HIGH risk due to drawer and dialog dependency, so changes were kept precise and clean. GitNexus change detection returned medium risk with 3 files changed. Run of `./init.sh lint` passed with `OK`; `./init.sh typecheck` passed with `OK`; `./init.sh test` passed with `OK`; `./init.sh build` passed with `OK`.
- Blockers: none.
- Next steps: none.

## 2026-05-30 — Fixed expense-detail household label and loopback auth CORS

- Who: Orchestrator
- Summary: Fixed the remaining concrete issues found during the real-account QA pass. Expense detail now resolves the household name from the existing household query instead of rendering the raw household id. On the worker side, the API CORS origin check is now a dedicated helper that still preserves the explicit shared-network origin but also accepts localhost and loopback origins on arbitrary dev ports, which unblocked authenticated browser testing on `localhost:3001`.
- Files changed: Expense detail page/card wiring, new worker CORS helper, worker entrypoint CORS wiring, focused worker unit test, feat-076 evidence, and this progress log.
- Verification: GitNexus upstream impact for `ExpenseDetailCard` returned LOW risk with `ExpenseDetailPage` as the direct consumer; GitNexus could not resolve a named root-worker symbol for `apps/worker/src/index.ts`, so the CORS change was kept intentionally narrow and covered with a focused unit test. Chrome DevTools MCP real-auth verification on `localhost:3000` confirmed `/expenses/01KST0HSQQX4SD8H4E1ZRM3CBC` now shows `GĐ Giàu có` in the household row. Chrome DevTools MCP verification on `localhost:3001` confirmed the previously failing sign-in flow now reaches `/expenses` with the provided account after the worker restart. `pnpm --filter worker exec vitest run test/unit/cors.spec.ts` passed with 4/4 tests; `./init.sh typecheck` passed with `OK`; `./init.sh build` passed with `OK`; full `./init.sh` passed with `Done!`.
- Blockers: none.
- Next steps: If you want, the next cleanup is to move the worker CORS origin list behind explicit environment configuration instead of keeping the shared-network origin inline.

## 2026-05-30 — Completed real-account PWA layout QA sweep

- Who: Orchestrator
- Summary: Logged into the web app with the provided account on a clean localhost:3000 dev server and ran a Chrome DevTools MCP layout sweep across the public auth surface and the main protected route set. Mobile 390x844 checks covered `/sign-in`, `/sign-up`, `/expenses`, `/insights`, `/households`, `/households/[id]`, `/groups`, `/groups/[id]`, `/budgets`, `/account`, and `/account/settings`; desktop 1440x900 spot checks covered `/expenses`, `/households/[id]`, and `/account/settings`. No new PWA layout blockers were found: tested routes kept document width equal to viewport width, top-level tab routes kept `main` as the scroll root with sticky headers and fixed bottom tabs, and desktop top nav rendered correctly on the checked pages.
- Files changed: feat-076 evidence and this progress log only.
- Verification: Chrome DevTools MCP real-auth QA passed on localhost:3000 after restarting a stale dev server that was serving a `.next` runtime ENOENT for `app-build-manifest.json`. Operational constraint only: localhost:3001 could not be used for authenticated QA because backend CORS allowed `http://localhost:3000` but blocked `http://127.0.0.1:3001`. A focused JSON parse check for `harness/features/feat-076.json` and `harness/feature_index.json` returned `OK` after recording the evidence.
- Blockers: none on the tested layouts; only local dev-environment friction from the stale server instance and the backend CORS origin allowlist.
- Next steps: No code change needed from this QA pass. If you want broader confidence, the remaining follow-up is a wider desktop sweep of contextual routes such as budget dialogs and group edit flows under production-like data volume.

## 2026-05-30 — Finished mobile households/groups/settings follow-up fixes

- Who: Orchestrator
- Summary: Completed the requested mobile follow-up pass across households, groups, settings, shell navigation, and drawer behavior. Household creation now uses a bottom drawer on mobile, household detail no longer overflows narrow widths, group cards rely on card tap for navigation while overflow-menu actions stay on the list route, mobile group drawers use a header close button instead of a footer cancel action, bottom tabs now use color-only active state with reduced height, page headers are slightly taller with a larger title, and avatar preview no longer throws the blob-image width error.
- Files changed: Mobile shell primitives, page header, household create/detail card internals, group dialog/card/form components, profile avatar preview dialog, feat-076 evidence, and this progress log.
- Verification: GitNexus upstream impact before edits returned LOW risk for `BottomTab`, `CreateGroupDialog`, `GroupCard`, `HouseholdDetailPage`, `HouseholdCreateDialog`, `GroupForm`, `HouseholdSettingsCard`, and `HouseholdMembersCard`; `ProfileAvatarDialog` was HIGH risk and `Drawer` was CRITICAL risk, so both were changed narrowly and verified afterward. `./init.sh typecheck` passed with `OK`; `./init.sh build` passed with `OK`; full `./init.sh` passed with `Done!`. Chrome DevTools MCP at 390px, using seeded auth-store + mocked XHR because local sign-up was failing in the dev backend, verified `/households` opens creation in a bottom drawer with a header close button, `/households/household-1` has `scrollWidth == clientWidth`, `/groups` no longer shows a redundant view-detail button and selecting Edit from the overflow menu keeps the route on `/groups`, and `/account/settings` opens the blob avatar preview dialog with no console errors after file upload. Computed-style checks also confirmed the active bottom-tab link has transparent background and the mobile page header now renders at `64px` high with a `20px` title.
- Blockers: Local sign-up/create-account flow is failing against the current dev backend, so protected-route browser verification used a mocked authenticated session instead of real auth.
- Next steps: Review the diff in browser with a live backend session if you want to validate the same flows against real network data, then commit if desired.

## 2026-05-30 — Changed bottom tabs to traditional app bar

- Who: Orchestrator
- Summary: Replaced the floating pill mobile bottom tabs with a traditional full-width app tab bar fixed to the viewport bottom. Updated the mobile PWA UI rules doc so future work does not reintroduce floating tabs.
- Files changed: Mobile bottom tab layout component, mobile PWA UI rules reference, feature evidence, and this progress log.
- Verification: GitNexus upstream impact for `BottomTab` returned LOW risk with `MainLayout` as the direct consumer. Chrome DevTools MCP at 320px verified `/expenses` and `/account`: nav spans viewport left 0 to right 320, remains fixed at viewport bottom, no overflow offenders, and account sticky header remains pinned while `main` scrolls. `./init.sh lint` and `./init.sh typecheck` passed with `OK`; full `./init.sh` passed with `Done!`. Final `gitnexus_detect_changes(scope: all)` stayed CRITICAL because the worktree includes the broader mobile shell/drawer refactor plus this tab-style change.
- Blockers: none.
- Next steps: Review final diff and commit if desired.

## 2026-05-30 — Mobile PWA UI foundation refactor

- Who: Orchestrator
- Summary: Added canonical mobile PWA UI rules/audit docs and applied the critical iOS-first UI foundation refactor: dvh/root overflow hardening, fixed safe-area bottom tabs, safer protected page bottom spacing, native bottom drawer primitive, sticky drawer footer, add-expense drawer/FAB spacing, mobile advanced filter drawer, mobile group create/edit drawer, group card overflow actions, compact safe-area landing header/hero, and remaining source `min-h-screen` cleanup.
- Files changed: Frontend reference docs, frontend docs router, web root/layout CSS, protected shell/page wrappers, drawer primitive, expense quick-add/filter components, group form/dialog/card components, landing page components, shadcn error block, and harness records.
- Verification: GitNexus impact checks completed before edits; `DrawerContent` was HIGH risk and `DataState` was CRITICAL risk, so `DataState` was intentionally not edited. Follow-up Chrome DevTools MCP testing at 320px found and fixed the sticky-header root cause (`window` was scrolling instead of `main`), date-input hardening gaps, double mobile shell padding, and an Insights summary chart visual overflow. Chrome DevTools MCP then verified `/account`, `/insights`, and `/households` with `docW/bodyW == viewport`, `windowScrollY == 0`, `main` as the scroll container, sticky headers pinned at `top=0` after scroll, and no overflow offenders; it also verified `/expenses` filter date inputs and `/groups` drawer date inputs stay inside viewport with `maxWidth=100%` and `appearance=none`. `./init.sh lint`, `./init.sh typecheck`, `./init.sh test`, and `./init.sh build` passed with `OK`; full `./init.sh` passed with `Done!`. Source scan found no remaining banned viewport-height matches under `apps/web/src`. Final `gitnexus_detect_changes(scope: all)` returned CRITICAL risk with 39 changed symbols, 27 affected processes, and 24 changed files, expected for a shell/drawer/layout refactor.
- Blockers: none.
- Next steps: Review browser visuals manually or with the browser test plan if desired.

## 2026-05-30 — Mark all active plans and features complete

- Who: Orchestrator
- Summary: Closed out remaining active items after user confirmed pre-ship browser testing is done. Marked feat-075 as done in feature_index.json and moved both active exec-plan index entries (feat-075, feat-073) from Active to Completed sections.
- Files changed: harness/feature_index.json, docs/exec-plans/index.md, harness/progress.md
- Blockers: none.
- Next steps: none — all features and plans are now complete.

## 2026-05-29 — Wrote pre-ship browser testing plan

- Who: Orchestrator
- Summary: Created a pre-ship browser testing ExecPlan for Playwright CLI. The plan covers secure runtime test credentials, mobile and desktop screenshots, layout review criteria from frontend/design/UI-review docs, protected navigation expectations, add-expense and household data flows, API consistency assertions, optional group/budget smoke, cleanup, and subagent-style execution lanes. The plan records the current expected-vs-actual risk that accepted docs call the fourth tab Settings while current route/navigation code exposes Account.
- Files changed: New pre-ship testing ExecPlan, exec-plan index, new feat-075 harness record, feature index, and this progress log.
- Verification: Node JSON.parse OK for feature index and feat-075 record; `./scripts/check_harness_size.sh` OK; `git diff --check` OK; credential leak scan found no persisted test password/email in changed plan/harness files; `gitnexus_detect_changes(scope: all)` returned LOW risk with 0 affected processes.
- Blockers: none.
- Next steps: Future tester executes the plan with Playwright CLI using runtime `E2E_EMAIL` and `E2E_PASSWORD`, captures screenshots/evidence, then reports the ship verdict.

## 2026-05-29 — Audit design-docs, exec-plans, cleanup stale docs

- Who: Orchestrator
- Summary: Audited design-docs and exec-plans for stale state. Moved `mobile-first-protected-shell-and-tab-surfaces.md` from Proposed to Accepted (feat-072/073 fully implemented). Confirmed no wireframe-docs remain. Confirmed no orphaned onboarding routes in apps/web/src. Cleaned stale PageShell/Lens/overview-first/5-tab references from exec-plan index entries that pointed to superseded features (feat-059, feat-067). Deleted one truly stale plan file (2026-05-21-protected-page-pageshell-datastate-refactor.md) and confirmed its index entry was already removed.
- Files changed: docs/design-docs/index.md, docs/exec-plans/index.md, harness/progress.md
- Verification: `./init.sh lint` OK.
- Blockers: none.
- Next steps: Verify exec-plan index entries with PageShell/Lens/overview-first language in their descriptions are accurate historical records (they are — they describe what was done at that point in time). No further action needed unless user wants to suppress historical detail from exec-plan descriptions.

<!-- Start writing log before here, latest log on top -->
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
