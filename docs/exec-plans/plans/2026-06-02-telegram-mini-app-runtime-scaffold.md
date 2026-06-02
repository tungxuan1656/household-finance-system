# Telegram Mini App runtime scaffold

## Purpose / Big Picture

Create the first real `apps/tma` runtime scaffold so the repo can start Telegram Mini App development without bending `apps/web` into a second platform. Users will not see new product features yet, but the repo will gain a bootable TMA client shell with the right package line, SPA router, Telegram bootstrap seam, and repo tooling hooks needed for later auth and domain work.

## Scope

In scope:

- `apps/tma/` workspace creation with package.json, tsconfig.json, vite.config.ts, eslint.config.mjs, vitest.config.ts, index.html
- React + Vite + React Router SPA scaffold (NOT Next.js)
- `@tma.js/sdk-react` root provider (`SDKProvider`) + Telegram CSS var binding
- Telegram capability wrappers: launch params, theme/viewport, BackButton, BottomButton (aka MainButton), haptics, safe area
- QueryClientProvider root + Zustand store setup seams
- i18n setup using `i18next` + `react-i18next` (NO `i18next-browser-languagedetector` — Telegram WebView locale comes from Telegram, not browser)
- Base app shell, router shell, and placeholder root screen / fatal launch-error surface
- Repo-tooling integration: `dev:tma`, `build:tma`, `lint:tma`, `typecheck:tma`, `test:tma` via `init.sh`
- docs/harness updates

Expected touched paths:

- `apps/tma/package.json` — workspace app config, scripts, dependencies
- `apps/tma/tsconfig.json` — `jsx: "react-jsx"` (Vite, NOT `preserve`), no Next plugin
- `apps/tma/vite.config.ts` — `@vitejs/plugin-react`, path alias `@/*`, port 5174 (avoid conflict with web 3000 / worker 8787)
- `apps/tma/index.html` — SPA entry with Telegram viewport meta
- `apps/tma/eslint.config.mjs` — adapted from web, drop `@next/eslint-plugin-next`, keep react/typescript/prettier/simple-import-sort/unicorn
- `apps/tma/vitest.config.ts` — jsdom env, path alias, globals false
- `apps/tma/src/main.tsx` — entry point mounting App
- `apps/tma/src/app/bootstrap/app-providers.tsx` — SDKProvider + QueryClientProvider tree
- `apps/tma/src/app/bootstrap/telegram-init.ts` — theme/CSS var binding, initData raw read
- `apps/tma/src/app/router/app-router.tsx` — React Router routes
- `apps/tma/src/routes/home.tsx` — placeholder home screen
- `apps/tma/src/routes/fatal-launch.tsx` — fatal launch-error surface
- `apps/tma/src/lib/telegram/launch-params.ts` — wrapper for raw initData (no client-side user field trust)
- `apps/tma/src/lib/telegram/capabilities.ts` — `isSupports` checks for SecureStorage/DeviceStorage
- `apps/tma/src/lib/telegram/theme.ts` — Telegram CSS var binding helpers
- `apps/tma/src/lib/telegram/back-button.ts` — BackButton show/hide/click with cleanup on unmount
- `apps/tma/src/lib/telegram/bottom-button.ts` — BottomButton (aka MainButton) text/enabled/progress/click
- `apps/tma/src/lib/telegram/haptics.ts` — hapticFeedback.impactOccurred / notificationOccurred helpers
- `apps/tma/src/lib/telegram/safe-area.ts` — safe area inset helpers
- `apps/tma/src/lib/query/query-client.ts` — QueryClient instance
- `apps/tma/src/lib/i18n/index.ts` — i18next setup, Telegram locale from initData
- `apps/tma/src/lib/i18n/locales/vi.json` and `en.json` — placeholder i18n files
- `apps/tma/src/components/shared/app-shell.tsx` — safe-area shell with Telegram theme base colors
- `apps/tma/src/components/shared/loading-fallback.tsx` — bootstrap loading state
- `apps/tma/src/index.css` — Telegram CSS vars as base, safe-area reset, no `100vh` raw usage
- `apps/tma/.env.example` — `VITE_WORKER_URL` placeholder
- `package.json` — add `dev:tma`, `build:tma` scripts
- `init.sh` — add tma lint/typecheck/test/build via `run_parallel_checks` case statement
- `harness/features/feat-079.json`
- `harness/feature_index.json`
- `harness/progress.md`

Out of scope:

- Telegram auth exchange implementation (feat-080)
- worker auth contract changes
- expense, household, budget, group, or insights product flows
- bot webhook/runtime implementation
- i18n full translation catalog (placeholder only)
- production polish beyond a minimal bootable shell
- hosting/deployment (Cloudflare Pages SPA fallback config)

## Non-negotiable Requirements

- Use the `@tma.js/*` package line for new TMA runtime work.
- `@tma.js/sdk-react` must wrap the entire app via `<SDKProvider>` at the root — hooks like `useLaunchParams`, `useBackButton`, `useMainButton` throw without it.
- Keep `apps/tma` separate from `apps/web`; no cross-imports of web UI or feature code. Verify by searching for `from 'apps/web'` in TMA src before commit.
- Build a true SPA shell with React Router v7 (framework mode); full-page route reloads are not allowed.
- Keep Telegram capability access behind app-owned wrappers inside `src/lib/telegram/*`, not direct `window.Telegram.WebApp` usage in feature code.
- Do not add long-lived token persistence in the scaffold; auth persistence rules land in feat-080.
- TMA uses `VITE_*` for Vite env vars (different from Next.js `NEXT_PUBLIC_*` convention).
- Dev server uses port 5174 to avoid conflict with web (3000) and worker (8787).
- CORS: verify `apps/worker/src/lib/cors.ts` or `apps/worker/src/index.ts` allows the TMA dev port (`localhost:5174`) before running auth smoke tests.

## Progress

- [ ] Create `apps/tma/package.json` with `@tma.js/sdk-react`, `react`, `react-dom`, `react-router-dom`, `@tanstack/react-query`, `zustand`, `i18next`, `react-i18next`, `zod`, `framer-motion`, plus dev deps
- [ ] Create `apps/tma/tsconfig.json` with `jsx: "react-jsx"` (NOT `preserve`), no Next plugin, path alias `@/*` → `./src/*`
- [ ] Create `apps/tma/vite.config.ts` with `@vitejs/plugin-react`, path alias, port 5174, `server.host: '127.0.0.1'`
- [ ] Create `apps/tma/eslint.config.mjs` adapted from web: drop `@next/eslint-plugin-next`, keep `react`, `react-hooks`, `typescript-eslint`, `simple-import-sort`, `unicorn`, `unused-imports`, `prettier`
- [ ] Create `apps/tma/vitest.config.ts` with jsdom env, path alias, no globals
- [ ] Create `apps/tma/index.html` with Telegram viewport meta (`viewport-fit=cover`, `user-scalable=no`, `theme-color`)
- [ ] Create `apps/tma/src/main.tsx` mounting the app
- [ ] Create `apps/tma/src/app/bootstrap/app-providers.tsx` with `<SDKProvider>` + `<QueryClientProvider>` + `<ThemeProvider>` tree
- [ ] Create `apps/tma/src/app/bootstrap/telegram-init.ts` binding Telegram CSS vars to CSS custom properties and reading raw `initData` for i18n locale
- [ ] Create `apps/tma/src/lib/telegram/theme.ts` setting `--tg-theme-*` vars, fallback base colors to prevent first-paint flash
- [ ] Create `apps/tma/src/lib/telegram/launch-params.ts` returning raw `initData` string (no client-side user field trust)
- [ ] Create `apps/tma/src/lib/telegram/capabilities.ts` with `isSupports('secureStorage')`, `isSupports('deviceStorage')` helpers
- [ ] Create `apps/tma/src/lib/telegram/back-button.ts` with `show()`, `hide()`, `onClick(handler)`, cleanup on unmount (no listener leak)
- [ ] Create `apps/tma/src/lib/telegram/bottom-button.ts` with `setText()`, `setEnabled()`, `showProgress()`, `onClick()` (BottomButton = MainButton in SDK)
- [ ] Create `apps/tma/src/lib/telegram/haptics.ts` with `impact(style)`, `notification(type)`, `selection()` helpers
- [ ] Create `apps/tma/src/lib/telegram/safe-area.ts` using `window.Telegram.WebApp.safeArea*` bindings
- [ ] Create `apps/tma/src/lib/query/query-client.ts` with default options (staleTime 5min, retry 1)
- [ ] Create `apps/tma/src/lib/i18n/index.ts` with `i18next` + `react-i18next`, locale from `initData.user.language_code` (fallback `vi`)
- [ ] Create `apps/tma/src/lib/i18n/locales/vi.json` and `en.json` placeholder files
- [ ] Create `apps/tma/src/app/router/app-router.tsx` with React Router, `/` → home, `/fatal` → fatal screen
- [ ] Create `apps/tma/src/routes/home.tsx` placeholder with Telegram theme styling
- [ ] Create `apps/tma/src/routes/fatal-launch.tsx` with localized "Reopen from Telegram" CTA, safe-area insets, keyboard-friendly
- [ ] Create `apps/tma/src/components/shared/app-shell.tsx` with safe-area container and Telegram theme base colors
- [ ] Create `apps/tma/src/components/shared/loading-fallback.tsx` with a minimal loading spinner
- [ ] Create `apps/tma/src/index.css` with Telegram CSS vars as base, safe-area reset, no raw `100vh`
- [ ] Create `apps/tma/.env.example` with `VITE_WORKER_URL=http://localhost:8787`
- [ ] Update `package.json` with `dev:tma` (pnpm --filter tma dev) and `build:tma` (pnpm --filter tma build)
- [ ] Update `init.sh`: add tma lint/typecheck/test/build cases to `run_parallel_checks`, add to all runner functions
- [ ] Check `apps/worker/src/lib/cors.ts` or equivalent — verify `localhost:5174` is in the CORS allowlist before running auth smoke
- [ ] Search TMA src for `from 'apps/web'` to confirm no cross-imports
- [ ] Run `./init.sh install && ./init.sh lint && ./init.sh typecheck && ./init.sh test && ./init.sh build`
- [ ] Run `pnpm --filter tma dev` and confirm Vite starts on port 5174
- [ ] Update `harness/features/feat-079.json` with status done and evidence
- [ ] Update `harness/feature_index.json` with feat-079 status done
- [ ] Log progress in `harness/progress.md`

## Surprises & Discoveries

- `pnpm-workspace.yaml` already includes `apps/*`, so `apps/tma` auto-joins without changing workspace registration.
- `init.sh`'s `run_parallel_checks` has a hardcoded case statement for job names — adding TMA requires editing the case block (lines ~140-155) to add `"tma lint"`, `"tma typecheck"`, `"tma test"`, `"tma build"` entries, and each runner function (`run_lint`, `run_typecheck`, `run_test`, `run_build`, `run_full`) must include the TMA jobs in their calls to `run_parallel_checks`.
- Web uses `jsx: "preserve"` (Next.js handles JSX) but Vite needs `jsx: "react-jsx"` — tsconfig cannot be copied directly.
- Web ESLint uses `@next/eslint-plugin-next` which is Next.js-specific — must be removed for TMA.
- `@tma.js/sdk-react` exports `<SDKProvider>` that must wrap the entire component tree; without it, all SDK hooks throw.
- TMA i18n must NOT use `i18next-browser-languagedetector` — Telegram WebView locale comes from `initData.user.language_code`, not the browser.
- CORS allowlist in worker (`apps/worker/src/lib/cors.ts` or equivalent) currently covers `localhost:3000` for web dev; TMA dev port 5174 must be verified in the allowlist before running auth tests.
- Vite default port is 5173; explicitly set 5174 to avoid conflict when running web (3000), worker (8787), and TMA simultaneously.
- `BottomButton` in docs references `BottomButton` but `@tma.js/sdk-react` exports the component as `MainButton` — the SDK still calls it `MainButton` in the object API; the component wrapper can be named `BottomButton` for clarity.

## Decision Log

- Decision: use `@tma.js/sdk-react` as the primary TMA app dependency; add lower-level `@tma.js/*` packages only where they are actually needed.
  Rationale: current Telegram Mini Apps docs position `@tma.js/sdk-react` as the React package and state that it fully re-exports `@tma.js/sdk`, so one React-facing package is enough for the scaffold by default.
  Date/Author: 2026-06-02 / Codex

- Decision: keep scaffold auth session state non-persistent until feat-080 lands.
  Rationale: the secure TMA fallback policy is memory-only without `SecureStorage`; the scaffold should not normalize an unsafe token-storage shortcut.
  Date/Author: 2026-06-02 / Codex

- Decision: bot runtime stays out of scaffold scope; docs default later work to a worker-first adapter boundary.
  Rationale: feat-079 is a client bootstrap slice, not a bot runtime slice.
  Date/Author: 2026-06-02 / Codex

- Decision: use `jsx: "react-jsx"` in TMA tsconfig instead of web's `jsx: "preserve"`.
  Rationale: Vite compiles JSX directly and requires `react-jsx` transform; `preserve` is for Next.js which handles JSX server-side.
  Date/Author: 2026-06-02 / Codex

- Decision: TMA dev uses port 5174 (not default 5173) to avoid port conflicts with web (3000) and worker (8787).
  Rationale: users may run all three dev servers simultaneously; explicit port assignment prevents accidental port collision.
  Date/Author: 2026-06-02 / Codex

- Decision: TMA uses `VITE_*` for env vars, not `NEXT_PUBLIC_*`.
  Rationale: TMA is a Vite SPA, not Next.js; the standard Vite prefix is `VITE_` and is embedded at build time.
  Date/Author: 2026-06-02 / Codex

- Decision: TMA i18n reads locale from Telegram `initData.user.language_code` instead of browser detector.
  Rationale: Telegram WebView does not expose standard browser locale APIs reliably; Telegram passes the user's language preference in `initData`.
  Date/Author: 2026-06-02 / Codex

- Decision: TMA does not use `i18next-browser-languagedetector` or `i18next-http-backend`.
  Rationale: locale source is Telegram initData, not browser; static JSON files are bundled, not fetched at runtime.
  Date/Author: 2026-06-02 / Codex

## Outcomes & Retrospective

This plan is active. Final outcomes are recorded here when feat-079 is implemented. The success bar is a bootable, linted, typed `apps/tma` shell with repo-tooling integration, no cross-imports from web, and no accidental auth/domain coupling.

## Context and Orientation

- Repo toolchain entry: `package.json`
- Repo verification and sync orchestration: `init.sh`
- `run_parallel_checks` case statement lives in `init.sh` around lines 140–155 — edit this to add TMA jobs
- Existing browser client baseline: `apps/web/package.json`, `apps/web/tsconfig.json`, `apps/web/eslint.config.mjs`
- Existing worker API baseline: `apps/worker/src/*`
- Worker CORS allowlist: `apps/worker/src/lib/cors.ts` or `apps/worker/src/index.ts`
- TMA platform router: `docs/TMA.md`
- Durable TMA architecture: `docs/design-docs/telegram-mini-app-client-architecture.md`
- TMA implementation rules: `docs/references/tma/*.md`

## Required standards/reference docs

- `docs/TMA.md`
- `docs/design-docs/telegram-mini-app-client-architecture.md`
- `docs/references/tma/app-structure-and-client-rules.md`
- `docs/references/tma/native-ui-and-navigation-pattern.md`
- `docs/references/tma/development-and-hardening-pattern.md`
- `docs/references/tma/state-and-storage-pattern.md`
- `docs/references/tma/auth-and-bot-pattern.md`
- `docs/references/frontend/project-folder-structure.md`
- `docs/references/frontend/component-structure-pattern.md`
- `docs/references/frontend/naming-and-conventions-pattern.md`
- `docs/references/frontend/zustand-store-pattern.md`
- `docs/references/frontend/i18n-label-pattern.md`

## Plan of Work (Narrative)

### Step 1 — Workspace and package config

Create `apps/tma/` directory with:

- `package.json`: name `tma`, type `module`, scripts `dev` / `build` / `lint` / `typecheck` / `test`. Dependencies: `@tma.js/sdk-react`, `@tanstack/react-query`, `react`, `react-dom`, `react-router-dom`, `zustand`, `i18next`, `react-i18next`, `zod`, `framer-motion`. DevDeps: `vite`, `@vitejs/plugin-react`, `typescript`, `@types/react`, `@types/react-dom`, `eslint`, `typescript-eslint`, `vitest`, `jsdom`.

- `tsconfig.json`: `jsx: "react-jsx"` (Vite compile target), `target: "ES2022"`, `lib: ["DOM", "DOM.Iterable", "ES2022"]`, `moduleResolution: "bundler"`, `strict: true`, `paths: { "@/*": ["./src/*"] }`. Do NOT include `plugins: [{ "name": "next" }]` — that is Next.js only.

- `vite.config.ts`: `@vitejs/plugin-react` plugin, path alias `@/*` → `resolve(__dirname, 'src')`, `server.port: 5174`, `server.host: '127.0.0.1'` (local only, no remote exposure). Build target `modules` (modern browsers, fine for Telegram WebView).

- `eslint.config.mjs`: adapted from `apps/web/eslint.config.mjs`. Remove `nextPlugin` and `eslint-plugin-next`. Keep: `typescript-eslint`, `react`, `react-hooks`, `simple-import-sort`, `unicorn`, `unused-imports`, `prettier`. Keep `unicorn/filename-case: ['error', { case: 'kebabCase' }]`.

- `vitest.config.ts`: `environment: 'jsdom'`, path alias `@/*` → `./src/*`, `globals: false` (repo convention), no globals import.

- `index.html`: `<!DOCTYPE html>`, `<meta charset="UTF-8">`, `<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, user-scalable=no">`, `<meta name="theme-color" content="#ffffff">`, `<div id="root"></div>`, `<script type="module" src="/src/main.tsx"></script>`.

- `.env.example`: `VITE_WORKER_URL=http://localhost:8787`.

### Step 2 — App entry and provider tree

- `src/main.tsx`: import `ReactDOM.createRoot`, render `<App />` into `#root`. No auth call here — scaffold only.

- `src/app/bootstrap/app-providers.tsx`: The root provider composition:
  ```tsx
  <SDKProvider debug={import.meta.env.DEV}>
    <QueryClientProvider client={queryClient}>
      <AppThemeProvider>
        {children}
      </AppThemeProvider>
    </QueryClientProvider>
  </SDKProvider>
  ```
  `AppThemeProvider` reads Telegram theme and sets CSS custom properties. `SDKProvider` must be the outermost — without it, all SDK hooks throw.

- `src/app/bootstrap/telegram-init.ts`: On mount, call `window.Telegram.WebApp.ready()` (for Telegram test environment), bind CSS vars: `document.documentElement.style.setProperty('--tg-theme-bg-color', Telegram.WebApp.backgroundColor)`, etc. Read `initData` for `language_code` and pass to i18n. No user field from `initData` is trusted as truth — raw string passed to worker for verification later.

### Step 3 — Telegram capability wrappers (`src/lib/telegram/`)

All wrappers must NOT call `window.Telegram.WebApp` directly in feature code — feature code calls the wrapper, wrapper calls the SDK.

- `capabilities.ts`: `export const isSupported = (capability: 'secureStorage' | 'deviceStorage' | 'hapticFeedback') => bridge.isSupported(capability)`. Wraps `bridge.isSupported` from `@tma.js/sdk`.

- `theme.ts`: `export const bindTheme = () => { const { themeParams, backgroundColor, ... } = window.Telegram.WebApp; setCssVars(themeParams); }`. Also export `getBaseBackgroundColor()` for flash prevention before hydration. Set a neutral base color on `<body>` as CSS fallback.

- `launch-params.ts`: `export const readRawInitData = (): string | null => { try { return window.Telegram.WebApp.initData } catch { return null } }`. Do not parse or trust any user fields from this in the scaffold — raw string passed to worker in feat-080.

- `back-button.ts`: `export const showBackButton = (onClick: () => void) => { Telegram.WebApp.BackButton.show(); const handler = () => { onClick(); }; Telegram.WebApp.BackButton.onClick(handler); return () => Telegram.WebApp.BackButton.offClick(handler); }`. Cleanup returned on unmount. `export const hideBackButton = () => Telegram.WebApp.BackButton.hide()`.

- `bottom-button.ts`: `export const setBottomButton = (options: { text: string; enabled: boolean; showProgress: boolean; onClick: () => void }) => { const btn = Telegram.WebApp.MainButton; btn.setText(options.text); btn.setParams({ is_active: options.enabled, is_loader: options.showProgress }); btn.onClick(options.onClick); btn.show(); return () => btn.hide(); }`. Note: SDK object is `MainButton`, not `BottomButton` — component can be named `BottomButton` in the wrapper for clarity.

- `haptics.ts`: `export const impact = (style: 'light' | 'medium' | 'heavy' = 'medium') => Telegram.WebApp.HapticFeedback.impactOccurred(style)`. `export const notification = (type: 'success' | 'warning' | 'error') => Telegram.WebApp.HapticFeedback.notificationOccurred(type)`. `export const selection = () => Telegram.WebApp.HapticFeedback.selectionChanged()`.

- `safe-area.ts`: `export const getSafeAreaInsets = () => ({ top: Telegram.WebApp.safeAreaTop, bottom: Telegram.WebApp.safeAreaBottom, left: Telegram.WebApp.safeAreaLeft, right: Telegram.WebApp.safeAreaRight })`. `export const getContentSafeAreaInsets = () => ({ top: Telegram.WebApp.contentSafeAreaTop, ... })`.

### Step 4 — Query and i18n seams

- `src/lib/query/query-client.ts`: `new QueryClient({ defaultOptions: { queries: { staleTime: 5 * 60 * 1000, retry: 1 } } })`. Export singleton.

- `src/lib/i18n/index.ts`: `i18next.createInstance()`. Use `vi` as fallback locale. On init, if `initData` is available from Telegram, read `initDataUnsafe.user.language_code` and set i18n locale to that (only if it's `vi` or `en`, otherwise fall back to `vi`). Static JSON bundles in `src/lib/i18n/locales/`. Do NOT use `i18next-browser-languagedetector`.

### Step 5 — Router and routes

- `src/app/router/app-router.tsx`: React Router routes. Route `/` renders `<HomePage />`. Route `/fatal` renders `<FatalLaunchPage />`. Home page is a placeholder with Telegram-themed styling and a "Coming soon" message.

- `src/routes/home.tsx`: Simple placeholder with `<AppShell>` wrapper, Telegram theme colors, text "TMA Scaffold — auth and domain features land in feat-080+".

- `src/routes/fatal-launch.tsx`: Full-screen fatal error with safe-area insets, localized heading "Launch failed" / "Mở lại từ Telegram", body copy, and a button that calls `Telegram.WebApp.close()` to close the mini app. No retry logic — reopen from Telegram is the recovery path.

### Step 6 — Shared UI and CSS

- `src/components/shared/app-shell.tsx`: `div` with `padding-top: env(safe-area-inset-top)`, `padding-bottom: env(safe-area-inset-bottom)`, `min-height: 100dvh`, Telegram background color as CSS var fallback. Renders children.

- `src/components/shared/loading-fallback.tsx`: Centered spinner with `opacity: 0.5` in Telegram theme color.

- `src/index.css`: Import a reset. Set Telegram CSS vars as fallback on `:root` before the app hydrates. No `height: 100vh` on `body` — use `100dvh` for stable viewport. Import Google Fonts for the font (if any — TMA uses system fonts by default per design doc).

### Step 7 — init.sh integration (CRITICAL)

Edit `init.sh` — not just "update", but precise changes:

In `run_parallel_checks`, the `case` block at lines ~140–155 handles job names. Add:

```bash
"tma lint") start_background_job "$label" "$log_file" "$status_file" pnpm --filter tma lint ;;
"tma typecheck") start_background_job "$label" "$log_file" "$status_file" pnpm --filter tma typecheck ;;
"tma test") start_background_job "$label" "$log_file" "$status_file" pnpm --filter tma exec vitest run ;;
"tma build") start_background_job "$label" "$log_file" "$status_file" pnpm --filter tma build ;;
```

Then in each runner function, add the TMA job:

- `run_lint`: add `"tma lint"` to the parallel call
- `run_typecheck`: add `"tma typecheck"`
- `run_test`: add `"tma test"`
- `run_build`: add `"tma build"`
- `run_full`: update all four

Also add to `package.json` root:
```json
"dev:tma": "pnpm --filter tma dev",
"build:tma": "pnpm --filter tma build"
```

### Step 8 — CORS verification and cross-import check

Before running auth-related smoke tests, verify `apps/worker/src/index.ts` or `apps/worker/src/lib/cors.ts` includes `localhost:5174` in the CORS allowlist. If not, add it (same pattern as the existing `localhost:3000` entry from feat-039/076).

Run: `rg "localhost:5174" apps/worker/src/` to check.

After scaffold files exist, run: `rg "from 'apps/web'" apps/tma/src/` to confirm zero cross-imports.

### Step 9 — Verification and harness

Run the targeted verification chain, then update harness records. See Concrete Steps below.

## Concrete Steps (Commands)

Run from repo root unless noted.

```bash
# Create workspace
mkdir -p apps/tma/src/{app/{bootstrap,router},lib/{telegram,query,i18n/locales},routes,components/shared}
mkdir -p apps/tma

# All scaffold files created manually or via scaffolding
# Then:

./init.sh install

# Expected: workspace resolution completes, no errors
```

```bash
# Verify dev server
pnpm --filter tma dev

# Expected: "VITE v6.x.x ready in Xms" + "Local: http://127.0.0.1:5174/"
```

```bash
./init.sh lint

# Expected: "OK" (or fixable lint errors, fix then re-run)
```

```bash
./init.sh typecheck

# Expected: "OK"
```

```bash
./init.sh test

# Expected: "OK" (no tests yet, but should pass with 0 failures)
```

```bash
./init.sh build

# Expected: "OK"
```

```bash
./init.sh

# Expected: "Done!"
```

```bash
# Cross-import check
rg "from 'apps/web'" apps/tma/src/ || echo "Clean: no web cross-imports"

# CORS check
rg "localhost:5174" apps/worker/src/ || echo "Warning: TMA dev port not in CORS allowlist — add before auth smoke"
```

## Validation and Acceptance

Happy path:

- `pnpm --filter tma dev` starts on `localhost:5174` and the app renders the home placeholder without crashing.
- `init.sh` lint/typecheck/test/build all finish with "OK" including the TMA job.
- Telegram bootstrap wrappers do not throw when capability support is absent; unsupported capability handling returns safe no-op from wrappers.
- `<SDKProvider>` is the outermost wrapper; `useLaunchParams()` and `useBackButton()` hooks work when called inside the provider tree.
- Theme CSS vars are set from Telegram on mount; no first-paint flash with a neutral base color on `body`.

Failure-path validation:

- Opening the TMA without Telegram launch context shows the fatal launch screen instead of a blank/white page or a crash.
- `isSupported('secureStorage')` returns `false` in a test harness that mocks no storage support; the wrapper still returns `false` safely.
- In a browser without Telegram SDK (e.g., regular Chrome), `window.Telegram` is undefined; the `launch-params.ts` wrapper returns `null` and the fatal screen renders.

Regression checks:

- `apps/web` and `apps/worker` verification still pass after root script integration.
- `rg "from 'apps/web'" apps/tma/src/` returns zero matches.

## Idempotence & Recovery

- Re-running scaffold file creation is safe with the same structure.
- init.sh changes are reversible by editing only `init.sh` and `package.json`; no database or external-state migration.
- If the scaffold path proves wrong, recovery is: `rm -rf apps/tma`, then revert `init.sh`, `package.json`, and the harness files in one patch.
- If CORS is missing, add `localhost:5174` to the worker CORS allowlist — no other changes needed.

## Known Risks

- `@tma.js/sdk-react` version pin: SDK package churn is high. Pin to a specific minor version (e.g., `"^2.x"`) and record the pinned version in the plan. Check `@tma.js/sdk-react` releases before implementing to pick a stable version.
- TMA dev environment requires HTTPS or Telegram test environment. If users only have HTTP local dev, they must use the Telegram test environment or a tunnel. Document this in `.env.example` and the dev-readiness section.
- Cloudflare Workers `crypto.subtle` is available but requires correct algorithm names (`SHA-256`, not `sha-256`). SDK init data verification in feat-080 will need careful constant-time comparison.
- Vite `server.port` may conflict with other tools if 5174 is taken; document that users can override with `VITE_PORT=XXXX`.

## Artifacts and Notes

- Acceptance artifact: `apps/tma` directory with all files listed above, committed.
- Acceptance artifact: `./init.sh` output showing TMA in lint/typecheck/test/build passes.
- Acceptance artifact: `pnpm --filter tma dev` output showing `localhost:5174`.
- Acceptance artifact: `rg "from 'apps/web'" apps/tma/src/` confirming clean separation.
- Acceptance artifact: harness records updated, progress log entry written.

## Interfaces & Dependencies

- `@tma.js/sdk-react`: primary React-facing Telegram Mini Apps package. Exports `<SDKProvider>`, `useLaunchParams()`, `useBackButton()`, `useMainButton()`, `useThemeParams()`. Version: pin to `^2.x` (check releases for latest stable).
- `@tma.js/bridge`: lower-level `bridge.isSupported()` for capability checks.
- `react-router-dom`: SPA history via `createBrowserRouter`, route shells via `RouterProvider`.
- `@tanstack/react-query`: `QueryClient`, `QueryClientProvider`. Default staleTime 5min, retry 1.
- `zustand`: available for flow state in later slices; scaffold keeps stores minimal.
- `i18next` + `react-i18next`: locale source is Telegram initData, NOT browser. Static JSON bundles.
- `framer-motion`: available for shell transitions later; scaffold keeps motion minimal.
- `zod`: available for client-side request validation in later slices.
- `vite`: build tool with `@vitejs/plugin-react` for JSX transform.
- Vite env vars use `VITE_*` prefix (different from Next.js `NEXT_PUBLIC_*`).