# Progress Log

## 2026-04-22 — Rewrote feat-006 completed plan into full ExecPlan
- Who: Codex
- Summary: Reviewed the completed `feat-006` worker foundation plan against the repo ExecPlan requirements, rewrote it as a self-contained completed ExecPlan with scope, standards, validation, and recovery details, and re-ran `./init.sh` to capture current baseline drift.
- Files changed: docs/exec-plans/completed/2026-04-22-feat-006-worker-service-foundation.md, harness/progress.md
- Blockers: `./init.sh` currently fails outside feat-006 because `apps/web/src/app.test.tsx` hits `localStorage.getItem is not a function` in the theme-provider test path.
- Next steps: keep `feat-006` closed; address the unrelated web test regression in the next appropriate frontend/session feature or maintenance task.

## 2026-04-22 — Implemented feat-006 worker service foundation
- Who: Codex
- Summary: Hardened the `apps/worker` foundation by extracting shared JSON-body validation, moving auth user lookup behind a repository helper, aligning worker naming/config with Household Finance, and adding coverage for request-id propagation, 404s, and generic internal-error mapping.
- Files changed: apps/worker/src/lib/validation.ts, apps/worker/src/db/repositories/user-repository.ts, apps/worker/src/middlewares/auth.ts, apps/worker/src/routes/auth.ts, apps/worker/src/routes/profile.ts, apps/worker/src/routes/health.ts, apps/worker/test/index.spec.ts, apps/worker/test/unit/response.spec.ts, apps/worker/test/unit/env.spec.ts, apps/worker/test/unit/firebase.spec.ts, apps/worker/test/unit/jwt.spec.ts, apps/worker/package.json, apps/worker/wrangler.jsonc, apps/worker/.dev.vars.example, apps/worker/README.md, apps/worker/vitest.config.mts, docs/exec-plans/completed/2026-04-22-feat-006-worker-service-foundation.md, docs/exec-plans/completed/index.md, harness/features/feat-006.json, harness/feature_index.json
- Blockers: none
- Next steps: move on to feat-007 database schema and local migrations, using the cleaned worker foundation as the base.

## 2026-04-22 — Implemented feat-005 auth-state zustand migration
- Who: Codex
- Summary: Replaced the shell-auth context with a zustand store, rewired the shell guard and auth pages to use store-backed auth state and return-to handling, added store tests, and revalidated the web app with test, lint, typecheck, and build.
- Files changed: apps/web/src/stores/auth.store.ts, apps/web/src/stores/auth.store.test.tsx, apps/web/src/stores/types.ts, apps/web/src/router.tsx, apps/web/src/components/layouts/shell-guard.tsx, apps/web/src/pages/auth/sign-in-page.tsx, apps/web/src/pages/auth/sign-up-page.tsx, apps/web/src/pages/app/overview-page.tsx, apps/web/src/app.test.tsx
- Blockers: none
- Next steps: continue with the next auth/session plan items, especially the real token-backed frontend session flow from feat-009.

## 2026-04-22 — Reactivated feat-005 plan for zustand auth state follow-on
- Who: Codex
- Summary: Restored feat-005 as an active execution plan, extended it with the auth-state zustand migration and downstream auth shell follow-on items, and linked it from the active plans index.
- Files changed: docs/exec-plans/active/2026-04-21-feat-005-web-app-shell-ui-foundation.md, docs/exec-plans/active/index.md
- Blockers: none
- Next steps: implement the auth-state zustand store, rewire shell guard and auth pages to it, and add store-level tests before re-validating the web shell.

## 2026-04-21 — Completed feat-005 web app shell and UI foundation
- Who: Codex
- Summary: Replaced the starter web app with a React Router shell, public sign-in/sign-up routes, a protected app scaffold with onboarding and placeholder feature routes, local-theme toast integration, and UI test coverage for redirects and shell behavior.
- Files changed: apps/web/package.json, apps/web/vite.config.ts, apps/web/src/app.tsx, apps/web/src/app.test.tsx, apps/web/src/components/ui/sonner.tsx, apps/web/src/index.css, apps/web/src/main.tsx, apps/web/src/router.tsx, apps/web/src/test/setup.ts, harness/feature_index.json, harness/features/feat-005.json, docs/exec-plans/active/2026-04-21-feat-005-web-app-shell-ui-foundation.md, docs/exec-plans/active/index.md
- Blockers: None after fixing Vitest config typing and lint formatting.
- Next steps: Update downstream auth and onboarding features to mount into the new shell routes.

## 2026-04-21 — Removed shared tsconfig base from feat-004
- Who: Codex
- Summary: Reverted the shared TypeScript base and restored app-owned compiler settings so each app keeps its own config without inheritance from a shared root file.
- Files changed: apps/web/tsconfig.app.json, apps/web/tsconfig.node.json, apps/worker/tsconfig.json, docs/exec-plans/completed/2026-04-21-feat-004-workspace-toolchain-foundation.md, harness/features/feat-004.json
- Blockers: None.
- Next steps: Re-run workspace verification to confirm the app-local configs still pass from the root scripts.

## 2026-04-21 — Completed feat-004 workspace/toolchain foundation
- Who: Codex
- Summary: Added a shared TypeScript base config, added root `test` and `build` orchestration, kept app dependencies local, and aligned `init.sh` with the canonical root scripts.
- Files changed: package.json, init.sh, apps/web/tsconfig.json, apps/web/tsconfig.app.json, apps/web/tsconfig.node.json, apps/worker/tsconfig.json, docs/exec-plans/completed/2026-04-21-feat-004-workspace-toolchain-foundation.md, harness/feature_index.json, harness/features/feat-004.json
- Blockers: None after rerunning verification with elevated repo-root access.
- Next steps: Move to the next pending feature or tighten shared ESLint/Prettier/Vitest surfaces if a future feature needs them.

## 2026-04-21 — Rebalanced MVP feature breakdown
- Who: Codex
- Summary: Reworked the pending MVP backlog from coarse mini-epics into smaller feature-sized slices that still match the product roadmap. Split oversized areas such as auth, household, quick-add, budget, analytics, and grouping into execution-friendly features without going all the way down to subtask level.
- Files changed: harness/feature_index.json, harness/features/feat-004.json through feat-030.json
- Blockers: Full `./init.sh` verification could not complete in sandbox because `pnpm install` could not reach the npm registry (`ENOTFOUND`).
- Next steps: Pick one pending feature at a time, then create a focused execution plan for that feature before implementation.

## 2026-04-21 — Feature backlog decomposition (feat-004 → feat-020)
- Who: human + Antigravity
- Summary: Analyzed product specs (docs/product-specs/) and PRODUCT.md to break the MVP into 17 granular feature records spanning foundation, auth, household, expense domain, budget, analytics, and onboarding. All records added to harness/features/ and feature_index.json updated.
- Files changed: harness/feature_index.json, harness/features/feat-004.json through feat-020.json
- Blockers: none
- Next steps: start with feat-004 (project foundation & monorepo setup), then proceed in dependency order.

---

## 2026-04-21 — CI scope script trigger alignment
- Who: automation
- Summary: Added the CI scope helper script to the verify workflow trigger and shared-scope detection so changes to the detector itself also run verification.
- Files changed: .github/workflows/verify-code.yml, scripts/detect_ci_scope.sh, harness/features/feat-003.json
- Blockers: none
- Next steps: keep the scope helper aligned with the lockfile importer layout.

---

## 2026-04-21 — Lockfile importer-aware CI scope
- Who: automation
- Summary: Replaced the generic shared lockfile trigger with git-diff scope detection so pnpm-lock changes can be attributed to web or worker importer sections instead of always running both.
- Files changed: .github/workflows/verify-code.yml, scripts/detect_ci_scope.sh, harness/features/feat-003.json
- Blockers: none
- Next steps: keep the importer detection aligned with the pnpm lockfile format if the monorepo layout changes.

---

## 2026-04-21 — CI trigger and install simplification
- Who: automation
- Summary: Restricted verify and harness-size workflows to relevant file paths, switched verify to a single full workspace install, and used the existing root scripts for app checks.
- Files changed: .github/workflows/verify-code.yml, .github/workflows/harness-size-check.yml, harness/features/feat-003.json
- Blockers: none
- Next steps: keep any new shared config files in the workflow path filters intentionally.

---

## 2026-04-21 — GitHub verify single-job optimization
- Who: automation
- Summary: Consolidated the PR verify flow into a single job so shared setup and dependency installation happen once, while still running only the affected web and/or worker checks.
- Files changed: .github/workflows/verify-code.yml, harness/features/feat-003.json
- Blockers: none
- Next steps: keep adding any new truly shared config files to the shared change filter intentionally.

---

## 2026-04-21 — GitHub verify scoping
- Who: automation
- Summary: Narrowed the PR verify workflow so web changes only run web checks, worker changes only run worker checks, and shared root workflow/package changes trigger both. Each job now installs and runs only its own workspace package scope.
- Files changed: .github/workflows/verify-code.yml, harness/feature_index.json, harness/features/feat-003.json
- Blockers: none
- Next steps: run repository verification if needed; otherwise keep this workflow pattern for future CI changes.

---

## 2026-04-21 — Harness contract standardization
- Who: automation
- Summary: Standardized the repository on `harness/` as the canonical state surface and aligned docs, scripts, and handoff workflow.
- Files changed: AGENTS.md, README.md, docs/knowledge/codex-exec-plan.md, docs/knowledge/harness-engineering.md, docs/exec-plans/__plan-template__.md, init.sh, scripts/rotate_progress.sh, scripts/check_harness_size.sh, harness/feature_index.json, harness/features/feat-001.json, harness/features/feat-002.json, harness/session-handoff.md
- Blockers: `./init.sh` still needs network access for `pnpm install`; sandboxed verification without network will fail at dependency install.
- Next steps: keep new feature records in `harness/features/*.json`; use `harness/session-handoff.md` only for unfinished sessions.

---

## 2026-04-21 — Harness verification
- Who: automation
- Summary: Ran `./init.sh` to verify installs, lint, typechecks, tests, and build. All verification steps completed successfully.
- Files changed: harness/features/feat-harness-001.json (feat-harness-001 marked done)
- Blockers: none
- Next steps: keep updating `harness/feature_index.json` and `harness/progress.md` during active work.

---

## 2026-04-21 — Bootstrap harness
- Who: automation
- Summary: Created initial harness artifacts required by `AGENTS.md`.
- Files added: harness/features/feat-harness-001.json, harness/feature_index.json
- Blockers: none
- Next steps: populate `harness/features/*.json` with active features and update during sessions; run `./init.sh` to verify repository checks.

Note: progress logs are now rotated by `scripts/rotate_progress.sh` into `harness/progress/archive/`.
Keep `harness/progress.md` as a short index with newest entries first to avoid large file growth.


## Template for future entries
- Date: YYYY-MM-DD
- Who: <name>
- Summary: <short summary>
- Files changed: <list>
- Blockers: <list or none>
- Next steps: <next actions>
