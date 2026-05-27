# FRONTEND.md

Frontend router. Read this for `apps/web` work, then read only exact reference docs needed.

## Defaults

- Clarity before novelty.
- Mobile-first layout.
- `apps/web/src` uses feature-first ownership: route files stay in `app/`, domain-local code lives in `features/<domain>/`, shared UI stays in `components/shared`, and primitives stay in `components/ui`.
- shadcn/ui primitives from `@/components/ui/*`.
- No custom primitive wrapper replacements for `Button`, `Input`, `Card`, `Dialog`, etc.
- State coverage required: loading, empty, success, error, retry when relevant.
- Tests: no component/page render tests in `apps/web`. Write unit tests for pure logic, API clients, stores, hooks/helpers that do not render UI; verify UI by browser/manual evidence.
- Accessibility is normal verification, not polish.

## Component Boundaries

- Route file under `app/**` owns route params, URL/state sync, and Next.js boundary glue only.
- Feature page under `features/<domain>/pages/**` owns top-level orchestration for that route surface.
- Feature smart component owns one bounded concern: local state, hooks, mutations, composed UI.
- Shared component exists only after cross-feature reuse is real.
- Dumb component is presentational only; no feature API calls.
- Prefer DTO passthrough. Map only for real derived value or shape change.
- Split near 200 lines or when 3+ concerns mix.

## Folder Direction

- `app/`: Next.js route tree, layouts, metadata, loading/error/not-found, server/client boundary glue.
- `features/<domain>/`: primary home for domain-local pages, components, hooks, api modules, types, utils, tests, and feature-only helpers.
- `components/shared`: cross-feature reusable UI/controller components.
- `components/layouts`: app shell/navigation/layout pieces shared across features.
- `components/ui`: shadcn primitives only.
- `views/`: removed. Do not add new code there.

## Protected Page Surface Pattern

- New protected app pages use shared page wrappers from `@/components/shared/page/*`.
- Canonical wrappers are:
  - `PageContainer`
  - `PageHeader`
  - `PageContent`
  - `PageFooter`
- Do not create new `PageShell` or `PageSection` usage.
- Existing `PageShell` pages may stay only until their migration lands.
- `PageHeader` owns the route title/header contract.
- Do not duplicate page `<header>`/`<h1>` or shell-level outer padding around protected pages.
- Route-level loading, empty, error, and success states should all render inside the same `PageContainer` when they belong to one route surface.
- For page wrapper details, read `docs/references/frontend/protected-page-surface-pattern.md`.
- For shell/nav details, read `docs/references/frontend/responsive-navigation-shell-pattern.md`.

## shadcn Rules

- Use shadcn primitives directly.
- Compose with `CardHeader`, `CardContent`, `Field`, `FieldGroup`, `DialogContent`, etc.
- Use primitive props (`variant`, `size`, `tone`, `surface`) before custom classes.
- `className` on primitives is for layout, not internal restyle.
- For UI tasks, read `.agents/skills/shadcn/SKILL.md` and exact shadcn rule file needed.

## Read Next By Task

| Task | Read |
|------|------|
| Folder/file placement | `docs/references/frontend/project-folder-structure.md` |
| Route page vs feature page split | `docs/references/frontend/component-structure-pattern.md` |
| Component architecture | `docs/references/frontend/frontend-component-architecture-guide.md` |
| Naming/imports/constants | `docs/references/frontend/naming-and-conventions-pattern.md` |
| API hooks / React Query | `docs/references/frontend/api-react-query-pattern.md` |
| Zustand store | `docs/references/frontend/zustand-store-pattern.md` |
| Form | `docs/references/frontend/form-pattern.md` |
| Dialog + form layout | `docs/references/frontend/dialog-and-form-pattern.md` |
| i18n labels/copy | `docs/references/frontend/i18n-label-pattern.md` |
| Protected page wrapper rules | `docs/references/frontend/protected-page-surface-pattern.md` |
| Responsive shell/nav | `docs/references/frontend/responsive-navigation-shell-pattern.md` |
| Test placement | `docs/testing/test-placement-and-sharding-convention.md` |
| Durable UI decision | `docs/design-docs/index.md` |

## Verification

- Run focused web checks for touched area.
- Use `./init.sh <param>` instead of `pnpm <cmd>` for lint/typecheck/test/build.
- Manual one-file lint/test OK for focused debug.
- Run full `./init.sh` only at final verification.
- For `apps/web`, never add component/page render tests. Prefer util/api/store/helper unit tests plus browser/manual evidence for UI behavior.
