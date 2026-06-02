# TMA app structure and client rules

Canonical client structure rules for planned `apps/tma`.

## Scope

Use this doc for:

- workspace/package placement
- folder ownership
- router/bootstrap boundaries
- SDK package-line choice
- TMA UI-system defaults

## Stack defaults

- Use React + Vite SPA.
- Use React Router for in-app history.
- Use TanStack Query for server state.
- Use Zustand for small client-local workflow state.
- Use Framer Motion for screen, sheet, and high-touch interaction motion.

## SDK package-line rule

Telegram Mini Apps packages changed across package families over time.

Rules:

- Use the `@tma.js/*` line for new runtime work.
- In React code, prefer `@tma.js/sdk-react` as the default app-facing dependency.
- Pull in lower-level `@tma.js/*` packages only when the React package does not already expose the needed surface cleanly.
- Do not mix multiple Telegram Mini Apps package families in one client.
- If a slice intentionally deviates from the `@tma.js/*` line, record the concrete blocker in the plan and keep the migration boundary explicit.

## Package boundary

Place the client in a separate workspace package:

```text
apps/tma/
  src/
    app/
      bootstrap/          # init, providers, app shell
      router/             # router creation, route shells, lazy routes
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
    lib/
      telegram/           # SDK wrappers only
      auth/
      query/
      storage/
      i18n/
    routes/               # route table and route-level guards only
    utils/
```

Rules:

- Do not add TMA runtime code under `apps/web`.
- Do not import feature or UI code from `apps/web/src`.
- Reuse only shared DTOs, extracted pure helpers, and worker API contracts.
- Do not fork domain rules between web and TMA.

## Import direction

Allowed:

```text
src/main.tsx -> app/bootstrap/*
app/router/* -> routes/* -> features/*/pages/*
features/* -> feature-local components/hooks/api/stores/types/utils
features/* -> components/shared or components/ui when reuse is real
lib/telegram/* -> raw Telegram SDK packages
```

Forbidden:

```text
feature/page/component -> window.Telegram.WebApp direct calls
components/ui -> feature code
shared component -> domain-specific feature component
apps/tma -> apps/web/src imports
```

## Shell ownership

Keep shell responsibilities explicit:

- Root app shell owns bootstrap gates, providers, viewport/theme binding, and fatal launch/auth failure UI.
- Route shells own route composition, route-level lazy loading, and route-level guards.
- Flow shells own `BackButton`, `BottomButton`, closing-confirmation, and multi-step flow state wiring.
- Leaf components render feature UI. They do not own Telegram global chrome.

## Router rules

- All in-app navigation stays inside SPA history.
- Use `navigate()` or `Link` only.
- Full-page route changes with `window.location` are a bug for TMA flows.
- Route-level code splitting is allowed and preferred for heavier read surfaces.
- If BrowserRouter is used, deployment must include SPA fallback rewrites. Do not rely on 404 recovery.

## UI-system rules

- TMA does not inherit `shadcn/ui` as its default UI language.
- Telegram-adaptive list/form primitives are allowed for low-level mobile scaffolding.
- Project-owned components should own amount entry, bottom sheets, segmented tabs, and finance-specific interaction states.
- Theme from Telegram CSS vars first. Hardcoded web-theme assumptions are not allowed.
- There is no native Telegram tab bar, title header, or bottom sheet. Build those as web UI.

## State placement rules

- TanStack Query owns worker-backed data.
- Zustand owns short-lived multi-step flow state only.
- Local component state owns presentational UI state.
- Do not mirror server DTOs into long-lived client stores without a real offline/resume need.

## Performance defaults

- Lazy-load heavier read surfaces such as insights or chart-heavy screens.
- Keep startup light: auth bootstrap, current user, and route intent first; bulk reference data later.
- Keep animation, safe-area, and keyboard behavior inside the shared shell layer, not re-solved per page.

## Verification rules

- Prefer unit tests for wrappers, helpers, stores, and flow reducers.
- Verify route, keyboard, safe-area, and native-button behavior in Telegram-like mobile WebView conditions.
- Record which launch modes and device classes were checked in harness evidence.
