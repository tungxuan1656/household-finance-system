# feat-126 - Harness Slim cutover

## Goal

Replace the legacy harness with a small root-level state and verification system.

## Scope

- Create the Slim artifacts and rewrite current agent routing.
- Retire legacy harness state, legacy plan records, generic knowledge docs, and obsolete checks.
- Keep product specs, architecture, references, operations, security, reliability, testing, and durable design decisions.
- Make `init.sh` and CI verify all declared workspaces without deployment.

## Non-goals

- Change product behavior, runtime code, or deployment configuration.
- Preserve feature-history records, completed plans, or progress archives outside Git history.
- Add runtime-downloaded Tailwind lint tools to verification.

## Acceptance

- [x] Root `feature_index.json`, `features/*.md`, and `progress.md` are the only harness state.
- [x] Current docs route agents to one canonical source per fact.
- [x] `init.sh` formats, lints, typechecks, tests, and builds supported workspaces.
- [x] CI verifies TMA and builds web/TMA.
- [x] Legacy state and unneeded documents are removed after durable facts are migrated.
- [x] Harness-review documentation fixes are complete and independently revalidated.

## Relevant docs

- `AGENTS.md`
- `ARCHITECTURE.md`
- `docs/product-specs/index.md`
- `docs/references/index.md`
- `docs/operations/index.md`
- `docs/RELIABILITY.md`
- `docs/SECURITY.md`

## Plan

1. Classify legacy plan facts as canonical, migrate-needed, or Git-only history.
2. Move only unresolved debt and missing live contracts to canonical docs.
3. Replace legacy state, instructions, commands, and CI with the Slim contract.
4. Verify artifacts, routes, `init.sh`, CI scope, and the full local workflow.
5. Record evidence and close the feature after the cutover and approved review fixes.

## Accepted decisions

- Unresolved debt has its canonical home at `docs/tech-debt.md`.
- Product specs retain current/proposed roadmap status labels.
- Legacy state is Git-only history; there is no active legacy product feature or completed-plan archive.

## Verify

- `bash -n init.sh`
- `./init.sh`
- `git diff --check`

## Handoff

- State: done
- Evidence: Final `./init.sh` passed; `bash -n init.sh scripts/detect_ci_scope.sh` passed; `git diff --check` and Prettier checks passed. With a temporary external `pnpm` shim returning 17, `./init.sh format` exited 17 without `OK`; both independent re-reviews found no new issue. Prior cutover evidence remains in the earlier progress records.
- Blockers: none.
- Next: Start a new feature only after user scope.
