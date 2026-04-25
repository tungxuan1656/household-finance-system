# feat-011: Household CRUD + household pages (no active household global)

## Purpose / Big Picture

Ship a complete household CRUD foundation for MVP without introducing a global active-household state. Users can create households, view household list/detail pages, edit/archive households, and navigate to household management from the shell.

## Scope

- In scope:
  - Worker endpoints:
    - `POST /api/v1/households`
    - `GET /api/v1/households`
    - `GET /api/v1/households/:id`
    - `PATCH /api/v1/households/:id`
    - `DELETE /api/v1/households/:id` (soft archive)
  - Membership-aware access and admin-only update/archive behavior.
  - Web pages:
    - `/households`
    - `/households/:id`
    - `/more` with household navigation link.
  - Single `household.store` for household domain state.
  - Removal of active-household store/context/switcher and `X-Household-Id` header injection.
  - Placeholder members table and invite/remove UI stubs in household detail page with TODO notes.
- Out of scope:
  - Real members/invite/remove APIs and full member management flow.
  - Forced global active-household behavior.
  - New DB migrations.

## Non-negotiable Requirements

- Keep backend boundaries: route -> handler -> repository.
- Return only non-archived households in list/detail flows.
- Return `404` for inaccessible household ids and non-admin update/archive requests.
- Keep all user-facing copy i18n-backed.
- Keep household frontend domain on one zustand store (`household.store`) only.

## Progress

- [x] Extend worker contracts/repository/handlers/routes for `PATCH` + `DELETE`.
- [x] Remove obsolete `X-Household-Id` CORS/header assumptions.
- [x] Add worker tests for update/archive happy/error/authorization scenarios.
- [x] Remove active-household store/context/switcher and hook dependencies from web.
- [x] Add `/households`, `/households/:id`, and `/more` pages wired to `household.store`.
- [x] Add member-table placeholder and TODO markers for follow-up members feature.
- [x] Update i18n navigation/page copy for household pages.
- [x] Run full verification and update harness/docs artifacts.

## Surprises & Discoveries

- GitNexus index for this repository remains unavailable in this environment:
  - MCP repo lookup did not return `household-finance-system`.
  - Earlier CLI analyze attempt failed with `Cannot destructure property 'package' of 'node.target' as it is null`.

## Outcomes & Retrospective

- Feature scope now aligns with the no-active-household product direction.
- Household CRUD works end-to-end (create/read/update/archive) with authorization checks.
- Household list/detail pages exist and are wired to a single zustand domain store.
- Members UI is scaffolded for follow-up feature work without introducing premature backend scope.

## Validation and Acceptance

Run from repo root:

```bash
pnpm typecheck:worker
pnpm test:worker
pnpm typecheck:web
pnpm test:web
pnpm build:web
./init.sh
```

All commands passed on 2026-04-25.
