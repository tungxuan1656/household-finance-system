# FRONTEND.md

Frontend router. Read this for `apps/web` work, then read only exact reference docs needed.

## Defaults

- Clarity before novelty.
- Mobile-first layout.
- shadcn/ui primitives from `@/components/ui/*`.
- No custom primitive wrapper replacements for `Button`, `Input`, `Card`, `Dialog`, etc.
- State coverage required: loading, empty, success, error, retry when relevant.
- Accessibility is normal verification, not polish.

## Component Boundaries

- Page file owns route params, URL/state sync, top-level orchestration.
- Feature smart component owns one bounded concern: local state, hooks, mutations, composed UI.
- Shared component exists only after cross-feature reuse is real.
- Dumb component is presentational only; no feature API calls.
- Prefer DTO passthrough. Map only for real derived value or shape change.
- Split near 200 lines or when 3+ concerns mix.

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
| Page vs child split | `docs/references/frontend/component-structure-pattern.md` |
| Component architecture | `docs/references/frontend/frontend-component-architecture-guide.md` |
| Naming/imports/constants | `docs/references/frontend/naming-and-conventions-pattern.md` |
| API hooks / React Query | `docs/references/frontend/api-react-query-pattern.md` |
| Zustand store | `docs/references/frontend/zustand-store-pattern.md` |
| Form | `docs/references/frontend/form-pattern.md` |
| Dialog + form layout | `docs/references/frontend/dialog-and-form-pattern.md` |
| i18n labels/copy | `docs/references/frontend/i18n-label-pattern.md` |
| Responsive shell/nav | `docs/references/frontend/responsive-navigation-shell-pattern.md` |
| Test placement | `docs/testing/test-placement-and-sharding-convention.md` |
| Durable UI decision | `docs/design-docs/index.md` |

## Verification

- Run focused web checks for touched area.
- Run `pnpm lint:fix` after edits.
- Prefer `./init.sh` before done.
- For `apps/web`, do not add component/page render tests. Prefer util/api/store/helper tests plus browser/manual evidence for UI behavior.
