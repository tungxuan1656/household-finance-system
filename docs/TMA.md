# TMA.md

TMA router. Read this for `apps/tma` work, then read only exact TMA leaf docs needed.

## Defaults

- TMA is a separate frontend surface under `apps/tma`.
- One product, one worker API, one D1 truth.
- TMA uses Telegram-native bridge behavior and WebView performance constraints.
- Shared domain rules live under `docs/product-specs/shared/*`; TMA-only UX rules live under `docs/product-specs/tma/*`.

## Read Next By Task

| Task | Read |
|------|------|
| TMA product behavior | `docs/product-specs/tma/index.md` |
| Shared product behavior | `docs/product-specs/shared/index.md` |
| App placement, package boundary, router shell, UI defaults | `docs/references/frontend/tma/app-structure-and-client-rules.md` |
| Native navigation, BackButton/BottomButton, motion, safe area, keyboard | `docs/references/frontend/tma/native-ui-and-navigation-pattern.md` |
| Query/store ownership, bootstrap state, SecureStorage/DeviceStorage fallback | `docs/references/frontend/tma/state-and-storage-pattern.md` |
| Worker auth, startapp, invite payloads, bot boundary | `docs/references/frontend/tma/auth-and-bot-pattern.md` |
| Local dev, Telegram test env, debugging, hardening QA | `docs/references/frontend/tma/development-and-hardening-pattern.md` |
| Exact local worker/TMA/Telegram smoke workflow | `docs/references/frontend/tma/local-testing-runbook.md` |
| Which docs to read per TMA phase, locked defaults, remaining slice prerequisites | `docs/references/frontend/tma/runtime-readiness-and-slice-map.md` |
| Screen structure, visual system, page map for current TMA build | `apps/tma/DESIGN.md` |
| Durable client direction | `docs/design-docs/frontend/tma/telegram-mini-app-client-architecture.md` |
| Shared naming | `docs/references/shared/type-naming-pattern.md` |

## Verification

- Verify TMA docs/harness changes directly when the work is docs-only.
- Use `./init.sh <param>` instead of `pnpm <cmd>` for repo verification.
- Run full `./init.sh` only at final verification.
