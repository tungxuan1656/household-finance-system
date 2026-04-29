# feat-013: Household invitations (token invite flow)

## Purpose / Big Picture

Implement the first production-ready household invitation flow so admins can invite new members by link and recipients can safely join through a tokenized accept flow. After this feature, the system supports creating single-use invitations with bounded TTL, validating invitation links publicly, and accepting invitations in an authenticated flow that assigns the invited role. Users will observe this through a working Invite Members panel in household detail and a dedicated accept-invite page at `/invitations/{token}`.

## Scope

- In scope:
  - Backend invitation APIs:
    - `POST /api/v1/households/:id/invitations`
    - `GET /api/v1/invitations/:token`
    - `POST /api/v1/invitations/:token/accept`
  - New invitation persistence model with dedicated invitation table and indexes.
  - Permission enforcement using existing explicit household membership middleware/policy infra from `feat-015a`.
  - Invitation token lifecycle:
    - single-use
    - TTL presets
    - role target (`member` or `admin`)
  - Web invitation UX:
    - Enable Invite action in household detail page.
    - Add invite panel + copy link flow.
    - Add accept invite route/page (`/invitations/[token]`) with auth-gated acceptance.
    - Redirect unauthenticated users to sign-in and return to the same invite link.
  - i18n updates for new UI and backend validation/error messages.
  - Worker + web test coverage for happy path and critical failures.
  - Harness/progress updates for planning session.
- Out of scope:
  - Invitation revocation endpoint (`DELETE /households/:id/invitations/:invitationId`) in `feat-014`.
  - Full member management UX/actions (`feat-014`, `feat-015b`).
  - Email delivery channel for invites.
  - Rate-limit implementation (defer, but track in tech debt).

## Non-negotiable Requirements

- Keep architecture boundaries: route -> middleware -> handler -> repository.
- No SQL in routes.
- Keep API envelope contract unchanged (`success/data/error/meta`).
- Enforce explicit household selection; no global active-household assumptions.
- Invitation storage must be in a dedicated invitations table, not overloaded into `household_memberships` state.
- Secret/token material must not be logged.
- Web UI in `apps/web` must follow shadcn-first composition and mandatory form/composition rules.
- All user-facing copy and backend validation/error messages must be i18n-backed.

## Context and Orientation

- Existing permission/membership resolution:
  - `apps/worker/src/middlewares/household-membership.ts`
  - `apps/worker/src/lib/permissions/household-policy.ts`
- Existing household domain:
  - `apps/worker/src/routes/households.ts`
  - `apps/worker/src/db/repositories/household-repository.ts`
  - `apps/web/src/views/app/household-detail-page.tsx`
- Existing auth flow and protected/public routing:
  - `apps/web/src/components/layouts/protected-route.tsx`
  - `apps/web/src/views/auth/sign-in-page.tsx`
- Relevant specs:
  - `docs/product-specs/household-invitation.md`
  - `harness/features/feat-013.json`

## Open Decisions

- None blocking implementation.

## Decision Log

- Decision: Use dedicated invitation table.
  Rationale: Clean lifecycle separation (issued/expired/used) and straightforward compatibility with `feat-014` revoke endpoint.
  Date/Author: 2026-04-29 / user + Codex

- Decision: Accept flow requires authentication and must preserve return path from sign-in back to `/invitations/{token}`.
  Rationale: Matches product intent and avoids broken deep-link onboarding.
  Date/Author: 2026-04-29 / user + Codex

- Decision: Support invited role `member|admin` and TTL presets `24h|72h|7d`, default `72h`.
  Rationale: Balances safety, usability, and low-validation complexity.
  Date/Author: 2026-04-29 / user + Codex

- Decision: Error mapping for token issues is `404` for invalid token and `409` for expired/used/already-member.
  Rationale: Preserves actionable UX while keeping contract simple.
  Date/Author: 2026-04-29 / user + Codex

- Decision: Implement audit events for invitation create/accept now; defer rate-limit.
  Rationale: Audit is immediately valuable and low risk; rate-limit requires broader infrastructure.
  Date/Author: 2026-04-29 / user + Codex

- Decision: On successful accept, redirect to joined household detail `/households/{id}`.
  Rationale: Gives immediate contextual landing and next actions.
  Date/Author: 2026-04-29 / user + Codex

## Implementation Notes

- Required backend standards:
  - `docs/references/backend/architecture-and-boundaries.md`
  - `docs/references/backend/api-contract-and-validation.md`
  - `docs/references/backend/error-handling-pattern.md`
  - `docs/references/backend/security-and-auth-pattern.md`
  - `docs/references/backend/testing-pattern.md`
  - `docs/references/backend/database-pattern.md`
  - `docs/references/backend/cloudflare-workers.md`
- Required frontend standards:
  - `docs/references/frontend/project-folder-structure.md`
  - `docs/references/frontend/component-structure-pattern.md`
  - `docs/references/frontend/naming-and-conventions-pattern.md`
  - `docs/references/frontend/form-pattern.md`
  - `docs/references/frontend/dialog-and-form-pattern.md`
  - `docs/references/frontend/api-react-query-pattern.md`
  - `docs/references/frontend/zustand-store-pattern.md`
  - `docs/references/frontend/i18n-label-pattern.md`
  - `docs/design-docs/shadcn-first-ui-web-guide.md`
- Required shared standards:
  - `docs/references/shared/type-naming-pattern.md`
- Companion skills for implementation phase:
  - `test-driven-development`
  - `backend-patterns`
  - `frontend-patterns`
  - `security-reviewer`
  - `verification-before-completion`

## Plan of Work (Narrative)

1. Add invitation data model and repository layer in worker.
   - Add migration for `household_invitations` table with columns for:
     - `id`, `household_id`, `token_hash`, `invited_role`, `expires_at`, `used_at`, `used_by_user_id`, `created_by_user_id`, `created_at`, `updated_at`.
   - Add indexes for token lookup and active invite scans.
   - Add repository functions for create, lookup by token hash, and consume-once update.

2. Add worker contracts/validation for invitation endpoints.
   - Define request/response DTOs and param schemas for invitation create/validate/accept.
   - Enforce TTL preset validation to only allow `24h|72h|7d`.
   - Enforce role validation to only allow `member|admin`.

3. Implement backend routes and handlers.
   - `POST /households/:id/invitations`:
     - requires auth + membership resolution + invite permission (admin-only default).
     - generate opaque token, store token hash, return invite metadata + invite URL path.
   - `GET /invitations/:token`:
     - public endpoint, validates token state and returns household preview + role + expiry info.
   - `POST /invitations/:token/accept`:
     - requires auth.
     - validates token state and membership preconditions.
     - adds/activates caller membership with invited role.
     - marks invite used atomically and writes audit log event.

4. Wire web API layer and hooks/stores for invitations.
   - Add endpoints in `API_ENDPOINTS` and typed API functions.
   - Add query/mutation hooks with stable query keys and proper invalidation.

5. Implement Invite Members panel in household detail page.
   - Replace disabled invite placeholder with working action.
   - Provide UI controls for role + TTL preset and copy-link result.
   - Keep shadcn-first composition and i18n-only labels.

6. Implement accept invite page route.
   - Add route in Next App Router at `/invitations/[token]`.
   - Fetch invitation preview on page load.
   - If unauthenticated, redirect to sign-in and preserve return path to current invite URL.
   - After sign-in, return and allow acceptance.
   - On success, redirect to `/households/{id}`.

7. Add/extend tests.
   - Worker integration tests:
     - create invite success, auth/permission failures, invalid input.
     - validate invite success + invalid/expired/used cases.
     - accept invite success + already-member conflict.
   - Web tests:
     - invite panel render/submit/copy behavior.
     - accept page auth gate and success redirect.

8. Update harness artifacts on completion.
   - `harness/features/feat-013.json` evidence + final status.
   - `harness/feature_index.json` status sync.
   - `harness/progress.md` session summaries and verification evidence.

## Concrete Steps (Commands)

Run from repo root unless specified:

```bash
# Baseline verification before implementation changes
./init.sh

# Worker-focused verification during development
pnpm lint:worker
pnpm typecheck:worker
pnpm test:worker

# Web-focused verification during development
pnpm lint:web
pnpm typecheck:web
pnpm test:web
pnpm build:web

# Final full-workspace verification
./init.sh
```

Expected short outputs:

```text
Linting: OK
Type checking: OK
Running tests: OK
Init Done
```

## Validation and Acceptance

- Backend happy path:
  - admin can create invite with role and TTL preset.
  - public token validation returns household preview for active token.
  - authenticated recipient can accept and becomes active member with invited role.
- Backend failure paths:
  - non-admin invite creation returns `403 FORBIDDEN`.
  - invalid token returns `404 NOT_FOUND`.
  - expired/used token returns `409 CONFLICT`.
  - accept by already-active member returns `409 CONFLICT`.
  - unauthenticated accept returns `401 UNAUTHENTICATED`.
- Frontend behavior:
  - invite panel allows choosing role and TTL preset, then copying invite link.
  - visiting `/invitations/{token}` shows preview/error state correctly.
  - unauthenticated user is redirected to sign-in and returned to same invite URL.
  - successful accept redirects to `/households/{id}`.
- Acceptance artifacts:
  - worker integration test assertions for all status branches.
  - web test assertions for invite panel and accept page flow.
  - successful final `./init.sh` transcript.

## Risks and Blockers

- Atomic consume-once semantics are critical; race conditions could allow double acceptance if not guarded.
- New migration and seed/test fixtures must remain deterministic across repeated local runs.
- Return-path auth flow requires careful handling in Next routing to avoid redirect loops.
- Rate-limit remains deferred and must be tracked to avoid abuse risk in production.

## Idempotence & Recovery

- Verification commands are safe to rerun.
- Migration changes are one-way; use standard D1 local migration workflow and reinitialize local DB state if needed.
- If acceptance flow breaks auth navigation, rollback to previous protected/public route behavior and reintroduce return-path changes incrementally.

## Artifacts and Notes

- Public route contract added in this feature:
  - Web page: `/invitations/{token}`
  - API routes under `/api/v1/invitations/*`
- Invitation link format returned and copied in UI should align with `/invitations/{token}`.
- Add tech debt entry for invite creation rate-limit deferral with trigger at feature hardening/release prep.

## Interfaces & Dependencies

- API contract additions:
  - CreateInvitationRequest / CreateInvitationResponse
  - InvitationPreviewResponse
  - AcceptInvitationResponse
- Internal dependencies:
  - worker auth/membership middleware + household permission policy.
  - worker repository + migrations.
  - web API client + query hooks + household detail and invitation page views.
- External dependencies:
  - none new planned unless secure token helper library is required; if added, must be justified before implementation.

## Progress

- [x] (2026-04-29) Gathered feature intent and repository constraints from AGENTS/docs/spec/harness context.
- [x] (2026-04-29) Closed all blocking decisions with user (model, auth return flow, role/TTL presets, status mapping, link route, post-accept redirect).
- [x] (2026-04-29) Authored ExecPlan for implementation.
- [ ] Execute implementation for `feat-013` according to this plan.
- [ ] Run verification path and capture evidence.
- [ ] Mark plan as completed in index and harness artifacts.

## Surprises & Discoveries

- Existing schema has no dedicated invitation table yet; introducing robust single-use token flow requires a migration in this feature.
- Current sign-in flow redirects to `/home` unconditionally; return-path support is required to satisfy invite deep-link behavior.
- Existing household detail page already contains invite placeholders/TODO markers that can be upgraded directly without route redesign.

## Outcomes & Retrospective

- Pending implementation.
