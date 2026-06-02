# TWA app structure and client rules

Canonical rules for the planned `apps/twa` client.

## Scope

This doc is for the Telegram Mini App client only.

It does not replace the `apps/web` rules.

## Package boundary

Place the client in a separate workspace package:

```text
apps/twa/
  src/
    app/                 # bootstrap, providers, router shell
    routes/              # route table and route-level guards only
    features/
      <domain>/
        api/
        components/
        hooks/
        pages/
        stores/
        types/
        utils/
    components/
      shared/
      ui/
    api/                 # shared HTTP client and endpoint modules
    lib/
      telegram/          # bridge adapters, capability checks, storage wrappers
      auth/
      i18n/
    stores/
    utils/
```

Rules:

- Do not add TWA code under `apps/web`.
- Do not import feature or UI code from `apps/web/src`.
- Reuse only shared DTOs, extracted helpers, and API contracts.

## Stack rules

- Use React + Vite SPA.
- Use React Router for navigation.
- Use TanStack Query for server state.
- Use Zustand for small multi-step workflow state.
- Use Framer Motion for screen and sheet transitions.

## SDK package rule

The TMA ecosystem has package-name churn.

Rules:

- Choose one current SDK package line before coding.
- Pin it explicitly in the feature plan and package.json.
- Do not mix `@tma.js/*` and `@telegram-apps/*` packages in one client.

## Telegram bridge rules

- Mount and wrap Telegram bridge APIs in `src/lib/telegram/*`.
- Page and feature code should call app-owned adapters, not raw globals.
- Capability checks belong in wrappers, not duplicated across screens.

Examples of wrapped concerns:

- launch params
- theme and viewport binding
- `BackButton`
- `BottomButton`
- haptics
- `SecureStorage`
- `DeviceStorage`

## Routing rules

- All navigation must stay inside SPA history.
- Use `navigate()` or `Link` only.
- Do not navigate with `window.location` for in-app flows.
- Multi-step expense URLs are allowed only when state stays inside the SPA.

## UI rules

- Do not port the web protected shell or shadcn page wrappers as the default TWA shell.
- Telegram-adaptive mobile primitives are allowed for list and form scaffolding.
- Project-owned components should handle amount entry, bottom sheets, and other high-touch finance UI.
- Theme from Telegram CSS vars first. Hardcoded web-theme assumptions are not allowed.

## State and storage rules

- Session bootstrap must follow the worker auth model, not a client-only token model.
- Prefer `SecureStorage` for session persistence when supported.
- Keep the unsupported-storage fallback behind one adapter and document the security tradeoff.
- `DeviceStorage` is cache only. Do not treat it as source of truth.

## Interaction and performance rules

- Animate `transform` and `opacity` only.
- Lazy-load heavy read surfaces such as large insights screens.
- Keep safe-area and keyboard behavior in the base layout.
- Use touch-first handlers only where a real tap-delay or gesture problem exists.
- Do not replace all semantic click handlers with touch handlers by default.

## Verification rules

- Prefer unit tests for helpers, adapters, stores, and pure flow logic.
- Verify UI behavior with browser/manual evidence in Telegram-like mobile viewports.
- Record which flows were checked in harness evidence.
- Final repo verification still uses `./init.sh` from repo root.
