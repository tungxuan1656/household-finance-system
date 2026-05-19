# Frontend Project Folder Structure

Canonical `apps/web` placement rules for Next.js App Router.

## Standard Structure

```text
apps/web/src/
  app/                    # Next.js route tree + Next.js-only files
    (protected)/
    (public)/
    layout.tsx
    page.tsx

  features/
    <domain>/
      api/                # domain-local API adapters/hooks glue if not shared
      components/         # domain-local smart/presentational UI
      hooks/              # domain-local hooks
      lib/                # domain-local runtime helpers/forms
      pages/              # route-level feature page orchestrators
      stores/             # domain-local client state when needed
      types/              # domain-local types
      utils/              # domain-local pure helpers
      index.ts            # optional stable public surface

  components/
    ui/                   # shadcn primitives only
    shared/               # cross-feature reusable components
    layouts/              # app shell/layout components
    shadcn-studio/        # generated/demo block assets kept shared

  api/                    # shared HTTP clients + shared endpoint modules

  hooks/                  # shared reusable hooks
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
```

## Placement Rules

- `app/`: routing, layouts, metadata, loading/error/not-found, and server/client boundary glue only.
- `features/<domain>`: primary home for domain-local pages, components, hooks, api modules, types, utils, tests, and feature-only helpers.
- `components/shared`: cross-feature reusable UI/controller components.
- `components/layouts`: app shell/navigation/layout pieces shared across features.
- `components/ui`: shadcn primitives. No feature logic.
- `api`: shared HTTP clients and shared endpoint modules only.
- `hooks`: shared reusable hooks. Keep feature-only hooks inside `features/<domain>/hooks`.
- `stores/<feature>.store.ts`: global client state, flat files.
- `lib`: runtime/domain helper areas. Keep generic utilities out of `lib`.
- `utils`: shared pure utilities: class-name merging, formatting, DOM helpers, download/export helpers, and labels.
- `types`: shared frontend/internal types; API DTOs should come from contracts/client types when available.

## Import Rules

- Prefer same-feature imports first.
- Promote reusable UI/controller code to `components/shared`; promote app-shell pieces to `components/layouts`; promote runtime/domain helpers to shared `lib`; promote generic pure helpers to shared `utils`.
- Import shadcn primitives from `@/components/ui/*`.
- Import `cn` from `@/utils/cn` and utility groups from `@/utils/<group>`.
- Import route pages from `@/features/<domain>/pages/*`.
- Import public feature modules from folder barrel only when folder exposes a stable public surface.
- Keep internal subcomponents module-private.

## Do Not

- Do not create new root folders for one feature.
- Do not put feature business logic in `components/shared`.
- Do not add new domain code to `views/`; `views/` is removed.
- Do not put UI components in `lib`.
- Do not wrap shadcn primitives with replacement primitives.
- Do not keep giant route/page files when feature sections can own concerns.

## Checklist

- [ ] Route file stays thin.
- [ ] Feature page orchestrator lives under `features/<domain>/pages`.
- [ ] Feature-local UI/hooks/api/types live under `features/<domain>`.
- [ ] Cross-feature code is proven before promotion.
- [ ] `lib` stays runtime/domain-scoped.
- [ ] Generic pure helpers live under `utils`, not `lib`.
- [ ] Import alias `@/...` stays consistent.
