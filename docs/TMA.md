# TMA.md

TMA router. Read this for `apps/tma` work, then read only exact TMA leaf docs needed.

## Defaults

- TMA is a separate frontend surface under `apps/tma`.
- One product, one worker API, one D1 truth.
- TMA uses Telegram-native bridge behavior and WebView performance constraints.
- Shared domain rules live under `docs/product-specs/shared/*`; TMA-only UX rules live under `docs/product-specs/tma/*`.
- The Telegram bot companion is a worker subsystem under `apps/worker/src/bot/`, not under `apps/tma`. TMA work that touches bot interaction (launch context, deep-link payloads, invite buttons) still goes through `docs/product-specs/tma/telegram-bot-companion.md` and `docs/references/frontend/tma/auth-and-bot-pattern.md`.

## Read Next By Task

| Task | Read |
|------|------|
| TMA product behavior | `docs/product-specs/tma/index.md` |
| Shared product behavior | `docs/product-specs/shared/index.md` |
| App placement, package boundary, router shell, UI defaults | `docs/references/frontend/tma/app-structure-and-client-rules.md` |
| Native navigation, BackButton, in-page Button CTAs, motion, safe area, keyboard | `docs/references/frontend/tma/native-ui-and-navigation-pattern.md` |
| Query/store ownership, bootstrap state, SecureStorage/DeviceStorage fallback | `docs/references/frontend/tma/state-and-storage-pattern.md` |
| Worker auth, startapp, invite payloads, bot boundary | `docs/references/frontend/tma/auth-and-bot-pattern.md` |
| Local dev, Telegram test env, debugging, hardening QA | `docs/references/frontend/tma/development-and-hardening-pattern.md` |
| Exact local worker/TMA/Telegram smoke workflow | `docs/references/frontend/tma/local-testing-runbook.md` |
| Screen structure, visual system, page map for current TMA build | `apps/tma/DESIGN.md` |
| Durable client direction | `docs/design-docs/frontend/tma/telegram-mini-app-client-architecture.md` |
| Shared naming | `docs/references/shared/type-naming-pattern.md` |

## Verification

- Verify TMA docs/harness changes directly when the work is docs-only.
- Use one phased parameter at a time: `./init.sh <param>` for format, lint, typecheck, test, or build. The full `./init.sh` runs format, lint, typecheck, test, then web and TMA builds.
- For `apps/tma`, never add component/page render tests. Prefer util/api/store/helper unit tests plus browser/manual evidence for UI behavior.
- Run full `./init.sh` only at final verification.
