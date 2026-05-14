# Frontend Project Folder Structure

Canonical `apps/web` placement rules for Next.js App Router.

## Standard Structure

```text
apps/web/src/
  app/                    # Next.js route tree
    (protected)/
    (public)/
    layout.tsx
    page.tsx

  api/                    # HTTP clients + endpoint functions
    <feature>/

  components/
    ui/                   # shadcn primitives only
    shared/               # cross-feature reusable components
    <feature>/            # feature-scoped smart/presentational components

  hooks/                  # reusable hooks
  lib/                    # runtime/domain helpers, not generic utils
    auth/
    constants/
    firebase/
    forms/
    i18n/
    images/
    media/
    metrics/
    reference-data/
    storages/

  utils/                  # shared pure utilities
    cn.ts
    currency/
    datetime/
    dom/
    export/
    household/

  stores/                 # Zustand stores, flat feature files
  types/                  # shared frontend/internal types
  views/                  # route-level view components used by app routes
```

## Placement Rules

- `app/`: routing, layouts, metadata, server/client boundary glue.
- `views/`: page-level orchestrators for app routes.
- `components/<feature>`: feature UI and feature smart sections.
- `components/shared`: cross-feature reusable UI/controller components.
- `components/ui`: shadcn primitives. No feature logic.
- `api/<feature>`: HTTP calls and endpoint mapping only.
- `hooks`: reusable hooks. Feature-only hooks may stay near feature when clearer.
- `stores/<feature>.store.ts`: global client state, flat files.
- `lib`: runtime/domain helper areas. Keep generic utilities out of `lib`.
- `utils`: shared pure utilities: class-name merging, formatting, DOM helpers, download/export helpers, and labels.
- `types`: shared frontend/internal types; API DTOs should come from contracts/client types when available.

## Import Rules

- Prefer same-feature imports first.
- Promote reusable UI/controller code to `components/shared`; promote runtime/domain helpers to `lib`; promote generic pure helpers to `utils`.
- Import shadcn primitives from `@/components/ui/*`.
- Import `cn` from `@/utils/cn` and utility groups from `@/utils/<group>`.
- Import public feature components from folder barrel only when folder exposes stable public surface.
- Keep internal subcomponents module-private.

## Do Not

- Do not create new root folders for one feature.
- Do not put feature business logic in `components/shared`.
- Do not put UI components in `lib`.
- Do not wrap shadcn primitives with replacement primitives.
- Do not keep giant route/page files when feature sections can own concerns.

## Checklist

- [ ] Route file stays thin.
- [ ] Page/view orchestrates, not everything.
- [ ] Feature components live under `components/<feature>`.
- [ ] Cross-feature code is proven before promotion.
- [ ] `lib` stays runtime/domain-scoped.
- [ ] Generic pure helpers live under `utils`, not `lib`.
- [ ] Import alias `@/...` stays consistent.
