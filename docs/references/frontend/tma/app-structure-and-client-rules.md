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
- TMA uses **Tailwind CSS v4** (`@tailwindcss/vite`) for styling. See the `Styling` section below for the hybrid token + component-class convention.
- Telegram-adaptive list/form primitives are allowed for low-level mobile scaffolding.
- Project-owned components should own amount entry, bottom sheets, segmented tabs, and finance-specific interaction states.
- Theme from Telegram CSS vars first. Hardcoded web-theme assumptions are not allowed.
- There is no native Telegram tab bar, title header, or bottom sheet. Build those as web UI.

## Styling

Tailwind v4 is configured in `apps/tma/src/index.css` via the `@theme inline` block. That file is the source of truth for design tokens; this section is the user-facing summary.

### Tokens exposed to Tailwind

`@theme inline` maps every `--tma-*` CSS variable defined in `:root` to a Tailwind utility token:

- Colors: `--color-tma-base-bg`, `--color-tma-page-bg`, `--color-tma-card-bg`, `--color-tma-card-plain`, `--color-tma-text-strong`, `--color-tma-text-muted`, `--color-tma-line`, `--color-tma-primary`, `--color-tma-positive`, `--color-tma-warning`.
- Shadows: `--shadow-tma-card`, `--shadow-tma-soft`.
- Font: `--font-mono` (JetBrains Mono, used for money values).
- Animation: `--animate-tma-spin` (consumed by `animate-tma-spin`).

Opacity modifier works on color utilities: `bg-tma-primary/12` produces the 12 % primary tint used by selected states.

Safe-area runtime vars (`--tma-safe-*`, `--tma-content-safe-*`) stay raw CSS variables. The Telegram SDK sets them at boot; Tailwind arbitrary values like `pt-[var(--tma-safe-top)]` read them directly.

### Component classes

`src/index.css` also keeps BEM-style component classes inside `@layer components` for non-trivial layout composites that would balloon JSX if expressed as utilities: full-page shells (`.tma-page-shell*`, `.tma-bottom-tabs*`), carousels (`.tma-household-carousel`), glass-morphism rails, and the like. These stay in CSS — do not convert them.

### Class composition

Use `cn()` from `@/lib/utils` (clsx + tailwind-merge) for conditional className. Never hand-roll template literals for state modifiers.

```tsx
cn('tma-select-chip', isActive && 'bg-tma-primary/12 text-tma-primary')
```

### Conventions

- ≤ 2 CSS properties per class → prefer utility. Layout / multi-property shapes → keep the component class in `@layer components`.
- Dynamic values (chart bar height, runtime safe-area) → keep inline `style={{ ... }}`. Static `style={{ margin: 0 }}` and `style={{ color: 'var(--tma-*)' }}` → convert to utility.
- Pseudo-classes use Tailwind variants (`active:scale-95`, `hover:opacity-80`). Add `transition-transform` / `transition-opacity` so the variant actually animates.
- Do not introduce `tailwind.config.ts`. Tailwind v4 is CSS-first; add tokens to `@theme inline`, not to a JS config.

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
