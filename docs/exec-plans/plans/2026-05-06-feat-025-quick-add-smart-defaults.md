# feat-025 — Quick-add smart defaults

## Title

Add post-MVP quick-add smart defaults for recent category suggestion and durable source preference.

## Purpose / Big Picture

Implement the next quick-add follow-up so repeat expense entry gets faster without adding no-internet behavior. Users will observe this through two concrete changes: quick-add will remember their last used source across sessions, and quick-add will prefill a likely category based on recent expense usage heuristics instead of always starting from a blank category.

This feature stays tightly scoped to `harness/features/feat-025.json` and current product specs. It extends the existing quick-add surface from `feat-024`, reuses current expense query and create contracts where possible, and explicitly does not add offline queueing, background sync, or pending-entry recovery because those flows are out of scope for this product.

## Scope

- Planned backend areas:
  - `apps/worker/migrations/*` — add one new migration for durable quick-add preference persistence.
  - `apps/worker/src/contracts/profile.ts`
  - `apps/worker/src/db/repositories/user-repository.ts`
  - `apps/worker/src/handlers/profile/get-current-profile.ts`
  - `apps/worker/src/handlers/profile/update-current-profile.ts`
  - worker integration and/or unit tests covering the new preference field and auth/validation behavior.
- Planned frontend areas:
  - `apps/web/src/components/expense/quick-add-expense-dialog.tsx`
  - `apps/web/src/components/expense/quick-add-expense-dialog.test.tsx`
  - `apps/web/src/components/expense/use-expense-form.ts`
  - `apps/web/src/hooks/api/use-profile.ts`
  - `apps/web/src/api/profile.ts`
  - `apps/web/src/types/profile.ts`
  - `apps/web/src/lib/i18n/locales/vi.json`
  - optional small helper extraction under `apps/web/src/hooks/api/` or `apps/web/src/components/expense/` only if it reduces complexity.
- Harness/documentation continuity:
  - `docs/exec-plans/index.md`
  - `harness/feature_index.json`
  - `harness/features/feat-025.json`
  - `harness/progress.md`

Out of scope for this plan:

- Offline queueing, background sync, pending-entry recovery, or any no-internet capture flow.
- New quick-add entry surfaces, trigger redesign, or shortcut changes from `feat-024`.
- ML-style recommendation systems, model scoring, or analytics pipelines.
- Broad user-settings architecture unrelated to quick-add defaults.
- Changing expense create authorization or payer semantics beyond what is required for this scoped feature.
- Full expense-form redesign outside quick-add.

## Non-negotiable Requirements

- The plan must stay self-contained and executable without hidden assumptions.
- The implementation must produce observable proof via automated tests and focused quick-add verification.
- Quick-add must not imply offline support anywhere in behavior or copy.
- Durable last-used-source must persist per authenticated user across sessions.
- Smart category defaulting must be derived from recent expense usage with deterministic, explainable rules.
- UI must continue to use runtime/service contracts only; no direct storage or DB access from components.
- New user-facing copy must be localized via i18n keys.
- Any backend contract expansion must remain backward-compatible for existing profile consumers.

## Progress

- [x] 2026-05-06 16:50 UTC — Reviewed planning docs, harness state, narrowed `feat-025` contract, and existing quick-add implementation surface. Owner: Orchestrator.
- [x] 2026-05-06 17:05 UTC — Locked product decision that `feat-025` excludes offline behavior and now covers only smart defaults. Owner: Orchestrator.
- [ ] 2026-05-06 17:20 UTC — Step 1 (current): finalize persistence shape for last-used source and heuristic rules for category prefill before editing runtime/UI code. Owner: Orchestrator.
- [ ] Add backend persistence contract and tests for durable quick-add source preference.
- [ ] Add frontend quick-add smart-default bootstrap and regression tests.
- [ ] Run scoped verification, then full `./init.sh`, and update harness evidence.

## Surprises & Discoveries

- Current quick-add source persistence is session-only and lives directly in `apps/web/src/components/expense/quick-add-expense-dialog.tsx` under `QUICK_ADD_LAST_SOURCE_KEY`; there is no durable preference layer yet.
- Current profile contracts are identity-shaped (`displayName`, `avatarUrl`, email) and do not yet expose quick-add preference fields.
- No `user_preferences` table or generic settings contract was found in current worker migrations or repositories.
- Recent expense query infrastructure already exists and is likely sufficient for a first-pass category heuristic without introducing a new recommendation endpoint.

## Decision Log

- Decision: Treat `feat-025` as a `fullstack` ExecPlan.
  Rationale: category heuristics can reuse existing frontend query data, but durable last-used-source persistence needs backend contract and storage support.
  Date/Author: 2026-05-06 / Orchestrator.

- Decision: Keep heuristic generation frontend-first and deterministic.
  Rationale: existing expense list/query data already exists, and this avoids adding a recommendation-specific backend surface before product value is proven.
  Date/Author: 2026-05-06 / Orchestrator.

- Decision: Keep persistence scoped to quick-add source preference only, not a generic settings platform.
  Rationale: this is smallest-safe change that satisfies `feat-025` without speculative architecture.
  Date/Author: 2026-05-06 / Orchestrator.

- Decision: Preserve backward compatibility by extending existing profile contract rather than changing existing field meaning.
  Rationale: current web app already hydrates profile data; small additive fields are lower-risk than introducing an unrelated settings surface in this feature.
  Date/Author: 2026-05-06 / Orchestrator.

## Outcomes & Retrospective

- Target outcome: quick-add opens with durable source preference restored after reload/login and with a likely category prefilled from recent usage when a deterministic match exists.
- Acceptance evidence must include worker tests for preference persistence, web tests for source/category default behavior, and full `./init.sh` output.
- Post-completion follow-up candidates, if needed: profile/settings contract extraction, richer heuristic tuning, and explicit user control to reset smart defaults.

## Context and Orientation

- Feature truth:
  - `harness/features/feat-025.json` — authoritative narrowed scope for smart defaults only.
  - `docs/product-specs/web/quick-add-experience.md` — quick-add behavior and failure-state boundaries.
  - `docs/product-specs/expense-tracking.md` — expense entry rules and retry-only failure handling.
- Existing quick-add implementation:
  - `apps/web/src/components/expense/quick-add-expense-trigger.tsx` — global trigger and open-state owner.
  - `apps/web/src/components/expense/quick-add-expense-dialog.tsx` — current quick-add UI, session-only source persistence, submit flow, Undo, and timing metric.
  - `apps/web/src/components/expense/use-expense-form.ts` — shared default/build/reset logic and create mutation orchestration.
  - `apps/web/src/components/expense/expense-form-fields.tsx` — category/source/visibility/household/payer/group field primitives.
- Existing runtime/data contracts:
  - `apps/web/src/api/expense.ts` and `apps/web/src/hooks/api/use-expense.ts` — create/list/detail/summary hooks and invalidation patterns.
  - `apps/web/src/api/profile.ts`, `apps/web/src/hooks/api/use-profile.ts`, `apps/web/src/types/profile.ts` — existing user profile contract on web.
  - `apps/worker/src/contracts/profile.ts`, `apps/worker/src/handlers/profile/*`, `apps/worker/src/db/repositories/user-repository.ts` — current worker profile seam.
  - `apps/worker/src/contracts/expense-schemas.ts` and `apps/worker/src/db/repositories/expense-query-repository.ts` — query/filter surface for recent expense lookup.

## Standards and Implementation Notes

### Required references for implementation

- Frontend mandatory docs:
  - `docs/FRONTEND.md`
  - `docs/references/frontend/web/project-folder-structure.md`
  - `docs/references/frontend/web/component-structure-pattern.md`
  - `docs/references/frontend/web/naming-and-conventions-pattern.md`
  - `docs/references/frontend/web/form-pattern.md`
  - `docs/references/frontend/web/dialog-and-form-pattern.md`
  - `docs/references/frontend/web/api-react-query-pattern.md`
  - `docs/references/frontend/web/i18n-label-pattern.md`
  - `docs/design-docs/shadcn-card-composition-architecture-guide.md`
  - `.agents/skills/shadcn/SKILL.md`
  - `.agents/skills/shadcn/rules/styling.md`
  - `.agents/skills/shadcn/rules/forms.md`
  - `.agents/skills/shadcn/rules/composition.md`
- Backend mandatory docs:
  - `docs/BACKEND.md`
  - `docs/references/backend/architecture-and-boundaries.md`
  - `docs/references/backend/api-contract-and-validation.md`
  - `docs/references/backend/error-handling-pattern.md`
  - `docs/references/backend/security-and-auth-pattern.md`
  - `docs/references/backend/testing-pattern.md`
  - `docs/references/backend/database-pattern.md`
  - `docs/references/backend/cloudflare-workers.md`
- Shared mandatory docs:
  - `docs/references/shared/type-naming-pattern.md`

### Concrete coding constraints derived from the standards matrix

- Keep quick-add-specific UI/controller logic in `apps/web/src/components/expense/*`; do not move single-feature logic into `lib`.
- Keep HTTP calls in `api/*.ts`, cache logic in `hooks/api/use-*.ts`, and UI bound to hooks only.
- Additive contract fields must use canonical DTO/Request naming and preserve current API envelope behavior.
- Routes stay thin, handlers own orchestration, repositories own persistence details.
- Validation failures and unauthorized writes must return standard 4xx mappings; do not silently ignore bad preference writes.
- New copy and validation text must be localized and kept synchronized in locale files.

### Implementation Notes

- Mandatory patterns for this scope:
  - Source preference must bootstrap from backend-backed profile data first, with local/session fallback only as temporary compatibility during migration if needed.
  - Category heuristic must be deterministic and explainable; recommended first rule: use most recent matching category for same source, then fall back to most recent category overall when no source match exists.
  - If no safe heuristic match exists, keep category unset rather than guessing aggressively.
  - Smart defaults must not mutate non-defaulted fields after the user has already interacted with them.
- Companion skills for implementation:
  - `tdd-workflow`
  - `security-review`
  - `documentation-lookup`
  - `frontend-patterns`
  - `backend-patterns`
  - `verification-loop`
- Common pitfalls to avoid:
  - Do not reintroduce offline or queued-save logic.
  - Do not fetch duplicate data if existing query cache can satisfy recent-usage heuristics.
  - Do not let default-category changes overwrite user-entered title or user-selected category after interaction.
  - Do not turn quick-add preference persistence into a broad settings refactor.

## Interfaces & Dependencies

- Internal API/runtime dependencies:
  - `GET /api/v1/users/me` and `PATCH /api/v1/users/me` (or additive equivalent under current profile route) for reading/writing durable source preference.
  - Existing expense list/query hooks for recent-usage heuristic input.
  - Existing expense create mutation for successful-save preference updates.
- Candidate additive contract fields:
  - `UserProfileDTO.quickAddLastSourceKey?: string | null`
  - `UpdateCurrentProfileRequest.quickAddLastSourceKey?: string | null`
  - If a nested DTO is cleaner during implementation, document and apply consistently without breaking current consumers.
- Layer impact check using `Types -> Config -> Repo -> Service -> Runtime -> UI`:
  - `Types`: extend shared profile DTO/request types and any helper heuristic input types.
  - `Config`: no config changes expected.
  - `Repo`: add storage read/write path for quick-add source preference.
  - `Service`: existing profile handlers and expense-query logic orchestrate reads/writes.
  - `Runtime`: web profile hooks and quick-add bootstrap logic consume additive contract fields.
  - `UI`: quick-add dialog uses restored source and computed category default.
- Hard dependency rule checks from `ARCHITECTURE.md`:
  - lower layers remain independent of UI.
  - UI continues to go through hooks/API only.
  - persistence enters through repository boundaries only.
  - no new dependency should be introduced unless existing stack cannot support scoped implementation; if needed, record justification before proceeding.

## Plan of Work (Narrative)

1. **Finalize narrow persistence shape for source preference.** Inspect current profile DTOs and repository fields, then add one additive persistence field for quick-add source preference using the smallest safe schema change. Prefer an additive field exposed through the current `/users/me` contract over a brand-new settings subsystem.

2. **Add backend persistence and validation first.** Create a migration for the preference field or dedicated preference storage, update worker profile contracts, repository reads/writes, and profile handlers so authenticated users can read and update their quick-add source preference safely. Add endpoint coverage for happy path, validation failure, and unauthorized access.

3. **Add frontend consumption of durable source preference.** Extend profile types/API/hooks so quick-add can bootstrap from persisted `quickAddLastSourceKey`. Replace current session-only bootstrap/write path in `quick-add-expense-dialog.tsx` so successful quick-add saves update the durable preference.

4. **Implement deterministic category heuristics in quick-add.** Use existing recent expense query data to compute a likely category default when the dialog opens. Start with a simple, documented rule order: same source most recent category first, otherwise overall most recent category, otherwise no default. Apply the default only before user interaction and never overwrite explicit user edits.

5. **Guard form side effects and reset behavior.** Update `use-expense-form.ts` only if needed so default category/title logic stays predictable. Verify that smart defaults do not cause unwanted title rewrites or category resets after manual changes.

6. **Add focused regression coverage.** Expand worker tests for additive profile preference persistence and web tests for quick-add source restoration, heuristic category prefilling, no-match fallback, and user-override protection.

7. **Close with full verification and harness evidence.** Run scoped worker/web verification, then `./init.sh`, then update harness state, progress log, and plan status evidence.

## Concrete Steps (Commands)

Run from repo root unless noted otherwise.

```bash
# Baseline verification before implementation
./init.sh

# Worker-focused loop for preference contract and persistence
pnpm --filter worker test -- profile
pnpm --filter worker test -- expense

# Web-focused loop for quick-add smart defaults
pnpm --filter web test -- quick-add-expense-dialog
pnpm --filter web typecheck
pnpm --filter web lint

# Final full verification
./init.sh
```

Expected short outputs to compare against:

- `pnpm --filter worker test -- profile` and related worker suites end with `0 failed` and include new preference coverage.
- `pnpm --filter web test -- quick-add-expense-dialog` ends with `0 failed` and includes durable source + heuristic default tests.
- `pnpm --filter web lint` and `pnpm --filter web typecheck` exit successfully with no errors.
- `./init.sh` completes with lint, type-check, tests, and build succeeding.

## Validation and Acceptance

- Happy path:
  - User opens quick-add after previously saving with source `cash`; dialog defaults source to `cash` after reload/new session.
  - User opens quick-add and sees category prefilled from deterministic recent-usage rule when a safe match exists.
  - User saves quick-add successfully; next open reflects updated durable source preference.
- Validation/error paths:
  - Invalid preference write body returns `400` and does not corrupt user profile.
  - If quick-add cannot determine safe category default, category remains unset.
  - If profile preference fetch/write fails, quick-add still opens and save flow remains usable with graceful fallback.
- Unauthorized/forbidden:
  - Unauthenticated profile read/write stays `401`.
  - Quick-add source persistence must not allow writing another user's preference.
- Regression checks:
  - Undo flow from `feat-024` still works.
  - User-selected category is not overwritten after manual interaction.
  - Existing profile settings UI still loads and updates without contract breakage.
- Acceptance artifact minimum:
  - worker test output proving preference persistence paths.
  - web test output proving durable source restore and category heuristic behavior.
  - final `./init.sh` transcript.

## Idempotence & Recovery

- Most steps are safe to re-run.
- Migration must be additive and reversible according to current migration conventions.
- If migration causes local data issues during development, back up D1 local state before rollback using current repo migration workflow, then restore and rerun tests.
- If heuristic logic proves noisy during implementation, revert to “no category default” rather than shipping low-confidence guessing.

## Artifacts and Notes

- Evidence to capture in plan updates and harness:
  - new migration filename
  - worker test names and output summary
  - web test names and output summary
  - final `./init.sh` summary
- Keep any temporary compatibility note short and remove it before marking feature done if no longer needed.
