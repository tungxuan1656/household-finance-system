# TWA.md

Telegram Mini App router. Read this for `apps/twa` work, then read only exact TWA leaf docs needed.

## Defaults

- TWA is a separate client surface under `apps/twa`.
- One product, one worker API, one D1 truth.
- TWA docs stay separate from `docs/FRONTEND.md` and `docs/BACKEND.md` because the platform cuts across both.
- Product-visible TWA behavior lives in `docs/product-specs/telegram-mini-app.md`.
- Durable client direction lives in `docs/design-docs/telegram-mini-app-client-architecture.md`.

## Read Next By Task

| Task | Read |
|------|------|
| App placement, package boundary, router shell, UI defaults | `docs/references/twa/app-structure-and-client-rules.md` |
| Native navigation, BackButton/BottomButton, motion, safe area, keyboard | `docs/references/twa/native-ui-and-navigation-pattern.md` |
| Query/store ownership, bootstrap state, SecureStorage/DeviceStorage fallback | `docs/references/twa/state-and-storage-pattern.md` |
| Worker auth, startapp, invite payloads, bot boundary | `docs/references/twa/auth-and-bot-pattern.md` |
| Local dev, Telegram test env, debugging, hardening QA | `docs/references/twa/development-and-hardening-pattern.md` |
| Shared naming | `docs/references/shared/type-naming-pattern.md` |
| Product behavior | `docs/product-specs/telegram-mini-app.md` |
| Durable client direction | `docs/design-docs/telegram-mini-app-client-architecture.md` |

## Verification

- Verify TWA docs/harness changes directly when the work is docs-only.
- Use `./init.sh <param>` instead of `pnpm <cmd>` for repo verification.
- Run full `./init.sh` only at final verification.
