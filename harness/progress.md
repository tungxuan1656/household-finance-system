# Progress Log

## 2026-04-23 — Hardened feat-033 web API client envelope validation
- Who: Codex
- Summary: Fixed the follow-up review issues in the shared web API client by rejecting malformed JSON success payloads that do not satisfy the `{ success, data, error, meta }` contract and by wrapping invalid JSON responses into typed `ApiClientError` transport failures. Added regression tests for both cases and re-verified the web and repo-wide checks.
- Files changed: apps/web/src/api/client.ts, apps/web/src/api/client.test.ts, harness/progress.md
- Blockers: none
- Next steps: keep future `src/api/*` consumers on the typed client path so transport contract regressions remain centralized and testable.

## 2026-04-22 — Implemented feat-033 API response contract standardization
- Who: Codex
- Summary: Standardized all current worker `/api/v1` responses onto the symmetric `{ success, data, error, meta }` envelope, centralized worker error-code ownership, added explicit response-envelope assertions in worker unit/integration tests, and created the canonical web `src/api` layer with endpoint constants, typed transport contracts, a fetch-based client, and adapter-driven 401 refresh-and-retry coverage. Archived the ExecPlan and marked `feat-033` done after full repo verification.
- Files changed: apps/worker/src/lib/errors.ts, apps/worker/src/lib/response.ts, apps/worker/test/unit/response.spec.ts, apps/worker/test/index.spec.ts, apps/web/src/api/client.ts, apps/web/src/api/client.test.ts, apps/web/src/api/endpoints.ts, apps/web/src/types/api.ts, docs/exec-plans/completed/2026-04-22-feat-033-api-response-contract-error-handling-standardization.md, docs/exec-plans/active/index.md, docs/exec-plans/completed/index.md, harness/feature_index.json, harness/features/feat-033.json, harness/progress.md
- Blockers: none
- Next steps: wire `feat-009` to the new API client/auth-session adapter instead of adding raw fetch/session logic in auth pages or stores.

## 2026-04-22 — Re-sequenced feat-033 ahead of feat-009
- Who: Codex
- Summary: Removed the incorrect dependency from `feat-033` to `feat-009`, kept `feat-033` anchored to the existing backend auth surface from `feat-008`, and updated the active ExecPlan plus `feat-009` dependencies so the frontend auth flow now consumes the standardized API client/error contract instead of blocking it.
- Files changed: harness/features/feat-033.json, harness/features/feat-009.json, docs/exec-plans/active/2026-04-22-feat-033-api-response-contract-error-handling-standardization.md, harness/progress.md
- Blockers: none
- Next steps: implement `feat-033` first, then wire `feat-009` onto the new client/envelope contract.

## 2026-04-22 — Created ExecPlan for feat-033 API response contract standardization
- Who: Codex
- Summary: Drafted the active ExecPlan for `feat-033` after reviewing the current worker response/error helpers, route coverage, frontend store state, harness backlog, and the required frontend/backend/shared reference docs. The plan locks the feature to infrastructure-only fullstack work: standardize the worker `{ success, data, error, meta }` envelope, centralize error-code ownership, create the canonical web `src/api` client seam with typed errors and a refresh adapter, and record the remaining dependency on `feat-009` for real auth-session wiring.
- Files changed: docs/exec-plans/active/2026-04-22-feat-033-api-response-contract-error-handling-standardization.md, docs/exec-plans/active/index.md, harness/progress.md
- Blockers: final production verification of 401 refresh-and-retry still depends on `feat-009` exposing the real frontend auth-session lifecycle.
- Next steps: implement worker envelope/error standardization first, then add the web API client and adapter-driven retry tests before running full repo verification.

## 2026-04-22 — Hardened feat-008 auth/session rotation and logout timing
- Who: Codex
- Summary: Tightened refresh-session rotation in the worker repository to be atomic, added logout request-epoch plumbing to avoid near-expiry revocation races, parallelized auth middleware lookups, expanded auth contract/session repository tests for validation and edge cases, and re-verified the worker auth slice with focused tests plus lint/typecheck.
- Files changed: apps/worker/src/db/repositories/session-repository.ts, apps/worker/src/middlewares/auth.ts, apps/worker/src/routes/auth.ts, apps/worker/src/types/app.ts, apps/worker/src/types/auth.ts, apps/worker/src/contracts/auth.ts, apps/worker/src/handlers/auth/logout-session.ts, apps/worker/test/unit/dto-auth.spec.ts, apps/worker/test/unit/session-repository.spec.ts, harness/progress.md
- Blockers: none
- Next steps: keep the auth/session flow stable for `feat-009`; no further `feat-008` changes are expected.

## 2026-04-22 — Completed feat-008 backend logout/session revocation
- Who: Codex
- Summary: Implemented `POST /api/v1/auth/logout` behind auth middleware, added current-session revocation through the worker session repository, covered unauthorized/logout/post-logout regression paths in the worker integration tests, and verified the workspace with worker lint, typecheck, test, and full `./init.sh`.
- Files changed: apps/worker/src/contracts/auth.ts, apps/worker/src/types/auth.ts, apps/worker/src/handlers/auth/logout-session.ts, apps/worker/src/routes/auth.ts, apps/worker/test/index.spec.ts, harness/feature_index.json, harness/features/feat-008.json, harness/progress.md
- Blockers: none
- Next steps: keep the auth/session lifecycle stable for `feat-009`; no remaining work is expected for `feat-008`.

## 2026-04-22 — Rewrote feat-008 ExecPlan to full backend-scope template
- Who: Codex
- Summary: Tightened the active `feat-008` execution plan into a fully template-aligned backend plan with explicit scope map, layer impact, standards matrix, verification path, risks, harness integration steps, and a single owned current implementation step.
- Files changed: docs/exec-plans/active/2026-04-22-feat-008-authentication-backend-session-exchange.md, harness/progress.md
- Blockers: none
- Next steps: start implementation with a failing logout regression test in `apps/worker/test/index.spec.ts`, then add route/handler/repository support and run worker + full repo verification.

## 2026-04-22 — Hardened feat-032 language persistence against blocked storage
- Who: Codex
- Summary: Wrapped the frontend i18n language write in a storage-safe fallback and added a regression test so `changeLanguage()` keeps working even when localStorage is unavailable or blocked.
- Files changed: apps/web/src/lib/i18n/index.ts, apps/web/src/lib/i18n/change-language.test.tsx, harness/progress.md
- Blockers: none
- Next steps: keep the i18n bootstrap unchanged unless future locale expansion needs a broader storage abstraction.

## 2026-04-22 — Tightened feat-032 fallback verification
- Who: Codex
- Summary: Added a render-level regression test that boots the web router under an unsupported browser language hint and confirms the sign-in shell still renders in Vietnamese, closing the remaining verification gap from the feat-032 review.
- Files changed: apps/web/src/lib/i18n/browser-fallback.test.tsx, harness/progress.md
- Blockers: none
- Next steps: keep the i18n foundation as-is unless future locale work expands beyond `vi`.

## 2026-04-22 — Implemented feat-032 frontend internationalization foundation
- Who: Codex
- Summary: Delivered the frontend i18n foundation with `i18next`/`react-i18next`/`i18next-browser-languagedetector`, a shared `vi` catalog, browser-language plus `appLanguage` resolution normalized to `vi`, Vietnamese labels across the current auth/shell/onboarding/placeholder/overview surfaces, and regression coverage for translated rendering plus unsupported-locale fallback.
- Files changed: apps/web/package.json, pnpm-lock.yaml, apps/web/src/lib/constants/i18n.ts, apps/web/src/lib/i18n/index.ts, apps/web/src/lib/i18n/locales/vi.json, apps/web/src/lib/i18n/resolve-locale.ts, apps/web/src/lib/i18n/resolve-locale.test.ts, apps/web/src/main.tsx, apps/web/src/app.tsx, apps/web/src/router.tsx, apps/web/src/components/auth/auth-panel.tsx, apps/web/src/components/layouts/public-shell.tsx, apps/web/src/components/layouts/protected-shell.tsx, apps/web/src/pages/auth/sign-in-page.tsx, apps/web/src/pages/auth/sign-up-page.tsx, apps/web/src/pages/app/overview-page.tsx, apps/web/src/pages/app/onboarding-page.tsx, apps/web/src/pages/app/placeholder-page.tsx, apps/web/src/app.test.tsx, docs/exec-plans/completed/2026-04-22-feat-032-frontend-internationalization-foundation.md, docs/exec-plans/completed/index.md, docs/exec-plans/active/index.md, harness/feature_index.json, harness/features/feat-032.json, harness/progress.md
- Blockers: none
- Next steps: continue with the next pending feature; `feat-032` is verified and archived.

## 2026-04-22 — Refined feat-032 ExecPlan with i18next decisions
- Who: Codex
- Summary: Updated the active `feat-032` ExecPlan to reflect the chosen frontend i18n direction: use browser language detection plus `localStorage`, normalize unsupported values to `vi` before runtime init, adopt `i18next`/`react-i18next`/`i18next-browser-languagedetector`, and place shared locale constants under `src/lib/constants` with runtime bootstrap under `src/lib/i18n`.
- Files changed: docs/exec-plans/active/2026-04-22-feat-032-frontend-internationalization-foundation.md, harness/progress.md
- Blockers: none
- Next steps: implement `feat-032` with the approved `i18next` bootstrap shape, then verify persisted-locale and fallback-to-`vi` behavior in web tests.

## 2026-04-22 — Created ExecPlan for feat-032 frontend i18n foundation
- Who: Codex
- Summary: Drafted the active ExecPlan for `feat-032` after reviewing the current web shell/auth copy surface, frontend reference docs, harness state, and the completed backend i18n foundation. The plan scopes the work to frontend-only locale plumbing with a Vietnamese JSON catalog, hard fallback to `vi`, migration of the current auth/shell/onboarding labels, and explicit verification for fallback behavior.
- Files changed: docs/exec-plans/active/2026-04-22-feat-032-frontend-internationalization-foundation.md, docs/exec-plans/active/index.md, harness/progress.md
- Blockers: none
- Next steps: implement `feat-032` from the new ExecPlan, then update harness feature state and move the plan to `completed/` after verification passes.

## 2026-04-22 — Closed remaining feat-031 verification gaps
- Who: Codex
- Summary: Added integration coverage for malformed JSON request bodies and for locale resolution via `x-locale`, then re-ran worker tests and full `./init.sh` to confirm the backend i18n foundation still passes the repo verification gate.
- Files changed: apps/worker/test/index.spec.ts, harness/features/feat-031.json, harness/progress.md
- Blockers: none
- Next steps: continue with `feat-032` or resume `feat-008` now that feat-031 coverage matches the plan.

## 2026-04-22 — Implemented feat-031 backend internationalization foundation
- Who: Codex
- Summary: Delivered the worker-side i18n foundation with request-scoped locale resolution, a private Vietnamese message catalog, localized error/validation/auth responses, and `vi` fallback behavior for unsupported language hints. The plan was moved to `docs/exec-plans/completed/`, and the harness now marks `feat-031` as done.
- Files changed: apps/worker/src/lib/i18n/locales.ts, apps/worker/src/lib/i18n/messages.vi.ts, apps/worker/src/lib/i18n/catalog.ts, apps/worker/src/lib/i18n/resolve-locale.ts, apps/worker/src/lib/i18n/translate.ts, apps/worker/src/lib/i18n/zod.ts, apps/worker/src/lib/i18n/index.ts, apps/worker/src/types/app.ts, apps/worker/src/middlewares/request-context.ts, apps/worker/src/lib/errors.ts, apps/worker/src/lib/validation.ts, apps/worker/src/lib/response.ts, apps/worker/src/lib/env.ts, apps/worker/src/index.ts, apps/worker/src/contracts/profile.ts, apps/worker/src/types/auth.ts, apps/worker/src/lib/auth/firebase.ts, apps/worker/src/lib/auth/jwt.ts, apps/worker/src/middlewares/auth.ts, apps/worker/src/routes/auth.ts, apps/worker/src/routes/profile.ts, apps/worker/src/handlers/profile/get-current-profile.ts, apps/worker/src/handlers/profile/update-current-profile.ts, apps/worker/src/handlers/auth/exchange-provider-token.ts, apps/worker/src/handlers/auth/refresh-session.ts, apps/worker/src/db/repositories/user-repository.ts, apps/worker/test/unit/response.spec.ts, apps/worker/test/unit/dto-profile.spec.ts, apps/worker/test/unit/i18n.spec.ts, apps/worker/test/index.spec.ts, apps/worker/README.md, docs/exec-plans/completed/2026-04-22-feat-031-backend-internationalization-foundation.md, docs/exec-plans/active/index.md, docs/exec-plans/completed/index.md, harness/feature_index.json, harness/features/feat-031.json, harness/progress.md
- Blockers: none
- Next steps: start `feat-032` for frontend locale wiring, then resume `feat-008` on top of the new backend locale foundation.

## 2026-04-22 — Created ExecPlan for feat-031 backend i18n foundation
- Who: Codex
- Summary: Drafted the active ExecPlan for `feat-031` after reviewing the worker message surface, backend standards, and harness state. The plan scopes the feature to backend-only locale resolution and Vietnamese error/validation copy with hard fallback to `vi`, without changing API codes or adding dependencies.
- Files changed: docs/exec-plans/active/2026-04-22-feat-031-backend-internationalization-foundation.md, docs/exec-plans/active/index.md, harness/progress.md
- Blockers: none
- Next steps: implement `feat-031` first, then continue with `feat-032` and resume `feat-008` on top of the new backend i18n foundation.

## 2026-04-22 — Reordered i18n features ahead of feat-008
- Who: Codex
- Summary: Updated harness sequencing so the new backend/frontend internationalization foundations are explicitly scheduled before `feat-008`. The feature index now lists `feat-031` and `feat-032` before auth backend work, `feat-008` now depends on both, and the active auth ExecPlan notes the new prerequisite order.
- Files changed: harness/feature_index.json, harness/features/feat-008.json, docs/exec-plans/active/2026-04-22-feat-008-authentication-backend-session-exchange.md, harness/progress.md
- Blockers: none
- Next steps: create the next ExecPlan for `feat-031` or `feat-032` before resuming `feat-008`.

## 2026-04-22 — Added i18n foundation features to harness backlog
- Who: Codex
- Summary: Added two new pending features to the harness backlog for internationalization groundwork before auth implementation: one for backend locale resolution and one for frontend locale wiring. Both are explicitly scoped to Vietnamese-only behavior for now with fallback pinned to `vi`.
- Files changed: harness/feature_index.json, harness/features/feat-031.json, harness/features/feat-032.json, harness/progress.md
- Blockers: none
- Next steps: decide whether `feat-031` or `feat-032` should be planned first, then create an ExecPlan before implementation.

## 2026-04-22 — Created ExecPlan for feat-008 backend auth completion
- Who: Codex
- Summary: Drafted the active ExecPlan for `feat-008` after reviewing the auth product spec, worker auth/session code, harness state, and backend reference docs. The plan captures the current partial implementation baseline and narrows the remaining backend scope to logout/session revocation, acceptance coverage, and harness closure.
- Files changed: docs/exec-plans/active/2026-04-22-feat-008-authentication-backend-session-exchange.md, docs/exec-plans/active/index.md, harness/progress.md
- Blockers: none
- Next steps: implement the plan in `feat-008`, keeping exchange/refresh stable while adding logout/session revocation and final verification evidence.

## 2026-04-22 — Added canonical backend folder-structure reference
- Who: Codex
- Summary: Added a backend companion to the frontend folder-structure reference so routes/handlers/repositories/contracts/types/lib/auth placement rules are documented in one canonical backend doc, then linked it from `docs/references/index.md` and `docs/BACKEND.md`.
- Files changed: docs/references/backend/project-folder-structure.md, docs/references/index.md, docs/BACKEND.md, harness/progress.md
- Blockers: none
- Next steps: keep future backend folder moves aligned with this reference and update it when a new canonical backend namespace is introduced.

## 2026-04-22 — Refactored worker auth/session structure for clearer boundaries
- Who: Codex
- Summary: Split `apps/worker` transport contracts out of the old `src/dto` bucket into `src/contracts`, moved runtime-only app/auth types into `src/types`, moved Firebase/JWT/security code into `src/lib/auth`, simplified shared ID helper placement, changed refresh-session rotation to a transactional D1 batch flow, added rollback/not-found regression coverage, and documented the source layout in the worker README.
- Files changed: apps/worker/src/contracts/auth.ts, apps/worker/src/contracts/profile.ts, apps/worker/src/contracts/index.ts, apps/worker/src/types/app.ts, apps/worker/src/types/auth.ts, apps/worker/src/types/index.ts, apps/worker/src/lib/auth/firebase.ts, apps/worker/src/lib/auth/jwt.ts, apps/worker/src/lib/auth/security.ts, apps/worker/src/utils/id.ts, apps/worker/src/db/repositories/session-repository.ts, apps/worker/src/db/repositories/user-repository.ts, apps/worker/src/handlers/auth/exchange-provider-token.ts, apps/worker/src/handlers/auth/refresh-session.ts, apps/worker/src/handlers/profile/get-current-profile.ts, apps/worker/src/handlers/profile/update-current-profile.ts, apps/worker/src/index.ts, apps/worker/src/lib/env.ts, apps/worker/src/lib/response.ts, apps/worker/src/middlewares/auth.ts, apps/worker/src/middlewares/request-context.ts, apps/worker/src/routes/auth.ts, apps/worker/src/routes/health.ts, apps/worker/src/routes/profile.ts, apps/worker/src/routes/protected.ts, apps/worker/test/unit/dto-auth.spec.ts, apps/worker/test/unit/dto-profile.spec.ts, apps/worker/test/unit/firebase.spec.ts, apps/worker/test/unit/jwt.spec.ts, apps/worker/test/unit/response.spec.ts, apps/worker/test/unit/session-repository.spec.ts, apps/worker/test/unit/user-repository.spec.ts, apps/worker/README.md, harness/features/feat-008.json, harness/progress.md
- Blockers: GitNexus CLI in this session exposes `impact`, `query`, and `context`, but not the `detect_changes` command referenced in repo guidance, so pre-commit graph diff verification could not be run from the available tool surface.
- Next steps: keep auth work under `feat-008`, add logout/session revocation endpoints on top of the new structure, and continue moving future worker domains into the same contracts/types/lib-auth boundary pattern.

## 2026-04-22 — Implemented feat-007 D1 schema and local migration workflow
- Who: Codex
- Summary: Replaced the legacy worker `0001_init.sql` schema with a product-aligned household-finance baseline, swapped the old family/rewards integrity tests for household/expense/budget/audit constraints, added deterministic test fixtures and a local SQL seed workflow, and verified the feature with worker tests, local Wrangler migrate/seed/query commands, and full `./init.sh`.
- Files changed: apps/worker/migrations/0001_init.sql, apps/worker/test/index.spec.ts, apps/worker/test/helpers/household-fixtures.ts, apps/worker/seeds/local/dev.sql, apps/worker/package.json, apps/worker/README.md, docs/exec-plans/completed/2026-04-22-feat-007-database-schema-local-migrations.md, docs/exec-plans/completed/index.md, harness/features/feat-007.json, harness/feature_index.json, harness/progress.md
- Blockers: Local Wrangler D1 commands must be run sequentially; running migrate, seed, and query in parallel against `.wrangler/state/v3/d1` caused a transient `SQLITE_READONLY` failure during verification.
- Next steps: Use this schema baseline for the next worker-backed features (`feat-008`, `feat-011`, `feat-016`, `feat-017`) and add new migrations rather than rewriting `0001`.

## 2026-04-22 — Moved profile orchestration behind worker handlers
- Who: Codex
- Summary: Refactored the worker profile route to follow the backend route -> handler -> data-access boundary by introducing dedicated profile handlers and keeping the route focused on middleware, validation, and response wiring.
- Files changed: apps/worker/src/routes/profile.ts, apps/worker/src/handlers/profile/get-current-profile.ts, apps/worker/src/handlers/profile/update-current-profile.ts, harness/progress.md
- Blockers: Full `./init.sh` is still blocked by the unrelated web test failure in `apps/web/src/app.test.tsx` (`localStorage.getItem is not a function`).
- Next steps: run worker verification and keep future worker endpoints on the same handler-first boundary.

## 2026-04-22 — Revalidated feat-006 worker foundation implementation
- Who: Codex
- Summary: Re-checked the worker service foundation against the completed ExecPlan, confirmed the runtime/auth/validation/test surfaces are still implemented, and aligned `apps/worker/README.md` with the current `docs/references/*` backend standards.
- Files changed: apps/worker/README.md, harness/progress.md
- Blockers: Full `./init.sh` remains blocked by the unrelated web test failure in `apps/web/src/app.test.tsx` (`localStorage.getItem is not a function`).
- Next steps: keep feat-006 closed unless worker behavior regresses; handle the web test failure under the next appropriate frontend or maintenance task.

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
