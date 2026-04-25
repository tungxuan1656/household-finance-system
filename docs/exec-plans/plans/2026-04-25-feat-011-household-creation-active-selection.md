# feat-011: Household creation and active household selection

## Purpose / Big Picture

Deliver the first complete household foundation so authenticated users can create a household, view households they belong to, and switch an active household context in the web app. This unlocks downstream household-scoped features by making the active household available in persisted frontend state and request headers.

## Scope

- In scope:
  - Worker endpoints:
    - `POST /api/v1/households`
    - `GET /api/v1/households`
    - `GET /api/v1/households/:id`
  - Worker contracts/handlers/repository for household create/list/get logic.
  - Web onboarding form wired to household create mutation.
  - Web household query/mutation hooks.
  - Web active household persisted store + context provider.
  - Web shell household switcher UI.
  - API client request header enrichment with `X-Household-Id`.
  - Tests and harness evidence updates.
- Out of scope:
  - Household settings/archive (`feat-012`)
  - Invitations/membership actions (`feat-013`, `feat-014`)
  - Forced onboarding redirect policy
  - New DB migrations

## Non-negotiable Requirements

- Backend uses route -> handler -> repository boundaries.
- Household create inserts both household and creator membership (`admin`, `active`) in one batch.
- `GET /households/:id` returns `404` when caller is not an active member.
- Frontend active household id is persisted and repaired when stale.
- User-facing text remains i18n-backed.

## Progress

- [x] Add worker household contracts, repository, handlers, and routes.
- [x] Register worker route and allow `X-Household-Id` CORS header.
- [x] Add worker integration and unit tests for household contracts and endpoints.
- [x] Add web household types, API module, and React Query hooks.
- [x] Add active household zustand store + tests.
- [x] Add household context provider and shell switcher component.
- [x] Replace onboarding placeholder with create-household form flow.
- [x] Add API client `X-Household-Id` injection based on active household state.
- [x] Run full verification and update harness artifacts.

## Surprises & Discoveries

- GitNexus index for this repository was unavailable in this environment:
  - MCP did not list `household-finance-system`.
  - `npx gitnexus analyze` failed with `Cannot destructure property 'package' of 'node.target' as it is null`.

## Decision Log

- Decision: Keep create-household default timezone as `UTC`.
  Rationale: `feat-011` scope excludes settings editing/timezone configuration.
  Date/Author: 2026-04-25 / Codex

- Decision: Return `404` for non-member access to household detail.
  Rationale: Prevents leaking existence of other households while keeping API behavior predictable.
  Date/Author: 2026-04-25 / Codex

## Outcomes & Retrospective

- `feat-011` is implemented end-to-end with backend and frontend coverage.
- Verification gates passed for worker/web and repo-level init harness.
- Active household context is now persisted and available for downstream household-scoped requests.

## Context and Orientation

- Worker entry/router: `apps/worker/src/index.ts`
- Worker household route: `apps/worker/src/routes/households.ts`
- Web onboarding page: `apps/web/src/pages/app/onboarding-page.tsx`
- Web household context/store: `apps/web/src/components/layouts/household-context-provider.tsx`, `apps/web/src/stores/active-household.store.ts`

## Plan of Work (Narrative)

1. Add household API contracts and validation schema for create payload and detail route params.
2. Implement repository logic for:
   - household creation with unique slug generation and creator membership bootstrap.
   - household list by active membership.
   - household detail by user+household membership.
3. Implement handlers/routes and register route in worker.
4. Add/extend worker tests for create/list/get and auth/validation/not-found cases.
5. Implement web household data layer (types + API + query hooks).
6. Implement active household persist store and provider fallback behavior.
7. Integrate switcher UI into shell and wire onboarding create form to real mutation.
8. Add request header propagation for active household and verify all checks.

## Concrete Steps (Commands)

Run from repo root:

```bash
pnpm typecheck:worker
pnpm test:worker
pnpm typecheck:web
pnpm test:web
pnpm build:web
./init.sh
```

## Validation and Acceptance

- Backend acceptance:
  - Create household returns `201` and household DTO with `admin` role.
  - List returns caller households.
  - Detail returns household for member and `404` for non-member.
  - Invalid payload returns `400`, missing auth returns `401`.
- Frontend acceptance:
  - Onboarding creates household via API mutation.
  - Household switcher lists households and changes active household.
  - Active household persists and auto-recovers from stale id.
  - Request client attaches `X-Household-Id` when active household exists.

## Idempotence & Recovery

- Verification commands are safe to re-run.
- Feature does not run schema migrations.
- Household create uses batch writes to avoid partial persisted state.

## Artifacts and Notes

- Evidence:
  - `pnpm typecheck:worker` passed
  - `pnpm test:worker` passed (91 tests)
  - `pnpm typecheck:web` passed
  - `pnpm test:web` passed (32 tests)
  - `pnpm build:web` passed
  - `./init.sh` passed

## Interfaces & Dependencies

- New worker contracts:
  - `CreateHouseholdRequest`
  - `HouseholdDTO`
  - `ListHouseholdsResponse`
- New frontend contracts:
  - `HouseholdDTO`
  - `CreateHouseholdRequest`
  - `ListHouseholdsResponse`
- Internal dependencies:
  - Zustand persist store for active household context
  - React Query hooks for household create/list/get
