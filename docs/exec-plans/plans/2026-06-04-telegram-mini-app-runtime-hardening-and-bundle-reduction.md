## Title

Stabilize the Telegram Mini App runtime, auth/storage fallback path, and initial bundle shape.

## Purpose / Big Picture

This change hardens `apps/tma` so the Mini App does not die before React renders, degrades cleanly when Telegram-only runtime state is unavailable, keeps auth/storage behavior predictable under SecureStorage failures, and starts reducing cold-start weight by moving away from eager route loading. End users should observe fewer blank-screen launches, more reliable auth/bootstrap behavior, correct safe-area updates during keyboard/fullscreen changes, and faster initial load for the root screens.

## Scope

- In scope:
  - `apps/tma/src/main.tsx`
  - `apps/tma/src/app/app.tsx`
  - `apps/tma/src/app/bootstrap/telegram-init.ts`
  - `apps/tma/src/app/router/app-router.tsx`
  - `apps/tma/src/components/shared/tma-page-shell.tsx`
  - `apps/tma/src/features/auth/bootstrap.tsx`
  - `apps/tma/src/features/auth/bootstrap-deps.ts`
  - `apps/tma/src/features/auth/store.ts`
  - `apps/tma/src/features/home/presentation.ts`
  - `apps/tma/src/lib/storage/adapter.ts`
  - `apps/tma/src/lib/telegram/theme.ts`
  - focused tests under `apps/tma/src/test/*`
  - harness + plan artifacts for this feature
- Out of scope:
  - Worker auth contract changes
  - New TMA product screens or CRUD features
  - Household avatar lifecycle redesign beyond current hardening batch
  - Any `apps/web` product behavior changes except extracting already-matching shared helpers later if needed

## Non-negotiable Requirements

- The app must not crash before React renders when Telegram launch params are missing or malformed.
- SecureStorage failure must degrade once into explicit memory-only mode instead of retrying broken calls forever.
- Bootstrap/auth control flow must be readable and free of currently unreachable branches.
- Safe-area CSS vars must continue updating after mount-time viewport/fullscreen changes.
- Route loading must move toward lazy boundaries without breaking SPA navigation or current TMA shell ownership rules.
- Every claimed fix needs either a focused test or a concrete verification command/output.

## Progress

- [x] 2026-06-04 16:57 +07 — Wrote and activated this ExecPlan plus harness tracking for `feat-094`.
- [x] Batch 1 — startup hardening: catch `initTelegram()` launch failures and route them into a renderable fatal path.
- [x] Batch 1 — viewport/theme hardening: make TMA safe-area CSS vars reactive after mount/fullscreen changes.
- [x] Batch 1 — auth/storage resilience: trip permanently to memory-only mode after secure read/delete failures; remove current unreachable bootstrap branches.
- [x] Batch 1 verification — focused TMA tests, `./init.sh lint`, `./init.sh build`, and full `./init.sh` all passed on 2026-06-04.
- [x] Batch 2 — route/bundle cleanup: lazy-load route modules, remove duplicate home route, and tighten shell back-navigation fallback.
- [x] Batch 2 verification — `pnpm --filter tma build`, `./init.sh typecheck`, `./init.sh lint`, `./init.sh test`, `./init.sh build`, and full `./init.sh` all passed on 2026-06-04.
- [ ] Batch 3 — helper/perf cleanup: shared format/period helpers, formatter caching, dead-prop cleanup, and small duplication reductions.
- [x] Batch 3 partial — cached currency formatters, removed `AuthBootstrap.loadingFallback`, and reused shared `closeMiniApp` across fatal screens on 2026-06-04.
- [ ] Final verification — run `./init.sh test`, full `./init.sh`, final GitNexus detect-changes, and update harness evidence/progress.

## Surprises & Discoveries

- 2026-06-04: React effect probes confirmed current mount order is `child -> parent`, so the reported BottomButton crash theory does not hold as originally stated. Cleanup order during page swaps is `old shell cleanup -> old page cleanup -> new shell mount -> new page mount`, which still matters for transient native-button state but not for the claimed crash.
- 2026-06-04: The installed SDK version `@tma.js/sdk@3.2.0` exposes `secureStorage` methods directly and does not provide `secureStorage.mount()`, so any hardening must target fallback behavior rather than a missing mount call.
- 2026-06-04: A browser-like non-TMA environment still throws from `init()` with a `LaunchParamsRetrieveError`, so startup hardening must happen before app render, not only inside auth bootstrap.
- 2026-06-04: Route-level lazy loading reduced the eager entry chunk from roughly `525.83 kB` minified / `161.66 kB` gzip to `436.00 kB` minified / `139.30 kB` gzip, while splitting each TMA route into its own small chunk. `TmaPageShell` back-navigation fallback work was deferred because GitNexus marked that shared shell as `CRITICAL` blast radius.
- 2026-06-04: The isolated `TmaPageShell` pass held up under focused regression coverage; switching back-navigation to React Router's own `history.state.idx` and dropping the `window.history.length` fallback did not break current SPA flows in focused tests.

## Decision Log

- Decision: Split execution into runtime/auth hardening first, bundle/router second, helper cleanup last.
  Rationale: The first batch removes crash/fallback correctness risks without widening the diff into route architecture immediately.
  Date/Author: 2026-06-04 / Codex
- Decision: Treat route lazy-loading as part of the same feature, but only after runtime bootstrap is safe.
  Rationale: A broken startup path makes bundle wins irrelevant; correctness comes first.
  Date/Author: 2026-06-04 / Codex

## Outcomes & Retrospective

- Fill in after implementation completes.

## Context and Orientation

- TMA entrypoint: `apps/tma/src/main.tsx`
- TMA app composition: `apps/tma/src/app/app.tsx`
- Telegram SDK bootstrap: `apps/tma/src/app/bootstrap/telegram-init.ts`
- Shared shell and native button ownership: `apps/tma/src/components/shared/tma-page-shell.tsx`
- Auth bootstrap/runtime store: `apps/tma/src/features/auth/*`
- Safe-area/theme bridge: `apps/tma/src/lib/telegram/theme.ts`
- Storage adapter: `apps/tma/src/lib/storage/adapter.ts`
- Router: `apps/tma/src/app/router/app-router.tsx`
- Focused tests: `apps/tma/src/test/*`

## Required Standards / Reference Docs

- `docs/TMA.md`
- `docs/references/frontend/tma/app-structure-and-client-rules.md`
- `docs/references/frontend/tma/native-ui-and-navigation-pattern.md`
- `docs/references/frontend/tma/state-and-storage-pattern.md`
- `docs/references/frontend/tma/auth-and-bot-pattern.md`

Concrete constraints from those refs:

- Keep `apps/tma` isolated from `apps/web` UI/runtime imports.
- Shared shell owns Telegram `BackButton`, `BottomButton`, safe area, and one scroll root per screen.
- Access token remains memory-only; persistence fallback should weaken persistence, not weaken storage policy.
- Startup stays light; heavy routes must be code-split where possible.

## Plan of Work (Narrative)

1. Harden startup in `apps/tma/src/main.tsx`, `apps/tma/src/app/app.tsx`, and `apps/tma/src/app/bootstrap/telegram-init.ts` so Telegram SDK launch failures become a renderable fatal state instead of a pre-React crash.
2. Refactor `apps/tma/src/lib/telegram/theme.ts` so safe-area/application vars keep updating after viewport mount, fullscreen requests, and later Telegram viewport events.
3. Tighten `apps/tma/src/lib/storage/adapter.ts`, `apps/tma/src/features/auth/bootstrap.tsx`, `apps/tma/src/features/auth/bootstrap-deps.ts`, and `apps/tma/src/features/auth/store.ts` so fallback and bootstrap logic is one-way, explicit, and free of dead branches.
4. Once runtime is stable, refactor `apps/tma/src/app/router/app-router.tsx` into lazy route modules, remove the duplicate home entry, and revisit `apps/tma/src/components/shared/tma-page-shell.tsx` back-navigation fallback.
5. Finish with shared-helper/perf cleanup in `apps/tma/src/features/home/presentation.ts` and other small duplicated utilities once the architecture-changing work is done.

## Concrete Steps (Commands)

Run from repo root unless noted otherwise.

```bash
# focused TMA tests after Batch 1
pnpm --filter tma exec vitest run src/test/storage-adapter.test.ts src/test/auth-bootstrap.test.ts src/test/safe-area.test.ts

# TMA-focused compile/lint gates after runtime/auth changes
./init.sh typecheck
./init.sh lint

# bundle verification after lazy routes land
pnpm --filter tma build
./init.sh build

# final regression sweep
./init.sh test
./init.sh
```

Expected short outputs:

- Focused Vitest: `passed`
- `./init.sh typecheck`: `OK`
- `./init.sh lint`: `OK`
- `pnpm --filter tma build`: Vite build completes and shows smaller split chunks instead of one giant route bundle
- `./init.sh`: `Done!`

## Validation and Acceptance

- Startup outside Telegram no longer dies before render; a fatal launch screen renders instead.
- SecureStorage read/delete failures trigger one warning/fallback and future refresh-token calls use memory-only mode without repeated secure-storage timeouts.
- Auth bootstrap tests cover authenticated, launch-invalid, session-expired, and fallback cases without unreachable code branches.
- Route cold start no longer ships all route modules in one eager chunk.
- Safe-area values update after fullscreen/viewport changes, with no title/content overlap regressions on device-style paths.

## Idempotence & Recovery

- All code/test steps are safe to re-run.
- No schema or destructive data operations are planned.
- If a batch introduces regressions, revert only the touched TMA files in that batch rather than mixing route and auth rollback together.

## Artifacts and Notes

- Final harness evidence must include focused test output names, `./init.sh` results, and the post-change TMA build summary.
- If route lazy-loading still leaves one large chunk, record the exact remaining chunk contributors before attempting manual chunking.

## Interfaces & Dependencies

- `@tma.js/sdk@3.2.0` for Telegram runtime, theme, viewport, and native button integration.
- `react-router-dom` for SPA navigation and route-level lazy boundaries.
- `zustand` for auth and flow stores.
- `@tanstack/react-query` for server state.
- Existing TMA auth API contracts in `apps/tma/src/lib/auth/api.ts` and storage policy in `apps/tma/src/lib/storage/adapter.ts`.
