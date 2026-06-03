# WEB.md

Web router. Read this for `apps/web` work, then read only exact web leaf docs needed.

## Defaults

- Web is one frontend surface, not the whole frontend layer.
- `apps/web` uses Next.js App Router and shadcn primitives.
- Responsive desktop/mobile web behavior lives here and in web leaf docs.
- TMA and future mobile-app rules do not belong here.

## Read Next By Task

| Task | Read |
|------|------|
| Web product behavior | `docs/product-specs/web/index.md` |
| Shared product behavior | `docs/product-specs/shared/index.md` |
| Folder/file placement | `docs/references/frontend/web/project-folder-structure.md` |
| Route page vs feature page split | `docs/references/frontend/web/component-structure-pattern.md` |
| Component architecture | `docs/references/frontend/web/frontend-component-architecture-guide.md` |
| Naming/imports/constants | `docs/references/frontend/web/naming-and-conventions-pattern.md` |
| API hooks / React Query | `docs/references/frontend/web/api-react-query-pattern.md` |
| Zustand store | `docs/references/frontend/web/zustand-store-pattern.md` |
| Form | `docs/references/frontend/web/form-pattern.md` |
| Dialog + form layout | `docs/references/frontend/web/dialog-and-form-pattern.md` |
| Mobile PWA shell/safe-area/drawer rules | `docs/references/frontend/web/mobile-pwa-ui-rules.md` |
| Mobile UI audit/refactor notes | `docs/references/frontend/web/mobile-pwa-ui-audit.md` |
| i18n labels/copy | `docs/references/frontend/web/i18n-label-pattern.md` |
| Protected page wrapper rules | `docs/references/frontend/web/protected-page-surface-pattern.md` |
| Responsive shell/nav | `docs/references/frontend/web/responsive-navigation-shell-pattern.md` |
| Durable web UI decision | `docs/design-docs/frontend/web/protected-shell-and-tab-surfaces.md` |
| Test placement | `docs/testing/test-placement-and-sharding-convention.md` |

## Verification

- Run focused web checks for touched area.
- Use `./init.sh <param>` instead of `pnpm <cmd>` for lint/typecheck/test/build.
- For `apps/web`, never add component/page render tests. Prefer util/api/store/helper unit tests plus browser/manual evidence for UI behavior.
