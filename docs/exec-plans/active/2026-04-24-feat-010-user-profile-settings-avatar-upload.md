## Title

Implement `feat-010` profile settings with `/users/me`, display-name update, and avatar upload (crop + compress) via Firebase Storage.

## Purpose / Big Picture

This feature replaces the current settings placeholder with a real Profile Settings flow where authenticated users can view and update their profile. Users can update display name and avatar from the web app; avatar files are cropped to square and compressed client-side before upload to Firebase Storage, then persisted as `avatarUrl` in backend profile data. The backend profile contract is aligned to `/api/v1/users/me` and returns consistent profile fields (`id`, `email`, `displayName`, `avatarUrl`, `createdAt`) so frontend state and subsequent features can rely on a stable identity surface.

## Scope

- Files, modules, and areas that will be changed (list repo-relative paths).
  - `apps/worker/src/routes/profile.ts` (rename route shape from `/profile` to `/users/me`)
  - `apps/worker/src/handlers/profile/get-current-profile.ts`
  - `apps/worker/src/handlers/profile/update-current-profile.ts`
  - `apps/worker/src/contracts/profile.ts`
  - `apps/worker/src/db/repositories/user-repository.ts`
  - `apps/worker/test/index.spec.ts`
  - `apps/worker/test/unit/dto-profile.spec.ts`
  - `apps/web/src/main.tsx` (QueryClient provider wiring)
  - `apps/web/src/router.tsx` (replace settings placeholder route)
  - `apps/web/src/api/endpoints.ts`
  - `apps/web/src/api/profile.ts` (new)
  - `apps/web/src/hooks/api/use-profile.ts` (new)
  - `apps/web/src/types/profile.ts` (new)
  - `apps/web/src/lib/forms/profile.schema.ts` (new)
  - `apps/web/src/lib/firebase/storage.ts` (new)
  - `apps/web/src/lib/images/avatar-image.ts` (new crop/compress helpers)
  - `apps/web/src/pages/app/profile-settings-page.tsx` (new)
  - `apps/web/src/components/profile/*` (new profile settings components)
  - `apps/web/src/lib/i18n/locales/vi.json`
  - `apps/web/src/stores/auth.store.ts` (sync user profile after successful mutation)
  - `apps/web/src/stores/auth.store.test.tsx`
  - `apps/web/src/app.test.tsx` and targeted profile tests (new)
  - `docs/exec-plans/active/index.md`
  - `harness/features/feat-010.json`, `harness/progress.md`
- What is explicitly out of scope.
  - Identity provider linking/unlinking.
  - Household membership overview in profile.
  - Server-side image processing pipeline.
  - Deleting old avatar files from Firebase Storage.

## Non-negotiable Requirements

- The plan must be self-contained (include definitions and commands needed to complete it).
- The plan must produce observable behaviour or tests demonstrating success.
- Every technical term must be defined in-place.
- Backend route contract for this feature uses `GET/PATCH /api/v1/users/me` (strict replace; no `/api/v1/profile` compatibility path retained).
- Image workflow: square crop + lossy compression must run before upload.
- Frontend user-facing strings and validation messages must use i18n keys.
- API envelope/error handling remains the standardized `{ success, data, error, meta }` shape from `feat-033`.

## Progress

- [x] (2026-04-24) Confirm next pending feature is `feat-010` from `harness/feature_index.json`.
- [x] (2026-04-24) Confirm implementation direction with user: strict replace to `/users/me`.
- [x] (2026-04-24) Expand feature intent with user to include avatar upload + compression + square crop.
- [ ] (2026-04-24) Implement worker route/contract/repository updates for `/users/me` + `createdAt`.
- [ ] (2026-04-24) Implement web profile settings page, RHF form, and React Query profile hooks.
- [ ] (2026-04-24) Implement avatar crop + compress + Firebase Storage upload + backend persistence.
- [ ] (2026-04-24) Add/update worker and web tests for happy path and failures.
- [ ] (2026-04-24) Run full verification (`./init.sh`) and collect evidence.
- [ ] (2026-04-24) Update harness feature/progress records with evidence.

## Surprises & Discoveries

- Discovery: worker currently already has profile logic but under `/api/v1/profile`; route migration is primarily contract alignment rather than greenfield endpoint creation.
  - Evidence: `apps/worker/src/routes/profile.ts`, `apps/worker/test/index.spec.ts`.
- Discovery: `feat-010` harness description currently excludes avatar changes and references old `/users/me` contract details without current code alignment.
  - Evidence: `harness/features/feat-010.json`.
- Discovery: web workspace has `@tanstack/react-query` installed but no `QueryClientProvider` wiring in `apps/web/src/main.tsx` yet.
  - Evidence: dependency exists in `apps/web/package.json`; no `QueryClient` references in `apps/web/src`.

## Decision Log

- Decision: Replace `/api/v1/profile` with `/api/v1/users/me` now (strict replace), instead of temporary dual support.
  Rationale: matches feature contract, avoids long-term duplicate endpoint maintenance, and no external/public compatibility requirement is documented for this internal MVP stage.
  Date/Author: 2026-04-24 / Codex + User

- Decision: Keep avatar URL persistence in backend profile update, but perform crop/compress/upload entirely in frontend.
  Rationale: fastest path with current architecture and Firebase SDK availability in web app; avoids adding binary upload surface to worker.
  Date/Author: 2026-04-24 / Codex

- Decision: Implement square crop in this feature (not deferred).
  Rationale: user requested “if easy then do now”; canvas-based square crop is low complexity and keeps avatar presentation quality consistent.
  Date/Author: 2026-04-24 / Codex + User

## Outcomes & Retrospective

- To be filled after implementation completes.

## Context and Orientation

- Worker runtime entry and route registration: `apps/worker/src/index.ts`.
- Current profile API route and handlers: `apps/worker/src/routes/profile.ts`, `apps/worker/src/handlers/profile/*`.
- User repository and DB mapping: `apps/worker/src/db/repositories/user-repository.ts`.
- Worker integration tests: `apps/worker/test/index.spec.ts`.
- Web router and current settings placeholder: `apps/web/src/router.tsx`.
- Web auth session/user state: `apps/web/src/stores/auth.store.ts`.
- Web API client and endpoints: `apps/web/src/api/client.ts`, `apps/web/src/api/endpoints.ts`.
- Shadcn form primitives and styling/composition rules: `.agents/skills/shadcn/rules/*`.

## Plan of Work (Narrative)

1. **Align backend route contract to `/users/me`**
   - Update `apps/worker/src/routes/profile.ts` so auth-protected profile operations live at `GET/PATCH /users/me`.
   - Keep route->handler boundary unchanged; only contract path/shape changes.

2. **Adjust profile contract and repository mapping**
   - Update profile response type to include `createdAt` (mapped from DB `created_at`).
   - Update update request schema to validate `displayName` with trim, non-empty, and max 100 characters.
   - Keep `avatarUrl` updatable for this expanded feature.

3. **Update worker tests to enforce new contract**
   - Replace `/profile` integration test paths with `/users/me`.
   - Add/adjust assertions for `createdAt` and display-name max-length validation.
   - Preserve existing unauthorized and invalid input behavior assertions.

4. **Add web profile domain types + API + React Query hooks**
   - Add profile DTO/request types and API methods (`getCurrentUserProfile`, `updateCurrentUserProfile`).
   - Add profile query keys and hooks for read/mutation with optimistic update and rollback.
   - Wire `QueryClientProvider` in `apps/web/src/main.tsx`.

5. **Build Profile Settings UI replacing placeholder**
   - Add `ProfileSettingsPage` and route it at `/app/settings`.
   - Use shadcn form composition (`FieldGroup`, `Field`, `FieldLabel`, `FieldError`) with RHF + zod schema.
   - Keep all user-facing text in i18n keys.

6. **Implement avatar image pipeline (frontend)**
   - Add image helpers using browser canvas:
     - Read selected file.
     - Crop to square (center-crop in crop UI workflow).
     - Compress to JPEG/WebP with defined quality + max dimension.
   - Upload compressed blob to Firebase Storage path namespaced by user id.
   - Get download URL and include `avatarUrl` in profile patch mutation.

7. **Sync auth user state after profile mutation**
   - On successful mutation, update auth store user snapshot so overview/nav surfaces instantly reflect changes.

8. **Verification, evidence, and harness updates**
   - Run targeted tests first, then full `./init.sh`.
   - Record evidence in feature/harness progress artifacts.

## Concrete Steps (Commands)

Run from repo root unless noted.

```bash
# 1) Baseline verify before implementation
./init.sh

# 2) Worker-focused verification while implementing backend changes
pnpm test:worker
pnpm typecheck:worker

# 3) Web-focused verification while implementing UI/upload flow
pnpm test:web
pnpm typecheck:web
pnpm build:web

# 4) Full workspace verification gate
./init.sh
```

Expected short transcript outputs:

- `pnpm test:worker` -> `Test Files ... passed`
- `pnpm test:web` -> `Test Files ... passed`
- `pnpm build:web` -> `vite v... building for production...` then `built in ...`
- `./init.sh` -> all steps pass, exit code `0`

## Validation and Acceptance

- **Backend happy path**
  - `GET /api/v1/users/me` with valid bearer token returns `200` and envelope success with `id`, `email`, `displayName`, `avatarUrl`, `createdAt`.
  - `PATCH /api/v1/users/me` with valid `displayName` updates DB and returns updated payload.

- **Backend validation/error path**
  - `PATCH` with blank or whitespace-only `displayName` returns `400 INVALID_INPUT`.
  - `PATCH` with `displayName` length > 100 returns `400 INVALID_INPUT`.
  - `GET/PATCH` without bearer token returns `401 UNAUTHENTICATED`.

- **Frontend profile flow**
  - `/app/settings` renders profile settings page (no placeholder).
  - Editing display name submits and updates UI without page reload.
  - API failure surfaces inline error and restores previous optimistic value.

- **Frontend avatar flow**
  - Selecting image opens crop flow and enforces square avatar result.
  - Upload uses compressed output blob (smaller than uncompressed original in typical large-image cases).
  - On successful upload + patch, avatar preview and auth user state update immediately.
  - Upload/patch failures show clear inline or toast feedback and do not leave UI in inconsistent state.

## Idempotence & Recovery

- Code/test commands are safe to re-run.
- No schema migration is required for this feature.
- If avatar upload succeeds but profile PATCH fails:
  - UI keeps previous avatar and shows save failure.
  - The uploaded file may remain orphaned in storage; this is accepted in scope and documented for later cleanup enhancement.
- Rollback strategy for code changes: revert feature branch commits if needed.

## Artifacts and Notes

- Acceptance artifacts to attach in progress/harness evidence:
  - Worker test output snippets covering `/users/me`.
  - Web test output for profile settings + avatar flow.
  - Full `./init.sh` success output.
  - Short screenshot(s) or test assertions showing settings page and updated avatar.

### Implementation Notes

- Scope-specific references to enforce during implementation:
  - Frontend: `docs/references/frontend/project-folder-structure.md`, `component-structure-pattern.md`, `naming-and-conventions-pattern.md`, `form-pattern.md`, `api-react-query-pattern.md`, `i18n-label-pattern.md`.
  - Backend: `docs/references/backend/architecture-and-boundaries.md`, `api-contract-and-validation.md`, `error-handling-pattern.md`, `security-and-auth-pattern.md`, `testing-pattern.md`, `database-pattern.md`.
  - Shared: `docs/references/shared/type-naming-pattern.md`.
  - UI governance: `.agents/skills/shadcn/SKILL.md` and `rules/styling.md`, `rules/forms.md`, `rules/composition.md`.

- Companion implementation skills:
  - `frontend-patterns`, `backend-patterns`, `security-reviewer`, `typescript-reviewer`, `verification-loop`.

- Common pitfalls to avoid:
  - Hardcoded strings in settings UI or zod errors.
  - Direct UI calls to API without hook layer.
  - Leaving `/profile` route references in tests or endpoint constants.
  - Forgetting to sync auth store user after profile mutation success.

## Interfaces & Dependencies

- Internal interfaces:
  - Worker profile contract (request/response types in `apps/worker/src/contracts/profile.ts`).
  - Web profile types/API contracts in `apps/web/src/types/profile.ts` and API module.
  - Auth store action surface for user snapshot updates.

- External dependencies/services:
  - Firebase Auth (already in use) for authenticated user context.
  - Firebase Storage (web SDK) for avatar object upload and public download URL retrieval.

- Planned API contract (feature-level):
  - `GET /api/v1/users/me -> ApiEnvelope<ProfileResponse>`
  - `PATCH /api/v1/users/me` body `UpdateProfileRequest` -> `ApiEnvelope<ProfileResponse>`

