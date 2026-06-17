# Telegram Mini App household list, detail, and avatar

## Title

Ship TMA household list/detail routes plus household avatar editing.

## Purpose / Big Picture

This slice gives the Telegram Mini App a real household management read surface instead of only showing household summaries on the home screen. Users will be able to open a dedicated household list, drill into a household detail page, review members and recent activity, and update the household avatar from the detail screen with the same signed-upload foundation already used elsewhere in the product. The change is user-visible through new `/households` and `/households/:id` routes, additive household avatar data in worker responses, and linked home shortcuts/cards.

## Scope

- In scope:
  - `apps/tma/src/app/router/*`, `apps/tma/src/routes/*`, and new `apps/tma/src/features/households/*` files for household list/detail screens.
  - `apps/tma/src/components/shared/*` and `apps/tma/src/index.css` only where shared TMA shells/styles must expand for the new screens.
  - `apps/worker/src/contracts/household.ts`, `apps/worker/src/routes/households.ts`, and `apps/worker/src/handlers/households/*` for additive avatar support.
  - `apps/worker/src/db/repositories/household-*`, worker migration(s), and local seed updates needed for `household.avatarUrl` persistence.
  - Focused worker/TMA tests plus harness artifacts for `feat-082`.
- Out of scope:
  - TMA invite deep-link preview/accept flow.
  - New worker permission semantics or membership rule changes.
  - Reworking desktop/web household pages.
  - Non-household TMA read surfaces already tracked under `feat-083`.

## Non-negotiable Requirements

- Keep TMA inside `apps/tma`; do not import `apps/web` UI or feature code.
- Preserve worker-owned household membership and role enforcement.
- Treat `avatarUrl` as an additive API field only; do not change existing field meaning.
- Use SPA routing only in TMA, with route constants instead of new hardcoded path strings where touched.
- Reuse the existing signed Cloudinary upload pattern; do not introduce a second media-upload stack.

## Progress

- [x] Create/update plan + harness state for `feat-082`.
- [x] Add worker persistence + contract support for `household.avatarUrl`.
- [x] Add focused worker coverage for household avatar read/update behavior.
- [x] Build TMA household routes, feature API layer, and page composition.
- [x] Wire avatar upload/update UI into household detail and link home shortcut/cards.
- [x] Run focused verification, then repo-level verification, then update harness evidence.

## Surprises & Discoveries

- GitNexus reports `findHouseholdById` as HIGH blast radius because it also feeds expense and budget handlers. The implementation must keep repository changes additive and query-safe.
- TMA home already reads real worker household/budget/analytics data under `apps/tma/src/features/home/*`, so the new household pages should reuse worker contracts rather than invent TMA-only DTOs.

## Decision Log

- Decision: Keep this execution under `feat-082`, not `feat-083`.
  Rationale: The user request is household list/detail plus avatar management, which belongs to the TMA household flow slice even though it reuses read-surface contracts.
  Date/Author: 2026-06-04 / Codex
- Decision: Scope invite preview/accept out of this pass.
  Rationale: The request is focused on household list/detail and avatar UX. Expanding into invite deep links would mix another flow and raise verification scope.
  Date/Author: 2026-06-04 / Codex

## Outcomes & Retrospective

- The TMA now has a real household list/detail flow instead of linking only to household summaries on home.
- Worker household APIs gained additive `avatarUrl` support without changing membership or permission semantics.
- The final repo verification passed after removing one stale `lucide-react` dependency line that was left in `apps/tma/package.json` even though the implementation uses repo-local SVG icons.

## Context and Orientation

- TMA router: `apps/tma/src/app/router/app-router.tsx`
- TMA home route with current household shortcut/card entry points: `apps/tma/src/routes/home.tsx`
- Current TMA shared page shell and bottom tabs: `apps/tma/src/components/shared/tma-page-shell.tsx`
- TMA live worker query pattern: `apps/tma/src/features/home/api.ts`
- Worker household contract + handlers: `apps/worker/src/contracts/household.ts`, `apps/worker/src/handlers/households/*`, `apps/worker/src/routes/households.ts`
- Worker household persistence: `apps/worker/src/db/repositories/household-repository.ts`
- Worker integration tests: `apps/worker/test/integration/households-read-update.spec.ts`

## Plan of Work (Narrative)

1. Add a new worker migration for `households.avatar_url`, then extend the household repository row mappers and list/detail/update handlers so `HouseholdDTO` returns `avatarUrl` on list/detail and accepts `avatarUrl` on update.
2. Expand worker household schema tests and integration tests to cover additive avatar read/update behavior, including clearing avatar back to `null`.
3. Extract or add a TMA API client that can perform authenticated `GET`, `POST`, `PATCH`, and `DELETE` requests against `/api/v1` while preserving the existing envelope/error behavior already used by TMA auth/home flows.
4. Build `apps/tma/src/features/households/*` for query keys, mutations, DTOs, avatar upload helper(s), and page-level presentation helpers. The feature will query household list/detail, members, household analytics summary, budgets, and recent expenses from current worker endpoints.
5. Add new TMA routes for `/households` and `/households/:id`, plus route constants/builders. Update the home shortcut block and household carousel CTAs to navigate into the new screens.
6. Compose mobile-first list/detail UI that matches the current TMA shell: bright background, soft white cards, Telegram-safe scrolling, admin-only settings actions, avatar card at the top of detail, and member/recent-spend sections below.
7. Update local seed data only if needed for better visible avatar/list states, then verify worker tests, TMA typecheck/tests/build, final `./init.sh`, and `gitnexus_detect_changes(scope: "all")`.

## Concrete Steps (Commands)

Run from repo root unless noted:

```bash
./init.sh sync
pnpm --filter worker exec vitest run test/unit/dto-household.spec.ts test/integration/households-read-update.spec.ts
pnpm --filter tma exec vitest run src/test/home-presentation.test.ts
./init.sh typecheck
./init.sh build
./init.sh
```

Expected short outputs:

- Worker focused Vitest command prints passing tests for touched household contract/integration suites.
- TMA focused Vitest command prints passing tests for touched TMA helper suite(s).
- `./init.sh typecheck` prints `OK`.
- `./init.sh build` prints `OK`.
- Final `./init.sh` prints `Done!`.

## Validation and Acceptance

- `GET /api/v1/households` and `GET /api/v1/households/:id` return `avatarUrl` in successful payloads.
- `PATCH /api/v1/households/:id` accepts `avatarUrl` and persists both non-null and `null` updates for admins only.
- TMA home shortcut `Gia đình` opens `/households`; tapping a household card opens `/households/:id`.
- TMA household detail shows the avatar card at the top, renders either uploaded image or fallback monogram, and updates the visible avatar after a successful upload/save.
- Member users see read-only household info with admin-only controls hidden.

## Idempotence & Recovery

- The new migration is additive and safe to re-run through the repo migration tooling.
- TMA UI edits are safe to re-run.
- If avatar persistence causes regressions, the fallback is to keep `avatarUrl` nullable and omit it from TMA rendering while preserving list/detail routes.

## Artifacts and Notes

- Harness updates required: `harness/feature_index.json`, `harness/features/feat-082.json`, and `harness/progress.md`.
- Record final focused verification commands and the final `gitnexus_detect_changes(scope: "all")` result in harness evidence.
- Final verification completed with `./init.sh build` -> `OK`, `./init.sh` -> `Done!`, touched harness JSON parse checks -> `OK`, `./scripts/check_harness_size.sh` -> `Harness size checks passed`, and `git diff --check` -> clean.
- Final `gitnexus_detect_changes(scope: "all", repo: "household-finance-system")` returned `critical` across 25 changed files and 20 affected processes because the current worktree also contains other TMA route/shell changes outside the narrow household slice; the result should be read as whole-worktree risk, not as an isolated household-avatar verdict.

## Interfaces & Dependencies

- Worker household contract: `HouseholdDTO`, `UpdateHouseholdRequest`, `ListHouseholdsResponse`, `ListHouseholdMembersResponse`.
- Worker media upload signature route: `POST /api/v1/media/upload-signature`.
- TMA auth store access token provider in `apps/tma/src/features/auth/store.ts`.
- Cloudinary signed upload ticket contract: `{ uploadUrl, apiKey, signature, uploadPreset, folder, publicId, allowedFormats }`.
