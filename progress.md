# Progress

<!-- Log template -->

## YYYY-MM-DD - feat-001

**State**: todo
**Done**: -
**Evidence**: -
**Blockers**: none
**Next**: Define the feature scope and acceptance criteria.

<!-- Add each new block below this note. Do not edit older blocks. -->

## 2026-08-15 - feat-126

**State**: active
**Done**: Created the root Slim tracker and inline migration plan.
**Evidence**: `feature_index.json` contains one active feature; Prettier check passed; `git diff --check` was clean.
**Blockers**: Tech-debt and proposed-spec lifecycle need canonical owners.
**Next**: Classify legacy-only facts before destructive cleanup.

## 2026-08-15 - feat-126

**State**: active
**Done**: Accepted `docs/tech-debt.md` as the canonical debt home and retained current/proposed roadmap status labels in product specs.
**Evidence**: Root instructions now define the Slim state contract; legacy state remains Git-only history, with no active legacy product feature and no completed-plan archive.
**Blockers**: none
**Next**: Complete the remaining cutover work while keeping feat-126 active.

## 2026-08-15 - feat-126

**State**: active
**Done**: Repaired root agent routes after deleted documentation cleanup.
**Evidence**: `AGENTS.md` now uses the inline-plan rule and no longer routes future-mobile or product-sense work to deleted docs; `pnpm exec prettier --check AGENTS.md features/feat-126.md progress.md` passed and `git diff --check` was clean.
**Blockers**: none
**Next**: Complete the remaining cutover work while keeping feat-126 active.

## 2026-08-15 - feat-126

**State**: done
**Done**: Closed the Slim cutover with canonical root state, legacy cleanup, product-spec status metadata, and verified init/CI coverage.
**Evidence**: Final `./init.sh` passed (worker build skip only); `bash -n init.sh scripts/detect_ci_scope.sh` passed; Prettier check for CI/template passed; `git diff --check` was clean; stale-route scans were clean; independent scoped re-review found no new issue.
**Blockers**: none
**Next**: Start a new feature only after user scope.

## 2026-08-16 - feat-126

**State**: active
**Done**: Reopened feat-126 for the approved harness-review documentation fixes.
**Evidence**: Added the root feature-index schema and operational gates for task assessment, material-work state, and dependency activation; acceptance remains non-final while review fixes are in progress.
**Blockers**: none
**Next**: Complete and revalidate the review fixes before closing feat-126.

## 2026-08-16 - feat-126

**State**: done
**Done**: Finalized feat-126 after clean re-review and checked the temporary review acceptance gate.
**Evidence**: `./init.sh` passed; `bash -n init.sh scripts/detect_ci_scope.sh` passed; `git diff --check` and Prettier checks passed. A temporary external `pnpm` shim returning 17 made `./init.sh format` exit 17 without `OK`; both independent re-reviews found no new issue. Earlier cutover evidence remains in prior entries.
**Blockers**: none
**Next**: Start a new feature only after user scope.

## 2026-08-16 - feat-127

**State**: active
**Done**: Created the tracker and concise inline plan for TMA eager route loading.
**Evidence**: No verification claimed; implementation evidence is pending.
**Blockers**: none
**Next**: Independent plan review.

## 2026-08-16 - feat-127

**State**: active
**Done**: Completed automatic TMA verification: lint passed with 15 pre-existing warnings; typecheck passed; tests passed with 24 test files and 134 tests; build passed with one entry JS asset (656.43 kB, 198.41 kB gzip); `./init.sh` passed with the Worker build skipped by declared configuration; parent confirmed no lazy/Suspense/LoadingSkeleton occurrences in `apps/tma/src`, the loading-skeleton file is absent, and `git diff --check` passed.
**Evidence**: Vite reported remaining dynamic import call sites do not become chunks because routes are statically imported.
**Blockers**: Real Telegram cold-launch trace remains unrun pending an authorized deploy/manual Telegram test.
**Next**: After an authorized deploy, cache-clear/cold launch; tap Expenses, Households, and add-expense; confirm no new JS chunk request begins from each tap while API fetch/XHR may occur.

## 2026-08-16 - feat-127

**State**: active
**Done**: User accepted all-route eager loading after the P2 review finding.
**Evidence**: The accepted entry size is 656.43 kB / 198.41 kB gzip; the real Telegram cold-launch trace remains required.
**Blockers**: Real Telegram cold-launch trace remains unrun pending an authorized deploy/manual Telegram test.
**Next**: Run the authorized cold-launch tap trace before deciding whether the eager-loading tradeoff is acceptable.

## 2026-08-17 - feat-127

**State**: todo
**Done**: Transitioned the unrelated TMA eager route loading feature out of active state.
**Evidence**: Automatic TMA verification remains recorded in the feature handoff; the real Telegram cold-launch trace is still unrun.
**Blockers**: Real Telegram cold-launch trace remains unrun pending an authorized deploy/manual Telegram test.
**Next**: After an authorized deploy, cache-clear/cold launch; tap Expenses, Households, and add-expense; confirm no new JS chunk request begins from each tap while API fetch/XHR may occur.

## 2026-08-17 - feat-128

**State**: active
**Done**: Activated the TMA shadcn UI migration feature.
**Evidence**: `feature_index.json` lists feat-128 as the only active feature; the confirmed scope is recorded in `features/feat-128.md`.
**Blockers**: Design-doc review is pending.
**Next**: Review the design doc before finalizing the implementation plan.

## 2026-08-17 - feat-127

**State**: done
**Done**: Completed the remaining feat-127 acceptance items.
**Evidence**: User confirmed the real TMA cold-launch/navigation test.
**Blockers**: none
**Next**: None.

## 2026-08-17 - feat-128

**State**: active
**Done**: Created the accepted implementation plan at `docs/plans/feat-128.md`, including locked Base UI/preset/dependency decisions, nine CTA migrations, complete bridge deletion, safe-area/token gates, BackButton audit, rollback checkpoints, non-render tests, and required Telegram/repository verification.
**Evidence**: `features/feat-128.md` Handoff links the plan; the plan records no documentation-duplication work and no known gaps.
**Blockers**: none
**Next**: Execute Checkpoint A provenance/config and dependency-locking gate.
