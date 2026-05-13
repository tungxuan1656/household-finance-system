# feat-014 + feat-015b: Household detail page — role-based UI & member management

## Purpose / Big Picture

Deliver the household detail page with proper role-based UI (admin vs member) and real member data from backend. Backend creates households with Vietnam-market defaults (VND currency, Asia/Ho_Chi_Minh timezone, household-share visibility) and exposes member management endpoints. Frontend renders read-only info for members and editable form + actions for admins.

## Scope

- In scope:
  - Fix `createHouseholdForUser` defaults: `timezone` → `Asia/Ho_Chi_Minh`, `default_visibility` → `household`
  - `GET /api/v1/households/:id/members` (admin + member): list household members
  - `DELETE /api/v1/households/:id/members/:userId` (admin-only): remove a member
  - `DELETE /api/v1/households/:id/members/me` (member self): leave household
  - HouseholdMemberDTO contract and repository methods
  - Frontend `HouseholdMemberDTO` type
  - Frontend store actions: `fetchHouseholdMembers`, `removeHouseholdMember`, `leaveHousehold`
  - `HouseholdSettingsCard`: read-only display for members, editable form for admins; no currency/timezone fields shown
  - `HouseholdMembersCard`: fetch real members, show trash icon (Lucide) for admin delete action only
  - `HouseholdDetailPage`: conditional rendering — admin sees Settings + Members + DangerZone; member sees Settings + Members only
  - `HouseholdDangerZoneCard`: admin-only, hidden for members
  - i18n: real member count string
  - Harness updates for `feat-014` and `feat-015b`
- Out of scope:
  - Promote/demote member role (deferred to future)
  - Revoke invitation endpoint (deferred to future)
  - `usePermission` hook / `PermissionGate` component (scope trimmed to household detail page only)
  - Audit log entries for member add/remove (deferred to audit feature)

## Non-negotiable Requirements

- Keep explicit-household resolution and role enforcement from `feat-015a`; no global active-household assumptions.
- Keep API envelope contract unchanged (`success/data/error/meta`).
- Backend defaults must be set at household creation time (not runtime fallback).
- Member leave is blocked for the last admin.
- All web copy i18n-backed; no hardcoded user-facing text.
- shadcn composition; follow `docs/design-docs/shadcn-card-composition-architecture-guide.md`.

## Progress

- [x] (2026-04-29) Sync docs/product-specs/household-management.md (Vietnam-market defaults)
- [x] (2026-04-29) Sync docs/product-specs/role-permission.md (member leave, trimmed matrix)
- [x] (2026-04-29) Update feat-014.json and feat-015b.json descriptions
- [x] (2026-04-29) Fix createHouseholdForUser defaults (timezone + visibility)
- [x] (2026-04-29) Add HouseholdMemberDTO contract + repository methods
- [x] (2026-04-29) Implement GET /households/:id/members endpoint
- [x] (2026-04-29) Implement DELETE /households/:id/members/:userId endpoint (admin)
- [x] (2026-04-29) Implement DELETE /households/:id/members/me endpoint (member self-leave)
- [x] (2026-04-29) Add frontend HouseholdMemberDTO type
- [x] (2026-04-29) Add store actions: fetchHouseholdMembers, removeHouseholdMember, leaveHousehold
- [x] (2026-04-29) Update HouseholdSettingsCard: read-only for members, editable for admins
- [x] (2026-04-29) Update HouseholdMembersCard: real data + trash icon for admin
- [x] (2026-04-29) Update HouseholdDetailPage: conditional rendering based on role
- [x] (2026-04-29) Run verification: `./init.sh`
- [x] (2026-04-29) Update harness artifacts + exec-plan index

## Decision Log

- Decision: Default currency = VND, timezone = Asia/Ho_Chi_Minh, defaultVisibility = household.
  Rationale: Vietnam-only MVP; no multi-currency/timezone support planned.
  Date/Author: 2026-04-29 / user

- Decision: Member can leave voluntarily; last admin is blocked from leaving.
  Rationale: Product decision per user request.
  Date/Author: 2026-04-29 / user

- Decision: Delete member button = trash icon only, no text label.
  Rationale: User request for compact table rows.
  Date/Author: 2026-04-29 / user

- Decision: No promote/demote endpoint in this phase.
  Rationale: Deferred to future feature; keep scope tight.
  Date/Author: 2026-04-29 / user

## Open Decisions

- None blocking for implementation.

## Context and Orientation

- Backend files:
  - `apps/worker/src/db/repositories/household-repository.ts` — createHouseholdForUser defaults
  - `apps/worker/src/db/repositories/household-membership-repository.ts` — list/remove/leave members
  - `apps/worker/src/contracts/household.ts` — HouseholdMemberDTO
  - `apps/worker/src/routes/households.ts` — new member endpoints
- Frontend files:
  - `apps/web/src/views/app/household-detail-page.tsx` — page orchestrator
  - `apps/web/src/components/household/household-settings-card.tsx` — read-only vs editable
  - `apps/web/src/components/household/household-members-card.tsx` — real data + actions
  - `apps/web/src/components/household/household-danger-zone-card.tsx` — admin-only
  - `apps/web/src/stores/household.store.ts` — member actions
  - `apps/web/src/types/household.ts` — HouseholdMemberDTO

## Implementation Notes

- Standards to enforce:
  - Backend: `docs/references/backend/*`
  - Frontend: `docs/references/frontend/*`, `docs/design-docs/shadcn-card-composition-architecture-guide.md`
- Companion skills: `test-driven-development`, `security-reviewer`, `backend-patterns`, `frontend-patterns`, `verification-before-completion`
- Pitfalls to avoid:
  - Do not reintroduce global active-household state.
  - Do not show currency/timezone fields in UI (MVP defaults only).
  - Do not show promote/demote actions.

## Concrete Steps

```bash
# Baseline
./init.sh

# Phase 1: Backend defaults
# Edit apps/worker/src/db/repositories/household-repository.ts lines 214-215

# Phase 2: Backend member API
# Add HouseholdMemberDTO to apps/worker/src/contracts/household.ts
# Add repository methods to apps/worker/src/db/repositories/household-membership-repository.ts
# Add routes/handlers in apps/worker/src/routes/households.ts

# Phase 3: Frontend types + store
# Add HouseholdMemberDTO to apps/web/src/types/household.ts
# Add store actions to apps/web/src/stores/household.store.ts

# Phase 4: Frontend components
# Update HouseholdSettingsCard, HouseholdMembersCard, HouseholdDetailPage

# Verification
./init.sh
```

## Validation and Acceptance

- Backend:
  - New household created via API has `defaultCurrencyCode: "VND"`, `timezone: "Asia/Ho_Chi_Minh"`, `defaultVisibility: "household"`
  - `GET /households/:id/members` returns member list for both admin and member callers
  - Admin can remove another member via `DELETE /households/:id/members/:userId`
  - Member can leave via `DELETE /households/:id/members/me`; last admin is blocked with `409`
  - Non-admin calling member removal gets `403 FORBIDDEN`
- Frontend:
  - Admin sees: settings form (editable name), members table with invite + delete trash icon, danger zone card
  - Member sees: read-only household name, members table (no actions), no danger zone
  - Trash icon only, no text label on delete button
  - `./init.sh` passes

## Risks and Blockers

- None identified at planning stage.

## Idempotence & Recovery

- Planned commands are safe to rerun.
- No migration/data backfill in scope.
- If store/state becomes inconsistent, page re-fetches from API on mount.

## Interfaces & Dependencies

- Public API shape changes:
  - `HouseholdDTO` unchanged (still has role field from caller context)
  - New `HouseholdMemberDTO` interface: `{ userId, name, email, role, joinedAt }`
  - New `ListHouseholdMembersResponse`: `{ items: HouseholdMemberDTO[] }`
  - New endpoints: `GET /households/:id/members`, `DELETE /households/:id/members/:userId`, `DELETE /households/:id/members/me`
- Internal dependencies:
  - Backend: D1 repositories, Hono routes, middleware (requireRole, resolveHouseholdMembership)
  - Frontend: zustand store, API client, page components
