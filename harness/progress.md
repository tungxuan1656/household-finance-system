# Progress Log

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
