# Locked Defaults

Use this file when a TMA task risks reopening already-set repo decisions.

## Terminology

- Canonical term: `TMA`
- Canonical router doc: `docs/TMA.md`
- Canonical reference folder: `docs/references/frontend/tma/`
- Canonical runtime app path: `apps/tma`

## Package line

- Default package family: `@tma.js/*`
- Primary React-facing dependency: `@tma.js/sdk-react`
- Lower-level `@tma.js/*` packages are optional only when the React package does not already cover the needed surface cleanly.

## Session model

- TMA joins the existing worker session lifecycle.
- Cold-open auth exchanges Telegram launch context with the worker.
- Access token stays memory-only.
- Refresh token may use `SecureStorage` when supported.
- If `SecureStorage` is unavailable, keep the session memory-only and re-exchange on the next supported launch.
- Do not persist auth tokens to `DeviceStorage` or `localStorage`.

## Navigation and UI

- Use SPA routing only.
- `BackButton` is manual.
- `BottomButton` belongs to the current route or flow shell.
- Theme from Telegram CSS vars first.

## Bot boundary

- Bot is companion UX only.
- Default runtime shape is worker-first behind an explicit adapter boundary.

## Canonical docs

- Router: `docs/TMA.md`
- Durable client direction: `docs/design-docs/frontend/tma/telegram-mini-app-client-architecture.md`
- Phase map: `docs/references/frontend/tma/runtime-readiness-and-slice-map.md`
