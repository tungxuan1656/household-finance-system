# TMA.md

Telegram Mini App router. Read this for `apps/tma` work, then read only exact TMA leaf docs needed.

## Defaults

- TMA is a separate client surface under `apps/tma`.
- One product, one worker API, one D1 truth.
- TMA docs stay separate from `docs/FRONTEND.md` and `docs/BACKEND.md` because the platform cuts across both.
- Product-visible TMA behavior lives in `docs/product-specs/telegram-mini-app.md`.
- Durable client direction lives in `docs/design-docs/telegram-mini-app-client-architecture.md`.

## Read Next By Task

| Task | Read |
|------|------|
| App placement, package boundary, router shell, UI defaults | `docs/references/tma/app-structure-and-client-rules.md` |
| Native navigation, BackButton/BottomButton, motion, safe area, keyboard | `docs/references/tma/native-ui-and-navigation-pattern.md` |
| Query/store ownership, bootstrap state, SecureStorage/DeviceStorage fallback | `docs/references/tma/state-and-storage-pattern.md` |
| Worker auth, startapp, invite payloads, bot boundary | `docs/references/tma/auth-and-bot-pattern.md` |
| Local dev, Telegram test env, debugging, hardening QA | `docs/references/tma/development-and-hardening-pattern.md` |
| Exact local worker/TMA/Telegram smoke workflow | `docs/references/tma/local-testing-runbook.md` |
| Which docs to read per TMA phase, locked defaults, remaining slice prerequisites | `docs/references/tma/runtime-readiness-and-slice-map.md` |
| Screen structure, visual system, page map for the current TMA build | `apps/tma/DESIGN.md` |
| Shared naming | `docs/references/shared/type-naming-pattern.md` |
| Product behavior | `docs/product-specs/telegram-mini-app.md` |
| Durable client direction | `docs/design-docs/telegram-mini-app-client-architecture.md` |

## Verification

- Verify TMA docs/harness changes directly when the work is docs-only.
- Use `./init.sh <param>` instead of `pnpm <cmd>` for repo verification.
- Run full `./init.sh` only at final verification.
