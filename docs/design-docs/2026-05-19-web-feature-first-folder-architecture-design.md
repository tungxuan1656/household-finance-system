# Web Feature-First Folder Architecture Design

## Status

- Owner: Orchestrator
- Date: 2026-05-19
- Status: Proposed
- Update trigger: Any durable change to `apps/web/src` placement rules, page/view/component ownership, or feature naming conventions.

## Goal

Replace the current mixed layer-first web structure with a feature-first structure that keeps Next.js App Router thin, removes the ambiguous `views/` layer, and gives each business domain one obvious home.

## Why

- Current feature code is split across `app/`, `views/`, `components/<domain>`, `api/`, `hooks/`, and sometimes `types/`.
- `views/` and `components/<domain>` already overlap in responsibility, especially for overview, insights, and profile/settings surfaces.
- The repo now has stable business domains (`auth`, `households`, `expenses`, `budgets`, `groups`, `insights`, `invitations`, `onboarding`), so filesystem ownership should follow domains instead of mostly technical layers.
- Route naming and code naming drift (`home` vs `overview`, `settings` vs `profile`, `insights` vs `analytics`) slows navigation and increases placement ambiguity.

## Scope

In scope:

- Introduce `apps/web/src/features/` as the canonical home for domain-local web code.
- Keep `apps/web/src/app/` as thin Next.js route/layout glue only.
- Migrate route-level page orchestrators out of `views/` and into their owning feature folders.
- Merge domain-local components now split between `views/` and `components/<domain>`.
- Update frontend reference docs so the new structure becomes canonical.
- Update harness artifacts for the refactor session.

Out of scope:

- URL changes unless required by existing product behavior.
- Product redesign of the touched screens.
- Backend route/service/database changes.
- Rewriting stable shared primitives in `components/ui`.

## Current Problem Summary

Today the repo mixes these ideas:

- `app/` => route entry and layouts
- `views/` => route-level page orchestrators
- `components/<domain>` => feature UI

That split is no longer clean in practice:

- `views/app/overview/` contains domain sections for the home dashboard.
- `components/home/` also contains domain sections for the same surface.
- `views/app/profile-settings-page.tsx` and `components/profile/*` both belong to the settings/profile domain.
- `views/app/insights/` and `components/analytics/` describe the same domain with different names.

The result is a filesystem that makes one feature feel spread out instead of owned.

## Decision

Adopt feature-first structure for `apps/web/src`, with `app/` kept as thin route glue.

### Canonical target shape

```text
apps/web/src/
  app/                    # Next.js route tree only
  features/               # Domain-local web code
  components/
    ui/                   # shadcn primitives only
    shared/               # proven cross-feature reusable UI
    layouts/              # cross-feature layout components only
  api/                    # shared HTTP client/contracts only
  hooks/                  # shared hooks only
  stores/                 # shared global stores only
  lib/                    # runtime/domain helpers shared across features
  utils/                  # shared pure helpers
  types/                  # shared frontend types only
  test/                   # shared fixtures/helpers only
```

### Feature folder shape

```text
features/<domain>/
  components/
  hooks/
  api/
  pages/
  stores/
  types/
  utils/
  index.ts
```

Rules:

- `pages/` holds route-level orchestration components that route files render.
- `components/` holds feature-local smart and presentational UI.
- `api/`, `hooks/`, `stores/`, `types/`, and `utils/` stay inside the feature only when their ownership is local to that domain.
- Shared code gets promoted out only after real cross-feature reuse exists.

## Route Ownership Rule

`app/**/page.tsx` remains in place because Next.js requires route files there.

Route files must stay thin:

- read params/search params
- render the correct feature page
- own route-only metadata/boundary glue when needed

Route files must not become the main home of page composition logic.

## `views/` Decision

- `views/` is deprecated.
- No new code should be added to `views/`.
- Existing `views/` code should move into `features/<domain>/pages` or `features/<domain>/components`.
- The folder should be removed after all imports are migrated.

Rationale:

- `views/` duplicates the role of feature page orchestration without adding a durable boundary.
- Feature page orchestration belongs with the rest of the feature.

## Naming Decisions

### Dashboard domain

- Keep route segment `/home` for now to avoid unnecessary URL churn.
- Use `overview` as the canonical feature/domain code name because the current page is an overview dashboard.
- Remove mixed `home` vs `overview` ownership over time by moving current `components/home/*` into `features/overview/*`.

### Settings/profile domain

- Keep route segment `/settings` for now.
- Use `settings` as the canonical feature/domain code name because route ownership should match the top-level user-facing navigation surface.
- `profile` remains a sub-area inside the settings feature if needed.

### Insights/analytics domain

- Keep route segment and feature name `insights`.
- Move current `components/analytics/*` into `features/insights/*`.
- Stop introducing new `analytics` placement names in web UI folders.

### Singular vs plural

- Feature folders should use plural names when the route/domain is naturally plural in this repo: `expenses`, `budgets`, `groups`, `households`, `invitations`.
- Use singular only when the domain is naturally singular in the current product language: `auth`, `settings`, `onboarding`, `overview`, `more`.
- Do not mix singular/plural names for the same feature tree.

## Migration Strategy

Use phased migration, not big-bang rename chaos.

### Phase 1: Foundation

- Create `features/`.
- Migrate one low-risk feature first to prove placement rules.
- Update route imports to point from `app/` directly into `features/`.

### Phase 2: Naming cleanup and merged ownership

- Migrate domains where `views/` and `components/<domain>` currently overlap.
- Merge split ownership into one feature tree.
- Remove dead barrels/import bridges after each feature lands.

### Phase 3: Shared extraction pass

- Re-check code promoted to shared folders.
- Keep only real cross-feature utilities/components in root shared locations.
- Remove feature-local code accidentally left in top-level shared folders.

### Phase 4: Doc and harness alignment

- Update frontend folder structure references.
- Update component architecture references where import direction or placement language changed.
- Record the refactor in harness artifacts and progress log.

## Migration Order

Recommended order:

1. `more`
2. `onboarding`
3. `settings`
4. `insights`
5. `overview`
6. `budgets`
7. `groups`
8. `households`
9. `expenses`
10. `auth`
11. `invitations`

Reasoning:

- Start with low-risk proof.
- Migrate overlap-heavy domains before the largest and most coupled domain (`expenses`).
- Leave high-churn areas until the placement pattern is already stable.

## Placement Rules After Refactor

### Put code in `features/<domain>` when

- it knows a product domain (`expense`, `budget`, `group`, `household`, `insight`, `invite`, `profile`)
- it is used by only one feature
- it owns feature-local fetching, mutation, derived state, or rendering

### Put code in `components/shared` when

- it is reused by multiple features
- it does not know any domain language
- it stays UI/controller-level, not runtime/business logic

### Put code in root `api`, `hooks`, `stores`, `types`, `utils`, `lib` when

- it is truly cross-feature
- its owner is the app shell/runtime, not one domain
- promoting it reduces duplication without creating domain leakage

## Risks

### High: migration churn

Many imports and file paths will change.

Mitigation:

- migrate by feature
- keep route files stable
- run focused checks after each feature batch

### Medium: false shared extraction

Some current shared-looking code may actually be domain-specific.

Mitigation:

- bias toward feature-local placement first
- promote later only with proven reuse

### Medium: naming disagreement during move

Old and new names can coexist too long.

Mitigation:

- lock canonical names in docs first
- rename touched paths consistently inside each migrated feature

## Acceptance Criteria

- `views/` is fully removed.
- `app/` route files remain thin and import from `features/`.
- Domain-local page orchestration and domain-local components live together under `features/<domain>`.
- Top-level `components/` keeps only `ui`, `shared`, and cross-feature layout concerns.
- Naming is consistent for `overview`, `settings`, and `insights` feature trees.
- Frontend reference docs describe the new structure as canonical.

## Implementation Notes

- Favor filesystem clarity over preserving old path habits.
- Prefer local ownership before abstraction.
- Do not move stable shared stores/helpers unless their ownership truly changes.
- Use small compatibility steps only when they lower risk materially; do not keep long-lived transitional wrappers after imports are updated.
