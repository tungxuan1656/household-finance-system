# Product Specs Index

User-visible behavior map. Specs describe current behavior and accepted roadmap behavior, not implementation architecture.

## Branches

- `shared/`: product truth valid across all client surfaces.
- `web/`: behavior valid only for `apps/web`.
- `tma/`: behavior valid only for `apps/tma`.

## Status Convention

- `Status: current` — repo evidence shows the behavior is implemented or is the current product contract.
- `Status: proposed` — accepted direction without current implementation evidence.
- `Status: mixed` — current behavior and accepted future direction share the same spec.

## Quick Routes

| Need | Doc |
|------|-----|
| Shared product/domain rules | `docs/product-specs/shared/index.md` |
| Web-only UX and surface behavior | `docs/product-specs/web/index.md` |
| TMA-only UX and surface behavior | `docs/product-specs/tma/index.md` |

## Rules

- Product spec owns user-visible behavior.
- Shared specs must stay surface-agnostic.
- Surface branches may define different flows while reusing the same shared domain truth.
- If implementation changes visible behavior, update the matching shared or surface spec in the same session.
