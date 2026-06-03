# Product Specs Index

User-visible behavior map. Specs describe behavior and acceptance criteria, not implementation architecture.

## Branches

- `shared/`: product truth valid across all client surfaces.
- `web/`: behavior valid only for `apps/web`.
- `tma/`: behavior valid only for `apps/tma`.
- `mobile-app/`: future native surface. Stub only today.

## Quick Routes

| Need | Doc |
|------|-----|
| Shared product/domain rules | `docs/product-specs/shared/index.md` |
| Web-only UX and surface behavior | `docs/product-specs/web/index.md` |
| TMA-only UX and surface behavior | `docs/product-specs/tma/index.md` |
| Future mobile-app surface | `docs/product-specs/mobile-app/index.md` |

## Rules

- Product spec owns user-visible behavior.
- Shared specs must stay surface-agnostic.
- Surface branches may define different flows while reusing the same shared domain truth.
- If implementation changes visible behavior, update the matching shared or surface spec in the same session.
