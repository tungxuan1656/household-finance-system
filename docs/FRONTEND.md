# FRONTEND.md

Frontend parent router. Read this when work touches any client surface, then route into the exact child surface doc.

## Surfaces

- `docs/WEB.md`: `apps/web` browser client.
- `docs/TMA.md`: `apps/tma` Telegram Mini App client.
- `docs/MOBILE_APP.md`: future native mobile app surface.

## Defaults

- One product, multiple frontend surfaces.
- Shared product truth lives under `docs/product-specs/shared/*`.
- Surface UX truth lives under `docs/product-specs/web/*`, `docs/product-specs/tma/*`, or future `mobile-app/*`.
- Frontend implementation rules live under `docs/references/frontend/<surface>/*`.
- Durable frontend decisions live under `docs/design-docs/frontend/<surface>/*`.
- Do not treat `web` docs as implicit truth for TMA or future mobile-app.

## Read Next By Task

| Task | Read |
|------|------|
| Frontend work, but surface still unclear | `docs/FRONTEND.md` |
| Web work in `apps/web` | `docs/WEB.md` |
| TMA work in `apps/tma` | `docs/TMA.md` |
| Future native mobile-app work | `docs/MOBILE_APP.md` |
| Shared product/domain behavior | `docs/product-specs/shared/index.md` |
| Shared type/API naming | `docs/references/shared/type-naming-pattern.md` |
| Durable frontend design decision | `docs/design-docs/frontend/index.md` |

## Rules

- Parent docs route. Child docs hold rules.
- Shared rules must stay surface-agnostic.
- Surface-specific rules must move out of shared docs the same session they are discovered.
