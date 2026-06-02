# Telegram Mini App runtime scaffold

## Purpose / Big Picture

Create the first real `apps/tma` runtime scaffold so the repo can start Telegram Mini App development without bending `apps/web` into a second platform. Users will not see new product features yet, but the repo will gain a bootable TMA client shell with the right package line, SPA router, Telegram bootstrap seam, and repo tooling hooks needed for later auth and domain work.

## Scope

In scope:

- `apps/tma/` workspace creation
- Vite + React + TypeScript scaffold for TMA
- Telegram bootstrap and capability-wrapper seams under `apps/tma/src/lib/telegram/*`
- base app shell, router shell, and placeholder start screen / fatal launch-error surface
- repo-tooling integration for install, lint, typecheck, test, build, and dev commands
- docs/harness updates required to track the runtime scaffold work

Expected touched paths:

- `apps/tma/package.json`
- `apps/tma/tsconfig.json`
- `apps/tma/vite.config.ts`
- `apps/tma/index.html`
- `apps/tma/eslint.config.mjs`
- `apps/tma/vitest.config.ts`
- `apps/tma/src/main.tsx`
- `apps/tma/src/app/bootstrap/*`
- `apps/tma/src/app/router/*`
- `apps/tma/src/routes/*`
- `apps/tma/src/lib/telegram/*`
- `apps/tma/src/components/shared/*`
- `apps/tma/src/index.css`
- `package.json`
- `init.sh`
- `harness/feature_index.json`
- `harness/features/feat-079.json`
- `harness/progress.md`

Out of scope:

- Telegram auth exchange implementation
- worker auth contract changes
- expense, household, budget, group, or insights product flows
- bot webhook/runtime implementation
- production polish beyond a minimal bootable shell

## Non-negotiable Requirements

- Use the `@tma.js/*` package line for new TMA runtime work.
- Keep `apps/tma` separate from `apps/web`; no cross-imports of web UI or feature code.
- Build a true SPA shell with React Router; full-page route reloads are not allowed.
- Keep Telegram capability access behind app-owned wrappers, not direct `window.Telegram.WebApp` usage in feature code.
- Do not add long-lived token persistence in the scaffold; auth persistence rules land in feat-080.

## Progress

- [ ] Add `apps/tma` workspace package with base package/tooling files.
- [ ] Add React/Vite entrypoint, providers, router shell, and placeholder root screen.
- [ ] Add Telegram bootstrap wrappers for launch params, theme/viewport binding, BackButton, BottomButton, and capability checks.
- [ ] Integrate root repo scripts and `init.sh` so TMA participates in lint/typecheck/test/build flows.
- [ ] Run targeted verification, then repo-standard broader verification for the touched scope.

## Surprises & Discoveries

- Current workspace glob in `pnpm-workspace.yaml` already includes `apps/*`, so `apps/tma` will join the workspace without changing workspace registration.
- Root `package.json` and `init.sh` currently cover only `web` and `worker`; TMA integration requires explicit script and parallel-job updates.
- Current auth runtime is still Firebase-shaped (`/auth/provider/exchange` + `idToken`), so scaffold work must stop before real auth bootstrap.

## Decision Log

- Decision: use `@tma.js/sdk-react` as the primary TMA app dependency; add lower-level `@tma.js/*` packages only where they are actually needed.
  Rationale: current Telegram Mini Apps docs position `@tma.js/sdk-react` as the React package and state that it fully re-exports `@tma.js/sdk`, so one React-facing package is enough for the scaffold by default.
  Date/Author: 2026-06-02 / Codex

- Decision: keep scaffold auth session state non-persistent until feat-080 lands.
  Rationale: the secure TMA fallback policy is memory-only without `SecureStorage`; the scaffold should not normalize an unsafe token-storage shortcut.
  Date/Author: 2026-06-02 / Codex

- Decision: bot runtime stays out of scaffold scope; docs default later work to a worker-first adapter boundary.
  Rationale: feat-079 is a client bootstrap slice, not a bot runtime slice.
  Date/Author: 2026-06-02 / Codex

## Outcomes & Retrospective

This plan is active. Final outcomes are recorded here when feat-079 is implemented. The success bar is a bootable, linted, typed `apps/tma` shell with repo-tooling integration and no accidental auth/domain coupling.

## Context and Orientation

- Repo toolchain entry: `package.json`
- Repo verification and sync orchestration: `init.sh`
- Existing browser client baseline: `apps/web/package.json`, `apps/web/src/*`
- Existing worker API baseline: `apps/worker/src/*`
- TMA platform router: `docs/TMA.md`
- Durable TMA architecture: `docs/design-docs/telegram-mini-app-client-architecture.md`
- TMA implementation rules: `docs/references/tma/*.md`

## Required standards/reference docs

- `ARCHITECTURE.md`
- `docs/TMA.md`
- `docs/design-docs/telegram-mini-app-client-architecture.md`
- `docs/references/tma/app-structure-and-client-rules.md`
- `docs/references/tma/native-ui-and-navigation-pattern.md`
- `docs/references/tma/development-and-hardening-pattern.md`
- `docs/references/frontend/project-folder-structure.md`
- `docs/references/frontend/naming-and-conventions-pattern.md`

Concrete constraints from these references:

- keep `apps/tma` feature-first and route-shell oriented
- use kebab-case files and named exports
- isolate Telegram SDK access inside `src/lib/telegram/*`
- use one SPA history model and a mobile-first shell
- wire TMA into repo verification instead of treating it as a sidecar experiment

## Plan of Work (Narrative)

1. Create `apps/tma/package.json`, `tsconfig.json`, `vite.config.ts`, `eslint.config.mjs`, `vitest.config.ts`, and `index.html` using the same repo TypeScript and ESLint conventions already used by `apps/web`, but adapted for Vite rather than Next.js.
2. Add `apps/tma/src/main.tsx`, `src/app/bootstrap/app-providers.tsx`, `src/app/bootstrap/bootstrap-telegram.ts`, `src/app/router/app-router.tsx`, and a minimal route shell so the app can boot, bind Telegram theme/viewport CSS vars, and render a placeholder screen plus fatal launch-error fallback.
3. Add `apps/tma/src/lib/telegram/*` wrappers for launch params, capability checks, BackButton, BottomButton, viewport/theme binding, and haptics so later features never call raw globals from pages.
4. Add minimal shared UI under `apps/tma/src/components/shared/*` and `src/index.css` for safe-area, viewport, and loading/error shell behavior. Do not import `apps/web` components.
5. Update root `package.json` and `init.sh` so TMA gets explicit `dev:tma`, `build:tma`, `lint:tma`, `typecheck:tma`, and `test:tma` coverage, and joins repo-standard verification in parallel with web/worker.
6. Update harness tracking and progress records as the scaffold lands. Keep auth and bot work deferred to their own features.

## Concrete Steps (Commands)

Run from repo root unless noted.

```bash
./init.sh install
pnpm --filter tma dev
./init.sh lint
./init.sh typecheck
./init.sh test
./init.sh build
./init.sh
```

Expected short outputs:

- `./init.sh install` completes without workspace resolution errors.
- `pnpm --filter tma dev` prints a Vite dev-server URL.
- `./init.sh lint`, `./init.sh typecheck`, `./init.sh test`, and `./init.sh build` finish with no TMA-specific failures.
- final `./init.sh` prints `Done!`.

## Validation and Acceptance

Happy path:

- `apps/tma` installs and boots as a workspace app.
- Dev server starts and renders the placeholder root shell.
- Telegram bootstrap wrappers do not throw when capability support is absent; unsupported capability handling stays inside wrappers.
- Root verification includes TMA in lint/typecheck/test/build coverage.

Failure-path validation:

- Missing Telegram launch context shows the planned blocking/fallback shell rather than crashing the app.
- Unsupported runtime capability branches return safe no-op or fallback behavior from wrappers.

Regression checks:

- `apps/web` and `apps/worker` verification still pass after root script integration.

## Idempotence & Recovery

- Workspace and app-scaffold file creation is safe to re-run with the same structure.
- Root script changes are reversible by editing `package.json` and `init.sh` only; no database or external-state migration exists in this slice.
- If the scaffold path proves wrong, recovery is delete `apps/tma` and revert the touched root/harness files in one patch.

## Artifacts and Notes

- Acceptance artifact: a bootable `apps/tma` shell committed with lint/typecheck/test/build evidence.
- Acceptance artifact: root verification transcripts showing TMA joined the standard repo flows.
- Acceptance artifact: harness records updated with the scaffold status and verification evidence.

## Interfaces & Dependencies

- `@tma.js/sdk-react`: primary React-facing Telegram Mini Apps package; it re-exports the core SDK surface.
- `@tma.js/bridge`: bridge-level helpers for lower-level capability wiring where needed.
- `@tma.js/sdk`: optional direct dependency only if a later implementation step truly needs the lower-level package separately.
- `react-router-dom`: SPA history and route shells.
- `@tanstack/react-query`: provider shell only in this slice; real queries land later.
- `zustand`: available for future flow state, but scaffold should keep store usage minimal until real flows exist.
- `framer-motion`: available for shell transitions later; keep initial scaffold motion minimal.
