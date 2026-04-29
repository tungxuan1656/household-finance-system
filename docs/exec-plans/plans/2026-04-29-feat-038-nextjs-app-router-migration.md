# feat-038 — Migrate `apps/web` from React + Vite SPA to Next.js App Router

## Title

Migrate `apps/web` from React + Vite SPA to Next.js App Router with public landing page at `/` and protected home moved to `/home`.

## Purpose / Big Picture

This change modernizes the web runtime from Vite SPA to Next.js App Router while preserving current business flows and route semantics for existing app features. End users will observe a new public landing page at `/` with CTA buttons into the app, while authenticated app home moves to `/home` and all other feature paths remain stable. The migration also standardizes PWA support for Next.js, updates environment-variable contracts, and removes Vite-specific build/runtime surfaces.

## Objective

Deliver a production-ready Next.js App Router web app in `apps/web` that:
- Replaces Vite and `react-router-dom` route composition.
- Preserves existing auth-protected screens and feature behaviors.
- Introduces landing page at `/` and relocates overview/home to `/home`.
- Keeps Vitest-based testing and full repo verification passing.

## Scope

### In Scope

- Frontend runtime migration in `apps/web` from Vite SPA to Next.js App Router (Node runtime target).
- Route contract migration:
  - `/` becomes public landing page with CTA navigation into app.
  - `/home` becomes protected overview/home.
  - Existing paths remain (`/sign-in`, `/sign-up`, `/onboarding`, `/households`, `/households/:id`, `/expenses`, `/budgets`, `/insights`, `/settings`, `/more`).
- Replace `react-router-dom` navigation primitives with `next/link` and `next/navigation`.
- Replace Vite env contract (`VITE_*`) with Next public env contract (`NEXT_PUBLIC_*`).
- Implement PWA surfaces for Next App Router (manifest + service worker registration + icons).
- Enforce direct imports for runtime-critical modules instead of barrel/index indirection.
- Update docs and harness artifacts for the new stack and workflow.

### Out of Scope

- Backend API behavior changes in `apps/worker`.
- Re-architecting auth to server-side cookie sessions (keep current client-side session strategy for this phase).
- Product copy/UX redesign beyond required landing page and routing updates.
- Migration of historical completed plan content except where references must be corrected in current source-of-truth docs.

## Non-negotiable Requirements

- Plan remains self-contained and executable for a new engineer/agent.
- All route and auth flows must have observable validation evidence.
- `./init.sh` and web-specific verification must pass before marking feature done.
- Keep one-feature-at-a-time harness policy; track this migration as `feat-038`.
- No Vite runtime/build dependencies remain in `apps/web` after migration.

## Progress

- [x] (2026-04-29) Create and register `feat-038` harness records (`feature_index`, `features/feat-038.json`, progress log).
- [x] (2026-04-29) Scaffold Next.js App Router foundation in `apps/web` and remove Vite entrypoints.
- [x] (2026-04-29) Migrate route system and guards to Next navigation primitives.
- [x] (2026-04-29) Implement landing page `/` and move protected home to `/home`.
- [x] (2026-04-29) Migrate env contracts from `VITE_*` to `NEXT_PUBLIC_*`.
- [x] (2026-04-29) Integrate Next-compatible PWA surfaces (manifest, SW registration, icons).
- [x] (2026-04-29) Enforce direct-import policy and remove critical barrel/index usage.
- [x] (2026-04-29) Update tests for new route model and Next runtime boundaries.
- [x] (2026-04-29) Update docs (root, web, AGENTS guidance where relevant to stack).
- [x] (2026-04-29) Run full verification path and capture evidence in harness.

Current owned step: none. All plan items completed and verified.

## Surprises & Discoveries

- Placeholder for implementation-time discoveries.
- If Next runtime constraints force scope changes, record evidence and adjust plan.

## Decision Log

- Decision: Use Next.js App Router (not Pages Router or hybrid).
  - Rationale: Default modern routing surface, better long-term composition for nested layouts/segments.
  - Date/Author: 2026-04-29 / Codex + User
- Decision: Keep Vitest for unit/component tests.
  - Rationale: Minimize migration risk and preserve existing test workflow.
  - Date/Author: 2026-04-29 / Codex + User
- Decision: Implement PWA in this migration phase.
  - Rationale: Avoid carrying PWA technical debt across framework migration.
  - Date/Author: 2026-04-29 / Codex + User
- Decision: Deploy target remains Node runtime.
  - Rationale: Lowest-risk target for initial Next migration before adapter-specific optimization.
  - Date/Author: 2026-04-29 / Codex + User

## Open Decisions

- None blocking at plan time.
- If service-worker cache policy conflicts with auth/session correctness, resolve by favoring correctness over offline breadth and document the narrowed cache scope.

## Risks and Blockers

- Risk: App Router client/server boundary mistakes (missing `\"use client\"`) break interactive pages.
  - Mitigation: Add explicit boundary checklist in each migrated route/layout and validate via typecheck + smoke tests.
- Risk: Over-aggressive service-worker caching causes stale auth/navigation behavior.
  - Mitigation: Start with conservative asset-only caching and explicitly exclude auth/API/runtime payloads.
- Risk: Env contract drift (`VITE_*` remnants) causes runtime initialization failures.
  - Mitigation: Use repo-wide search for `import.meta.env` and `VITE_` before verification sign-off.
- Risk: Redirect regressions after moving home from `/` to `/home`.
  - Mitigation: Add route matrix tests and manual navigation checks for authenticated/anonymous flows.
- Blocker trigger: If critical dependency incompatibility emerges (Next + existing library behavior), pause and record decision in this plan before expanding scope.

## Outcomes & Retrospective

- `apps/web` now runs on Next.js App Router with `/` as the public landing page and `/home` as the protected shell entry.
- Vite runtime/config artifacts were removed, env access moved to `NEXT_PUBLIC_*`, and PWA support was re-established using Next-compatible surfaces.
- Runtime-critical i18n imports now use direct file targets instead of barrel imports.
- Verification completed successfully with `pnpm --filter web lint`, `pnpm --filter web typecheck`, `pnpm --filter web test`, `pnpm --filter web build`, and `./init.sh`.
- Remaining lint warnings are non-blocking image-optimization suggestions in legacy UI blocks and profile preview code.

## Context and Orientation

Key current files and responsibilities:
- Current SPA entry and routing:
  - `apps/web/src/main.tsx`
  - `apps/web/src/app.tsx`
  - `apps/web/src/router.tsx`
- Current route/path/auth constants:
  - `apps/web/src/lib/constants/paths.ts`
  - `apps/web/src/lib/constants/auth.ts`
  - `apps/web/src/lib/constants/navigation.ts`
- Current runtime config:
  - `apps/web/vite.config.ts`
  - `apps/web/tsconfig.json`, `apps/web/tsconfig.app.json`, `apps/web/tsconfig.node.json`
  - `apps/web/eslint.config.mjs`
  - `apps/web/package.json`
- Current env contract and usage:
  - `apps/web/.env.example`
  - `apps/web/src/api/endpoints.ts`
  - `apps/web/src/lib/auth/firebase-auth.ts`
  - `apps/web/src/lib/firebase/storage.ts`
- Current test harness:
  - `apps/web/src/app.test.tsx`
  - `apps/web/src/lib/i18n/browser-fallback.test.tsx`
  - `apps/web/src/test/setup.ts`

## Scope Map and Layer Impact

Layer mapping (`Types -> Config -> Repo -> Service -> Runtime -> UI`):
- Types:
  - Route/path and env typing surfaces in `src/lib/constants/*` and any Next env typing augmentation.
- Config:
  - `apps/web/package.json`, `apps/web/tsconfig*.json`, `apps/web/eslint.config.mjs`, Next config files.
- Runtime:
  - App bootstrap replacement (`src/main.tsx` removal, App Router layout/page architecture).
  - PWA runtime setup (manifest + service worker registration).
- UI:
  - Landing page at `/`, overview relocation to `/home`, navigation/guard behavior updates.
- Tooling/docs:
  - Root scripts/docs references to Vite/react-router workflow.

Hard dependency checks (from `ARCHITECTURE.md`):
- UI continues to consume APIs through existing client/service boundaries (`src/api/*`, `src/lib/*`), no direct DB/backend coupling.
- Lower-layer rules preserved: no app-page logic inserted into generic utilities.
- New dependencies are justified in plan before adoption.

## Standards Enforcement

Scope classification: `frontend + shared + tooling/docs`.

Mandatory references and enforced constraints:

1. `docs/references/frontend/project-folder-structure.md`
- Adopt Next `app/` routing structure while keeping existing domain folders (`api`, `hooks`, `components`, `stores`, `lib`, `types`) for non-route logic.
- Avoid turning `lib` into feature dumping ground during migration.

2. `docs/references/frontend/component-structure-pattern.md`
- Keep page components explicit and focused; split oversized migrated route files by concern.
- Preserve named exports for child components where applicable.

3. `docs/references/frontend/naming-and-conventions-pattern.md`
- Kebab-case filenames for added/renamed files.
- Maintain import order and no-duplicate-import rules.
- Enforce direct-import rule for runtime-critical modules (no barrel indirection for route/bootstrap/i18n entrypoints).

4. `docs/references/frontend/form-pattern.md`
- Existing auth/onboarding/settings forms must keep `react-hook-form` + `zod` validation patterns and accessible field contracts.

5. `docs/references/frontend/dialog-and-form-pattern.md`
- Existing dialog-based flows remain compliant while route shell changes.

6. `docs/references/frontend/api-react-query-pattern.md`
- Keep API calls in `api/*` and cache invalidation/query-key conventions intact while moving runtime.

7. `docs/references/frontend/zustand-store-pattern.md`
- Preserve store action-based mutations and reset/test patterns.

8. `docs/references/frontend/i18n-label-pattern.md`
- New landing page labels must come from i18n keys; no hardcoded user-facing text.

9. `docs/references/shared/type-naming-pattern.md`
- Any new API/env-facing types follow `DTO/Request/Response` conventions where applicable.

## Implementation Notes

Mandatory implementation-phase companion skills:
- `tdd-workflow`: required for route/guard migration and landing-page behavior changes.
- `security-review`: required for auth guard behavior, redirect safety, env exposure, and PWA runtime boundaries.
- `documentation-lookup`: required for Next App Router + PWA API details before coding uncertain surfaces.
- `frontend-patterns`: required for route/layout/state migration decisions.
- `verification-loop`: required for iterative evidence capture and regression control.

Optional companion skills:
- `backend-patterns`: only if implementation unexpectedly touches API contracts in `apps/worker` (not expected in scope).

Common pitfalls to avoid:
- Missing `"use client"` on interactive route/layout components after migration.
- Over-caching App Router responses in service worker causing auth/session staleness.
- Keeping stale Vite/env assumptions (`import.meta.env`) in runtime code.
- Breaking active-route logic when `/home` becomes new protected index.

## Plan of Work (Narrative)

### Phase 0 — Branch Safety and Baseline Verification

1. Create feature branch and capture clean baseline.
2. Run baseline verification to ensure migration failures are attributable to current work.

### Phase 1 — Next Runtime Foundation

1. Replace Vite app bootstrap with Next App Router file structure:
- Add `apps/web/src/app/layout.tsx`, route segments, shared providers mount.
- Move root providers currently in `main.tsx` into Next-compatible client provider entry.
2. Introduce Next config and TypeScript/ESLint alignment:
- Add/adjust `next.config.*`, `next-env.d.ts`, `tsconfig` shape.
- Remove Vite-specific configs and entry HTML.

### Phase 2 — Route System Migration and New URL Contract

1. Replace `react-router-dom` tree with Next file-based routes.
2. Implement landing page at `/` with CTA(s) to app/auth routes.
3. Move protected overview content from old root to `/home`.
4. Keep other route paths stable and migrate navigation calls/links accordingly.
5. Recreate guard semantics using Next navigation APIs and existing auth store signals (`isSessionChecked`, `isAuthenticated`).

### Phase 3 — Env and Runtime Contract Migration

1. Rename and migrate env usage:
- `VITE_API_BASE_URL` -> `NEXT_PUBLIC_API_BASE_URL`
- `VITE_FIREBASE_*` -> `NEXT_PUBLIC_FIREBASE_*`
2. Replace `import.meta.env` with `process.env.NEXT_PUBLIC_*` in web runtime modules.
3. Update examples/docs for local env setup.

### Phase 4 — PWA Migration on Next

1. Add App Router manifest surface (`app/manifest.ts` or equivalent) with valid icons and metadata.
2. Add service-worker registration client component in root layout.
3. Create/update service worker file with conservative cache strategy (static assets only by default; no unsafe caching of auth-sensitive runtime payloads).
4. Validate installability and offline basic behavior.

### Phase 5 — Import Directness and Cleanup

1. Remove runtime-critical barrel/index imports and replace with direct file imports.
2. Add lint restrictions to prevent regressions for forbidden barrel paths.
3. Remove obsolete Vite artifacts/dependencies and router dependencies.

### Phase 6 — Tests, Docs, and Harness Completion

1. Update route/guard tests for `/` landing and `/home` protected home.
2. Add/adjust regression tests for redirect and not-found behaviors.
3. Update docs mentioning Vite/react-router stack and developer commands.
4. Complete harness evidence (`harness/features/feat-038.json`, `harness/feature_index.json`, `harness/progress.md`) and mark status when done.

## Concrete Steps (Commands)

All commands run from repo root unless noted.

### 1) Baseline and branch setup

```bash
git status --short
./init.sh
```

Expected short outputs:
- `git status --short` -> no unexpected modified files.
- `./init.sh` -> final line contains `Init Done`.

### 2) During migration (targeted checks)

```bash
pnpm --filter web lint
pnpm --filter web typecheck
pnpm --filter web test
pnpm --filter web build
```

Expected short outputs:
- Lint exits with code 0.
- Typecheck exits with code 0.
- Tests report all suites passing.
- Build exits with Next build success summary (no fatal errors).

### 3) Full repo verification before done

```bash
./init.sh
```

Expected short outputs:
- `Linting: OK`
- `Type checking: OK`
- `Running tests: OK`
- Final line: `Init Done`

## Verification Path

### Happy Path

- Visiting `/` renders landing page content and CTA buttons.
- CTA to app routes leads to auth-gated destination.
- Authenticated user can access `/home` and all existing protected feature routes.

### Validation / Error Path

- Unauthenticated access to protected routes redirects to `/sign-in`.
- Authenticated access to public auth routes redirects to default protected destination (`/home`).
- Unknown route renders not-found page with working navigation out.

### Unauthorized/Forbidden Behavior

- Guard behavior parity retained with pre-migration expectations:
  - `isSessionChecked=false` -> loading/hold state.
  - `isSessionChecked=true` + anonymous -> redirect to sign-in.

### Regression Checks

- Existing i18n fallback tests still pass.
- Existing auth sign-in/sign-up test flows still pass.
- Existing layout nav items still resolve correct routes after `/home` shift.

### PWA Checks

- Manifest is served and valid.
- Service worker registers in supported browsers.
- Install prompt behavior works where browser supports it.

## Validation and Acceptance

Feature is accepted when all criteria below are true:

1. Runtime and routing
- `/` is public landing page.
- `/home` is protected overview/home.
- Existing non-home paths remain unchanged and functional.

2. Tooling migration
- `apps/web` no longer depends on Vite runtime/build config.
- `react-router-dom` is removed from runtime routing composition.

3. Env migration
- Web runtime uses only `NEXT_PUBLIC_*` contract.
- `.env.example` documents the new keys.

4. PWA
- Next-compatible PWA surfaces are present and verified.

5. Quality gates
- `pnpm --filter web lint`
- `pnpm --filter web typecheck`
- `pnpm --filter web test`
- `pnpm --filter web build`
- `./init.sh`
all succeed.

Acceptance artifacts (at least one must be attached in progress/evidence):
- Test transcript snippet showing route migration tests pass.
- Build transcript snippet showing successful Next build.
- Manifest/SW validation screenshot or console transcript.

## Idempotence & Recovery

- Most plan steps are safe to re-run (lint, typecheck, tests, build, init).
- Migration should be committed in small checkpoints (foundation, routing, env, PWA, cleanup) for easy rollback.
- Recovery path for major breakage:
  - `git restore` only for files owned by current migration commit scope.
  - If needed, reset to last known good commit in feature branch (never on shared branches).
- Keep a temporary backup branch before removing Vite artifacts.

## Interfaces & Dependencies

Primary interfaces affected:
- Route contract (public + protected URL map).
- Frontend env contract (`NEXT_PUBLIC_*`).
- App bootstrap/provider mounting strategy.

Dependencies:
- Next.js App Router runtime and ESLint integration.
- Existing React, Zustand, React Query, Firebase, i18n stacks retained.
- PWA support implemented through Next-supported manifest/service-worker surfaces.

Any new dependency added during implementation must be justified in `Decision Log` before merge.

## Harness Integration

Required harness updates during execution:

- `harness/feature_index.json`
  - Keep `feat-038` status synchronized (`in_progress` -> `done`).
- `harness/features/feat-038.json`
  - Track exact scope, dependencies, status, evidence, and `updated_at`.
- `harness/progress.md`
  - Add top entries for each session: summary, changed files, blockers, next steps.
- `docs/exec-plans/index.md`
  - Keep this plan under `Active` until verification completes; then move line entry to `Completed` (file stays in same folder).

## Artifacts and Notes

Expected implementation artifacts:
- New Next App Router route tree under `apps/web/src/app`.
- Updated route constants and auth redirect constants.
- Updated env examples and runtime env reads.
- Updated route/auth tests validating landing/home split.
- PWA manifest and service worker wiring.
